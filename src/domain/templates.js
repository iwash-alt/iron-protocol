export const quickTemplates = [
  { id: 'full', name: 'Full Body Blast', duration: 20, exercises: ['Burpees', 'Push Ups', 'Bodyweight Squats', 'Plank', 'Mountain Climbers', 'Lunges'] },
  { id: 'upper', name: 'Upper Body Burn', duration: 20, exercises: ['Push Ups', 'Diamond Push Ups', 'Tricep Dips', 'Pike Push Ups', 'Plank', 'Inverted Rows'] },
  { id: 'lower', name: 'Leg Day Express', duration: 20, exercises: ['Bodyweight Squats', 'Lunges', 'Glute Bridge', 'Jump Squats', 'Calf Raises', 'Bulgarian Split Squat'] },
  { id: 'core', name: 'Core Crusher', duration: 15, exercises: ['Plank', 'Bicycle Crunches', 'Mountain Climbers', 'Glute Bridge', 'Burpees'] },
  { id: 'hiit', name: 'HIIT It Hard', duration: 25, exercises: ['Burpees', 'Jump Squats', 'Mountain Climbers', 'High Knees', 'Push Ups'] },
];

export const workoutTemplates = {
  ppl: { id: 'ppl', name: 'Push / Pull / Legs', description: 'Classic 3-day split', days: [
    { name: 'Push', exercises: ['Barbell Bench Press', 'Overhead Press', 'Lateral Raises', 'Tricep Pushdown'] },
    { name: 'Pull', exercises: ['Deadlift', 'Barbell Row', 'Lat Pulldown', 'Barbell Curl', 'Face Pulls'] },
    { name: 'Legs', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raises'] }
  ]},
  upperLower: { id: 'upperLower', name: 'Upper / Lower', description: '4-day split', days: [
    { name: 'Upper A', exercises: ['Barbell Bench Press', 'Barbell Row', 'Overhead Press', 'Barbell Curl', 'Tricep Pushdown'] },
    { name: 'Lower A', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raises'] },
    { name: 'Upper B', exercises: ['Barbell Bench Press', 'Lat Pulldown', 'Lateral Raises', 'Barbell Curl', 'Tricep Pushdown'] },
    { name: 'Lower B', exercises: ['Deadlift', 'Squat', 'Leg Press', 'Calf Raises'] }
  ]},
  fullBody: { id: 'fullBody', name: 'Full Body', description: '3-day full body', days: [
    { name: 'Day A', exercises: ['Squat', 'Barbell Bench Press', 'Barbell Row', 'Overhead Press'] },
    { name: 'Day B', exercises: ['Deadlift', 'Barbell Bench Press', 'Lat Pulldown', 'Barbell Curl'] },
    { name: 'Day C', exercises: ['Squat', 'Overhead Press', 'Barbell Row', 'Tricep Pushdown'] }
  ]},
  broSplit: { id: 'broSplit', name: 'Bro Split', description: '5-day bodybuilding', days: [
    { name: 'Chest', exercises: ['Barbell Bench Press', 'Barbell Bench Press', 'Push Ups'] },
    { name: 'Back', exercises: ['Deadlift', 'Barbell Row', 'Lat Pulldown', 'Face Pulls'] },
    { name: 'Shoulders', exercises: ['Overhead Press', 'Lateral Raises', 'Face Pulls'] },
    { name: 'Legs', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raises'] },
    { name: 'Arms', exercises: ['Barbell Curl', 'Barbell Curl', 'Tricep Pushdown', 'Tricep Dips'] }
  ]}
};
