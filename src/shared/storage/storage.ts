import type { z } from 'zod/v4';
import type { UserProfile } from '@/shared/types';
import type { WorkoutLog, ExerciseHistory, PersonalRecords, GlobalPRs } from '@/shared/types';
import type { BodyMeasurement } from '@/shared/types';
import type { NutritionHistory } from '@/shared/types';
import type { EntitlementStore } from '@/shared/types';
import type { PlanExercise, WorkoutDay } from '@/shared/types';
import type { CustomExercise } from '@/shared/types/exercise';
import type { QuickTemplateCustomizations } from '@/data/quick-templates';
import {
  userProfileSchema,
  workoutLogSchema,
  exerciseHistorySchema,
  personalRecordsSchema,
  globalPRsSchema,
  bodyMeasurementSchema,
  nutritionHistorySchema,
  entitlementStoreSchema,
  quickCustomizationsSchema,
} from './schemas';

const STORAGE_VERSION_KEY = 'ironStorageVersion';
const CURRENT_VERSION = 3;

export const StorageKeys = {
  PROFILE: 'ironProfile',
  PRS: 'ironPRs',
  GLOBAL_PRS: 'ironGlobalPRs',
  WORKOUT_HISTORY: 'ironWorkoutHistory',
  EXERCISE_HISTORY: 'ironExerciseHistory',
  BODY_MEASUREMENTS: 'ironBodyMeasurements',
  NUTRITION: 'ironNutrition',
  WEEK_COUNT: 'ironWeekCount',
  LAST_WORKOUT_WEEK: 'ironLastWorkoutWeek',
  ENTITLEMENTS: 'ironEntitlements',
  PROFILE_PHOTO: 'iron_profile_photo',
  PROGRESS_PHOTOS: 'iron_progress_photos',
  TRAINING_PLAN: 'iron_training_plan',
  QUICK_CUSTOMIZATIONS: 'ironQuickCustomizations',
  CUSTOM_EXERCISES: 'ironCustomExercises',
} as const;


interface TrainingPlanState {
  days: WorkoutDay[];
  exercises: PlanExercise[];
  dayIndex: number;
  programName?: string;
}

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
        migrated[name] = (entries as Record<string, unknown>[]).map(entry => ({
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
      const migrated = (data as Record<string, unknown>[]).map(entry => ({
        date: entry.date,
        dayName: entry.dayName,
        sets: (((entry.exercises ?? entry.sets) as Record<string, unknown>[]) ?? []).map((s: Record<string, unknown>) => ({
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

/**
 * Migrate v2 PRs (Record<string, number>) to v3 enhanced PR format.
 */
function migrateV2toV3(): void {
  const rawPRs = localStorage.getItem(StorageKeys.PRS);
  if (!rawPRs) return;
  try {
    const data = JSON.parse(rawPRs);
    // Check if it's the old format (values are plain numbers)
    const firstVal = Object.values(data)[0];
    if (typeof firstVal === 'number') {
      const migrated: Record<string, unknown> = {};
      for (const [name, value] of Object.entries(data)) {
        migrated[name] = {
          heaviestWeight: null,
          bestEstimated1RM: { value: value as number, weightKg: 0, reps: 0, date: '' },
          bestSetVolume: null,
          bestSessionVolume: null,
          mostRepsAtWeight: null,
        };
      }
      localStorage.setItem(StorageKeys.PRS, JSON.stringify(migrated));
    }
  } catch { /* keep existing data */ }
}

export function runMigrations(): void {
  const raw = localStorage.getItem(STORAGE_VERSION_KEY);
  const version = raw ? parseInt(raw, 10) : 1;

  if (version < 2) {
    migrateV1toV2();
  }
  if (version < 3) {
    migrateV2toV3();
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

const DEFAULT_GLOBAL_PRS: GlobalPRs = {
  highestSessionVolume: null,
  longestStreak: null,
  mostSetsInWorkout: null,
  highestAvgRPE: null,
};

export function loadGlobalPRs(): GlobalPRs {
  return safeLoad(StorageKeys.GLOBAL_PRS, globalPRsSchema) ?? DEFAULT_GLOBAL_PRS;
}

export function saveGlobalPRs(prs: GlobalPRs): void {
  safeSave(StorageKeys.GLOBAL_PRS, prs);
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

function normalizeTrainingPlanState(parsed: unknown): TrainingPlanState | null {
  if (!parsed || typeof parsed !== 'object') return null;

  const candidate = parsed as Partial<TrainingPlanState>;
  if (!Array.isArray(candidate.days) || !Array.isArray(candidate.exercises)) return null;

  const days = candidate.days
    .filter((day): day is WorkoutDay => Boolean(day) && typeof day.id === 'string' && typeof day.name === 'string')
    .map((day, index) => ({
      id: day.id.trim() || `legacy-d${index}`,
      name: day.name.trim() || `Day ${index + 1}`,
    }));

  if (days.length === 0) return null;

  const validDayIds = new Set(days.map(day => day.id));
  const exercises = candidate.exercises
    .filter((exercise): exercise is PlanExercise => Boolean(exercise) && typeof exercise.dayId === 'string')
    .filter(exercise => validDayIds.has(exercise.dayId));

  const safeDayIndex = typeof candidate.dayIndex === 'number'
    ? Math.min(Math.max(Math.round(candidate.dayIndex), 0), days.length - 1)
    : 0;

  const programName = typeof candidate.programName === 'string' ? candidate.programName : undefined;

  return {
    days,
    exercises,
    dayIndex: safeDayIndex,
    programName,
  };
}

export function loadTrainingPlan(): TrainingPlanState | null {
  const raw = localStorage.getItem(StorageKeys.TRAINING_PLAN);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return normalizeTrainingPlanState(parsed);
  } catch {
    return null;
  }
}

export function saveTrainingPlan(plan: TrainingPlanState): void {
  safeSave(StorageKeys.TRAINING_PLAN, plan);
}

export function loadEntitlementStore(): EntitlementStore | null {
  // Zod schema uses string[] for features (can't enumerate the union at runtime).
  // The resolver safely ignores unrecognized feature strings, so the cast is safe.
  return safeLoad(StorageKeys.ENTITLEMENTS, entitlementStoreSchema) as EntitlementStore | null;
}

export function saveEntitlementStore(store: EntitlementStore): void {
  safeSave(StorageKeys.ENTITLEMENTS, store);
}

// === Quick Workout Customizations ===

export function loadQuickCustomizations(): QuickTemplateCustomizations {
  return safeLoad(StorageKeys.QUICK_CUSTOMIZATIONS, quickCustomizationsSchema) ?? {};
}

export function saveQuickCustomizations(data: QuickTemplateCustomizations): void {
  safeSave(StorageKeys.QUICK_CUSTOMIZATIONS, data);
}

// === Profile Photo ===

export function loadProfilePhoto(): string | null {
  try {
    return localStorage.getItem(StorageKeys.PROFILE_PHOTO);
  } catch {
    return null;
  }
}

export function saveProfilePhoto(base64: string): void {
  try {
    localStorage.setItem(StorageKeys.PROFILE_PHOTO, base64);
  } catch (err) {
    console.error('Failed to save profile photo:', err);
  }
}

export function removeProfilePhoto(): void {
  localStorage.removeItem(StorageKeys.PROFILE_PHOTO);
}

// === Progress Photos ===

export interface ProgressPhoto {
  id: string;
  date: string;
  poseType: 'Front' | 'Side' | 'Back' | 'Custom';
  bodyWeight: number;
  data: string;
  thumbnail: string;
}

const MAX_PROGRESS_PHOTOS = 20;

export function loadProgressPhotos(): ProgressPhoto[] {
  try {
    const raw = localStorage.getItem(StorageKeys.PROGRESS_PHOTOS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveProgressPhotos(photos: ProgressPhoto[]): void {
  safeSave(StorageKeys.PROGRESS_PHOTOS, photos);
}

export function addProgressPhoto(photo: ProgressPhoto): { success: boolean; message?: string } {
  const photos = loadProgressPhotos();
  if (photos.length >= MAX_PROGRESS_PHOTOS) {
    return { success: false, message: `Photo limit reached (${MAX_PROGRESS_PHOTOS}/${MAX_PROGRESS_PHOTOS}). Delete some photos to add more.` };
  }
  photos.push(photo);
  try {
    saveProgressPhotos(photos);
    return { success: true };
  } catch {
    return { success: false, message: 'Storage full. Delete some photos to free space.' };
  }
}

export function deleteProgressPhoto(id: string): void {
  const photos = loadProgressPhotos().filter(p => p.id !== id);
  saveProgressPhotos(photos);
}

export function getProgressPhotosStorageInfo(): { count: number; maxCount: number; bytesUsed: number } {
  const raw = localStorage.getItem(StorageKeys.PROGRESS_PHOTOS) || '[]';
  return {
    count: loadProgressPhotos().length,
    maxCount: MAX_PROGRESS_PHOTOS,
    bytesUsed: new Blob([raw]).size,
  };
}

// === Custom Exercises ===

export function loadCustomExercises(): CustomExercise[] {
  try {
    const raw = localStorage.getItem(StorageKeys.CUSTOM_EXERCISES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e: unknown): e is CustomExercise => {
      if (!e || typeof e !== 'object') return false;
      const obj = e as Record<string, unknown>;
      return (
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.muscle === 'string' &&
        obj.isCustom === true
      );
    });
  } catch {
    return [];
  }
}

export function saveCustomExercises(exercises: CustomExercise[]): void {
  safeSave(StorageKeys.CUSTOM_EXERCISES, exercises);
}
