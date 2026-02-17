import { describe, expect, it } from 'vitest';
import { calculateProgression, formatProgressionBanner } from './progression';

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

describe('formatProgressionBanner', () => {
  it('shows weight increase with success tone', () => {
    const result = {
      exerciseId: 'ex1',
      field: 'weightKg' as const,
      oldValue: 80,
      newValue: 82.5,
      reason: 'Target reps reached, progressing weight',
    };
    const banner = formatProgressionBanner(result, 80);

    expect(banner.tone).toBe('success');
    expect(banner.icon).toBe('\u2191');
    expect(banner.label).toContain('82.5kg');
    expect(banner.label).toContain('+2.5kg');
  });

  it('shows weight decrease with warning tone', () => {
    const result = {
      exerciseId: 'ex1',
      field: 'weightKg' as const,
      oldValue: 80,
      newValue: 77.5,
      reason: 'RPE 10 - reducing weight for safety',
    };
    const banner = formatProgressionBanner(result, 80);

    expect(banner.tone).toBe('warning');
    expect(banner.icon).toBe('\u2193');
    expect(banner.label).toContain('77.5kg');
    expect(banner.label).toContain('-2.5kg');
  });

  it('shows rep increase with success tone', () => {
    const result = {
      exerciseId: 'ex1',
      field: 'reps' as const,
      oldValue: 8,
      newValue: 9,
      reason: 'RPE indicates room for more reps',
    };
    const banner = formatProgressionBanner(result, 80);

    expect(banner.tone).toBe('success');
    expect(banner.icon).toBe('\u2191');
    expect(banner.label).toContain('80kg');
    expect(banner.label).toContain('9 reps');
    expect(banner.label).toContain('+1 rep');
    expect(banner.label).not.toContain('+1 reps');
  });

  it('pluralizes reps correctly for multi-rep increase', () => {
    const result = {
      exerciseId: 'ex1',
      field: 'reps' as const,
      oldValue: 6,
      newValue: 8,
      reason: 'RPE indicates room for more reps',
    };
    const banner = formatProgressionBanner(result, 60);

    expect(banner.label).toContain('+2 reps');
  });

  it('shows neutral banner for null result (no change)', () => {
    const banner = formatProgressionBanner(null, 80);

    expect(banner.tone).toBe('neutral');
    expect(banner.icon).toBe('\u2192');
    expect(banner.label).toContain('same weight');
  });
});
