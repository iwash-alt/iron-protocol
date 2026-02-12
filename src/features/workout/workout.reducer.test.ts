import { describe, it, expect } from 'vitest';
import { workoutReducer, initialWorkoutState } from './workout.reducer';
import type { WorkoutState, WorkoutAction } from './workout.reducer';
import type { SetLog, RPEValue } from '@/shared/types';

const makeLog = (overrides: Partial<SetLog> = {}): SetLog => ({
  exerciseName: 'Bench Press',
  weightKg: 80,
  reps: 8,
  setNumber: 1,
  rpe: 8,
  ...overrides,
});

describe('workoutReducer', () => {
  describe('COMPLETE_SET', () => {
    it('tracks completed set count for an exercise', () => {
      const action: WorkoutAction = {
        type: 'COMPLETE_SET',
        exerciseId: 'ex1',
        setNumber: 1,
        log: makeLog({ setNumber: 1 }),
      };

      const state = workoutReducer(initialWorkoutState, action);

      expect(state.completedSets['ex1']).toBe(1);
      expect(state.currentLog).toHaveLength(1);
    });

    it('increments set count on subsequent completions', () => {
      let state = workoutReducer(initialWorkoutState, {
        type: 'COMPLETE_SET',
        exerciseId: 'ex1',
        setNumber: 1,
        log: makeLog({ setNumber: 1 }),
      });

      state = workoutReducer(state, {
        type: 'COMPLETE_SET',
        exerciseId: 'ex1',
        setNumber: 2,
        log: makeLog({ setNumber: 2 }),
      });

      expect(state.completedSets['ex1']).toBe(2);
      expect(state.currentLog).toHaveLength(2);
    });

    it('tracks multiple exercises independently', () => {
      let state = workoutReducer(initialWorkoutState, {
        type: 'COMPLETE_SET',
        exerciseId: 'ex1',
        setNumber: 1,
        log: makeLog({ exerciseName: 'Bench Press', setNumber: 1 }),
      });

      state = workoutReducer(state, {
        type: 'COMPLETE_SET',
        exerciseId: 'ex2',
        setNumber: 1,
        log: makeLog({ exerciseName: 'Squat', setNumber: 1 }),
      });

      expect(state.completedSets['ex1']).toBe(1);
      expect(state.completedSets['ex2']).toBe(1);
      expect(state.currentLog).toHaveLength(2);
    });

    it('sets restTimerFor to the completed exercise', () => {
      const state = workoutReducer(initialWorkoutState, {
        type: 'COMPLETE_SET',
        exerciseId: 'ex1',
        setNumber: 1,
        log: makeLog(),
      });

      expect(state.restTimerFor).toBe('ex1');
    });

    it('accumulates set logs correctly', () => {
      let state = initialWorkoutState;

      for (let i = 1; i <= 4; i++) {
        state = workoutReducer(state, {
          type: 'COMPLETE_SET',
          exerciseId: 'ex1',
          setNumber: i,
          log: makeLog({ setNumber: i, rpe: (i + 6) as RPEValue }),
        });
      }

      expect(state.currentLog).toHaveLength(4);
      expect(state.currentLog[0].setNumber).toBe(1);
      expect(state.currentLog[3].setNumber).toBe(4);
      expect(state.completedSets['ex1']).toBe(4);
    });
  });

  describe('SET_REST_FOR', () => {
    it('sets the rest timer exercise ID', () => {
      const state = workoutReducer(initialWorkoutState, {
        type: 'SET_REST_FOR',
        exerciseId: 'ex1',
      });

      expect(state.restTimerFor).toBe('ex1');
    });

    it('clears the rest timer with null', () => {
      const stateWithTimer = workoutReducer(initialWorkoutState, {
        type: 'SET_REST_FOR',
        exerciseId: 'ex1',
      });

      const state = workoutReducer(stateWithTimer, {
        type: 'SET_REST_FOR',
        exerciseId: null,
      });

      expect(state.restTimerFor).toBeNull();
    });
  });

  describe('RESET', () => {
    it('resets state to initial values', () => {
      // Build up some state
      let state: WorkoutState = workoutReducer(initialWorkoutState, {
        type: 'COMPLETE_SET',
        exerciseId: 'ex1',
        setNumber: 1,
        log: makeLog(),
      });

      state = workoutReducer(state, {
        type: 'COMPLETE_SET',
        exerciseId: 'ex2',
        setNumber: 1,
        log: makeLog({ exerciseName: 'Squat' }),
      });

      // Now reset
      state = workoutReducer(state, { type: 'RESET' });

      expect(state.completedSets).toEqual({});
      expect(state.currentLog).toEqual([]);
      expect(state.restTimerFor).toBeNull();
    });
  });

  describe('unknown action', () => {
    it('returns current state for unrecognized actions', () => {
      const state = workoutReducer(initialWorkoutState, { type: 'UNKNOWN' } as unknown as WorkoutAction);
      expect(state).toBe(initialWorkoutState);
    });
  });
});
