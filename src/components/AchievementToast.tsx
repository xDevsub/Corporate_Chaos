/**
 * @file src/components/AchievementToast.tsx
 * @description Global achievement unlock notification
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-006-polish.md
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence, 
  withTiming, 
  withSpring,
  runOnJS,
  SlideInTop,
  SlideOutTop
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../stores/gameStore';
import { ACHIEVEMENTS } from '../types/game.types';
import { audioManager } from '../utils/audioManager';
import { shareText } from '../utils/shareUtils';

export const AchievementToast = () => {
  const { lastUnlocked, clearLastUnlocked } = useGameStore();
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    if (lastUnlocked) {
      audioManager.play('victory_fanfare');
      
      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        clearLastUnlocked();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [lastUnlocked, clearLastUnlocked]);

  if (!lastUnlocked) return null;

  const achievement = ACHIEVEMENTS[lastUnlocked];

  const handleShare = () => {
    shareText(`🏆 Achievement Unlocked: ${achievement.title}\n"${achievement.description}"\n\nPlay Corporate Chaos!`);
  };

  return (
    <Animated.View 
      entering={SlideInTop.springify()} 
      exiting={SlideOutTop}
      style={[styles.container, { top: insets.top + 10 }]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🏆</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.header}>ACHIEVEMENT UNLOCKED!</Text>
          <Text style={styles.title}>{achievement.icon} {achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Pressable onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareText}>📤 SHARE</Text>
        </Pressable>
        <Pressable onPress={clearLastUnlocked} style={styles.okButton}>
          <Text style={styles.okText}>OK</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#16213e',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f39c12',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#2d3a4f',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  header: {
    color: '#f39c12',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  title: {
    color: '#eee',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#aaa',
    fontSize: 12,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  shareButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  shareText: {
    color: '#4ecca3',
    fontWeight: '600',
    fontSize: 12,
  },
  okButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  okText: {
    color: '#eee',
    fontWeight: '600',
    fontSize: 12,
  },
});

