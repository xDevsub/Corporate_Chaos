/**
 * @file app/referral.tsx
 * @description Referral system screen
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-005-social.md
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { useGameStore } from '../src/stores/gameStore';
import { shareText } from '../src/utils/shareUtils';
import { trackEvent } from '../src/utils/analytics';

export default function ReferralScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    myCode, 
    referredBy, 
    referralCount, 
    generateMyCode, 
    redeemReferral,
    coffeeTokens 
  } = useGameStore();
  
  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    // Generate code if missing
    if (!myCode) {
      generateMyCode();
    }

    // Check for deep link
    const handleDeepLink = async (event: { url: string }) => {
      const { queryParams } = Linking.parse(event.url);
      if (queryParams?.code && typeof queryParams.code === 'string') {
        setInputCode(queryParams.code);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const sub = Linking.addEventListener('url', handleDeepLink);
    return () => sub.remove();
  }, [myCode]);

  const handleShare = () => {
    const link = Linking.createURL('referral', { queryParams: { code: myCode } });
    const message = `Join me in Corporate Chaos! Use my code ${myCode} for free tokens. ${link}`;
    shareText(message);
    trackEvent('referral_shared', { code: myCode });
  };

  const handleRedeem = () => {
    if (!inputCode) return;
    
    if (inputCode === myCode) {
      Alert.alert('Nice Try', 'You cannot refer yourself.');
      return;
    }

    const success = redeemReferral(inputCode);
    if (success) {
      Alert.alert('Success!', 'Referral code redeemed. You got 3 Coffee Tokens! ☕');
      trackEvent('referral_redeemed', { code: inputCode });
    } else {
      Alert.alert('Error', 'Invalid code or already redeemed.');
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top + 20 }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.header}>🤝 Corporate Networking</Text>
      
      {/* My Code Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Referral Code</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{myCode || 'GENERATING...'}</Text>
        </View>
        <Text style={styles.helperText}>Share this code to earn rewards!</Text>
        
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤 Share Code</Text>
        </Pressable>
      </View>

      {/* Stats Section */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{referralCount}</Text>
          <Text style={styles.statLabel}>Friends Recruited</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>☕ {coffeeTokens}</Text>
          <Text style={styles.statLabel}>Your Tokens</Text>
        </View>
      </View>

      {/* Rewards Info */}
      <View style={styles.rewardsInfo}>
        <Text style={styles.rewardTitle}>Recruiter Rewards:</Text>
        <Text style={styles.rewardItem}>• 1 Friend: 5 Tokens</Text>
        <Text style={styles.rewardItem}>• 3 Friends: "Recruiter" Badge</Text>
        <Text style={styles.rewardItem}>• 5 Friends: 1 Week Ad-Free</Text>
        <Text style={styles.rewardItem}>• 10 Friends: "HR Spy" Outfit</Text>
      </View>

      {/* Redeem Section */}
      {!referredBy && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Have a Code?</Text>
          <TextInput
            style={styles.input}
            placeholder="CHAOS-XXXXX"
            placeholderTextColor="#666"
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="characters"
          />
          <Pressable style={styles.redeemButton} onPress={handleRedeem}>
            <Text style={styles.redeemButtonText}>Redeem Code</Text>
          </Pressable>
        </View>
      )}

      {referredBy && (
        <View style={styles.redeemedInfo}>
          <Text style={styles.redeemedText}>✅ Referred by {referredBy}</Text>
        </View>
      )}

      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeButtonText}>Close</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'monospace',
  },
  section: {
    backgroundColor: '#16213e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeBox: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4ecca3',
  },
  codeText: {
    color: '#4ecca3',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#4ecca3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
  rewardsInfo: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  rewardTitle: {
    color: '#eee',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rewardItem: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  redeemButton: {
    backgroundColor: '#2d3a4f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ecca3',
  },
  redeemButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  redeemedInfo: {
    backgroundColor: 'rgba(78, 204, 163, 0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4ecca3',
  },
  redeemedText: {
    color: '#4ecca3',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

