/**
 * @file app/ending.tsx
 * @description Ending screen showing game results
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-001-core-game.md
 */

import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import { useGameStore } from '../src/stores/gameStore';
import { ENDINGS } from '../src/types/game.types';
import { showInterstitial } from '../src/utils/adManager';
import { trackEvent } from '../src/utils/analytics';
import { captureAndShare } from '../src/utils/shareUtils';
import { FiringLetterCard } from '../src/components/FiringLetterCard';
import { OfficeBadgeCard } from '../src/components/OfficeBadgeCard';

export default function EndingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const letterRef = useRef<ViewShot>(null);
  const badgeRef = useRef<ViewShot>(null);
  
  const {
    stats,
    daysSurvived,
    currentEnding,
    returnToMenu,
    startNewGame,
    hasRemoveAds,
  } = useGameStore();

  const ending = currentEnding ? ENDINGS[currentEnding] : null;

  useEffect(() => {
    if (currentEnding) {
      trackEvent('ending_reached', {
        ending_id: currentEnding,
        days_survived: daysSurvived,
        final_stats: stats,
      });
    }

    if (!hasRemoveAds) {
      showInterstitial().catch(() => {});
    }
  }, [hasRemoveAds, currentEnding, daysSurvived, stats]);

  const handlePlayAgain = () => {
    startNewGame();
    router.replace('/game');
  };

  const handleMainMenu = () => {
    returnToMenu();
    router.replace('/');
  };

  const handleShareLetter = () => {
    captureAndShare(letterRef, 'firing_letter');
  };

  const handleShareBadge = () => {
    captureAndShare(badgeRef, 'office_badge');
  };

  if (!ending) return null;

  // Prepare data for share cards
  const letterData = {
    playerName: 'Employee #42', // TODO: Add name input later
    terminationReason: ending.description,
    daysSurvived,
    reputation: stats.reputation,
    chaos: stats.chaos,
    stealth: stats.stealth,
    endingType: ending.id,
  };

  const badgeData = {
    playerName: 'Employee #42',
    title: ending.title,
    stats,
    ending: ending.id,
    daysSurvived,
  };

  return (
    <ScrollView 
      style={[styles.container]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 40, paddingBottom: 40 }]}
    >
      {/* Hidden view shots for sharing */}
      <View style={styles.hiddenContainer}>
        <FiringLetterCard ref={letterRef} data={letterData} />
        <OfficeBadgeCard ref={badgeRef} data={badgeData} />
      </View>

      <View style={styles.endingBadge}>
        <Text style={styles.endingEmoji}>{ending.emoji}</Text>
      </View>

      <Text style={styles.endingTitle}>{ending.title}</Text>
      <Text style={styles.endingDescription}>{ending.description}</Text>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>FINAL PERFORMANCE REVIEW</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={styles.statValue}>{daysSurvived}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={styles.statValue}>{stats.reputation}</Text>
            <Text style={styles.statLabel}>Rep</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🌀</Text>
            <Text style={styles.statValue}>{stats.chaos}</Text>
            <Text style={styles.statLabel}>Chaos</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.shareButton} onPress={handleShareLetter}>
          <Text style={styles.shareButtonText}>📤 Share Firing Letter</Text>
        </Pressable>

        <Pressable style={[styles.shareButton, styles.badgeButton]} onPress={handleShareBadge}>
          <Text style={styles.shareButtonText}>📛 Share Office Badge</Text>
        </Pressable>

        <Pressable style={styles.playAgainButton} onPress={handlePlayAgain}>
          <Text style={styles.playAgainButtonText}>🔄 Play Again</Text>
        </Pressable>

        <Pressable style={styles.menuButton} onPress={handleMainMenu}>
          <Text style={styles.menuButtonText}>🏠 Main Menu</Text>
        </Pressable>
      </View>
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
    alignItems: 'center',
  },
  hiddenContainer: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    opacity: 0,
  },
  endingBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#4ecca3',
  },
  endingEmoji: {
    fontSize: 50,
  },
  endingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4ecca3',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  endingDescription: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  statsTitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eee',
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#d32f2f',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff5252',
    alignItems: 'center',
  },
  badgeButton: {
    backgroundColor: '#2d3a4f',
    borderColor: '#4ecca3',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  playAgainButton: {
    backgroundColor: '#4ecca3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  playAgainButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  menuButton: {
    padding: 16,
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 16,
    color: '#888',
  },
});
