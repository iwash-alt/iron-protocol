export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings',
  'Glutes', 'Calves', 'Biceps', 'Triceps', 'Core',
  'Lats', 'Rear Delts', 'Full Body', 'Cardio',
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export const EQUIPMENT_TYPES = [
  'Barbell', 'Dumbbells', 'Cable', 'Machine', 'Bar', 'None',
  'Smith Machine', 'EZ Bar', 'Kettlebell', 'Band',
] as const;

export type Equipment = typeof EQUIPMENT_TYPES[number];

export const EXERCISE_TYPES = ['compound', 'isolation', 'bodyweight', 'cardio'] as const;
export type ExerciseType = typeof EXERCISE_TYPES[number];

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  equipment: Equipment;
  youtubeId: string;
  isBodyweight: boolean;
  secondaryMuscles: string[];
  type: ExerciseType;
  formCues: string[];
  commonMistakes: string[];
}

export const LOWER_BODY_MUSCLES: readonly MuscleGroup[] = [
  'Quads', 'Hamstrings', 'Glutes', 'Calves',
];

export function isLowerBody(muscle: MuscleGroup): boolean {
  return (LOWER_BODY_MUSCLES as readonly string[]).includes(muscle);
}
