import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  title?: string;
  onBack?: () => void;
}

const CSHeader: React.FC<Props> = ({ title = "", onBack }) => {
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onBack) return onBack();
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🔥 Degradado superior sutil para integración lava */}
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.85)",
          "rgba(50,0,0,0.35)",
          "transparent",
        ]}
        style={styles.gradient}
      />

      <View style={styles.headerContainer}>
        {/* 🔙 Botón volver */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={26} color="#ffbfa4" />
        </TouchableOpacity>

        {/* 📝 Título centrado */}
        <Text style={styles.title}>{title}</Text>

        {/* Placeholder invisible para balancear layout */}
        <View style={{ width: 34 }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
    zIndex: 50,
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: 120,
    top: 0,
    left: 0,
    right: 0,
  },
  headerContainer: {
    width: "100%",
    paddingHorizontal: 10,
    paddingBottom: 12,
    paddingTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
    paddingLeft: 0,
  },
  title: {
    color: "#ffe0b2",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "#ff3d00",
    textShadowRadius: 6,
    flex: 1,
  },
});

export default CSHeader;
