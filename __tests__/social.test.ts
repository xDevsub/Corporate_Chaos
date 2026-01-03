import { determineArchetype, QUIZ_ARCHETYPES } from '../src/data/characterQuiz';
import { PlayerStats } from '../src/types/game.types';

describe('Character Quiz Logic', () => {
  it('identifies Karen from HR (High Rep, Low Chaos)', () => {
    const stats: PlayerStats = { reputation: 80, chaos: 10, stealth: 50 };
    expect(determineArchetype(stats)).toBe('Karen from HR');
  });

  it('identifies Chad the Disruptor (High Rep, Med Chaos)', () => {
    const stats: PlayerStats = { reputation: 65, chaos: 50, stealth: 20 };
    expect(determineArchetype(stats)).toBe('Chad the Disruptor');
  });

  it('identifies Dave from IT (High Stealth, Low Rep)', () => {
    const stats: PlayerStats = { reputation: 30, chaos: 30, stealth: 80 };
    expect(determineArchetype(stats)).toBe('Dave from IT');
  });

  it('identifies The Ghost (High Stealth, High Chaos)', () => {
    const stats: PlayerStats = { reputation: 50, chaos: 50, stealth: 90 };
    expect(determineArchetype(stats)).toBe('The Ghost');
  });

  it('identifies Linda the Micromanager (High Rep, High Chaos)', () => {
    const stats: PlayerStats = { reputation: 90, chaos: 90, stealth: 10 };
    expect(determineArchetype(stats)).toBe('Linda the Micromanager');
  });

  it('defaults to Gary the Intern for low/unmatched stats', () => {
    const stats: PlayerStats = { reputation: 20, chaos: 20, stealth: 20 };
    expect(determineArchetype(stats)).toBe('Gary the Intern');
  });

  it('has valid data for all archetypes', () => {
    const archetypes = Object.keys(QUIZ_ARCHETYPES);
    expect(archetypes).toHaveLength(6);
    archetypes.forEach((key) => {
      // @ts-ignore
      const data = QUIZ_ARCHETYPES[key];
      expect(data).toBeDefined();
      expect(data.archetype).toBe(key);
      expect(data.description).toBeTruthy();
    });
  });
});

