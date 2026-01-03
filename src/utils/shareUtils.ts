/**
 * @file src/utils/shareUtils.ts
 * @description Sharing utilities for social features
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-005-social.md
 */

import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { trackEvent } from './analytics';

export async function captureAndShare(
  viewRef: React.RefObject<ViewShot>,
  cardType: 'firing_letter' | 'office_badge' | 'quiz_result'
) {
  if (Platform.OS === 'web') {
    alert('Sharing not supported on web yet!');
    return;
  }

  try {
    const uri = await viewRef.current?.capture();
    
    if (uri && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your Corporate Chaos result!',
        UTI: 'public.png',
      });
      
      trackEvent('share_card_generated', { type: cardType });
    } else {
      console.warn('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Failed to capture and share:', error);
  }
}

export async function shareText(message: string) {
  if (await Sharing.isAvailableAsync()) {
    // Note: expo-sharing shareAsync is mainly for files. 
    // For text, we might want React Native's Share API, but keeping consistent with expo-sharing where possible.
    // Actually, Share.share from react-native is better for text content.
    const { Share } = require('react-native');
    try {
      await Share.share({
        message,
        title: 'Corporate Chaos',
      });
    } catch (error) {
      console.warn('Share failed:', error);
    }
  }
}

