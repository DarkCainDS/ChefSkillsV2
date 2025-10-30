import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isPremium: false,
  plan: null, // puede guardar { name, price, benefits }
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    subscribePlan: (state, action) => {
      state.isPremium = true;
      state.plan = action.payload;
    },
    unsubscribe: (state) => {
      state.isPremium = false;
      state.plan = null;
    },
  },
});

export const { subscribePlan, unsubscribe } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
