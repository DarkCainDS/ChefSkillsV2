// store/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import favoritesReducer from './Slices/FavoriteSlice';
import subscriptionReducer from './Slices/subscriptionSlice';
import userReducer from './Slices/userSlice';

const rootReducer = combineReducers({
  user: userReducer,
  favorites: favoritesReducer,
  subscription: subscriptionReducer,

});

export default rootReducer;
