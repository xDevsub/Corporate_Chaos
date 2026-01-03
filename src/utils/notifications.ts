/**
 * @file src/utils/notifications.ts
 * @description Push notification utilities for Daily Standup
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-003-daily-standup.md
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions and schedule daily standup reminder
 */
export async function setupDailyNotifications() {
  if (Platform.OS === 'web') return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return;
  }

  // Cancel existing to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule for 9:00 AM daily
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "☕ Daily Standup",
      body: "Time for your Daily Standup! 3 quick scenarios waiting...",
      data: { screen: 'daily-standup' },
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
    },
  });
}

