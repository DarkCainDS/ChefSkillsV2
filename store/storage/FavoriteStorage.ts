// store/storage/FavoriteStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Recipe } from '../Slices/FavoriteSlice';

const FAVORITES_KEY = 'favorites';

/**
 * Guardar favoritos en AsyncStorage
 */
export const saveFavoritesToStorage = async (favorites: Recipe[]) => {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Error guardando favoritos', e);
  }
};

/**
 * Cargar favoritos de AsyncStorage
 */
export const loadFavoritesFromStorage = async (): Promise<Recipe[]> => {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error cargando favoritos', e);
    return [];
  }
};

/**
 * Sincronizar favoritos desde Firebase
 * @param firebaseFavorites array de favoritos traídos desde Firebase
 * @returns lista combinada y única de favoritos
 */
export const syncFavoritesWithFirebase = async (firebaseFavorites: Recipe[]): Promise<Recipe[]> => {
  try {
    const localFavorites = await loadFavoritesFromStorage();

    // Combinar locales + Firebase y eliminar duplicados (por id)
    const combined = [...localFavorites, ...firebaseFavorites];
    const uniqueFavorites = Array.from(new Map(combined.map(fav => [fav.id, fav])).values());

    // Guardar de nuevo en AsyncStorage
    await saveFavoritesToStorage(uniqueFavorites);

    return uniqueFavorites;
  } catch (e) {
    console.error('Error sincronizando favoritos', e);
    return firebaseFavorites || [];
  }
};

/**
 * Obtener el total de favoritos
 */
export const getFavoritesCount = async (): Promise<number> => {
  try {
    const favorites = await loadFavoritesFromStorage();
    return favorites.length;
  } catch (e) {
    console.error('Error contando favoritos', e);
    return 0;
  }
};
