import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { RPEValue, PlanExercise, WorkoutLog, ExerciseHistory, PersonalRecords, GlobalPRs, ExercisePR, SetLog } from '@/shared/types';
import { workoutReducer, initialWorkoutState } from './workout.reducer';
import { calculate1RM, getTodayKey, getWeekNumber } from '@/shared/utils';
import { usePlan } from '@/features/training-plan/PlanContext';
import { useDemoMode } from '@/shared/demo/DemoModeContext';
import {
  loadWorkoutHistory, saveWorkoutHistory,
  loadExerciseHistory, saveExerciseHistory,
  loadPersonalRecords, savePersonalRecords,
  loadGlobalPRs, saveGlobalPRs,
  loadWeekCount, saveWeekCount,
  loadLastWorkoutWeek, saveLastWorkoutWeek,
} from '@/shared/storage';

/** Create a fresh empty ExercisePR */
function emptyExercisePR(): ExercisePR {
  return {
    heaviestWeight: null,
    bestEstimated1RM: null,
    bestSetVolume: null,
    bestSessionVolume: null,
    mostRepsAtWeight: null,
  };
}

interface WorkoutContextValue {
  completedSets: Record<string, number>;
  currentLog: SetLog[];
  restTimerFor: string | null;
  workoutHistory: WorkoutLog[];
  exerciseHistory: ExerciseHistory;
  personalRecords: PersonalRecords;
  globalPRs: GlobalPRs;
  weekCount: number;
  newPR: { name: string; category: string; value: string } | null;
  showDeloadAlert: boolean;
  progress: () => number;
  completeSet: (pe: PlanExercise, rpe: RPEValue) => void;
  endWorkout: (force?: boolean) => void;
  resetWorkoutState: () => void;
  setRestTimerFor: (id: string | null) => void;
  dismissDeloadAlert: (reset: boolean) => void;
  dismissPR: () => void;
}

const DEFAULT_GLOBAL_PRS: GlobalPRs = {
  highestSessionVolume: null,
  longestStreak: null,
  mostSetsInWorkout: null,
  highestAvgRPE: null,
};

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const plan = usePlan();
  const demo = useDemoMode();
  const [state, dispatch] = useReducer(workoutReducer, initialWorkoutState);

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>(() => (
    demo.enabled ? (demo.demoData?.workoutHistory ?? []) : loadWorkoutHistory()
  ));
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory>(() => (
    demo.enabled ? (demo.demoData?.exerciseHistory ?? {}) : loadExerciseHistory()
  ));
  const [personalRecords, setPersonalRecords] = useState<PersonalRecords>(() => (
    demo.enabled ? (demo.demoData?.personalRecords ?? {}) : loadPersonalRecords()
  ));
  const [globalPRs, setGlobalPRs] = useState<GlobalPRs>(() => (
    demo.enabled ? (demo.demoData?.globalPRs ?? DEFAULT_GLOBAL_PRS) : loadGlobalPRs()
  ));
  const [weekCount, setWeekCount] = useState(() => (
    demo.enabled ? (demo.demoData?.weekCount ?? 0) : loadWeekCount()
  ));
  const [lastWorkoutWeek, setLastWorkoutWeek] = useState(() => (
    demo.enabled ? (demo.demoData?.lastWorkoutWeek ?? null) : loadLastWorkoutWeek()
  ));
  const [showDeloadAlert, setShowDeloadAlert] = useState(false);
  const [newPR, setNewPR] = useState<{ name: string; category: string; value: string } | null>(null);

  useEffect(() => {
    if (demo.enabled) {
      const data = demo.demoData;
      setWorkoutHistory(data?.workoutHistory ?? []);
      setExerciseHistory(data?.exerciseHistory ?? {});
      setPersonalRecords(data?.personalRecords ?? {});
      setGlobalPRs(data?.globalPRs ?? DEFAULT_GLOBAL_PRS);
      setWeekCount(data?.weekCount ?? 0);
      setLastWorkoutWeek(data?.lastWorkoutWeek ?? null);
    } else {
      setWorkoutHistory(loadWorkoutHistory());
      setExerciseHistory(loadExerciseHistory());
      setPersonalRecords(loadPersonalRecords());
      setGlobalPRs(loadGlobalPRs());
      setWeekCount(loadWeekCount());
      setLastWorkoutWeek(loadLastWorkoutWeek());
    }
  }, [demo.enabled, demo.demoData]);

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

  const persistPRs = useCallback((updated: PersonalRecords) => {
    setPersonalRecords(updated);
    if (demo.enabled) {
      demo.updateDemoData(data => ({ ...data, personalRecords: updated }));
    } else {
      savePersonalRecords(updated);
    }
  }, [demo]);

  const persistGlobalPRs = useCallback((updated: GlobalPRs) => {
    setGlobalPRs(updated);
    if (demo.enabled) {
      demo.updateDemoData(data => ({ ...data, globalPRs: updated }));
    } else {
      saveGlobalPRs(updated);
    }
  }, [demo]);

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
      const today = getTodayKey();
      const setVolume = pe.weightKg * pe.reps;

      // Update enhanced PRs
      const current = personalRecords[name] ?? emptyExercisePR();
      let anyPR = false;
      const updated = { ...current };

      // Heaviest Weight
      if (!current.heaviestWeight || pe.weightKg > current.heaviestWeight.weightKg) {
        updated.heaviestWeight = { weightKg: pe.weightKg, reps: pe.reps, date: today };
        anyPR = true;
      }

      // Best Estimated 1RM
      if (!current.bestEstimated1RM || e1rm > current.bestEstimated1RM.value) {
        updated.bestEstimated1RM = { value: e1rm, weightKg: pe.weightKg, reps: pe.reps, date: today };
        anyPR = true;
      }

      // Best Set Volume
      if (!current.bestSetVolume || setVolume > current.bestSetVolume.value) {
        updated.bestSetVolume = { value: setVolume, weightKg: pe.weightKg, reps: pe.reps, date: today };
        anyPR = true;
      }

      // Most Reps at Weight (only update if more reps at same or heavier weight)
      if (!current.mostRepsAtWeight || pe.reps > current.mostRepsAtWeight.reps ||
          (pe.reps === current.mostRepsAtWeight.reps && pe.weightKg > current.mostRepsAtWeight.weightKg)) {
        updated.mostRepsAtWeight = { weightKg: pe.weightKg, reps: pe.reps, date: today };
        anyPR = true;
      }

      if (anyPR) {
        const allUpdated = { ...personalRecords, [name]: updated };
        persistPRs(allUpdated);

        // Show PR notification for the most impressive one
        if (!current.bestEstimated1RM || e1rm > current.bestEstimated1RM.value) {
          setNewPR({ name, category: 'Est 1RM', value: `${e1rm}kg` });
        } else if (!current.heaviestWeight || pe.weightKg > current.heaviestWeight.weightKg) {
          setNewPR({ name, category: 'Heavy', value: `${pe.weightKg}kg x ${pe.reps}` });
        } else if (!current.bestSetVolume || setVolume > current.bestSetVolume.value) {
          setNewPR({ name, category: 'Set Volume', value: `${setVolume}kg` });
        }
        setTimeout(() => setNewPR(null), 3000);
      }

      setExerciseHistory(prev => {
        const updated = {
          ...prev,
          [name]: [...(prev[name] || []), {
            date: today,
            weightKg: pe.weightKg,
            reps: pe.reps,
            estimated1RM: e1rm,
          }],
        };
        if (demo.enabled) {
          demo.updateDemoData(data => ({ ...data, exerciseHistory: updated }));
        } else {
          saveExerciseHistory(updated);
        }
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
  }, [state.completedSets, personalRecords, plan, demo, persistPRs]);

  const endWorkout = useCallback((_force = false) => {
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
    const today = getTodayKey();
    const dayName = plan.currentDay?.name || '';
    const newLog: WorkoutLog = {
      date: today,
      dayName,
      sets: state.currentLog,
      totalVolumeKg: vol,
      completionPercent: pct,
    };

    // Update session volume PRs per exercise
    const sessionVolByExercise: Record<string, number> = {};
    state.currentLog.forEach(s => {
      sessionVolByExercise[s.exerciseName] = (sessionVolByExercise[s.exerciseName] || 0) + s.weightKg * s.reps;
    });

    let prsChanged = false;
    const updatedPRs = { ...personalRecords };
    for (const [exName, sessionVol] of Object.entries(sessionVolByExercise)) {
      const current = updatedPRs[exName];
      if (current && (!current.bestSessionVolume || sessionVol > current.bestSessionVolume.value)) {
        updatedPRs[exName] = { ...current, bestSessionVolume: { value: sessionVol, date: today } };
        prsChanged = true;
      }
    }
    if (prsChanged) {
      persistPRs(updatedPRs);
    }

    // Update global PRs
    const updatedGlobal = { ...globalPRs };
    let globalChanged = false;

    // Highest session volume
    if (!updatedGlobal.highestSessionVolume || vol > updatedGlobal.highestSessionVolume.value) {
      updatedGlobal.highestSessionVolume = { value: vol, date: today, dayName };
      globalChanged = true;
    }

    // Most sets in workout
    const setCount = state.currentLog.length;
    if (!updatedGlobal.mostSetsInWorkout || setCount > updatedGlobal.mostSetsInWorkout.count) {
      updatedGlobal.mostSetsInWorkout = { count: setCount, date: today, dayName };
      globalChanged = true;
    }

    // Highest avg RPE
    if (state.currentLog.length > 0) {
      const avgRPE = Math.round(
        (state.currentLog.reduce((a, s) => a + s.rpe, 0) / state.currentLog.length) * 10
      ) / 10;
      if (!updatedGlobal.highestAvgRPE || avgRPE > updatedGlobal.highestAvgRPE.value) {
        updatedGlobal.highestAvgRPE = { value: avgRPE, date: today, dayName };
        globalChanged = true;
      }
    }

    if (globalChanged) {
      persistGlobalPRs(updatedGlobal);
    }

    setWorkoutHistory(prev => {
      const updated = [...prev, newLog];

      // Compute longest streak from all history
      const allDates = [...new Set(updated.map(w => w.date))].sort();
      let maxStreak = 1;
      let currentStreak = 1;
      let streakEnd = allDates[allDates.length - 1] || today;
      let bestEnd = streakEnd;
      for (let i = 1; i < allDates.length; i++) {
        const prev = new Date(allDates[i - 1]);
        const curr = new Date(allDates[i]);
        const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
        if (diffDays <= 2) { // Allow 1 rest day between workouts
          currentStreak++;
          streakEnd = allDates[i];
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
            bestEnd = streakEnd;
          }
        } else {
          currentStreak = 1;
          streakEnd = allDates[i];
        }
      }
      if (!updatedGlobal.longestStreak || maxStreak > updatedGlobal.longestStreak.days) {
        const finalGlobal = { ...updatedGlobal, longestStreak: { days: maxStreak, endDate: bestEnd } };
        persistGlobalPRs(finalGlobal);
      }

      if (demo.enabled) {
        demo.updateDemoData(data => ({ ...data, workoutHistory: updated, globalPRs: updatedGlobal }));
      } else {
        saveWorkoutHistory(updated);
      }
      return updated;
    });

    // Week tracking and deload
    const currentWeek = getWeekNumber();
    if (currentWeek !== lastWorkoutWeek) {
      const newWeekCount = weekCount + 1;
      setWeekCount(newWeekCount);
      setLastWorkoutWeek(currentWeek);
      if (demo.enabled) {
        demo.updateDemoData(data => ({ ...data, weekCount: newWeekCount, lastWorkoutWeek: currentWeek }));
      } else {
        saveWeekCount(newWeekCount);
        saveLastWorkoutWeek(currentWeek);
      }
      if (newWeekCount > 0 && newWeekCount % 4 === 0) {
        setShowDeloadAlert(true);
      }
    }

    dispatch({ type: 'RESET' });
  }, [progress, plan, state, weekCount, lastWorkoutWeek, demo, personalRecords, globalPRs, persistPRs, persistGlobalPRs]);

  const resetWorkoutState = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setRestTimerFor = useCallback((id: string | null) => {
    dispatch({ type: 'SET_REST_FOR', exerciseId: id });
  }, []);

  const dismissDeloadAlert = useCallback((reset: boolean) => {
    if (reset) {
      setWeekCount(0);
      if (demo.enabled) {
        demo.updateDemoData(data => ({ ...data, weekCount: 0 }));
      } else {
        saveWeekCount(0);
      }
    }
    setShowDeloadAlert(false);
  }, [demo]);

  const dismissPR = useCallback(() => setNewPR(null), []);

  return (
    <WorkoutContext.Provider value={{
      completedSets: state.completedSets,
      currentLog: state.currentLog,
      restTimerFor: state.restTimerFor,
      workoutHistory,
      exerciseHistory,
      personalRecords,
      globalPRs,
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
