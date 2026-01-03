/**
 * @file __tests__/monetization.test.ts
 * @description Tests for monetization helpers (analytics events, ad cooldown)
 */

(global as any).__DEV__ = true;

jest.mock('react-native-google-mobile-ads', () => {
  const listeners: Record<string, (() => void)[]> = {};
  class FakeInterstitial {
    isLoaded = true;
    addAdEventListener(event: string, cb: () => void) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
      return () => {};
    }
    show() {
      // Immediately trigger closed
      (listeners['closed'] || []).forEach((cb) => cb());
    }
    load() {}
  }
  class FakeRewarded {
    isLoaded = false;
    addAdEventListener() { return () => {}; }
    show() {}
    load() {}
  }
  return {
    InterstitialAd: { createForAdRequest: () => new FakeInterstitial() },
    RewardedAd: { createForAdRequest: () => new FakeRewarded() },
    AdEventType: { CLOSED: 'closed', ERROR: 'error' },
    RewardedAdEventType: { EARNED_REWARD: 'reward' },
    TestIds: { INTERSTITIAL: 'test-int', REWARDED: 'test-rew' },
  };
});

import { analyticsEvents } from '../src/utils/analytics';
import { canShowInterstitial, INTERSTITIAL_COOLDOWN_MS, showInterstitial } from '../src/utils/adManager';

describe('analytics events', () => {
  it('matches the defined AnalyticsEventsMap keys', () => {
    const expected = [
      'scenario_shown',
      'choice_selected',
      'scenario_completed',
      'ad_shown',
      'ad_clicked',
      'rewarded_ad_offered',
      'rewarded_ad_completed',
      'rewarded_ad_abandoned',
      'iap_viewed',
      'iap_initiated',
      'iap_completed',
      'iap_failed',
      'daily_standup_started',
      'daily_standup_completed',
      'session_start',
      'session_end',
      'ending_reached',
      'bailout_used',
      'boss_button_pressed',
      'scenario_skipped',
    ];
    expect(Object.keys(analyticsEvents).sort()).toEqual(expected.sort());
  });
});

describe('adManager cooldown', () => {
  it('canShowInterstitial enforces cooldown window', () => {
    const now = Date.now();
    expect(canShowInterstitial(now, now)).toBe(false);
    expect(canShowInterstitial(now, now - INTERSTITIAL_COOLDOWN_MS + 1)).toBe(false);
    expect(canShowInterstitial(now, now - INTERSTITIAL_COOLDOWN_MS)).toBe(true);
    expect(canShowInterstitial(now, now - INTERSTITIAL_COOLDOWN_MS - 1)).toBe(true);
  });

  it('showInterstitial returns false when within cooldown', async () => {
    const realNow = Date.now;
    // Start far in the future so initial 0 check passes
    const start = INTERSTITIAL_COOLDOWN_MS * 2;
    Date.now = () => start;
    const first = await showInterstitial();
    expect(first).toBe(true);
    
    // Advance time but not enough
    Date.now = () => start + INTERSTITIAL_COOLDOWN_MS - 1;
    const second = await showInterstitial();
    expect(second).toBe(false);
    Date.now = realNow;
  });
});

