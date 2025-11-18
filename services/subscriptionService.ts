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
// 🟩 FAVORITES LIMIT POR PLAN (no acumulativo por compra, SOLO por topPlan)
// ============================================================================
export const getFavoritesLimitByPlan = (planId: string): number => {
  switch (planId) {
    case "plan_monthly_basic":
      return 10;  // base 10 + 0
    case "plan_quarterly_plus":
      return 15;  // base 10 + 5
    case "plan_semiannual_pro":
      return 20;  // base 10 + 10
    case "plan_annual_elite":
      return 30;  // base 10 + 20
    default:
      return 10;  // FREE
  }
};

// 🔢 Ranking de planes para saber cuál es "más alto"
const PLAN_RANK: Record<string, number> = {
  plan_monthly_basic: 1,
  plan_quarterly_plus: 2,
  plan_semiannual_pro: 3,
  plan_annual_elite: 4,
};

const getPlanRank = (planId: string): number => PLAN_RANK[planId] ?? 0;

// ============================================================================
// 🟦 subscribeUser — CREA/ACTUALIZA LA SUBSCRIPCIÓN
//   ✔ Acumula meses si la suscripción sigue activa
//   ✔ Mantiene beneficios del plan MÁS ALTO mientras no expire
//   ✔ Si se deja expirar → se resetea al plan que se compre
// ============================================================================
export const subscribeUser = async (userId: string, plan: any) => {
  try {
    const ref = doc(db, "subscriptions", userId);
    const now = new Date();

    const prevSnap = await getDoc(ref);
    const prevData = prevSnap.exists() ? prevSnap.data() : null;

    // 1️⃣ Determinar si hay continuidad (expiresAt > ahora)
    let prevExpires: Date | null = null;

    if (prevData?.expiresAt) {
      prevExpires =
        typeof prevData.expiresAt === "string"
          ? new Date(prevData.expiresAt)
          : prevData.expiresAt?.toDate?.() ?? null;
    }

    const hasContinuity = !!(prevExpires && prevExpires > now);

    // 2️⃣ Base para nueva expiración (si hay continuidad → desde prevExpires)
    const baseDate = hasContinuity ? prevExpires! : now;

    const expires = new Date(baseDate);
    expires.setMonth(expires.getMonth() + plan.durationMonths);

    // 3️⃣ Determinar el "top plan" de la cadena continua
    let previousTopPlanId: string | null =
      prevData?.topPlanId || prevData?.planId || null;

    let topPlanId: string;

    if (hasContinuity && previousTopPlanId) {
      const prevRank = getPlanRank(previousTopPlanId);
      const newRank = getPlanRank(plan.id);

      topPlanId = newRank > prevRank ? plan.id : previousTopPlanId;
    } else {
      // No hay continuidad → se resetea el top al plan actual
      topPlanId = plan.id;
    }

    const favoritesLimit = getFavoritesLimitByPlan(topPlanId);

    // 4️⃣ Data a guardar en Firestore
    const data = {
      userId,

      // Plan actual (último comprado, lo que verá el usuario en el menú)
      planId: plan.id,
      planName: plan.name,

      // Plan más alto de la cadena continua (para beneficios reales)
      topPlanId,

      isActive: true,

      favoritesLimit, // límite FINAL aplicado en la app

      durationMonths: plan.durationMonths,
      pricePaid: plan.basePriceCents / 100,
      currency: plan.currency,

      expiresAt: expires.toISOString(),

      purchaseDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, data, { merge: true });

    // 5️⃣ Guardar en historial de compras
    await createTransaction(userId, {
      planId: plan.id,
      planName: plan.name,
      durationMonths: plan.durationMonths,
      pricePaid: plan.basePriceCents / 100,
      currency: plan.currency,
      expiresAt: expires.toISOString(),
      paymentProvider: "internal", // luego "google_play"
      purchaseToken: null,
    });

    console.log("🔥 Suscripción creada/actualizada + historial:", data);
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
//   ✔ Respeta topPlanId
//   ✔ Usa favoritesLimit guardado (si existe) o lo calcula
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
    const storedLimit =
      typeof data.favoritesLimit === "number" ? data.favoritesLimit : null;

    const limit =
      storedLimit ??
      getFavoritesLimitByPlan(data.topPlanId || data.planId || "");

    // Aseguramos que, si falta favoritesLimit, se re-escriba correcto
    if (!storedLimit) {
      await setDoc(
        ref,
        {
          favoritesLimit: limit,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

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
