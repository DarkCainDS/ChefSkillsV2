import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { CommonActions, useIsFocused } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { app } from "../services/firebaseConfig";
import { AppDispatch, RootState } from "../store/Index";
import { clearUser } from "../store/Slices/userSlice";

import CSHeader from "../components/CSHeader";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/* ============================================================================================
   📌 RESPONSIVE HELPERS (proporcional tipo iPhone XR)
============================================================================================ */

const guidelineBaseWidth = 414;   // iPhone XR ancho
const guidelineBaseHeight = 896;  // iPhone XR alto

const scaleW = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const scaleH = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
const scaleFont = (size: number) => size * (SCREEN_WIDTH / guidelineBaseWidth);

/* ============================================================================================
   🔥 LAVA BACKGROUND + PARTICLES
============================================================================================ */

const LavaBackground = () => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const intensity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });

  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        key: `spark-${i}`,
        left: Math.random() * SCREEN_WIDTH,
        delay: i * 250,
      })),
    []
  );

  const ashes = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        key: `ash-${i}`,
        left: Math.random() * SCREEN_WIDTH,
        delay: i * 400,
      })),
    []
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#000000", "#1a0000", "#330000", "#601000", "#ff3d00"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: intensity }]}>
        <LinearGradient
          colors={["rgba(255,100,0,0.2)", "rgba(255,50,0,0.15)", "rgba(255,0,0,0.1)"]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {sparks.map(({ key, left, delay }) => (
        <Spark key={key} left={left} delay={delay} />
      ))}
      {ashes.map(({ key, left, delay }) => (
        <Ash key={key} left={left} delay={delay} />
      ))}
    </View>
  );
};

const Spark = ({ left, delay }: any) => {
  const anim = useRef(new Animated.Value(0)).current;
  const size = scaleW(2 + Math.random() * 3);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 7000 + Math.random() * 4000,
          delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT + 60, -200],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 0.9, 0],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left,
        bottom: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#ff9100",
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
};

const Ash = ({ left, delay }: any) => {
  const anim = useRef(new Animated.Value(0)).current;
  const size = scaleW(1.5 + Math.random() * 2);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 10000 + Math.random() * 5000,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, SCREEN_HEIGHT + 100],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.3, 0.8, 1],
    outputRange: [0, 0.3, 0.5, 0],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left,
        top: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#aaa",
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
};

/* ============================================================================================
   🔥 SUBSCRIPTION TIMER
============================================================================================ */

const SubscriptionTimer = () => {
  const isFocused = useIsFocused();
  const [remaining, setRemaining] = useState<any>(null);
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem("subscriptionData");
      if (!data) {
        setRemaining(null);
        return;
      }

      const sub = JSON.parse(data);
      setPlanName(sub.planName);

      const update = () => {
        const expiresAt = new Date(sub.expiresAt).getTime();
        const diff = expiresAt - Date.now();
        if (diff <= 0) return setRemaining(null);

        setRemaining({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      };

      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    };

    if (isFocused) load();
  }, [isFocused]);

  if (!remaining)
    return (
      <View style={styles.timerCard}>
        <Text style={[styles.timerLabel, { color: "#ff784e" }]}>No suscrito</Text>
        <Text style={styles.timerSub}>Activa ChefSkills+</Text>
      </View>
    );

  return (
    <LinearGradient
      colors={["rgba(255, 90, 0, 0.25)", "rgba(255, 50, 0, 0.1)"]}
      style={styles.timerCard}
    >
      <Text style={styles.timerLabel}>🔥 {planName} activo</Text>
      <Text style={styles.timerSub}>
        {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
      </Text>
    </LinearGradient>
  );
};

/* ============================================================================================
   🔥 MAIN MENU
============================================================================================ */

const Menu_LavaElite_ParticlesV6_Ultra = ({ navigation }) => {
  const [logoutImage, setLogoutImage] = useState(require("../assets/Logout/1.webp"));
  const [showDialog, setShowDialog] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const modalAnim = useRef(new Animated.Value(0.7)).current;
  const auraAnim = useRef(new Animated.Value(0)).current;
  const confirmScale = useRef(new Animated.Value(1)).current;

  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const auth = getAuth(app);

  useEffect(() => {
    const imgs = [
      require("../assets/Logout/1.webp"),
      require("../assets/Logout/2.webp"),
      require("../assets/Logout/3.webp"),
      require("../assets/Logout/4.webp"),
    ];
    setLogoutImage(imgs[Math.floor(Math.random() * imgs.length)]);
  }, []);

  /* Animation when dialog is opened */
  useEffect(() => {
    if (showDialog) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(modalAnim, { toValue: 1.05, duration: 220, useNativeDriver: true }),
          Animated.spring(modalAnim, { toValue: 1, useNativeDriver: true }),
        ]),
        Animated.loop(
          Animated.sequence([
            Animated.timing(auraAnim, { toValue: 1, duration: 900, useNativeDriver: false }),
            Animated.timing(auraAnim, { toValue: 0.3, duration: 900, useNativeDriver: false }),
          ])
        ),
      ]).start();
    } else {
      modalAnim.setValue(0.7);
      auraAnim.setValue(0);
    }
  }, [showDialog]);

  const handleLogout = async () => {
    setShowDialog(false);
    setLoadingLogout(true);
    try {
      await signOut(auth);
      await GoogleSignin.signOut();
      dispatch(clearUser());
      await AsyncStorage.clear();
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Loading" }] }));
    } catch (e) {
      console.error("Logout Error:", e);
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LavaBackground />

      <CSHeader title="Menú" />

      <SafeAreaView style={styles.container}>
        {/* USER INFO */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Animated.View style={[styles.glowAura]} />
            <Image
              source={user?.photo ? { uri: user.photo } : require("../assets/usedImages/Unkown.png")}
              style={styles.avatar}
            />
          </View>

          <View style={[styles.badge, { backgroundColor: user?.isPremium ? "#ff5722" : "#455a64" }]}>
            <Text style={styles.badgeText}>{user?.isPremium ? "🔥 Premium" : "🧊 Free"}</Text>
          </View>

          <Text style={styles.name}>{user?.name || "Chef Volcánico"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <SubscriptionTimer />

        {/* LOGOUT BUTTON */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity onPress={() => setShowDialog(true)} style={styles.logoutButton}>
            <Image source={logoutImage} style={styles.logoutImage} resizeMode="contain" />
            <LinearGradient
              colors={["#ff3d00", "#ff9100", "#ff3d00"]}
              style={styles.logoutGradient}
            >
              <Text style={styles.logoutLabel}>Cerrar sesión</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* LOGOUT MODAL */}
        <Modal transparent visible={showDialog} animationType="fade">
          <View style={styles.overlay}>
            <Animated.View style={[styles.dialog, { transform: [{ scale: modalAnim }] }]}>
              <Animated.View
                style={[
                  styles.lavaAura,
                  {
                    opacity: auraAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.9] }),
                    transform: [
                      {
                        scale: auraAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.98, 1.04],
                        }),
                      },
                    ],
                  },
                ]}
              />

              <View style={styles.iconCircle}>
                <MaterialIcons name="logout" size={scaleW(48)} color="#ff8a65" />
              </View>

              <Text style={styles.dialogTitle}>¿Cerrar sesión?</Text>

              <LinearGradient
                colors={["#ff8a65", "#ff5722", "#ff8a65"]}
                style={styles.divider}
              />

              <Text style={styles.dialogText}>Antes de salir recuerda:</Text>

              <View style={styles.bulletList}>
                <Text style={styles.bullet}>• Suscripción activa</Text>
                <Text style={styles.bullet}>• Tu progreso se mantiene</Text>
                <Text style={styles.bullet}>• Favoritos locales limpiados</Text>
              </View>

              <View style={styles.dialogButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDialog(false)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.confirmBtn} onPress={handleLogout} disabled={loadingLogout}>
                  <Text style={styles.confirmText}>
                    {loadingLogout ? "Cerrando..." : "Cerrar sesión"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
};

/* ============================================================================================
   🎨 STYLES (RESPONSE-ADJUSTED)
============================================================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scaleH(40),
  },

  header: { alignItems: "center" },

  avatarWrapper: {
    width: scaleW(120),
    height: scaleW(120),
    borderRadius: scaleW(60),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scaleH(10),
  },

  glowAura: {
    position: "absolute",
    width: scaleW(140),
    height: scaleW(140),
    borderRadius: scaleW(70),
    backgroundColor: "rgba(255,80,0,0.2)",
  },

  avatar: {
    width: scaleW(110),
    height: scaleW(110),
    borderRadius: scaleW(55),
    borderWidth: 2,
    borderColor: "#ff6a00",
  },

  badge: {
    borderRadius: scaleW(12),
    paddingVertical: scaleH(4),
    paddingHorizontal: scaleW(12),
    marginTop: scaleH(10),
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: scaleFont(14),
  },

  name: {
    color: "#ffe0b2",
    fontSize: scaleFont(22),
    fontWeight: "700",
    marginTop: scaleH(8),
  },

  email: {
    color: "#ffbfa4",
    fontSize: scaleFont(14),
    marginBottom: scaleH(10),
  },

  timerCard: {
    borderRadius: scaleW(20),
    paddingVertical: scaleH(15),
    paddingHorizontal: scaleW(25),
    alignItems: "center",
    marginTop: scaleH(15),
    borderWidth: 1,
    borderColor: "rgba(255,90,0,0.4)",
  },

  timerLabel: {
    color: "#ffab91",
    fontWeight: "700",
    fontSize: scaleFont(16),
    marginBottom: scaleH(5),
  },

  timerSub: {
    color: "#ffcbb2",
    fontSize: scaleFont(14),
  },

  logoutContainer: { alignItems: "center" },

  logoutButton: { alignItems: "center" },

  logoutImage: {
    width: scaleW(80),
    height: scaleW(80),
    marginBottom: scaleH(5),
  },

  logoutGradient: {
    borderRadius: scaleW(10),
    paddingVertical: scaleH(10),
    paddingHorizontal: scaleW(20),
  },

  logoutLabel: {
    color: "#fff",
    fontSize: scaleFont(16),
    fontWeight: "700",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },

  dialog: {
    backgroundColor: "rgba(25,10,10,0.95)",
    borderRadius: scaleW(25),
    padding: scaleW(30),
    width: "80%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,80,0,0.8)",
  },

  lavaAura: {
    position: "absolute",
    top: -scaleH(30),
    bottom: -scaleH(30),
    left: -scaleW(30),
    right: -scaleW(30),
    borderRadius: scaleW(35),
  },

  iconCircle: {
    width: scaleW(90),
    height: scaleW(90),
    borderRadius: scaleW(45),
    backgroundColor: "rgba(255,60,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scaleH(10),
    borderWidth: 2,
    borderColor: "#ff7043",
  },

  divider: {
    width: "85%",
    height: scaleH(3),
    borderRadius: scaleW(20),
    marginVertical: scaleH(12),
  },

  dialogTitle: {
    fontSize: scaleFont(22),
    fontWeight: "800",
    color: "#ffe0b2",
  },

  dialogText: {
    color: "#ffbfa4",
    textAlign: "center",
    fontSize: scaleFont(15),
    marginBottom: scaleH(10),
  },

  bulletList: {
    width: "100%",
    paddingHorizontal: scaleW(10),
    marginBottom: scaleH(20),
    gap: scaleH(6),
  },

  bullet: {
    color: "#ffcbb2",
    fontSize: scaleFont(14),
    lineHeight: scaleH(20),
  },

  dialogButtons: { flexDirection: "row", gap: scaleW(10) },

  cancelBtn: {
    backgroundColor: "#333",
    borderRadius: scaleW(10),
    paddingVertical: scaleH(12),
    paddingHorizontal: scaleW(24),
  },
  cancelText: {
    color: "#ff8a65",
    fontWeight: "600",
    fontSize: scaleFont(15),
  },

  confirmBtn: {
    backgroundColor: "#ff3d00",
    borderRadius: scaleW(10),
    paddingVertical: scaleH(12),
    paddingHorizontal: scaleW(24),
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: scaleFont(15),
  },
});

export default Menu_LavaElite_ParticlesV6_Ultra;

/*
7	Chef Arcade	Retro 8-bit pixelado.	🕹️ Naranja, violeta, negro.	Inspirado en Donkey Kong o Kirby — botones pixel, tipografía 8bit, Chefy animado saltando.
8	Ocean Breeze	Acuático y fresco, con ondas animadas.	🌊 Azul claro, verde agua, blanco.	Gradiente de mar con partículas tipo burbujas ascendiendo, suave movimiento del fondo.
9	Lava Elite	Oscuro con toques incandescentes.	🔥 Negro, rojo, naranja brillante.	Fondo tipo volcán, bordes incandescentes y animaciones tipo resplandor. Ideal para ChefSkills “Volcánico”.
10	Golden Prestige	Ultra premium con brillos metálicos y efectos dorados.	👑 Oro, negro y blanco.	Tarjetas con reflejos, degradados metálicos y microbrillos. Perfecto para el plan ChefSkills+ Ultra.
*/