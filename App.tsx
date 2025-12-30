import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, View, Text, Image } from "react-native";
import { Provider, useDispatch } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { purchaseUpdatedListener, purchaseErrorListener } from 'react-native-iap';

import store, { AppDispatch } from "./store/Index";
import { setUser, setPlan, setPremium, setSubscriptionResolved } from "./store/Slices/userSlice";
import { unsubscribe as clearSubRedux, subscribePlan as setSubscriptionUI } from "./store/Slices/subscriptionSlice";
import { setMaxFavorites, clearFavorites } from "./store/Slices/FavoriteSlice";
import { checkSubscriptionStatus } from "./services/subscriptionService";
import { isRefreshExpired, clearAllJsonCache, downloadAllJson, markRefreshDone } from "./utils/watchdog";
import { initBilling, acknowledgePurchase, endBilling } from "./services/billingService";

// Pantallas
import HomeScreen from "./components/HomeScreen";
import LoadingScreen from "./components/LoadingScreen";
import Menu from "./components/Menu";
import InterstitialAdManager from "./components/ads/InterstitialAdManager";

// Detalle de Recetas (Importaciones simplificadas para el ejemplo)
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

const Stack = createStackNavigator();

GoogleSignin.configure({
  webClientId: "409946165927-k9u22r4jj9epr83f903d3ojdlnih12ee.apps.googleusercontent.com",
  offlineAccess: false,
});

const SPLASH_PHRASES = [
  "Preparando tu cocina virtual 🍳", "Afilando los cuchillos 🔪",
  "Calentando los sartenes 🔥", "Revisando recetas favoritas 📖",
  "Ordenando la despensa 🧺", "Emplatando la experiencia ✨"
];

const AppContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigationRef = useNavigationContainerRef();

  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [phrase] = useState(SPLASH_PHRASES[Math.floor(Math.random() * SPLASH_PHRASES.length)]);

  // 1️⃣ PASO 1: Detectar Usuario (Firebase Auth)
  useEffect(() => {
    const auth = getAuth();
    
    // Plan B: Si en 8 segundos Firebase no responde, forzamos la entrada
    const safetyTimeout = setTimeout(() => {
      if (initializing) {
        console.log("⚠️ Auth tardó demasiado, forzando arranque...");
        setInitializing(false);
      }
    }, 8000);

    const unsub = onAuthStateChanged(auth, (user) => {
      clearTimeout(safetyTimeout);
      setFirebaseUser(user);
      setProgress(30); // 30% - Ya sabemos quién eres
      if (!user) setInitializing(false);
    });

    return () => {
      unsub();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // 2️⃣ PASO 2: Cargar Datos Pesados (Solo si hay usuario)
  useEffect(() => {
    if (!firebaseUser) return;

    const prepareAppData = async () => {
      try {
        // Redux User
        dispatch(setUser({
          uid: firebaseUser.uid, name: firebaseUser.displayName,
          email: firebaseUser.email, photo: firebaseUser.photoURL,
        }));
        setProgress(50);

        // Suscripciones
        const sub = await checkSubscriptionStatus(firebaseUser.uid, dispatch);
        if (sub) {
          dispatch(setPremium(true));
          dispatch(setPlan(sub));
          dispatch(setSubscriptionUI({
            id: sub.planId, name: sub.planName, price: sub.pricePaid,
            currency: sub.currency, expiresAt: sub.expiresAt,
          }));
        }
        dispatch(setSubscriptionResolved());
        setProgress(75);

        // Watchdog (JSONs)
        const expired = await isRefreshExpired();
        if (expired) {
          await clearAllJsonCache();
          await downloadAllJson();
          await markRefreshDone();
        }
        
        setProgress(100);
      } catch (e) {
        console.log("Error cargando datos:", e);
      } finally {
        // Pequeño delay para que se vea el 100%
        setTimeout(() => setInitializing(false), 500);
      }
    };

    prepareAppData();
  }, [firebaseUser, dispatch]);

  // 3️⃣ SERVICIOS (Audio e IAP)
  useEffect(() => {
    initBilling();
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        });
      } catch (e) { console.log("Audio error:", e); }
    };
    setupAudio();

    return () => endBilling();
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000", paddingHorizontal: 24 }}>
        <Image source={require("./assets/usedImages/Logo.png")} style={{ width: 140, height: 140, marginBottom: 30 }} resizeMode="contain" />
        <ActivityIndicator size="large" color="#40E0D0" />
        <Text style={{ color: "#ddd", marginTop: 18, fontSize: 16, fontWeight: "500" }}>Iniciando ChefSkills…</Text>
        <Text style={{ color: "#8fdde5", marginTop: 8, fontSize: 13, textAlign: "center" }}>{phrase}</Text>
        
        {/* BARRA DE CARGA */}
        <View style={{ width: "75%", height: 8, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10, marginTop: 25, overflow: "hidden" }}>
          <View style={{ width: `${progress}%`, height: "100%", backgroundColor: "#40E0D0" }} />
        </View>
        <Text style={{ color: "#40E0D0", marginTop: 10, fontSize: 11 }}>{progress}%</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} onStateChange={() => setCurrentRoute(navigationRef.getCurrentRoute()?.name ?? null)}>
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
      {firebaseUser && currentRoute && currentRoute !== "Loading" && <InterstitialAdManager currentRoute={currentRoute} />}
    </NavigationContainer>
  );
};

const App = () => (
  <Provider store={store}>
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  </Provider>
);

export default App;