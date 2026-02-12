import { describe, it, expect } from 'vitest';
import { evaluateSuggestions } from './suggestions';
import type { SetLog, PlanExercise, RPEValue, ExerciseHistory } from '@/shared/types';
import type { FatigueResult } from './fatigue';

// ── Helpers ─────────────────────────────────────────────────────────────────

const DEFAULT_EXERCISE_NAME = 'Bench Press';

function makePlanExercise(overrides?: Partial<PlanExercise>): PlanExercise {
  return {
    id: 'ex-1',
    dayId: 'day-1',
    exercise: {
      id: 'bench-press',
      name: DEFAULT_EXERCISE_NAME,
      muscle: 'Chest',
      secondaryMuscles: ['Front Delts', 'Triceps'],
      equipment: 'Barbell',
      type: 'compound',
      isBodyweight: false,
      formCues: ['Retract scapulae', 'Lower to mid-chest'],
      commonMistakes: ['Flaring elbows'],
      secondaryMuscles: ['Front Delts', 'Triceps'],
      type: 'compound',
      formCues: [],
      commonMistakes: [],
    },
    sets: 4,
    reps: 8,
    repsMin: 6,
    repsMax: 10,
    weightKg: 80,
    restSeconds: 120,
    progressionKg: 2.5,
    ...overrides,
  };
}

function makeSet(setNumber: number, rpe: RPEValue, overrides?: Partial<SetLog>): SetLog {
  return {
    exerciseName: DEFAULT_EXERCISE_NAME,
    weightKg: 80,
    reps: 8,
    setNumber,
    rpe,
    ...overrides,
  };
}

function makeFatigue(score: number, overrides?: Partial<FatigueResult>): FatigueResult {
  return {
    score,
    trend: 'stable',
    factors: [],
    recommendation: 'Test recommendation',
    suggestedAction: 'normal',
    ...overrides,
  };
}

const NO_HISTORY: ExerciseHistory = {};
const NO_FATIGUE = null;

// ── Tests ───────────────────────────────────────────────────────────────────

describe('evaluateSuggestions', () => {
  describe('baseline — no suggestions', () => {
    it('returns nothing when sets are moderate (RPE 7-8)', () => {
      const sets = [makeSet(1, 7), makeSet(2, 8)];
      const exercise = makePlanExercise();

      const result = evaluateSuggestions(sets, exercise, 8, NO_HISTORY, NO_FATIGUE);

      expect(result).toEqual([]);
    });

    it('returns nothing with only 1 set completed (no reduce/increase)', () => {
      const sets = [makeSet(1, 9)];
      const exercise = makePlanExercise();

      const result = evaluateSuggestions(sets, exercise, 9, NO_HISTORY, NO_FATIGUE);

      expect(result).toEqual([]);
    });
  });

  describe('reduce_weight — RPE >= 9 on consecutive sets', () => {
    it('suggests reducing weight when last 2 sets are RPE 9', () => {
      const sets = [makeSet(1, 9), makeSet(2, 9)];
      const exercise = makePlanExercise();

      const result = evaluateSuggestions(sets, exercise, 9, NO_HISTORY, NO_FATIGUE);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('reduce_weight');
      expect(result[0].priority).toBe('warning');
      expect(result[0].exerciseName).toBe(DEFAULT_EXERCISE_NAME);
      expect(result[0].message).toContain('2.5kg');
    });

    it('suggests reducing weight when last 2 sets are RPE 10', () => {
      const sets = [makeSet(1, 10), makeSet(2, 10)];
      const exercise = makePlanExercise();

      const result = evaluateSuggestions(sets, exercise, 10, NO_HISTORY, NO_FATIGUE);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('reduce_weight');
    });

    it('fires when only the last 2 of 3 sets are high RPE', () => {
      const sets = [makeSet(1, 7), makeSet(2, 9), makeSet(3, 10)];
      const exercise = makePlanExercise();

      const result = evaluateSuggestions(sets, exercise, 10, NO_HISTORY, NO_FATIGUE);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('reduce_weight');
    });
  });

  describe('increase_weight — RPE <= 6 on consecutive sets', () => {
    it('suggests increasing weight when last 2 sets are RPE 6', () => {
      const sets = [makeSet(1, 6), makeSet(2, 6)];
      const exercise = makePlanExercise();

      const result = evaluateSuggestions(sets, exercise, 6, NO_HISTORY, NO_FATIGUE);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('increase_weight');
      expect(result[0].priority).toBe('info');
      expect(result[0].exerciseName).toBe(DEFAULT_EXERCISE_NAME);
      expect(result[0].message).toContain('2.5kg');
    });

    it('does not fire when one of the last 2 sets is above RPE 6', () => {
      const sets = [makeSet(1, 6), makeSet(2, 7)];
      const exercise = makePlanExercise();

      const result = evaluateSuggestions(sets, exercise, 7, NO_HISTORY, NO_FATIGUE);

      expect(result).toEqual([]);
    });
  });

  describe('recovery_warning — first set harder than last session', () => {
    it('warns when same weight but last session had 2+ more reps and current RPE is 9', () => {
      const sets = [makeSet(1, 9)];
      const exercise = makePlanExercise({ weightKg: 80 });
      const history: ExerciseHistory = {
        [DEFAULT_EXERCISE_NAME]: [
          { date: '2025-01-10', weightKg: 80, reps: 10, estimated1RM: 107 },
        ],
      };

      const result = evaluateSuggestions(sets, exercise, 9, history, NO_FATIGUE);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('recovery_warning');
      expect(result[0].priority).toBe('alert');
      expect(result[0].message).toContain('recovery');
    });

    it('does not warn when last session reps difference is less than 2', () => {
      const sets = [makeSet(1, 9)];
      const exercise = makePlanExercise({ weightKg: 80, reps: 8 });
      const history: ExerciseHistory = {
        [DEFAULT_EXERCISE_NAME]: [
          { date: '2025-01-10', weightKg: 80, reps: 9, estimated1RM: 100 },
        ],
      };

      const result = evaluateSuggestions(sets, exercise, 9, history, NO_FATIGUE);

      expect(result).toEqual([]);
    });

    it('does not fire on the second set', () => {
      const sets = [makeSet(1, 9), makeSet(2, 9)];
      const exercise = makePlanExercise({ weightKg: 80 });
      const history: ExerciseHistory = {
        [DEFAULT_EXERCISE_NAME]: [
          { date: '2025-01-10', weightKg: 80, reps: 12, estimated1RM: 113 },
        ],
      };

      // exerciseSets.length === 2, so recovery check (which needs === 1) won't fire
      // reduce_weight will fire instead
      const result = evaluateSuggestions(sets, exercise, 9, history, NO_FATIGUE);

      const types = result.map(s => s.type);
      expect(types).not.toContain('recovery_warning');
    });
  });

  describe('fatigue_warning — fatigue score thresholds', () => {
    it('warns when fatigue score > 60 on first set with warning priority', () => {
      const sets = [makeSet(1, 7)];
      const exercise = makePlanExercise();
      const fatigue = makeFatigue(65);

      const result = evaluateSuggestions(sets, exercise, 7, NO_HISTORY, fatigue);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('fatigue_warning');
      expect(result[0].priority).toBe('warning');
      expect(result[0].message).toContain('dropping your last set');
    });

    it('escalates to alert priority when fatigue score > 80', () => {
      const sets = [makeSet(1, 7)];
      const exercise = makePlanExercise();
      const fatigue = makeFatigue(85);

      const result = evaluateSuggestions(sets, exercise, 7, NO_HISTORY, fatigue);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('fatigue_warning');
      expect(result[0].priority).toBe('alert');
      expect(result[0].message).toContain('skipping remaining exercises');
    });

    it('does not warn when fatigue score is <= 60', () => {
      const sets = [makeSet(1, 7)];
      const exercise = makePlanExercise();
      const fatigue = makeFatigue(55);

      const result = evaluateSuggestions(sets, exercise, 7, NO_HISTORY, fatigue);

      expect(result).toEqual([]);
    });

    it('does not fire after the first set', () => {
      const sets = [makeSet(1, 7), makeSet(2, 7)];
      const exercise = makePlanExercise();
      const fatigue = makeFatigue(90);

      const result = evaluateSuggestions(sets, exercise, 7, NO_HISTORY, fatigue);

      expect(result).toEqual([]);
    });
  });

  describe('multiple suggestions', () => {
    it('fires recovery_warning and fatigue_warning simultaneously on first set', () => {
      const sets = [makeSet(1, 9)];
      const exercise = makePlanExercise({ weightKg: 80 });
      const history: ExerciseHistory = {
        [DEFAULT_EXERCISE_NAME]: [
          { date: '2025-01-10', weightKg: 80, reps: 12, estimated1RM: 113 },
        ],
      };
      const fatigue = makeFatigue(75);

      const result = evaluateSuggestions(sets, exercise, 9, history, fatigue);

      const types = result.map(s => s.type);
      expect(types).toContain('recovery_warning');
      expect(types).toContain('fatigue_warning');
      expect(result).toHaveLength(2);
    });
  });
});
