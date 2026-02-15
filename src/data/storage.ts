export const KEYS = {
  profile: 'ironProfile',
  prs: 'ironPRs',
  workoutHistory: 'ironWorkoutHistory',
  exerciseHistory: 'ironExerciseHistory',
  weekCount: 'ironWeekCount',
  lastWorkoutWeek: 'ironLastWorkoutWeek',
  bodyMeasurements: 'ironBodyMeasurements',
  nutrition: 'ironNutrition',
} as const;

const hasLocalStorage = typeof window !== 'undefined' && !!window.localStorage;

export function loadJSON<T>(key: string): T | null {
  try {
    if (!hasLocalStorage) return null;
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  if (hasLocalStorage) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function loadInt(key: string): number | null {
  if (!hasLocalStorage) return null;
  const value = window.localStorage.getItem(key);
  return value ? Number.parseInt(value, 10) : null;
}

export function saveInt(key: string, value: number): void {
  if (hasLocalStorage) {
    window.localStorage.setItem(key, value.toString());
  }
}
