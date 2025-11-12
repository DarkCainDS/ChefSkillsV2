import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { checkSubscriptionStatus } from "../../services/subscriptionService";
import { AppDispatch, RootState } from "../../store/Index";

/**
 * 🕒 useDailyWatcher mejorado
 * - Evita ejecuciones dobles.
 * - Verifica la suscripción solo 1 vez cada 24 h.
 * - Detiene ejecución si el usuario es premium.
 */
export const useDailyWatcher = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { uid, isPremium } = useSelector((state: RootState) => state.user);
  const hasRun = useRef(false);

  useEffect(() => {
    const checkDaily = async () => {
      if (hasRun.current) return; // 🔒 evita doble ejecución
      if (!uid || isPremium) return; // no aplica para premium
      hasRun.current = true;

      try {
        const lastCheckStr = await AsyncStorage.getItem("lastWatcherCheck");
        const now = Date.now();
        const ONE_DAY = 24 * 60 * 60 * 1000;

        if (!lastCheckStr || now - new Date(lastCheckStr).getTime() > ONE_DAY) {
          console.log("🕓 Ejecutando Daily Watcher...");
          await checkSubscriptionStatus(uid, dispatch);
          await AsyncStorage.setItem("lastWatcherCheck", new Date().toISOString());
          console.log("✅ Verificación diaria completada.");
        } else {
          console.log("⏩ Watcher saltado: verificación reciente.");
        }
      } catch (err) {
        console.error("❌ Error en Daily Watcher:", err);
      }
    };

    checkDaily();

    // Limpieza de seguridad
    return () => {
      hasRun.current = false;
    };
  }, [uid, isPremium, dispatch]);
};
