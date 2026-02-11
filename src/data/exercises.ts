import type { Exercise, Equipment, MuscleGroup } from '@/shared/types';

export const exercises: Exercise[] = [
  // ── Chest ──
  { id: '1', name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell', youtubeId: 'rT7DgCr-3pg', isBodyweight: false },
  { id: '2', name: 'Push Ups', muscle: 'Chest', equipment: 'None', youtubeId: 'IODxDxX7oi4', isBodyweight: true },
  { id: '3', name: 'Diamond Push Ups', muscle: 'Chest', equipment: 'None', youtubeId: 'J0DnG1_S92I', isBodyweight: true },
  { id: '4', name: 'Incline Push Ups', muscle: 'Chest', equipment: 'None', youtubeId: 'cfns5VDVVvk', isBodyweight: true },
  { id: '31', name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbells', youtubeId: '8iPEnn-ltC8', isBodyweight: false },
  { id: '32', name: 'Dumbbell Fly', muscle: 'Chest', equipment: 'Dumbbells', youtubeId: 'eozdVDA78K0', isBodyweight: false },
  { id: '33', name: 'Cable Crossover', muscle: 'Chest', equipment: 'Cable', youtubeId: 'taI4XduLpTk', isBodyweight: false },
  { id: '34', name: 'Smith Machine Bench Press', muscle: 'Chest', equipment: 'Smith Machine', youtubeId: 'gRVjAtPip0Y', isBodyweight: false },
  { id: '35', name: 'Chest Press Machine', muscle: 'Chest', equipment: 'Machine', youtubeId: 'NwzUje3z0qY', isBodyweight: false },
  { id: '74', name: 'Kettlebell Floor Press', muscle: 'Chest', equipment: 'Kettlebell', youtubeId: 'LMpZ0w3z0LA', isBodyweight: false },
  { id: '75', name: 'Band Chest Press', muscle: 'Chest', equipment: 'Band', youtubeId: 'VCBGlF8R3TQ', isBodyweight: false },

  // ── Shoulders ──
  { id: '5', name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', youtubeId: '_RlRDWO2jfg', isBodyweight: false },
  { id: '6', name: 'Pike Push Ups', muscle: 'Shoulders', equipment: 'None', youtubeId: 'sposDXWEB0A', isBodyweight: true },
  { id: '7', name: 'Lateral Raises', muscle: 'Shoulders', equipment: 'Dumbbells', youtubeId: '3VcKaXpzqRo', isBodyweight: false },
  { id: '36', name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', equipment: 'Dumbbells', youtubeId: 'qEwKCR5JCog', isBodyweight: false },
  { id: '37', name: 'Arnold Press', muscle: 'Shoulders', equipment: 'Dumbbells', youtubeId: '6Z15_WdXmVw', isBodyweight: false },
  { id: '38', name: 'Cable Lateral Raise', muscle: 'Shoulders', equipment: 'Cable', youtubeId: 'PPrzBWGDXyI', isBodyweight: false },
  { id: '39', name: 'Smith Machine OHP', muscle: 'Shoulders', equipment: 'Smith Machine', youtubeId: '0nBfSTFdJYE', isBodyweight: false },
  { id: '76', name: 'Kettlebell Press', muscle: 'Shoulders', equipment: 'Kettlebell', youtubeId: 'wIHWbl_LFGA', isBodyweight: false },
  { id: '77', name: 'Band Pull Apart', muscle: 'Shoulders', equipment: 'Band', youtubeId: 'JObYtU7Y7ag', isBodyweight: false },

  // ── Triceps ──
  { id: '8', name: 'Tricep Pushdown', muscle: 'Triceps', equipment: 'Cable', youtubeId: '2-LAMcpzODU', isBodyweight: false },
  { id: '9', name: 'Tricep Dips', muscle: 'Triceps', equipment: 'None', youtubeId: '6kALZikXxLc', isBodyweight: true },
  { id: '40', name: 'Skull Crushers', muscle: 'Triceps', equipment: 'EZ Bar', youtubeId: 'd_KZxkY_0cM', isBodyweight: false },
  { id: '41', name: 'Overhead Tricep Extension', muscle: 'Triceps', equipment: 'Dumbbells', youtubeId: 'YbX7Wd8jQ-Q', isBodyweight: false },
  { id: '42', name: 'Close Grip Bench Press', muscle: 'Triceps', equipment: 'Barbell', youtubeId: 'nEF0bv2FW94', isBodyweight: false },
  { id: '78', name: 'Band Tricep Pushdown', muscle: 'Triceps', equipment: 'Band', youtubeId: 'PBbmFDp3MYE', isBodyweight: false },

  // ── Back ──
  { id: '10', name: 'Deadlift', muscle: 'Back', equipment: 'Barbell', youtubeId: 'XxWcirHIwVo', isBodyweight: false },
  { id: '11', name: 'Pull Ups', muscle: 'Back', equipment: 'Bar', youtubeId: 'eGo4IYlbE5g', isBodyweight: true },
  { id: '12', name: 'Inverted Rows', muscle: 'Back', equipment: 'None', youtubeId: 'XZV9IwluPjw', isBodyweight: true },
  { id: '13', name: 'Barbell Row', muscle: 'Back', equipment: 'Barbell', youtubeId: 'FWJR5Ve8bnQ', isBodyweight: false },
  { id: '43', name: 'Dumbbell Row', muscle: 'Back', equipment: 'Dumbbells', youtubeId: 'roCP6wCXPqo', isBodyweight: false },
  { id: '44', name: 'Seated Cable Row', muscle: 'Back', equipment: 'Cable', youtubeId: 'GZbfZ033f74', isBodyweight: false },
  { id: '45', name: 'T-Bar Row', muscle: 'Back', equipment: 'Barbell', youtubeId: 'j3Igk5nyZE4', isBodyweight: false },
  { id: '79', name: 'Kettlebell Row', muscle: 'Back', equipment: 'Kettlebell', youtubeId: 'hNfeNHCPWqs', isBodyweight: false },
  { id: '80', name: 'Band Row', muscle: 'Back', equipment: 'Band', youtubeId: 'Gbe2YOlpZr8', isBodyweight: false },

  // ── Lats ──
  { id: '14', name: 'Lat Pulldown', muscle: 'Lats', equipment: 'Cable', youtubeId: 'CAwf7n6Luuc', isBodyweight: false },
  { id: '46', name: 'Straight Arm Pulldown', muscle: 'Lats', equipment: 'Cable', youtubeId: 'AjZba_MkG8k', isBodyweight: false },
  { id: '81', name: 'Band Lat Pulldown', muscle: 'Lats', equipment: 'Band', youtubeId: 'QvGjH8TB3gE', isBodyweight: false },

  // ── Rear Delts ──
  { id: '15', name: 'Face Pulls', muscle: 'Rear Delts', equipment: 'Cable', youtubeId: 'rep-qVOkqgk', isBodyweight: false },
  { id: '47', name: 'Reverse Fly', muscle: 'Rear Delts', equipment: 'Dumbbells', youtubeId: 'ttvfGg9d76c', isBodyweight: false },
  { id: '82', name: 'Band Face Pull', muscle: 'Rear Delts', equipment: 'Band', youtubeId: 'AWoKhjHjTUo', isBodyweight: false },

  // ── Biceps ──
  { id: '16', name: 'Barbell Curl', muscle: 'Biceps', equipment: 'Barbell', youtubeId: 'kwG2ipFRgfo', isBodyweight: false },
  { id: '48', name: 'Dumbbell Curl', muscle: 'Biceps', equipment: 'Dumbbells', youtubeId: 'ykJmrZ5v0Oo', isBodyweight: false },
  { id: '49', name: 'Hammer Curl', muscle: 'Biceps', equipment: 'Dumbbells', youtubeId: 'zC3nLlEvin4', isBodyweight: false },
  { id: '50', name: 'EZ Bar Curl', muscle: 'Biceps', equipment: 'EZ Bar', youtubeId: 'zG2xJ0Q5QtI', isBodyweight: false },
  { id: '51', name: 'Cable Curl', muscle: 'Biceps', equipment: 'Cable', youtubeId: 'NFzTWp2qpiE', isBodyweight: false },
  { id: '83', name: 'Kettlebell Curl', muscle: 'Biceps', equipment: 'Kettlebell', youtubeId: 'kKMgrBRLfaA', isBodyweight: false },
  { id: '84', name: 'Band Curl', muscle: 'Biceps', equipment: 'Band', youtubeId: 'fDJ0CQPCGrU', isBodyweight: false },

  // ── Quads ──
  { id: '17', name: 'Squat', muscle: 'Quads', equipment: 'Barbell', youtubeId: 'bEv6CCg2BC8', isBodyweight: false },
  { id: '18', name: 'Bodyweight Squats', muscle: 'Quads', equipment: 'None', youtubeId: 'aclHkVaku9U', isBodyweight: true },
  { id: '19', name: 'Jump Squats', muscle: 'Quads', equipment: 'None', youtubeId: 'A-cFYWvaHr0', isBodyweight: true },
  { id: '20', name: 'Lunges', muscle: 'Quads', equipment: 'None', youtubeId: 'QOVaHwm-Q6U', isBodyweight: true },
  { id: '21', name: 'Bulgarian Split Squat', muscle: 'Quads', equipment: 'None', youtubeId: '2C-uNgKwPLE', isBodyweight: true },
  { id: '24', name: 'Leg Press', muscle: 'Quads', equipment: 'Machine', youtubeId: 'IZxyjW7MPJQ', isBodyweight: false },
  { id: '52', name: 'Goblet Squat', muscle: 'Quads', equipment: 'Kettlebell', youtubeId: 'MeIiIdhvXT4', isBodyweight: false },
  { id: '53', name: 'Smith Machine Squat', muscle: 'Quads', equipment: 'Smith Machine', youtubeId: 'IGDhwVaaOhI', isBodyweight: false },
  { id: '54', name: 'Leg Extension', muscle: 'Quads', equipment: 'Machine', youtubeId: 'YyvSfVjQeL0', isBodyweight: false },
  { id: '55', name: 'Dumbbell Lunges', muscle: 'Quads', equipment: 'Dumbbells', youtubeId: 'D7KaRcUTQeE', isBodyweight: false },
  { id: '85', name: 'Band Squat', muscle: 'Quads', equipment: 'Band', youtubeId: 'TuUJH7otFsA', isBodyweight: false },

  // ── Hamstrings ──
  { id: '22', name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Barbell', youtubeId: '7j-2w4-P14I', isBodyweight: false },
  { id: '56', name: 'Leg Curl', muscle: 'Hamstrings', equipment: 'Machine', youtubeId: '1Tq3QdYUuHs', isBodyweight: false },
  { id: '57', name: 'Dumbbell Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Dumbbells', youtubeId: 'hQgFixEnbMI', isBodyweight: false },
  { id: '58', name: 'Kettlebell Swing', muscle: 'Hamstrings', equipment: 'Kettlebell', youtubeId: 'YSxHifyI6s8', isBodyweight: false },
  { id: '86', name: 'Band Leg Curl', muscle: 'Hamstrings', equipment: 'Band', youtubeId: 'VZlMHe-7LaI', isBodyweight: false },

  // ── Glutes ──
  { id: '23', name: 'Glute Bridge', muscle: 'Glutes', equipment: 'None', youtubeId: 'OUgsJ8-Vi0E', isBodyweight: true },
  { id: '59', name: 'Hip Thrust', muscle: 'Glutes', equipment: 'Barbell', youtubeId: 'SEdqd1n0cvg', isBodyweight: false },
  { id: '60', name: 'Cable Pull Through', muscle: 'Glutes', equipment: 'Cable', youtubeId: 'MBcmpcRpnrM', isBodyweight: false },
  { id: '87', name: 'Band Hip Thrust', muscle: 'Glutes', equipment: 'Band', youtubeId: 'xDmFkJxPzeM', isBodyweight: false },

  // ── Calves ──
  { id: '25', name: 'Calf Raises', muscle: 'Calves', equipment: 'None', youtubeId: 'gwLzBJYoWlI', isBodyweight: true },
  { id: '61', name: 'Seated Calf Raise', muscle: 'Calves', equipment: 'Machine', youtubeId: 'JbyjNymZOt0', isBodyweight: false },
  { id: '62', name: 'Smith Machine Calf Raise', muscle: 'Calves', equipment: 'Smith Machine', youtubeId: '9kBwEvWsHIo', isBodyweight: false },

  // ── Core ──
  { id: '26', name: 'Plank', muscle: 'Core', equipment: 'None', youtubeId: 'ASdvN_XEl_c', isBodyweight: true },
  { id: '27', name: 'Mountain Climbers', muscle: 'Core', equipment: 'None', youtubeId: 'nmwgirgXLYM', isBodyweight: true },
  { id: '28', name: 'Bicycle Crunches', muscle: 'Core', equipment: 'None', youtubeId: '9FGilxCbdz8', isBodyweight: true },
  { id: '63', name: 'Cable Woodchop', muscle: 'Core', equipment: 'Cable', youtubeId: 'pAplQXk3dkU', isBodyweight: false },
  { id: '64', name: 'Ab Rollout', muscle: 'Core', equipment: 'Bar', youtubeId: 'DYQM0M9c9KA', isBodyweight: false },

  // ── Full Body / Cardio ──
  { id: '29', name: 'Burpees', muscle: 'Full Body', equipment: 'None', youtubeId: 'TU8QYVW0gDU', isBodyweight: true },
  { id: '30', name: 'High Knees', muscle: 'Cardio', equipment: 'None', youtubeId: 'D0lLwTwjVbE', isBodyweight: true },
  { id: '65', name: 'Kettlebell Clean and Press', muscle: 'Full Body', equipment: 'Kettlebell', youtubeId: 'FEa9TlVRcLE', isBodyweight: false },
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

export function getAllExercises(): Exercise[] {
  return exercises;
}

/** Get all unique equipment types that have exercises */
export function getAvailableEquipment(): Equipment[] {
  const set = new Set(exercises.map(e => e.equipment));
  return [...set];
}

/** Get all unique muscle groups that have exercises */
export function getAvailableMuscles(): MuscleGroup[] {
  const set = new Set(exercises.map(e => e.muscle));
  return [...set];
}

/** Fuzzy text match on exercise name */
export function searchExercises(query: string): Exercise[] {
  if (!query.trim()) return exercises;
  const lower = query.toLowerCase().trim();
  const terms = lower.split(/\s+/);
  return exercises.filter(e => {
    const name = e.name.toLowerCase();
    return terms.every(t => name.includes(t));
  });
}

/** Filter exercises by equipment and/or muscle, with optional search */
export function filterExercises(opts: {
  search?: string;
  equipment?: Equipment | 'All';
  muscle?: MuscleGroup | 'All';
}): Exercise[] {
  let results = opts.search ? searchExercises(opts.search) : exercises;
  if (opts.equipment && opts.equipment !== 'All') {
    results = results.filter(e => e.equipment === opts.equipment);
  }
  if (opts.muscle && opts.muscle !== 'All') {
    results = results.filter(e => e.muscle === opts.muscle);
  }
  return results;
}
