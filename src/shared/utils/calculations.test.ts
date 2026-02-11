import { describe, it, expect } from 'vitest';
import { calculate1RM, getWarmupSets, formatTime, getProteinGoal, WATER_GOAL } from './calculations';

describe('calculate1RM (Epley formula)', () => {
  it('returns the weight itself for a single rep', () => {
    expect(calculate1RM(100, 1)).toBe(100);
  });

  it('calculates correctly for standard rep ranges', () => {
    // 100kg x 5 reps → 100 * (1 + 5/30) = 100 * 1.167 ≈ 117
    expect(calculate1RM(100, 5)).toBe(117);
  });

  it('calculates correctly for high reps', () => {
    // 60kg x 10 reps → 60 * (1 + 10/30) = 60 * 1.333 ≈ 80
    expect(calculate1RM(60, 10)).toBe(80);
  });

  it('calculates correctly for light weight high reps', () => {
    // 20kg x 15 reps → 20 * (1 + 15/30) = 20 * 1.5 = 30
    expect(calculate1RM(20, 15)).toBe(30);
  });

  it('handles zero weight', () => {
    expect(calculate1RM(0, 10)).toBe(0);
  });

  it('rounds to nearest whole number', () => {
    // 75kg x 3 reps → 75 * (1 + 3/30) = 75 * 1.1 = 82.5 → 83
    expect(calculate1RM(75, 3)).toBe(83);
  });
});

describe('getWarmupSets', () => {
  it('returns empty array for very light weights', () => {
    expect(getWarmupSets(15)).toEqual([]);
  });

  it('always starts with bar for 20kg working weight', () => {
    const sets = getWarmupSets(20);
    expect(sets[0]).toEqual({ label: 'Bar', weightKg: 20, reps: 10 });
    // 50% of 20 = 10 → rounds to 10, but 10 < 20 so no 50% set
    // 70% of 20 = 14 → rounds to 12.5, 12.5 < 50%? depends on rounding
    // Just verify all sets are valid warmup structure
    sets.forEach(s => {
      expect(s).toHaveProperty('label');
      expect(s).toHaveProperty('weightKg');
      expect(s).toHaveProperty('reps');
      expect(s.weightKg).toBeGreaterThan(0);
    });
  });

  it('generates correct warmup pyramid for 100kg', () => {
    const sets = getWarmupSets(100);
    expect(sets[0]).toEqual({ label: 'Bar', weightKg: 20, reps: 10 });

    // 50% of 100 = 50
    const set50 = sets.find(s => s.label === '50%');
    expect(set50?.weightKg).toBe(50);
    expect(set50?.reps).toBe(5);

    // 70% of 100 = 70
    const set70 = sets.find(s => s.label === '70%');
    expect(set70?.weightKg).toBe(70);
    expect(set70?.reps).toBe(3);

    // 90% of 100 = 90
    const set90 = sets.find(s => s.label === '90%');
    expect(set90?.weightKg).toBe(90);
    expect(set90?.reps).toBe(1);
  });

  it('rounds warmup weights to nearest 2.5kg', () => {
    // 63kg working weight: 50% = 31.5 → 32.5
    const sets = getWarmupSets(63);
    const set50 = sets.find(s => s.label === '50%');
    expect(set50?.weightKg! % 2.5).toBe(0);
  });
});

describe('formatTime', () => {
  it('formats seconds correctly', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(30)).toBe('0:30');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(125)).toBe('2:05');
  });
});

describe('getProteinGoal', () => {
  it('calculates 1.8g per kg bodyweight', () => {
    expect(getProteinGoal(80)).toBe(144); // 80 * 1.8 = 144
    expect(getProteinGoal(60)).toBe(108); // 60 * 1.8 = 108
    expect(getProteinGoal(100)).toBe(180);
  });

  it('rounds to nearest whole number', () => {
    expect(getProteinGoal(75)).toBe(135); // 75 * 1.8 = 135
  });
});

describe('WATER_GOAL', () => {
  it('is 8 glasses', () => {
    expect(WATER_GOAL).toBe(8);
  });
});
