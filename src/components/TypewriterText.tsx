/**
 * @file src/components/TypewriterText.tsx
 * @description Animated typewriter text with skip + cursor support
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-006-polish.md
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export type TypewriterTextProps = {
  text: string;
  speed?: number;
  onComplete?: () => void;
  onType?: (count: number) => void;
  textStyle?: StyleProp<TextStyle>;
  cursorStyle?: StyleProp<TextStyle>;
  cursorChar?: string;
};

const MIN_SPEED_MS = 1;

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  onComplete,
  onType,
  textStyle,
  cursorStyle,
  cursorChar = '|',
}) => {
  const [displayedText, setDisplayedText] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCompletedRef = useRef(false);

  const cursorOpacity = useSharedValue(1);
  const animatedCursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const finishTyping = useCallback(() => {
    if (hasCompletedRef.current) {
      return;
    }
    clearIntervalRef();
    hasCompletedRef.current = true;
    setDisplayedText(text);
    onComplete?.();
  }, [clearIntervalRef, onComplete, text]);

  useEffect(() => {
    cursorOpacity.value = withRepeat(withTiming(0, { duration: 600 }), -1, true);
  }, [cursorOpacity]);

  useEffect(() => {
    clearIntervalRef();
    hasCompletedRef.current = false;
    setDisplayedText('');

    const target = text ?? '';
    if (target.length === 0) {
      finishTyping();
      return () => clearIntervalRef();
    }

    let index = 0;
    intervalRef.current = setInterval(() => {
      index += 1;
      const nextText = target.slice(0, index);
      setDisplayedText(nextText);
      onType?.(index);

      if (index >= target.length) {
        finishTyping();
      }
    }, Math.max(speed, MIN_SPEED_MS));

    return () => {
      clearIntervalRef();
    };
  }, [clearIntervalRef, finishTyping, onType, speed, text]);

  const handleSkip = useCallback(() => {
    finishTyping();
  }, [finishTyping]);

  return (
    <Pressable onPress={handleSkip} testID="typewriter-text-container">
      <Text style={[styles.text, textStyle]} testID="typewriter-text-content">
        {displayedText}
        <Animated.Text style={[styles.cursor, animatedCursorStyle, cursorStyle]}>
          {cursorChar}
        </Animated.Text>
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  cursor: {
    fontWeight: 'bold',
  },
});

export default TypewriterText;

