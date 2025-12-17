// LoadingScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

const AnimatedBG = Animated.createAnimatedComponent(ImageBackground);

const STEPS = [
  "Conectando con Google…",
  "Validando sesión…",
  "Preparando tu cocina…",
  "Cargando recetas…",
  "¡Todo listo!",
];

const LoadingScreen = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  // ------------------------------------------------------------
  // Fondo random
  // ------------------------------------------------------------
  const images = [
    require("../assets/LoadingImages/1.webp"),
    require("../assets/LoadingImages/2.webp"),
    require("../assets/LoadingImages/3.webp"),
    require("../assets/LoadingImages/4.webp"),
    require("../assets/LoadingImages/5.webp"),
  ];
  const bg = images[Math.floor(Math.random() * images.length)];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // ------------------------------------------------------------
  // PROGRESO FAKE (UX)
  // ------------------------------------------------------------
  const startProgress = () => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 2800,
      useNativeDriver: false,
    }).start();
  };

  // ------------------------------------------------------------
  // LOGIN GOOGLE
  // ------------------------------------------------------------
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setStep(0);
      startProgress();

      await GoogleSignin.hasPlayServices();
      setStep(1);

      const result = await GoogleSignin.signIn();
      const idToken = result.data.idToken;
      if (!idToken) throw new Error("ID TOKEN VACÍO");

      setStep(2);

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(getAuth(), credential);

      setStep(4);
    } catch (e: any) {
      console.warn("LOGIN ERROR:", e);
      setLoading(false);
      setStep(0);
    }
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <AnimatedBG
        source={bg}
        resizeMode="cover"
        style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}
      />

      <View style={styles.overlay} />

      <View style={styles.center}>
        {!loading ? (
          <Pressable style={styles.button} onPress={signInWithGoogle}>
            <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
          </Pressable>
        ) : (
          <>
            <Text style={styles.text}>{STEPS[step]}</Text>

            {/* PROGRESS BAR */}
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, { width: progressWidth }]}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default LoadingScreen;

// ------------------------------------------------------------
// STYLES
// ------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  text: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    elevation: 6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#40E0D0",
    borderRadius: 10,
  },
});
