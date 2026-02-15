import { describe, expect, it } from 'vitest';
import { calculateProgression } from './progression';

describe('calculateProgression', () => {
  it('increases reps for RPE 6 with reps below target', () => {
    const result = calculateProgression(6, { weightKg: 60, reps: 8, sets: 4, targetReps: 12 });

    expect(result).toMatchObject({
      field: 'reps',
      oldValue: 8,
      newValue: 9,
    });
  });

  it('increases weight for RPE 7 when target reps are reached', () => {
    const result = calculateProgression(7, { weightKg: 60, reps: 12, sets: 4, targetReps: 12 });

    expect(result).toMatchObject({
      field: 'weightKg',
      oldValue: 60,
      newValue: 62.5,
    });
  });

  it('returns null for RPE 8-9', () => {
    expect(calculateProgression(8, { weightKg: 60, reps: 10, sets: 4, targetReps: 12 })).toBeNull();
    expect(calculateProgression(9, { weightKg: 60, reps: 10, sets: 4, targetReps: 12 })).toBeNull();
  });

  it('decreases weight for RPE 10', () => {
    const result = calculateProgression(10, { weightKg: 60, reps: 10, sets: 4, targetReps: 12 });

    expect(result).toMatchObject({
      field: 'weightKg',
      oldValue: 60,
      newValue: 57.5,
    });
  });

  it('does not allow weight below zero', () => {
    const result = calculateProgression(10, { weightKg: 0, reps: 8, sets: 4, targetReps: 12 });

    expect(result).toMatchObject({
      field: 'weightKg',
      oldValue: 0,
      newValue: 0,
    });
  });
});
