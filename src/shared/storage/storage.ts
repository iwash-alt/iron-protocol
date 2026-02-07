import type { z } from 'zod/v4';
import type { UserProfile } from '@/shared/types';
import type { WorkoutLog, ExerciseHistory, PersonalRecords } from '@/shared/types';
import type { BodyMeasurement } from '@/shared/types';
import type { NutritionHistory } from '@/shared/types';
import type { EntitlementStore } from '@/shared/types';
import {
  userProfileSchema,
  workoutLogSchema,
  exerciseHistorySchema,
  personalRecordsSchema,
  bodyMeasurementSchema,
  nutritionHistorySchema,
  entitlementStoreSchema,
} from './schemas';

const STORAGE_VERSION_KEY = 'ironStorageVersion';
const CURRENT_VERSION = 2;

export const StorageKeys = {
  PROFILE: 'ironProfile',
  PRS: 'ironPRs',
  WORKOUT_HISTORY: 'ironWorkoutHistory',
  EXERCISE_HISTORY: 'ironExerciseHistory',
  BODY_MEASUREMENTS: 'ironBodyMeasurements',
  NUTRITION: 'ironNutrition',
  WEEK_COUNT: 'ironWeekCount',
  LAST_WORKOUT_WEEK: 'ironLastWorkoutWeek',
  ENTITLEMENTS: 'ironEntitlements',
} as const;

/** Safe JSON parse with Zod validation. Returns null on any failure. */
function safeLoad<T>(key: string, schema: z.ZodType<T>): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (result.success) return result.data;
    console.warn(`Storage validation failed for ${key}:`, result.error);
    return null;
  } catch (err) {
    console.warn(`Storage read failed for ${key}:`, err);
    return null;
  }
}

function safeSave(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Storage write failed for ${key}:`, err);
  }
}

/**
 * Migrate v1 data (old field names) to v2 format.
 * v1 used: weight/reps/e1rm in exercise history
 * v2 uses: weightKg/reps/estimated1RM
 */
function migrateV1toV2(): void {
  // Exercise history: rename weight -> weightKg, e1rm -> estimated1RM
  const rawEH = localStorage.getItem(StorageKeys.EXERCISE_HISTORY);
  if (rawEH) {
    try {
      const data = JSON.parse(rawEH);
      const migrated: Record<string, unknown[]> = {};
      for (const [name, entries] of Object.entries(data)) {
        migrated[name] = (entries as any[]).map(entry => ({
          date: entry.date,
          weightKg: entry.weight ?? entry.weightKg,
          reps: entry.reps,
          estimated1RM: entry.e1rm ?? entry.estimated1RM,
        }));
      }
      localStorage.setItem(StorageKeys.EXERCISE_HISTORY, JSON.stringify(migrated));
    } catch { /* keep existing data */ }
  }

  // Workout history: rename volume -> totalVolumeKg, completedPct -> completionPercent, exercises -> sets
  const rawWH = localStorage.getItem(StorageKeys.WORKOUT_HISTORY);
  if (rawWH) {
    try {
      const data = JSON.parse(rawWH);
      const migrated = (data as any[]).map(entry => ({
        date: entry.date,
        dayName: entry.dayName,
        sets: (entry.exercises ?? entry.sets ?? []).map((s: any) => ({
          exerciseName: s.exerciseName,
          weightKg: s.weight ?? s.weightKg,
          reps: s.reps,
          setNumber: s.setNum ?? s.setNumber,
          rpe: s.rpe,
        })),
        totalVolumeKg: entry.volume ?? entry.totalVolumeKg,
        completionPercent: entry.completedPct ?? entry.completionPercent,
      }));
      localStorage.setItem(StorageKeys.WORKOUT_HISTORY, JSON.stringify(migrated));
    } catch { /* keep existing data */ }
  }
}

export function runMigrations(): void {
  const raw = localStorage.getItem(STORAGE_VERSION_KEY);
  const version = raw ? parseInt(raw, 10) : 1;

  if (version < 2) {
    migrateV1toV2();
  }

  localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION.toString());
}

// === Public API ===

export function loadProfile(): UserProfile | null {
  return safeLoad(StorageKeys.PROFILE, userProfileSchema);
}

export function saveProfile(profile: UserProfile): void {
  safeSave(StorageKeys.PROFILE, profile);
}

export function loadWorkoutHistory(): WorkoutLog[] {
  const raw = localStorage.getItem(StorageKeys.WORKOUT_HISTORY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry: unknown) => workoutLogSchema.safeParse(entry).success);
  } catch {
    return [];
  }
}

export function saveWorkoutHistory(history: WorkoutLog[]): void {
  safeSave(StorageKeys.WORKOUT_HISTORY, history);
}

export function loadExerciseHistory(): ExerciseHistory {
  return safeLoad(StorageKeys.EXERCISE_HISTORY, exerciseHistorySchema) ?? {};
}

export function saveExerciseHistory(history: ExerciseHistory): void {
  safeSave(StorageKeys.EXERCISE_HISTORY, history);
}

export function loadPersonalRecords(): PersonalRecords {
  return safeLoad(StorageKeys.PRS, personalRecordsSchema) ?? {};
}

export function savePersonalRecords(records: PersonalRecords): void {
  safeSave(StorageKeys.PRS, records);
}

export function loadBodyMeasurements(): BodyMeasurement[] {
  const raw = localStorage.getItem(StorageKeys.BODY_MEASUREMENTS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry: unknown) => bodyMeasurementSchema.safeParse(entry).success);
  } catch {
    return [];
  }
}

export function saveBodyMeasurements(measurements: BodyMeasurement[]): void {
  safeSave(StorageKeys.BODY_MEASUREMENTS, measurements);
}

export function loadNutritionHistory(): NutritionHistory {
  return safeLoad(StorageKeys.NUTRITION, nutritionHistorySchema) ?? {};
}

export function saveNutritionHistory(history: NutritionHistory): void {
  safeSave(StorageKeys.NUTRITION, history);
}

export function loadWeekCount(): number {
  const raw = localStorage.getItem(StorageKeys.WEEK_COUNT);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export function saveWeekCount(count: number): void {
  localStorage.setItem(StorageKeys.WEEK_COUNT, count.toString());
}

export function loadLastWorkoutWeek(): number | null {
  const raw = localStorage.getItem(StorageKeys.LAST_WORKOUT_WEEK);
  return raw ? parseInt(raw, 10) : null;
}

export function saveLastWorkoutWeek(week: number): void {
  localStorage.setItem(StorageKeys.LAST_WORKOUT_WEEK, week.toString());
}

export function loadEntitlementStore(): EntitlementStore | null {
  // Zod schema uses string[] for features (can't enumerate the union at runtime).
  // The resolver safely ignores unrecognized feature strings, so the cast is safe.
  return safeLoad(StorageKeys.ENTITLEMENTS, entitlementStoreSchema) as EntitlementStore | null;
}

export function saveEntitlementStore(store: EntitlementStore): void {
  safeSave(StorageKeys.ENTITLEMENTS, store);
}
