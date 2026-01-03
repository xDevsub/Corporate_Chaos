/**
 * @file app/quiz-result.tsx
 * @description Screen displaying the character quiz result
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-005-social.md
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ViewShot from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CharacterQuizResult } from '../src/components/CharacterQuizResult.tsx';
import { determineArchetype, QUIZ_ARCHETYPES } from '../src/data/characterQuiz';
import { useGameStore } from '../src/stores/gameStore';
import { captureAndShare } from '../src/utils/shareUtils';

export default function QuizResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<ViewShot>(null);
  const { stats, startNewGame } = useGameStore();

  // Determine result
  const archetypeKey = determineArchetype(stats);
  const resultData = {
    ...QUIZ_ARCHETYPES[archetypeKey],
    stats: stats,
  };

  const handleShare = () => {
    captureAndShare(viewShotRef, 'quiz_result');
  };

  const handlePlayAgain = () => {
    startNewGame();
    router.replace('/game');
  };

  const handleHome = () => {
    router.replace('/');
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top + 20 }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Personality Match!</Text>
      
      <View style={styles.cardContainer}>
        <CharacterQuizResult ref={viewShotRef} data={resultData} />
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤 Share Result</Text>
        </Pressable>

        <Pressable style={styles.playButton} onPress={handlePlayAgain}>
          <Text style={styles.playButtonText}>🔄 Play Again</Text>
        </Pressable>

        <Pressable style={styles.homeButton} onPress={handleHome}>
          <Text style={styles.homeButtonText}>🏠 Home</Text>
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
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  cardContainer: {
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  actions: {
    width: '100%',
    paddingHorizontal: 32,
    gap: 16,
  },
  shareButton: {
    backgroundColor: '#4ecca3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  playButton: {
    backgroundColor: '#2d3a4f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ecca3',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  homeButton: {
    padding: 16,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    color: '#aaa',
  },
});

