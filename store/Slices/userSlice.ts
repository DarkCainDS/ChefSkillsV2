// store/Slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  uid: string | null;
  name: string | null;
  photo: string | null;
  email: string | null;
  isPremium: boolean | null;           // <- null = aún no resuelto
  subscriptionResolved: boolean;       // <- indica si ya se verificó premium

  // 🧠 Campos de progreso
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
  isPremium: null,              // <- empieza como desconocido
  subscriptionResolved: false,  // <- todavía no se chequeó

  // valores iniciales de progreso
  level: 1,
  exp: 0,
  nextLevelExp: 100,
  rankTitle: "Cocinero Principiante",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 🔹 Guarda o actualiza los datos del usuario logueado
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
    },

    // 🔹 Limpia todo (logout)
    clearUser: (state) => {
      Object.assign(state, initialState);
    },

    // 🔹 Marca premium y confirma que ya se resolvió el estado
    setPremium: (state, action: PayloadAction<boolean>) => {
      state.isPremium = action.payload;
      state.subscriptionResolved = true;
    },

    // 🔹 Marca solo que ya se resolvió (aunque siga siendo null)
    setSubscriptionResolved: (state) => {
      state.subscriptionResolved = true;
    },

    // 🔹 Actualiza nivel / progreso del usuario
    updateProgress: (state, action: PayloadAction<Partial<UserState>>) => {
      if (action.payload.level !== undefined) state.level = action.payload.level;
      if (action.payload.exp !== undefined) state.exp = action.payload.exp;
      if (action.payload.nextLevelExp !== undefined)
        state.nextLevelExp = action.payload.nextLevelExp;
      if (action.payload.rankTitle !== undefined)
        state.rankTitle = action.payload.rankTitle;
    },
  },
});

export const {
  setUser,
  clearUser,
  setPremium,
  updateProgress,
  setSubscriptionResolved,
} = userSlice.actions;

export default userSlice.reducer;
