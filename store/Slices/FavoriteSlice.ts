// store/Slices/FavoriteSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Recipe {
  uid: string;
  name: string;
  description: string;
  images: string[];
  [key: string]: any;
}

interface FavoriteState {
  recipes: Recipe[];
  maxFavorites: number; // ← valor FINAL desde suscripción
}

const initialState: FavoriteState = {
  recipes: [],
  maxFavorites: 10, // base por defecto
};

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<Recipe[]>) => {
      state.recipes = action.payload;
    },

    addFavorite: (state, action: PayloadAction<Recipe>) => {
      if (state.recipes.length < state.maxFavorites) {
        state.recipes.push(action.payload);
      }
    },

    removeFavorite: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter((r) => r.uid !== action.payload);
    },

    // 👇 Se alimenta DIRECTAMENTE desde userSlice/subscripción
    setMaxFavorites: (state, action: PayloadAction<number>) => {
      state.maxFavorites = action.payload;
    },

    clearFavorites: (state) => {
      state.recipes = [];
      state.maxFavorites = 10;
    },
  },
});

export const {
  setFavorites,
  addFavorite,
  removeFavorite,
  setMaxFavorites,
  clearFavorites,
} = favoriteSlice.actions;

export default favoriteSlice.reducer;
