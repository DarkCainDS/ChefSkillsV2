// store/Slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  uid: string | null;
  name: string | null;
  photo: string | null;
  email: string | null;

  // 🔐 suscripción
  isPremium: boolean | null;
  subscriptionResolved: boolean;
  planId: string | null;

  favoritesLimit: number;     // 👈 EL VALOR FINAL (10, 15, 20, 25, 30)

  // progreso
  level: number;
  exp: number;
  nextLevelExp: number;
  rankTitle: string | null;
}

const initialState: UserState = {
  uid: null,
  name: null,
  photo: null,
  email: null,

  isPremium: null,
  subscriptionResolved: false,
  planId: null,

  favoritesLimit: 10, // base

  level: 1,
  exp: 0,
  nextLevelExp: 100,
  rankTitle: "Cocinero Principiante",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
    },

    clearUser: (state) => {
      Object.assign(state, initialState);
    },

    setPremium: (state, action: PayloadAction<boolean>) => {
      state.isPremium = action.payload;
      state.subscriptionResolved = true;
    },

    setSubscriptionResolved: (state) => {
      state.subscriptionResolved = true;
    },

    // 👇 YA NO HAY BOOSTS — FAVORITES DEPENDE DEL PLAN
    setPlan: (
      state,
      action: PayloadAction<{ planId: string | null; favoritesLimit: number }>
    ) => {
      state.planId = action.payload.planId;
      state.favoritesLimit = action.payload.favoritesLimit;
      state.isPremium = !!action.payload.planId;
      state.subscriptionResolved = true;
    },
  },
});

export const {
  setUser,
  clearUser,
  setPremium,
  updateProgress,
  setSubscriptionResolved,
  setPlan,
} = userSlice.actions;

export default userSlice.reducer;
