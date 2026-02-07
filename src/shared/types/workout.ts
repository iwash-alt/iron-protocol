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

export type PersonalRecords = Record<string, number>;
export type ExerciseHistory = Record<string, ExerciseHistoryEntry[]>;
export type CompletedSets = Record<string, number>;
