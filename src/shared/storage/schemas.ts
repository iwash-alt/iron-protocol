import { z } from 'zod/v4';

export const userProfileSchema = z.object({
  name: z.string().min(1),
  height: z.number().positive(),
  weight: z.number().positive(),
  age: z.number().int().positive(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  days: z.union([z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
});

export const exerciseHistoryEntrySchema = z.object({
  date: z.string(),
  weightKg: z.number().min(0),
  reps: z.number().int().positive(),
  estimated1RM: z.number().min(0),
});

const setLogSchema = z.object({
  exerciseName: z.string(),
  weightKg: z.number().min(0),
  reps: z.number().int().positive(),
  setNumber: z.number().int().positive(),
  rpe: z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9), z.literal(10)]),
});

export const workoutLogSchema = z.object({
  date: z.string(),
  dayName: z.string(),
  sets: z.array(setLogSchema),
  totalVolumeKg: z.number().min(0),
  completionPercent: z.number().min(0).max(100),
});

export const bodyMeasurementSchema = z.object({
  date: z.string(),
  weight: z.number().positive(),
  bodyFat: z.string(),
  chest: z.string(),
  waist: z.string(),
  arms: z.string(),
  thighs: z.string(),
});

const dailyNutritionSchema = z.object({
  water: z.number().int().min(0),
  protein: z.number().min(0),
  proteinLog: z.array(z.object({
    name: z.string(),
    protein: z.number(),
    icon: z.string(),
    time: z.string(),
  })),
});

export const nutritionHistorySchema = z.record(z.string(), dailyNutritionSchema);
/** Legacy PR schema: exerciseName -> number (estimated 1RM) */
export const personalRecordsLegacySchema = z.record(z.string(), z.number());

const exercisePRSchema = z.object({
  heaviestWeight: z.union([z.object({ weightKg: z.number(), reps: z.number(), date: z.string() }), z.null()]),
  bestEstimated1RM: z.union([z.object({ value: z.number(), weightKg: z.number(), reps: z.number(), date: z.string() }), z.null()]),
  bestSetVolume: z.union([z.object({ value: z.number(), weightKg: z.number(), reps: z.number(), date: z.string() }), z.null()]),
  bestSessionVolume: z.union([z.object({ value: z.number(), date: z.string() }), z.null()]),
  mostRepsAtWeight: z.union([z.object({ weightKg: z.number(), reps: z.number(), date: z.string() }), z.null()]),
});

export const personalRecordsSchema = z.record(z.string(), exercisePRSchema);

export const globalPRsSchema = z.object({
  highestSessionVolume: z.union([z.object({ value: z.number(), date: z.string(), dayName: z.string() }), z.null()]),
  longestStreak: z.union([z.object({ days: z.number(), endDate: z.string() }), z.null()]),
  mostSetsInWorkout: z.union([z.object({ count: z.number(), date: z.string(), dayName: z.string() }), z.null()]),
  highestAvgRPE: z.union([z.object({ value: z.number(), date: z.string(), dayName: z.string() }), z.null()]),
});

export const exerciseHistorySchema = z.record(z.string(), z.array(exerciseHistoryEntrySchema));

// ── Entitlement schemas ─────────────────────────────────────

const subscriptionStateSchema = z.object({
  planId: z.enum(['free', 'pro', 'elite']),
  billing: z.union([z.enum(['monthly', 'yearly']), z.null()]),
  startedAt: z.string(),
  expiresAt: z.union([z.string(), z.null()]),
  cancelledAt: z.union([z.string(), z.null()]),
});

const trialStateSchema = z.object({
  id: z.string(),
  features: z.array(z.string()),
  startedAt: z.string(),
  expiresAt: z.string(),
  source: z.enum(['onboarding', 'upgrade_prompt', 'retention', 'manual']),
});

const promoUnlockSchema = z.object({
  id: z.string(),
  code: z.string(),
  features: z.array(z.string()),
  grantedAt: z.string(),
  expiresAt: z.union([z.string(), z.null()]),
  source: z.enum(['referral', 'event', 'achievement', 'manual']),
});

export const entitlementStoreSchema = z.object({
  subscription: subscriptionStateSchema,
  trials: z.array(trialStateSchema),
  promos: z.array(promoUnlockSchema),
});

// ── Quick workout customization schemas ─────────────────────

const quickExerciseConfigSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().positive(),
  reps: z.union([z.number().int().positive(), z.null()]),
  durationSeconds: z.union([z.number().positive(), z.null()]),
});

const quickTemplateCustomizationSchema = z.object({
  templateId: z.string().min(1),
  exercises: z.array(quickExerciseConfigSchema).min(1),
  lastModified: z.string(),
});

export const quickCustomizationsSchema = z.record(
  z.string(),
  quickTemplateCustomizationSchema,
);

// ── Chart / dashboard graph schemas ─────────────────────────

/** Weekly volume trend data point. */
export const volumePointSchema = z.object({
  date: z.string(),
  volume: z.number().min(0),
  sessionCount: z.number().int().min(0),
});

/** Histogram bucket for a single RPE value. */
export const rpeDistributionSchema = z.object({
  rpe: z.number().min(1).max(10),
  count: z.number().int().min(0),
});

/** Per-muscle-group volume breakdown entry. */
export const muscleGroupVolumeSchema = z.object({
  group: z.string().min(1),
  sets: z.number().int().min(0),
  percentage: z.number().min(0).max(100),
});

/** Single exercise PR timeline point. */
export const progressionPointSchema = z.object({
  date: z.string(),
  weight: z.number().min(0),
  exercise: z.string().min(1),
});
