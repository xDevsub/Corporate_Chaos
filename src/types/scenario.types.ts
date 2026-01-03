/**
 * @file src/types/scenario.types.ts
 * @description Scenario and character type definitions
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-002-scenarios.md
 */

import { z } from 'zod';

// ============================================================================
// CHARACTER SYSTEM
// ============================================================================

export type CharacterId = 
  | 'karen_hr'
  | 'chad_disruptor'
  | 'dave_it'
  | 'ghost_remote'
  | 'gary_intern'
  | 'linda_micromanager'
  | 'none';

export interface Character {
  id: CharacterId;
  name: string;
  emoji: string;
  archetype: string;
  catchphrase: string;
  color: string;
}

export const CHARACTERS: Record<CharacterId, Character> = {
  karen_hr: {
    id: 'karen_hr',
    name: 'Karen from HR',
    emoji: '👩‍💼',
    archetype: 'Passive-aggressive email queen',
    catchphrase: 'Per my last email...',
    color: '#E91E63',
  },
  chad_disruptor: {
    id: 'chad_disruptor',
    name: 'Chad the Disruptor',
    emoji: '🧔',
    archetype: 'Says "synergy" unironically',
    catchphrase: "Let's take this offline",
    color: '#2196F3',
  },
  dave_it: {
    id: 'dave_it',
    name: 'Dave from IT',
    emoji: '🧑‍💻',
    archetype: 'Knows everything, says nothing',
    catchphrase: 'Have you tried turning it off and on?',
    color: '#4CAF50',
  },
  ghost_remote: {
    id: 'ghost_remote',
    name: 'The Ghost',
    emoji: '👻',
    archetype: 'Never seen on camera',
    catchphrase: '*Slack message noises*',
    color: '#9C27B0',
  },
  gary_intern: {
    id: 'gary_intern',
    name: 'Gary the Intern',
    emoji: '😰',
    archetype: 'Terrified, too eager',
    catchphrase: 'Can I get anyone coffee?',
    color: '#FF9800',
  },
  linda_micromanager: {
    id: 'linda_micromanager',
    name: 'Linda',
    emoji: '😤',
    archetype: 'Your direct boss, nightmare fuel',
    catchphrase: 'Just checking in on that thing...',
    color: '#F44336',
  },
  none: {
    id: 'none',
    name: 'Random Coworker',
    emoji: '🧑‍💼',
    archetype: 'Just some person',
    catchphrase: '',
    color: '#607D8B',
  },
};

// ============================================================================
// SCENARIO CATEGORIES
// ============================================================================

export type ScenarioCategory = 
  | 'boss'
  | 'meeting'
  | 'email'
  | 'hr'
  | 'remote'
  | 'random';

export const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  boss: '👔 Boss',
  meeting: '📅 Meeting',
  email: '📧 Email',
  hr: '📋 HR',
  remote: '🏠 Remote',
  random: '🎲 Random',
};

// ============================================================================
// SOUND EFFECTS
// ============================================================================

export type SoundEffectId = 
  | 'sad_trombone'
  | 'cash_register'
  | 'record_scratch'
  | 'suspense_sting'
  | 'typing'
  | 'slack_ding'
  | 'footsteps'
  | 'dun_dun'
  | 'applause'
  | 'victory_fanfare'
  | 'none';

// ============================================================================
// STAT MODIFIERS
// ============================================================================

export interface StatModifier {
  reputation: number;  // -20 to +20
  chaos: number;       // -20 to +20
  stealth: number;     // -20 to +20
}

// ============================================================================
// CHOICE & SCENARIO
// ============================================================================

export interface Choice {
  id: string;
  text: string;
  consequence: string;
  statModifiers: StatModifier;
  sfx: SoundEffectId;
}

export interface Scenario {
  id: string;
  version: number;
  category: ScenarioCategory;
  character: CharacterId;
  text: string;
  choices: Choice[];
  triggersEnding?: 'fired_by_drone' | 'replaced_by_ai' | 'none';
}

export interface ScenariosData {
  version: number;
  scenarios: Scenario[];
}

// ============================================================================
// ZOD SCHEMAS (for validation)
// ============================================================================

export const StatModifierSchema = z.object({
  reputation: z.number().min(-20).max(20).default(0),
  chaos: z.number().min(-20).max(20).default(0),
  stealth: z.number().min(-20).max(20).default(0),
});

export const ChoiceSchema = z.object({
  id: z.string(),
  text: z.string().max(100),
  consequence: z.string().max(200),
  statModifiers: StatModifierSchema,
  sfx: z.enum([
    'sad_trombone',
    'cash_register',
    'record_scratch',
    'suspense_sting',
    'typing',
    'slack_ding',
    'footsteps',
    'dun_dun',
    'applause',
    'victory_fanfare',
    'none',
  ]).default('none'),
});

export const ScenarioSchema = z.object({
  id: z.string(),
  version: z.number().default(1),
  category: z.enum(['boss', 'meeting', 'email', 'hr', 'remote', 'random']),
  character: z.enum([
    'karen_hr',
    'chad_disruptor',
    'dave_it',
    'ghost_remote',
    'gary_intern',
    'linda_micromanager',
    'none',
  ]),
  text: z.string().max(300),
  choices: z.array(ChoiceSchema).min(2).max(4),
  triggersEnding: z.enum(['fired_by_drone', 'replaced_by_ai', 'none']).default('none'),
});

export const ScenariosDataSchema = z.object({
  version: z.number(),
  scenarios: z.array(ScenarioSchema),
});

