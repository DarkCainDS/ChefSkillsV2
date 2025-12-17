import { getVersionedImageSync } from "../../utils/versionedImage";
// screens/PanaderiaRecipeDetail.tsx
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
import { getSafeVersionedImage } from "../../utils/imageSource";
import { useFavoriteToggle } from "../hooks/useFavoriteToggle";

import type { Recipe } from "../../store/Slices/FavoriteSlice";

// NAV TYPES
type RootStackParamList = {
  PanaderiaRecipeDetail: { recipe: Recipe };
};

export default function PanaderiaRecipeDetail() {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, "PanaderiaRecipeDetail">>();
  const recipe = route.params?.recipe as Recipe | undefined;

  const [fontLoaded] = useFonts({
    MateSC: require("../../assets/fonts/MateSC-Regular.ttf"),
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [buttonText, setButtonText] = useState<string>("x1");
  const [tipsVisible, setTipsVisible] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ❤️ Hook favorito
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

  // colores del botón multiplicador
  const getButtonColor = (m: number) => {
    switch (m) {
      case 1:
        return "#6B7280";
      case 2:
        return "#3B82F6";
      case 3:
        return "#22C55E";
      case 4:
        return "#EF4444";
      case 0.5:
        return "#FACC15";
      default:
        return "#3B82F6";
    }
  };

  // 🎨 MISMA PALETA DE TIPS QUE EL MAINDISH (varios fuertes)
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando receta...</Text>
      </View>
    );
  }
  const imageSources = getSafeVersionedImage(
    recipe.imageUrl,
    recipe.images
  );


  return (
    <LinearGradient
      colors={["#FAF1E6", "#F1D6B8", "#E4B98A"]}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1, padding: 15 }}>
        {/* HEADER */}
        <CategoryHeader
          title="Panadería"
          icon="🍞"
          color="#8B5A2B"
          titleColor="#FDF4E2"
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
                color={isFavorite ? "#C62828" : "black"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* IMAGES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {imageSources.map((src, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() =>
                typeof src === "object" && "uri" in src
                  ? setSelectedImage(src.uri)
                  : null
              }
            >
              <Image
                source={src}
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
                  source={getSafeVersionedImage(selectedImage)[0]}
                  style={styles.modalImageLarge}
                  contentFit="contain"
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* INGREDIENTES + MULTIPLIER */}
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

        {/* TABLA INGREDIENTES */}
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
                  fillColor="#8B5A2B"
                  unFillColor="#fff"
                  disableBuiltInState
                />
              </View>
            </View>
          ))}
        </View>

        {/* TIPS BUTTON */}
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
                  fillColor="#8B5A2B"
                  unFillColor="#fff"
                  disableBuiltInState
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* MODAL TIPS */}
      <Modal
        visible={tipsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeTipsModal}
      >
        <View style={styles.tipsModalOverlay} pointerEvents="box-none">

          {/* Cerrar al tocar FUERA del modal */}
          <TouchableWithoutFeedback onPress={closeTipsModal}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          {/* CONTENIDO DEL MODAL — NO ENVOLVER EN TOUCHABLE */}
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

// --- STYLES (COPIA EXACTA DEL MAINDISH + PALETA PANADERÍA) ---
const styles = StyleSheet.create({
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
    borderColor: "#8B5A2B",
    color: "#5A3B1F",
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  favoriteIcon: { marginLeft: 10 },

  imageContainer: { flexDirection: "row", marginBottom: 20 },

  image: {
    width: 150,
    height: 150,
    marginHorizontal: 10,
    borderRadius: 10,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
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
    alignItems: "center",
    justifyContent: "space-between",
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
    borderBottomColor: "#8B5A2B",
    color: "#5A3B1F",
  },

  multiplicarButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 20,
    padding: 5,
  },

  ingredientsContainer: {
    backgroundColor: "#FFFFFFEE",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D2B79A",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DEC7A9",
  },

  tableHeaderRow: {
    backgroundColor: "#F3E5C6",
  },

  tableRowAlt: {
    backgroundColor: "rgba(240,225,205,0.55)",
  },

  tableCellName: {
    flex: 1.2,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#4B3827",
  },

  tableCellQuantity: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    fontSize: 14,
    color: "#4B3827",
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
    color: "#5A3B1F",
  },

  stepsContainer: {
    marginBottom: 80,
    marginTop: 10,
  },

  stepItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFFEE",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D2B79A",
  },

  stepTextContainer: {
    flex: 0.85,
  },

  stepNumber: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 16,
    color: "#5A3B1F",
    textDecorationLine: "underline",
  },

  stepDescription: {
    fontSize: 15,
    color: "#4B3827",
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
    backgroundColor: "#C97B3B",
    paddingVertical: 12,
    borderRadius: 30,
    width: "60%",
    alignSelf: "center",
    marginVertical: 35,
    marginBottom: 20,
    elevation: 3,
  },

  tipsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 18,
  },

  tipsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
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
    marginBottom: 10,
    textAlign: "center",
    color: "#5A3B1F",
  },

  tipCard: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },

  tipTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#3C2A19",
    textDecorationLine: "underline",
    marginBottom: 5,
  },

  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#3A2A1F",
  },

  closeTipsButton: {
    backgroundColor: "#8B5A2B",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: "center",
    width: "40%",
  },

  closeTipsText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
