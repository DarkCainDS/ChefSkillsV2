// components/Menu.tsx
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { CommonActions } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth, signOut } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { app } from '../services/firebaseConfig';
import { AppDispatch, RootState } from '../store/Index';
import { clearUser } from '../store/Slices/userSlice';

const { height, width } = Dimensions.get('window');

export type RootStackParamList = {
  Loading: undefined;
  ChefSkills: undefined;
  Menu: undefined;
};

type MenuProps = StackScreenProps<RootStackParamList, 'Menu'>;

const logoutImages = [
  require('../assets/Logout/1.webp'),
  require('../assets/Logout/2.webp'),
  require('../assets/Logout/3.webp'),
  require('../assets/Logout/4.webp'),
];

const FloatingBubble = ({ style, duration = 4000, distance = 15 }: any) => {
  const animY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animY, {
          toValue: -distance,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animY, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animY]);

  return <Animated.View style={[style, { transform: [{ translateY: animY }] }]} />;
};

const NeonMockTimer = () => {
  const user = useSelector((state: RootState) => state.user) || {};

  if (user.isPremium) {
    const mockTime = { days: 3, hours: 5, minutes: 27 };
    return (
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Suscripción activa</Text>
        <View style={styles.mockTimerBox}>
          <Text style={styles.mockTimerText}>
            {`${mockTime.days}d : ${mockTime.hours}h : ${mockTime.minutes}m`}
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>No suscrito</Text>
        <View style={[styles.mockTimerBox, { backgroundColor: '#33000055' }]}>
          <Text style={[styles.mockTimerText, { color: '#e63946' }]}>
            Suscríbete y activa beneficios
          </Text>
        </View>
      </View>
    );
  }
};

const Menu: React.FC<MenuProps> = ({ navigation }) => {
  const [logoutImage, setLogoutImage] = useState(logoutImages[0]);
  const [showDialog, setShowDialog] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user) || {};
  const auth = getAuth(app);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * logoutImages.length);
    setLogoutImage(logoutImages[randomIndex]);
  }, []);

  const handleLogoutConfirm = async () => {
    setLoadingLogout(true);
    setShowDialog(false);

    try {
      // 🔹 Firebase logout
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch (e) {
          console.warn('[Logout] Error cerrando sesión en Firebase:', e);
        }
      }

      // 🔹 Google logout
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        }
      } catch (e) {
        console.warn('[Logout] Error cerrando sesión en Google:', e);
      }

      // 🔹 Limpieza de Redux
      dispatch(clearUser());

      // 🔹 Limpieza de AsyncStorage (solo el usuario)
      try {
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.warn('[Logout] Error limpiando AsyncStorage:', e);
      }

      // 🔹 Reset de navegación a LoadingScreen seguro
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Loading' }],
        })
      );

    } catch (error) {
      console.error('[Logout] Error general:', error);
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63']} style={styles.menuContainer}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarGlow}>
          <Image
            source={
              user?.photo
                ? { uri: user.photo }
                : require('../assets/usedImages/Unkown.png')
            }
            style={styles.avatarImage}
          />
          <LinearGradient
            colors={['#39ff14', '#0ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.subscriptionBadge}
          >
            <Text style={styles.subscriptionText}>
              {user?.isPremium ? 'Premium' : 'Free'}
            </Text>
          </LinearGradient>
        </View>

        {/* Burbujas flotantes */}
        <FloatingBubble
          style={[styles.neonBubble, { top: 5, left: 10, width: 8, height: 8 }]}
          duration={3000}
          distance={12}
        />
        <FloatingBubble
          style={[styles.neonBubble, { top: 40, right: 25, width: 14, height: 14 }]}
          duration={4200}
          distance={18}
        />
        <FloatingBubble
          style={[styles.neonBubble, { bottom: 15, left: 45, width: 10, height: 10 }]}
          duration={3800}
          distance={15}
        />
        <FloatingBubble
          style={[styles.neonBubble, { bottom: 25, right: 55, width: 12, height: 12 }]}
          duration={4600}
          distance={20}
        />
      </View>

      {/* Mensaje */}
      <View style={styles.messageContainer}>
        <NeonMockTimer />
        <LinearGradient
          colors={['#1c1c1caa', '#1c1c1c33']}
          style={styles.messageCard}
        >
          <Text style={styles.messageText}>{`¡Hola, ${user?.name || 'Chef'}! 👨‍🍳`}</Text>
          <Text style={styles.messageSubText}>
            Explora nuevas recetas, sube tu nivel y crea platillos que brillen. ⚡🍰
          </Text>
        </LinearGradient>
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={() => setShowDialog(true)} style={styles.logoutButton}>
        <Image source={logoutImage} style={styles.logoutImage} />
      </TouchableOpacity>

      {/* Modal de confirmación */}
      <Modal
        visible={showDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="logout" size={40} color="#00001" />
            </View>
            <Text style={styles.dialogTitle}>¿Seguro que quieres cerrar sesión?</Text>
            <Text style={styles.dialogSubtitle}>
              Puedes volver a iniciar sesión en cualquier momento.{"\n"}
              ✦ Tus <Text style={{ fontWeight: '600' }}>suscripciones</Text> se mantendrán activas.{"\n"}
              ✦ Las <Text style={{ fontWeight: '600' }}>suscripciones</Text> no se congelarán mientras estés desconectado.{"\n"}
              ✦ Tus <Text style={{ fontWeight: '600' }}>favoritos</Text> se borrarán de este dispositivo.
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={() => setShowDialog(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.logoutBtn]}
                onPress={handleLogoutConfirm}
                disabled={loadingLogout}
              >
                <Text style={styles.logoutText}>
                  {loadingLogout ? 'Cerrando...' : 'Cerrar sesión'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  menuContainer: { flex: 1, justifyContent: 'space-around', alignItems: 'center', paddingVertical: 20 },
  avatarContainer: { width: width * 0.7, height: height * 0.28, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  avatarGlow: { width: 120, height: 120, borderRadius: 60, padding: 3, shadowColor: '#0ff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  avatarImage: { width: 110, height: 110, borderRadius: 55, borderWidth: 1.5, borderColor: '#39ff14' },
  subscriptionBadge: { position: 'absolute', bottom: 10, right: 10, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 16, minWidth: 60 },
  subscriptionText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  neonBubble: { position: 'absolute', borderRadius: 10, backgroundColor: '#0ff', shadowColor: '#0ff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8 },
  messageContainer: { paddingHorizontal: 20, width: '90%' },
  messageCard: { borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#0ff', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  messageText: { fontSize: 22, color: '#39ff14', fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  messageSubText: { fontSize: 14, color: '#0ff', textAlign: 'center' },
  logoutButton: { alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  logoutImage: { width: 110, height: 110 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  dialog: { backgroundColor: '#1c1c1e', borderRadius: 20, padding: 25, alignItems: 'center', width: '82%' },
  iconCircle: { backgroundColor: '#5a86c3', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5 },
  dialogTitle: { color: 'white', fontSize: 18, fontWeight: "700", textAlign: 'center', marginBottom: 8 },
  dialogSubtitle: { color: '#ddd', fontSize: 14, textAlign: 'center', marginBottom: 22, lineHeight: 20 },
  buttonRow: { flexDirection: 'row', gap: 15 },
  btn: { paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10, minWidth: 120, alignItems: "center" },
  cancelBtn: { backgroundColor: "#f1f1f1" },
  cancelText: { color: "#333", fontWeight: "600" },
  logoutBtn: { backgroundColor: "#e63946" },
  logoutText: { color: "#fff", fontWeight: "600" },
  timerContainer: { marginBottom: 8, alignItems: 'center' },
  timerLabel: { color: '#39ff14', fontWeight: '700', fontSize: 14, marginBottom: 4, textShadowColor: '#0ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 },
  mockTimerBox: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#0f0c29cc', marginBottom: 8 },
  mockTimerText: { color: '#39ff14', fontWeight: '700', fontSize: 14, textAlign: 'center' },
});

export default Menu;
