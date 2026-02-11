export interface QuickTemplate {
  id: string;
  name: string;
  duration: number;
  exercises: string[];
}

export const quickTemplates: QuickTemplate[] = [
  { id: 'full', name: 'Full Body Blast', duration: 20, exercises: ['Burpees', 'Push Ups', 'Bodyweight Squats', 'Plank', 'Mountain Climbers', 'Lunges'] },
  { id: 'upper', name: 'Upper Body Burn', duration: 20, exercises: ['Push Ups', 'Diamond Push Ups', 'Tricep Dips', 'Pike Push Ups', 'Plank', 'Inverted Rows'] },
  { id: 'lower', name: 'Leg Day Express', duration: 20, exercises: ['Bodyweight Squats', 'Lunges', 'Glute Bridge', 'Jump Squats', 'Calf Raises', 'Bulgarian Split Squat'] },
  { id: 'core', name: 'Core Crusher', duration: 15, exercises: ['Plank', 'Bicycle Crunches', 'Mountain Climbers', 'Glute Bridge', 'Burpees'] },
  { id: 'hiit', name: 'HIIT It Hard', duration: 25, exercises: ['Burpees', 'Jump Squats', 'Mountain Climbers', 'High Knees', 'Push Ups'] },
  { id: 'coreBlaster', name: 'Core Blaster', duration: 15, exercises: ['Plank', 'Dead Bug', 'Crunches', 'Leg Raise (Lying)', 'Side Plank', 'Reverse Crunches'] },
  { id: 'abCircuit', name: 'Ab Circuit', duration: 20, exercises: ['Hanging Knee Raise', 'Russian Twist', 'Bicycle Crunches', 'V-Ups', 'Mountain Climbers', 'Toe Touches', 'Decline Sit-Up', 'Plank'] },
];
