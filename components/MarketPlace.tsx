// components/Marketplace.tsx
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth } from 'firebase/auth';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { subscribeUser } from '../services/subscriptionService';

const { width, height } = Dimensions.get('window');

interface Plan {
  name: string;
  price: string;
  currency: string;
}

interface MarketplaceProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (plan: Plan) => void; // nueva prop
}


const plans: Plan[] = [
  { name: '1 mes', price: '3.49', currency: 'USD' },
  { name: '3 meses', price: '9.42', currency: 'USD' },
  { name: '6 meses', price: '17.80', currency: 'USD' },
  { name: '12 meses', price: '33.40', currency: 'USD' },
];

const planImages: Record<string, any> = {
  '1 mes': require('../assets/MarketPlace/1_mes.webp'),
  '3 meses': require('../assets/MarketPlace/3_meses.webp'),
  '6 meses': require('../assets/MarketPlace/6_meses.webp'),
  '12 meses': require('../assets/MarketPlace/12_meses.webp'),
};

const priceBackgrounds = [
  'rgba(23,160,254,0.7)',
  'rgba(254,193,0,0.4)',
  'rgba(110,24,246,0.4)',
  'rgba(246,140,0,0.4)',
];

export default function Marketplace({ visible, onClose }: MarketplaceProps) {
  const [infoVisible, setInfoVisible] = useState(false);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Baloo2: require('../assets/fonts/Baloo2-VariableFont_wght.ttf'),
  });

  if (!fontsLoaded) return null;

const handleSubscribe = async (plan: Plan) => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      console.error('No hay usuario logueado');
      return;
    }

    // Aquí puedes mantener tu lógica de backend
    const payload = {
      planId: `chefskills_${plan.name.replace(' ', '')}`,
      planName: plan.name,
      pricePaid: parseFloat(plan.price),
      currency: plan.currency,
      purchaseProvider: 'server',
      flashSaleApplied: false,
    };

    await subscribeUser(user.uid, payload);

    // Llamar a la función del padre
    onSubscribe(plan);

    onClose();
  } catch (err) {
    console.error('Error al suscribirse:', err);
  }
};

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Image
          source={require('../assets/MarketPlace/festive-chef.webp')}
          style={[styles.topBannerCentered, { top: insets.top - 1 }]}
        />

        <View style={[styles.modalWrapper, { marginTop: insets.top + 20 }]}>
          <View style={styles.topBar}>
            <Pressable onPress={() => setInfoVisible(true)} style={styles.infoButton}>
              <Text style={styles.infoIcon}>ℹ️</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.closeIconContainer}>
              <Text style={styles.closeIcon}>×</Text>
            </Pressable>
          </View>

          <LinearGradient
            colors={['#FFB347', '#FF7043']}
            style={styles.modalContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.modalTitle}>Suscríbete</Text>

            {plans.map((plan, i) => (
              <View key={i} style={styles.optionRow}>
                <Image
                  source={planImages[plan.name]}
                  style={[styles.optionImage, { width: 80 + i * 25, height: 80 + i * 25 }]}
                />
                <Pressable
                  style={[styles.priceButton, { backgroundColor: priceBackgrounds[i] }]}
                  onPress={() => handleSubscribe(plan)}
                >
                  <Text style={[styles.priceText, { fontSize: 22 + i * 3 }]}>
                    {plan.price} {plan.currency}
                  </Text>
                </Pressable>
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* Modal de información */}
        <Modal visible={infoVisible} transparent animationType="fade" onRequestClose={() => setInfoVisible(false)}>
          <View style={[styles.modalBackdrop, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <View style={[styles.modalWrapper, { height: height * 0.4, padding: 20, justifyContent: 'center' }]}>
              <Text style={[styles.modalTitle, { marginTop: 0 }]}>¿Qué incluye cada plan?</Text>
              <Text
                style={{
                  fontSize: 18,
                  color: '#fff',
                  textAlign: 'center',
                  marginVertical: 20,
                  lineHeight: 28,
                }}
              >
                {"🎁 1 mes: Sin anuncios\n\n🌟 3 meses: Sin anuncios + 5 favoritos\n\n💎 6 meses: Sin anuncios + 10 favoritos\n\n👑 12 meses: Sin anuncios + 20 favoritos"}
              </Text>
              <Pressable
                onPress={() => setInfoVisible(false)}
                style={[styles.closeIconContainer, { alignSelf: 'center', backgroundColor: '#ffffffcc', width: 50, height: 50 }]}
              >
                <Text style={[styles.closeIcon, { fontSize: 28, color: '#8e44ad' }]}>×</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalWrapper: {
    width: width * 0.9,
    height: height * 0.75,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'visible',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
    width: '100%',
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 35,
    color: '#fff',
    marginTop: -60,
    marginBottom: 20,
    fontFamily: 'Baloo2',
    fontWeight: '800',
    fontStyle: 'italic',
    textShadowColor: '#153991',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
    width: '100%',
    textAlign: 'center',
  },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  optionImage: { resizeMode: 'contain', marginRight: 15 },
  priceButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderWidth: 1,
    borderColor: '#8e44ad',
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceText: { fontWeight: 'bold', textShadowColor: 'black', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 1, color: '#fff' },
  topBar: { position: 'absolute', top: 15, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 },
  infoButton: { width: 50, height: 50, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  infoIcon: { color: 'white', fontWeight: '100', fontSize: 25, marginTop: -40 },
  closeIconContainer: { backgroundColor: '#ffffff99', borderRadius: 50, width: 35, height: 35, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  closeIcon: { fontSize: 25, fontWeight: 'bold', color: '#333' },
  topBannerCentered: {
    position: 'absolute',
    alignSelf: 'center',
    width: 159,
    height: 106,
    resizeMode: 'contain',
    borderRadius: 25,
    zIndex: 30,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#8e44ad',
  },
});
