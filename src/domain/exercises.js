export const exercises = [
  { id: '1', name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell', youtube: 'rT7DgCr-3pg', bodyweight: false },
  { id: '2', name: 'Push Ups', muscle: 'Chest', equipment: 'None', youtube: 'IODxDxX7oi4', bodyweight: true },
  { id: '3', name: 'Diamond Push Ups', muscle: 'Chest', equipment: 'None', youtube: 'J0DnG1_S92I', bodyweight: true },
  { id: '4', name: 'Incline Push Ups', muscle: 'Chest', equipment: 'None', youtube: 'cfns5VDVVvk', bodyweight: true },
  { id: '5', name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', youtube: '_RlRDWO2jfg', bodyweight: false },
  { id: '6', name: 'Pike Push Ups', muscle: 'Shoulders', equipment: 'None', youtube: 'sposDXWEB0A', bodyweight: true },
  { id: '7', name: 'Lateral Raises', muscle: 'Shoulders', equipment: 'Dumbbells', youtube: '3VcKaXpzqRo', bodyweight: false },
  { id: '8', name: 'Tricep Pushdown', muscle: 'Triceps', equipment: 'Cable', youtube: '2-LAMcpzODU', bodyweight: false },
  { id: '9', name: 'Tricep Dips', muscle: 'Triceps', equipment: 'None', youtube: '6kALZikXxLc', bodyweight: true },
  { id: '10', name: 'Deadlift', muscle: 'Back', equipment: 'Barbell', youtube: 'XxWcirHIwVo', bodyweight: false },
  { id: '11', name: 'Pull Ups', muscle: 'Back', equipment: 'Bar', youtube: 'eGo4IYlbE5g', bodyweight: true },
  { id: '12', name: 'Inverted Rows', muscle: 'Back', equipment: 'None', youtube: 'XZV9IwluPjw', bodyweight: true },
  { id: '13', name: 'Barbell Row', muscle: 'Back', equipment: 'Barbell', youtube: 'FWJR5Ve8bnQ', bodyweight: false },
  { id: '14', name: 'Lat Pulldown', muscle: 'Lats', equipment: 'Cable', youtube: 'CAwf7n6Luuc', bodyweight: false },
  { id: '15', name: 'Face Pulls', muscle: 'Rear Delts', equipment: 'Cable', youtube: 'rep-qVOkqgk', bodyweight: false },
  { id: '16', name: 'Barbell Curl', muscle: 'Biceps', equipment: 'Barbell', youtube: 'kwG2ipFRgfo', bodyweight: false },
  { id: '17', name: 'Squat', muscle: 'Quads', equipment: 'Barbell', youtube: 'bEv6CCg2BC8', bodyweight: false },
  { id: '18', name: 'Bodyweight Squats', muscle: 'Quads', equipment: 'None', youtube: 'aclHkVaku9U', bodyweight: true },
  { id: '19', name: 'Jump Squats', muscle: 'Quads', equipment: 'None', youtube: 'A-cFYWvaHr0', bodyweight: true },
  { id: '20', name: 'Lunges', muscle: 'Quads', equipment: 'None', youtube: 'QOVaHwm-Q6U', bodyweight: true },
  { id: '21', name: 'Bulgarian Split Squat', muscle: 'Quads', equipment: 'None', youtube: '2C-uNgKwPLE', bodyweight: true },
  { id: '22', name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Barbell', youtube: '7j-2w4-P14I', bodyweight: false },
  { id: '23', name: 'Glute Bridge', muscle: 'Glutes', equipment: 'None', youtube: 'OUgsJ8-Vi0E', bodyweight: true },
  { id: '24', name: 'Leg Press', muscle: 'Quads', equipment: 'Machine', youtube: 'IZxyjW7MPJQ', bodyweight: false },
  { id: '25', name: 'Calf Raises', muscle: 'Calves', equipment: 'None', youtube: 'gwLzBJYoWlI', bodyweight: true },
  { id: '26', name: 'Plank', muscle: 'Core', equipment: 'None', youtube: 'ASdvN_XEl_c', bodyweight: true },
  { id: '27', name: 'Mountain Climbers', muscle: 'Core', equipment: 'None', youtube: 'nmwgirgXLYM', bodyweight: true },
  { id: '28', name: 'Bicycle Crunches', muscle: 'Core', equipment: 'None', youtube: '9FGilxCbdz8', bodyweight: true },
  { id: '29', name: 'Burpees', muscle: 'Full Body', equipment: 'None', youtube: 'TU8QYVW0gDU', bodyweight: true },
  { id: '30', name: 'High Knees', muscle: 'Cardio', equipment: 'None', youtube: 'D0lLwTwjVbE', bodyweight: true },
];

export const LOWER_BODY_MUSCLES = ['Quads', 'Hamstrings', 'Glutes', 'Calves'];

export function isLowerBody(muscle) {
  return LOWER_BODY_MUSCLES.includes(muscle);
}
