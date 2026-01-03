import * as InAppPurchases from 'expo-in-app-purchases';
import type { ProductId } from '../types/game.types';

const PRODUCT_IDS: ProductId[] = ['coffee_badge', 'executive_pack', 'chaos_lord'];

let initialized = false;

async function ensureInitialized() {
  if (initialized) return;
  try {
    await InAppPurchases.connectAsync();
    initialized = true;
  } catch (error) {
    if (__DEV__) {
      console.warn('[IAP] Failed to initialize', error);
    }
    throw error;
  }
}

export async function initializeIAP() {
  await ensureInitialized();
  try {
    const { results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
    return results;
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
        ?.map((p) => p.productId as ProductId)
        ?.filter((id): id is ProductId => PRODUCT_IDS.includes(id as ProductId)) ?? [];
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

