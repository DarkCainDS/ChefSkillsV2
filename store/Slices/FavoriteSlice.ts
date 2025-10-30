// store/Slices/FavoriteSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Recipe {
  uid: string;
  name: string;
  description: string;
  images: string[];
  [key: string]: any;
}

interface FavoriteState {
  recipes: Recipe[];
  maxFavorites: number;
}

const initialState: FavoriteState = {
  recipes: [],
  maxFavorites: 10,
};

const favoriteSlice = createSlice({
  name: 'favorites',
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
      state.recipes = state.recipes.filter(r => r.uid !== action.payload);
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite } = favoriteSlice.actions;
export default favoriteSlice.reducer;
