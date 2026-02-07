import type { SetLog, CompletedSets, RPEValue } from '@/shared/types';

export interface WorkoutState {
  completedSets: CompletedSets;
  currentLog: SetLog[];
  restTimerFor: string | null;
}

export type WorkoutAction =
  | { type: 'COMPLETE_SET'; exerciseId: string; setNumber: number; log: SetLog }
  | { type: 'SET_REST_FOR'; exerciseId: string | null }
  | { type: 'RESET' };

export const initialWorkoutState: WorkoutState = {
  completedSets: {},
  currentLog: [],
  restTimerFor: null,
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

    case 'RESET':
      return initialWorkoutState;

    default:
      return state;
  }
}
