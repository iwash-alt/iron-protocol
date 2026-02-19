import type { WorkoutLog } from '@/shared/types';

/**
 * Compare each workout's volume against the most recent prior workout
 * with the same dayName. Higher volume = win, lower = loss.
 */
export function computeGhostRecord(history: WorkoutLog[]): { wins: number; losses: number } {
  let wins = 0;
  let losses = 0;

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history
      .slice(0, i)
      .reverse()
      .find((w) => w.dayName === current.dayName);

    if (previous) {
      if (current.totalVolumeKg > previous.totalVolumeKg) wins++;
      else if (current.totalVolumeKg < previous.totalVolumeKg) losses++;
    }
  }

  return { wins, losses };
}

/** Count unique workout dates that fall within the provided date window. */
export function countThisWeekSessions(history: WorkoutLog[], last7Days: string[]): number {
  const daySet = new Set(last7Days);
  const matchingDates = history.filter((w) => daySet.has(w.date)).map((w) => w.date);
  return new Set(matchingDates).size;
}

/** Estimate total workout duration in minutes from the exercise list. */
export function estimateWorkoutMinutes(exercises: ReadonlyArray<{ sets: number; restSeconds: number }>): number {
  if (exercises.length === 0) return 0;
  const total = exercises.reduce((sum, ex) => {
    const setMinutes = ex.sets * (1.5 + ex.restSeconds / 60);
    return sum + setMinutes;
  }, 0);
  return Math.round(total);
}
