import { useState, useCallback } from 'react';
import { buildPlan, createExerciseEntry } from '../training/engine';

export function useWorkout(profile) {
  const [planExercises, setPlanExercises] = useState([]);
  const [days, setDays] = useState([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [completed, setCompleted] = useState({});
  const [currentWorkoutLog, setCurrentWorkoutLog] = useState([]);

  const currentDay = days[dayIdx];
  const dayExercises = planExercises.filter(p => p.dayId === currentDay?.id);

  const progress = useCallback(() => {
    if (!dayExercises.length) return 0;
    let total = 0, done = 0;
    dayExercises.forEach(p => { total += p.sets; done += completed[p.id] || 0; });
    return Math.round((done / total) * 100);
  }, [dayExercises, completed]);

  const initializePlan = useCallback((p, templateKey = null) => {
    const { days: newDays, planExercises: newPlan } = buildPlan(p, templateKey);
    setDays(newDays);
    setPlanExercises(newPlan);
    setDayIdx(0);
    setCompleted({});
  }, []);

  const applyTemplate = useCallback((templateKey) => {
    if (profile) {
      initializePlan(profile, templateKey);
    }
  }, [profile, initializePlan]);

  const updateExercise = useCallback((id, fieldOrObj, value) => {
    const patch = (fieldOrObj && typeof fieldOrObj === 'object') ? fieldOrObj : { [fieldOrObj]: value };
    setPlanExercises(p => p.map(pe => pe.id === id ? { ...pe, ...patch } : pe));
  }, []);

  const addExerciseToDay = useCallback((exercise) => {
    if (!currentDay) return;
    const entry = createExerciseEntry(currentDay, exercise);
    setPlanExercises(p => [...p, entry]);
  }, [currentDay]);

  const removeExercise = useCallback((id) => {
    setPlanExercises(p => p.filter(pe => pe.id !== id));
    setCompleted(p => { const s = { ...p }; delete s[id]; return s; });
  }, []);

  const markSetComplete = useCallback((visId, setNum) => {
    setCompleted(c => ({ ...c, [visId]: setNum }));
  }, []);

  const logSet = useCallback((exerciseName, weight, reps, setNum, rpe) => {
    setCurrentWorkoutLog(p => [...p, { exerciseName, weight, reps, setNum, rpe }]);
  }, []);

  const switchDay = useCallback((newIdx) => {
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
