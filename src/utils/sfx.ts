/**
 * @file src/utils/sfx.ts
 * @description Legacy SFX adapter for AudioManager
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-006-polish.md
 */

import { audioManager } from './audioManager';
import { SoundEffectId } from '../types/scenario.types';

export async function playSfx(effect: SoundEffectId | null | string) {
  if (!effect || effect === 'none') return;
  await audioManager.play(effect);
}
