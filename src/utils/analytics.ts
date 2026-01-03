import type { AnalyticsEvent, AnalyticsEventsMap, UserProperties } from '../types/game.types';

type AnalyticsInstance = {
  logEvent: (name: string, params?: object) => Promise<void>;
  setUserProperty: (name: string, value: string) => Promise<void>;
};

async function getAnalytics(): Promise<AnalyticsInstance | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod: any = require('@react-native-firebase/analytics');
    return mod?.default?.();
  } catch (error) {
    // In dev or if the module is unavailable, fall back to no-op.
    if (__DEV__) {
      console.debug('[analytics] module not available, using no-op', error);
    }
    return null;
  }
}

export async function trackEvent<E extends AnalyticsEvent>(
  name: E,
  params?: AnalyticsEventsMap[E]
): Promise<void> {
  const analytics = await getAnalytics();
  if (!analytics) {
    if (__DEV__) {
      console.debug('[analytics] event', name, params);
    }
    return;
  }
  try {
    await analytics.logEvent(name, params as object | undefined);
  } catch (error) {
    if (__DEV__) {
      console.warn('[analytics] failed to log event', name, error);
    }
  }
}

export async function setUserProperty(name: keyof UserProperties, value: string): Promise<void> {
  const analytics = await getAnalytics();
  if (!analytics) {
    if (__DEV__) {
      console.debug('[analytics] setUserProperty noop', name, value);
    }
    return;
  }
  try {
    await analytics.setUserProperty(name, value);
  } catch (error) {
    if (__DEV__) {
      console.warn('[analytics] failed setUserProperty', name, error);
    }
  }
}

export const analyticsEvents = {
  // Engagement
  scenario_shown: 'scenario_shown',
  choice_selected: 'choice_selected',
  scenario_completed: 'scenario_completed',

  // Monetization
  ad_shown: 'ad_shown',
  ad_clicked: 'ad_clicked',
  rewarded_ad_offered: 'rewarded_ad_offered',
  rewarded_ad_completed: 'rewarded_ad_completed',
  rewarded_ad_abandoned: 'rewarded_ad_abandoned',
  iap_viewed: 'iap_viewed',
  iap_initiated: 'iap_initiated',
  iap_completed: 'iap_completed',
  iap_failed: 'iap_failed',

  // Retention
  daily_standup_started: 'daily_standup_started',
  daily_standup_completed: 'daily_standup_completed',
  session_start: 'session_start',
  session_end: 'session_end',

  // Progression
  ending_reached: 'ending_reached',
  bailout_used: 'bailout_used',
  boss_button_pressed: 'boss_button_pressed',
  scenario_skipped: 'scenario_skipped',
} as const;

export type AnalyticsEventName = keyof typeof analyticsEvents;

