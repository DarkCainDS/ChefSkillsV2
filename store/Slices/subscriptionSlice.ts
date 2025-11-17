// store/Slices/subscriptionSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  expiresAt?: string | null;
}

interface SubscriptionState {
  isPremium: boolean;
  plan: SubscriptionPlan | null;
  adsRemoved: boolean;
  expiresAt: string | null;
  loading: boolean;
}

const initialState: SubscriptionState = {
  isPremium: false,
  plan: null,
  adsRemoved: false,
  expiresAt: null,
  loading: false,
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setSubscriptionLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    subscribePlan: (state, action: PayloadAction<SubscriptionPlan>) => {
      state.isPremium = true;
      state.plan = action.payload;
      state.expiresAt = action.payload.expiresAt || null;
      state.adsRemoved = true;
    },
    unsubscribe: (state) => {
      Object.assign(state, initialState);
    },
    setAdsRemoved: (state, action: PayloadAction<boolean>) => {
      state.adsRemoved = action.payload;
    },
    setPremium: (state, action: PayloadAction<boolean>) => {
      state.isPremium = action.payload;
      state.adsRemoved = action.payload;
      if (!action.payload) {
        state.plan = null;
        state.expiresAt = null;
      }
    },
  },
});

export const {
  setSubscriptionLoading,
  subscribePlan,
  unsubscribe,
  setAdsRemoved,
  setPremium,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
