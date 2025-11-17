// types/Plan.ts
export interface Plan {
  id: string;               // "plan_monthly_basic"
  name: string;             // "ChefSkills Basic (1 mes)"
  durationMonths: number;   // 1, 3, 6, 12
  basePriceCents: number;   // 349, 942, etc.
  currency: string;         // "USD"
  description: string;
  favoritesBoost: number;   // 0, 5, 10, 20
  isActive: boolean;
}
