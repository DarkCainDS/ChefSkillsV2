import { useDispatch, useSelector } from "react-redux";
import { addFavorite, removeFavorite } from "../../store/Slices/FavoriteSlice";
import { saveFavoritesToStorage } from "../../store/storage/FavoriteStorage";
import { Recipe } from "../../store/Slices/FavoriteSlice";
import { Animated, Alert } from "react-native";
import { useRef } from "react";

export const useFavoriteToggle = (recipe: Recipe | null) => {
  const dispatch = useDispatch();

  const favorites = useSelector((state: any) => state.favorites.recipes);
  const maxFavorites = useSelector((state: any) => state.favorites.maxFavorites);

  const heartAnim = useRef(new Animated.Value(1)).current;

  const isFavorite = recipe
    ? favorites.some((fav: Recipe) => fav.uid === recipe.uid)
    : false;

  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleFavorite = async () => {
    if (!recipe) return;

    let updated: Recipe[];

    // ⭐ BLOQUEO CON ALERT
    if (!isFavorite && favorites.length >= maxFavorites) {
      Alert.alert(
        "Límite alcanzado",
        `Has llegado a tu máximo de ${maxFavorites} favoritos.`,
        [{ text: "OK", style: "default" }]
      );
      return; // 🔥 Detener sin agregar
    }

    // Agregar
    if (!isFavorite) {
      dispatch(addFavorite(recipe));
      updated = [...favorites, recipe];
      animateHeart();

    // Quitar
    } else {
      dispatch(removeFavorite(recipe.uid));
      updated = favorites.filter((f: Recipe) => f.uid !== recipe.uid);
    }

    // Guardar
    await saveFavoritesToStorage(updated);
  };

  return {
    isFavorite,
    toggleFavorite,
    heartAnim,
  };
};
