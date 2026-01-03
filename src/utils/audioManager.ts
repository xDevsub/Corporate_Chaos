/**
 * @file src/utils/audioManager.ts
 * @description Centralized audio manager using expo-av
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-006-polish.md
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class AudioManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private ambiance: Audio.Sound | null = null;
  private isMuted = false;
  private isAmbianceMuted = false;
  
  // Map logic to files
  // NOTE: In a real scenario, these would be distinct files.
  // For now, we map them to available assets or placeholders.
  private sfxFiles: Record<string, any> = {
    sad_trombone: require('../../assets/audio/beep.wav'),
    cash_register: require('../../assets/audio/beep.wav'),
    record_scratch: require('../../assets/audio/beep.wav'),
    suspense_sting: require('../../assets/audio/beep.wav'),
    victory_fanfare: require('../../assets/audio/beep.wav'),
    typing: require('../../assets/audio/beep.wav'),
    slack_ding: require('../../assets/audio/beep.wav'),
    footsteps: require('../../assets/audio/beep.wav'),
    office_ambiance: require('../../assets/audio/beep.wav'), // Loop
    crowd_murmur: require('../../assets/audio/beep.wav'),
    dun_dun: require('../../assets/audio/beep.wav'),
    applause: require('../../assets/audio/beep.wav'),
  };

  async preload() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      for (const [key, source] of Object.entries(this.sfxFiles)) {
        // We create and unload immediately just to cache? 
        // Or we keep them loaded? Keeping 12 sounds loaded might be heavy but instant.
        // For 'beep.wav' it's fine.
        const { sound } = await Audio.Sound.createAsync(source);
        this.sounds.set(key, sound);
      }
    } catch (error) {
      console.warn('AudioManager: preload failed', error);
    }
  }
  
  async play(sfx: string) {
    if (this.isMuted) return;
    
    // Map scenario sfx IDs (which might use underscores or hyphens) to our keys
    const key = sfx.replace(/-/g, '_'); 
    
    const sound = this.sounds.get(key);
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (e) {
        // If replay fails (unloaded), reload
        try {
            await sound.unloadAsync();
            await sound.loadAsync(this.sfxFiles[key]);
            await sound.replayAsync();
        } catch (err) {
            console.warn('AudioManager: play failed', err);
        }
      }
    } else {
        // Try to load on demand if not preloaded
        if (this.sfxFiles[key]) {
            try {
                const { sound: newSound } = await Audio.Sound.createAsync(this.sfxFiles[key]);
                this.sounds.set(key, newSound);
                await newSound.playAsync();
            } catch (err) {
                console.warn('AudioManager: play on demand failed', err);
            }
        }
    }
  }
  
  async startAmbiance() {
    if (this.isAmbianceMuted) return;
    
    // Check if we have a dedicated ambiance file, currently mapped to beep.wav (which is short)
    // In real prod, this would be a long loop.
    // We won't loop the beep forever to avoid annoyance during dev.
    // Uncomment logic when real file exists.
    
    /*
    try {
        if (this.ambiance) {
            await this.ambiance.stopAsync();
            await this.ambiance.unloadAsync();
        }

        const { sound } = await Audio.Sound.createAsync(
            this.sfxFiles['office_ambiance'],
            { isLooping: true, volume: 0.15 }
        );
        this.ambiance = sound;
        await this.ambiance.playAsync();
    } catch (error) {
        console.warn('AudioManager: startAmbiance failed', error);
    }
    */
  }
  
  async fadeOutAmbiance() {
    if (this.ambiance) {
        try {
            await this.ambiance.setVolumeAsync(0);
            // Optionally stop after fade
        } catch (e) {}
    }
  }
  
  setMuted(muted: boolean) {
    this.isMuted = muted;
  }
  
  setAmbianceMuted(muted: boolean) {
      this.isAmbianceMuted = muted;
      if (muted && this.ambiance) {
          this.ambiance.pauseAsync();
      } else if (!muted && this.ambiance) {
          this.ambiance.playAsync();
      } else if (!muted && !this.ambiance) {
          this.startAmbiance();
      }
  }
}

export const audioManager = new AudioManager();

