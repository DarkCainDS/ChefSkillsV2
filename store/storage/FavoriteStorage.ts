// store/storage/FavoriteStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Recipe } from '../Slices/FavoriteSlice';

const FAVORITES_KEY = "favorites";

export const saveFavoritesToStorage = async (favorites: Recipe[]) => {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error("Error guardando favoritos:", e);
  }
};

export const loadFavoritesFromStorage = async (): Promise<Recipe[]> => {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error("Error cargando favoritos:", e);
    return [];
  }
};

export const dedupeFavorites = (favorites: Recipe[]): Recipe[] => {
  return Array.from(new Map(favorites.map(f => [f.uid, f])).values());
};
