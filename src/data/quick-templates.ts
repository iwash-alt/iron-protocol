export interface QuickExerciseConfig {
  /** Exercise name — must match an entry in exercises.ts */
  name: string;
  /** Number of sets */
  sets: number;
  /** Reps per set. Null if duration-based. */
  reps: number | null;
  /** Duration in seconds per set. Null if rep-based. */
  durationSeconds: number | null;
}

export type Difficulty = 'easy' | 'moderate' | 'hard';

export interface QuickTemplate {
  id: string;
  name: string;
  duration: number;
  difficulty: Difficulty;
  exercises: QuickExerciseConfig[];
}

export interface QuickTemplateCustomization {
  templateId: string;
  exercises: QuickExerciseConfig[];
  lastModified: string;
}

export type QuickTemplateCustomizations = Record<string, QuickTemplateCustomization>;

export const quickTemplates: QuickTemplate[] = [
  {
    id: 'full',
    name: 'Full Body Blast',
    duration: 20,
    difficulty: 'moderate',
    exercises: [
      { name: 'Burpees', sets: 3, reps: 12, durationSeconds: null },
      { name: 'Push Ups', sets: 3, reps: 15, durationSeconds: null },
      { name: 'Bodyweight Squats', sets: 3, reps: 20, durationSeconds: null },
      { name: 'Plank', sets: 3, reps: null, durationSeconds: 30 },
      { name: 'Mountain Climbers', sets: 3, reps: 20, durationSeconds: null },
      { name: 'Lunges', sets: 3, reps: 12, durationSeconds: null },
    ],
  },
  {
    id: 'upper',
    name: 'Upper Body Burn',
    duration: 20,
    difficulty: 'moderate',
    exercises: [
      { name: 'Push Ups', sets: 3, reps: 15, durationSeconds: null },
      { name: 'Diamond Push Ups', sets: 3, reps: 12, durationSeconds: null },
      { name: 'Tricep Dips', sets: 3, reps: 15, durationSeconds: null },
      { name: 'Pike Push Ups', sets: 3, reps: 10, durationSeconds: null },
      { name: 'Plank', sets: 3, reps: null, durationSeconds: 30 },
      { name: 'Inverted Rows', sets: 3, reps: 12, durationSeconds: null },
    ],
  },
  {
    id: 'lower',
    name: 'Leg Day Express',
    duration: 20,
    difficulty: 'moderate',
    exercises: [
      { name: 'Bodyweight Squats', sets: 3, reps: 20, durationSeconds: null },
      { name: 'Lunges', sets: 3, reps: 12, durationSeconds: null },
      { name: 'Glute Bridge', sets: 3, reps: 15, durationSeconds: null },
      { name: 'Jump Squats', sets: 3, reps: 12, durationSeconds: null },
      { name: 'Calf Raises', sets: 3, reps: 20, durationSeconds: null },
      { name: 'Bulgarian Split Squat', sets: 3, reps: 10, durationSeconds: null },
    ],
  },
  {
    id: 'core',
    name: 'Core Crusher',
    duration: 15,
    difficulty: 'easy',
    exercises: [
      { name: 'Plank', sets: 3, reps: null, durationSeconds: 30 },
      { name: 'Bicycle Crunches', sets: 3, reps: 20, durationSeconds: null },
      { name: 'Mountain Climbers', sets: 3, reps: 20, durationSeconds: null },
      { name: 'Glute Bridge', sets: 3, reps: 15, durationSeconds: null },
      { name: 'Burpees', sets: 3, reps: 10, durationSeconds: null },
    ],
  },
  {
    id: 'hiit',
    name: 'HIIT It Hard',
    duration: 25,
    difficulty: 'hard',
    exercises: [
      { name: 'Burpees', sets: 4, reps: 15, durationSeconds: null },
      { name: 'Jump Squats', sets: 4, reps: 20, durationSeconds: null },
      { name: 'Mountain Climbers', sets: 4, reps: 25, durationSeconds: null },
      { name: 'High Knees', sets: 4, reps: 30, durationSeconds: null },
      { name: 'Push Ups', sets: 4, reps: 20, durationSeconds: null },
    ],
  },
  {
    id: 'coreBlaster',
    name: 'Core Blaster',
    duration: 15,
    difficulty: 'easy',
    exercises: [
      { name: 'Plank', sets: 3, reps: null, durationSeconds: 30 },
      { name: 'Dead Bug', sets: 3, reps: 12, durationSeconds: null },
      { name: 'Crunches', sets: 3, reps: 20, durationSeconds: null },
      { name: 'Leg Raise (Lying)', sets: 3, reps: 15, durationSeconds: null },
      { name: 'Side Plank', sets: 3, reps: null, durationSeconds: 25 },
      { name: 'Reverse Crunches', sets: 3, reps: 15, durationSeconds: null },
    ],
  },
  {
    id: 'abCircuit',
    name: 'Ab Circuit',
    duration: 20,
    difficulty: 'moderate',
    exercises: [
      { name: 'Hanging Knee Raise', sets: 3, reps: 12, durationSeconds: null },
      { name: 'Russian Twist', sets: 3, reps: 20, durationSeconds: null },
      { name: 'Bicycle Crunches', sets: 3, reps: 20, durationSeconds: null },
      { name: 'V-Ups', sets: 3, reps: 12, durationSeconds: null },
      { name: 'Mountain Climbers', sets: 3, reps: 20, durationSeconds: null },
      { name: 'Toe Touches', sets: 3, reps: 15, durationSeconds: null },
      { name: 'Decline Sit-Up', sets: 3, reps: 12, durationSeconds: null },
      { name: 'Plank', sets: 3, reps: null, durationSeconds: 45 },
    ],
  },
];
