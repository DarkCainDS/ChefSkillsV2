// CSHeader_ModernPro.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  title: string;
  icon?: string;
  color: string;        
  titleColor?: string;   // ← color del texto modular
  onBack: () => void;
}

export default function CSHeader_ModernPro({
  title,
  icon = "🍽️",
  color = "#FFFFFF",
  titleColor = "#fff",  // ← DEFAULT EXACTO AL ORIGINAL
  onBack,
}: Props) {
  return (
    <LinearGradient
      colors={[color, "#000000"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.row}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={styles.center}>
          <Text style={styles.icon}>{icon}</Text>

          {/* Aplica titleColor o blanco por defecto */}
          <Text style={[styles.title, { color: titleColor }]}>
            {title}
          </Text>
        </View>

        <View style={{ width: 30 }} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginBottom: 20,
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    padding: 6,
  },
  center: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  icon: {
    fontSize: 30,
  },
  title: {
    fontSize: 30,
    fontFamily: "MateSC",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 5,
  },
});
