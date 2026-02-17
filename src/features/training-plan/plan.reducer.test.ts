import { describe, it, expect } from 'vitest';
import { planReducer, createInitialPlan, reorderDayExercises } from './plan.reducer';
import type { PlanState } from './plan.reducer';
import type { UserProfile, Exercise } from '@/shared/types';

const baseProfile: UserProfile = {
  name: 'Test User',
  height: 175,
  weight: 80,
  age: 28,
  level: 'intermediate',
  days: 3,
  health: true,
};

describe('createInitialPlan', () => {
  it('creates PPL split for 3-day intermediate', () => {
    const plan = createInitialPlan(baseProfile);

    expect(plan.days).toHaveLength(3);
    expect(plan.days.map(d => d.name)).toContain('Push');
    expect(plan.days.map(d => d.name)).toContain('Pull');
    expect(plan.days.map(d => d.name)).toContain('Legs');
    expect(plan.dayIndex).toBe(0);
    expect(plan.exercises.length).toBeGreaterThan(0);
  });

  it('creates Upper/Lower split for 4-day', () => {
    const plan = createInitialPlan({ ...baseProfile, days: 4 });

    expect(plan.days).toHaveLength(4);
  });

  it('applies beginner weight multiplier (0.6x)', () => {
    const beginner = createInitialPlan({ ...baseProfile, level: 'beginner' });
    const intermediate = createInitialPlan({ ...baseProfile, level: 'intermediate' });

    // Beginner weights should be lower than intermediate
    const beginnerWeights = beginner.exercises.map(e => e.weightKg);
    const intermediateWeights = intermediate.exercises.map(e => e.weightKg);

    // Every beginner weight should be <= intermediate weight for same exercise
    for (let i = 0; i < beginnerWeights.length; i++) {
      expect(beginnerWeights[i]).toBeLessThanOrEqual(intermediateWeights[i]);
    }
  });

  it('applies advanced weight multiplier (1.0x)', () => {
    const advanced = createInitialPlan({ ...baseProfile, level: 'advanced' });
    const intermediate = createInitialPlan({ ...baseProfile, level: 'intermediate' });

    const advancedWeights = advanced.exercises.map(e => e.weightKg);
    const intermediateWeights = intermediate.exercises.map(e => e.weightKg);

    for (let i = 0; i < advancedWeights.length; i++) {
      expect(advancedWeights[i]).toBeGreaterThanOrEqual(intermediateWeights[i]);
    }
  });

  it('sets correct rep ranges for lower vs upper body', () => {
    const plan = createInitialPlan(baseProfile);

    plan.exercises.forEach(pe => {
      // Lower body: 6-10 rep range
      // Upper body: 8-12 rep range
      expect(pe.repsMin).toBeGreaterThanOrEqual(6);
      expect(pe.repsMax).toBeLessThanOrEqual(12);
      expect(pe.reps).toBeGreaterThanOrEqual(pe.repsMin);
      expect(pe.reps).toBeLessThanOrEqual(pe.repsMax);
    });
  });

  it('assigns unique IDs to all exercises', () => {
    const plan = createInitialPlan(baseProfile);
    const ids = plan.exercises.map(e => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all exercises have standard progression of 2.5kg', () => {
    const plan = createInitialPlan(baseProfile);
    plan.exercises.forEach(pe => {
      expect(pe.progressionKg).toBe(2.5);
    });
  });

  it('all exercises have 90s rest', () => {
    const plan = createInitialPlan(baseProfile);
    plan.exercises.forEach(pe => {
      expect(pe.restSeconds).toBe(90);
    });
  });
});

describe('planReducer', () => {
  let initialState: PlanState;

  beforeEach(() => {
    initialState = createInitialPlan(baseProfile);
  });

  describe('INITIALIZE', () => {
    it('creates a fresh plan from profile', () => {
      const state = planReducer(initialState, {
        type: 'INITIALIZE',
        profile: baseProfile,
      });

      expect(state.days.length).toBeGreaterThan(0);
      expect(state.exercises.length).toBeGreaterThan(0);
      expect(state.dayIndex).toBe(0);
    });

    it('accepts a template key override', () => {
      const state = planReducer(initialState, {
        type: 'INITIALIZE',
        profile: baseProfile,
        templateKey: 'fullBody',
      });

      expect(state.days.length).toBeGreaterThan(0);
    });
  });

  describe('SET_DAY_INDEX', () => {
    it('changes the active day', () => {
      const state = planReducer(initialState, {
        type: 'SET_DAY_INDEX',
        index: 2,
      });

      expect(state.dayIndex).toBe(2);
    });
  });

  describe('UPDATE_EXERCISE', () => {
    it('patches exercise weight', () => {
      const exerciseId = initialState.exercises[0].id;
      const state = planReducer(initialState, {
        type: 'UPDATE_EXERCISE',
        id: exerciseId,
        patch: { weightKg: 100 },
      });

      const updated = state.exercises.find(e => e.id === exerciseId);
      expect(updated?.weightKg).toBe(100);
    });

    it('patches exercise reps', () => {
      const exerciseId = initialState.exercises[0].id;
      const state = planReducer(initialState, {
        type: 'UPDATE_EXERCISE',
        id: exerciseId,
        patch: { reps: 12 },
      });

      const updated = state.exercises.find(e => e.id === exerciseId);
      expect(updated?.reps).toBe(12);
    });

    it('does not affect other exercises', () => {
      const first = initialState.exercises[0];
      const second = initialState.exercises[1];

      const state = planReducer(initialState, {
        type: 'UPDATE_EXERCISE',
        id: first.id,
        patch: { weightKg: 999 },
      });

      const secondAfter = state.exercises.find(e => e.id === second.id);
      expect(secondAfter?.weightKg).toBe(second.weightKg);
    });
  });

  describe('ADD_EXERCISE', () => {
    it('adds a new exercise to the plan', () => {
      const countBefore = initialState.exercises.length;
      const newExercise: Exercise = {
        id: 'new-ex',
        name: 'Bicep Curl',
        muscle: 'Biceps',
        secondaryMuscles: ['Brachialis', 'Forearms'],
        equipment: 'Dumbbell',
        type: 'isolation',
        isBodyweight: false,
        formCues: ['Pin elbows to sides', 'Squeeze at the top'],
        commonMistakes: ['Swinging torso'],
      };

      const state = planReducer(initialState, {
        type: 'ADD_EXERCISE',
        dayId: initialState.days[0].id,
        exercise: newExercise,
      });

      expect(state.exercises).toHaveLength(countBefore + 1);

      const added = state.exercises[state.exercises.length - 1];
      expect(added.exercise.name).toBe('Bicep Curl');
      expect(added.dayId).toBe(initialState.days[0].id);
      expect(added.sets).toBe(3);
    });
  });

  describe('REMOVE_EXERCISE', () => {
    it('removes the specified exercise', () => {
      const countBefore = initialState.exercises.length;
      const toRemove = initialState.exercises[0].id;

      const state = planReducer(initialState, {
        type: 'REMOVE_EXERCISE',
        id: toRemove,
      });

      expect(state.exercises).toHaveLength(countBefore - 1);
      expect(state.exercises.find(e => e.id === toRemove)).toBeUndefined();
    });
  });


  describe('REORDER_DAY_EXERCISES', () => {
    it('persists reordered exercises for the active day', () => {
      const dayId = initialState.days[0].id;
      const dayExercises = initialState.exercises.filter(e => e.dayId === dayId);

      const state = planReducer(initialState, {
        type: 'REORDER_DAY_EXERCISES',
        dayId,
        fromIndex: 0,
        toIndex: 1,
      });

      const reorderedDay = state.exercises.filter(e => e.dayId === dayId);
      expect(reorderedDay[0].id).toBe(dayExercises[1].id);
      expect(reorderedDay[1].id).toBe(dayExercises[0].id);

  describe('CREATE_CUSTOM_WORKOUT', () => {
    it('builds a plan from provided program/day/exercise payload', () => {
      const state = planReducer(initialState, {
        type: 'CREATE_CUSTOM_WORKOUT',
        config: {
          programName: 'Strength Builder',
          days: [
            {
              id: 'alpha',
              name: 'Heavy Push',
              exercises: [
                { exerciseId: '1', sets: 5, reps: 5, weightKg: 100 },
              ],
            },
          ],
        },
      });

      expect(state.programName).toBe('Strength Builder');
      expect(state.days).toEqual([{ id: 'alpha', name: 'Heavy Push' }]);
      expect(state.exercises).toHaveLength(1);
      expect(state.exercises[0].exercise.id).toBe('1');
      expect(state.exercises[0].sets).toBe(5);
      expect(state.exercises[0].reps).toBe(5);
      expect(state.exercises[0].weightKg).toBe(100);
    });

    it('falls back to Day N names when provided names are blank', () => {
      const state = planReducer(initialState, {
        type: 'CREATE_CUSTOM_WORKOUT',
        config: {
          programName: 'Custom',
          days: [
            { id: 'one', name: '   ', exercises: [] },
            { id: 'two', name: '', exercises: [] },
          ],
        },
      });

      expect(state.days.map(day => day.name)).toEqual(['Day 1', 'Day 2']);
    });
  });

  describe('SWAP_EXERCISE', () => {
    it('replaces the exercise object while keeping plan settings', () => {
      const target = initialState.exercises[0];
      const newExercise: Exercise = {
        id: 'swap-ex',
        name: 'Incline Press',
        muscle: 'Chest',
        secondaryMuscles: ['Front Delts', 'Triceps'],
        equipment: 'Barbell',
        type: 'compound',
        isBodyweight: false,
        formCues: ['Retract scapulae', 'Lower to upper chest'],
        commonMistakes: ['Flaring elbows'],
      };

      const state = planReducer(initialState, {
        type: 'SWAP_EXERCISE',
        id: target.id,
        newExercise,
      });

      const swapped = state.exercises.find(e => e.id === target.id);
      expect(swapped?.exercise.name).toBe('Incline Press');
      // Keep original plan settings
      expect(swapped?.sets).toBe(target.sets);
      expect(swapped?.weightKg).toBe(target.weightKg);
    });
  });
});


describe('reorderDayExercises', () => {
  it('moves a day exercise up and preserves other days', () => {
    const state = createInitialPlan(baseProfile);
    const dayId = state.days[0].id;
    const firstDayExercises = state.exercises.filter(e => e.dayId === dayId);
    const originalSecond = firstDayExercises[1];

    const reordered = reorderDayExercises(state.exercises, dayId, 1, 0);
    const updatedDayExercises = reordered.filter(e => e.dayId === dayId);

    expect(updatedDayExercises[0].id).toBe(originalSecond.id);

    const otherDayId = state.days[1].id;
    const otherBefore = state.exercises.filter(e => e.dayId === otherDayId).map(e => e.id);
    const otherAfter = reordered.filter(e => e.dayId === otherDayId).map(e => e.id);
    expect(otherAfter).toEqual(otherBefore);
  });

  it('returns original array when indexes are out of bounds', () => {
    const state = createInitialPlan(baseProfile);
    const dayId = state.days[0].id;

    const reordered = reorderDayExercises(state.exercises, dayId, -1, 0);

    expect(reordered).toBe(state.exercises);
  });
});
