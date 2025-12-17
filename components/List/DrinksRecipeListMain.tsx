// screens/DrinksRecipeListMain.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useMemo, useState, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import drinksData from "../../assets/Json/Drink.json";
import { getSafeVersionedImage } from "../../utils/imageSource";


// 🔍 Normalización inteligente
const normalizeText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/gi, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();

// 🎲 Mezclar aleatoriamente
const shuffleArray = (array: any[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

function DrinksRecipeListMain() {
  const navigation = useNavigation();
  const [recipes] = useState(drinksData.recipes);
  const [searchText, setSearchText] = useState("");

  // 🔍 Filtro robusto
  const filteredRecipes = useMemo(() => {
    if (!searchText.trim()) return recipes;

    const nText = normalizeText(searchText);

    return recipes.filter((recipe) => {
      const nName = normalizeText(recipe.name);
      const nDesc = normalizeText(recipe.description);
      return nName.includes(nText) || nDesc.includes(nText);
    });
  }, [recipes, searchText]);

  // 🎲 Shuffle solo cuando cambia el filtro
  const shuffledRecipes = useMemo(
    () => shuffleArray(filteredRecipes),
    [filteredRecipes]
  );

  // 🎨 Render
  const renderRecipe = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("DrinkRecipeDetail", { recipe: item })}
      >
        <Image
          source={getSafeVersionedImage(
            item.imageUrl,
            item.images
          )}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />

        <View style={styles.info}>
          <Text style={styles.title}>{item.name}</Text>

          <View style={styles.divider} />

          <Text numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [navigation]
  );

  return (
    <View style={styles.container}>
      {/* 🔎 Buscador */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar bebida..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* 📜 Lista */}
      <FlatList
        data={shuffledRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecipe}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={5}
      />
    </View>
  );
}

// 🎨 Estilos ChefSkills universales
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  searchIcon: { marginRight: 10 },

  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#ebeaeaff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    elevation: 5,
    height: 105,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },

  info: { flex: 1, justifyContent: "center", marginLeft: 10 },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "black",
  },

  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginBottom: 6,
    width: "100%",
  },

  description: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#333",
  },
});

export default React.memo(DrinksRecipeListMain);
