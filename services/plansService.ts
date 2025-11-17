// services/plansService.ts
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Plan } from "../components/types/plan";

// Trae todos los planes activos (para el Marketplace)
export async function getActivePlans(): Promise<Plan[]> {
  const q = query(
    collection(db, "plans"),
    where("isActive", "==", true)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Plan);
}

// Trae un plan específico (por si lo necesitas en el watcher global)
export async function getPlanById(planId: string): Promise<Plan | null> {
  const ref = doc(db, "plans", planId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as Plan;
}
