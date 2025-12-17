import { getVersionedImageSync } from "../../utils/versionedImage";
// screens/FavoritePastryDetail.tsx
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
import { useFavoriteToggle } from "../hooks/useFavoriteToggle";
import type { Recipe } from "../../store/Slices/FavoriteSlice";
import { getSafeVersionedImage } from "../../utils/imageSource";


type RootStackParamList = {
  FavoritePastryDetail: { recipe: Recipe };
};

// --- Simple Accordion (Adaptado al estilo Dorado) ---
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
        onPress={() => setOpen(!open)}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        <MaterialIcons
          name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={26}
          // Color Ámbar Profundo
          color="#D48A2B"
        />
      </TouchableOpacity>

      {open && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
};

// =========================================================
//                FAVORITE PASTRY DETAIL SCREEN
// =========================================================
export default function FavoritePastryDetail() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "FavoritePastryDetail">>();
  const recipe = route.params?.recipe;

  const [fontLoaded] = useFonts({
    MateSC: require("../../assets/fonts/MateSC-Regular.ttf"),
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [buttonText, setButtonText] = useState<string>("x1");

  // Lógica del Modal (Traída de tu código funcional)
  const [tipsVisible, setTipsVisible] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ❤️ FAVORITES TOGGLE
  const { isFavorite, toggleFavorite, heartAnim } = useFavoriteToggle(recipe);

  // 🔢 MULTIPLICADOR
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

  // =========================================================
  //                           RENDER
  // =========================================================
  return (
    // 1. Fondo Amarillo Dorado Suave
    <LinearGradient colors={["#FFE8C2", "#FFD891", "#F5C03A"]} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 15, paddingBottom: 50 }}
      >
        {/* HEADER */}
        <CategoryHeader
          title="Favorito"
          icon="🧁"
          color="#D48A2B" // 3. Ámbar profundo
          titleColor="#FFFFFF"
          onBack={() => navigation.goBack()}
        />

        {/* TITLE + HEART */}
        <View style={styles.headerContainer}>
          <Text style={styles.recipeTitle}>{recipe.name}</Text>

          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteIcon}>
            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
              <MaterialIcons
                name={isFavorite ? "favorite" : "favorite-border"}
                size={46}
                // Corazón rojo si es fav, Marrón Oscuro si no
                color={isFavorite ? "#FF2F81" : "#5C3B22"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* IMAGE CAROUSEL */}
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

        {/* MODAL FULL IMAGE */}
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

        {/* TIPS BUTTON */}
        {recipe.tips?.length > 0 && (
          <TouchableOpacity style={styles.tipsButton} onPress={openTipsModal}>
            <MaterialIcons name="lightbulb" size={28} color="white" />
            <Text style={styles.tipsButtonText}>Tips</Text>
          </TouchableOpacity>
        )}

        {/* MINI HEADER - PREPARACIONES */}
        <View style={styles.miniHeaderWrapper}>
          <LinearGradient
            // 5. Naranja Brillante Gradient
            colors={["#F07400", "#FF8A1A", "#FFC56A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.miniHeader}
          >
            <MaterialIcons name="content-paste" size={24} color="#fff" />

            <Text style={styles.miniHeaderText}>Preparaciones</Text>

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

        {/* SECTIONS */}
        {recipe.sections?.map((section, idx) => (
          <SimpleAccordion
            key={idx}
            title={section.title || `Sección ${idx + 1}`}
            initiallyOpen={idx === 0}
          >
            {/* INGREDIENTS TABLE */}
            {section.ingredients?.length > 0 && (
              <View style={styles.ingredientsContainer}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableCellName, styles.tableHeader]}>Ingrediente</Text>
                  <Text style={[styles.tableCellQuantity, styles.tableHeader]}>Cantidad</Text>
                  <Text style={[styles.tableCellCheckbox, styles.tableHeader]}>✔</Text>
                </View>

                {section.ingredients.map((ing, i) => (
                  <View
                    key={i}
                    style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}
                  >
                    <Text style={styles.tableCellName}>{ing.name}</Text>
                    <Text style={styles.tableCellQuantity}>
                      {modifyQuantity(ing.quantity, multiplier)}
                    </Text>
                    <View style={styles.tableCellCheckbox}>
                      <BouncyCheckbox
                        size={20}
                        // Checkbox Naranja Brillante
                        fillColor="#F07400"
                        unFillColor="#fff"
                        disableBuiltInState
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* STEPS */}
            {section.steps?.length > 0 && (
              <>
                <Text style={[styles.sectionSubtitle, { marginTop: 14 }]}>Pasos</Text>

                <View style={styles.stepsContainer}>
                  {section.steps.map((stepText, sIdx) => (
                    <View key={sIdx} style={styles.stepItem}>
                      <View style={styles.stepTextContainer}>
                        <Text style={styles.stepNumber}>Paso {sIdx + 1}</Text>
                        <Text style={styles.stepDescription}>{stepText}</Text>
                      </View>

                      <View style={styles.checkboxContainer}>
                        <BouncyCheckbox
                          size={24}
                          fillColor="#F07400"
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

        {/* MONTAGE FINAL */}
        {recipe.montage?.length > 0 && (
          <SimpleAccordion title="Montaje final">
            <View style={styles.stepsContainer}>
              {recipe.montage.map((stepText, idx) => (
                <View key={idx} style={styles.stepItem}>
                  <View style={styles.stepTextContainer}>
                    <Text style={styles.stepNumber}>Paso {idx + 1}</Text>
                    <Text style={styles.stepDescription}>{stepText}</Text>
                  </View>
                  <View style={styles.checkboxContainer}>
                    <BouncyCheckbox
                      size={24}
                      fillColor="#F07400"
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

      {/* MODAL TIPS (ESTILO FIXED) */}
      <Modal visible={tipsVisible} transparent animationType="fade">
        <View style={styles.tipsModalOverlay}>
          <TouchableWithoutFeedback onPress={closeTipsModal}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.tipsModal,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
            ]}
          >
            <Text style={styles.tipsTitle}>💡 Consejos útiles</Text>

            <ScrollView style={{ maxHeight: "100%" }} showsVerticalScrollIndicator={false}>
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

            <TouchableOpacity style={styles.closeTipsButton} onPress={closeTipsModal}>
              <Text style={styles.closeTipsText}>Cerrar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// =========================================================
//                         STYLES
// =========================================================
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
    // 3. Ámbar profundo borde
    borderColor: "#D48A2B",
    // 4. Gris marrón oscuro texto
    color: "#5C3B22",
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

  miniHeaderWrapper: {
    marginTop: 10,
    marginBottom: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#CCA000",
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

  // --- ACORDEONES (Cambios de color) ---
  accordionContainer: {
    backgroundColor: "#FFFFFFEE",
    borderRadius: 14,
    borderWidth: 1,
    // 3. Borde Ámbar profundo
    borderColor: "#D48A2B",
    marginBottom: 15,
    overflow: "hidden",
  },

  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    // 2. Naranja pastel suave fondo
    backgroundColor: "#FFCF99",
    alignItems: "center",
  },

  accordionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    // 4. Texto Gris Marrón Oscuro
    color: "#5C3B22",
  },

  accordionContent: {
    padding: 12,
    // 1. Fondo interno Amarillo dorado muy suave
    backgroundColor: "#FFF8E7",
  },

  ingredientsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFCF99",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3E0B5",
  },

  tableHeaderRow: {
    // 2. Encabezado de tabla Naranja Pastel
    backgroundColor: "#FFCF99"
  },

  tableRowAlt: {
    // Alternancia suave amarilla
    backgroundColor: "rgba(255, 232, 194, 0.4)"
  },

  tableCellName: {
    flex: 1.2,
    padding: 10,
    fontSize: 14,
    // 4. Texto Marrón
    color: "#5C3B22"
  },

  tableCellQuantity: {
    flex: 1,
    textAlign: "center",
    padding: 10,
    fontSize: 14,
    color: "#5C3B22",
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
    color: "#5C3B22",
  },

  sectionSubtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D48A2B",
  },

  stepsContainer: {
    marginTop: 10,
  },

  stepItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    // Borde suave naranja
    borderColor: "#FFCF99",

  },

  stepTextContainer: { flex: 0.85 },

  stepNumber: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 16,
    // Numero de paso: Ámbar Profundo
    color: "#D48A2B",
  },

  stepDescription: {
    fontSize: 15,
    // Descripción: Marrón Oscuro
    color: "#5C3B22",
    lineHeight: 21,
  },

  checkboxContainer: {
    flex: 0.15,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  // --- BOTÓN TIPS ---
  tipsButton: {
    flexDirection: "row",
    justifyContent: "center",
    // 5. Botón Naranja Brillante
    backgroundColor: "#F07400",
    paddingVertical: 12,
    borderRadius: 30,
    width: "60%",
    alignSelf: "center",
    marginVertical: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#B35500",
  },

  tipsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 18,
  },

  // --- MODAL TIPS ESTILO NUEVO ---
  tipsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  tipsModal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: "85%",
    maxHeight: "75%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  tipsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#5C3B22",
  },

  tipCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  tipTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#3E2723",
    marginBottom: 5,
    textDecorationLine: "underline",
  },

  tipDescription: {
    fontSize: 15,
    color: "#3E2723",
    lineHeight: 22,
  },

  closeTipsButton: {
    backgroundColor: "#5C3B22",
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
    alignSelf: "center",
    width: "50%",
  },

  closeTipsText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});