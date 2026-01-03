/**
 * @file src/types/game.types.ts
 * @description Core game types and interfaces
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-001-core-game.md
 */

import { ScenarioCategory } from './scenario.types';

// ============================================================================
// PRIMITIVES
// ============================================================================

export interface PlayerStats {
  reputation: number; // 0-100
  chaos: number;      // 0-100
  stealth: number;    // 0-100
}

export type GamePhase = 
  | 'menu'               // Main menu
  | 'playing'            // Active scenario
  | 'consequence'        // Showing result of choice
  | 'ending'             // Game over, showing ending
  | 'daily_standup';     // Daily standup mode

// ============================================================================
// ENDINGS
// ============================================================================

export type EndingType = 
  | 'middle_manager'     // Survive 30 days with balanced stats (all 40-60)
  | 'office_legend'      // Chaos > 80 at Day 30
  | 'shadow_employee'    // Stealth > 80 at Day 30
  | 'corporate_overlord' // Reputation > 90 at Day 30
  | 'fired_by_drone'     // Reputation drops to 0
  | 'replaced_by_ai'     // Any stat hits exactly 0
  | 'blaze_of_glory'     // All stats > 70 at Day 30
  | 'intern_forever';    // Stealth < 20 AND Chaos < 20 at Day 30

export interface Ending {
  id: EndingType;
  title: string;
  description: string;
  emoji: string;
}

export const ENDINGS: Record<EndingType, Ending> = {
  middle_manager: {
    id: 'middle_manager',
    title: 'Middle Manager',
    description: 'You survived by being completely average. No one knows what you do, but you do it okay.',
    emoji: '👔',
  },
  office_legend: {
    id: 'office_legend',
    title: 'Office Legend',
    description: 'You caused so much chaos they promoted you to keep you busy.',
    emoji: '🤡',
  },
  shadow_employee: {
    id: 'shadow_employee',
    title: 'Shadow Employee',
    description: 'You have collected a paycheck for 30 days without being seen once.',
    emoji: '🥷',
  },
  corporate_overlord: {
    id: 'corporate_overlord',
    title: 'Corporate Overlord',
    description: 'You played the game perfectly. You are now the boss. Everyone hates you.',
    emoji: '👑',
  },
  fired_by_drone: {
    id: 'fired_by_drone',
    title: 'Fired by Drone',
    description: 'Your reputation hit zero. Security escorted you out via pneumatic tube.',
    emoji: '🤖',
  },
  replaced_by_ai: {
    id: 'replaced_by_ai',
    title: 'Replaced by AI',
    description: 'An algorithm realized it could do your job faster and cheaper.',
    emoji: '💾',
  },
  blaze_of_glory: {
    id: 'blaze_of_glory',
    title: 'Blaze of Glory',
    description: 'You went out with a bang. HR will be talking about this for years.',
    emoji: '🔥',
  },
  intern_forever: {
    id: 'intern_forever',
    title: 'Intern Forever',
    description: 'You survived, but at what cost? You are still getting coffee.',
    emoji: '☕',
  },
};

// ============================================================================
// SOCIAL & VIRAL
// ============================================================================

export interface FiringLetterData {
  playerName: string;
  terminationReason: string;
  daysSurvived: number;
  reputation: number;
  chaos: number;
  stealth: number;
  endingType: EndingType;
}

export interface OfficeBadgeData {
  playerName: string;
  title: string;
  stats: PlayerStats;
  ending: EndingType;
  daysSurvived: number;
}

export type CharacterArchetype = 
  | 'Karen from HR'
  | 'Chad the Disruptor'
  | 'Dave from IT'
  | 'The Ghost'
  | 'Gary the Intern'
  | 'Linda the Micromanager';

export interface QuizResultData {
  archetype: CharacterArchetype;
  description: string;
  stats: PlayerStats;
}

export type ReferralReward = 
  | 'referral_1_tokens'
  | 'referral_3_badge'
  | 'referral_5_adfree'
  | 'referral_10_outfit';

export interface ReferralState {
  myCode: string;            // CHAOS-XXXXX
  referredBy: string | null; // Code used when joining
  referralCount: number;
  referralRewardsUnlocked: ReferralReward[];
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export type AchievementId = 
  | 'reply_all_survivor'
  | 'meeting_escape_artist'
  | 'chaos_agent'
  | 'quiet_quitting'
  | 'karens_nemesis'
  | 'the_ghost'
  | 'synergy_master'
  | 'coffee_addict'
  | 'streak_lord'
  | 'ending_collector';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string; // Emoji
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  reply_all_survivor: {
    id: 'reply_all_survivor',
    title: 'Reply-All Survivor',
    description: 'Complete 10 email scenarios without disaster',
    icon: '📧',
  },
  meeting_escape_artist: {
    id: 'meeting_escape_artist',
    title: 'Meeting Escape Artist',
    description: 'Dodge 5 meetings via high Stealth',
    icon: '🏃',
  },
  chaos_agent: {
    id: 'chaos_agent',
    title: 'Professional Chaos Agent',
    description: 'Reach 80+ Chaos and survive',
    icon: '🔥',
  },
  quiet_quitting: {
    id: 'quiet_quitting',
    title: 'Quiet Quitting Champion',
    description: 'Win with all stats under 30',
    icon: '🤫',
  },
  karens_nemesis: {
    id: 'karens_nemesis',
    title: 'Karen\'s Nemesis',
    description: 'Survive 5 encounters with Karen',
    icon: '👊',
  },
  the_ghost: {
    id: 'the_ghost',
    title: 'The Ghost',
    description: 'Complete a run without anyone noticing',
    icon: '👻',
  },
  synergy_master: {
    id: 'synergy_master',
    title: 'Synergy Master',
    description: 'Use corporate buzzwords in 10 scenarios',
    icon: '📊',
  },
  coffee_addict: {
    id: 'coffee_addict',
    title: 'Coffee Addict',
    description: 'Use 50 Coffee Tokens total',
    icon: '☕',
  },
  streak_lord: {
    id: 'streak_lord',
    title: 'Streak Lord',
    description: '30-day Daily Standup streak',
    icon: '🔥',
  },
  ending_collector: {
    id: 'ending_collector',
    title: 'Ending Collector',
    description: 'See all 8+ endings',
    icon: '🏆',
  },
};

export const ACHIEVEMENT_REQUIREMENTS: Record<AchievementId, number> = {
  reply_all_survivor: 10,
  meeting_escape_artist: 5,
  chaos_agent: 1,
  quiet_quitting: 1,
  karens_nemesis: 5,
  the_ghost: 1,
  synergy_master: 10,
  coffee_addict: 50,
  streak_lord: 30,
  ending_collector: 8,
};

export interface AchievementsState {
  unlocked: AchievementId[];
  progress: Record<AchievementId, number>;
  lastUnlocked: AchievementId | null;
}

// ============================================================================
// GAME STATE
// ============================================================================

export type StreakReward = 
  | 'streak_3_tokens'
  | 'streak_7_badge'
  | 'streak_14_outfit'
  | 'streak_30_title';

export type ProductId = 'coffee_badge' | 'executive_pack' | 'chaos_lord';

export interface GameState extends ReferralState, AchievementsState {
  // Player stats
  stats: PlayerStats;
  
  // Progress
  daysSurvived: number;
  currentScenarioId: string | null;
  scenarioHistory: string[];  // IDs of completed scenarios
  
  // Session
  gamePhase: GamePhase;
  currentEnding: EndingType | null;
  lastChoiceConsequence: string | null;
  lastStatChange: { reputation: number; chaos: number; stealth: number } | null;
  lastChoiceSfx: string | null;
  lastStatsBeforeChoice: PlayerStats | null;
  
  // Daily Standup
  dailyStandupCompleted: boolean;
  dailyStreak: number;
  longestStreak: number;
  coffeeTokens: number;
  lastStandupDate: string | null;  // ISO date string
  streakRewardsUnlocked: StreakReward[];
  standupQueue: string[];
  standupIndex: number;
  bailoutsUsedToday: number;
  totalBailoutsUsed: number;
  
  // Meta
  totalGamesPlayed: number;
  endingsUnlocked: EndingType[];
  
  // Settings
  soundEnabled: boolean;
  ambienceEnabled: boolean;

  // IAP
  purchasedProducts: ProductId[];
  hasRemoveAds: boolean;
  isPremium: boolean;
}

export const DEFAULT_STATS: PlayerStats = {
  reputation: 50,
  chaos: 20,
  stealth: 50,
};

export const DEFAULT_GAME_STATE: GameState = {
  stats: DEFAULT_STATS,
  daysSurvived: 0,
  currentScenarioId: null,
  scenarioHistory: [],
  gamePhase: 'menu',
  currentEnding: null,
  lastChoiceConsequence: null,
  lastStatChange: null,
  lastChoiceSfx: null,
  lastStatsBeforeChoice: null,
  
  dailyStandupCompleted: false,
  dailyStreak: 0,
  longestStreak: 0,
  coffeeTokens: 0,
  lastStandupDate: null,
  streakRewardsUnlocked: [],
  standupQueue: [],
  standupIndex: 0,
  bailoutsUsedToday: 0,
  totalBailoutsUsed: 0,
  
  totalGamesPlayed: 0,
  endingsUnlocked: [],
  
  soundEnabled: true,
  ambienceEnabled: true,

  purchasedProducts: [],
  hasRemoveAds: false,
  isPremium: false,

  myCode: '',
  referredBy: null,
  referralCount: 0,
  referralRewardsUnlocked: [],

  unlocked: [],
  progress: {
    reply_all_survivor: 0,
    meeting_escape_artist: 0,
    chaos_agent: 0,
    quiet_quitting: 0,
    karens_nemesis: 0,
    the_ghost: 0,
    synergy_master: 0,
    coffee_addict: 0,
    streak_lord: 0,
    ending_collector: 0,
  },
  lastUnlocked: null,
};

// ============================================================================
// ANALYTICS
// ============================================================================

export type AnalyticsEvent = 
  | 'scenario_shown'
  | 'choice_selected'
  | 'scenario_completed'
  | 'ad_shown'
  | 'ad_clicked'
  | 'rewarded_ad_offered'
  | 'rewarded_ad_completed'
  | 'rewarded_ad_abandoned'
  | 'iap_viewed'
  | 'iap_initiated'
  | 'iap_completed'
  | 'iap_failed'
  | 'daily_standup_started'
  | 'daily_standup_completed'
  | 'session_start'
  | 'session_end'
  | 'ending_reached'
  | 'bailout_used'
  | 'boss_button_pressed'
  | 'scenario_skipped'
  | 'share_card_generated'
  | 'referral_shared'
  | 'referral_redeemed'
  | 'achievement_unlocked';

export type AnalyticsEventsMap = {
  scenario_shown: {
    scenario_id: string;
    category: string;
    character: string;
    day_number: number;
  };
  choice_selected: {
    scenario_id: string;
    choice_index: number;
    time_to_choose_ms: number;
  };
  scenario_completed: {
    scenario_id: string;
    outcome: 'positive' | 'negative' | 'neutral';
    stats_after: PlayerStats;
  };
  ad_shown: {
    ad_type: 'interstitial' | 'rewarded';
    placement: string;
    scenario_id?: string;
  };
  ad_clicked: {
    ad_type: string;
    placement: string;
  };
  rewarded_ad_offered: { context: string };
  rewarded_ad_completed: { context: string; reward_claimed: boolean };
  rewarded_ad_abandoned: { context: string; watch_time_seconds: number };
  iap_viewed: { pack_id: string; source: string };
  iap_initiated: { pack_id: string; price: number };
  iap_completed: { pack_id: string; price: number; currency: string };
  iap_failed: { pack_id: string; error: string };
  daily_standup_started: { streak_count: number };
  daily_standup_completed: { streak_count: number; tokens_earned: number };
  session_start: { days_since_install: number | null; is_first_session_today: boolean };
  session_end: { session_duration_seconds: number; scenarios_played?: number };
  ending_reached: { ending_id: string; days_survived: number; final_stats: PlayerStats };
  bailout_used: { scenario_id: string; tokens_spent: number; source: 'tokens' | 'rewarded_ad' };
  boss_button_pressed: { scenario_id?: string };
  scenario_skipped: { scenario_id: string };
  share_card_generated: { type: 'firing_letter' | 'office_badge' | 'quiz_result' };
  referral_shared: { code: string };
  referral_redeemed: { code: string };
  achievement_unlocked: { achievement_id: string };
};

export type UserProperties = {
  total_games_played: string;
  endings_unlocked: string;
  highest_streak: string;
  iap_status: 'none' | 'coffee_badge' | 'executive' | 'chaos_lord';
  total_revenue: string;
  days_since_install: string;
  favorite_category: string;
};
