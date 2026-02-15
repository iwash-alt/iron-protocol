import { useCallback, useState } from 'react';
import { buildPlan, createExerciseEntry } from '../training/engine';

type Profile = {
  level: 'beginner' | 'intermediate' | 'advanced';
  days: number;
};

type Exercise = {
  id: string;
  name: string;
  muscle: string;
  bodyweight: boolean;
};

type PlanExercise = {
  id: string;
  dayId: string;
  exercise: Exercise;
  sets: number;
  repsMin: number;
  repsMax: number;
  reps: number;
  weight: number;
  rest: number;
  progression: number;
};

type Day = {
  id: string;
  name: string;
};

type WorkoutLogEntry = {
  exerciseName: string;
  weight: number;
  reps: number;
  setNum: number;
  rpe: number;
};

export function useWorkout(profile: Profile | null) {
  const [planExercises, setPlanExercises] = useState<PlanExercise[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [completed, setCompleted] = useState<Record<string, number>>({});
  const [currentWorkoutLog, setCurrentWorkoutLog] = useState<WorkoutLogEntry[]>([]);

  const currentDay = days[dayIdx];
  const dayExercises = planExercises.filter((p) => p.dayId === currentDay?.id);

  const progress = useCallback(() => {
    if (!dayExercises.length) return 0;
    let total = 0;
    let done = 0;
    dayExercises.forEach((p) => {
      total += p.sets;
      done += completed[p.id] || 0;
    });
    return Math.round((done / total) * 100);
  }, [dayExercises, completed]);

  const initializePlan = useCallback((p: Profile, templateKey: string | null = null) => {
    const { days: newDays, planExercises: newPlan } = buildPlan(p, templateKey);
    setDays(newDays);
    setPlanExercises(newPlan);
    setDayIdx(0);
    setCompleted({});
  }, []);

  const applyTemplate = useCallback((templateKey: string) => {
    if (profile) {
      initializePlan(profile, templateKey);
    }
  }, [profile, initializePlan]);

  const updateExercise = useCallback((id: string, fieldOrObj: string | Partial<PlanExercise>, value?: unknown) => {
    const patch = (fieldOrObj && typeof fieldOrObj === 'object') ? fieldOrObj : { [fieldOrObj]: value };
    setPlanExercises((p) => p.map((pe) => (pe.id === id ? { ...pe, ...patch } : pe)));
  }, []);

  const addExerciseToDay = useCallback((exercise: Exercise) => {
    if (!currentDay) return;
    const entry = createExerciseEntry(currentDay, exercise);
    setPlanExercises((p) => [...p, entry]);
  }, [currentDay]);

  const removeExercise = useCallback((id: string) => {
    setPlanExercises((p) => p.filter((pe) => pe.id !== id));
    setCompleted((p) => {
      const s = { ...p };
      delete s[id];
      return s;
    });
  }, []);

  const markSetComplete = useCallback((visId: string, setNum: number) => {
    setCompleted((c) => ({ ...c, [visId]: setNum }));
  }, []);

  const logSet = useCallback((exerciseName: string, weight: number, reps: number, setNum: number, rpe: number) => {
    setCurrentWorkoutLog((p) => [...p, { exerciseName, weight, reps, setNum, rpe }]);
  }, []);

  const switchDay = useCallback((newIdx: number) => {
    setDayIdx(newIdx);
    setCompleted({});
    setCurrentWorkoutLog([]);
  }, []);

  const resetWorkoutState = useCallback(() => {
    setCompleted({});
    setCurrentWorkoutLog([]);
  }, []);

  return {
    planExercises,
    days,
    dayIdx,
    completed,
    currentWorkoutLog,
    currentDay,
    dayExercises,
    progress,
    initializePlan,
    applyTemplate,
    updateExercise,
    addExerciseToDay,
    removeExercise,
    markSetComplete,
    logSet,
    switchDay,
    resetWorkoutState,
  };
}
