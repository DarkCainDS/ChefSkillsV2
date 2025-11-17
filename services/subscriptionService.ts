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
// 🟩 FAVORITES LIMIT POR PLAN  (NO acumulativo)
// ============================================================================
export const getFavoritesLimitByPlan = (planId: string): number => {
  switch (planId) {
    case "plan_monthly_basic":
      return 15; // +5
    case "plan_quarterly_plus":
      return 20; // +10
    case "plan_semiannual_pro":
      return 25; // +15
    case "plan_annual_elite":
      return 30; // +20
    default:
      return 10; // FREE
  }
};

// ============================================================================
// 🟦 subscribeUser — CREA/ACTUALIZA LA SUBSCRIPCIÓN + ACUMULA MESES + HISTORIAL
// ============================================================================
export const subscribeUser = async (userId: string, plan: any) => {
  try {
    const ref = doc(db, "subscriptions", userId);

    // ===============================
    // 1️⃣ RECUPERAR EXPIRACIÓN PREVIA
    // ===============================
    const prevSnap = await getDoc(ref);

    let baseDate = new Date(); // por defecto → HOY

    if (prevSnap.exists() && prevSnap.data().expiresAt) {
      const prev = prevSnap.data().expiresAt;

      const prevDate =
        typeof prev === "string" ? new Date(prev) : prev?.toDate?.() ?? null;

      // Si la suscripción anterior sigue activa → acumulamos desde ahí
      if (prevDate && prevDate > new Date()) {
        baseDate = prevDate;
      }
    }

    // ===============================
    // 2️⃣ SUMAR LA DURACIÓN DEL NUEVO PLAN
    // ===============================
    const expires = new Date(baseDate);
    expires.setMonth(expires.getMonth() + plan.durationMonths);

    // ===============================
    // 3️⃣ FAVORITOS FINALES (NO acumulativos)
    // ===============================
    const favoritesLimit = getFavoritesLimitByPlan(plan.id);

    // ===============================
    // 4️⃣ DATA A GUARDAR
    // ===============================
    const data = {
      userId,
      planId: plan.id,
      planName: plan.name,

      isActive: true,

      favoritesLimit, // límite final

      durationMonths: plan.durationMonths,
      pricePaid: plan.basePriceCents / 100,
      currency: plan.currency,

      expiresAt: expires.toISOString(),

      purchaseDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // ===============================
    // 5️⃣ GUARDAR / ACTUALIZAR LA SUSCRIPCIÓN
    // ===============================
    await setDoc(ref, data, { merge: true });

    // ===============================
    // 6️⃣ GUARDAR EN HISTORIAL DE COMPRAS
    // ===============================
    await createTransaction(
      userId,
      {
        id: plan.id,
        name: plan.name,
        durationMonths: plan.durationMonths,
        basePriceCents: plan.basePriceCents,
        currency: plan.currency,
      },
      null, // purchaseToken
      "internal" // provider (cuando tengamos IAP → cambia a "google_play")
    );

    console.log("🔥 Suscripción creada/actualizada + historial guardado:", data);
    return data;
  } catch (error) {
    console.error("❌ Error en subscribeUser:", error);
    throw error;
  }
};

// ============================================================================
// 🟥 unsubscribeUser — DESACTIVAR SUBSCRIPCIÓN
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
// 🟦 checkSubscriptionStatus — EJECUTADO EN App.tsx
// ============================================================================
export const checkSubscriptionStatus = async (
  userId: string,
  dispatch: AppDispatch
) => {
  try {
    const ref = doc(db, "subscriptions", userId);
    const snap = await getDoc(ref);

    // ❌ No existe → FREE
    if (!snap.exists()) {
      dispatch(setSubscriptionPremium(false));
      dispatch(unsubscribeAction());
      dispatch(setPlan({ planId: null, favoritesLimit: 10 }));
      dispatch(setMaxFavorites(10));
      return null;
    }

    const data = snap.data();

    // Expiración a Date
    const exp =
      typeof data.expiresAt === "string"
        ? new Date(data.expiresAt)
        : data.expiresAt?.toDate?.() ?? null;

    const now = new Date();

    // ❌ Expirada
    if (!exp || now > exp) {
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

    // ✔ Activa
    const limit = getFavoritesLimitByPlan(data.planId);

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
    };
  } catch (error) {
    console.error("❌ ERROR en checkSubscriptionStatus:", error);
    return null;
  }
};
