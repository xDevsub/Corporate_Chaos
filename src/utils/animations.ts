/**
 * @file src/utils/animations.ts
 * @description Reanimated 2/3 animation presets
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-006-polish.md
 */

import { 
    withSpring, 
    withSequence, 
    withTiming, 
    Easing,
    WithSpringConfig,
    WithTimingConfig
  } from 'react-native-reanimated';
  
  export const ANIMATIONS = {
    // Wiggle effect for consequences
    wiggle: () => withSequence(
      withTiming(-2, { duration: 75 }),
      withTiming(2, { duration: 75 }),
      withTiming(-2, { duration: 75 }),
      withTiming(0, { duration: 75 }),
    ),
    
    // Punch-in effect for dramatic reveals
    punchIn: () => withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1),
    ),
    
    // Button press/release
    buttonPress: withSpring(0.95),
    buttonRelease: withSpring(1),
    
    // Card entry animation config
    cardEnter: {
      opacity: withTiming(1, { duration: 300 }),
      translateY: withSpring(0, { damping: 15 }),
    },
    
    // Stat change spring config
    statChangeSpring: {
        damping: 10,
        stiffness: 100,
    } as WithSpringConfig,
  };

