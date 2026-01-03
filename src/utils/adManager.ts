import {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const AD_UNITS = {
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-5406690030449472/2512000654',
  rewarded: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-5406690030449472/7047315490',
};

let lastInterstitialShown = 0;
export const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes

let interstitial = InterstitialAd.createForAdRequest(AD_UNITS.interstitial);
let rewarded = RewardedAd.createForAdRequest(AD_UNITS.rewarded);

// Preload on module load
interstitial.load();
rewarded.load();

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

    interstitial.addAdEventListener(AdEventType.CLOSED, onClosed);
    interstitial.addAdEventListener(AdEventType.ERROR, () => resolve(false));
    interstitial.show();
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

    rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, onRewarded);
    rewarded.addAdEventListener(AdEventType.CLOSED, onClosed);
    rewarded.addAdEventListener(AdEventType.ERROR, () => resolve(false));
    rewarded.show();
  });
}

