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

export interface ProgressionBanner {
  icon: string;
  label: string;
  subtext: string;
  tone: 'success' | 'warning' | 'neutral';
}

export function formatProgressionBanner(
  result: ProgressionResult | null,
  currentWeightKg: number,
): ProgressionBanner {
  if (!result) {
    return {
      icon: '\u2192',
      label: 'Next session: same weight',
      subtext: 'Good effort \u2014 maintain current load',
      tone: 'neutral',
    };
  }

  if (result.field === 'weightKg') {
    const diff = result.newValue - result.oldValue;
    if (diff > 0) {
      return {
        icon: '\u2191',
        label: `Next session: ${result.newValue}kg (+${diff}kg)`,
        subtext: result.reason,
        tone: 'success',
      };
    }
    return {
      icon: '\u2193',
      label: `Next session: ${result.newValue}kg (${diff}kg)`,
      subtext: result.reason,
      tone: 'warning',
    };
  }

  const repDiff = result.newValue - result.oldValue;
  return {
    icon: '\u2191',
    label: `Next session: ${currentWeightKg}kg \u00d7 ${result.newValue} reps (+${repDiff} rep${repDiff !== 1 ? 's' : ''})`,
    subtext: result.reason,
    tone: 'success',
  };
}
