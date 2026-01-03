/**
 * @file src/components/OfficeBadgeCard.tsx
 * @description Generates an office badge image for sharing
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-005-social.md
 */

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { OfficeBadgeData } from '../types/game.types';

interface Props {
  data: OfficeBadgeData;
}

export const OfficeBadgeCard = forwardRef<ViewShot, Props>(({ data }, ref) => {
  return (
    <ViewShot ref={ref} options={{ format: 'png', quality: 0.9 }}>
      <View style={styles.card}>
        <View style={styles.badgeHeader}>
          <Text style={styles.headerText}>EMPLOYEE OF THE MONTH</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.photoArea}>
            <Text style={styles.photoEmoji}>🤡</Text>
          </View>
          
          <View style={styles.details}>
            <Text style={styles.nameLabel}>Name:</Text>
            <Text style={styles.nameValue}>{data.playerName}</Text>
            
            <Text style={styles.titleLabel}>Title:</Text>
            <Text style={styles.titleValue}>{data.title}</Text>
            
            <Text style={styles.idLabel}>ID: #{Math.floor(Math.random() * 9000) + 1000}</Text>
          </View>
        </View>

        <View style={styles.statsBar}>
          <Text style={styles.statText}>Days: {data.daysSurvived}</Text>
          <Text style={styles.statText}>Chaos: {data.stats.chaos}%</Text>
          <Text style={styles.statText}>Stealth: {data.stats.stealth}%</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.endingText}>Ending: "{data.ending}" 🏆</Text>
          <Text style={styles.branding}>CORPORATE CHAOS</Text>
        </View>
      </View>
    </ViewShot>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 350,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeHeader: {
    backgroundColor: '#16213e',
    padding: 12,
    alignItems: 'center',
  },
  headerText: {
    color: '#4ecca3',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  content: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  photoArea: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 16,
  },
  photoEmoji: {
    fontSize: 40,
  },
  details: {
    flex: 1,
  },
  nameLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
  },
  nameValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  titleLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
  },
  titleValue: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  idLabel: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  statText: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  endingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16213e',
    marginBottom: 8,
  },
  branding: {
    fontSize: 10,
    color: '#aaa',
    letterSpacing: 2,
  },
});

