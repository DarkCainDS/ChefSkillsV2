// services/subscriptionService.ts
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { AppDispatch } from "../store/Index";

// Redux
import {
  subscribePlan as subscribePlanAction,
  setPremium as setSubscriptionPremium,
  unsubscribe as unsubscribeAction,
} from "../store/Slices/subscriptionSlice";
import { setPlan } from "../store/Slices/userSlice";
import { setMaxFavorites } from "../store/Slices/FavoriteSlice";

// Historial
import { createTransaction } from "./transactionService";

// ============================================================================
// 🟩 FAVORITES LIMIT POR PLAN (NO acumulativo, SOLO topPlan)
// ============================================================================
export const getFavoritesLimitByPlan = (planId: string): number => {
  switch (planId) {
    case "plan_monthly_basic":
      return 10;
    case "plan_quarterly_plus":
      return 15;
    case "plan_semiannual_pro":
      return 20;
    case "plan_annual_elite":
      return 30;
    default:
      return 10; // FREE
  }
};

// 🔢 Ranking para determinar el plan MÁS ALTO activo
const PLAN_RANK: Record<string, number> = {
  plan_monthly_basic: 1,
  plan_quarterly_plus: 2,
  plan_semiannual_pro: 3,
  plan_annual_elite: 4,
};

const getPlanRank = (planId: string): number => PLAN_RANK[planId] ?? 0;

// ============================================================================
// 🟦 subscribeUser — CREA / ACTUALIZA SUSCRIPCIÓN (GOOGLE PLAY REAL)
// ============================================================================
export const subscribeUser = async (
  userId: string,
  plan: {
    id: string;
    name: string;
    durationMonths: number;
  },
  billing: {
    pricePaid: number;       // precio REAL (ej: 3490)
    currency: string;        // CLP, USD, etc
    purchaseToken: string;   // token Google Play
    provider: "google_play";
  }
) => {
  try {
    const ref = doc(db, "subscriptions", userId);
    const now = new Date();

    const prevSnap = await getDoc(ref);
    const prevData = prevSnap.exists() ? prevSnap.data() : null;

    // 1️⃣ Continuidad
    let prevExpires: Date | null = null;

    if (prevData?.expiresAt) {
      prevExpires =
        typeof prevData.expiresAt === "string"
          ? new Date(prevData.expiresAt)
          : prevData.expiresAt?.toDate?.() ?? null;
    }

    const hasContinuity = !!(prevExpires && prevExpires > now);

    // 2️⃣ Nueva expiración
    const baseDate = hasContinuity ? prevExpires! : now;
    const expires = new Date(baseDate);
    expires.setMonth(expires.getMonth() + plan.durationMonths);

    // 3️⃣ Determinar topPlan
    const previousTopPlanId: string | null =
      prevData?.topPlanId || prevData?.planId || null;

    let topPlanId: string;

    if (hasContinuity && previousTopPlanId) {
      topPlanId =
        getPlanRank(plan.id) > getPlanRank(previousTopPlanId)
          ? plan.id
          : previousTopPlanId;
    } else {
      topPlanId = plan.id;
    }

    const favoritesLimit = getFavoritesLimitByPlan(topPlanId);

    // 4️⃣ Guardar suscripción
    const data = {
      userId,

      planId: plan.id,
      planName: plan.name,

      topPlanId,
      isActive: true,

      favoritesLimit,
      durationMonths: plan.durationMonths,

      pricePaid: billing.pricePaid,
      currency: billing.currency,

      expiresAt: expires.toISOString(),

      purchaseDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, data, { merge: true });

    // 5️⃣ Historial REAL
    await createTransaction(userId, {
      planId: plan.id,
      planName: plan.name,
      durationMonths: plan.durationMonths,
      pricePaid: billing.pricePaid,
      currency: billing.currency,
      expiresAt: expires.toISOString(),
      paymentProvider: billing.provider,
      purchaseToken: billing.purchaseToken,
    });

    console.log("🔥 Suscripción PRO creada:", data);
    return data;
  } catch (error) {
    console.error("❌ Error en subscribeUser:", error);
    throw error;
  }
};

// ============================================================================
// 🟥 unsubscribeUser — DESACTIVA (NO BORRA)
// ============================================================================
export const unsubscribeUser = async (userId: string) => {
  try {
    await setDoc(
      doc(db, "subscriptions", userId),
      { isActive: false, updatedAt: serverTimestamp() },
      { merge: true }
    );

    console.log("⚠️ Suscripción desactivada:", userId);
  } catch (error) {
    console.error("❌ Error en unsubscribeUser:", error);
  }
};

// ============================================================================
// 🟦 checkSubscriptionStatus — RESTAURA ESTADO AL INICIAR APP
// ============================================================================
export const checkSubscriptionStatus = async (
  userId: string,
  dispatch: AppDispatch
) => {
  try {
    const ref = doc(db, "subscriptions", userId);
    const snap = await getDoc(ref);

    // ❌ FREE
    if (!snap.exists()) {
      dispatch(setSubscriptionPremium(false));
      dispatch(unsubscribeAction());
      dispatch(setPlan({ planId: null, favoritesLimit: 10 }));
      dispatch(setMaxFavorites(10));
      return null;
    }

    const data = snap.data();

    const exp =
      typeof data.expiresAt === "string"
        ? new Date(data.expiresAt)
        : data.expiresAt?.toDate?.() ?? null;

    if (!exp || new Date() > exp) {
      await setDoc(
        ref,
        { isActive: false, updatedAt: serverTimestamp() },
        { merge: true }
      );

      dispatch(setSubscriptionPremium(false));
      dispatch(unsubscribeAction());
      dispatch(setPlan({ planId: null, favoritesLimit: 10 }));
      dispatch(setMaxFavorites(10));
      return null;
    }

    // ✔ ACTIVA
    const limit =
      typeof data.favoritesLimit === "number"
        ? data.favoritesLimit
        : getFavoritesLimitByPlan(data.topPlanId || data.planId);

    dispatch(
      subscribePlanAction({
        id: data.planId,
        name: data.planName,
        price: data.pricePaid,
        currency: data.currency,
        expiresAt: exp.toISOString(),
      })
    );

    dispatch(setSubscriptionPremium(true));
    dispatch(setPlan({ planId: data.planId, favoritesLimit: limit }));
    dispatch(setMaxFavorites(limit));

    return {
      isActive: true,
      planId: data.planId,
      planName: data.planName,
      favoritesLimit: limit,
      expiresAt: exp.toISOString(),
      pricePaid: data.pricePaid,
      currency: data.currency,
    };
  } catch (error) {
    console.error("❌ ERROR en checkSubscriptionStatus:", error);
    return null;
  }
};
