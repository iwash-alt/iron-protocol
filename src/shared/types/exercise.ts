export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings',
  'Glutes', 'Calves', 'Biceps', 'Triceps', 'Core',
  'Lats', 'Rear Delts', 'Full Body', 'Cardio',
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export const EQUIPMENT_TYPES = [
  'Barbell', 'Dumbbells', 'Cable', 'Machine', 'Bar', 'None',
] as const;

export type Equipment = typeof EQUIPMENT_TYPES[number];

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  equipment: Equipment;
  youtubeId: string;
  isBodyweight: boolean;
}

export const LOWER_BODY_MUSCLES: readonly MuscleGroup[] = [
  'Quads', 'Hamstrings', 'Glutes', 'Calves',
];

export function isLowerBody(muscle: MuscleGroup): boolean {
  return (LOWER_BODY_MUSCLES as readonly string[]).includes(muscle);
}
