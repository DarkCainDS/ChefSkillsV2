// components/ads/AdBanner.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Index";
import { AdUnitIds } from "../../services/adsConfig";

/**
 * Renderiza un banner fijo si el usuario no es premium.
 * Úsalo al final de cada pantalla (debajo del contenido).
 */
const AdBanner: React.FC = () => {
  const adsRemoved = useSelector((s: RootState) => s.subscription.adsRemoved);

  if (adsRemoved) return null;

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={AdUnitIds.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});

export default AdBanner;
