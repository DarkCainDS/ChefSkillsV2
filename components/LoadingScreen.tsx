import React, { useEffect, useRef, useState, useMemo } from "react";
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
import { 
  GoogleSignin, 
  statusCodes 
} from "@react-native-google-signin/google-signin";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

const AnimatedBG = Animated.createAnimatedComponent(ImageBackground);

// --- Constantes fuera del componente para mejor rendimiento ---
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

const IMAGES = [
  require("../assets/LoadingImages/1.webp"),
  require("../assets/LoadingImages/2.webp"),
  require("../assets/LoadingImages/3.webp"),
  require("../assets/LoadingImages/4.webp"),
  require("../assets/LoadingImages/5.webp"),
];

const LoadingScreen = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  
  // Memorizamos la frase y el fondo para que no cambien si el componente se re-renderiza por otra razón
  const phrase = useMemo(() => PHRASES[Math.floor(Math.random() * PHRASES.length)], []);
  const bg = useMemo(() => IMAGES[Math.floor(Math.random() * IMAGES.length)], []);

  const fadeBG = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  // Animación de entrada del fondo
  useEffect(() => {
    Animated.timing(fadeBG, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeBG]);

  // Animación sincronizada de texto y barra de progreso
  useEffect(() => {
    if (loading) {
      textAnim.setValue(0);
      Animated.parallel([
        Animated.timing(textAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: STEP_PROGRESS[step],
          duration: 600,
          useNativeDriver: false, // Layout properties no soportan native driver
        }),
      ]).start();
    }
  }, [step, loading, progress, textAnim]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setStep(0);
      progress.setValue(0);

      // 1. Verificar Play Services (Con diálogo de actualización forzado)
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      
      setStep(1);

      // 2. Sign In y obtención de idToken (Destructuring directo como sugeriste)
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;

      if (!idToken) throw new Error("ID_TOKEN_MISSING");

      setStep(2);

      // 3. Credencial de Firebase
      const credential = GoogleAuthProvider.credential(idToken);
      
      setStep(3); // Paso intermedio de "Cargando recetas"
      
      await signInWithCredential(getAuth(), credential);

      // 4. Éxito total
      setStep(4);
      
    } catch (error: any) {
      setLoading(false);
      setStep(0);

      // Manejo de errores específicos de Google Sign In
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Usuario canceló el inicio de sesión");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("La operación ya está en curso");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.warn("Play Services no disponibles");
      } else {
        console.error("LOGIN ERROR DETALLADO:", error);
      }
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
          outputRange: [10, 0],
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
          <View style={styles.welcomeContent}>
             <Text style={styles.title}>ChefSkills</Text>
             <Text style={styles.subtitle}>Tu asistente culinario inteligente</Text>
             <Pressable 
               style={({ pressed }) => [
                 styles.button, 
                 { opacity: pressed ? 0.8 : 1 }
               ]} 
               onPress={signInWithGoogle}
             >
               <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
             </Pressable>
          </View>
        ) : (
          <View style={styles.loadingContent}>
            <Animated.Text style={[styles.text, textStyle]}>
              {STEPS[step]}
            </Animated.Text>

            <Text style={styles.subText}>{phrase}</Text>

            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, { width: progressWidth }]}
              />
            </View>
          </View>
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
    backgroundColor: "rgba(0,0,0,0.6)", // Un poco más oscuro para que el texto resalte
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  welcomeContent: {
    alignItems: 'center',
  },

  loadingContent: {
    width: '100%',
    alignItems: 'center',
  },

  title: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 2,
  },

  subtitle: {
    color: '#eee',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },

  text: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600",
  },

  subText: {
    color: "#cfefff",
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
    fontStyle: 'italic',
  },

  button: {
    backgroundColor: "#4285F4",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#40E0D0",
  },
});