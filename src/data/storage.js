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

export function loadJSON(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadInt(key) {
  const value = localStorage.getItem(key);
  return value ? parseInt(value, 10) : null;
}

export function saveInt(key, value) {
  localStorage.setItem(key, value.toString());
}
