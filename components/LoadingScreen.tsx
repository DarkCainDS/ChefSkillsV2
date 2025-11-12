import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/Index";
import { setUser, setPremium, setSubscriptionResolved } from "../store/Slices/userSlice";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { checkSubscriptionStatus } from "../services/subscriptionService";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const LoadingScreen = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadingImages = [
    require("../assets/LoadingImages/1.webp"),
    require("../assets/LoadingImages/2.webp"),
    require("../assets/LoadingImages/3.webp"),
    require("../assets/LoadingImages/4.webp"),
    require("../assets/LoadingImages/5.webp"),
    require("../assets/LoadingImages/6.webp"),
    require("../assets/LoadingImages/7.webp"),
    require("../assets/LoadingImages/8.webp"),
    require("../assets/LoadingImages/9.webp"),
    require("../assets/LoadingImages/10.webp"),
    require("../assets/LoadingImages/11.webp"),
    require("../assets/LoadingImages/12.webp"),
    require("../assets/LoadingImages/13.webp"),
    require("../assets/LoadingImages/14.webp"),
    require("../assets/LoadingImages/15.webp"),
    require("../assets/LoadingImages/16.webp"),
    require("../assets/LoadingImages/17.webp"),
    require("../assets/LoadingImages/18.webp"),
    require("../assets/LoadingImages/19.webp"),
    require("../assets/LoadingImages/20.webp"),
    require("../assets/LoadingImages/21.webp"),
    require("../assets/LoadingImages/22.webp"),
    require("../assets/LoadingImages/23.webp"),
    require("../assets/LoadingImages/24.webp"),
    require("../assets/LoadingImages/25.webp"),
  ];

  const [backgroundImage, setBackgroundImage] = useState(loadingImages[0]);

  // 🎨 Fondo aleatorio + fade
  useEffect(() => {
    const random = Math.floor(Math.random() * loadingImages.length);
    setBackgroundImage(loadingImages[random]);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // 🔹 Configurar Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "409946165927-k9u22r4jj9epr83f903d3ojdlnih12ee.apps.googleusercontent.com",
      offlineAccess: false,
    });
  }, []);

  // 🧾 Crear o actualizar documento del usuario
  const createOrUpdateUser = async (user: any) => {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        name: user.displayName || null,
        email: user.email || null,
        photo: user.photoURL || null,
        isPremium: false,
        level: 1,
        exp: 0,
        nextLevelExp: 100,
        rankTitle: "Cocinero Principiante",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("👤 Usuario creado en Firestore");
    } else {
      await setDoc(ref, { updatedAt: serverTimestamp() }, { merge: true });
    }
  };

  // 🚀 Inicio de sesión + verificación de suscripción
  const signInWithGoogle = async () => {
    setLoading(true);
    setMessage("Iniciando sesión con Google...");
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.idToken || userInfo.data?.idToken;
      if (!idToken) throw new Error("No se pudo obtener idToken de Google");

      const auth = getAuth();
      const credential = GoogleAuthProvider.credential(idToken);
      const firebaseUser = (await signInWithCredential(auth, credential)).user;

      await createOrUpdateUser(firebaseUser);

      // 🧭 Guardar usuario en Redux
      dispatch(
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || null,
          photo: firebaseUser.photoURL || null,
          email: firebaseUser.email || null,
        })
      );

      // ⚙️ Verificar suscripción
      setMessage("Verificando suscripción...");
      const subData = await checkSubscriptionStatus(firebaseUser.uid, dispatch);
      console.log("🔎 subData (login):", subData);

      const premiumStatus = !!(subData?.isActive);
      dispatch(setPremium(premiumStatus));

      // 💾 Guardar en cache o limpiar
      if (subData) {
        await AsyncStorage.setItem("subscriptionData", JSON.stringify(subData));
      } else {
        await AsyncStorage.removeItem("subscriptionData");
      }

      dispatch(setSubscriptionResolved()); // <- Marca verificación completa
      setMessage("¡Sesión iniciada con éxito! 🚀");

      // ✅ App.tsx redirige automáticamente según usuario logueado
    } catch (error: any) {
      console.error("[ERROR] Google Sign-In:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED)
        setMessage("Inicio cancelado por el usuario.");
      else if (error.code === statusCodes.IN_PROGRESS)
        setMessage("Inicio ya en progreso.");
      else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
        setMessage("Google Play Services no disponible.");
      else setMessage(error.message || "Error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <AnimatedImageBackground
        source={backgroundImage}
        style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}
        resizeMode="cover"
      />
      <View style={styles.innerContainer}>
        {loading ? (
          <>
            <Text style={styles.loadingText}>{message || "Cargando..."}</Text>
            <ActivityIndicator size="large" color="#40E0D0" style={{ marginTop: 20 }} />
          </>
        ) : (
          <Pressable style={styles.loginButton} onPress={signInWithGoogle}>
            <Text style={styles.loginText}>Iniciar sesión con Google</Text>
          </Pressable>
        )}
        {message ? <Text style={styles.messageText}>{message}</Text> : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 4,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  messageText: {
    color: "white",
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default LoadingScreen;
