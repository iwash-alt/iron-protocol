import type { BodyMeasurement, ExerciseHistory, NutritionHistory, PersonalRecords, GlobalPRs, ExercisePR, WorkoutLog } from '@/shared/types';
import { calculate1RM, getWeekNumber } from '@/shared/utils';

export interface DemoData {
  workoutHistory: WorkoutLog[];
  exerciseHistory: ExerciseHistory;
  personalRecords: PersonalRecords;
  globalPRs: GlobalPRs;
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

function emptyExercisePR(): ExercisePR {
  return {
    heaviestWeight: null,
    bestEstimated1RM: null,
    bestSetVolume: null,
    bestSessionVolume: null,
    mostRepsAtWeight: null,
  };
}

function generateWorkoutHistory(): {
  workoutHistory: WorkoutLog[];
  exerciseHistory: ExerciseHistory;
  personalRecords: PersonalRecords;
  globalPRs: GlobalPRs;
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
  const globalPRs: GlobalPRs = {
    highestSessionVolume: null,
    longestStreak: null,
    mostSetsInWorkout: null,
    highestAvgRPE: null,
  };

  // Track session volumes per exercise per date
  const sessionVolumes: Record<string, Record<string, number>> = {};

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
        const setVol = entry.weightKg * entry.reps;

        if (!exerciseHistory[name]) exerciseHistory[name] = [];
        exerciseHistory[name].push({
          date: key,
          weightKg: entry.weightKg,
          reps: entry.reps,
          estimated1RM,
        });

        // Track session volumes
        if (!sessionVolumes[name]) sessionVolumes[name] = {};
        sessionVolumes[name][key] = (sessionVolumes[name][key] || 0) + setVol;

        // Update enhanced PRs
        if (!personalRecords[name]) personalRecords[name] = emptyExercisePR();
        const pr = personalRecords[name];

        if (!pr.heaviestWeight || entry.weightKg > pr.heaviestWeight.weightKg) {
          pr.heaviestWeight = { weightKg: entry.weightKg, reps: entry.reps, date: key };
        }
        if (!pr.bestEstimated1RM || estimated1RM > pr.bestEstimated1RM.value) {
          pr.bestEstimated1RM = { value: estimated1RM, weightKg: entry.weightKg, reps: entry.reps, date: key };
        }
        if (!pr.bestSetVolume || setVol > pr.bestSetVolume.value) {
          pr.bestSetVolume = { value: setVol, weightKg: entry.weightKg, reps: entry.reps, date: key };
        }
        if (!pr.mostRepsAtWeight || entry.reps > pr.mostRepsAtWeight.reps) {
          pr.mostRepsAtWeight = { weightKg: entry.weightKg, reps: entry.reps, date: key };
        }

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

    // Update global PRs
    if (!globalPRs.highestSessionVolume || totalVolumeKg > globalPRs.highestSessionVolume.value) {
      globalPRs.highestSessionVolume = { value: totalVolumeKg, date: key, dayName };
    }
    if (!globalPRs.mostSetsInWorkout || sets.length > globalPRs.mostSetsInWorkout.count) {
      globalPRs.mostSetsInWorkout = { count: sets.length, date: key, dayName };
    }
    const avgRPE = Math.round((sets.reduce((a, s) => a + s.rpe, 0) / sets.length) * 10) / 10;
    if (!globalPRs.highestAvgRPE || avgRPE > globalPRs.highestAvgRPE.value) {
      globalPRs.highestAvgRPE = { value: avgRPE, date: key, dayName };
    }
  }

  // Update best session volumes per exercise
  for (const [exName, dateVols] of Object.entries(sessionVolumes)) {
    const pr = personalRecords[exName];
    if (!pr) continue;
    for (const [date, vol] of Object.entries(dateVols)) {
      if (!pr.bestSessionVolume || vol > pr.bestSessionVolume.value) {
        pr.bestSessionVolume = { value: vol, date };
      }
    }
  }

  // Compute longest streak
  const allDates = [...new Set(workoutHistory.map(w => w.date))].sort();
  let maxStreak = 1;
  let currentStreak = 1;
  let bestEnd = allDates[0] || '';
  for (let i = 1; i < allDates.length; i++) {
    const prev = new Date(allDates[i - 1]);
    const curr = new Date(allDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff <= 2) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        bestEnd = allDates[i];
      }
    } else {
      currentStreak = 1;
    }
  }
  globalPRs.longestStreak = { days: maxStreak, endDate: bestEnd };

  return { workoutHistory, exerciseHistory, personalRecords, globalPRs };
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

export function generateDemoData(): DemoData {
  const { workoutHistory, exerciseHistory, personalRecords, globalPRs } = generateWorkoutHistory();
  const bodyMeasurements = generateBodyMeasurements();
  const weekCount = 24;
  const lastWorkoutWeek = getWeekNumber();

  return {
    workoutHistory,
    exerciseHistory,
    personalRecords,
    globalPRs,
    bodyMeasurements,
    nutritionHistory: {},
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
  if (
    existing
    && Array.isArray(existing.workoutHistory)
    && existing.workoutHistory.length > 0
    && existing.exerciseHistory
    && existing.personalRecords
    && existing.globalPRs
    && Array.isArray(existing.bodyMeasurements)
    && existing.nutritionHistory
  ) {
    return existing;
  }

  const created = generateDemoData();
  saveDemoData(created);
  return created;
}
