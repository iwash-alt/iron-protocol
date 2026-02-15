import { useEffect, useMemo, useState } from 'react';
import { KEYS, loadInt, loadJSON, saveInt, saveJSON } from '../data/storage';
import { calculateStreak } from '../analytics/stats';
import { getTodayKey, getWeekNum } from '../training/engine';

type WorkoutLog = { date: string };
type ExerciseEntry = { date: string; weight: number; reps: number; e1rm: number };
type Measurement = { date: string } & Record<string, number | string>;

export function useTrainingHistory() {
  const [personalRecords, setPersonalRecords] = useState<Record<string, number>>({});
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<Record<string, ExerciseEntry[]>>({});
  const [weekCount, setWeekCount] = useState(0);
  const [lastWorkoutWeek, setLastWorkoutWeek] = useState<number | null>(null);
  const [bodyMeasurements, setBodyMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    const pr = loadJSON<Record<string, number>>(KEYS.prs); if (pr) setPersonalRecords(pr);
    const wh = loadJSON<WorkoutLog[]>(KEYS.workoutHistory); if (wh) setWorkoutHistory(wh);
    const eh = loadJSON<Record<string, ExerciseEntry[]>>(KEYS.exerciseHistory); if (eh) setExerciseHistory(eh);
    const wc = loadInt(KEYS.weekCount); if (wc) setWeekCount(wc);
    const lw = loadInt(KEYS.lastWorkoutWeek); if (lw) setLastWorkoutWeek(lw);
    const bm = loadJSON<Measurement[]>(KEYS.bodyMeasurements); if (bm) setBodyMeasurements(bm);
  }, []);

  useEffect(() => {
    if (Object.keys(personalRecords).length) saveJSON(KEYS.prs, personalRecords);
  }, [personalRecords]);

  useEffect(() => {
    if (workoutHistory.length) saveJSON(KEYS.workoutHistory, workoutHistory);
  }, [workoutHistory]);

  useEffect(() => {
    if (Object.keys(exerciseHistory).length) saveJSON(KEYS.exerciseHistory, exerciseHistory);
  }, [exerciseHistory]);

  useEffect(() => {
    if (bodyMeasurements.length) saveJSON(KEYS.bodyMeasurements, bodyMeasurements);
  }, [bodyMeasurements]);

  const streak = useMemo(() => calculateStreak(workoutHistory), [workoutHistory]);

  const checkAndUpdatePR = (exerciseName: string, e1rm: number) => {
    if (e1rm > (personalRecords[exerciseName] || 0)) {
      setPersonalRecords((p) => ({ ...p, [exerciseName]: e1rm }));
      return { name: exerciseName, weight: e1rm };
    }
    return null;
  };

  const addExerciseEntry = (exerciseName: string, entry: ExerciseEntry) => {
    setExerciseHistory((p) => ({
      ...p,
      [exerciseName]: [...(p[exerciseName] || []), entry],
    }));
  };

  const addWorkoutToHistory = (workout: WorkoutLog) => {
    setWorkoutHistory((p) => [...p, workout]);
  };

  const trackWeek = () => {
    const currentWeek = getWeekNum();
    if (currentWeek !== lastWorkoutWeek) {
      const newCount = weekCount + 1;
      setWeekCount(newCount);
      setLastWorkoutWeek(currentWeek);
      saveInt(KEYS.weekCount, newCount);
      saveInt(KEYS.lastWorkoutWeek, currentWeek);
      return newCount;
    }
    return weekCount;
  };

  const resetDeload = () => {
    setWeekCount(0);
    saveInt(KEYS.weekCount, 0);
  };

  const saveMeasurement = (data: Record<string, number | string>) => {
    setBodyMeasurements((p) => [...p, { ...data, date: getTodayKey() }]);
  };

  return {
    personalRecords,
    workoutHistory,
    exerciseHistory,
    weekCount,
    bodyMeasurements,
    streak,
    checkAndUpdatePR,
    addExerciseEntry,
    addWorkoutToHistory,
    trackWeek,
    resetDeload,
    saveMeasurement,
  };
}
