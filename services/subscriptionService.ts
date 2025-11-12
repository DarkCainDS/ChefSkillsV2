import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { AppDispatch } from "../store/Index";
import { subscribePlan, setPremium } from "../store/Slices/subscriptionSlice";

export interface SubscriptionPayload {
  planId: string;
  planName: string;
  pricePaid: number;
  currency: string;
  purchaseProvider: "google_play" | "app_store" | "server";
  flashSaleApplied: boolean;
}

export const subscribeUser = async (userId: string, payload: SubscriptionPayload) => {
  try {
    const ref = doc(db, "subscriptions", userId);
    const now = new Date();
    const expiresAt = new Date(now);
    const id = payload.planId.toLowerCase();

    if (id.includes("1mes")) expiresAt.setMonth(now.getMonth() + 1);
    else if (id.includes("3mes")) expiresAt.setMonth(now.getMonth() + 3);
    else if (id.includes("6mes")) expiresAt.setMonth(now.getMonth() + 6);
    else if (id.includes("12mes")) expiresAt.setFullYear(now.getFullYear() + 1);
    else expiresAt.setMonth(now.getMonth() + 1);

    const docData = {
      ...payload,
      userId,
      isActive: true,
      purchaseDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expiresAt,
    };

    await setDoc(ref, docData, { merge: true });
    await setDoc(doc(db, "users", userId), { isPremium: true }, { merge: true });

    console.log("✅ Suscripción activa guardada:", payload.planName);
    return { ...payload, expiresAt: expiresAt.toISOString() };
  } catch (e) {
    console.error("❌ Error al crear/actualizar suscripción:", e);
    throw e;
  }
};

export const unsubscribeUser = async (userId: string) => {
  try {
    await setDoc(doc(db, "subscriptions", userId), { isActive: false, updatedAt: serverTimestamp() }, { merge: true });
    await setDoc(doc(db, "users", userId), { isPremium: false }, { merge: true });
    console.log("⚠️ Suscripción desactivada para:", userId);
  } catch (e) {
    console.error("❌ Error al desactivar suscripción:", e);
  }
};

export const checkSubscriptionStatus = async (userId: string, dispatch: AppDispatch) => {
  try {
    const ref = doc(db, "subscriptions", userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.log("ℹ️ No hay suscripción.");
      dispatch(setPremium(false));
      await setDoc(doc(db, "users", userId), { isPremium: false }, { merge: true });
      return;
    }

    const data = snap.data();
    const exp = data.expiresAt?.toDate ? data.expiresAt.toDate() : null;
    const now = new Date();

    if (!exp || now > exp) {
      console.log("⏰ Suscripción vencida.");
      await setDoc(ref, { isActive: false, updatedAt: serverTimestamp() }, { merge: true });
      await setDoc(doc(db, "users", userId), { isPremium: false }, { merge: true });
      dispatch(setPremium(false));
      return;
    }

    if (data.isActive) {
      console.log("💎 Suscripción activa:", data.planName);
      dispatch(subscribePlan({
        id: data.planId,
        name: data.planName,
        price: data.pricePaid,
        currency: data.currency,
        expiresAt: exp.toISOString(),
      }));
      dispatch(setPremium(true));
      await setDoc(doc(db, "users", userId), { isPremium: true }, { merge: true });
    } else {
      console.log("⚠️ Suscripción inactiva.");
      dispatch(setPremium(false));
      await setDoc(doc(db, "users", userId), { isPremium: false }, { merge: true });
    }
  } catch (e) {
    console.error("❌ Error al verificar suscripción:", e);
  }
};
