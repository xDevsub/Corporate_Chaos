/**
 * @file src/components/AnimatedStatChange.tsx
 * @description Animated stat change indicator
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-006-polish.md
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';

interface AnimatedStatChangeProps {
  label: string;
  emoji: string;
  value: number;
  delta: number;
}

export const AnimatedStatChange: React.FC<AnimatedStatChangeProps> = ({
  label,
  emoji,
  value,
  delta,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Reset
    opacity.value = 0;
    translateY.value = 10;
    scale.value = 1;

    // Enter animation
    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withSpring(0);
    
    // Punch in
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1)
    );
  }, [delta, value]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
  }));

  const deltaColor = delta > 0 ? '#4ecca3' : delta < 0 ? '#f39c12' : '#aaa';
  const deltaPrefix = delta > 0 ? '+' : '';

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.label}>{emoji} {value}</Text>
      <Text style={[styles.delta, { color: deltaColor }]}>
        {deltaPrefix}{delta}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#eee',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  delta: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});

