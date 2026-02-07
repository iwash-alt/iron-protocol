import type { BodyMeasurement, ExerciseHistory, NutritionHistory, PersonalRecords, WorkoutLog } from '@/shared/types';
import { calculate1RM, getTodayKey, getWeekNumber } from '@/shared/utils';

export interface DemoData {
  workoutHistory: WorkoutLog[];
  exerciseHistory: ExerciseHistory;
  personalRecords: PersonalRecords;
  bodyMeasurements: BodyMeasurement[];
  nutritionHistory: NutritionHistory;
  weekCount: number;
  lastWorkoutWeek: number | null;
}

const DEMO_MODE_KEY = 'ironDemoMode';
const DEMO_DATA_KEY = 'ironDemoData';

function lcg(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 48271) % 2147483647;
    return value / 2147483647;
  };
}

function randomBetween(rand: () => number, min: number, max: number): number {
  return Math.round((min + (max - min) * rand()) * 10) / 10;
}

function dateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function generateWorkoutHistory(): {
  workoutHistory: WorkoutLog[];
  exerciseHistory: ExerciseHistory;
  personalRecords: PersonalRecords;
} {
  const rand = lcg(202410);
  const today = new Date();
  const start = addDays(today, -182);
  const dayNames = ['Push', 'Pull', 'Legs', 'Upper'];
  const exerciseMap: Record<string, string[]> = {
    Push: ['Barbell Bench Press', 'Overhead Press', 'Incline Dumbbell Press'],
    Pull: ['Deadlift', 'Barbell Row', 'Lat Pulldown'],
    Legs: ['Squat', 'Romanian Deadlift', 'Leg Press'],
    Upper: ['Barbell Bench Press', 'Barbell Row', 'Overhead Press'],
  };

  const workoutHistory: WorkoutLog[] = [];
  const exerciseHistory: ExerciseHistory = {};
  const personalRecords: PersonalRecords = {};

  const totalDays = Math.floor((today.getTime() - start.getTime()) / 86400000);

  for (let i = 0; i <= totalDays; i += 1) {
    const current = addDays(start, i);
    const key = dateKey(current);
    const daysFromToday = Math.floor((today.getTime() - current.getTime()) / 86400000);
    const dayOfWeek = current.getDay();
    const isRecentStreak = daysFromToday <= 12;
    const isWorkoutDay = isRecentStreak || [1, 3, 5, 6].includes(dayOfWeek);

    if (!isWorkoutDay) continue;

    const weekIndex = Math.floor(i / 7);
    const dayName = dayNames[weekIndex % dayNames.length];
    const exercises = exerciseMap[dayName] || [];
    const sets = exercises.flatMap((name) => {
      const base = name.includes('Deadlift') ? 140 : name.includes('Squat') ? 120 : name.includes('Bench') ? 95 : 70;
      const progression = name.includes('Deadlift') || name.includes('Squat') ? 2.5 : 1.5;
      const weightKg = Math.round(base + weekIndex * progression + randomBetween(rand, -2, 4));
      const reps = name.includes('Deadlift') ? 5 : 8;
      return Array.from({ length: 3 }).map((_, setIndex) => {
        const rpe = (7 + Math.floor(rand() * 3)) as 7 | 8 | 9;
        const entry = {
          exerciseName: name,
          weightKg: Math.max(40, weightKg + setIndex * 2.5),
          reps,
          setNumber: setIndex + 1,
          rpe,
        };

        const estimated1RM = calculate1RM(entry.weightKg, entry.reps);
        if (!exerciseHistory[name]) exerciseHistory[name] = [];
        exerciseHistory[name].push({
          date: key,
          weightKg: entry.weightKg,
          reps: entry.reps,
          estimated1RM,
        });
        personalRecords[name] = Math.max(personalRecords[name] || 0, estimated1RM);
        return entry;
      });
    });

    const totalVolumeKg = sets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);
    const completionPercent = isRecentStreak ? 100 : Math.round(randomBetween(rand, 92, 100));

    workoutHistory.push({
      date: key,
      dayName,
      sets,
      totalVolumeKg,
      completionPercent,
    });
  }

  return { workoutHistory, exerciseHistory, personalRecords };
}

function generateBodyMeasurements(): BodyMeasurement[] {
  const rand = lcg(404);
  const today = new Date();
  const start = addDays(today, -182);
  const measurements: BodyMeasurement[] = [];
  const weeks = Math.floor((today.getTime() - start.getTime()) / 604800000);

  for (let i = 0; i <= weeks; i += 1) {
    const date = addDays(start, i * 7);
    const weight = 92 - i * 0.25 + randomBetween(rand, -0.2, 0.2);
    measurements.push({
      date: dateKey(date),
      weight: Math.round(weight * 10) / 10,
      bodyFat: `${Math.max(10, 16 - i * 0.2).toFixed(1)}%`,
      chest: `${100 + i * 0.2 + randomBetween(rand, -0.3, 0.3)}cm`,
      waist: `${84 - i * 0.15 + randomBetween(rand, -0.3, 0.3)}cm`,
      arms: `${36 + i * 0.1 + randomBetween(rand, -0.2, 0.2)}cm`,
      thighs: `${58 + i * 0.15 + randomBetween(rand, -0.2, 0.2)}cm`,
    });
  }

  return measurements;
}

function generateNutritionHistory(): NutritionHistory {
  const rand = lcg(777);
  const history: NutritionHistory = {};
  for (let i = 0; i < 30; i += 1) {
    const date = addDays(new Date(), -i);
    const key = dateKey(date);
    history[key] = {
      water: Math.floor(randomBetween(rand, 8, 13)),
      protein: Math.floor(randomBetween(rand, 140, 210)),
      proteinLog: [
        { name: 'Whey Shake', protein: 28, icon: '🥤', time: '08:15' },
        { name: 'Chicken Breast', protein: 45, icon: '🍗', time: '12:30' },
        { name: 'Greek Yogurt', protein: 20, icon: '🥣', time: '16:00' },
      ],
    };
  }
  return history;
}

export function generateDemoData(): DemoData {
  const { workoutHistory, exerciseHistory, personalRecords } = generateWorkoutHistory();
  const bodyMeasurements = generateBodyMeasurements();
  const nutritionHistory = generateNutritionHistory();
  const weekCount = 24;
  const lastWorkoutWeek = getWeekNumber();

  // ensure today's nutrition exists
  const today = getTodayKey();
  if (!nutritionHistory[today]) {
    nutritionHistory[today] = { water: 10, protein: 180, proteinLog: [] };
  }

  return {
    workoutHistory,
    exerciseHistory,
    personalRecords,
    bodyMeasurements,
    nutritionHistory,
    weekCount,
    lastWorkoutWeek,
  };
}

export function loadDemoMode(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
}

export function saveDemoMode(enabled: boolean): void {
  localStorage.setItem(DEMO_MODE_KEY, enabled ? 'true' : 'false');
}

export function loadDemoData(): DemoData | null {
  const raw = localStorage.getItem(DEMO_DATA_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoData;
  } catch {
    return null;
  }
}

export function saveDemoData(data: DemoData): void {
  localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(data));
}

export function ensureDemoData(): DemoData {
  const existing = loadDemoData();
  if (existing) return existing;
  const created = generateDemoData();
  saveDemoData(created);
  return created;
}
