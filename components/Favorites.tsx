// screens/Favorites.tsx
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setFavorites } from '../store/Slices/FavoriteSlice';
import { loadFavoritesFromStorage, saveFavoritesToStorage } from '../store/storage/FavoriteStorage';
import { getSafeImage } from '../utils/getImageSource';
import type { Recipe } from '../store/Slices/FavoriteSlice';

const FavoriteCard: React.FC<{ item: Recipe; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
    {/* 🔥 MISMO ESTILO QUE MAIN DISH */}
    <Image
      source={getSafeImage(item.images?.[0])}
      style={styles.image}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
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

const Favorites: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch();

  const favoritesRecipes = useSelector((state: any) => state.favorites.recipes) as Recipe[];
  const maxSlots = useSelector((state: any) => state.favorites.maxFavorites) as number;

  const used = favoritesRecipes.length;
  const isFull = used >= maxSlots;

  useEffect(() => {
    (async () => {
      const stored = await loadFavoritesFromStorage();
      dispatch(setFavorites(stored));
    })();
  }, [dispatch]);

  useEffect(() => {
    saveFavoritesToStorage(favoritesRecipes);
  }, [favoritesRecipes]);

  return (
    <View style={styles.container}>
      {/* 🔥 Contador de favoritos */}
      <View
        style={[
          styles.counterContainer,
          { backgroundColor: isFull ? "#d32f2f" : "#8e44ad" }
        ]}
      >
        <Text style={styles.favoriteCount}>
          {used} / {maxSlots}
        </Text>
      </View>

      {used === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes recetas favoritas aún.</Text>
        </View>
      ) : (
        <FlatList
          data={favoritesRecipes}
          keyExtractor={(item) => item.uid.toString()}
          renderItem={({ item }) => (
            <FavoriteCard
              item={item}
              onPress={() =>
                navigation.navigate("FavoriteRecipeDetail", { recipe: item })
              }
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

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

  // ======== CARD IGUAL A MAIN DISH =========
  card: {
    flexDirection: "row",
    backgroundColor: "#ebeaeaff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 3,
    marginBottom: 15,
    elevation: 5,
    height: 105,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    resizeMode: "cover",
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
    marginLeft: 2,
  },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#555" },
});

export default Favorites;
