// screens/Favorites.tsx
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setFavorites } from '../store/Slices/FavoriteSlice';
import { loadFavoritesFromStorage, saveFavoritesToStorage } from '../store/storage/FavoriteStorage';
import type { Recipe } from '../store/Slices/FavoriteSlice';

// Placeholder por si no hay imagen
const placeholderImage = 'https://via.placeholder.com/80x80.png?text=Receta';

// Card para cada favorito
const FavoriteCard: React.FC<{ item: Recipe; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
    <Image
      source={{ uri: item.images?.[0] || placeholderImage }}
      style={styles.image}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
    />
    <View style={styles.info}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
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

  // Cargar favoritos al iniciar
  useEffect(() => {
    const loadData = async () => {
      const storedFavorites = await loadFavoritesFromStorage();
      dispatch(setFavorites(storedFavorites));
    };
    loadData();
  }, [dispatch]);

  // Guardar favoritos automáticamente al cambiar
  useEffect(() => {
    saveFavoritesToStorage(favoritesRecipes);
  }, [favoritesRecipes]);

  if (favoritesRecipes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tienes recetas favoritas aún.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Contador en esquina superior */}
      <View style={styles.counterContainer}>
        <Text style={styles.favoriteCount}>
          {favoritesRecipes.length} / {maxSlots}
        </Text>
      </View>

      <FlatList
        data={favoritesRecipes}
        keyExtractor={(item) => item.uid.toString()}
        renderItem={({ item }) => (
          <FavoriteCard
            item={item}
            onPress={() => navigation.navigate('FavoriteRecipeDetail', { recipe: item })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  counterContainer: {
    position: 'absolute',
    top: 10,
    right: 15,
    backgroundColor: '#1ABC9C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 10,
    marginTop: -30,
    marginRight: -20,
  },
  favoriteCount: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 3,
    marginBottom: 15,
    elevation: 5,
  },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 15, resizeMode: 'contain' },
  info: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#333' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#555' },
});

export default Favorites;
