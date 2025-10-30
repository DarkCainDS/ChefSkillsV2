import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['subscription'], // solo persistimos el estado de suscripción
};

export default persistReducer(persistConfig, rootReducer);
