// services/subscriptionService.ts
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

interface SubscriptionPayload {
  planId: string;
  planName: string;
  pricePaid: number;
  currency: string;
  purchaseProvider: string; // "google_play" | "app_store" | "server"
  flashSaleApplied: boolean;
}

export const subscribeUser = async (userId: string, payload: SubscriptionPayload) => {
  const ref = doc(db, "subscriptions", userId);

  const subscriptionDoc = {
    ...payload,
    userId,
    purchaseDate: serverTimestamp(),
    isActive: true,
    expiresAt: null, // luego calculamos según plan
  };

  await setDoc(ref, subscriptionDoc, { merge: true });
  return subscriptionDoc;
};
