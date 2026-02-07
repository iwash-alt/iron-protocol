import { useState, useEffect, useMemo } from 'react';
import { KEYS, loadJSON, saveJSON, loadInt, saveInt } from '../data/storage';
import { getTodayKey, getWeekNum } from '../training/engine';
import { calculateStreak } from '../analytics/stats';

export function useTrainingHistory() {
  const [personalRecords, setPersonalRecords] = useState({});
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [exerciseHistory, setExerciseHistory] = useState({});
  const [weekCount, setWeekCount] = useState(0);
  const [lastWorkoutWeek, setLastWorkoutWeek] = useState(null);
  const [bodyMeasurements, setBodyMeasurements] = useState([]);

  useEffect(() => {
    const pr = loadJSON(KEYS.prs); if (pr) setPersonalRecords(pr);
    const wh = loadJSON(KEYS.workoutHistory); if (wh) setWorkoutHistory(wh);
    const eh = loadJSON(KEYS.exerciseHistory); if (eh) setExerciseHistory(eh);
    const wc = loadInt(KEYS.weekCount); if (wc) setWeekCount(wc);
    const lw = loadInt(KEYS.lastWorkoutWeek); if (lw) setLastWorkoutWeek(lw);
    const bm = loadJSON(KEYS.bodyMeasurements); if (bm) setBodyMeasurements(bm);
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

  const checkAndUpdatePR = (exerciseName, e1rm) => {
    if (e1rm > (personalRecords[exerciseName] || 0)) {
      setPersonalRecords(p => ({ ...p, [exerciseName]: e1rm }));
      return { name: exerciseName, weight: e1rm };
    }
    return null;
  };

  const addExerciseEntry = (exerciseName, entry) => {
    setExerciseHistory(p => ({
      ...p,
      [exerciseName]: [...(p[exerciseName] || []), entry],
    }));
  };

  const addWorkoutToHistory = (workout) => {
    setWorkoutHistory(p => [...p, workout]);
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

  const saveMeasurement = (data) => {
    setBodyMeasurements(p => [...p, { ...data, date: getTodayKey() }]);
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
