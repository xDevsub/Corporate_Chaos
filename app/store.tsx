/**
 * @file app/store.tsx
 * @description IAP Store screen
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-004-monetization.md
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../src/stores/gameStore';
import { purchaseProduct, restorePurchases, initializeIAP } from '../src/utils/iapManager';
import type { ProductId } from '../src/types/game.types';

type PurchaseState = 'idle' | 'loading';

const PRODUCTS: Array<{
  id: ProductId;
  title: string;
  price: string;
  benefits: string[];
  accent: string;
  highlight?: boolean;
}> = [
  {
    id: 'coffee_badge',
    title: '☕ Coffee Badge',
    price: '$1.99',
    benefits: ['Remove interstitial ads', 'Exclusive "VIP" badge'],
    accent: '#4ecca3',
  },
  {
    id: 'executive_pack',
    title: '🎩 Executive Pack',
    price: '$4.99',
    benefits: ['Everything in Coffee Badge', '20 premium scenarios', '5 exclusive outfits'],
    accent: '#f39c12',
  },
  {
    id: 'chaos_lord',
    title: '👑 Chaos Lord Bundle',
    price: '$9.99',
    benefits: ['Everything in Executive Pack', 'All future scenarios free', 'Exclusive "CEO" ending', 'Name in credits', 'Golden badge'],
    accent: '#e74c3c',
    highlight: true,
  },
];

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const { purchasedProducts, hasRemoveAds, isPremium, setPurchasedProducts } = useGameStore();
  const [purchaseState, setPurchaseState] = useState<Record<ProductId, PurchaseState>>({
    coffee_badge: 'idle',
    executive_pack: 'idle',
    chaos_lord: 'idle',
  });
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    initializeIAP().catch(() => {
      if (__DEV__) {
        console.warn('[IAP] init failed');
      }
    });
  }, []);

  const handlePurchase = async (productId: ProductId) => {
    setPurchaseState((s) => ({ ...s, [productId]: 'loading' }));
    const success = await purchaseProduct(productId);
    setPurchaseState((s) => ({ ...s, [productId]: 'idle' }));
    if (success) {
      const updated = Array.from(new Set([...purchasedProducts, productId]));
      setPurchasedProducts(updated);
      Alert.alert('Purchase successful', 'Thanks for supporting Corporate Chaos!');
    } else {
      Alert.alert('Purchase failed', 'Please try again later.');
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const restored = await restorePurchases();
    setRestoring(false);
    if (restored.length) {
      const updated = Array.from(new Set([...purchasedProducts, ...restored]));
      setPurchasedProducts(updated);
      Alert.alert('Restored', 'Your purchases have been restored.');
    } else {
      Alert.alert('No purchases found', 'We could not find past purchases.');
    }
  };

  const renderBenefits = (benefits: string[]) => (
    <View style={styles.benefits}>
      {benefits.map((b) => (
        <Text key={b} style={styles.benefitItem}>• {b}</Text>
      ))}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.header}>💼 Corporate Perks</Text>
      <View style={styles.badges}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Remove Ads</Text>
          <Text style={styles.badgeValue}>{hasRemoveAds ? '✅' : '❌'}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Premium</Text>
          <Text style={styles.badgeValue}>{isPremium ? '✅' : '❌'}</Text>
        </View>
      </View>

      {PRODUCTS.map((product) => {
        const owned = purchasedProducts.includes(product.id);
        const loading = purchaseState[product.id] === 'loading';
        return (
          <View
            key={product.id}
            style={[
              styles.card,
              { borderColor: product.accent },
              product.highlight && styles.highlightCard,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{product.title}</Text>
              <Text style={[styles.price, { color: product.accent }]}>{owned ? 'Owned' : product.price}</Text>
            </View>
            {renderBenefits(product.benefits)}
            <Pressable
              style={[
                styles.button,
                { backgroundColor: owned ? '#555' : product.accent },
                loading && styles.buttonDisabled,
              ]}
              onPress={() => handlePurchase(product.id)}
              disabled={owned || loading}
            >
              {loading ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <Text style={styles.buttonText}>{owned ? 'Owned' : 'Purchase'}</Text>
              )}
            </Pressable>
          </View>
        );
      })}

      <Pressable
        style={[styles.restoreButton, restoring && styles.buttonDisabled]}
        onPress={handleRestore}
        disabled={restoring}
      >
        {restoring ? (
          <ActivityIndicator color="#1a1a2e" />
        ) : (
          <Text style={styles.restoreText}>Restore Purchases</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    color: '#eee',
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  badgeLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  badgeValue: {
    color: '#4ecca3',
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  highlightCard: {
    borderColor: '#e74c3c',
    shadowColor: '#e74c3c',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  benefits: {
    gap: 4,
    marginBottom: 12,
  },
  benefitItem: {
    color: '#ccc',
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '700',
  },
  restoreButton: {
    backgroundColor: '#4ecca3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  restoreText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '700',
  },
});

