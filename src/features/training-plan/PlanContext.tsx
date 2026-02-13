import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { PlanExercise, WorkoutDay, UserProfile, Exercise, CustomWorkoutInput } from '@/shared/types';
import { planReducer, createInitialPlan } from './plan.reducer';

interface PlanContextValue {
  days: WorkoutDay[];
  exercises: PlanExercise[];
  dayIndex: number;
  currentDay: WorkoutDay | undefined;
  dayExercises: PlanExercise[];
  initialize: (profile: UserProfile, templateKey?: string) => void;
  setDayIndex: (index: number) => void;
  updateExercise: (id: string, patch: Partial<PlanExercise>) => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (id: string) => void;
  swapExercise: (id: string, newExercise: Exercise) => void;
  createCustomWorkout: (config: CustomWorkoutInput) => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children, profile }: { children: ReactNode; profile: UserProfile }) {
  const [state, dispatch] = useReducer(planReducer, profile, (p) => createInitialPlan(p));

  const currentDay = state.days[state.dayIndex];
  const dayExercises = state.exercises.filter(pe => pe.dayId === currentDay?.id);

  const initialize = useCallback((profile: UserProfile, templateKey?: string) => {
    dispatch({ type: 'INITIALIZE', profile, templateKey });
  }, []);

  const setDayIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_DAY_INDEX', index });
  }, []);

  const updateExercise = useCallback((id: string, patch: Partial<PlanExercise>) => {
    dispatch({ type: 'UPDATE_EXERCISE', id, patch });
  }, []);

  const addExercise = useCallback((exercise: Exercise) => {
    if (!currentDay) return;
    dispatch({ type: 'ADD_EXERCISE', dayId: currentDay.id, exercise });
  }, [currentDay]);

  const removeExercise = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_EXERCISE', id });
  }, []);

  const swapExercise = useCallback((id: string, newExercise: Exercise) => {
    dispatch({ type: 'SWAP_EXERCISE', id, newExercise });
  }, []);

  const createCustomWorkout = useCallback((config: CustomWorkoutInput) => {
    dispatch({ type: 'CREATE_CUSTOM_WORKOUT', config });
  }, []);

  return (
    <PlanContext.Provider value={{
      days: state.days,
      exercises: state.exercises,
      dayIndex: state.dayIndex,
      currentDay,
      dayExercises,
      initialize,
      setDayIndex,
      updateExercise,
      addExercise,
      removeExercise,
      swapExercise,
      createCustomWorkout,
    }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
