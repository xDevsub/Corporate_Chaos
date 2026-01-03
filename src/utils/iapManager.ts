// Safely import IAP with mock fallback for Expo Go
let InAppPurchases: any;

try {
  InAppPurchases = require('expo-in-app-purchases');
} catch (e) {
  console.warn('In-App Purchases not available (likely running in Expo Go). IAP will be mocked.');
  
  // Mock implementation
  InAppPurchases = {
    connectAsync: async () => Promise.resolve(),
    disconnectAsync: async () => Promise.resolve(),
    getProductsAsync: async () => Promise.resolve({ results: [] }),
    purchaseItemAsync: async () => Promise.resolve(),
    getPurchaseHistoryAsync: async () => Promise.resolve({ results: [] }),
  };
}

import type { ProductId } from '../types/game.types';

const PRODUCT_IDS: ProductId[] = ['coffee_badge', 'executive_pack', 'chaos_lord'];

let initialized = false;

async function ensureInitialized() {
  if (initialized) return;
  try {
    await InAppPurchases.connectAsync();
    initialized = true;
  } catch (error) {
    // In Expo Go or web, this might fail or be mocked
    if (__DEV__) {
      console.warn('[IAP] Failed to initialize (mocking or unavailable)', error);
    }
    // Don't throw if we want to degrade gracefully
    // throw error; 
    initialized = true; // Pretend we initialized
  }
}

export async function initializeIAP() {
  await ensureInitialized();
  try {
    const { results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
    return results || [];
  } catch (error) {
    if (__DEV__) {
      console.warn('[IAP] getProducts failed', error);
    }
    return [];
  }
}

export async function purchaseProduct(productId: ProductId): Promise<boolean> {
  try {
    await ensureInitialized();
    await InAppPurchases.purchaseItemAsync(productId);
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn('[IAP] purchase failed', productId, error);
    }
    return false;
  }
}

export async function restorePurchases(): Promise<ProductId[]> {
  try {
    await ensureInitialized();
    const history = await InAppPurchases.getPurchaseHistoryAsync();
    const ids =
      history?.results
        ?.map((p: any) => p.productId as ProductId)
        ?.filter((id: string): id is ProductId => PRODUCT_IDS.includes(id as ProductId)) ?? [];
    return Array.from(new Set(ids));
  } catch (error) {
    if (__DEV__) {
      console.warn('[IAP] restore failed', error);
    }
    return [];
  }
}

export async function disconnectIAP() {
  if (!initialized) return;
  try {
    await InAppPurchases.disconnectAsync();
  } catch (error) {
    if (__DEV__) {
      console.warn('[IAP] disconnect failed', error);
    }
  }
}
