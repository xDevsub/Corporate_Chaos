/**
 * @file app/game.tsx
 * @description Main game screen with scenario display and choice UI
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-001-core-game.md
 */

import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming, 
} from 'react-native-reanimated';
import { useGameStore } from '../src/stores/gameStore';
import { Scenario, Choice, CHARACTERS, CATEGORY_LABELS } from '../src/types/scenario.types';
import { getCachedScenarios } from '../src/utils/scenarioCache';
import { playSfx } from '../src/utils/sfx';
import { trackEvent } from '../src/utils/analytics';
import { showRewardedAd } from '../src/utils/adManager';
import { TypewriterText } from '../src/components/TypewriterText';

export default function GameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const {
    stats,
    daysSurvived,
    gamePhase,
    currentScenarioId,
    scenarioHistory,
    lastChoiceConsequence,
    currentEnding,
    lastStatChange,
    lastChoiceSfx,
    setCurrentScenario,
    makeChoice,
    acknowledgeConsequence,
    // Daily Standup & Bailout
    standupQueue,
    standupIndex,
    coffeeTokens,
    advanceStandupIndex,
    completeDailyStandup,
    useBailout,
    bailoutsUsedToday,
    addCoffeeTokens,
  } = useGameStore();

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenario, setCurrentScenarioLocal] = useState<Scenario | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [continueLocked, setContinueLocked] = useState(false);
  const [scenarioStartMs, setScenarioStartMs] = useState<number | null>(null);
  const [lastStandupTokensEarned, setLastStandupTokensEarned] = useState<number | null>(null);
  const statChangeAnim = useSharedValue(0);

  // Get a random scenario that hasn't been played yet
  const getNextScenario = useCallback((): Scenario | null => {
    if (!scenarios.length) return null;

    const availableScenarios = scenarios.filter(
      (s) => !scenarioHistory.includes(s.id)
    );
    
    if (availableScenarios.length === 0) {
      // All scenarios played, allow repeats
      return scenarios[
        Math.floor(Math.random() * scenarios.length)
      ] as Scenario;
    }
    
    return availableScenarios[
      Math.floor(Math.random() * availableScenarios.length)
    ] as Scenario;
  }, [scenarioHistory, scenarios]);

  // Load scenarios from cache (offline-first)
  useEffect(() => {
    let mounted = true;
    getCachedScenarios().then((loaded) => {
      if (mounted) {
        setScenarios(loaded);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Load next scenario when needed
  useEffect(() => {
    if (currentScenarioId) return; // Already loaded

    // Main Game Loop
    if (gamePhase === 'playing') {
      const nextScenario = getNextScenario();
      if (nextScenario) {
        setCurrentScenario(nextScenario.id);
        setCurrentScenarioLocal(nextScenario);
        setScenarioStartMs(Date.now());
        trackEvent('scenario_shown', {
          scenario_id: nextScenario.id,
          category: nextScenario.category,
          character: nextScenario.character,
          day_number: daysSurvived + 1,
        });
        setIsTyping(true);
      }
    } 
    // Daily Standup Loop
    else if (gamePhase === 'daily_standup') {
      if (standupIndex < standupQueue.length) {
        const nextId = standupQueue[standupIndex];
        const nextScenario = scenarios.find(s => s.id === nextId);
        
        if (nextScenario) {
          setCurrentScenario(nextScenario.id);
          setCurrentScenarioLocal(nextScenario);
          setScenarioStartMs(Date.now());
          trackEvent('scenario_shown', {
            scenario_id: nextScenario.id,
            category: nextScenario.category,
            character: nextScenario.character,
            day_number: standupIndex + 1,
          });
          setIsTyping(true);
        }
      }
    }
  }, [
    gamePhase, 
    currentScenarioId, 
    getNextScenario, 
    setCurrentScenario, 
    standupQueue, 
    standupIndex, 
    scenarios
  ]);

  // Rehydrate scenario when resuming a saved session
  useEffect(() => {
    if (currentScenarioId && !currentScenario) {
      const foundScenario = (scenarios.find((s) => s.id === currentScenarioId) as Scenario | undefined) ?? null;
      setCurrentScenarioLocal(foundScenario);
      if (foundScenario) {
        setScenarioStartMs(Date.now());
        trackEvent('scenario_shown', {
          scenario_id: foundScenario.id,
          category: foundScenario.category,
          character: foundScenario.character,
          day_number: gamePhase === 'daily_standup' ? standupIndex + 1 : daysSurvived + 1,
        });
      }
      if (foundScenario) {
        setIsTyping(true);
      }
    }
  }, [currentScenarioId, currentScenario, scenarios, gamePhase, standupIndex, daysSurvived]);

  // Handle choice selection
  const handleChoice = (choice: Choice) => {
    const choiceIndex = currentScenario?.choices.findIndex((c) => c.id === choice.id) ?? -1;
    const now = Date.now();
    const timeToChoose = scenarioStartMs ? now - scenarioStartMs : 0;
    trackEvent('choice_selected', {
      scenario_id: currentScenario?.id ?? '',
      choice_index: choiceIndex,
      time_to_choose_ms: timeToChoose,
    });

    makeChoice(choice);
  };

  // Handle consequence acknowledgment
  const handleContinue = () => {
    acknowledgeConsequence();
    
    if (gamePhase === 'daily_standup') {
      if (standupIndex < standupQueue.length - 1) {
        advanceStandupIndex();
        setCurrentScenarioLocal(null);
        setIsTyping(false);
        setScenarioStartMs(null);
      } else {
        // Daily Standup Finished
        const beforeTokens = useGameStore.getState().coffeeTokens;
        completeDailyStandup();
        const afterTokens = useGameStore.getState().coffeeTokens;
        const earned = Math.max(0, afterTokens - beforeTokens);
        setLastStandupTokensEarned(earned);
        Alert.alert(
          "Daily Standup Complete! ☕",
          `You earned ${earned} Coffee Token${earned === 1 ? '' : 's'}.`,
          [
            {
              text: "Double Tokens (Ad)",
              onPress: () => {
                if (earned <= 0) return;
                showRewardedAd(() => {
                  addCoffeeTokens(earned);
                  Alert.alert('Tokens doubled!', `+${earned} Coffee Tokens added.`);
                  router.replace('/');
                }).then((shown) => {
                  if (!shown) {
                    Alert.alert('Ad unavailable', 'Please try again later.');
                  }
                });
              },
            },
            { text: "Back to Work", onPress: () => router.replace('/') },
          ]
        );
      }
    } else {
      // Regular Game Flow
      if (currentEnding) {
        router.replace('/ending');
      } else {
        setCurrentScenarioLocal(null);
        setIsTyping(false);
        setScenarioStartMs(null);
      }
    }
  };

  const handleBailout = () => {
    const success = useBailout();
    if (success) {
      playSfx('cash_register');
    } else {
      playSfx('sad_trombone');
    }
  };

  const handleAdBailout = () => {
    if (bailoutsUsedToday >= 2 || currentEnding) return;
    showRewardedAd(() => {
      const ok = useBailout({ free: true, clearEnding: true });
      if (!ok) {
        Alert.alert('Bailout unavailable', 'Cannot apply bailout right now.');
      }
    }).then((shown) => {
      if (!shown) {
        Alert.alert('Ad unavailable', 'Please try again later.');
      }
    });
  };

  // Handle boss button
  const handleBossButton = () => {
    router.push('/boss-button');
  };

  // Play SFX when consequence view appears
  useEffect(() => {
    if (gamePhase === 'consequence' && lastChoiceSfx) {
      playSfx(lastChoiceSfx);
    }
  }, [gamePhase, lastChoiceSfx]);

  // Animate stat change pills when consequence is showing
  useEffect(() => {
    if (gamePhase === 'consequence') {
      statChangeAnim.value = 0;
      statChangeAnim.value = withTiming(1, { duration: 250 });
      setContinueLocked(true);
      const timer = setTimeout(() => setContinueLocked(false), 2000);
      return () => clearTimeout(timer);
    } else {
      statChangeAnim.value = 0;
      setContinueLocked(false);
    }
  }, [gamePhase, statChangeAnim]);

  const statChangeStyle = useAnimatedStyle(() => ({
    opacity: statChangeAnim.value,
    transform: [{ translateY: (1 - statChangeAnim.value) * 8 }],
  }));

  // Get character info
  const character = currentScenario 
    ? CHARACTERS[currentScenario.character] 
    : null;

  const renderStatChangePill = (
    label: string,
    emoji: string,
    value: number,
    delta: number
  ) => {
    const deltaColor = delta > 0 ? '#4ecca3' : delta < 0 ? '#f39c12' : '#aaa';
    const deltaPrefix = delta > 0 ? '+' : '';

    return (
      <Animated.View key={label} style={[styles.statChangePill, statChangeStyle]}>
        <Text style={styles.statChangeLabel}>{emoji} {value}</Text>
        <Text style={[styles.statChangeDelta, { color: deltaColor }]}>
          {deltaPrefix}{delta}
        </Text>
      </Animated.View>
    );
  };

  const ChoiceButton = ({ choice }: { choice: Choice }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.97);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    return (
      <Animated.View style={[styles.choiceButton, animatedStyle]}>
        <Pressable
          onPress={() => handleChoice(choice)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={(gamePhase !== 'playing' && gamePhase !== 'daily_standup') || isTyping}
          style={({ pressed }) => [
            styles.choicePressable,
            pressed && styles.choicePressed,
            ((gamePhase !== 'playing' && gamePhase !== 'daily_standup') || isTyping) && styles.choiceDisabled,
          ]}
        >
          <Text style={styles.choiceText}>{choice.text}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  // Bailout availability
  const isStandupContext = gamePhase === 'daily_standup' || (gamePhase === 'consequence' && standupQueue.length > 0);
  const canTokenBailout = gamePhase === 'consequence' && !isStandupContext && !currentEnding && coffeeTokens >= 3;
  const canAdBailout = gamePhase === 'consequence' && !isStandupContext && !currentEnding && bailoutsUsedToday < 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dayCounter}>
          <Text style={styles.dayLabel}>
            {gamePhase === 'daily_standup' || (gamePhase === 'consequence' && standupQueue.length > 0) 
              ? 'STANDUP' 
              : 'DAY'}
          </Text>
          <Text style={styles.dayValue}>
            {gamePhase === 'daily_standup' || (gamePhase === 'consequence' && standupQueue.length > 0)
              ? `${standupIndex + 1}/3` 
              : daysSurvived + 1}
          </Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={styles.statText}>{stats.reputation}</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statEmoji}>🌀</Text>
            <Text style={styles.statText}>{stats.chaos}</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statEmoji}>🥷</Text>
            <Text style={styles.statText}>{stats.stealth}</Text>
          </View>
        </View>

        {/* Boss Button */}
        <Pressable style={styles.bossButton} onPress={handleBossButton}>
          <Text style={styles.bossButtonText}>💼</Text>
        </Pressable>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {(gamePhase === 'playing' || gamePhase === 'daily_standup') && currentScenario && (
          <>
            {/* Character & Category */}
            <View style={styles.scenarioHeader}>
              {character && character.id !== 'none' && (
                <View style={[styles.characterBadge, { borderColor: character.color }]}>
                  <Text style={styles.characterEmoji}>{character.emoji}</Text>
                  <Text style={styles.characterName}>{character.name}</Text>
                </View>
              )}
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {CATEGORY_LABELS[currentScenario.category]}
                </Text>
              </View>
            </View>

            {/* Scenario Text */}
            <View style={styles.scenarioCard}>
              <TypewriterText
                text={currentScenario.text}
                speed={30}
                onComplete={() => setIsTyping(false)}
                textStyle={styles.scenarioText}
                cursorStyle={styles.cursor}
              />
            </View>

            {/* Choices */}
            {!isTyping && (
              <View style={styles.choicesContainer}>
                {currentScenario.choices.map((choice) => (
                  <ChoiceButton key={choice.id} choice={choice} />
                ))}
              </View>
            )}
          </>
        )}

        {gamePhase === 'consequence' && (
          <View style={styles.consequenceContainer}>
            <Text style={styles.consequenceLabel}>😬 CONSEQUENCE</Text>
            <View style={styles.consequenceCard}>
              <Text style={styles.consequenceText}>{lastChoiceConsequence}</Text>
            </View>

            {lastStatChange && (
              <View style={styles.statChangeRow}>
                {renderStatChangePill('Reputation', '📊', stats.reputation, lastStatChange.reputation)}
                {renderStatChangePill('Chaos', '🌀', stats.chaos, lastStatChange.chaos)}
                {renderStatChangePill('Stealth', '🥷', stats.stealth, lastStatChange.stealth)}
              </View>
            )}
            
            <View style={styles.actionButtons}>
              {canTokenBailout && (
                <Pressable 
                  style={styles.bailoutButton}
                  onPress={handleBailout}
                >
                  <Text style={styles.bailoutEmoji}>☕</Text>
                  <View>
                    <Text style={styles.bailoutTitle}>HR Bailout</Text>
                    <Text style={styles.bailoutCost}>3 Tokens</Text>
                  </View>
                </Pressable>
              )}

              {canAdBailout && (
                <Pressable 
                  style={[styles.bailoutButton, styles.adBailoutButton]}
                  onPress={handleAdBailout}
                >
                  <Text style={styles.bailoutEmoji}>📺</Text>
                  <View>
                    <Text style={styles.bailoutTitle}>Free Bailout</Text>
                    <Text style={styles.bailoutCost}>Watch Ad ({2 - bailoutsUsedToday} left)</Text>
                  </View>
                </Pressable>
              )}

              <Pressable 
                style={[styles.continueButton, continueLocked && styles.continueButtonDisabled]} 
                onPress={handleContinue}
                disabled={continueLocked}
              >
                <Text style={styles.continueButtonText}>
                  {currentEnding ? 'See Your Fate' : 'Continue'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {(gamePhase === 'playing' || gamePhase === 'daily_standup') && !currentScenario && scenarios.length === 0 && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading scenarios...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dayCounter: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 10,
    color: '#888',
    fontFamily: 'monospace',
  },
  dayValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ecca3',
    fontFamily: 'monospace',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statEmoji: {
    fontSize: 14,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#eee',
    fontFamily: 'monospace',
  },
  bossButton: {
    width: 40,
    height: 40,
    backgroundColor: '#16213e',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bossButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  characterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
  },
  characterEmoji: {
    fontSize: 20,
  },
  characterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#eee',
  },
  categoryBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#aaa',
  },
  scenarioCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  scenarioText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#eee',
    fontFamily: 'monospace',
  },
  cursor: {
    color: '#4ecca3',
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: '#2d3a4f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ecca3',
  },
  choicePressable: {
    padding: 16,
  },
  choicePressed: {
    backgroundColor: '#243249',
  },
  choiceDisabled: {
    opacity: 0.5,
  },
  choiceText: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
  },
  consequenceContainer: {
    alignItems: 'center',
  },
  consequenceLabel: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  consequenceCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f39c12',
    width: '100%',
    marginBottom: 24,
  },
  consequenceText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#eee',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  actionButtons: {
    width: '100%',
    gap: 16,
  },
  continueButton: {
    backgroundColor: '#4ecca3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  bailoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d3a4f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f39c12',
    gap: 12,
  },
  bailoutEmoji: {
    fontSize: 24,
  },
  bailoutTitle: {
    color: '#f39c12',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bailoutCost: {
    color: '#aaa',
    fontSize: 12,
  },
  adBailoutButton: {
    borderColor: '#f39c12',
    backgroundColor: '#2d3a4f',
  },
  statChangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  statChangePill: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statChangeLabel: {
    fontSize: 14,
    color: '#eee',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  statChangeDelta: {
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'monospace',
  },
});
