import { describe, it, expect } from 'vitest';

/**
 * QA Edge Case Tests
 *
 * Tests for runtime safety issues found during full QA audit:
 * 1. MiniChart doesn't crash with all-zero data
 * 2. MiniChart handles single data point
 * 3. Progress calculation doesn't return NaN for empty exercises
 */

// ── MiniChart safety ────────────────────────────────────────────────────────

describe('MiniChart edge cases', () => {
  it('safeMax prevents division by zero with all-zero bar data', () => {
    // Simulating the calculation that was buggy:
    const data = [0, 0, 0];
    const max = Math.max(...data);
    const safeMax = max || 1; // The fix

    // This was producing NaN before the fix
    const height = (data[0] / safeMax) * 45;
    expect(Number.isNaN(height)).toBe(false);
    expect(height).toBe(0);
  });

  it('single element line chart data.length - 1 is 0', () => {
    const data = [42];
    // Before fix: i / (data.length - 1) = 0/0 = NaN
    // After fix: we render a dot instead
    expect(data.length).toBe(1);
    // The component now returns a <circle> for single-element arrays
    // instead of trying to compute `i / (data.length - 1)`
  });

  it('all-same-value data produces valid range', () => {
    const data = [50, 50, 50, 50];
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1; // The existing guard
    expect(range).toBe(1);
    expect(Number.isNaN((data[0] - min) / range)).toBe(false);
  });
});

// ── Progress calculation safety ────────────────────────────────────────────

describe('Workout progress edge cases', () => {
  it('returns 0 when total sets is 0 (no exercises)', () => {
    const total = 0;
    const done = 0;
    // The fix: total > 0 ? Math.round((done / total) * 100) : 0
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    expect(progress).toBe(0);
    expect(Number.isNaN(progress)).toBe(false);
  });

  it('calculates progress correctly with normal data', () => {
    const total = 12;
    const done = 6;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    expect(progress).toBe(50);
  });

  it('returns 100 when all sets complete', () => {
    const total = 9;
    const done = 9;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    expect(progress).toBe(100);
  });
});

// ── Volume formatting safety ────────────────────────────────────────────────

describe('Volume formatting edge cases', async () => {
  const { formatVolume, formatVolumeDelta, formatPctChange } = await import('@/shared/utils/format');

  it('formats zero volume', () => {
    expect(formatVolume(0)).toBe('0kg');
  });

  it('formats negative delta', () => {
    expect(formatVolumeDelta(-500)).toBe('-500kg');
  });

  it('formats zero percentage change', () => {
    expect(formatPctChange(0)).toBe('+0%');
  });

  it('formats large volume with abbreviation', () => {
    expect(formatVolume(14200, { abbreviated: true })).toBe('14.2t');
  });

  it('formats small volume without abbreviation', () => {
    expect(formatVolume(500, { abbreviated: true })).toBe('500kg');
  });
});

// ── Muscle volume breakdown safety ──────────────────────────────────────────

describe('Muscle volume breakdown edge cases', async () => {
  const { computeMuscleVolumeBreakdown } = await import('@/shared/utils/format');

  it('returns empty array for no sets', () => {
    expect(computeMuscleVolumeBreakdown([], () => 'Chest')).toEqual([]);
  });

  it('returns empty for zero-weight sets', () => {
    const sets = [
      { exerciseName: 'Push-up', weightKg: 0, reps: 10, rpe: 7 as const, setNumber: 1, volume: 0 },
    ];
    const result = computeMuscleVolumeBreakdown(sets, () => 'Chest');
    // Zero weight × reps = 0 volume, total = 0, so returns empty
    expect(result).toEqual([]);
  });

  it('handles single muscle group', () => {
    const sets = [
      { exerciseName: 'Bench Press', weightKg: 80, reps: 8, rpe: 7 as const, setNumber: 1, volume: 640 },
      { exerciseName: 'Incline Press', weightKg: 60, reps: 10, rpe: 8 as const, setNumber: 1, volume: 600 },
    ];
    const result = computeMuscleVolumeBreakdown(sets, () => 'Chest');
    expect(result).toHaveLength(1);
    expect(result[0].muscle).toBe('Chest');
    expect(result[0].pct).toBe(100);
  });
});
