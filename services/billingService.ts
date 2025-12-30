import {
  initConnection,
  endConnection,
  requestPurchase,
  fetchProducts,
  finishTransaction,
  type Purchase,
  type ProductOrSubscription,
} from 'react-native-iap';

export type BillingProduct = ProductOrSubscription;

export const SUBSCRIPTION_IDS = [
  'chefskills_premium_1m',
  'chefskills_premium_3m',
  'chefskills_premium_6m',
  'chefskills_premium_12m',
];

export async function initBilling(): Promise<void> {
  try {
    await initConnection();
    console.log("✅ Conexión con IAP establecida");
  } catch (e) {
    console.error('❌ Error en initBilling:', e);
  }
}

export async function getSubscriptionProducts(): Promise<BillingProduct[]> {
  try {
    const items = await fetchProducts({ skus: SUBSCRIPTION_IDS, type: 'subs' });
    return (items as unknown as BillingProduct[]) || [];
  } catch (e) {
    console.error("❌ Error fetchProducts:", e);
    return [];
  }
}

export async function purchaseSubscription(productId: string, offerToken: string): Promise<Purchase | null> {
  try {
    // Estructura obligatoria para v14.6.2 en Android
const res = await requestPurchase({
  request: {
    android: { // NO use 'google', el log te pide 'android'
      skus: [productId],
      subscriptionOffers: [{ sku: productId, offerToken }],
    }
  },
  type: 'subs'
});
    return Array.isArray(res) ? res[0] : (res as Purchase);
  } catch (e: any) {
    console.error("❌ Error en la compra:", e.message);
    throw e;
  }
}

export async function acknowledgePurchase(purchase: Purchase): Promise<void> {
  try {
    // Evita reembolsos automáticos tras 3 días
    await finishTransaction({ purchase, isConsumable: false });
    console.log("✅ Transacción confirmada en Google Play");
  } catch (e) {
    console.error("❌ Error al confirmar transacción:", e);
  }
}

export async function endBilling(): Promise<void> {
  try {
    await endConnection();
  } catch (e) {
    console.error("❌ Error al cerrar IAP:", e);
  }
}