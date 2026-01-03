/**
 * @file src/data/characterQuiz.ts
 * @description Character quiz logic and archetypes
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-005-social.md
 */

import { PlayerStats, CharacterArchetype, QuizResultData } from '../types/game.types';

export const QUIZ_ARCHETYPES: Record<CharacterArchetype, QuizResultData> = {
  'Karen from HR': {
    archetype: 'Karen from HR',
    description: 'You love rules more than people. Your "per my last email" is lethal.',
    stats: { reputation: 90, chaos: 10, stealth: 50 },
  },
  'Chad the Disruptor': {
    archetype: 'Chad the Disruptor',
    description: 'You say "synergy" unironically and schedule meetings about meetings.',
    stats: { reputation: 70, chaos: 60, stealth: 20 },
  },
  'Dave from IT': {
    archetype: 'Dave from IT',
    description: 'You fixed the Wi-Fi but refused to explain how. You live in the server room.',
    stats: { reputation: 40, chaos: 30, stealth: 90 },
  },
  'The Ghost': {
    archetype: 'The Ghost',
    description: 'You have collected a paycheck for 30 days without being seen once.',
    stats: { reputation: 50, chaos: 50, stealth: 95 },
  },
  'Gary the Intern': {
    archetype: 'Gary the Intern',
    description: 'You are just trying your best. It is not going well.',
    stats: { reputation: 20, chaos: 20, stealth: 20 },
  },
  'Linda the Micromanager': {
    archetype: 'Linda the Micromanager',
    description: 'You need an update on that thing. Right now. And 5 minutes ago.',
    stats: { reputation: 80, chaos: 80, stealth: 10 },
  },
};

export function determineArchetype(stats: PlayerStats): CharacterArchetype {
  const { reputation, chaos, stealth } = stats;

  if (reputation > 70 && chaos < 40) return 'Karen from HR';
  if (reputation > 60 && chaos > 40 && chaos < 80) return 'Chad the Disruptor';
  if (stealth > 70 && reputation < 50) return 'Dave from IT';
  if (stealth > 80 && chaos > 40) return 'The Ghost';
  if (reputation > 70 && chaos > 70) return 'Linda the Micromanager';
  
  // Default fallback or low stats
  return 'Gary the Intern';
}

