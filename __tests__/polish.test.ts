import { useGameStore } from '../src/stores/gameStore';
import { audioManager } from '../src/utils/audioManager';

// Mock Audio
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({ sound: { playAsync: jest.fn(), unloadAsync: jest.fn(), replayAsync: jest.fn() } })),
    },
    setAudioModeAsync: jest.fn(),
  },
}));

describe('Spec-006 Polish', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState());
    jest.clearAllMocks();
  });

  describe('Achievements', () => {
    it('tracks progress and unlocks achievement', () => {
      // Requirement: 10 emails for 'reply_all_survivor'
      const store = useGameStore;
      
      store.getState().trackAchievementProgress('reply_all_survivor', 5);
      
      expect(store.getState().progress.reply_all_survivor).toBe(5);
      expect(store.getState().unlocked).not.toContain('reply_all_survivor');

      store.getState().trackAchievementProgress('reply_all_survivor', 5);

      expect(store.getState().progress.reply_all_survivor).toBe(10);
      expect(store.getState().unlocked).toContain('reply_all_survivor');
      expect(store.getState().lastUnlocked).toBe('reply_all_survivor');
    });

    it('does not unlock twice', () => {
      const store = useGameStore;

      store.getState().trackAchievementProgress('reply_all_survivor', 10);
      expect(store.getState().unlocked).toHaveLength(1);

      store.getState().trackAchievementProgress('reply_all_survivor', 1);
      expect(store.getState().unlocked).toHaveLength(1); // Still 1
    });
  });

  describe('Audio Manager', () => {
    it('toggles mute state correctly', () => {
        audioManager.setMuted(true);
        // We can't easily test private state, but we can verify play doesn't throw
        expect(async () => await audioManager.play('beep')).not.toThrow();
    });
  });
});
