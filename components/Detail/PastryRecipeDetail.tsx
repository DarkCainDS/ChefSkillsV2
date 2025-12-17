import { getVersionedImageSync } from "../../utils/versionedImage";
// screens/PastryRecipeDetail.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import BouncyCheckbox from "react-native-bouncy-checkbox";
import LinearGradient from "react-native-linear-gradient";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";

import CategoryHeader from "../UI/CSHeader_ModernPro";
import { getSafeVersionedImage } from "../../utils/imageSource";
import { useFavoriteToggle } from "../hooks/useFavoriteToggle";

import type { Recipe } from "../../store/Slices/FavoriteSlice";

type RootStackParamList = {
  PastryRecipeDetail: { recipe: Recipe };
};

// Acordeón básico sin interpolaciones gigantes (anti-scroll infinito)
const SimpleAccordion = ({
  title,
  initiallyOpen = false,
  children,
}: {
  title: string;
  initiallyOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        <MaterialIcons
          name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={26}
          color="#7A2E55"
        />
      </TouchableOpacity>

      {open && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
};

export default function PastryRecipeDetail() {


  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "PastryRecipeDetail">>();
  const recipe = route.params?.recipe as Recipe | undefined;

  const [fontLoaded] = useFonts({
    MateSC: require("../../assets/fonts/MateSC-Regular.ttf"),
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [buttonText, setButtonText] = useState<string>("x1");
  const [tipsVisible, setTipsVisible] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ❤️ Favoritos
  const { isFavorite, toggleFavorite, heartAnim } = useFavoriteToggle(
    recipe ?? null
  );

  // 🔢 Multiplicador que detecta números dentro de strings
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
      case 2: return "#3B82F6";
      case 3: return "#22C55E";
      case 4: return "#EF4444";
      case 0.5: return "#FACC15";
      default: return "#3B82F6";
    }
  };

  // 🎨 Tip colors
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
      duration: 180,
      useNativeDriver: true,
    }).start(() => setTipsVisible(false));
  };

  if (!fontLoaded || !recipe) {
    return (
      <View style={styles.loading}>
        <Text>Cargando receta...</Text>
      </View>
    );
  }
  const imageSources = getSafeVersionedImage(
    recipe.imageUrl,
    recipe.images
  );




  return (
    <LinearGradient colors={["#FFE6EF", "#FFD4E3", "#F8C3D8"]} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 15, paddingBottom: 50 }}
      >

        {/* HEADER PRINCIPAL */}
        <CategoryHeader
          title="Pastelería"
          icon="🧁"
          color="#FF8EB8"
          titleColor="#FFFFFF"
          onBack={() => navigation.goBack()}
        />

        {/* NOMBRE + FAVORITO */}
        <View style={styles.headerContainer}>
          <Text style={styles.recipeTitle}>{recipe.name}</Text>

          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteIcon}>
            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
              <MaterialIcons
                name={isFavorite ? "favorite" : "favorite-border"}
                size={46}
                color={isFavorite ? "#FF2F81" : "#52263A"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* GALERÍA */}
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


        {/* MODAL IMAGEN */}
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


        {/* BOTÓN TIPS */}
        {recipe.tips && recipe.tips.length > 0 && (
          <TouchableOpacity style={styles.tipsButton} onPress={openTipsModal}>
            <MaterialIcons name="lightbulb" size={28} color="white" />
            <Text style={styles.tipsButtonText}>Tips</Text>
          </TouchableOpacity>
        )}

        {/* ⭐ MINI-HEADER PREMIUM COMPLETO — Preparaciones + Multiplicador + Glossy */}
        <View style={styles.miniHeaderWrapper}>
          <LinearGradient
            colors={["#6A1BFF", "#3A0F78", "#000000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.miniHeader}
          >
            {/* ICONO */}
            <MaterialIcons name="content-paste" size={24} color="#fff" />

            {/* TEXTO */}
            <Text style={styles.miniHeaderText}>Preparaciones</Text>

            {/* BOTÓN MULTIPLICADOR */}
            <TouchableOpacity
              style={[
                styles.multiplierMini,
                { backgroundColor: getButtonColor(multiplier) },
              ]}
              onPress={handleButtonPress}
            >
              <Text style={styles.multiplierMiniText}>{buttonText}</Text>
            </TouchableOpacity>


          </LinearGradient>
        </View>


        {/* SECCIONES */}
        {recipe.sections?.map((section: any, idx: number) => (
          <SimpleAccordion
            key={idx}
            title={section.title || `Sección ${idx + 1}`}
            initiallyOpen={idx === 0}
          >
            {/* INGREDIENTES */}
            {section.ingredients && section.ingredients.length > 0 && (
              <View style={styles.ingredientsContainer}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableCellName, styles.tableHeader]}>
                    Ingrediente
                  </Text>
                  <Text style={[styles.tableCellQuantity, styles.tableHeader]}>
                    Cantidad
                  </Text>
                  <Text style={[styles.tableCellCheckbox, styles.tableHeader]}>
                    ✔
                  </Text>
                </View>

                {section.ingredients.map(
                  (ing: { name: string; quantity: string }, i: number) => (
                    <View
                      key={i}
                      style={[
                        styles.tableRow,
                        i % 2 === 0 && styles.tableRowAlt,
                      ]}
                    >
                      <Text style={styles.tableCellName}>{ing.name}</Text>
                      <Text style={styles.tableCellQuantity}>
                        {modifyQuantity(ing.quantity, multiplier)}
                      </Text>
                      <View style={styles.tableCellCheckbox}>
                        <BouncyCheckbox
                          size={20}
                          fillColor="#E91E63"
                          unFillColor="#fff"
                          disableBuiltInState
                        />
                      </View>
                    </View>
                  )
                )}
              </View>
            )}

            {/* PASOS */}
            {section.steps && section.steps.length > 0 && (
              <>
                <Text style={[styles.sectionSubtitle, { marginTop: 14 }]}>
                  Pasos
                </Text>

                <View style={styles.stepsContainer}>
                  {section.steps.map((stepText: string, sIdx: number) => (
                    <View key={sIdx} style={styles.stepItem}>
                      <View style={styles.stepTextContainer}>
                        <Text style={styles.stepNumber}>
                          Paso {sIdx + 1}
                        </Text>
                        <Text style={styles.stepDescription}>{stepText}</Text>
                      </View>

                      <View style={styles.checkboxContainer}>
                        <BouncyCheckbox
                          size={24}
                          fillColor="#E91E63"
                          unFillColor="#fff"
                          disableBuiltInState
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </SimpleAccordion>
        ))}

        {/* MONTAJE FINAL */}
        {recipe.montage && recipe.montage.length > 0 && (
          <SimpleAccordion title="Montaje final" initiallyOpen={false}>
            <View style={styles.stepsContainer}>
              {recipe.montage.map((stepText: string, idx: number) => (
                <View key={idx} style={styles.stepItem}>
                  <View style={styles.stepTextContainer}>
                    <Text style={styles.stepNumber}>Paso {idx + 1}</Text>
                    <Text style={styles.stepDescription}>{stepText}</Text>
                  </View>
                  <View style={styles.checkboxContainer}>
                    <BouncyCheckbox
                      size={24}
                      fillColor="#E91E63"
                      unFillColor="#fff"
                      disableBuiltInState
                    />
                  </View>
                </View>
              ))}
            </View>
          </SimpleAccordion>
        )}

      </ScrollView>

      {/* MODAL TIPS */}
      <Modal
        visible={tipsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeTipsModal}
      >
        <View style={styles.tipsModalOverlay} pointerEvents="box-none">

          {/* Cerrar cuando tocas FUERA del modal */}
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

// --- ESTILOS ---
const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  recipeTitle: {
    fontFamily: "MateSC",
    fontSize: 30,
    textAlign: "center",
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: "#8A3A63",
    color: "#7A2E55",
  },

  favoriteIcon: { marginLeft: 10 },

  imageContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },

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

  // ⭐ MINI-HEADER PREMIUM
  miniHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 5,
  },

  miniHeaderText: {
    fontFamily: "MateSC",
    fontSize: 20,
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  multiplierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 10,
  },

  sectionSubtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7A2E55",
  },

  multiplicarButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },

  // ACORDEONES
  accordionContainer: {
    backgroundColor: "#FFFFFFEE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2A9C4",
    marginBottom: 15,
    overflow: "hidden",
  },

  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#FFE2EE",
    alignItems: "center",
  },

  accordionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7A2E55",
  },

  accordionContent: {
    padding: 12,
  },

  // TABLA INGREDIENTES
  ingredientsContainer: {
    backgroundColor: "#FFFFFFEE",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2A9C4",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EAC4D7",
  },

  tableHeaderRow: { backgroundColor: "#FFE2EE" },

  tableRowAlt: { backgroundColor: "rgba(255,228,240,0.35)" },

  tableCellName: { flex: 1.2, padding: 10, fontSize: 14, color: "#5A1F3F" },

  tableCellQuantity: {
    flex: 1,
    textAlign: "center",
    padding: 10,
    fontSize: 14,
    color: "#5A1F3F",
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
    color: "#7A2E55",
  },

  // PASOS
  stepsContainer: {
    marginTop: 10,
  },

  stepItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFFEE",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2A9C4",
  },

  stepTextContainer: { flex: 0.85 },

  stepNumber: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 16,
    color: "#7A2E55",
  },

  stepDescription: {
    fontSize: 15,
    color: "#5A1F3F",
    lineHeight: 21,
  },

  checkboxContainer: {
    flex: 0.15,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  // TIPS
  tipsButton: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#FF6BAA",
    paddingVertical: 12,
    borderRadius: 30,
    width: "60%",
    alignSelf: "center",
    marginVertical: 35,
    elevation: 3,
    marginBottom: 20,
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
    color: "#222",
  },

  tipCard: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },

  tipTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
    marginBottom: 5,
    textDecorationLine: "underline",
  },

  tipDescription: {
    fontSize: 14,
    color: "#222",
    lineHeight: 20,
  },

  closeTipsButton: {
    backgroundColor: "#333",
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
  miniHeaderWrapper: {
    marginTop: 10,
    marginBottom: 16,
  },

  miniHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    elevation: 6,
    overflow: "hidden",
  },

  miniHeaderText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "MateSC",
    fontSize: 22,
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  multiplierMini: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  multiplierMiniText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },

  glossy: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: "rgba(255,255,255,0.35)",
    opacity: 0.5,
    borderRadius: 20,
    transform: [{ rotate: "25deg" }],
  },

});
