/**
 * @file app/achievements.tsx
 * @description Achievement gallery screen
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-006-polish.md
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../src/stores/gameStore';
import { ACHIEVEMENTS, ACHIEVEMENT_REQUIREMENTS, AchievementId } from '../src/types/game.types';
import { AnimatedCard } from '../src/components/AnimatedCard';

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { unlocked, progress } = useGameStore();

  const achievementIds = Object.keys(ACHIEVEMENTS) as AchievementId[];
  
  // Sort: Unlocked first, then by ID
  const sortedIds = achievementIds.sort((a, b) => {
    const aUnlocked = unlocked.includes(a);
    const bUnlocked = unlocked.includes(b);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Achievements</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          Unlocked: {unlocked.length}/{achievementIds.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {sortedIds.map((id, index) => {
          const achievement = ACHIEVEMENTS[id];
          const isUnlocked = unlocked.includes(id);
          const currentProgress = progress[id] || 0;
          const required = ACHIEVEMENT_REQUIREMENTS[id];
          const progressPercent = Math.min(100, Math.floor((currentProgress / required) * 100));

          return (
            <AnimatedCard key={id} delay={index * 50} style={[styles.card, !isUnlocked && styles.cardLocked]}>
              <View style={[styles.iconContainer, !isUnlocked && styles.iconLocked]}>
                <Text style={styles.icon}>{isUnlocked ? achievement.icon : '🔒'}</Text>
              </View>
              
              <View style={styles.info}>
                <Text style={[styles.cardTitle, !isUnlocked && styles.textLocked]}>
                  {isUnlocked ? achievement.title : 'Locked Achievement'}
                </Text>
                <Text style={styles.cardDesc}>
                  {isUnlocked ? achievement.description : '???'}
                </Text>
                
                {!isUnlocked && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                  </View>
                )}
              </View>
            </AnimatedCard>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#aaa',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#eee',
    fontFamily: 'monospace',
  },
  placeholder: {
    width: 60,
  },
  statsBar: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#16213e',
  },
  statsText: {
    color: '#4ecca3',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ecca3',
    gap: 16,
  },
  cardLocked: {
    borderColor: '#333',
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#2d3a4f',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLocked: {
    backgroundColor: '#0f172a',
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  cardTitle: {
    color: '#eee',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  textLocked: {
    color: '#888',
  },
  cardDesc: {
    color: '#aaa',
    fontSize: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#0f172a',
    borderRadius: 2,
    marginTop: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#888',
  },
});

