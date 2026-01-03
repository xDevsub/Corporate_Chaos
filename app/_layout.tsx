/**
 * @file app/_layout.tsx
 * @description Root layout for Corporate Chaos app
 * @platform React Native (Expo)
 */

import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../src/stores/gameStore';
import { ensureScenariosCached } from '../src/utils/scenarioCache';
import { trackEvent } from '../src/utils/analytics';
import { AchievementToast } from '../src/components/AchievementToast';

export default function RootLayout() {
  const checkDailyReset = useGameStore((state) => state.checkDailyReset);
  const sessionStartRef = useRef<number>(Date.now());

  // Check for daily reset on app launch
  useEffect(() => {
    checkDailyReset();
    ensureScenariosCached().catch(() => {
      // Fallback handled in helper; keep silent here
    });
    trackEvent('session_start', {
      days_since_install: null,
      is_first_session_today: true,
    });

    return () => {
      const durationSeconds = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      trackEvent('session_end', {
        session_duration_seconds: durationSeconds,
      });
    };
  }, [checkDailyReset]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AchievementToast />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: styles.content,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="game" />
        <Stack.Screen name="ending" />
        <Stack.Screen 
          name="boss-button" 
          options={{ 
            presentation: 'fullScreenModal',
            animation: 'none',
          }} 
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    backgroundColor: '#1a1a2e',
  },
});

