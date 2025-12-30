import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth } from "firebase/auth";

// Servicios y Redux
import { getActivePlans } from "../services/plansService";
import { subscribeUser } from "../services/subscriptionService";
import { 
  initBilling, 
  endBilling, 
  getSubscriptionProducts, 
  purchaseSubscription, 
  acknowledgePurchase,
  type BillingProduct 
} from "../services/billingService";
import { subscribePlan as subscribePlanAction, setPremium as setSubscriptionPremium } from "../store/Slices/subscriptionSlice";
import { setPlan } from "../store/Slices/userSlice";
import { setMaxFavorites } from "../store/Slices/FavoriteSlice";
import type { Plan } from "../components/types/plan";

const { width, height } = Dimensions.get("window");
const scale = width / 390;

const PLAN_TO_PRODUCT_ID: Record<string, string> = {
  plan_monthly_basic: "chefskills_premium_1m",
  plan_quarterly_plus: "chefskills_premium_3m",
  plan_semiannual_pro: "chefskills_premium_6m",
  plan_annual_elite: "chefskills_premium_12m",
};

const PLAN_LABELS: Record<string, string> = {
  plan_monthly_basic: "1 Mes Premium",
  plan_quarterly_plus: "3 Meses Plus",
  plan_semiannual_pro: "6 Meses Pro",
  plan_annual_elite: "12 Meses Elite",
};

const planImages: Record<string, any> = {
  plan_monthly_basic: require("../assets/MarketPlace/1_mes.webp"),
  plan_quarterly_plus: require("../assets/MarketPlace/3_meses.webp"),
  plan_semiannual_pro: require("../assets/MarketPlace/6_meses.webp"),
  plan_annual_elite: require("../assets/MarketPlace/12_meses.webp"),
};

const priceBackgrounds = ["rgba(23,160,254,0.7)", "rgba(254,193,0,0.4)", "rgba(110,24,246,0.4)", "rgba(246,140,0,0.4)"];

/**
 * Extrae el precio formateado adaptado a la v14 Android (Nitro/OpenIAP)
 */
function formatPriceDisplay(producto: any) {
  if (!producto) return "---";
  
  // En v14 Android, los detalles vienen en subscriptionOfferDetailsAndroid
  const offer = producto.subscriptionOfferDetailsAndroid?.[0] || producto.subscriptionOfferDetails?.[0];
  const pricePhase = offer?.pricingPhases?.pricingPhaseList?.[0];
  
  return pricePhase?.formattedPrice || producto.displayPrice || "N/A";
}

export default function Marketplace({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<BillingProduct[]>([]);
  const [billingReady, setBillingReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Baloo2: require("../assets/fonts/Baloo2-VariableFont_wght.ttf"),
  });

  // 1. Carga de planes desde Firebase
  useEffect(() => {
    (async () => {
      try {
        const p = await getActivePlans();
        setPlans(p.sort((a, b) => a.durationMonths - b.durationMonths));
      } catch (e) {
        console.error("❌ Error carga planes DB:", e);
      }
    })();
  }, []);

  // 2. Inicialización de IAP v14 y carga de productos
  useEffect(() => {
    if (!visible) return;
    let isMounted = true;

    (async () => {
      try {
        setBillingReady(false);
        await initBilling();
        const prods = await getSubscriptionProducts();
        
        if (isMounted) {
          setProducts(prods);
          setBillingReady(true);
        }
      } catch (e) {
        console.error("❌ Error Marketplace IAP:", e);
      }
    })();

    return () => { 
      isMounted = false; 
      endBilling(); 
    };
  }, [visible]);

  // 3. Mapeo de productos usando el campo 'id' (estándar v14)
  const productById = useMemo(() => {
    const map: Record<string, BillingProduct> = {};
    products.forEach(p => { 
      const id = (p as any).id || (p as any).productId;
      if (id) map[id] = p; 
    });
    return map;
  }, [products]);

const handleSubscribe = async (plan: Plan) => {
  try {
    const user = getAuth().currentUser;
    if (!user) return Alert.alert("Sesión", "Inicia sesión para suscribirte.");

    // Buscamos el producto en nuestro mapa
    const product = productById[PLAN_TO_PRODUCT_ID[plan.id]] as any;
    
    // IMPORTANTE: En tu log aparece como 'subscriptionOfferDetailsAndroid'
    const offer = product?.subscriptionOfferDetailsAndroid?.[0];
    const offerToken = offer?.offerToken;

    // Log de seguridad para ti
    console.log("🔍 Producto encontrado:", product?.id);
    console.log("🔍 Token encontrado:", offerToken ? "SÍ" : "NO");

    if (!product || !offerToken) {
      return Alert.alert("Tienda", "Sincronizando... intenta de nuevo en un momento.");
    }

    setLoading(true);

    // Llamamos a nuestra función corregida
    // Usamos 'product.id' que es el que Google nos mandó
    const purchaseResult = await purchaseSubscription(product.id, offerToken);

    if (!purchaseResult || !purchaseResult.purchaseToken) {
      setLoading(false);
      return;
    }

    // Confirmar en Google Play para que no se devuelva el dinero a los 3 días
    await acknowledgePurchase(purchaseResult);

    // ... (Tu lógica de Firebase y Redux se queda igual)
    Alert.alert("¡Éxito!", "Tu suscripción Premium está activa.");
    onClose();

  } catch (e: any) {
    console.error("❌ Error en handleSubscribe:", e);
    if (e.code !== 'E_USER_CANCELLED') {
      Alert.alert("Error", "No se pudo procesar la compra. Revisa tu conexión.");
    }
  } finally {
    setLoading(false);
  }
};

  if (!fontsLoaded) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Image 
          source={require("../assets/MarketPlace/festive-chef.webp")} 
          style={[styles.topBannerCentered, { top: insets.top + 5, width: 159 * scale, height: 106 * scale }]} 
        />
        <View style={[styles.modalWrapper, { marginTop: insets.top + 50 * scale, width: width * 0.9, height: height * 0.75 }]}>
          <View style={styles.topBar}>
            <Pressable onPress={onClose} style={styles.closeIconContainer}>
              <Text style={[styles.closeIcon, { fontSize: 25 * scale }]}>×</Text>
            </Pressable>
          </View>
          <LinearGradient 
            colors={["#FFB347", "#FF8C5A", "#FF7043"]} 
            style={[styles.modalContent, { paddingTop: 90 * scale }]} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.modalTitle, { fontSize: 35 * scale, marginTop: -50 * scale }]}>
              {loading ? "Procesando..." : "Suscríbete"}
            </Text>
            
            {(!billingReady || loading) && (
              <ActivityIndicator size="large" color="#fff" style={{ marginBottom: 20 }} />
            )}
            
            <View style={{ width: '100%', paddingHorizontal: 10 }}>
              {plans.map((plan, i) => {
                const billingProduct = productById[PLAN_TO_PRODUCT_ID[plan.id]];
                return (
                  <View key={plan.id} style={styles.optionRow}>
                    <Image 
                      source={planImages[plan.id]} 
                      style={{ 
                        width: (75 + i * 15) * scale, 
                        height: (75 + i * 15) * scale, 
                        resizeMode: "contain" 
                      }} 
                    />
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={styles.fallbackLabel}>{PLAN_LABELS[plan.id]}</Text>
                      <Pressable 
                        style={[
                          styles.priceButton, 
                          { 
                            backgroundColor: priceBackgrounds[i] || priceBackgrounds[0], 
                            opacity: loading || !billingReady ? 0.6 : 1 
                          }
                        ]} 
                        onPress={() => handleSubscribe(plan)} 
                        disabled={loading || !billingReady}
                      >
                        <Text style={[styles.priceText, { fontSize: (18 + i * 2) * scale }]}>
                          {formatPriceDisplay(billingProduct)}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalWrapper: { borderRadius: 20, alignItems: "center", overflow: "visible" },
  modalContent: { flex: 1, width: "100%", borderRadius: 20, alignItems: "center", paddingBottom: 20 },
  modalTitle: { color: "#fff", fontFamily: "Baloo2", fontWeight: "800", fontStyle: "italic", textShadowColor: "#153991", textShadowOffset: { width: 3, height: 3 }, textAlign: "center", marginBottom: 10 },
  optionRow: { flexDirection: "row", alignItems: "center", marginBottom: 15, width: '100%', justifyContent: 'space-around' },
  fallbackLabel: { color: '#fff', fontFamily: 'Baloo2', fontSize: 16, fontWeight: '700', marginBottom: 5, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 } },
  priceButton: { borderRadius: 30, borderWidth: 1.5, borderColor: "#fff", elevation: 8, paddingVertical: 8, paddingHorizontal: 15, minWidth: 110, alignItems: 'center' },
  priceText: { fontWeight: "bold", color: "#fff", textShadowColor: "black", textShadowOffset: { width: 1, height: 1 } },
  topBar: { position: "absolute", top: 15, right: 20, zIndex: 50 },
  closeIconContainer: { backgroundColor: "#ffffffcc", borderRadius: 50, width: 35, height: 35, justifyContent: "center", alignItems: "center" },
  closeIcon: { fontWeight: "bold", color: "#333" },
  topBannerCentered: { position: "absolute", borderRadius: 25, backgroundColor: "#fff", borderWidth: 3, borderColor: "#8e44ad", zIndex: 30 },
});