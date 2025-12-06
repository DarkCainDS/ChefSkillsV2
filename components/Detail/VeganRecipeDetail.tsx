// screens/VeganRecipeDetail.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import React, { useState, useRef } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Animated,
} from "react-native";

import BouncyCheckbox from "react-native-bouncy-checkbox";
import LinearGradient from "react-native-linear-gradient";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";

import CategoryHeader from "../UI/CSHeader_ModernPro";
import { getSafeImage } from "../../utils/getImageSource";
import { useFavoriteToggle } from "../hooks/useFavoriteToggle";

import type { Recipe } from "../../store/Slices/FavoriteSlice";

// NAV TYPES
type RootStackParamList = {
  VeganRecipeDetail: { recipe: Recipe };
};

export default function VeganRecipeDetail() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "VeganRecipeDetail">>();
  const recipe = route.params?.recipe;

  const [fontLoaded] = useFonts({
    MateSC: require("../../assets/fonts/MateSC-Regular.ttf"),
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [buttonText, setButtonText] = useState<string>("x1");
  const [tipsVisible, setTipsVisible] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // FAVORITOS
  const { isFavorite, toggleFavorite, heartAnim } = useFavoriteToggle(
    recipe ?? null
  );

  const modifyQuantity = (quantity: string, multiplier: number) =>
    quantity.replace(/-?\d+(\.\d+)?/g, (match) =>
      String(parseFloat(match) * multiplier)
    );

  const handleButtonPress = () => {
    const states = [
      { multiplier: 1, text: "x1" },
      { multiplier: 2, text: "x2" },
      { multiplier: 3, text: "x3" },
      { multiplier: 4, text: "x4" },
      { multiplier: 0.5, text: "1/2" },
    ];
    const idx = states.findIndex((s) => s.multiplier === multiplier);
    const next = states[(idx + 1) % states.length];
    setMultiplier(next.multiplier);
    setButtonText(next.text);
  };

  const getButtonColor = (m: number) => {
    switch (m) {
      case 1: return "#6B7280";
      case 2: return "#7C3AED";  // púrpura fuerte
      case 3: return "#A855F7";
      case 4: return "#C084FC";
      case 0.5: return "#E9D5FF";
      default: return "#7C3AED";
    }
  };

  // MISMA PALETA UNIVERSAL
  const tipColors = [
    "#FFF9C4",
    "#C8E6C9",
    "#BBDEFB",
    "#FFCCBC",
    "#E1BEE7",
    "#F8BBD0",
    "#D7CCC8",
  ];

  const openTipsModal = () => {
    setTipsVisible(true);
    fadeAnim.setValue(0);
    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  };

  const closeTipsModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setTipsVisible(false));
  };

  if (!fontLoaded || !recipe) {
    return (
      <View style={styles.loader}>
        <Text>Cargando receta...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#F3E8FF", "#E5CCFF", "#D0A2FF"]}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1, padding: 15 }}>

        <CategoryHeader
          title="Vegano"
          icon="🥑"
          color="#8A56CC"
          titleColor="#F8F3FF"
          onBack={() => navigation.goBack()}
        />

        {/* TITLE + HEART */}
        <View style={styles.headerContainer}>
          <Text style={styles.recipeTitle}>{recipe.name}</Text>

          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteIcon}>
            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
              <MaterialIcons
                name={isFavorite ? "favorite" : "favorite-border"}
                size={48}
                color={isFavorite ? "#8A56CC" : "black"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* IMAGES */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageContainer}
        >
          {recipe.images?.map((path, idx) => (
            <TouchableOpacity key={idx} onPress={() => setSelectedImage(path)}>
              <Image
                source={getSafeImage(path)}
                style={styles.image}
                contentFit="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* IMAGE MODAL */}
        <Modal visible={!!selectedImage} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setSelectedImage(null)}>
            <View style={styles.modalBackground}>
              {selectedImage && (
                <Image
                  source={getSafeImage(selectedImage)}
                  style={styles.modalImageLarge}
                  contentFit="contain"
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* INGREDIENTES */}
        <View style={styles.rowHeader}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>

          <TouchableOpacity
            style={[
              styles.multiplicarButton,
              { backgroundColor: getButtonColor(multiplier) },
            ]}
            onPress={handleButtonPress}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>

        {/* TABLE */}
        <View style={styles.ingredientsContainer}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[styles.tableCellName, styles.tableHeader]}>
              Ingrediente
            </Text>
            <Text style={[styles.tableCellQuantity, styles.tableHeader]}>
              Cantidad
            </Text>
            <Text style={[styles.tableCellCheckbox, styles.tableHeader]}>✔</Text>
          </View>

          {recipe.ingredients?.map((ing, idx) => (
            <View
              key={idx}
              style={[
                styles.tableRow,
                idx % 2 === 0 && styles.tableRowAlt,
              ]}
            >
              <Text style={styles.tableCellName}>{ing.name}</Text>
              <Text style={styles.tableCellQuantity}>
                {modifyQuantity(ing.quantity, multiplier)}
              </Text>
              <View style={styles.tableCellCheckbox}>
                <BouncyCheckbox
                  size={20}
                  fillColor="#8A56CC"
                  unFillColor="#fff"
                  disableBuiltInState
                />
              </View>
            </View>
          ))}
        </View>

        {/* TIPS */}
        {recipe.tips?.length > 0 && (
          <TouchableOpacity style={styles.tipsButton} onPress={openTipsModal}>
            <MaterialIcons name="lightbulb" size={28} color="white" />
            <Text style={styles.tipsButtonText}>Tips</Text>
          </TouchableOpacity>
        )}

        {/* PASOS */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Pasos</Text>

        <View style={styles.stepsContainer}>
          {recipe.steps?.map((step, idx) => (
            <View key={idx} style={styles.stepItem}>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepNumber}>Paso {idx + 1}</Text>
                <Text style={styles.stepDescription}>{step.step}</Text>
              </View>

              <View style={styles.checkboxContainer}>
                <BouncyCheckbox
                  size={24}
                  fillColor="#8A56CC"
                  unFillColor="#fff"
                  disableBuiltInState
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* MODAL TIPS FIXED */}
      <Modal
        visible={tipsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeTipsModal}
      >
        <View style={styles.tipsModalOverlay} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={closeTipsModal}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.tipsModal,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
            ]}
            pointerEvents="box-none"
          >
            <Text style={styles.tipsTitle}>💡 Consejos útiles</Text>

            <ScrollView
              style={{ maxHeight: "70%" }}
              showsVerticalScrollIndicator={false}
            >
              {recipe.tips?.map((tip, idx) => (
                <LinearGradient
                  key={idx}
                  colors={[
                    tipColors[idx % tipColors.length] + "FF",
                    tipColors[idx % tipColors.length] + "CC",
                  ]}
                  style={styles.tipCard}
                >
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDescription}>{tip.description}</Text>
                </LinearGradient>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeTipsButton}
              onPress={closeTipsModal}
            >
              <Text style={styles.closeTipsText}>Cerrar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// === STYLES VEGAN (PÚRPURA PREMIUM) ===
const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  recipeTitle: {
    fontFamily: "MateSC",
    fontSize: 32,
    textAlign: "center",
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: "#8A56CC",
    color: "#2B1F39",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  favoriteIcon: { marginLeft: 10 },

  imageContainer: { flexDirection: "row", marginBottom: 20 },

  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginHorizontal: 10,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalImageLarge: {
    width: "90%",
    height: "70%",
    borderRadius: 12,
  },

  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "italic",
    flex: 1,
    borderBottomWidth: 3,
    paddingBottom: 4,
    borderBottomColor: "#8A56CC",
    color: "#2B1F39",
  },

  multiplicarButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 20,
  },

  ingredientsContainer: {
    backgroundColor: "#FAF5FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C5B3E6",
    overflow: "hidden",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E1D8F6",
  },

  tableHeaderRow: {
    backgroundColor: "#E9D5FF",
  },

  tableRowAlt: {
    backgroundColor: "rgba(233, 213, 255, 0.7)",
  },

  tableCellName: {
    flex: 1.2,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#2B1F39",
  },

  tableCellQuantity: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    fontSize: 14,
    color: "#2B1F39",
  },

  tableCellCheckbox: {
    flex: 0.45,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },

  tableHeader: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#2B1F39",
  },

  stepsContainer: {
    marginBottom: 80,
    marginTop: 10,
  },

  stepItem: {
    flexDirection: "row",
    backgroundColor: "#FAF5FF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D9C6F6",
  },

  stepTextContainer: { flex: 0.85 },

  stepNumber: {
    fontWeight: "bold",
    fontSize: 16,
    textDecorationLine: "underline",
    marginBottom: 4,
    color: "#2B1F39",
  },

  stepDescription: {
    fontSize: 15,
    color: "#3B2B4F",
    lineHeight: 21,
  },

  checkboxContainer: {
    flex: 0.15,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  tipsButton: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#8A56CC",
    paddingVertical: 12,
    borderRadius: 30,
    width: "60%",
    alignSelf: "center",
    marginVertical: 35,
  },

  tipsButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 18,
  },

  tipsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  tipsModal: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    width: "85%",
    maxHeight: "70%",
  },

  tipsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#2B1F39",
  },

  tipCard: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },

  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#2B1F39",
    marginBottom: 5,
  },

  tipDescription: {
    fontSize: 14,
    color: "#2B1F39",
    lineHeight: 20,
  },

  closeTipsButton: {
    backgroundColor: "#8A56CC",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: "center",
    width: "40%",
  },

  closeTipsText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
