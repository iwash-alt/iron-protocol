import React, { createContext, useContext, useReducer, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { RPEValue, PlanExercise, WorkoutLog, ExerciseHistory, PersonalRecords } from '@/shared/types';
import { workoutReducer, initialWorkoutState } from './workout.reducer';
import { calculate1RM, getTodayKey, getWeekNumber } from '@/shared/utils';
import { usePlan } from '@/features/training-plan/PlanContext';
import {
  loadWorkoutHistory, saveWorkoutHistory,
  loadExerciseHistory, saveExerciseHistory,
  loadPersonalRecords, savePersonalRecords,
  loadWeekCount, saveWeekCount,
  loadLastWorkoutWeek, saveLastWorkoutWeek,
} from '@/shared/storage';

interface WorkoutContextValue {
  completedSets: Record<string, number>;
  restTimerFor: string | null;
  workoutHistory: WorkoutLog[];
  exerciseHistory: ExerciseHistory;
  personalRecords: PersonalRecords;
  weekCount: number;
  newPR: { name: string; weight: number } | null;
  showDeloadAlert: boolean;
  progress: () => number;
  completeSet: (pe: PlanExercise, rpe: RPEValue) => void;
  endWorkout: (force?: boolean) => void;
  resetWorkoutState: () => void;
  setRestTimerFor: (id: string | null) => void;
  dismissDeloadAlert: (reset: boolean) => void;
  dismissPR: () => void;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const plan = usePlan();
  const [state, dispatch] = useReducer(workoutReducer, initialWorkoutState);

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>(() => loadWorkoutHistory());
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory>(() => loadExerciseHistory());
  const [personalRecords, setPersonalRecords] = useState<PersonalRecords>(() => loadPersonalRecords());
  const [weekCount, setWeekCount] = useState(() => loadWeekCount());
  const [lastWorkoutWeek, setLastWorkoutWeek] = useState(() => loadLastWorkoutWeek());
  const [showDeloadAlert, setShowDeloadAlert] = useState(false);
  const [newPR, setNewPR] = useState<{ name: string; weight: number } | null>(null);

  const progress = useCallback(() => {
    const dayExercises = plan.dayExercises;
    if (!dayExercises.length) return 0;
    let total = 0, done = 0;
    dayExercises.forEach(pe => {
      total += pe.sets;
      done += state.completedSets[pe.id] || 0;
    });
    return Math.round((done / total) * 100);
  }, [plan.dayExercises, state.completedSets]);

  const completeSet = useCallback((pe: PlanExercise, rpe: RPEValue) => {
    const setNum = (state.completedSets[pe.id] || 0) + 1;

    dispatch({
      type: 'COMPLETE_SET',
      exerciseId: pe.id,
      setNumber: setNum,
      log: {
        exerciseName: pe.exercise.name,
        weightKg: pe.weightKg,
        reps: pe.reps,
        setNumber: setNum,
        rpe,
      },
    });

    // Track PR and exercise history for weighted exercises
    if (!pe.exercise.isBodyweight) {
      const e1rm = calculate1RM(pe.weightKg, pe.reps);
      const name = pe.exercise.name;

      if (e1rm > (personalRecords[name] || 0)) {
        const updated = { ...personalRecords, [name]: e1rm };
        setPersonalRecords(updated);
        savePersonalRecords(updated);
        setNewPR({ name, weight: e1rm });
        setTimeout(() => setNewPR(null), 3000);
      }

      setExerciseHistory(prev => {
        const updated = {
          ...prev,
          [name]: [...(prev[name] || []), {
            date: getTodayKey(),
            weightKg: pe.weightKg,
            reps: pe.reps,
            estimated1RM: e1rm,
          }],
        };
        saveExerciseHistory(updated);
        return updated;
      });
    }

    // Auto-regulation on last set
    if (setNum === pe.sets && !pe.exercise.isBodyweight) {
      if (rpe <= 8) {
        if (pe.reps < pe.repsMax) {
          plan.updateExercise(pe.id, { reps: pe.reps + 1 });
        } else {
          plan.updateExercise(pe.id, {
            weightKg: pe.weightKg + pe.progressionKg,
            reps: pe.repsMin,
          });
        }
      } else if (rpe === 10) {
        plan.updateExercise(pe.id, {
          weightKg: Math.max(0, pe.weightKg - pe.progressionKg),
          reps: pe.repsMin,
        });
      }
    }
  }, [state.completedSets, personalRecords, plan]);

  const endWorkout = useCallback((force = false) => {
    const pct = progress();

    // Reduce weight for incomplete exercises
    plan.dayExercises.forEach(pe => {
      const done = state.completedSets[pe.id] || 0;
      if (!pe.exercise.isBodyweight && done < pe.sets) {
        plan.updateExercise(pe.id, {
          weightKg: Math.max(0, pe.weightKg - pe.progressionKg),
          reps: pe.repsMin,
        });
      }
    });

    const vol = state.currentLog.reduce((a, l) => a + l.weightKg * l.reps, 0);
    const newLog: WorkoutLog = {
      date: getTodayKey(),
      dayName: plan.currentDay?.name || '',
      sets: state.currentLog,
      totalVolumeKg: vol,
      completionPercent: pct,
    };

    setWorkoutHistory(prev => {
      const updated = [...prev, newLog];
      saveWorkoutHistory(updated);
      return updated;
    });

    // Week tracking and deload
    const currentWeek = getWeekNumber();
    if (currentWeek !== lastWorkoutWeek) {
      const newWeekCount = weekCount + 1;
      setWeekCount(newWeekCount);
      setLastWorkoutWeek(currentWeek);
      saveWeekCount(newWeekCount);
      saveLastWorkoutWeek(currentWeek);
      if (newWeekCount > 0 && newWeekCount % 4 === 0) {
        setShowDeloadAlert(true);
      }
    }

    dispatch({ type: 'RESET' });
  }, [progress, plan, state, weekCount, lastWorkoutWeek]);

  const resetWorkoutState = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setRestTimerFor = useCallback((id: string | null) => {
    dispatch({ type: 'SET_REST_FOR', exerciseId: id });
  }, []);

  const dismissDeloadAlert = useCallback((reset: boolean) => {
    if (reset) {
      setWeekCount(0);
      saveWeekCount(0);
    }
    setShowDeloadAlert(false);
  }, []);

  const dismissPR = useCallback(() => setNewPR(null), []);

  return (
    <WorkoutContext.Provider value={{
      completedSets: state.completedSets,
      restTimerFor: state.restTimerFor,
      workoutHistory,
      exerciseHistory,
      personalRecords,
      weekCount,
      newPR,
      showDeloadAlert,
      progress,
      completeSet,
      endWorkout,
      resetWorkoutState,
      setRestTimerFor,
      dismissDeloadAlert,
      dismissPR,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout must be used within WorkoutProvider');
  return ctx;
}
