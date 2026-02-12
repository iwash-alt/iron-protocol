export const KEYS = {
  profile: 'ironProfile',
  prs: 'ironPRs',
  workoutHistory: 'ironWorkoutHistory',
  exerciseHistory: 'ironExerciseHistory',
  weekCount: 'ironWeekCount',
  lastWorkoutWeek: 'ironLastWorkoutWeek',
  bodyMeasurements: 'ironBodyMeasurements',
  nutrition: 'ironNutrition',
};

const hasLocalStorage = typeof window !== 'undefined' && window.localStorage;

export function loadJSON(key) {
  try {
    if (!hasLocalStorage) return null;
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveJSON(key, value) {
  if (hasLocalStorage)
    window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadInt(key) {
  if (!hasLocalStorage) return null;
  const value = window.localStorage.getItem(key);
  return value ? parseInt(value, 10) : null;
}

export function saveInt(key, value) {
  if (hasLocalStorage)
    window.localStorage.setItem(key, value.toString());
}
