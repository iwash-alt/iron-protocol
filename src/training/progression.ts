export interface ProgressionExercise {
  weightKg: number;
  reps: number;
  sets: number;
  targetReps?: number;
}

export interface ProgressionResult {
  exerciseId: string;
  field: 'weightKg' | 'reps';
  oldValue: number;
  newValue: number;
  reason: string;
}

export function calculateProgression(
  rpe: number,
  exercise: ProgressionExercise,
  options: { incrementKg?: number } = {}
): ProgressionResult | null {
  const increment = options.incrementKg ?? 2.5;
  const targetReps = exercise.targetReps ?? 12;

  if (rpe <= 7 && exercise.reps < targetReps) {
    return {
      exerciseId: '',
      field: 'reps',
      oldValue: exercise.reps,
      newValue: exercise.reps + 1,
      reason: 'RPE indicates room for more reps',
    };
  }

  if (rpe <= 7 && exercise.reps >= targetReps) {
    return {
      exerciseId: '',
      field: 'weightKg',
      oldValue: exercise.weightKg,
      newValue: exercise.weightKg + increment,
      reason: 'Target reps reached, progressing weight',
    };
  }

  if (rpe === 10) {
    return {
      exerciseId: '',
      field: 'weightKg',
      oldValue: exercise.weightKg,
      newValue: Math.max(exercise.weightKg - increment, 0),
      reason: 'RPE 10 - reducing weight for safety',
    };
  }

  return null;
}
