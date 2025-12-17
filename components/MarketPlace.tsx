import { getVersionedImageSync } from "../utils/versionedImage";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
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

import { subscribeUser } from "../services/subscriptionService";
import {
  subscribePlan as subscribePlanAction,
  setPremium as setSubscriptionPremium,
} from "../store/Slices/subscriptionSlice";

import { setPlan } from "../store/Slices/userSlice";
import { setMaxFavorites } from "../store/Slices/FavoriteSlice";
import { getActivePlans } from "../services/plansService";
import { Plan } from "../components/types/plan";

const { width, height } = Dimensions.get("window");

interface MarketplaceProps {
  visible: boolean;
  onClose: () => void;
}

const scale = width / 390; // escala ligera, casi igual al original

// Imagen por plan (usamos el ID del plan)
const planImages: Record<string, any> = {
  plan_monthly_basic: require("../assets/MarketPlace/1_mes.webp"),
  plan_quarterly_plus: require("../assets/MarketPlace/3_meses.webp"),
  plan_semiannual_pro: require("../assets/MarketPlace/6_meses.webp"),
  plan_annual_elite: require("../assets/MarketPlace/12_meses.webp"),
};

const priceBackgrounds = [
  "rgba(23,160,254,0.7)",
  "rgba(254,193,0,0.4)",
  "rgba(110,24,246,0.4)",
  "rgba(246,140,0,0.4)",
];

export default function Marketplace({ visible, onClose }: MarketplaceProps) {
  const [infoVisible, setInfoVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Baloo2: require("../assets/fonts/Baloo2-VariableFont_wght.ttf"),
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getActivePlans();
        const sorted = data.sort((a, b) => a.durationMonths - b.durationMonths);
        setPlans(sorted);
      } catch (e) {
        console.error("❌ Error cargando planes:", e);
        Alert.alert("Error", "No se pudieron cargar los planes.");
      }
    })();
  }, []);

  if (!fontsLoaded) return null;

  const handleSubscribe = async (plan: Plan) => {
    try {
      const user = getAuth().currentUser;
      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión para suscribirte.");
        return;
      }

      setLoading(true);

      const subData = await subscribeUser(user.uid, plan);

      dispatch(
        subscribePlanAction({
          id: subData.planId,
          name: subData.planName,
          price: subData.pricePaid,
          currency: subData.currency,
          expiresAt: subData.expiresAt,
        })
      );

      dispatch(setSubscriptionPremium(true));

      dispatch(
        setPlan({
          planId: subData.planId,
          favoritesLimit: subData.favoritesLimit,
        })
      );

      dispatch(setMaxFavorites(subData.favoritesLimit));

      setSuccessVisible(true);
    } catch (error) {
      console.error("❌ Error al suscribirse:", error);
      Alert.alert("Error", "Ocurrió un problema con la suscripción.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Image
          source={require("../assets/MarketPlace/festive-chef.webp")}
          style={[
            styles.topBannerCentered,
            {
              top: insets.top + 5,
              width: 159 * scale,
              height: 106 * scale,
            },
          ]}
        />

        <View
          style={[
            styles.modalWrapper,
            {
              marginTop: insets.top + 50 * scale,
              width: width * 0.9,
              height: height * 0.75,
            },
          ]}
        >
          <View style={styles.topBar}>
            <Pressable onPress={() => setInfoVisible(true)} style={styles.infoButton}>
              <Text style={[styles.infoIcon, { fontSize: 25 * scale }]}>ℹ️</Text>
            </Pressable>

            <Pressable onPress={onClose} style={styles.closeIconContainer}>
              <Text style={[styles.closeIcon, { fontSize: 25 * scale }]}>×</Text>
            </Pressable>
          </View>

          <LinearGradient
            colors={["#FFB347", "#FF8C5A", "#FF7043"]} // gradiente suave 3 colores
            style={[styles.modalContent, { paddingTop: 90 * scale }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  fontSize: 35 * scale,
                  marginTop: -50 * scale,
                },
              ]}
            >
              {loading ? "Procesando..." : "Suscríbete"}
            </Text>

            {loading && (
              <ActivityIndicator size="large" color="#fff" style={{ marginBottom: 20 }} />
            )}

            {plans.map((plan, i) => {
              const price = (plan.basePriceCents / 100).toFixed(2);
              const img = planImages[plan.id];

              const baseSize = 80 + i * 25;

              return (
                <View key={plan.id} style={styles.optionRow}>
                  {img && (
                    <Image
                      source={img}
                      style={{
                        width: baseSize * scale,
                        height: baseSize * scale,
                        resizeMode: "contain",
                        marginRight: 15 * scale,
                      }}
                    />
                  )}
                  <Pressable
                    style={[
                      styles.priceButton,
                      {
                        backgroundColor: priceBackgrounds[i] || priceBackgrounds[0],
                        paddingVertical: 10 * scale,
                        paddingHorizontal: 20 * scale,
                      },
                    ]}
                    onPress={() => !loading && handleSubscribe(plan)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.priceText,
                        {
                          fontSize: (22 + i * 3) * scale,
                          textShadowOffset: { width: 3 * scale, height: 3 * scale },
                        },
                      ]}
                    >
                      {price} {plan.currency}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </LinearGradient>
        </View>

        {/* ====================== MODAL INFO ====================== */}
        <Modal
          visible={infoVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setInfoVisible(false)}
        >
          <View style={[styles.modalBackdrop, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
            <View
              style={[
                styles.modalWrapper,
                {
                  width: width * 0.85,
                  height: height * 0.4,
                  padding: 20 * scale,
                  marginTop: insets.top + 100 * scale,
                },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  {
                    fontSize: 30 * scale,
                    marginTop: 10 * scale,
                    marginBottom: 10 * scale,
                  },
                ]}
              >
                ¿Qué incluye cada plan?
              </Text>

              <Text
                style={[
                  styles.infoText,
                  {
                    fontSize: 18 * scale,
                    lineHeight: 26 * scale,
                  },
                ]}
              >
                🎁 1 mes: Sin anuncios{"\n\n"}
                🌟 3 meses: Sin anuncios + 5 favoritos{"\n\n"}
                💎 6 meses: Sin anuncios + 10 favoritos{"\n\n"}
                👑 12 meses: Sin anuncios + 20 favoritos
              </Text>

              <Pressable
                onPress={() => setInfoVisible(false)}
                style={[
                  styles.closeIconContainer,
                  {
                    width: 50 * scale,
                    height: 50 * scale,
                    alignSelf: "center",
                    backgroundColor: "#ffffffcc",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.closeIcon,
                    { fontSize: 28 * scale, color: "#8e44ad" },
                  ]}
                >
                  ×
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ====================== MODAL ÉXITO ====================== */}
        <Modal
          visible={successVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setSuccessVisible(false);
            onClose();
          }}
        >
          <View style={[styles.modalBackdrop, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
            <View
              style={[
                styles.modalWrapper,
                {
                  width: width * 0.88,
                  height: height * 0.45,
                  padding: 25 * scale,
                  justifyContent: "center",
                  marginTop: insets.top + 80 * scale,
                },
              ]}
            >
              <Image
                source={require("../assets/MarketPlace/success.webp")}
                style={{
                  width: 150 * scale,
                  height: 150 * scale,
                  alignSelf: "center",
                  marginBottom: 20 * scale,
                }}
                resizeMode="contain"
              />

              <Text
                style={[
                  styles.modalTitle,
                  {
                    fontSize: 30 * scale,
                    marginTop: 0,
                  },
                ]}
              >
                ¡Compra exitosa!
              </Text>

              <Text
                style={{
                  fontSize: 18 * scale,
                  color: "#fff",
                  textAlign: "center",
                  marginVertical: 20 * scale,
                  lineHeight: 26 * scale,
                }}
              >
                Tu suscripción premium ha sido activada.{"\n"}Disfruta ChefSkills sin anuncios 🎉
              </Text>

              <Pressable
                onPress={() => {
                  setSuccessVisible(false);
                  onClose();
                }}
                style={[
                  styles.closeIconContainer,
                  {
                    alignSelf: "center",
                    backgroundColor: "#ffffffcc",
                    width: 120 * scale,
                    height: 46 * scale,
                    borderRadius: 14 * scale,
                  },
                ]}
              >
                <Text
                  style={{
                    color: "#8e44ad",
                    fontSize: 18 * scale,
                    fontWeight: "bold",
                  }}
                >
                  Continuar
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalWrapper: {
    borderRadius: 20,
    alignItems: "center",
    overflow: "visible",
    backgroundColor: "transparent",
  },

  modalContent: {
    flex: 1,
    width: "100%",
    borderRadius: 20,
    alignItems: "center",
  },

  modalTitle: {
    color: "#fff",
    fontFamily: "Baloo2",
    fontWeight: "800",
    fontStyle: "italic",
    textShadowColor: "#153991",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
    textAlign: "center",
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  priceButton: {
    borderTopLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderWidth: 1,
    borderColor: "#8e44ad",
    elevation: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  priceText: {
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "black",
  },

  infoText: {
    color: "#fff",
    textAlign: "center",
    marginVertical: 20,
  },

  topBar: {
    position: "absolute",
    top: 15,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },

  infoButton: {
    width: 50,
    height: 50,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  infoIcon: {
    color: "white",
    fontWeight: "100",
  },

  closeIconContainer: {
    backgroundColor: "#ffffff99",
    borderRadius: 50,
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  closeIcon: {
    fontWeight: "bold",
    color: "#333",
  },

  topBannerCentered: {
    position: "absolute",
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#8e44ad",
    zIndex: 30,
  },
});
