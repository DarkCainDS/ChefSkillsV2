// screens/TragosRecipeDetail.tsx
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
  Alert,
} from "react-native";

import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useDispatch, useSelector } from "react-redux";
import { addFavorite, removeFavorite } from "../../store/Slices/FavoriteSlice";
import { saveFavoritesToStorage } from "../../store/storage/FavoriteStorage";
import LinearGradient from "react-native-linear-gradient";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";

import CategoryHeader from "../UI/CSHeader_ModernPro";

// TYPES
interface Ingredient { name: string; quantity: string; }
interface Step { step: string; }
interface Tip { title: string; description: string; }
interface Recipe {
  uid: string;
  name: string;
  images: string[];
  ingredients: Ingredient[];
  steps: Step[];
  tips?: Tip[];
}

type RootStackParamList = {
  TragosRecipeDetail: { recipe: Recipe };
};

export default function TragosRecipeDetail() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "TragosRecipeDetail">>();
  const recipe = route.params?.recipe;

  const [fontLoaded] = useFonts({
    MateSC: require("../../assets/fonts/MateSC-Regular.ttf"),
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [buttonText, setButtonText] = useState<string>("x1");
  const [tipsVisible, setTipsVisible] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  const dispatch = useDispatch();
  const favorites = useSelector((state: any) => state.favorites.recipes) as Recipe[];
  const isFavorite = recipe ? favorites.some((fav) => fav.uid === recipe.uid) : false;

  const persistFavorites = async (updated: Recipe[]) => {
    try {
      await saveFavoritesToStorage(updated);
    } catch (error) {
      console.error("Error guardando favoritos", error);
      Alert.alert("Error", "No se pudo guardar el favorito localmente.");
    }
  };

  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(heartAnim, { toValue: 1.25, duration: 150, useNativeDriver: true }),
      Animated.timing(heartAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handleFavoritePress = async () => {
    if (!recipe) return;

    let updatedFavorites;
    if (!isFavorite) {
      dispatch(addFavorite(recipe));
      updatedFavorites = [...favorites, recipe];
      animateHeart();
    } else {
      dispatch(removeFavorite(recipe.uid));
      updatedFavorites = favorites.filter((fav) => fav.uid !== recipe.uid);
    }

    await persistFavorites(updatedFavorites);
  };

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
    case 1: return '#6B7280';  // Neutral-500
    case 2: return '#3B82F6';  // Blue-500
    case 3: return '#22C55E';  // Green-500
    case 4: return '#EF4444';  // Red-500
    case 0.5: return '#FACC15'; // Yellow-400
    default: return '#3B82F6';
  }
};


  const tipColors = ["#DFFFFB", "#B3F4F5", "#8DE0E3", "#6AD3D7"];

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

  return (
    <LinearGradient
      colors={["#DFFFFB", "#B3F4F5", "#8DE0E3"]}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1, padding: 15 }}>

        {/* HEADER */}
        <CategoryHeader
          title="Bebidas"
          icon="🍹"
          color="#46C1C8"
          titleColor="#E8FFFF"
          onBack={() => navigation.goBack()}
        />

        {/* TITLE + HEART */}
        <View style={styles.headerContainer}>
          <Text style={styles.recipeTitle}>{recipe.name}</Text>

          <TouchableOpacity onPress={handleFavoritePress} style={styles.favoriteIcon}>
            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
              <MaterialIcons
                name={isFavorite ? "favorite" : "favorite-border"}
                size={48}
                color={isFavorite ? "#1C6F73" : "black"}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* IMAGES */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.imageContainer}
        >
          {recipe.images?.map((imgUrl, idx) => (
            <TouchableOpacity key={idx} onPress={() => setSelectedImage(imgUrl)}>
              <Image
                source={imgUrl}
                style={styles.image}
                contentFit="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* MODAL IMAGE */}
        <Modal visible={!!selectedImage} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setSelectedImage(null)}>
            <View style={styles.modalBackground}>
              {selectedImage && (
                <Image
                  source={selectedImage}
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
          <View style={[styles.tableRow, { backgroundColor: "#B3F4F5" }]}>
            <Text style={[styles.tableCellName, styles.tableHeader]}>Ingrediente</Text>
            <Text style={[styles.tableCellQuantity, styles.tableHeader]}>Cantidad</Text>
            <Text style={[styles.tableCellCheckbox, styles.tableHeader]}>✔</Text>
          </View>

          {recipe.ingredients?.map((ing, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.tableCellName}>{ing.name}</Text>
              <Text style={styles.tableCellQuantity}>
                {modifyQuantity(ing.quantity, multiplier)}
              </Text>
              <View style={styles.tableCellCheckbox}>
                <BouncyCheckbox
                  size={20}
                  fillColor="#46C1C8"
                  unFillColor="#fff"
                  disableBuiltInState
                />
              </View>
            </View>
          ))}
        </View>

        {/* TIPS ANTES DE PASOS */}
        {recipe.tips?.length > 0 && (
          <TouchableOpacity style={styles.tipsButton} onPress={openTipsModal}>
            <MaterialIcons name="lightbulb" size={28} color="white" />
            <Text style={styles.tipsButtonText}>Tips</Text>
          </TouchableOpacity>
        )}

        {/* TITLE PASOS */}
        <Text style={styles.sectionTitle}>Pasos</Text>

        {/* PASOS */}
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
                  fillColor="#46C1C8"
                  unFillColor="#fff"
                  disableBuiltInState
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* MODAL TIPS */}
      <Modal visible={tipsVisible} transparent animationType="fade" onRequestClose={closeTipsModal}>
        <TouchableWithoutFeedback onPress={closeTipsModal}>
          <View style={styles.tipsModalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.tipsModal,
                  { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
                ]}
              >
                <Text style={styles.tipsTitle}>💡 Consejos útiles</Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {recipe.tips?.map((tip, idx) => (
                    <LinearGradient
                      key={idx}
                      colors={[tipColors[idx % tipColors.length], tipColors[idx % tipColors.length] + "CC"]}
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </LinearGradient>
  );
}

// STYLES
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
    padding: 6,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
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
    width: "88%",
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
    fontSize: 22,
    fontWeight: "bold",
    fontStyle: "italic",
    flex: 1,
    borderBottomWidth: 3,
    paddingBottom: 3,
    borderBottomColor: "#46C1C8",
    color: "#1C6F73",
  },

  multiplicarButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontStyle: "italic",
    fontSize: 20,
  },

  ingredientsContainer: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 10,
    overflow: "hidden",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#A8E3E6",
  },

  tableCellName: {
    flex: 1,
    padding: 8,
  },

  tableCellQuantity: {
    flex: 1,
    textAlign: "center",
    padding: 8,
  },

  tableCellCheckbox: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },

  tableHeader: {
    fontWeight: "bold",
  },

  stepsContainer: {
    marginBottom: 100,
    marginTop: 10,
  },

  stepItem: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  stepTextContainer: {
    flex: 0.85,
  },

  stepNumber: {
    fontWeight: "bold",
    marginBottom: 4,
  },

  stepDescription: {
    fontSize: 14,
    color: "#444",
  },

  checkboxContainer: {
    flex: 0.15,
    justifyContent: "center",
    alignItems: "center",
  },

  tipsButton: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#46C1C8",
    paddingVertical: 12,
    borderRadius: 30,
    width: "60%",
    alignSelf: "center",
    marginVertical: 35,
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
    padding: 16,
    borderRadius: 15,
    width: "85%",
    maxHeight: "70%",
  },

  tipsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  tipCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },

  tipTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  closeTipsButton: {
    backgroundColor: "#46C1C8",
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
