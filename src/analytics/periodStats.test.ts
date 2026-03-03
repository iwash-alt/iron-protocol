import { describe, it, expect } from 'vitest';
import type {
  WorkoutLog, SetLog, ExerciseHistory,
  ExerciseHistoryEntry, RPEValue,
} from '@/shared/types';
import { getPRTrends, getAvgRPETrend } from './periodStats';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSet(overrides: Partial<SetLog> = {}): SetLog {
  return {
    exerciseName: 'Bench Press',
    weightKg: 80,
    reps: 8,
    setNumber: 1,
    rpe: 8 as RPEValue,
    ...overrides,
  };
}

function makeWorkout(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    date: '2025-03-17',
    dayName: 'Push Day',
    sets: [makeSet()],
    totalVolumeKg: 640,
    completionPercent: 100,
    ...overrides,
  };
}

function makeExerciseEntry(overrides: Partial<ExerciseHistoryEntry> = {}): ExerciseHistoryEntry {
  return {
    date: '2025-03-17',
    weightKg: 80,
    reps: 8,
    estimated1RM: 100,
    ...overrides,
  };
}

// Wednesday March 19, 2025 → week starts Monday March 17
const NOW = new Date('2025-03-19');

// ── getPRTrends ──────────────────────────────────────────────────────────────

describe('getPRTrends', () => {
  it('returns empty result for empty exercise history', () => {
    const result = getPRTrends({}, 'week', 3, NOW);
    expect(result.exercises).toEqual([]);
    expect(result.dataPoints).toEqual([]);
  });

  it('returns top N exercises by best 1RM', () => {
    const history: ExerciseHistory = {
      'Bench Press': [makeExerciseEntry({ estimated1RM: 120 })],
      'Squat': [makeExerciseEntry({ estimated1RM: 150 })],
      'Deadlift': [makeExerciseEntry({ estimated1RM: 180 })],
      'Overhead Press': [makeExerciseEntry({ estimated1RM: 70 })],
    };

    const result = getPRTrends(history, 'week', 3, NOW);
    expect(result.exercises).toHaveLength(3);
    expect(result.exercises[0]).toBe('Deadlift');
    expect(result.exercises[1]).toBe('Squat');
    expect(result.exercises[2]).toBe('Bench Press');
  });

  it('buckets data correctly for weekly period', () => {
    const history: ExerciseHistory = {
      'Bench Press': [
        makeExerciseEntry({ date: '2025-03-17', estimated1RM: 100 }),
        makeExerciseEntry({ date: '2025-03-19', estimated1RM: 105 }),
      ],
    };

    const result = getPRTrends(history, 'week', 3, NOW);
    // Weekly has 7 buckets (Mon-Sun)
    expect(result.dataPoints).toHaveLength(7);
    // Monday bucket should have 100
    expect(result.dataPoints[0]?.['Bench Press']).toBe(100);
    // Wednesday bucket should have 105
    expect(result.dataPoints[2]?.['Bench Press']).toBe(105);
  });

  it('picks best 1RM within each bucket', () => {
    const history: ExerciseHistory = {
      'Bench Press': [
        makeExerciseEntry({ date: '2025-03-17', estimated1RM: 95 }),
        makeExerciseEntry({ date: '2025-03-17', estimated1RM: 105 }),
      ],
    };

    const result = getPRTrends(history, 'week', 3, NOW);
    expect(result.dataPoints[0]?.['Bench Press']).toBe(105);
  });

  it('returns 0 for buckets with no data', () => {
    const history: ExerciseHistory = {
      'Bench Press': [
        makeExerciseEntry({ date: '2025-03-17', estimated1RM: 100 }),
      ],
    };

    const result = getPRTrends(history, 'week', 3, NOW);
    // Tuesday (no data) should be 0
    expect(result.dataPoints[1]?.['Bench Press']).toBe(0);
  });

  it('works with monthly period', () => {
    const history: ExerciseHistory = {
      'Bench Press': [
        makeExerciseEntry({ date: '2025-03-01', estimated1RM: 100 }),
        makeExerciseEntry({ date: '2025-03-15', estimated1RM: 110 }),
      ],
    };

    const result = getPRTrends(history, 'month', 3, NOW);
    // Monthly has up to 5 weekly buckets
    expect(result.dataPoints.length).toBeGreaterThanOrEqual(2);
    expect(result.exercises).toContain('Bench Press');
  });
});

// ── getAvgRPETrend ───────────────────────────────────────────────────────────

describe('getAvgRPETrend', () => {
  it('returns empty RPE for empty history', () => {
    const result = getAvgRPETrend([], 'week', NOW);
    // Should still return 7 buckets (one per day) but with 0 avgRPE
    expect(result).toHaveLength(7);
    expect(result.every(r => r.avgRPE === 0)).toBe(true);
    expect(result.every(r => r.sessions === 0)).toBe(true);
  });

  it('calculates average RPE per bucket correctly', () => {
    const history: WorkoutLog[] = [
      makeWorkout({
        date: '2025-03-17',
        sets: [
          makeSet({ rpe: 7 as RPEValue }),
          makeSet({ rpe: 9 as RPEValue }),
        ],
      }),
    ];

    const result = getAvgRPETrend(history, 'week', NOW);
    // Monday bucket: (7 + 9) / 2 = 8.0
    expect(result[0]?.avgRPE).toBe(8);
    expect(result[0]?.sessions).toBe(1);
  });

  it('handles multiple workouts in same bucket', () => {
    const history: WorkoutLog[] = [
      makeWorkout({
        date: '2025-03-17',
        sets: [makeSet({ rpe: 8 as RPEValue })],
      }),
      makeWorkout({
        date: '2025-03-17',
        sets: [makeSet({ rpe: 10 as RPEValue })],
      }),
    ];

    const result = getAvgRPETrend(history, 'week', NOW);
    // Monday: (8 + 10) / 2 = 9.0
    expect(result[0]?.avgRPE).toBe(9);
    expect(result[0]?.sessions).toBe(2);
  });

  it('ignores workouts outside the period window', () => {
    const history: WorkoutLog[] = [
      makeWorkout({
        date: '2025-03-10', // Previous week
        sets: [makeSet({ rpe: 10 as RPEValue })],
      }),
      makeWorkout({
        date: '2025-03-17', // This week
        sets: [makeSet({ rpe: 7 as RPEValue })],
      }),
    ];

    const result = getAvgRPETrend(history, 'week', NOW);
    // Only Monday should have data (7.0)
    expect(result[0]?.avgRPE).toBe(7);
    // No previous-week data should leak
    const total = result.reduce((s, r) => s + r.sessions, 0);
    expect(total).toBe(1);
  });

  it('works with monthly period', () => {
    const history: WorkoutLog[] = [
      makeWorkout({
        date: '2025-03-01',
        sets: [makeSet({ rpe: 7 as RPEValue })],
      }),
      makeWorkout({
        date: '2025-03-15',
        sets: [makeSet({ rpe: 9 as RPEValue })],
      }),
    ];

    const result = getAvgRPETrend(history, 'month', NOW);
    // Monthly has multiple weekly buckets
    expect(result.length).toBeGreaterThanOrEqual(2);
    // At least 2 buckets should have data
    const withData = result.filter(r => r.sessions > 0);
    expect(withData.length).toBeGreaterThanOrEqual(2);
  });
});
