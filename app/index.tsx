/**
 * @file app/index.tsx
 * @description Home/Menu screen for Corporate Chaos
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-001-core-game.md
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../src/stores/gameStore';
import { getCachedScenarios } from '../src/utils/scenarioCache';
import { setupDailyNotifications } from '../src/utils/notifications';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const {
    startNewGame,
    startDailyStandup,
    checkDailyReset,
    totalGamesPlayed,
    endingsUnlocked,
    coffeeTokens,
    dailyStandupCompleted,
    dailyStreak,
  } = useGameStore();

  useEffect(() => {
    checkDailyReset();
    setupDailyNotifications();
  }, []);

  const handleStartGame = () => {
    startNewGame();
    router.push('/game');
  };

  const handleDailyStandup = async () => {
    const scenarios = await getCachedScenarios();
    // Shuffle and pick 3 random scenarios for the standup
    const shuffled = [...scenarios].sort(() => 0.5 - Math.random());
    const selection = shuffled.slice(0, 3).map(s => s.id);
    
    startDailyStandup(selection);
    router.push('/game');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🏢</Text>
        <Text style={styles.title}>Corporate Chaos</Text>
        <Text style={styles.subtitle}>The World's Worst Employee Simulator</Text>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalGamesPlayed}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{endingsUnlocked.length}/8</Text>
          <Text style={styles.statLabel}>Endings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>☕ {coffeeTokens}</Text>
          <Text style={styles.statLabel}>Tokens</Text>
        </View>
      </View>

      {/* Main Menu */}
      <View style={styles.menu}>
        {/* Daily Standup Button */}
        <Pressable
          style={[
            styles.menuButton,
            styles.dailyButton,
            dailyStandupCompleted && styles.buttonDisabled,
          ]}
          onPress={handleDailyStandup}
          disabled={dailyStandupCompleted}
        >
          <Text style={styles.buttonEmoji}>☕</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>
              {dailyStandupCompleted ? 'Standup Complete' : 'Daily Standup'}
            </Text>
            <Text style={styles.buttonSubtitle}>
              {dailyStandupCompleted 
                ? `🔥 ${dailyStreak} day streak` 
                : '3 quick scenarios • Earn tokens'}
            </Text>
          </View>
        </Pressable>

        {/* New Game Button */}
        <Pressable
          style={[styles.menuButton, styles.primaryButton]}
          onPress={handleStartGame}
        >
          <Text style={styles.buttonEmoji}>🎮</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={[styles.buttonTitle, { color: '#1a1a2e' }]}>New Game</Text>
            <Text style={[styles.buttonSubtitle, { color: 'rgba(26,26,46,0.7)' }]}>Survive 30 days of corporate chaos</Text>
          </View>
        </Pressable>

        {/* Achievements Button */}
        <Pressable
          style={[styles.menuButton, styles.secondaryButton]}
          onPress={() => router.push('/achievements')}
        >
          <Text style={styles.buttonEmoji}>🏆</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>Achievements</Text>
            <Text style={styles.buttonSubtitle}>Track your corporate misdeeds</Text>
          </View>
        </Pressable>

        {/* Settings Button */}
        <Pressable
          style={[styles.menuButton, styles.secondaryButton]}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.buttonEmoji}>⚙️</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>Settings</Text>
            <Text style={styles.buttonSubtitle}>Sound, notifications, and more</Text>
          </View>
        </Pressable>
      </View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#eee',
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    fontFamily: 'monospace',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ecca3',
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  menu: {
    flex: 1,
    gap: 12,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dailyButton: {
    backgroundColor: '#2d3a4f',
    borderColor: '#4ecca3',
  },
  primaryButton: {
    backgroundColor: '#4ecca3',
    borderColor: '#4ecca3',
  },
  secondaryButton: {
    backgroundColor: '#16213e',
    borderColor: '#333',
  },
  buttonDisabled: {
    opacity: 0.6,
    borderColor: '#333',
  },
  buttonEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  buttonSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    color: '#555',
    fontSize: 12,
    marginBottom: 20,
  },
});
