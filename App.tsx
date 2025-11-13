// App.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { Provider, useDispatch } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import store from "./store/Index";
import { setUser, setPremium, setSubscriptionResolved } from "./store/Slices/userSlice";
import { checkSubscriptionStatus } from "./services/subscriptionService";

// 🔹 Screens principales
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

// 🔸 Anuncios globales
import InterstitialAdManager from "./components/ads/InterstitialAdManager";

const Stack = createStackNavigator();

const AppContent = () => {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);
  const [user, setLocalUser] = useState<any>(null);
  const [currentRouteName, setCurrentRouteName] = useState<string>("Unknown");

  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLocalUser(user);

      if (user) {
        console.log("✅ Sesión restaurada:", user.email);
        dispatch(setUser({
          uid: user.uid,
          name: user.displayName || null,
          photo: user.photoURL || null,
          email: user.email || null,
        }));

        let isPremium = false;
        let subData = null;

        const cached = await AsyncStorage.getItem("subscriptionData");
        if (cached) {
          const parsed = JSON.parse(cached);
          const exp = new Date(parsed.expiresAt);
          if (exp > new Date()) {
            isPremium = true;
            subData = parsed;
            console.log("💎 Usuario premium (cache)");
          }
        }

        if (!isPremium) {
          console.log("📡 Verificando suscripción...");
          subData = await checkSubscriptionStatus(user.uid, dispatch);
          console.log("🔎 subData:", subData);
          isPremium = !!(subData?.isActive);

          if (subData)
            await AsyncStorage.setItem("subscriptionData", JSON.stringify(subData));
          else
            await AsyncStorage.removeItem("subscriptionData");
        }

        dispatch(setPremium(isPremium));
      } else {
        console.log("👤 Sesión cerrada");
        dispatch(setUser(null));
        dispatch(setPremium(false));
      }

      dispatch(setSubscriptionResolved());
      setInitializing(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  // 🌀 Pantalla de carga inicial
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#40E0D0" />
        <Text style={{ color: "white", marginTop: 10 }}>Cargando sesión...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        setCurrentRouteName(navigationRef.getCurrentRoute()?.name ?? "Unknown");
      }}
      onStateChange={() => {
        const route = navigationRef.getCurrentRoute()?.name;
        if (route) setCurrentRouteName(route);
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        )}
        {/* Detalles */}
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

      {/* 💥 Interstitial: recibe ruta actual como prop */}
      <InterstitialAdManager currentRoute={currentRouteName} />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}