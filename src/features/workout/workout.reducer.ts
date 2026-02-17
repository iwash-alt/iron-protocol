import type { SetLog, CompletedSets } from '@/shared/types';
import type { ProgressionResult } from '@/training/progression';

export interface WorkoutState {
  completedSets: CompletedSets;
  currentLog: SetLog[];
  restTimerFor: string | null;
  progressions: Record<string, ProgressionResult | null>;
}

export type WorkoutAction =
  | { type: 'COMPLETE_SET'; exerciseId: string; setNumber: number; log: SetLog }
  | { type: 'SET_REST_FOR'; exerciseId: string | null }
  | { type: 'SET_PROGRESSION'; exerciseId: string; result: ProgressionResult | null }
  | { type: 'RESET' };

export const initialWorkoutState: WorkoutState = {
  completedSets: {},
  currentLog: [],
  restTimerFor: null,
  progressions: {},
};

export function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'COMPLETE_SET':
      return {
        ...state,
        completedSets: {
          ...state.completedSets,
          [action.exerciseId]: action.setNumber,
        },
        currentLog: [...state.currentLog, action.log],
        restTimerFor: action.exerciseId,
      };

    case 'SET_REST_FOR':
      return { ...state, restTimerFor: action.exerciseId };

    case 'SET_PROGRESSION':
      return {
        ...state,
        progressions: {
          ...state.progressions,
          [action.exerciseId]: action.result,
        },
      };

    case 'RESET':
      return initialWorkoutState;

    default:
      return state;
  }
}
