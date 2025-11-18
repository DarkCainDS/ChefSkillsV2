// App.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import store, { AppDispatch, RootState } from "./store/Index";

// USER
import {
  setUser,
  setPlan,
  setPremium,
  setSubscriptionResolved,
} from "./store/Slices/userSlice";

// SUBSCRIPTION
import {
  unsubscribe as clearSubRedux,
  subscribePlan as setSubscriptionUI,
} from "./store/Slices/subscriptionSlice";

// FAVORITES
import {
  setMaxFavorites,
  clearFavorites,
  setFavorites,
} from "./store/Slices/FavoriteSlice";

// FAVORITES STORAGE
import {
  loadFavoritesFromStorage,
  saveFavoritesToStorage,
} from "./store/storage/FavoriteStorage";

// SERVICES
import { checkSubscriptionStatus } from "./services/subscriptionService";

// SCREENS
import HomeScreen from "./components/HomeScreen";
import LoadingScreen from "./components/LoadingScreen";
import TechniqueDetails from "./components/Detail/TechniqueDetails";
import MainDishRecipeDetail from "./components/Detail/MainDishRecipeDetail";
import PastryRecipeDetail from "./components/Detail/PastryRecipeDetail";
import PanaderiaRecipeDetail from "./components/Detail/PanaderiaRecipeDetail";
import SalsaRecipeDetail from "./components/Detail/SalsaRecipeDetail";
import SaladRecipeDetail from "./components/Detail/SaladRecipeDetail";
import SoupRecipeDetail from "./components/Detail/SoupRecipeDetail";
import DrinkRecipeDetail from "./components/Detail/DrinkRecipeDetail";
import FavoriteRecipeDetail from "./components/Detail/FavoriteRecipeDetail";
import Menu from "./components/Menu";

// ADS
import InterstitialAdManager from "./components/ads/InterstitialAdManager";

const Stack = createStackNavigator();



// ============================================================
//    MAIN APP CONTROLLER
// ============================================================
const AppContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigationRef = useNavigationContainerRef();

  const [initializing, setInitializing] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [currentRouteName, setCurrentRouteName] = useState("Unknown");

  const favoritesLimit = useSelector(
    (state: RootState) => state.favorites.maxFavorites
  );
  const subscriptionResolved = useSelector(
    (state: RootState) => state.user.subscriptionResolved
  );

  // ============================================================
  //    GLOBAL AUTH WATCHER
  // ============================================================
  useEffect(() => {
    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      // LOGGED OUT
      if (!user) {
        console.log("👤 Sesión cerrada");

        dispatch(clearSubRedux());
        dispatch(clearFavorites());
        dispatch(
          setUser({
            uid: null,
            name: null,
            email: null,
            photo: null,
          })
        );

        dispatch(setPremium(false));
        dispatch(setPlan({ planId: null, favoritesLimit: 10 }));
        dispatch(setMaxFavorites(10));
        dispatch(setSubscriptionResolved());

        await AsyncStorage.removeItem("subscriptionData");

        setInitializing(false);
        return;
      }

      // LOGGED IN
      console.log("✅ Sesión restaurada:", user.email);

      dispatch(
        setUser({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        })
      );

      // 🔎 Check subscription in Firestore
      const subData = await checkSubscriptionStatus(user.uid, dispatch);

      if (!subData) {
        // FREE
        dispatch(setPremium(false));
        dispatch(setPlan({ planId: null, favoritesLimit: 10 }));
        dispatch(setMaxFavorites(10));
        await AsyncStorage.removeItem("subscriptionData");
      } else {
        // PREMIUM
        dispatch(setPremium(true));

        dispatch(
          setPlan({
            planId: subData.planId,
            favoritesLimit: subData.favoritesLimit,
          })
        );

        dispatch(setMaxFavorites(subData.favoritesLimit));

        dispatch(
          setSubscriptionUI({
            id: subData.planId,
            name: subData.planName,
            price: subData.pricePaid,
            currency: subData.currency,
            expiresAt: subData.expiresAt,
          })
        );

        // Save minimal info for startup (opcional)
        await AsyncStorage.setItem(
          "subscriptionData",
          JSON.stringify({
            planName: subData.planName,
            expiresAt: subData.expiresAt,
          })
        );
      }

      dispatch(setSubscriptionResolved());
      setInitializing(false);
    });

    return () => unsub();
  }, [dispatch]);


  // ============================================================
  // LOADING SCREEN (NO ADS AQUÍ)
  // ============================================================
  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#40E0D0" />
        <Text style={{ color: "white", marginTop: 10 }}>Cargando sesión...</Text>
      </View>
    );
  }

  // ============================================================
  // NAVIGATION + ADS
  // ============================================================
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() =>
        setCurrentRouteName(
          navigationRef.getCurrentRoute()?.name ?? "Unknown"
        )
      }
      onStateChange={() => {
        const route = navigationRef.getCurrentRoute()?.name;
        if (route) setCurrentRouteName(route);
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {firebaseUser ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        )}

        {/* DETAILS */}
        <Stack.Screen name="TechniqueDetails" component={TechniqueDetails} />
        <Stack.Screen name="MainDishRecipeDetail" component={MainDishRecipeDetail} />
        <Stack.Screen name="PastryRecipeDetail" component={PastryRecipeDetail} />
        <Stack.Screen name="PanaderiaRecipeDetail" component={PanaderiaRecipeDetail} />
        <Stack.Screen name="SalsaRecipeDetail" component={SalsaRecipeDetail} />
        <Stack.Screen name="SaladRecipeDetail" component={SaladRecipeDetail} />
        <Stack.Screen name="SoupRecipeDetail" component={SoupRecipeDetail} />
        <Stack.Screen name="DrinkRecipeDetail" component={DrinkRecipeDetail} />
        <Stack.Screen name="FavoriteRecipeDetail" component={FavoriteRecipeDetail} />
        <Stack.Screen name="Menu" component={Menu} />
      </Stack.Navigator>

      <InterstitialAdManager currentRoute={currentRouteName} />
    </NavigationContainer>
  );
};

// ============================================================
// ROOT WRAPPER
// ============================================================
export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
