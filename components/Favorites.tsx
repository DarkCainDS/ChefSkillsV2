// screens/Favorites.tsx

import React, { useEffect, memo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Image } from "expo-image";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import { setFavorites } from "../store/Slices/FavoriteSlice";
import {
  loadFavoritesFromStorage,
  saveFavoritesToStorage,
} from "../store/storage/FavoriteStorage";

import { getSafeVersionedImage } from "../utils/imageSource";
import { useFavoritesWatchdog } from "../utils/favoritesWatchdog";

import type { Recipe } from "../store/Slices/FavoriteSlice";
import type { RootState } from "../store/Index";

/* ============================================================
   🧩 FAVORITE CARD
============================================================ */

interface FavoriteCardProps {
  item: Recipe;
  onPress: () => void;
}

const FavoriteCard = memo(({ item, onPress }: FavoriteCardProps) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Image
        source={getSafeVersionedImage(item.imageUrl, item.images)}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.info}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.divider} />
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

/* ============================================================
   ⭐ FAVORITES SCREEN
============================================================ */

const Favorites: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch();

  const favoritesRecipes = useSelector(
    (state: RootState) => state.favorites.recipes
  );

  const maxSlots = useSelector(
    (state: RootState) => state.favorites.maxFavorites
  );

  const used = favoritesRecipes.length;
  const isFull = used >= maxSlots;

  useFavoritesWatchdog(true);

  // 🔄 Load favorites once
  useEffect(() => {
    (async () => {
      const stored = await loadFavoritesFromStorage();
      dispatch(setFavorites(stored));
    })();
  }, [dispatch]);

  // 💾 Persist favorites
  useEffect(() => {
    saveFavoritesToStorage(favoritesRecipes);
  }, [favoritesRecipes]);

  return (
    <View style={styles.container}>
      {/* 🔢 COUNTER */}
      <View
        style={[
          styles.counterContainer,
          { backgroundColor: isFull ? "#d32f2f" : "#8e44ad" },
        ]}
      >
        <Text style={styles.favoriteCount}>
          {used} / {maxSlots}
        </Text>
      </View>

      {used === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No tienes recetas favoritas aún.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoritesRecipes}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <FavoriteCard
              item={item}
              onPress={() => {
                if (item.uid.startsWith("P-STY")) {
                  navigation.navigate("FavoritePastryDetail", { recipe: item });
                } else {
                  navigation.navigate("FavoriteRecipeDetail", { recipe: item });
                }
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Favorites;

/* ============================================================
   🎨 STYLES
============================================================ */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },

  counterContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    elevation: 8,
  },

  favoriteCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
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

  info: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000",
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

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#555",
  },
});
