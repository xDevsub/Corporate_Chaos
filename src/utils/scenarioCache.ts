import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScenariosData, ScenariosDataSchema, Scenario } from '../types/scenario.types';
import bundledData from '../data/scenarios.seed.json';

const SCENARIOS_KEY = 'corporate-chaos-scenarios';

const bundledScenarios: ScenariosData = bundledData as ScenariosData;

function parseScenarios(data: unknown): ScenariosData | null {
  try {
    return ScenariosDataSchema.parse(data);
  } catch (error) {
    console.warn('Scenario validation failed; falling back to bundled data', error);
    return null;
  }
}

/**
 * Ensure scenarios are cached locally; if none or version mismatch, seed from bundled.
 * Returns the validated scenarios to use in-app.
 */
export async function ensureScenariosCached(): Promise<Scenario[]> {
  try {
    const cachedRaw = await AsyncStorage.getItem(SCENARIOS_KEY);
    if (cachedRaw) {
      const parsed = parseScenarios(JSON.parse(cachedRaw));
      if (parsed && parsed.version === bundledScenarios.version) {
        return parsed.scenarios;
      }
    }

    await AsyncStorage.setItem(SCENARIOS_KEY, JSON.stringify(bundledScenarios));
    return bundledScenarios.scenarios;
  } catch (error) {
    console.warn('Failed to cache scenarios; using bundled copy', error);
    return bundledScenarios.scenarios;
  }
}

/**
 * Load scenarios from cache if present; otherwise seed from bundled and return that.
 */
export async function getCachedScenarios(): Promise<Scenario[]> {
  try {
    const cachedRaw = await AsyncStorage.getItem(SCENARIOS_KEY);
    if (cachedRaw) {
      const parsed = parseScenarios(JSON.parse(cachedRaw));
      if (parsed) {
        return parsed.scenarios;
      }
    }
  } catch (error) {
    console.warn('Failed to read cached scenarios; using bundled copy', error);
  }

  await AsyncStorage.setItem(SCENARIOS_KEY, JSON.stringify(bundledScenarios));
  return bundledScenarios.scenarios;
}

