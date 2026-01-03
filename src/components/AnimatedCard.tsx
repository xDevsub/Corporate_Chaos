/**
 * @file src/components/AnimatedCard.tsx
 * @description Card component with entry animation
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-006-polish.md
 */

import React, { useEffect } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withDelay, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  style, 
  delay = 0 
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

