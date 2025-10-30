// store/Slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string | null;
  photo: string | null;
  email: string | null;
  isPremium: boolean; // <-- agregamos el estado premium
}

const initialState: UserState = {
  name: null,
  photo: null,
  email: null,
  isPremium: false, // por defecto no es premium
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.name = action.payload.name;
      state.photo = action.payload.photo;
      state.email = action.payload.email;
    },
    clearUser: (state) => {
      state.name = null;
      state.photo = null;
      state.email = null;
      state.isPremium = false;
    },
    setPremium: (state, action: PayloadAction<boolean>) => {
      state.isPremium = action.payload; // <-- nueva acción
    },
  },
});

export const { setUser, clearUser, setPremium } = userSlice.actions;
export default userSlice.reducer;
