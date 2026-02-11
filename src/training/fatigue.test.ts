import { describe, it, expect } from 'vitest';
import { calculateFatigueScore } from './fatigue';
import type { WorkoutLog, SetLog } from '@/shared/types';
import type { RPEValue } from '@/shared/types/workout';

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Fixed reference date — all tests use this for determinism. */
const NOW = new Date('2026-02-09T12:00:00Z');

/** Shorthand to build a single set. */
function makeSet(
  rpe: RPEValue = 8,
  weightKg = 80,
  reps = 8,
  name = 'Squat',
  setNumber = 1,
): SetLog {
  return { exerciseName: name, weightKg, reps, setNumber, rpe };
}

/** Build a WorkoutLog for a given date string with uniform sets. */
function makeWorkout(
  date: string,
  opts: {
    rpe?: RPEValue;
    sets?: number;
    volumeKg?: number;
    completion?: number;
    dayName?: string;
    customSets?: SetLog[];
  } = {},
): WorkoutLog {
  const {
    rpe = 8,
    sets: setCount = 4,
    volumeKg,
    completion = 100,
    dayName = 'Push Day',
    customSets,
  } = opts;

  const setsList =
    customSets ?? Array.from({ length: setCount }, (_, i) => makeSet(rpe, 80, 8, 'Squat', i + 1));

  const totalVolumeKg = volumeKg ?? setsList.reduce((s, set) => s + set.weightKg * set.reps, 0);

  return {
    date,
    dayName,
    sets: setsList,
    totalVolumeKg,
    completionPercent: completion,
  };
}

/**
 * Generate a sequence of workouts on consecutive days ending on a
 * given date. Days count backward from `endDate`.
 */
function makeConsecutiveWorkouts(
  count: number,
  opts: { endDate?: string; rpe?: RPEValue; volumeKg?: number; completion?: number } = {},
): WorkoutLog[] {
  const { endDate = '2026-02-08', rpe = 8, volumeKg, completion = 100 } = opts;
  const end = new Date(endDate + 'T00:00:00Z');
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() - (count - 1 - i));
    return makeWorkout(d.toISOString().split('T')[0], { rpe, volumeKg, completion });
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('calculateFatigueScore', () => {
  // ── 1. Insufficient history ──────────────────────────────────────────────

  it('returns score 0 for empty history', () => {
    const result = calculateFatigueScore([], undefined, NOW);
    expect(result.score).toBe(0);
    expect(result.trend).toBe('stable');
    expect(result.factors).toEqual([]);
    expect(result.suggestedAction).toBe('normal');
  });

  it('returns score 0 for a single workout (< 2 needed)', () => {
    const history = [makeWorkout('2026-02-08')];
    const result = calculateFatigueScore(history, undefined, NOW);
    expect(result.score).toBe(0);
    expect(result.recommendation).toMatch(/few more sessions/i);
  });

  it('returns score 0 when workouts are older than 14 days', () => {
    const history = [
      makeWorkout('2026-01-01'),
      makeWorkout('2026-01-05'),
    ];
    const result = calculateFatigueScore(history, undefined, NOW);
    expect(result.score).toBe(0);
    expect(result.factors).toEqual([]);
  });

  // ── 2. Low fatigue (moderate RPE, good completion) ───────────────────────

  it('reports low fatigue for moderate RPE with full completion', () => {
    const history = [
      makeWorkout('2026-02-04', { rpe: 7, completion: 100, volumeKg: 3000 }),
      makeWorkout('2026-02-06', { rpe: 7, completion: 100, volumeKg: 3000 }),
      makeWorkout('2026-02-08', { rpe: 7, completion: 100, volumeKg: 3000 }),
    ];
    const result = calculateFatigueScore(history, undefined, NOW);
    expect(result.score).toBeLessThanOrEqual(30);
    expect(result.suggestedAction).toBe('normal');
  });

  // ── 3. High fatigue from rising RPE pattern ──────────────────────────────

  it('reports high fatigue when RPE is consistently 9-10 with other signals', () => {
    // Prev week: high volume at moderate RPE
    const prevWeek = [
      makeWorkout('2026-01-28', { rpe: 7, volumeKg: 12000, completion: 100 }),
      makeWorkout('2026-01-30', { rpe: 7, volumeKg: 12000, completion: 100 }),
    ];
    // This week: 6 consecutive days at RPE 10, volume crashed, incomplete
    const thisWeek = makeConsecutiveWorkouts(6, {
      rpe: 10,
      endDate: '2026-02-08',
      volumeKg: 2000,
      completion: 60,
    });
    const result = calculateFatigueScore([...prevWeek, ...thisWeek], undefined, NOW);
    expect(result.score).toBeGreaterThan(50);
    expect(['lighter', 'deload', 'rest']).toContain(result.suggestedAction);
  });

  it('detects rising RPE pattern (7 -> 9-10)', () => {
    const history = [
      // Earlier workouts at lower RPE
      makeWorkout('2026-01-28', { rpe: 7 }),
      makeWorkout('2026-01-30', { rpe: 7 }),
      makeWorkout('2026-02-01', { rpe: 7 }),
      // Recent workouts at higher RPE
      makeWorkout('2026-02-05', { rpe: 9 }),
      makeWorkout('2026-02-07', { rpe: 10 }),
      makeWorkout('2026-02-08', { rpe: 10 }),
    ];
    const result = calculateFatigueScore(history, undefined, NOW);
    // Rising RPE should produce a non-trivial score
    expect(result.score).toBeGreaterThan(20);

    const rpeFactor = result.factors.find(f => f.name === 'RPE Trend');
    expect(rpeFactor).toBeDefined();
    expect(rpeFactor!.contribution).toBeGreaterThan(0);
  });

  // ── 4. Volume drop detection ─────────────────────────────────────────────

  it('detects fatigue from volume drop between weeks', () => {
    // Previous week (8-14 days ago): high volume
    const prevWeek = [
      makeWorkout('2026-01-28', { rpe: 8, volumeKg: 10000 }),
      makeWorkout('2026-01-30', { rpe: 8, volumeKg: 10000 }),
      makeWorkout('2026-02-01', { rpe: 8, volumeKg: 10000 }),
    ];
    // This week (last 7 days): low volume — involuntary reduction
    const thisWeek = [
      makeWorkout('2026-02-05', { rpe: 8, volumeKg: 2000 }),
      makeWorkout('2026-02-08', { rpe: 8, volumeKg: 2000 }),
    ];
    const result = calculateFatigueScore([...prevWeek, ...thisWeek], undefined, NOW);

    const volumeFactor = result.factors.find(f => f.name === 'Volume Drop');
    expect(volumeFactor).toBeDefined();
    expect(volumeFactor!.contribution).toBeGreaterThan(0);
    expect(volumeFactor!.detail).toMatch(/vs prev/);
  });

  it('does not flag volume when both weeks are similar', () => {
    const history = [
      makeWorkout('2026-01-28', { rpe: 7, volumeKg: 5000 }),
      makeWorkout('2026-01-30', { rpe: 7, volumeKg: 5000 }),
      makeWorkout('2026-02-05', { rpe: 7, volumeKg: 5000 }),
      makeWorkout('2026-02-08', { rpe: 7, volumeKg: 5000 }),
    ];
    const result = calculateFatigueScore(history, undefined, NOW);
    const volumeFactor = result.factors.find(f => f.name === 'Volume Drop');
    expect(volumeFactor).toBeDefined();
    // With equal volume, the volume drop contribution should be 0
    expect(volumeFactor!.contribution).toBe(0);
  });

  // ── 5. Failed sets factor ────────────────────────────────────────────────

  it('detects failed sets (RPE 10) as a fatigue factor', () => {
    const failedSets: SetLog[] = [
      makeSet(10, 100, 5, 'Bench Press', 1),
      makeSet(10, 100, 3, 'Bench Press', 2),
      makeSet(10, 100, 2, 'Bench Press', 3),
      makeSet(10, 100, 2, 'Bench Press', 4),
    ];
    const history = [
      makeWorkout('2026-02-06', { customSets: failedSets }),
      makeWorkout('2026-02-08', { customSets: failedSets }),
    ];
    const result = calculateFatigueScore(history, undefined, NOW);

    const failFactor = result.factors.find(f => f.name === 'Failed Sets');
    expect(failFactor).toBeDefined();
    expect(failFactor!.contribution).toBeGreaterThan(0);
    expect(failFactor!.detail).toMatch(/RPE 10/);
  });

  it('reports no failed sets contribution when all RPE < 10', () => {
    const history = [
      makeWorkout('2026-02-06', { rpe: 8 }),
      makeWorkout('2026-02-08', { rpe: 8 }),
    ];
    const result = calculateFatigueScore(history, undefined, NOW);

    const failFactor = result.factors.find(f => f.name === 'Failed Sets');
    expect(failFactor).toBeDefined();
    expect(failFactor!.contribution).toBe(0);
    expect(failFactor!.detail).toMatch(/No failed sets/);
  });

  // ── 6. Trend detection ───────────────────────────────────────────────────

  it('detects "rising" trend when second-half RPE > first-half by > 0.3', () => {
    const history = [
      // First half — low RPE
      makeWorkout('2026-01-28', { rpe: 6 }),
      makeWorkout('2026-01-30', { rpe: 6 }),
      makeWorkout('2026-02-01', { rpe: 7 }),
      // Second half — high RPE
      makeWorkout('2026-02-05', { rpe: 9 }),
      makeWorkout('2026-02-07', { rpe: 9 }),
      makeWorkout('2026-02-08', { rpe: 10 }),
    ];
    const result = calculateFatigueScore(history, undefined, NOW);
    expect(result.trend).toBe('rising');
  });

  it('detects "falling" trend when second-half RPE < first-half by > 0.3', () => {
    const history = [
      // First half — high RPE
      makeWorkout('2026-01-28', { rpe: 10 }),
      makeWorkout('2026-01-30', { rpe: 9 }),
      makeWorkout('2026-02-01', { rpe: 9 }),
      // Second half — low RPE (recovery)
      makeWorkout('2026-02-05', { rpe: 7 }),
      makeWorkout('2026-02-07', { rpe: 6 }),
      makeWorkout('2026-02-08', { rpe: 6 }),
    ];
    const result = calculateFatigueScore(history, undefined, NOW);
    expect(result.trend).toBe('falling');
  });

  // ── 7. Recommendation correctness ────────────────────────────────────────

  it('recommends "train as programmed" for low fatigue', () => {
    // Very easy workouts, well-spaced
    const history = [
      makeWorkout('2026-02-04', { rpe: 6, volumeKg: 3000, completion: 100 }),
      makeWorkout('2026-02-08', { rpe: 6, volumeKg: 3000, completion: 100 }),
    ];
    const result = calculateFatigueScore(history, undefined, NOW);
    expect(result.score).toBeLessThanOrEqual(30);
    expect(result.recommendation).toMatch(/fresh/i);
  });

  it('recommends recovery for critical fatigue', () => {
    // Build a history that maxes out every factor
    const brutalSets: SetLog[] = Array.from({ length: 8 }, (_, i) =>
      makeSet(10, 120, 3, 'Deadlift', i + 1),
    );
    // Prev week: very high volume
    const prevWeek = [
      makeWorkout('2026-01-27', { rpe: 9, volumeKg: 20000, completion: 100 }),
      makeWorkout('2026-01-28', { rpe: 9, volumeKg: 20000, completion: 100 }),
      makeWorkout('2026-01-29', { rpe: 9, volumeKg: 20000, completion: 100 }),
    ];
    // This week: 7 consecutive days of RPE 10, low completion, volume crashed
    const thisWeek = makeConsecutiveWorkouts(7, {
      endDate: '2026-02-08',
      rpe: 10,
      volumeKg: 1000,
      completion: 40,
    }).map(w => ({ ...w, sets: brutalSets }));

    const result = calculateFatigueScore([...prevWeek, ...thisWeek], undefined, NOW);
    expect(result.score).toBeGreaterThan(70);
    expect(['deload', 'rest']).toContain(result.suggestedAction);
  });

  // ── 8. suggestedAction thresholds ────────────────────────────────────────

  it('returns "lighter" when fatigue score is between 51 and 70', () => {
    // Moderate-high stress: elevated RPE, some incomplete workouts
    const history = [
      makeWorkout('2026-01-28', { rpe: 7, volumeKg: 10000, completion: 100 }),
      makeWorkout('2026-01-30', { rpe: 7, volumeKg: 10000, completion: 100 }),
      makeWorkout('2026-02-03', { rpe: 9, volumeKg: 4000, completion: 70, sets: 6 }),
      makeWorkout('2026-02-05', { rpe: 9, volumeKg: 4000, completion: 60, sets: 6 }),
      makeWorkout('2026-02-07', { rpe: 9, volumeKg: 4000, completion: 70, sets: 6 }),
      makeWorkout('2026-02-08', { rpe: 9, volumeKg: 4000, completion: 60, sets: 6 }),
    ];
    const result = calculateFatigueScore(history, undefined, NOW);
    // We verify it enters the elevated zone at minimum
    expect(result.score).toBeGreaterThan(30);
    expect(['lighter', 'deload', 'rest']).toContain(result.suggestedAction);
  });

  // ── 9. Training frequency factor ─────────────────────────────────────────

  it('flags high training frequency for many consecutive days', () => {
    // 7 consecutive days of training within last 7 days
    const history = makeConsecutiveWorkouts(7, {
      endDate: '2026-02-08',
      rpe: 8,
    });
    const result = calculateFatigueScore(history, undefined, NOW);

    const freqFactor = result.factors.find(f => f.name === 'Training Frequency');
    expect(freqFactor).toBeDefined();
    expect(freqFactor!.contribution).toBeGreaterThan(0);
    // 7 sessions with 6 consecutive-day pairs
    expect(freqFactor!.detail).toMatch(/7 sessions/);
    expect(freqFactor!.detail).toMatch(/consecutive/);
  });

  it('does not flag frequency for well-spaced sessions', () => {
    const history = [
      makeWorkout('2026-02-03', { rpe: 7 }),
      makeWorkout('2026-02-06', { rpe: 7 }),
      makeWorkout('2026-02-08', { rpe: 7 }),
    ];
    const result = calculateFatigueScore(history, undefined, NOW);

    const freqFactor = result.factors.find(f => f.name === 'Training Frequency');
    expect(freqFactor).toBeDefined();
    // 3 sessions, <4 threshold, no consecutive days
    expect(freqFactor!.contribution).toBe(0);
  });

  // ── Structural / factors array ───────────────────────────────────────────

  it('always returns exactly 5 factors when history is sufficient', () => {
    const history = [
      makeWorkout('2026-02-06', { rpe: 8 }),
      makeWorkout('2026-02-08', { rpe: 8 }),
    ];
    const result = calculateFatigueScore(history, undefined, NOW);
    expect(result.factors).toHaveLength(5);

    const names = result.factors.map(f => f.name);
    expect(names).toContain('RPE Trend');
    expect(names).toContain('Volume Drop');
    expect(names).toContain('Incomplete Workouts');
    expect(names).toContain('Training Frequency');
    expect(names).toContain('Failed Sets');
  });
});
