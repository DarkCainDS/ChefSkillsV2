// types/Plan.ts
export interface Plan {
  id: string;               // "plan_monthly_basic"
  name: string;             // "ChefSkills Basic (1 mes)"
  description: string;

  durationMonths: number;   // 1, 3, 6, 12
  favoritesBoost: number;   // 0, 5, 10, 20

  isActive: boolean;

  // 🔑 clave de unión con Google Play Billing
  billingProductId: string; // "chefskills_premium_1m"
}
