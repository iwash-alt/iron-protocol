export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings',
  'Glutes', 'Calves', 'Biceps', 'Triceps', 'Core',
  'Lats', 'Rear Delts', 'Full Body', 'Cardio',
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export const EQUIPMENT_TYPES = [
  'Barbell', 'Dumbbell', 'Smith Machine', 'Cable',
  'Machine (plate-loaded)', 'Machine (pin/stack)',
  'Bodyweight', 'Resistance Band', 'Kettlebell', 'EZ Bar',
  'Dumbbells', 'Machine', 'Bar', 'None', 'Band',
] as const;

export type Equipment = typeof EQUIPMENT_TYPES[number];

export const EXERCISE_TYPES = ['compound', 'isolation', 'accessory', 'bodyweight', 'cardio'] as const;
export type ExerciseType = typeof EXERCISE_TYPES[number];

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
  primaryMuscles?: string[];
  tips?: string[];
}

export const LOWER_BODY_MUSCLES: readonly MuscleGroup[] = [
  'Quads', 'Hamstrings', 'Glutes', 'Calves',
];

export function isLowerBody(muscle: MuscleGroup): boolean {
  return (LOWER_BODY_MUSCLES as readonly string[]).includes(muscle);
}

// ── Curated filter options (consolidated subset for UI dropdowns) ──

export const EQUIPMENT_FILTER_OPTIONS = [
  'Barbell', 'Dumbbell', 'Smith Machine', 'Cable',
  'Machine', 'Bodyweight', 'EZ Bar', 'Kettlebell', 'Band',
] as const;
export type EquipmentFilter = typeof EQUIPMENT_FILTER_OPTIONS[number] | 'All';

export const MUSCLE_FILTER_OPTIONS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core',
] as const;
export type MuscleFilter = typeof MUSCLE_FILTER_OPTIONS[number] | 'All';

/** Maps curated muscle filter → raw MuscleGroup values it covers */
export const MUSCLE_FILTER_MAP: Record<typeof MUSCLE_FILTER_OPTIONS[number], readonly MuscleGroup[]> = {
  Chest: ['Chest'],
  Back: ['Back', 'Lats'],
  Shoulders: ['Shoulders', 'Rear Delts'],
  Biceps: ['Biceps'],
  Triceps: ['Triceps'],
  Quads: ['Quads'],
  Hamstrings: ['Hamstrings'],
  Glutes: ['Glutes'],
  Calves: ['Calves'],
  Core: ['Core'],
};
