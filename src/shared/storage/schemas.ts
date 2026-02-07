import { z } from 'zod/v4';

export const userProfileSchema = z.object({
  name: z.string().min(1),
  height: z.number().positive(),
  weight: z.number().positive(),
  age: z.number().int().positive(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  days: z.union([z.literal(3), z.literal(4)]),
  health: z.boolean(),
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
export const personalRecordsSchema = z.record(z.string(), z.number());
export const exerciseHistorySchema = z.record(z.string(), z.array(exerciseHistoryEntrySchema));
