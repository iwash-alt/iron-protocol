import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  WorkoutLog, SetLog, PersonalRecords, ExerciseHistory,
  ExerciseHistoryEntry, RPEValue,
} from '@/shared/types';
import type { FatigueResult } from '@/training/fatigue';

// ── Mock fatigue module for deterministic results ────────────────────────────

const DEFAULT_FATIGUE: FatigueResult = {
  score: 25,
  trend: 'stable',
  factors: [],
  recommendation: "You're fresh. Train as programmed.",
  suggestedAction: 'normal',
};

vi.mock('@/training/fatigue', () => ({
  calculateFatigueScore: vi.fn(() => ({ ...DEFAULT_FATIGUE })),
}));

import { generateWeeklyInsights } from './insights';
import { calculateFatigueScore } from '@/training/fatigue';

// ── Constants ────────────────────────────────────────────────────────────────

// Wednesday March 19, 2025 → week starts Monday March 17, 2025
const NOW = new Date('2025-03-19');
const WEEK_START = '2025-03-17';

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

// ── Tests ────────────────────────────────────────────────────────────────────

describe('generateWeeklyInsights', () => {
  beforeEach(() => {
    vi.mocked(calculateFatigueScore).mockReturnValue({ ...DEFAULT_FATIGUE });
  });

  // 1. Returns null with empty history
  it('returns null with empty history', () => {
    const result = generateWeeklyInsights([], {}, {}, 4, NOW);
    expect(result).toBeNull();
  });

  // 2. Returns null with no workouts in current week
  it('returns null when all workouts are in previous weeks', () => {
    const history = [
      makeWorkout({ date: '2025-03-10' }),
      makeWorkout({ date: '2025-03-11' }),
    ];

    const result = generateWeeklyInsights(history, {}, {}, 4, NOW);
    expect(result).toBeNull();
  });

  // 3. Basic insight generation with 1 session this week
  it('generates a valid insight with one session this week', () => {
    const history = [makeWorkout({ date: '2025-03-17' })];

    const result = generateWeeklyInsights(history, {}, {}, 4, NOW);

    expect(result).not.toBeNull();
    expect(result!.weekOf).toBe(WEEK_START);
    expect(result!.sessionsCompleted).toBe(1);
    expect(result!.sessionsPlanned).toBe(4);
    expect(result!.volumeThisWeek).toBe(640);
    expect(result!.avgRPE).toBeGreaterThan(0);
  });

  // 4. Volume comparison — increase vs previous weeks
  it('calculates positive volume change vs 4-week rolling average', () => {
    const history = [
      makeWorkout({ date: '2025-03-03', totalVolumeKg: 500 }),
      makeWorkout({ date: '2025-03-10', totalVolumeKg: 500 }),
      makeWorkout({ date: '2025-03-17', totalVolumeKg: 1000 }),
    ];

    const result = generateWeeklyInsights(history, {}, {}, 4, NOW);

    expect(result).not.toBeNull();
    expect(result!.volumeThisWeek).toBe(1000);
    expect(result!.volumeAverage).toBe(500);
    expect(result!.volumeChangePct).toBe(100); // (1000 - 500) / 500 * 100
  });

  // 5. Volume change is 0 when no previous weeks exist
  it('reports zero volume change when no previous weeks exist', () => {
    const history = [makeWorkout({ date: '2025-03-17', totalVolumeKg: 800 })];

    const result = generateWeeklyInsights(history, {}, {}, 4, NOW);

    expect(result).not.toBeNull();
    expect(result!.volumeThisWeek).toBe(800);
    // When no previous weeks, volumeAverage equals volumeThisWeek
    expect(result!.volumeAverage).toBe(800);
    expect(result!.volumeChangePct).toBe(0);
  });

  // 6. RPE trend detection — harder
  it('detects harder RPE trend when this week RPE exceeds last week', () => {
    const history = [
      makeWorkout({ date: '2025-03-10', sets: [makeSet({ rpe: 7 as RPEValue })] }),
      makeWorkout({ date: '2025-03-17', sets: [makeSet({ rpe: 9 as RPEValue })] }),
    ];

    const result = generateWeeklyInsights(history, {}, {}, 4, NOW);

    expect(result).not.toBeNull();
    expect(result!.rpeTrend).toBe('harder');
    expect(result!.avgRPE).toBe(9);
  });

  // 7. RPE trend detection — easier
  it('detects easier RPE trend when this week RPE is lower than last week', () => {
    const history = [
      makeWorkout({ date: '2025-03-10', sets: [makeSet({ rpe: 9 as RPEValue })] }),
      makeWorkout({ date: '2025-03-17', sets: [makeSet({ rpe: 7 as RPEValue })] }),
    ];

    const result = generateWeeklyInsights(history, {}, {}, 4, NOW);

    expect(result).not.toBeNull();
    expect(result!.rpeTrend).toBe('easier');
    expect(result!.avgRPE).toBe(7);
  });

  // 8. Session consistency (completed vs planned)
  it('calculates session consistency percentage correctly', () => {
    const history = [
      makeWorkout({ date: '2025-03-17' }),
      makeWorkout({ date: '2025-03-18' }),
      makeWorkout({ date: '2025-03-19' }),
    ];

    const result = generateWeeklyInsights(history, {}, {}, 4, NOW);

    expect(result).not.toBeNull();
    expect(result!.sessionsCompleted).toBe(3);
    expect(result!.sessionsPlanned).toBe(4);
    expect(result!.consistencyPct).toBe(75); // 3/4 * 100
  });

  // 9. Muscle balance detection
  it('detects muscle balance status across exercise groups', () => {
    const sets: SetLog[] = [
      makeSet({ exerciseName: 'Bench Press', setNumber: 1 }),
      makeSet({ exerciseName: 'Bench Press', setNumber: 2 }),
      makeSet({ exerciseName: 'Bench Press', setNumber: 3 }),
      makeSet({ exerciseName: 'Bench Press', setNumber: 4 }),
      makeSet({ exerciseName: 'Squat', setNumber: 1 }),
    ];

    const history = [makeWorkout({ date: '2025-03-17', sets })];
    const result = generateWeeklyInsights(history, {}, {}, 4, NOW);

    expect(result).not.toBeNull();

    const chest = result!.muscleBalance.find(m => m.muscle === 'Chest');
    const quads = result!.muscleBalance.find(m => m.muscle === 'Quads');

    expect(chest).toBeDefined();
    expect(quads).toBeDefined();
    expect(chest!.sets).toBe(4);
    expect(quads!.sets).toBe(1);
    // 5 total sets / 2 groups = 2.5 expected per group
    // Chest: 4 > 2.5 * 1.5 (3.75) → overtrained
    // Quads: 1 < 2.5 * 0.5 (1.25) → undertrained
    expect(chest!.status).toBe('overtrained');
    expect(quads!.status).toBe('undertrained');
  });

  // 10. Top PR detection
  it('identifies the top PR from exercise history this week', () => {
    const history = [makeWorkout({ date: '2025-03-17' })];

    const personalRecords: PersonalRecords = {
      'Bench Press': 105,
      'Squat': 140,
    };
    const exerciseHistory: ExerciseHistory = {
      'Bench Press': [
        makeExerciseEntry({ date: '2025-03-17', estimated1RM: 105 }),
      ],
      'Squat': [
        makeExerciseEntry({ date: '2025-03-17', estimated1RM: 140 }),
      ],
    };

    const result = generateWeeklyInsights(history, personalRecords, exerciseHistory, 4, NOW);

    expect(result).not.toBeNull();
    expect(result!.topPR).not.toBeNull();
    // Squat 140 > Bench 105, so Squat should be the top PR
    expect(result!.topPR!.exercise).toBe('Squat');
    expect(result!.topPR!.weight).toBe(140);
  });

  // 11. Recommendation reflects high fatigue
  it('recommends deload when fatigue score is high', () => {
    vi.mocked(calculateFatigueScore).mockReturnValue({
      score: 80,
      trend: 'rising',
      factors: [],
      recommendation: 'High fatigue detected.',
      suggestedAction: 'deload',
    });

    const history = [makeWorkout({ date: '2025-03-17' })];
    const result = generateWeeklyInsights(history, {}, {}, 4, NOW);

    expect(result).not.toBeNull();
    expect(result!.recommendation).toContain('Fatigue is high');
    expect(result!.recommendation).toContain('deload');
    expect(result!.currentFatigue.score).toBe(80);
  });

  // 12. Fatigue data points — one per session
  it('produces one fatigue data point per session this week', () => {
    const history = [
      makeWorkout({ date: '2025-03-17' }),
      makeWorkout({ date: '2025-03-18' }),
      makeWorkout({ date: '2025-03-19' }),
    ];

    const result = generateWeeklyInsights(history, {}, {}, 4, NOW);

    expect(result).not.toBeNull();
    expect(result!.fatigueDataPoints).toHaveLength(3);
    // Each data point comes from the mocked fatigue score
    expect(result!.fatigueDataPoints).toEqual([25, 25, 25]);
  });
});
