/**
 * @file src/components/CharacterQuizResult.tsx
 * @description Renders the character quiz result card
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-005-social.md
 */

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { QuizResultData } from '../types/game.types';

interface Props {
  data: QuizResultData;
}

export const CharacterQuizResult = forwardRef<ViewShot, Props>(({ data }, ref) => {
  return (
    <ViewShot ref={ref} options={{ format: 'png', quality: 0.9 }}>
      <View style={styles.card}>
        <Text style={styles.header}>WHICH COWORKER ARE YOU?</Text>
        
        <Text style={styles.subHeader}>Based on your choices...</Text>
        
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>🧔</Text>
        </View>
        
        <Text style={styles.archetype}>{data.archetype.toUpperCase()}</Text>
        
        <View style={styles.quoteBox}>
          <Text style={styles.quote}>"{data.description}"</Text>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.statsHeader}>Your Stats:</Text>
        <View style={styles.statsList}>
          <Text style={styles.statItem}>• Reputation: {data.stats.reputation}%</Text>
          <Text style={styles.statItem}>• Chaos: {data.stats.chaos}%</Text>
          <Text style={styles.statItem}>• Stealth: {data.stats.stealth}%</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.branding}>Corporate Chaos App</Text>
        </View>
      </View>
    </ViewShot>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  header: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 48,
  },
  archetype: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 16,
    textAlign: 'center',
  },
  quoteBox: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  quote: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    width: '100%',
    marginBottom: 16,
  },
  statsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statsList: {
    width: '100%',
    gap: 4,
  },
  statItem: {
    fontSize: 14,
    color: '#444',
    fontFamily: 'monospace',
  },
  footer: {
    marginTop: 24,
  },
  branding: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 1,
  },
});

