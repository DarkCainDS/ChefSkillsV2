// services/adsConfig.ts
import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

/**
 * Define los IDs de anuncios de AdMob.
 * Usa los de prueba en desarrollo para evitar bloqueos.
 */
export const AdUnitIds = {
  interstitial: __DEV__
    ? TestIds.INTERSTITIAL
    : Platform.select({
        android: "ca-app-pub-7628046159186275/2459588829", // ← reemplaza con tu ID real
        ios: "ca-app-pub-7628046159186275/yyyyyyyyyy",
      }),
};
