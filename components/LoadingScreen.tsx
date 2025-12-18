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
  "Conectando con Google… 🔐",
  "Validando sesión…",
  "Preparando tu cocina… 🔥",
  "Cargando recetas… 📦",
  "¡Todo listo! 👨‍🍳✨",
];

const PHRASES = [
  "Afilando cuchillos virtuales 🔪",
  "Encendiendo los fogones 🔥",
  "Revisando la despensa 📦",
  "Probando la salsa… 👨‍🍳",
  "Sirviendo el plato 🍽️",
];

const STEP_PROGRESS = [0.15, 0.35, 0.6, 0.85, 1];

const LoadingScreen = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [phrase] = useState(
    PHRASES[Math.floor(Math.random() * PHRASES.length)]
  );

  const fadeBG = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  const images = [
    require("../assets/LoadingImages/1.webp"),
    require("../assets/LoadingImages/2.webp"),
    require("../assets/LoadingImages/3.webp"),
    require("../assets/LoadingImages/4.webp"),
    require("../assets/LoadingImages/5.webp"),
  ];
  const bg = images[Math.floor(Math.random() * images.length)];

  useEffect(() => {
    Animated.timing(fadeBG, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    textAnim.setValue(0);
    Animated.timing(textAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    Animated.timing(progress, {
      toValue: STEP_PROGRESS[step],
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setStep(0);
      progress.setValue(0);

      await GoogleSignin.hasPlayServices();
      setStep(1);

      const result = await GoogleSignin.signIn();
      const idToken = result.data.idToken;
      if (!idToken) throw new Error("ID TOKEN VACÍO");

      setStep(2);

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(getAuth(), credential);

      setStep(4);
    } catch (e) {
      console.warn("LOGIN ERROR:", e);
      setLoading(false);
      setStep(0);
    }
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const textStyle = {
    opacity: textAnim,
    transform: [
      {
        translateY: textAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <AnimatedBG
        source={bg}
        resizeMode="cover"
        style={[StyleSheet.absoluteFillObject, { opacity: fadeBG }]}
      />

      <View style={styles.overlay} />

      <View style={styles.center}>
        {!loading ? (
          <Pressable style={styles.button} onPress={signInWithGoogle}>
            <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
          </Pressable>
        ) : (
          <>
            <Animated.Text style={[styles.text, textStyle]}>
              {STEPS[step]}
            </Animated.Text>

            <Text style={styles.subText}>{phrase}</Text>

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

const styles = StyleSheet.create({
  container: { flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
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
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600",
  },

  subText: {
    color: "#cfefff",
    fontSize: 14,
    marginBottom: 18,
    textAlign: "center",
    opacity: 0.9,
  },

  button: {
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 34,
    borderRadius: 14,
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
