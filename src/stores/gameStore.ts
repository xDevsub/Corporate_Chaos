/**
 * @file src/stores/gameStore.ts
 * @description Zustand store for game state management
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-001-core-game.md
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  GameState, 
  DEFAULT_GAME_STATE, 
  DEFAULT_STATS,
  EndingType,
  PlayerStats,
  GamePhase,
  StreakReward,
  ProductId,
  ReferralReward,
  AchievementId,
  ACHIEVEMENT_REQUIREMENTS,
} from '../types/game.types';
import { Choice, Scenario, StatModifier } from '../types/scenario.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Apply stat modifiers and clamp to 0-100
 */
function applyStatModifiers(
  currentStats: PlayerStats, 
  modifiers: { reputation: number; chaos: number; stealth: number }
): PlayerStats {
  return {
    reputation: clamp(currentStats.reputation + modifiers.reputation, 0, 100),
    chaos: clamp(currentStats.chaos + modifiers.chaos, 0, 100),
    stealth: clamp(currentStats.stealth + modifiers.stealth, 0, 100),
  };
}

/**
 * Calculate the delta between old and new stats
 */
function calculateStatChange(before: PlayerStats, after: PlayerStats): StatModifier {
  return {
    reputation: after.reputation - before.reputation,
    chaos: after.chaos - before.chaos,
    stealth: after.stealth - before.stealth,
  };
}

/**
 * Check if any ending conditions are met
 */
function checkForEnding(stats: PlayerStats, daysSurvived: number): EndingType | null {
  // Immediate endings (can happen any day)
  if (stats.reputation === 0) return 'fired_by_drone';
  if (stats.chaos === 0 || stats.stealth === 0) return 'replaced_by_ai';
  
  // Day 30 endings
  if (daysSurvived >= 30) {
    // Check in order of specificity
    if (stats.reputation > 90) return 'corporate_overlord';
    if (stats.reputation > 70 && stats.chaos > 70 && stats.stealth > 70) return 'blaze_of_glory';
    if (stats.chaos > 80) return 'office_legend';
    if (stats.stealth > 80) return 'shadow_employee';
    if (stats.stealth < 20 && stats.chaos < 20) return 'intern_forever';
    
    // Balanced stats ending
    const isBalanced = 
      stats.reputation >= 40 && stats.reputation <= 60 &&
      stats.chaos >= 40 && stats.chaos <= 60 &&
      stats.stealth >= 40 && stats.stealth <= 60;
    if (isBalanced) return 'middle_manager';
    
    // Default ending at day 30
    return 'middle_manager';
  }
  
  return null;
}

/**
 * Apply streak milestone rewards
 */
function applyStreakRewards(streak: number, unlocked: StreakReward[]): { unlocked: StreakReward[]; bonusTokens: number } {
  const nextUnlocked = new Set<StreakReward>(unlocked);
  let bonusTokens = 0;

  if (streak >= 3 && !nextUnlocked.has('streak_3_tokens')) {
    nextUnlocked.add('streak_3_tokens');
    bonusTokens += 2;
  }
  if (streak >= 7) {
    nextUnlocked.add('streak_7_badge');
  }
  if (streak >= 14) {
    nextUnlocked.add('streak_14_outfit');
  }
  if (streak >= 30) {
    nextUnlocked.add('streak_30_title');
  }

  return { unlocked: Array.from(nextUnlocked), bonusTokens };
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date as ISO string
 */
function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Generate a unique referral code
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CHAOS-${code}`;
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface GameStore extends GameState {
  // Actions - Game Flow
  startNewGame: () => void;
  setCurrentScenario: (scenarioId: string) => void;
  makeChoice: (choice: Choice) => void;
  acknowledgeConsequence: () => void;
  returnToMenu: () => void;
  
  // Actions - Daily Standup
  startDailyStandup: (queue: string[]) => void;
  completeDailyStandup: () => void;
  advanceStandupIndex: () => void;
  useBailout: (options?: { free?: boolean; clearEnding?: boolean }) => boolean;
  checkDailyReset: () => void;
  
  // Actions - Currency
  spendCoffeeTokens: (amount: number) => boolean;
  addCoffeeTokens: (amount: number) => void;
  
  // Actions - Settings
  toggleSound: () => void;
  toggleAmbience: () => void;
  
  // Actions - Meta
  unlockEnding: (ending: EndingType) => void;
  resetAllProgress: () => void;
  setPurchasedProducts: (products: ProductId[]) => void;

  // Actions - Referral
  generateMyCode: () => void;
  redeemReferral: (code: string) => boolean;

  // Actions - Achievements
  trackAchievementProgress: (id: AchievementId, amount?: number) => void;
  clearLastUnlocked: () => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...DEFAULT_GAME_STATE,
      
      // ========================================
      // Game Flow Actions
      // ========================================
      
      startNewGame: () => {
        set({
          stats: { ...DEFAULT_STATS },
          daysSurvived: 0,
          currentScenarioId: null,
          scenarioHistory: [],
          gamePhase: 'playing',
          currentEnding: null,
          lastChoiceConsequence: null,
          lastStatChange: null,
          lastChoiceSfx: null,
          lastStatsBeforeChoice: null,
          standupQueue: [],
          standupIndex: 0,
          bailoutsUsedToday: 0,
        });
      },
      
      setCurrentScenario: (scenarioId: string) => {
        set({ currentScenarioId: scenarioId });
      },
      
      makeChoice: (choice: Choice) => {
        const state = get();
        
        // Apply stat modifiers
        const previousStats = state.stats;
        const newStats = applyStatModifiers(previousStats, choice.statModifiers);
        const newDay = state.daysSurvived + 1;
        const statDelta = calculateStatChange(state.stats, newStats);
        
        // Check for endings
        const ending = checkForEnding(newStats, newDay);
        
        // Update state
        set({
          stats: newStats,
          daysSurvived: newDay,
          scenarioHistory: state.currentScenarioId
            ? [...state.scenarioHistory, state.currentScenarioId]
            : state.scenarioHistory,
          gamePhase: 'consequence',
          lastChoiceConsequence: choice.consequence,
          lastStatChange: statDelta,
          lastChoiceSfx: choice.sfx,
          lastStatsBeforeChoice: previousStats,
          currentEnding: ending,
        });
        
        // If ending triggered, unlock it
        if (ending) {
          get().unlockEnding(ending);
        }
      },
      
      acknowledgeConsequence: () => {
        const state = get();
        
        if (state.currentEnding) {
          // Game over - show ending
          set({
            gamePhase: 'ending',
            totalGamesPlayed: state.totalGamesPlayed + 1,
          });
        } else {
          // Continue playing
          set({
            gamePhase: 'playing',
            currentScenarioId: null,
            lastChoiceConsequence: null,
            lastStatChange: null,
            lastChoiceSfx: null,
            lastStatsBeforeChoice: null,
          });
        }
      },
      
      returnToMenu: () => {
        set({ gamePhase: 'menu' });
      },
      
      // ========================================
      // Daily Standup Actions
      // ========================================
      
      startDailyStandup: (queue: string[]) => {
        set({
          gamePhase: 'daily_standup',
          standupQueue: queue.slice(0, 3),
          standupIndex: 0,
          dailyStandupCompleted: false,
        });
      },
      
      completeDailyStandup: () => {
        const state = get();
        const today = getTodayString();
        const yesterday = getYesterdayString();
        
        // Calculate new streak
        const streakContinued = state.lastStandupDate === yesterday;
        const newStreak = streakContinued ? state.dailyStreak + 1 : 1;
        const { unlocked, bonusTokens } = applyStreakRewards(newStreak, state.streakRewardsUnlocked);
        
        // Award tokens (bonus for streaks)
        const tokensEarned = 1 + bonusTokens;
        
        set({
          dailyStandupCompleted: true,
          lastStandupDate: today,
          dailyStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          coffeeTokens: state.coffeeTokens + tokensEarned,
          streakRewardsUnlocked: unlocked,
          bailoutsUsedToday: state.bailoutsUsedToday, // leave as-is for the day
          standupQueue: [],
          standupIndex: 0,
          gamePhase: 'menu',
        });
      },

      advanceStandupIndex: () => {
        const state = get();
        set({ standupIndex: Math.min(state.standupIndex + 1, state.standupQueue.length) });
      },

      useBailout: (options?: { free?: boolean; clearEnding?: boolean }): boolean => {
        const state = get();
        if (
          state.gamePhase !== 'consequence' ||
          !state.lastStatsBeforeChoice ||
          !state.currentScenarioId ||
          (!options?.free && state.coffeeTokens < 3) ||
          (options?.free && state.bailoutsUsedToday >= 2)
        ) {
          return false;
        }

        const updatedHistory = [...state.scenarioHistory];
        const lastPlayed = updatedHistory[updatedHistory.length - 1];
        if (lastPlayed === state.currentScenarioId) {
          updatedHistory.pop();
        }

        set({
          coffeeTokens: options?.free ? state.coffeeTokens : state.coffeeTokens - 3,
          bailoutsUsedToday: state.bailoutsUsedToday + 1,
          totalBailoutsUsed: state.totalBailoutsUsed + 1,
          stats: state.lastStatsBeforeChoice,
          daysSurvived: Math.max(0, state.daysSurvived - 1),
          scenarioHistory: updatedHistory,
          gamePhase: 'playing',
          lastChoiceConsequence: null,
          lastStatChange: null,
          lastChoiceSfx: null,
          lastStatsBeforeChoice: null,
          currentEnding: options?.clearEnding ? null : state.currentEnding,
        });
        return true;
      },
      
      checkDailyReset: () => {
        const state = get();
        const today = getTodayString();
        const yesterday = getYesterdayString();
        
        if (state.lastStandupDate !== today) {
          // New day - reset daily status
          const streakBroken = state.lastStandupDate !== yesterday && state.lastStandupDate !== null;
          
          set({
            dailyStandupCompleted: false,
            dailyStreak: streakBroken ? 0 : state.dailyStreak,
            bailoutsUsedToday: 0,
            standupQueue: [],
            standupIndex: 0,
          });
        }
      },
      
      // ========================================
      // Currency Actions
      // ========================================
      
      spendCoffeeTokens: (amount: number): boolean => {
        const state = get();
        if (state.coffeeTokens >= amount) {
          set({ coffeeTokens: state.coffeeTokens - amount });
          return true;
        }
        return false;
      },
      
      addCoffeeTokens: (amount: number) => {
        set((state) => ({ coffeeTokens: state.coffeeTokens + amount }));
      },
      
      // ========================================
      // Settings Actions
      // ========================================
      
      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },
      
      toggleAmbience: () => {
        set((state) => ({ ambienceEnabled: !state.ambienceEnabled }));
      },
      
      // ========================================
      // Meta Actions
      // ========================================
      
      unlockEnding: (ending: EndingType) => {
        set((state) => ({
          endingsUnlocked: state.endingsUnlocked.includes(ending)
            ? state.endingsUnlocked
            : [...state.endingsUnlocked, ending],
        }));
      },
      
      resetAllProgress: () => {
        set({ ...DEFAULT_GAME_STATE });
      },

      setPurchasedProducts: (products: ProductId[]) => {
        const unique = Array.from(new Set(products));
        const hasRemoveAds = unique.includes('coffee_badge') || unique.includes('executive_pack') || unique.includes('chaos_lord');
        const isPremium = unique.includes('executive_pack') || unique.includes('chaos_lord');
        set({
          purchasedProducts: unique,
          hasRemoveAds,
          isPremium,
        });
      },

      // ========================================
      // Referral Actions
      // ========================================

      generateMyCode: () => {
        const state = get();
        if (!state.myCode) {
          set({ myCode: generateReferralCode() });
        }
      },

      redeemReferral: (code: string): boolean => {
        const state = get();
        
        // Basic validation
        if (state.referredBy) return false; // Already redeemed
        if (code === state.myCode) return false; // Self-referral
        if (!code.startsWith('CHAOS-')) return false; // Invalid format

        set({
          referredBy: code,
          coffeeTokens: state.coffeeTokens + 3, // Bonus for new player
        });
        return true;
      },

      // ========================================
      // Achievement Actions
      // ========================================

      trackAchievementProgress: (id: AchievementId, amount: number = 1) => {
        const state = get();
        if (state.unlocked.includes(id)) return; // Already unlocked

        const currentProgress = state.progress[id] || 0;
        const newProgress = currentProgress + amount;
        const required = ACHIEVEMENT_REQUIREMENTS[id];

        const newProgressMap = {
          ...state.progress,
          [id]: newProgress,
        };

        if (newProgress >= required) {
          // Unlock!
          set({
            progress: newProgressMap,
            unlocked: [...state.unlocked, id],
            lastUnlocked: id,
          });
        } else {
          set({ progress: newProgressMap });
        }
      },

      clearLastUnlocked: () => {
        set({ lastUnlocked: null });
      },
    }),
    {
      name: 'corporate-chaos-game',
      storage: createJSONStorage(() => AsyncStorage),
      version: 6,
      migrate: (persistedState: any, version) => {
        if (version < 5) {
          // ... (existing v5 migration logic)
          persistedState = {
            ...DEFAULT_GAME_STATE,
            ...persistedState,
            myCode: persistedState.myCode || '',
            referredBy: persistedState.referredBy || null,
            referralCount: persistedState.referralCount || 0,
            referralRewardsUnlocked: persistedState.referralRewardsUnlocked || [],
          };
        }
        
        if (version < 6) {
           // Add achievement fields
           return {
             ...DEFAULT_GAME_STATE, // Ensure defaults are there
             ...persistedState,
             unlocked: persistedState.unlocked || [],
             progress: persistedState.progress || DEFAULT_GAME_STATE.progress,
             lastUnlocked: null,
           };
        }

        return persistedState as GameStore;
      },
    }
  )
);
