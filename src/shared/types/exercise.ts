export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings',
  'Glutes', 'Calves', 'Biceps', 'Triceps', 'Core',
  'Lats', 'Rear Delts', 'Full Body', 'Cardio',
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export type ExerciseType = 'compound' | 'accessory' | 'bodyweight';

export const EQUIPMENT_TYPES = [
  'Barbell', 'Dumbbell', 'Smith Machine', 'Cable',
  'Machine (plate-loaded)', 'Machine (pin/stack)',
  'Bodyweight', 'Resistance Band', 'Kettlebell', 'EZ Bar',
  'Barbell', 'Dumbbells', 'Cable', 'Machine', 'Bar', 'None',
  'Smith Machine', 'EZ Bar', 'Kettlebell', 'Band',
] as const;

export type Equipment = typeof EQUIPMENT_TYPES[number];

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  secondaryMuscles: string[];
  equipment: Equipment;
  type: ExerciseType;
  isBodyweight: boolean;
  formCues: string[];
  commonMistakes: string[];
  youtubeId?: string;
}

export const LOWER_BODY_MUSCLES: readonly MuscleGroup[] = [
  'Quads', 'Hamstrings', 'Glutes', 'Calves',
];

export function isLowerBody(muscle: MuscleGroup): boolean {
  return (LOWER_BODY_MUSCLES as readonly string[]).includes(muscle);
}
