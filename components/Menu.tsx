// Menu_LavaElite_ParticlesV4.tsx
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
import { CommonActions } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { app } from "../services/firebaseConfig";
import { AppDispatch, RootState } from "../store/Index";
import { clearUser } from "../store/Slices/userSlice";

import CSHeader from "../components/CSHeader"; 

const { width, height } = Dimensions.get("window");

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

  const sparks = useMemo(() => Array.from({ length: 14 }).map((_, i) => ({
    key: `spark-${i}`,
    left: Math.random() * width,
    delay: i * 250,
  })), []);

  const ashes = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({
    key: `ash-${i}`,
    left: Math.random() * width,
    delay: i * 400,
  })), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Fondo lava */}
      <LinearGradient
        colors={["#000000", "#1a0000", "#330000", "#601000", "#ff3d00"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow lava */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: intensity }]}>
        <LinearGradient
          colors={["rgba(255,100,0,0.2)", "rgba(255,50,0,0.15)", "rgba(255,0,0,0.1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Partículas */}
      {sparks.map(({ key, left, delay }) => (
        <Spark key={key} left={left} delay={delay} />
      ))}
      {ashes.map(({ key, left, delay }) => (
        <Ash key={key} left={left} delay={delay} />
      ))}

      {/* Vignette */}
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

const Spark = ({ left, delay }: any) => {
  const anim = useRef(new Animated.Value(0)).current;
  const colors = ["#ff9100", "#ffc107", "#ff3d00"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 2 + Math.random() * 3;

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

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [height + 60, -200] });
  const opacity = anim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 0.9, 0] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left,
        bottom: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        shadowColor: color,
        shadowOpacity: 1,
        shadowRadius: 10,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
};

const Ash = ({ left, delay }: any) => {
  const anim = useRef(new Animated.Value(0)).current;
  const size = 1.5 + Math.random() * 2;

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

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-150, height + 100] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 0.8, 1], outputRange: [0, 0.3, 0.5, 0] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left,
        top: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#888",
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
  const [remaining, setRemaining] = useState<any>(null);
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem("subscriptionData");
      if (!data) return;
      const sub = JSON.parse(data);
      setPlanName(sub.planName);

      if (!sub.expiresAt) return;

      const update = () => {
        const expiresAt = new Date(sub.expiresAt).getTime();
        const diff = expiresAt - Date.now();
        if (diff <= 0) return setRemaining(null);

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff / 3600000) % 24);
        const minutes = Math.floor((diff / 60000) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setRemaining({ days, hours, minutes, seconds });
      };

      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    };
    load();
  }, []);

  if (!remaining)
    return (
      <View style={styles.timerCard}>
        <Text style={[styles.timerLabel, { color: "#ff784e" }]}>No suscrito</Text>
        <Text style={styles.timerSub}>Activa ChefSkills+ y desbloquea beneficios</Text>
      </View>
    );

  return (
    <LinearGradient
      colors={["rgba(255, 90, 0, 0.25)", "rgba(255, 50, 0, 0.1)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.timerCard}
    >
      <Text style={styles.timerLabel}>🔥 {planName} activo</Text>
      <Text style={styles.timerSub}>
        Restan {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
      </Text>
    </LinearGradient>
  );
};

/* ============================================================================================
   🔥 MAIN MENU COMPONENT
============================================================================================ */

const Menu_LavaElite_ParticlesV4 = ({ navigation }) => {
  const [logoutImage, setLogoutImage] = useState(require("../assets/Logout/1.webp"));
  const [showDialog, setShowDialog] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

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
      console.error("[Logout] Error:", e);
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LavaBackground />

      {/* ⭐ HEADER ELEGANTE PARA VOLVER */}
      <CSHeader title="Menú" />

      <SafeAreaView style={styles.container}>
        {/* HEADER DATA */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Animated.View style={styles.glowAura} />
            <Image
              source={user?.photo ? { uri: user.photo } : require("../assets/usedImages/Unkown.png")}
              style={styles.avatar}
            />
          </View>

          <View style={[styles.badge, { backgroundColor: user?.isPremium ? "#ff5722" : "#ff8a65" }]}>
            <Text style={styles.badgeText}>
              {user?.isPremium ? "🔥 Premium" : "🌋 Free"}
            </Text>
          </View>

          <Text style={styles.name}>{user?.name || "Chef Volcánico"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <SubscriptionTimer />

        {/* LOGOUT */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity onPress={() => setShowDialog(true)} style={styles.logoutButton}>
            <Image source={logoutImage} style={styles.logoutImage} resizeMode="contain" />
            <LinearGradient
              colors={["#ff3d00", "#ff9100", "#ff3d00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutGradient}
            >
              <Text style={styles.logoutLabel}>Cerrar sesión</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* MODAL */}
        <Modal transparent visible={showDialog} animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.dialog}>
              <MaterialIcons name="logout" size={50} color="#ff7043" />
              <Text style={styles.dialogTitle}>¿Cerrar sesión?</Text>
              <Text style={styles.dialogText}>Tus datos se enfriarán lentamente... 🌋</Text>

              <View style={styles.dialogButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDialog(false)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleLogout}
                  disabled={loadingLogout}
                >
                  <Text style={styles.confirmText}>
                    {loadingLogout ? "Cerrando..." : "Cerrar sesión"}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

/* ============================================================================================
   🎨 ESTILOS
============================================================================================ */

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between", alignItems: "center", paddingVertical: 40 },
  header: { alignItems: "center" },

  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  glowAura: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,80,0,0.2)",
    shadowColor: "#ff3d00",
    shadowOpacity: 1,
    shadowRadius: 25,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#ff6a00",
  },

  badge: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 12, marginTop: 10 },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  name: { color: "#ffe0b2", fontSize: 22, fontWeight: "700", marginTop: 8 },
  email: { color: "#ffbfa4", fontSize: 14, marginBottom: 10 },

  timerCard: {
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255,90,0,0.4)",
    shadowColor: "#ff5722",
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },

  timerLabel: { color: "#ffab91", fontWeight: "700", fontSize: 16, marginBottom: 5 },
  timerSub: { color: "#ffcbb2", fontSize: 14 },

  logoutContainer: { alignItems: "center" },
  logoutButton: { alignItems: "center" },
  logoutImage: { width: 80, height: 80, marginBottom: 5 },

  logoutGradient: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#ff3d00",
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  logoutLabel: { color: "#fff", fontSize: 16, fontWeight: "700" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },

  dialog: {
    backgroundColor: "rgba(25,10,10,0.95)",
    borderRadius: 25,
    padding: 30,
    width: "80%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,80,0,0.8)",
    shadowColor: "#ff5722",
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },

  dialogTitle: { fontSize: 20, fontWeight: "700", color: "#ffe0b2", marginBottom: 8 },
  dialogText: { color: "#ffbfa4", textAlign: "center", marginBottom: 20 },

  dialogButtons: { flexDirection: "row", gap: 10 },

  cancelBtn: { backgroundColor: "#333", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 },
  cancelText: { color: "#ff8a65", fontWeight: "600" },

  confirmBtn: {
    backgroundColor: "#ff3d00",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#ff6f00",
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  confirmText: { color: "#fff", fontWeight: "700" },
});

export default Menu_LavaElite_ParticlesV4;


/*
7	Chef Arcade	Retro 8-bit pixelado.	🕹️ Naranja, violeta, negro.	Inspirado en Donkey Kong o Kirby — botones pixel, tipografía 8bit, Chefy animado saltando.
8	Ocean Breeze	Acuático y fresco, con ondas animadas.	🌊 Azul claro, verde agua, blanco.	Gradiente de mar con partículas tipo burbujas ascendiendo, suave movimiento del fondo.
9	Lava Elite	Oscuro con toques incandescentes.	🔥 Negro, rojo, naranja brillante.	Fondo tipo volcán, bordes incandescentes y animaciones tipo resplandor. Ideal para ChefSkills “Volcánico”.
10	Golden Prestige	Ultra premium con brillos metálicos y efectos dorados.	👑 Oro, negro y blanco.	Tarjetas con reflejos, degradados metálicos y microbrillos. Perfecto para el plan ChefSkills+ Ultra.
*/