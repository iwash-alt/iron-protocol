export interface TemplateDay {
  name: string;
  exercises: string[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  days: TemplateDay[];
}

export const workoutTemplates: Record<string, WorkoutTemplate> = {
  ppl: {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    description: 'Classic 3-day split',
    days: [
      { name: 'Push', exercises: ['Barbell Bench Press', 'Overhead Press', 'Lateral Raises', 'Tricep Pushdown', 'Cable Crunch'] },
      { name: 'Pull', exercises: ['Deadlift', 'Barbell Row', 'Lat Pulldown', 'Barbell Curl', 'Face Pulls', 'Hanging Leg Raise'] },
      { name: 'Legs', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raises', 'Plank'] },
    ],
  },
  upperLower: {
    id: 'upperLower',
    name: 'Upper / Lower',
    description: '4-day split',
    days: [
      { name: 'Upper A', exercises: ['Barbell Bench Press', 'Barbell Row', 'Overhead Press', 'Barbell Curl', 'Tricep Pushdown', 'Woodchops (Cable)'] },
      { name: 'Lower A', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raises', 'Russian Twist'] },
      { name: 'Upper B', exercises: ['Barbell Bench Press', 'Lat Pulldown', 'Lateral Raises', 'Barbell Curl', 'Tricep Pushdown', 'Woodchops (Cable)'] },
      { name: 'Lower B', exercises: ['Deadlift', 'Squat', 'Leg Press', 'Calf Raises', 'Russian Twist'] },
    ],
  },
  fullBody: {
    id: 'fullBody',
    name: 'Full Body',
    description: '3-day full body',
    days: [
      { name: 'Day A', exercises: ['Squat', 'Barbell Bench Press', 'Barbell Row', 'Overhead Press', 'Plank'] },
      { name: 'Day B', exercises: ['Deadlift', 'Barbell Bench Press', 'Lat Pulldown', 'Barbell Curl', 'Hanging Leg Raise'] },
      { name: 'Day C', exercises: ['Squat', 'Overhead Press', 'Barbell Row', 'Tricep Pushdown', 'Cable Crunch'] },
    ],
  },
  broSplit: {
    id: 'broSplit',
    name: 'Bro Split',
    description: '5-day bodybuilding',
    days: [
      { name: 'Chest', exercises: ['Barbell Bench Press', 'Barbell Bench Press', 'Push Ups', 'Cable Crunch'] },
      { name: 'Back', exercises: ['Deadlift', 'Barbell Row', 'Lat Pulldown', 'Face Pulls', 'Hanging Leg Raise'] },
      { name: 'Shoulders', exercises: ['Overhead Press', 'Lateral Raises', 'Face Pulls', 'Plank'] },
      { name: 'Legs', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raises', 'Russian Twist'] },
      { name: 'Arms', exercises: ['Barbell Curl', 'Barbell Curl', 'Tricep Pushdown', 'Tricep Dips', 'Bicycle Crunches'] },
    ],
  },
};
