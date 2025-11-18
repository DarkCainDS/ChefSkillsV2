// ============================================================================
// 🧾 transactionService.ts — FINAL
// Maneja historial de compras REAL, alineado con subscribeUser()
// ============================================================================

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

// ============================================================================
// 🟩 createTransaction — Guarda una compra del usuario
// ============================================================================
export const createTransaction = async (
  userId: string,
  payload: {
    planId: string;
    planName: string;
    durationMonths: number;

    pricePaid: number;
    currency: string;

    expiresAt: string; // viene directo desde subscribeUser()

    paymentProvider: string; // google_play / internal
    purchaseToken: string | null;
  }
) => {
  try {
    const ref = collection(db, "transactions", userId, "items");

    const data = {
      ...payload,
      userId,
      purchasedAt: serverTimestamp(),
      status: "completed",
    };

    await addDoc(ref, data);

    console.log("🧾 Transacción registrada correctamente →", data);
    return true;
  } catch (error) {
    console.error("❌ Error creando transacción:", error);
    return false;
  }
};

// ============================================================================
// 🟦 getUserTransactions — Historial completo del usuario
// ============================================================================
export const getUserTransactions = async (userId: string) => {
  try {
    const ref = collection(db, "transactions", userId, "items");

    const q = query(ref, orderBy("purchasedAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (error) {
    console.error("❌ Error obteniendo historial:", error);
    return [];
  }
};
