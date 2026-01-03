import scenariosData from '../src/data/scenarios.seed.json';
import { ScenariosDataSchema, Scenario } from '../src/types/scenario.types';

const parsed = ScenariosDataSchema.parse(scenariosData);

function countBy<T extends string>(items: Scenario[], key: (s: Scenario) => T) {
  return items.reduce<Record<T, number>>((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

describe('scenarios.seed.json', () => {
  it('has 30 scenarios', () => {
    expect(parsed.scenarios).toHaveLength(30);
  });

  it('meets minimum category distribution', () => {
    const categoryCount = countBy(parsed.scenarios, (s) => s.category);
    expect(categoryCount.boss ?? 0).toBeGreaterThanOrEqual(7);
    expect(categoryCount.meeting ?? 0).toBeGreaterThanOrEqual(6);
    expect(categoryCount.email ?? 0).toBeGreaterThanOrEqual(4);
    expect(categoryCount.hr ?? 0).toBeGreaterThanOrEqual(4);
    expect(categoryCount.remote ?? 0).toBeGreaterThanOrEqual(4);
    expect(categoryCount.random ?? 0).toBeGreaterThanOrEqual(3);
  });

  it('ensures each character appears at least 3 times', () => {
    const characterCount = countBy(parsed.scenarios, (s) => s.character);
    const expected = [
      'karen_hr',
      'chad_disruptor',
      'dave_it',
      'ghost_remote',
      'gary_intern',
      'linda_micromanager',
    ] as const;
    expected.forEach((id) => {
      expect(characterCount[id] ?? 0).toBeGreaterThanOrEqual(3);
    });
  });
});

