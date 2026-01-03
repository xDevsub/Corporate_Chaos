let InterstitialAd: any;
let RewardedAd: any;
let AdEventType: any;
let RewardedAdEventType: any;
let TestIds: any;

const isExpoGo = typeof  Constants !== 'undefined' && Constants.appOwnership === 'expo';
import Constants from 'expo-constants';

try {
  const ads = require('react-native-google-mobile-ads');
  InterstitialAd = ads.InterstitialAd;
  RewardedAd = ads.RewardedAd;
  AdEventType = ads.AdEventType;
  RewardedAdEventType = ads.RewardedAdEventType;
  TestIds = ads.TestIds;
} catch (e) {
  console.warn('Google Mobile Ads not available (likely running in Expo Go). Ads will be mocked.');
  
  // Mock implementations
  TestIds = { INTERSTITIAL: 'mock', REWARDED: 'mock' };
  AdEventType = { CLOSED: 'closed', ERROR: 'error' };
  RewardedAdEventType = { EARNED_REWARD: 'earned_reward' };
  
  class MockAd {
    isLoaded = true;
    static createForAdRequest() { return new MockAd(); }
    load() { this.isLoaded = true; }
    show() { 
      // Simulate ad behavior
      setTimeout(() => this.listeners['closed']?.(), 500);
      setTimeout(() => this.listeners['earned_reward']?.(), 500);
    }
    listeners: Record<string, Function> = {};
    addAdEventListener(event: string, cb: Function) { this.listeners[event] = cb; }
  }
  
  InterstitialAd = MockAd;
  RewardedAd = MockAd;
}

const AD_UNITS = {
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-5406690030449472/2512000654',
  rewarded: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-5406690030449472/7047315490',
};

let lastInterstitialShown = 0;
export const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes

let interstitial = InterstitialAd.createForAdRequest(AD_UNITS.interstitial);
let rewarded = RewardedAd.createForAdRequest(AD_UNITS.rewarded);

// Preload on module load
try {
    interstitial.load();
    rewarded.load();
} catch (e) {
    console.warn("Failed to load ads:", e);
}

export function preloadInterstitial() {
  if (!interstitial.isLoaded) {
    interstitial.load();
  }
}

export function preloadRewarded() {
  if (!rewarded.isLoaded) {
    rewarded.load();
  }
}

export function canShowInterstitial(now: number, lastShown: number): boolean {
  return now - lastShown >= INTERSTITIAL_COOLDOWN_MS;
}

export async function showInterstitial(): Promise<boolean> {
  const now = Date.now();
  if (!canShowInterstitial(now, lastInterstitialShown)) {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    if (!interstitial.isLoaded) {
      interstitial.load();
      resolve(false);
      return;
    }

    const onClosed = () => {
      lastInterstitialShown = Date.now();
      interstitial = InterstitialAd.createForAdRequest(AD_UNITS.interstitial);
      interstitial.load();
      resolve(true);
    };

    // Use string literals if mocks are used, otherwise rely on the imported Enums
    const closedEvent = AdEventType?.CLOSED || 'closed';
    const errorEvent = AdEventType?.ERROR || 'error';

    interstitial.addAdEventListener(closedEvent, onClosed);
    interstitial.addAdEventListener(errorEvent, () => resolve(false));
    
    try {
        interstitial.show();
    } catch(e) {
        console.warn("Ad show failed", e);
        resolve(false);
    }
  });
}

type RewardCallback = () => void;

export async function showRewardedAd(onReward: RewardCallback): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (!rewarded.isLoaded) {
      rewarded.load();
      resolve(false);
      return;
    }

    const onRewarded = () => {
      onReward();
      resolve(true);
    };

    const onClosed = () => {
      rewarded = RewardedAd.createForAdRequest(AD_UNITS.rewarded);
      rewarded.load();
    };

    const earnedEvent = RewardedAdEventType?.EARNED_REWARD || 'earned_reward';
    const closedEvent = AdEventType?.CLOSED || 'closed';
    const errorEvent = AdEventType?.ERROR || 'error';

    rewarded.addAdEventListener(earnedEvent, onRewarded);
    rewarded.addAdEventListener(closedEvent, onClosed);
    rewarded.addAdEventListener(errorEvent, () => resolve(false));
    
    try {
        rewarded.show();
    } catch (e) {
        console.warn("Rewarded ad show failed", e);
        resolve(false);
    }
  });
}
