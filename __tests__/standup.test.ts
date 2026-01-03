import { useGameStore } from '../src/stores/gameStore';

// Helper to mock Date
const mockDate = (isoDate: string) => {
  const originalDate = global.Date;
  const fixedDate = new Date(isoDate);
  
  // @ts-ignore
  global.Date = class extends Date {
    constructor() {
      super();
      return fixedDate;
    }
    static now() {
      return fixedDate.getTime();
    }
  };
  
  return () => {
    global.Date = originalDate;
  };
};

describe('Daily Standup Logic', () => {
  let restoreDate: () => void;

  beforeEach(() => {
    useGameStore.getState().resetAllProgress();
    // Default to a fixed date if not overridden
    restoreDate = mockDate('2026-01-03T12:00:00Z');
  });

  afterEach(() => {
    if (restoreDate) restoreDate();
  });

  it('starts a daily standup', () => {
    const store = useGameStore.getState();
    store.startDailyStandup(['1', '2', '3']);
    
    expect(useGameStore.getState().gamePhase).toBe('daily_standup');
    expect(useGameStore.getState().standupQueue).toHaveLength(3);
    expect(useGameStore.getState().dailyStandupCompleted).toBe(false);
  });

  it('completes standup and awards base tokens', () => {
    const store = useGameStore.getState();
    
    store.completeDailyStandup();
    
    const state = useGameStore.getState();
    expect(state.dailyStandupCompleted).toBe(true);
    expect(state.dailyStreak).toBe(1);
    expect(state.coffeeTokens).toBe(1); // 1 base
    expect(state.gamePhase).toBe('menu');
    // Verify date set to today (2026-01-03)
    expect(state.lastStandupDate).toBe('2026-01-03');
  });

  it('awards milestone bonus for 3-day streak', () => {
    // Setup state: Streak 2, completed yesterday
    restoreDate(); // reset
    restoreDate = mockDate('2026-01-03T12:00:00Z');
    
    useGameStore.setState({
      dailyStreak: 2,
      lastStandupDate: '2026-01-02', // yesterday
      streakRewardsUnlocked: [],
      coffeeTokens: 0
    });

    useGameStore.getState().completeDailyStandup();
    
    const state = useGameStore.getState();
    expect(state.dailyStreak).toBe(3);
    // 1 base + 2 bonus = 3
    expect(state.coffeeTokens).toBe(3);
    expect(state.streakRewardsUnlocked).toContain('streak_3_tokens');
  });

  it('resets streak if day missed', () => {
    // Today: Jan 3
    // Last: Jan 1 (Missed Jan 2)
    useGameStore.setState({
      lastStandupDate: '2026-01-01',
      dailyStreak: 5,
      dailyStandupCompleted: true // was completed on Jan 1
    });

    useGameStore.getState().checkDailyReset();
    
    const state = useGameStore.getState();
    expect(state.dailyStandupCompleted).toBe(false);
    expect(state.dailyStreak).toBe(0);
  });

  it('maintains streak if already completed today', () => {
    // Today: Jan 3
    // Last: Jan 3
    useGameStore.setState({
      lastStandupDate: '2026-01-03',
      dailyStreak: 5,
      dailyStandupCompleted: true
    });

    useGameStore.getState().checkDailyReset();
    
    const state = useGameStore.getState();
    expect(state.dailyStandupCompleted).toBe(true);
    expect(state.dailyStreak).toBe(5);
  });

  it('resets daily completion flag on new day but keeps streak pending', () => {
    // Today: Jan 3
    // Last: Jan 2 (Yesterday)
    useGameStore.setState({
      lastStandupDate: '2026-01-02',
      dailyStreak: 5,
      dailyStandupCompleted: true
    });

    useGameStore.getState().checkDailyReset();
    
    const state = useGameStore.getState();
    expect(state.dailyStandupCompleted).toBe(false); // Reset for today
    expect(state.dailyStreak).toBe(5); // Streak preserved until played
  });
});

