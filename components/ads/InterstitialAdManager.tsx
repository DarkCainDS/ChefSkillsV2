import React, { memo, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Index";
import { useAdTimer } from "../hooks/useAdTimer";
import { AdUnitIds } from "../../services/adsConfig";
import { useInterstitialAd } from "react-native-google-mobile-ads";

/**
 * Primer interstitial: SIEMPRE a los 60s (aunque cargue antes)
 * Luego: cada 5 minutos.
 */
const InterstitialAdManager: React.FC = memo(() => {
  const { isPremium } = useSelector((state: RootState) => state.user);
  const adsRemoved =
    useSelector((state: RootState) => state.subscription?.adsRemoved) || false;

  const appState = useRef<AppStateStatus>(AppState.currentState);

  const [delayDone, setDelayDone] = useState(false);      // compuerta 1 (60s)
  const [firstShown, setFirstShown] = useState(false);    // ya mostramos el 1°?
  const [enableRecurrent, setEnableRecurrent] = useState(false); // activar cada 5 min

  const { isLoaded, isClosed, load, show } = useInterstitialAd(
    AdUnitIds.interstitial,
    { requestNonPersonalizedAdsOnly: true }
  );

  // 📱 estado de la app
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      appState.current = next;
      if (__DEV__) console.log("📱 Estado de la app:", next);
    });
    return () => sub.remove();
  }, []);

  // ⚙️ Cargar al inicio
  useEffect(() => {
    if (!adsRemoved && !isPremium) {
      if (__DEV__) console.log("📲 Cargando interstitial inicial...");
      load();
    }
  }, [adsRemoved, isPremium, load]);

  // 🔁 Si se cierra, volvemos a cargar
  useEffect(() => {
    if (isClosed && !adsRemoved && !isPremium) {
      if (__DEV__) console.log("🔁 Interstitial cerrado, recargando...");
      load();
    }
  }, [isClosed, adsRemoved, isPremium, load]);

  // ⏳ Compuerta 1: esperar SIEMPRE 60s antes del 1° anuncio
  useEffect(() => {
    if (adsRemoved || isPremium || firstShown) return;
    setDelayDone(false);
    if (__DEV__) console.log("⏳ Esperando primer interstitial (mínimo 60 s)...");
    const t = setTimeout(() => setDelayDone(true), 60000);
    return () => clearTimeout(t);
  }, [adsRemoved, isPremium, firstShown]);

  // 🚀 Mostrar primer interstitial SOLO cuando:
  // - delayDone === true
  // - isLoaded === true
  // - appState === "active"
  // - aún no se ha mostrado
  useEffect(() => {
    if (adsRemoved || isPremium) return;
    if (!delayDone) return;
    if (firstShown) return;

    if (!isLoaded) {
      // Si ya pasaron los 60s pero aún no carga, nos aseguramos de pedir carga
      load();
      return;
    }

    if (appState.current !== "active") return;

    try {
      if (__DEV__) console.log("📢 Mostrando primer interstitial (tras 60 s)");
      show();
      setFirstShown(true);
      setEnableRecurrent(true); // ahora sí activamos los de cada 5 min
    } catch (err) {
      console.log("⚠️ Error al mostrar primer interstitial:", err);
      load();
    }
  }, [delayDone, isLoaded, isPremium, adsRemoved, firstShown, load, show]);

  // ⏱️ Recurrente cada 5 min (solo después del 1°)
  useAdTimer(() => {
    if (!enableRecurrent || adsRemoved || isPremium) return;
    if (appState.current !== "active") return;

    if (isLoaded) {
      try {
        if (__DEV__) console.log("📢 Mostrando interstitial recurrente (cada 5 min)");
        show();
      } catch (err) {
        console.log("⚠️ Error al mostrar interstitial recurrente:", err);
        load();
      }
    } else {
      if (__DEV__) console.log("⚙️ Interstitial no listo, recargando...");
      load();
    }
  }, enableRecurrent, 5 * 60 * 1000);

  // 🛡️ Premium: no renderiza nada
  if (isPremium) return null;

  return null;
});

export default InterstitialAdManager;
