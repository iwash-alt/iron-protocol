import { formatVolume, formatVolumeDelta, formatPctChange, computeMuscleVolumeBreakdown } from './format';
import type { SetLog } from '@/shared/types';

describe('formatVolume', () => {
  it('formats small values without commas', () => {
    expect(formatVolume(850)).toBe('850kg');
  });

  it('formats values >= 1000 with commas', () => {
    expect(formatVolume(14200)).toBe('14,200kg');
  });

  it('formats large values with commas', () => {
    expect(formatVolume(142000)).toBe('142,000kg');
  });

  it('formats zero', () => {
    expect(formatVolume(0)).toBe('0kg');
  });

  it('rounds fractional values', () => {
    expect(formatVolume(1234.7)).toBe('1,235kg');
  });

  it('supports abbreviated mode for >= 1000', () => {
    expect(formatVolume(14200, { abbreviated: true })).toBe('14.2t');
  });

  it('abbreviated mode falls back to kg for < 1000', () => {
    expect(formatVolume(500, { abbreviated: true })).toBe('500kg');
  });
});

describe('formatVolumeDelta', () => {
  it('adds + prefix for positive values', () => {
    expect(formatVolumeDelta(1400)).toBe('+1,400kg');
  });

  it('adds - prefix for negative values', () => {
    expect(formatVolumeDelta(-200)).toBe('-200kg');
  });

  it('formats zero with + prefix', () => {
    expect(formatVolumeDelta(0)).toBe('+0kg');
  });

  it('rounds fractional deltas', () => {
    expect(formatVolumeDelta(1400.6)).toBe('+1,401kg');
  });
});

describe('formatPctChange', () => {
  it('formats positive change', () => {
    expect(formatPctChange(11)).toBe('+11%');
  });

  it('formats negative change', () => {
    expect(formatPctChange(-5)).toBe('-5%');
  });

  it('formats zero change', () => {
    expect(formatPctChange(0)).toBe('+0%');
  });

  it('rounds fractional percentages', () => {
    expect(formatPctChange(11.7)).toBe('+12%');
  });
});

describe('computeMuscleVolumeBreakdown', () => {
  const makeSet = (exerciseName: string, weightKg: number, reps: number): SetLog => ({
    exerciseName,
    weightKg,
    reps,
    setNumber: 1,
    rpe: 8 as const,
  });

  it('computes per-muscle volume and percentages', () => {
    const sets = [
      makeSet('Bench Press', 80, 10),
      makeSet('Bench Press', 80, 10),
      makeSet('Squat', 100, 8),
    ];
    const lookup = (name: string) => (name === 'Bench Press' ? 'Chest' : 'Quads');
    const result = computeMuscleVolumeBreakdown(sets, lookup);

    expect(result).toHaveLength(2);
    // Chest: 80*10 + 80*10 = 1600; Quads: 100*8 = 800; total = 2400
    expect(result[0]).toEqual({ muscle: 'Chest', volumeKg: 1600, pct: 67 });
    expect(result[1]).toEqual({ muscle: 'Quads', volumeKg: 800, pct: 33 });
  });

  it('returns empty array for empty sets', () => {
    expect(computeMuscleVolumeBreakdown([], () => 'Chest')).toEqual([]);
  });

  it('sorts by volume descending', () => {
    const sets = [
      makeSet('Curl', 20, 10),
      makeSet('Bench Press', 80, 10),
      makeSet('Squat', 100, 8),
    ];
    const lookup = (name: string) => {
      if (name === 'Curl') return 'Biceps';
      if (name === 'Bench Press') return 'Chest';
      return 'Quads';
    };
    const result = computeMuscleVolumeBreakdown(sets, lookup);

    expect(result[0].muscle).toBe('Chest');
    expect(result[1].muscle).toBe('Quads');
    expect(result[2].muscle).toBe('Biceps');
  });

  it('groups multiple exercises for the same muscle', () => {
    const sets = [
      makeSet('Bench Press', 80, 10),
      makeSet('Incline Press', 60, 10),
    ];
    const lookup = () => 'Chest';
    const result = computeMuscleVolumeBreakdown(sets, lookup);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ muscle: 'Chest', volumeKg: 1400, pct: 100 });
  });

  it('handles zero-weight sets (bodyweight)', () => {
    const sets = [makeSet('Push Up', 0, 20)];
    const result = computeMuscleVolumeBreakdown(sets, () => 'Chest');
    expect(result).toEqual([]);
  });
});
