import type {
  PlanExercise,
  WorkoutDay,
  Exercise,
  CustomWorkoutInput,
  CustomWorkoutDayInput,
  CustomWorkoutExerciseInput,
} from '@/shared/types';
import { isLowerBody } from '@/shared/types';
import { exercises, findExerciseByName } from '@/data/exercises';
import { workoutTemplates } from '@/data/templates';
import type { UserProfile } from '@/shared/types';

export interface PlanState {
  days: WorkoutDay[];
  exercises: PlanExercise[];
  dayIndex: number;
  programName?: string;
}

export type PlanAction =
  | { type: 'INITIALIZE'; profile: UserProfile; templateKey?: string }
  | { type: 'SET_DAY_INDEX'; index: number }
  | { type: 'UPDATE_EXERCISE'; id: string; patch: Partial<PlanExercise> }
  | { type: 'ADD_EXERCISE'; dayId: string; exercise: Exercise }
  | { type: 'REMOVE_EXERCISE'; id: string }
  | { type: 'SWAP_EXERCISE'; id: string; newExercise: Exercise }
  | { type: 'CREATE_CUSTOM_WORKOUT'; config: CustomWorkoutInput };

function getWeightMultiplier(level: string): number {
  switch (level) {
    case 'beginner': return 0.6;
    case 'intermediate': return 0.8;
    default: return 1;
  }
}

export function createInitialPlan(profile: UserProfile, templateKey?: string): PlanState {
  const mult = getWeightMultiplier(profile.level);
  const template = templateKey && workoutTemplates[templateKey]
    ? workoutTemplates[templateKey]
    : profile.days === 4
      ? workoutTemplates.upperLower
      : workoutTemplates.ppl;

  const days: WorkoutDay[] = template.days.map((d, i) => ({
    id: `d${i}`,
    name: d.name,
  }));

  const exercises: PlanExercise[] = [];
  template.days.forEach((day, di) => {
    day.exercises.forEach((name, ei) => {
      const ex = findExerciseByName(name);
      if (ex) {
        const lower = isLowerBody(ex.muscle);
        const isHeavy = name.includes('Squat') || name.includes('Deadlift');
        exercises.push({
          id: `d${di}-${ei}`,
          dayId: `d${di}`,
          exercise: ex,
          sets: 4,
          repsMin: lower ? 6 : 8,
          repsMax: lower ? 10 : 12,
          reps: lower ? 8 : 10,
          weightKg: Math.round((isHeavy ? 100 : 60) * mult),
          restSeconds: 90,
          progressionKg: 2.5,
        });
      }
    });
  });

  return { days, exercises, dayIndex: 0, programName: template.name };
}


function toPositiveInt(value: number, fallback: number): number {
  const normalized = Math.round(value);
  return Number.isFinite(normalized) && normalized > 0 ? normalized : fallback;
}

function createExerciseFromInput(dayId: string, exerciseIndex: number, input: CustomWorkoutExerciseInput): PlanExercise | null {
  const exercise = exercises.find(ex => ex.id === input.exerciseId) ?? findExerciseByName(input.exerciseId);
  if (!exercise) return null;

  const lower = isLowerBody(exercise.muscle);
  const reps = toPositiveInt(input.reps, lower ? 8 : 10);

  return {
    id: `${dayId}-ex${exerciseIndex}`,
    dayId,
    exercise,
    sets: toPositiveInt(input.sets, 3),
    reps,
    repsMin: reps,
    repsMax: reps,
    weightKg: Number.isFinite(input.weightKg) && input.weightKg >= 0 ? input.weightKg : 0,
    restSeconds: 90,
    progressionKg: 2.5,
  };
}

function createCustomWorkout(config: CustomWorkoutInput): PlanState {
  const normalizedDays = Math.max(1, Math.min(7, Math.round(config.days)));
  const dayNameBase = (config.name || 'Custom Workout').trim() || 'Custom Workout';
  const days: WorkoutDay[] = Array.from({ length: normalizedDays }, (_, i) => ({
    id: `custom-d${i}`,
    name: config.dayExercises?.[i]?.name?.trim() || (normalizedDays === 1 ? dayNameBase : `${dayNameBase} ${i + 1}`),
  }));

  const exercises: PlanExercise[] = (config.dayExercises ?? []).flatMap((dayDraft, dayIndex) => {
    const dayId = days[dayIndex]?.id;
    if (!dayId) return [];

    return dayDraft.exercises.map((draftExercise, exerciseIndex) => {
      const lower = isLowerBody(draftExercise.exercise.muscle);
      return {
        id: `${dayId}-${exerciseIndex}-${Date.now()}`,
        dayId,
        exercise: draftExercise.exercise,
        sets: Math.max(1, Math.round(draftExercise.sets)),
        repsMin: lower ? 6 : 8,
        repsMax: lower ? 10 : 12,
        reps: Math.max(1, Math.round(draftExercise.reps)),
        weightKg: Math.max(0, draftExercise.weightKg),
        restSeconds: 90,
        progressionKg: 2.5,
      } satisfies PlanExercise;
  const dayConfigs = config.dayConfigs ?? [];

  const days: WorkoutDay[] = Array.from({ length: normalizedDays }, (_, i) => {
    const cfg = dayConfigs[i];
    const fallbackName = normalizedDays === 1 ? dayNameBase : `${dayNameBase} ${i + 1}`;
    return {
      id: `custom-d${i}`,
      name: cfg?.name?.trim() || fallbackName,
    };
  });

  const exercises: PlanExercise[] = [];
  dayConfigs.slice(0, normalizedDays).forEach((dayConfig, dayIndex) => {
    dayConfig.exercises.forEach((exercise, exerciseIndex) => {
      exercises.push({
        id: `custom-d${dayIndex}-${exerciseIndex}-${Date.now()}`,
        dayId: `custom-d${dayIndex}`,
        exercise,
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        reps: 10,
        weightKg: 20,
        restSeconds: 90,
        progressionKg: 2.5,
      });
    });
  });

  return { days, exercises, dayIndex: 0 };
}

export function planReducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case 'INITIALIZE':
      return createInitialPlan(action.profile, action.templateKey);

    case 'SET_DAY_INDEX':
      return { ...state, dayIndex: action.index };

    case 'UPDATE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.map(pe =>
          pe.id === action.id ? { ...pe, ...action.patch } : pe
        ),
      };

    case 'ADD_EXERCISE': {
      const lower = isLowerBody(action.exercise.muscle);
      const newExercise: PlanExercise = {
        id: `${action.dayId}-${Date.now()}`,
        dayId: action.dayId,
        exercise: action.exercise,
        sets: 3,
        repsMin: lower ? 6 : 8,
        repsMax: lower ? 10 : 12,
        reps: lower ? 8 : 10,
        weightKg: 20,
        restSeconds: 90,
        progressionKg: 2.5,
      };
      return { ...state, exercises: [...state.exercises, newExercise] };
    }

    case 'REMOVE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.filter(pe => pe.id !== action.id),
      };

    case 'SWAP_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.map(pe =>
          pe.id === action.id ? { ...pe, exercise: action.newExercise } : pe
        ),
      };

    case 'CREATE_CUSTOM_WORKOUT':
      return createCustomWorkout(action.config);

    default:
      return state;
  }
}
