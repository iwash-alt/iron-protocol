import type { Exercise } from '@/shared/types';

export const exercises: Exercise[] = [
  { id: '1', name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell', youtubeId: 'rT7DgCr-3pg', isBodyweight: false },
  { id: '2', name: 'Push Ups', muscle: 'Chest', equipment: 'None', youtubeId: 'IODxDxX7oi4', isBodyweight: true },
  { id: '3', name: 'Diamond Push Ups', muscle: 'Chest', equipment: 'None', youtubeId: 'J0DnG1_S92I', isBodyweight: true },
  { id: '4', name: 'Incline Push Ups', muscle: 'Chest', equipment: 'None', youtubeId: 'cfns5VDVVvk', isBodyweight: true },
  { id: '5', name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', youtubeId: '_RlRDWO2jfg', isBodyweight: false },
  { id: '6', name: 'Pike Push Ups', muscle: 'Shoulders', equipment: 'None', youtubeId: 'sposDXWEB0A', isBodyweight: true },
  { id: '7', name: 'Lateral Raises', muscle: 'Shoulders', equipment: 'Dumbbells', youtubeId: '3VcKaXpzqRo', isBodyweight: false },
  { id: '8', name: 'Tricep Pushdown', muscle: 'Triceps', equipment: 'Cable', youtubeId: '2-LAMcpzODU', isBodyweight: false },
  { id: '9', name: 'Tricep Dips', muscle: 'Triceps', equipment: 'None', youtubeId: '6kALZikXxLc', isBodyweight: true },
  { id: '10', name: 'Deadlift', muscle: 'Back', equipment: 'Barbell', youtubeId: 'XxWcirHIwVo', isBodyweight: false },
  { id: '11', name: 'Pull Ups', muscle: 'Back', equipment: 'Bar', youtubeId: 'eGo4IYlbE5g', isBodyweight: true },
  { id: '12', name: 'Inverted Rows', muscle: 'Back', equipment: 'None', youtubeId: 'XZV9IwluPjw', isBodyweight: true },
  { id: '13', name: 'Barbell Row', muscle: 'Back', equipment: 'Barbell', youtubeId: 'FWJR5Ve8bnQ', isBodyweight: false },
  { id: '14', name: 'Lat Pulldown', muscle: 'Lats', equipment: 'Cable', youtubeId: 'CAwf7n6Luuc', isBodyweight: false },
  { id: '15', name: 'Face Pulls', muscle: 'Rear Delts', equipment: 'Cable', youtubeId: 'rep-qVOkqgk', isBodyweight: false },
  { id: '16', name: 'Barbell Curl', muscle: 'Biceps', equipment: 'Barbell', youtubeId: 'kwG2ipFRgfo', isBodyweight: false },
  { id: '17', name: 'Squat', muscle: 'Quads', equipment: 'Barbell', youtubeId: 'bEv6CCg2BC8', isBodyweight: false },
  { id: '18', name: 'Bodyweight Squats', muscle: 'Quads', equipment: 'None', youtubeId: 'aclHkVaku9U', isBodyweight: true },
  { id: '19', name: 'Jump Squats', muscle: 'Quads', equipment: 'None', youtubeId: 'A-cFYWvaHr0', isBodyweight: true },
  { id: '20', name: 'Lunges', muscle: 'Quads', equipment: 'None', youtubeId: 'QOVaHwm-Q6U', isBodyweight: true },
  { id: '21', name: 'Bulgarian Split Squat', muscle: 'Quads', equipment: 'None', youtubeId: '2C-uNgKwPLE', isBodyweight: true },
  { id: '22', name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Barbell', youtubeId: '7j-2w4-P14I', isBodyweight: false },
  { id: '23', name: 'Glute Bridge', muscle: 'Glutes', equipment: 'None', youtubeId: 'OUgsJ8-Vi0E', isBodyweight: true },
  { id: '24', name: 'Leg Press', muscle: 'Quads', equipment: 'Machine', youtubeId: 'IZxyjW7MPJQ', isBodyweight: false },
  { id: '25', name: 'Calf Raises', muscle: 'Calves', equipment: 'None', youtubeId: 'gwLzBJYoWlI', isBodyweight: true },
  { id: '26', name: 'Plank', muscle: 'Core', equipment: 'None', youtubeId: 'ASdvN_XEl_c', isBodyweight: true },
  { id: '27', name: 'Mountain Climbers', muscle: 'Core', equipment: 'None', youtubeId: 'nmwgirgXLYM', isBodyweight: true },
  { id: '28', name: 'Bicycle Crunches', muscle: 'Core', equipment: 'None', youtubeId: '9FGilxCbdz8', isBodyweight: true },
  { id: '29', name: 'Burpees', muscle: 'Full Body', equipment: 'None', youtubeId: 'TU8QYVW0gDU', isBodyweight: true },
  { id: '30', name: 'High Knees', muscle: 'Cardio', equipment: 'None', youtubeId: 'D0lLwTwjVbE', isBodyweight: true },
];

export function findExerciseByName(name: string): Exercise | undefined {
  return exercises.find(e => e.name === name);
}

export function getExercisesByMuscle(muscle: string, excludeId?: string): Exercise[] {
  return exercises.filter(e => e.muscle === muscle && e.id !== excludeId);
}

export function getWeightedExercises(): Exercise[] {
  return exercises.filter(e => !e.isBodyweight);
}
