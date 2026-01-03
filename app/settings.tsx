/**
 * @file app/settings.tsx
 * @description Settings screen with audio toggles
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-006-polish.md
 */

import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../src/stores/gameStore';
import { audioManager } from '../src/utils/audioManager';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    soundEnabled, 
    ambienceEnabled, 
    toggleSound, 
    toggleAmbience,
    resetAllProgress 
  } = useGameStore();

  const handleSoundToggle = () => {
    toggleSound();
    audioManager.setMuted(!soundEnabled ? false : true); // Logic inverted because state updates after? No, useGameStore is hook.
    // Actually, store updates state, then we sync with audioManager.
    // Better to sync in effect or just call both.
    // audioManager.setMuted(soundEnabled); // current value is true, we are turning off
  };

  // Sync effect
  React.useEffect(() => {
    audioManager.setMuted(!soundEnabled);
  }, [soundEnabled]);

  React.useEffect(() => {
    audioManager.setAmbianceMuted(!ambienceEnabled);
  }, [ambienceEnabled]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUDIO</Text>
          
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Sound Effects</Text>
              <Text style={styles.subLabel}>Clicks, pops, and fanfares</Text>
            </View>
            <Switch 
              value={soundEnabled} 
              onValueChange={toggleSound}
              trackColor={{ false: '#333', true: '#4ecca3' }}
              thumbColor={'#eee'}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Office Ambiance</Text>
              <Text style={styles.subLabel}>Background noise loops</Text>
            </View>
            <Switch 
              value={ambienceEnabled} 
              onValueChange={toggleAmbience}
              trackColor={{ false: '#333', true: '#4ecca3' }}
              thumbColor={'#eee'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Daily Standup</Text>
              <Text style={styles.subLabel}>Reminders at 9:00 AM</Text>
            </View>
            <Switch 
              value={true} 
              onValueChange={() => {}} 
              disabled 
              trackColor={{ false: '#333', true: '#4ecca3' }}
            />
          </View>
        </View>

        <View style={[styles.section, styles.dangerZone]}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>DANGER ZONE</Text>
          
          <Pressable 
            style={styles.dangerButton}
            onPress={() => {
              // Add alert confirmation here in real app
              resetAllProgress();
              router.replace('/');
            }}
          >
            <Text style={styles.dangerButtonText}>Reset All Progress</Text>
          </Pressable>
        </View>

        <Text style={styles.version}>v1.0.0 (Polish Build)</Text>
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 8,
  },
  label: {
    color: '#eee',
    fontSize: 16,
    fontWeight: '500',
  },
  subLabel: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  dangerZone: {
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  dangerTitle: {
    color: '#e74c3c',
  },
  dangerButton: {
    backgroundColor: '#2d1a1a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 20,
  },
});

