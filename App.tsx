// App.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, Image } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { GoogleSignin } from "@react-native-google-signin/google-signin";  // ⭐ IMPORTANTE

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
import FavoritePastryDetail from "./components/Detail/FavoritePastryDetail";

import Menu from "./components/Menu";

// ADS
import InterstitialAdManager from "./components/ads/InterstitialAdManager";
import VeganRecipeDetail from "./components/Detail/VeganRecipeDetail";



import { watchdogCheck, clearAllJsonCache, downloadAllJson, markVersion } 
from "./utils/cache/cacheManager";


const Stack = createStackNavigator();

// ============================================================
//   ⭐ GOOGLE SIGN-IN CONFIGURADO GLOBALMENTE
// ============================================================
GoogleSignin.configure({
  webClientId:
    "409946165927-k9u22r4jj9epr83f903d3ojdlnih12ee.apps.googleusercontent.com",
  offlineAccess: true,
});

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

  const frases = [
    "Quizá estamos batiendo algo 👨‍🍳✨",
    "Preparando tu cocina virtual 🔧🔥",
    "Cargando tus recetas favoritas 🍲💙",
    "Nuestro chef está ajustando el horno 🍞🔥",
    "Si tarda mucho, quizá el internet se fue a cocinar 🍳",
    "Calentando los sartenes... con cariño 🥘💖",
    "Amasando los últimos detalles 🍞👐",
    "Cortando vegetales imaginarios 🥕🔪",
    "Removiendo bits y bytes a fuego lento 💻🍲",
    "Preparando un menú digno de ti 👑✨",
    "Sazonando la experiencia... casi listo 🌿🔥",
    "El chef pidió un minuto para probar la salsa 🍝😌",
    "Precalentando tu aventura culinaria 🔥🍽️",
    "Agitando la olla mágica... paciencia 🪄🍲",
    "Verificando que no se queme el código 🔥💻😂",
  ];


// ============================================================
// WATCHDOG GLOBAL (14 días o primer uso)
// ============================================================
useEffect(() => {
  const runWatchdog = async () => {
    try {
      const result = await watchdogCheck();

      if (result.action === "RESET") {
        console.log("🛑 Watchdog: Se requiere refresco completo.");

        // 1. Borrar JSON viejos
        await clearAllJsonCache();

        // 2. Guardar nueva versión para romper caché de imágenes
        await markVersion(result.newVersion);

        // 3. Marcar para que LoadingScreen descargue TODO
        await AsyncStorage.setItem("CS_FORCE_FULL_REFRESH", "1");

        // 4. FORZAR NAVEGACIÓN A LOADING
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "Loading" }],
        });

        return; // detener flujo normal
      }

      console.log("⏳ Watchdog: No necesita refresco.");
    } catch (e) {
      console.log("❌ Error en watchdog global:", e);
    }
  };

  runWatchdog();
}, []);


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
        dispatch(setPremium(false));
        dispatch(setPlan({ planId: null, favoritesLimit: 10 }));
        dispatch(setMaxFavorites(10));
        await AsyncStorage.removeItem("subscriptionData");
      } else {
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
  // LOADING SCREEN
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
        <Text style={{ color: "white", marginTop: 15, fontSize: 16 }}>
          Cargando sesión...
        </Text>
        <Text
          style={{
            color: "#aaaaaa",
            marginTop: 10,
            fontSize: 12,
            textAlign: "center",
            lineHeight: 16,
          }}
        >
          {frases[Math.floor(Math.random() * frases.length)]}
        </Text>
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
        <Stack.Screen name="VeganRecipeDetail" component={VeganRecipeDetail} />
        <Stack.Screen name="FavoriteRecipeDetail" component={FavoriteRecipeDetail} />
        <Stack.Screen name="FavoritePastryDetail" component={FavoritePastryDetail} />
        <Stack.Screen name="Menu" component={Menu} />
      </Stack.Navigator>

      {firebaseUser && currentRouteName !== "Loading" && (
        <InterstitialAdManager currentRoute={currentRouteName} />
      )}

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
