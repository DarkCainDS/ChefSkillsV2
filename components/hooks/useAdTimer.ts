// hooks/useAdTimer.ts
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Index";

/**
 * Intervalo para interstitials recurrentes:
 * - Se activa solo cuando `enabled` es true (después del primer anuncio)
 * - Corre cada 5 minutos
 * - Se detiene si el usuario es Premium
 */
export const useAdTimer = (callback: () => void, enabled: boolean) => {
  const savedCb = useRef(callback);
  const user = useSelector((state: RootState) => state.user);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    savedCb.current = callback;
  }, [callback]);

  useEffect(() => {
    // cortar si premium o si aún no está habilitado (hasta que se muestre el primero)
    if (user?.isPremium || !enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // arrancar intervalo de 5 min
    if (!timerRef.current) {
      console.log("⏱️ AdTimer recurrente activado (cada 5 min)");
      timerRef.current = setInterval(() => {
        console.log("📢 Mostrando interstitial recurrente (cada 5 min)");
        savedCb.current();
      }, 5 * 60 * 1000);
    }

    return () => {
      if (timerRef.current) {
        console.log("🧹 Limpiando AdTimer…");
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [user?.isPremium, enabled]);
};
