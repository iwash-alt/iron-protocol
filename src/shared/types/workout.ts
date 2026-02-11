import type { Exercise } from './exercise';

export type RPEValue = 6 | 7 | 8 | 9 | 10;

export interface PlanExercise {
  id: string;
  dayId: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  repsMin: number;
  repsMax: number;
  weightKg: number;
  restSeconds: number;
  progressionKg: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
}

export interface SetLog {
  exerciseName: string;
  weightKg: number;
  reps: number;
  setNumber: number;
  rpe: RPEValue;
}

export interface WorkoutLog {
  date: string;
  dayName: string;
  sets: SetLog[];
  totalVolumeKg: number;
  completionPercent: number;
}

export interface ExerciseHistoryEntry {
  date: string;
  weightKg: number;
  reps: number;
  estimated1RM: number;
}

/** Legacy PR format: exerciseName -> estimated1RM */
export type PersonalRecordsLegacy = Record<string, number>;

/** Enhanced PR entry for a single exercise */
export interface ExercisePR {
  /** Heaviest weight lifted (and the reps it was done at) */
  heaviestWeight: { weightKg: number; reps: number; date: string } | null;
  /** Best estimated 1RM via Epley */
  bestEstimated1RM: { value: number; weightKg: number; reps: number; date: string } | null;
  /** Best single-set volume (weight x reps) */
  bestSetVolume: { value: number; weightKg: number; reps: number; date: string } | null;
  /** Best total session volume for this exercise */
  bestSessionVolume: { value: number; date: string } | null;
  /** Most reps at a given weight */
  mostRepsAtWeight: { weightKg: number; reps: number; date: string } | null;
}

/** Global PRs across all exercises */
export interface GlobalPRs {
  /** Highest total session volume (all exercises combined) */
  highestSessionVolume: { value: number; date: string; dayName: string } | null;
  /** Longest consecutive training streak (days) */
  longestStreak: { days: number; endDate: string } | null;
  /** Most sets completed in a single workout */
  mostSetsInWorkout: { count: number; date: string; dayName: string } | null;
  /** Highest average RPE survived */
  highestAvgRPE: { value: number; date: string; dayName: string } | null;
}

/** Enhanced PR structure: exerciseName -> ExercisePR */
export type PersonalRecords = Record<string, ExercisePR>;

export type ExerciseHistory = Record<string, ExerciseHistoryEntry[]>;
export type CompletedSets = Record<string, number>;
