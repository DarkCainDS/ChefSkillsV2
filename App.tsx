// App.tsx
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, Text, Image } from "react-native";
import { Provider, useDispatch } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import store, { AppDispatch } from "./store/Index";

// ---------------- USER ----------------
import {
  setUser,
  setPlan,
  setPremium,
  setSubscriptionResolved,
} from "./store/Slices/userSlice";

// ---------------- SUBS ----------------
import {
  unsubscribe as clearSubRedux,
  subscribePlan as setSubscriptionUI,
} from "./store/Slices/subscriptionSlice";

// ---------------- FAVORITES ----------------
import {
  setMaxFavorites,
  clearFavorites,
} from "./store/Slices/FavoriteSlice";

// ---------------- SERVICES ----------------
import { checkSubscriptionStatus } from "./services/subscriptionService";

// ---------------- WATCHDOG ----------------
import {
  isRefreshExpired,
  clearAllJsonCache,
  downloadAllJson,
  markRefreshDone,
} from "./utils/watchdog";

// ---------------- SCREENS ----------------
import HomeScreen from "./components/HomeScreen";
import LoadingScreen from "./components/LoadingScreen";

// ---------------- DETAILS ----------------
import TechniqueDetails from "./components/Detail/TechniqueDetails";
import MainDishRecipeDetail from "./components/Detail/MainDishRecipeDetail";
import PastryRecipeDetail from "./components/Detail/PastryRecipeDetail";
import PanaderiaRecipeDetail from "./components/Detail/PanaderiaRecipeDetail";
import SalsaRecipeDetail from "./components/Detail/SalsaRecipeDetail";
import SaladRecipeDetail from "./components/Detail/SaladRecipeDetail";
import SoupRecipeDetail from "./components/Detail/SoupRecipeDetail";
import DrinkRecipeDetail from "./components/Detail/DrinkRecipeDetail";
import VeganRecipeDetail from "./components/Detail/VeganRecipeDetail";
import FavoriteRecipeDetail from "./components/Detail/FavoriteRecipeDetail";
import FavoritePastryDetail from "./components/Detail/FavoritePastryDetail";

import Menu from "./components/Menu";
import InterstitialAdManager from "./components/ads/InterstitialAdManager";

const Stack = createStackNavigator();

// ============================================================
// 🔑 GOOGLE SIGN-IN (GLOBAL)
// ============================================================
GoogleSignin.configure({
  webClientId:
    "409946165927-k9u22r4jj9epr83f903d3ojdlnih12ee.apps.googleusercontent.com",
  offlineAccess: false,
});

// ============================================================
// FRASES SPLASH
// ============================================================
const SPLASH_PHRASES = [
  "Preparando tu cocina virtual 🍳",
  "Afilando los cuchillos 🔪",
  "Calentando los sartenes 🔥",
  "Revisando recetas favoritas 📖",
  "Ordenando la despensa 🧺",
  "Emplatando la experiencia ✨",
  "Cargando sabores increíbles 😋",
  "El chef está probando la salsa 🍝",
];

// ============================================================
// APP CONTENT
// ============================================================
const AppContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigationRef = useNavigationContainerRef();

  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<string | null>(null);

 

  const phrase =
    SPLASH_PHRASES[Math.floor(Math.random() * SPLASH_PHRASES.length)];

  // ============================================================
  // 🔐 AUTH + WATCHDOG
  // ============================================================
  useEffect(() => {
    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, async (user) => {


      setFirebaseUser(user);

      // ---------------- LOGOUT ----------------
      if (!user) {
        dispatch(clearSubRedux());
        dispatch(clearFavorites());
        dispatch(setPremium(false));
        dispatch(setPlan({ planId: null, favoritesLimit: 10 }));
        dispatch(setMaxFavorites(10));
        dispatch(setSubscriptionResolved());
        setInitializing(false);
        return;
      }

      // ---------------- USER ----------------
      dispatch(
        setUser({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        })
      );

      // ---------------- SUBS ----------------
      const sub = await checkSubscriptionStatus(user.uid, dispatch);

      if (sub) {
        dispatch(setPremium(true));
        dispatch(setPlan(sub));
        dispatch(setMaxFavorites(sub.favoritesLimit));
        dispatch(
          setSubscriptionUI({
            id: sub.planId,
            name: sub.planName,
            price: sub.pricePaid,
            currency: sub.currency,
            expiresAt: sub.expiresAt,
          })
        );
      }

      dispatch(setSubscriptionResolved());

      // ---------------- 🔁 WATCHDOG 14 DÍAS ----------------
      try {
        const expired = await isRefreshExpired();
        if (expired) {
          await clearAllJsonCache();
          await downloadAllJson();
          await markRefreshDone();
        }
      } catch (e) {
        console.log("❌ Watchdog error:", e);
      }

      setInitializing(false);
    });

    return () => unsub();
  }, [dispatch]);

  // ============================================================
  // SPLASH INICIAL (CON FRASES)
  // ============================================================
  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
          paddingHorizontal: 20,
        }}
      >
        <Image
          source={require("./assets/usedImages/Logo.png")}
          style={{ width: 140, height: 140, marginBottom: 25 }}
          resizeMode="contain"
        />

        <ActivityIndicator size="large" color="#40E0D0" />

        <Text style={{ color: "#aaa", marginTop: 15, fontSize: 16 }}>
          Cargando sesión…
        </Text>

        <Text
          style={{
            color: "#777",
            marginTop: 10,
            fontSize: 13,
            textAlign: "center",
          }}
        >
          {phrase}
        </Text>
      </View>
    );
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() =>
        setCurrentRoute(navigationRef.getCurrentRoute()?.name ?? null)
      }
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!firebaseUser ? (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        ) : (
          <Stack.Screen name="Home" component={HomeScreen} />
        )}

        <Stack.Screen name="TechniqueDetails" component={TechniqueDetails} />
        <Stack.Screen name="MainDishRecipeDetail" component={MainDishRecipeDetail} />
        <Stack.Screen name="PastryRecipeDetail" component={PastryRecipeDetail} />
        <Stack.Screen name="PanaderiaRecipeDetail" component={PanaderiaRecipeDetail} />
        <Stack.Screen name="SalsaRecipeDetail" component={SalsaRecipeDetail} />
        <Stack.Screen name="SaladRecipeDetail" component={SaladRecipeDetail} />
        <Stack.Screen name="SoupRecipeDetail" component={SoupRecipeDetail} />
        <Stack.Screen name="DrinkRecipeDetail" component={DrinkRecipeDetail} />
        <Stack.Screen name="VeganRecipeDetail" component={VeganRecipeDetail} />
        <Stack.Screen name="FavoriteRecipeDetail" component={FavoriteRecipeDetail} />
        <Stack.Screen name="FavoritePastryDetail" component={FavoritePastryDetail} />
        <Stack.Screen name="Menu" component={Menu} />
      </Stack.Navigator>

      {firebaseUser && currentRoute && currentRoute !== "Loading" && (
        <InterstitialAdManager currentRoute={currentRoute} />
      )}
    </NavigationContainer>
  );
};

// ============================================================
// ROOT
// ============================================================
const App = () => (
  <Provider store={store}>
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  </Provider>
);

export default App;
