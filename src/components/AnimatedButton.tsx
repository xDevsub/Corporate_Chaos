/**
 * @file src/components/AnimatedButton.tsx
 * @description Button component with press scaling animation
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-006-polish.md
 */

import React from 'react';
import { Pressable, StyleProp, ViewStyle, PressableProps } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';

interface AnimatedButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  style, 
  onPressIn,
  onPressOut,
  ...props 
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.95);
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1);
    onPressOut?.(e);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

