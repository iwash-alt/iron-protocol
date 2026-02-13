export type ExerciseView = 'side' | 'front';

export interface ExercisePose {
  torsoLean: number;
  leftShoulder: number;
  leftElbow: number;
  rightShoulder: number;
  rightElbow: number;
  leftHip: number;
  leftKnee: number;
  rightHip: number;
  rightKnee: number;
}

export interface EquipmentConfig {
  bench?: { x: number; y: number; width: number; angle?: number };
  bars?: { y?: number };
  cableAnchor?: { x: number; y: number };
  machine?: { x: number; y: number; width: number; height: number };
}

export interface ExerciseAnimationData {
  exerciseId: string;
  view: ExerciseView;
  startPose: ExercisePose;
  endPose: ExercisePose;
  duration: number;
  equipment: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'none';
  equipmentConfig?: EquipmentConfig;
  movementHint?: 'up-down' | 'in-out' | 'rotation' | 'static';
}

const baseStanding: ExercisePose = {
  torsoLean: 0,
  leftShoulder: -10,
  leftElbow: 5,
  rightShoulder: -10,
  rightElbow: 5,
  leftHip: 0,
  leftKnee: 6,
  rightHip: 0,
  rightKnee: 6,
};

const byId = (exerciseId: string, config: Partial<ExerciseAnimationData>): ExerciseAnimationData => ({
  exerciseId,
  view: 'side',
  startPose: baseStanding,
  endPose: { ...baseStanding },
  duration: 2000,
  equipment: 'none',
  ...config,
});

export const EXERCISE_ANIMATIONS: Record<string, ExerciseAnimationData> = {
  bench_press: byId('bench_press', { equipment: 'barbell', equipmentConfig: { bench: { x: 34, y: 130, width: 128 } }, startPose: { ...baseStanding, torsoLean: 90, leftShoulder: -60, rightShoulder: -60, leftElbow: 96, rightElbow: 96, leftHip: 84, rightHip: 84 }, endPose: { ...baseStanding, torsoLean: 90, leftShoulder: -104, rightShoulder: -104, leftElbow: 12, rightElbow: 12, leftHip: 82, rightHip: 82 } }),
  dumbbell_bench_press: byId('dumbbell_bench_press', { equipment: 'dumbbell', equipmentConfig: { bench: { x: 34, y: 130, width: 128 } }, startPose: { ...baseStanding, torsoLean: 90, leftShoulder: -58, rightShoulder: -58, leftElbow: 95, rightElbow: 95, leftHip: 84, rightHip: 84 }, endPose: { ...baseStanding, torsoLean: 90, leftShoulder: -100, rightShoulder: -100, leftElbow: 8, rightElbow: 8, leftHip: 82, rightHip: 82 } }),
  incline_db_press: byId('incline_db_press', { equipment: 'dumbbell', equipmentConfig: { bench: { x: 36, y: 132, width: 110, angle: -24 } }, startPose: { ...baseStanding, torsoLean: 64, leftShoulder: -40, rightShoulder: -40, leftElbow: 92, rightElbow: 92, leftHip: 82, rightHip: 82 }, endPose: { ...baseStanding, torsoLean: 64, leftShoulder: -88, rightShoulder: -88, leftElbow: 10, rightElbow: 10, leftHip: 80, rightHip: 80 } }),
  cable_fly: byId('cable_fly', { view: 'front', equipment: 'cable', equipmentConfig: { cableAnchor: { x: 18, y: 58 }, machine: { x: 10, y: 30, width: 26, height: 96 } }, startPose: { ...baseStanding, leftShoulder: -96, rightShoulder: 96, leftElbow: 14, rightElbow: -14 }, endPose: { ...baseStanding, leftShoulder: -35, rightShoulder: 35, leftElbow: 18, rightElbow: -18 } }),
  push_ups: byId('push_ups', { equipment: 'none', duration: 2200, startPose: { ...baseStanding, torsoLean: 86, leftShoulder: -76, rightShoulder: -76, leftElbow: 102, rightElbow: 102, leftHip: 82, rightHip: 82 }, endPose: { ...baseStanding, torsoLean: 84, leftShoulder: -98, rightShoulder: -98, leftElbow: 24, rightElbow: 24, leftHip: 80, rightHip: 80 } }),
  dips: byId('dips', { equipment: 'machine', equipmentConfig: { bars: { y: 94 } }, startPose: { ...baseStanding, torsoLean: 20, leftShoulder: -34, rightShoulder: -34, leftElbow: 18, rightElbow: 18, leftHip: -20, rightHip: -20, leftKnee: 40, rightKnee: 40 }, endPose: { ...baseStanding, torsoLean: 28, leftShoulder: -6, rightShoulder: -6, leftElbow: 90, rightElbow: 90, leftHip: -16, rightHip: -16, leftKnee: 52, rightKnee: 52 } }),
  deadlift: byId('deadlift', { equipment: 'barbell', startPose: { ...baseStanding, torsoLean: 38, leftShoulder: -2, rightShoulder: -2, leftHip: 44, rightHip: 44, leftKnee: 42, rightKnee: 42 }, endPose: { ...baseStanding, torsoLean: 0, leftShoulder: -8, rightShoulder: -8, leftHip: 0, rightHip: 0, leftKnee: 8, rightKnee: 8 } }),
  barbell_row: byId('barbell_row', { equipment: 'barbell', startPose: { ...baseStanding, torsoLean: 42, leftShoulder: -24, rightShoulder: -24, leftElbow: 92, rightElbow: 92, leftHip: 18, rightHip: 18, leftKnee: 22, rightKnee: 22 }, endPose: { ...baseStanding, torsoLean: 38, leftShoulder: -12, rightShoulder: -12, leftElbow: 46, rightElbow: 46, leftHip: 16, rightHip: 16, leftKnee: 18, rightKnee: 18 } }),
  lat_pulldown: byId('lat_pulldown', { view: 'front', equipment: 'cable', equipmentConfig: { cableAnchor: { x: 100, y: 24 }, machine: { x: 72, y: 16, width: 56, height: 150 } }, startPose: { ...baseStanding, leftShoulder: -120, rightShoulder: 120, leftElbow: 10, rightElbow: -10, leftHip: 88, rightHip: 88 }, endPose: { ...baseStanding, leftShoulder: -52, rightShoulder: 52, leftElbow: 70, rightElbow: -70, leftHip: 88, rightHip: 88 } }),
  seated_cable_row: byId('seated_cable_row', { equipment: 'cable', equipmentConfig: { cableAnchor: { x: 176, y: 102 } }, startPose: { ...baseStanding, torsoLean: 6, leftShoulder: -6, rightShoulder: -6, leftElbow: 12, rightElbow: 12, leftHip: 62, rightHip: 62, leftKnee: 26, rightKnee: 26 }, endPose: { ...baseStanding, torsoLean: 10, leftShoulder: -18, rightShoulder: -18, leftElbow: 86, rightElbow: 86, leftHip: 62, rightHip: 62, leftKnee: 26, rightKnee: 26 } }),
  pull_ups: byId('pull_ups', { view: 'front', equipment: 'machine', equipmentConfig: { bars: { y: 20 } }, startPose: { ...baseStanding, leftShoulder: -124, rightShoulder: 124, leftElbow: 8, rightElbow: -8, leftHip: 2, rightHip: 2, leftKnee: 6, rightKnee: 6 }, endPose: { ...baseStanding, leftShoulder: -94, rightShoulder: 94, leftElbow: 94, rightElbow: -94, leftHip: 2, rightHip: 2, leftKnee: 8, rightKnee: 8 } }),
  overhead_press: byId('overhead_press', { view: 'front', equipment: 'barbell', startPose: { ...baseStanding, leftShoulder: -54, rightShoulder: 54, leftElbow: 88, rightElbow: -88 }, endPose: { ...baseStanding, leftShoulder: -112, rightShoulder: 112, leftElbow: 8, rightElbow: -8 } }),
  lateral_raise: byId('lateral_raise', { view: 'front', equipment: 'dumbbell', startPose: { ...baseStanding, leftShoulder: -14, rightShoulder: 14 }, endPose: { ...baseStanding, leftShoulder: -90, rightShoulder: 90 } }),
  front_raise: byId('front_raise', { equipment: 'dumbbell', startPose: { ...baseStanding, leftShoulder: -18, rightShoulder: -18 }, endPose: { ...baseStanding, leftShoulder: -92, rightShoulder: -92 } }),
  face_pull: byId('face_pull', { equipment: 'cable', equipmentConfig: { cableAnchor: { x: 178, y: 72 } }, startPose: { ...baseStanding, torsoLean: 8, leftShoulder: -24, rightShoulder: -24, leftElbow: 18, rightElbow: 18 }, endPose: { ...baseStanding, torsoLean: 10, leftShoulder: 16, rightShoulder: 16, leftElbow: 86, rightElbow: 86 } }),
  squat: byId('squat', { equipment: 'barbell', startPose: { ...baseStanding, leftHip: -2, rightHip: -2, leftKnee: 12, rightKnee: 12 }, endPose: { ...baseStanding, torsoLean: 18, leftHip: 58, rightHip: 58, leftKnee: 74, rightKnee: 74 } }),
  leg_press: byId('leg_press', { equipment: 'machine', equipmentConfig: { machine: { x: 124, y: 40, width: 44, height: 118 } }, startPose: { ...baseStanding, torsoLean: 68, leftHip: 88, rightHip: 88, leftKnee: 92, rightKnee: 92 }, endPose: { ...baseStanding, torsoLean: 68, leftHip: 36, rightHip: 36, leftKnee: 16, rightKnee: 16 } }),
  romanian_deadlift: byId('romanian_deadlift', { equipment: 'barbell', startPose: { ...baseStanding, torsoLean: 32, leftHip: 34, rightHip: 34, leftKnee: 18, rightKnee: 18 }, endPose: { ...baseStanding, torsoLean: 0, leftHip: 0, rightHip: 0, leftKnee: 8, rightKnee: 8 } }),
  leg_extension: byId('leg_extension', { equipment: 'machine', equipmentConfig: { machine: { x: 34, y: 94, width: 130, height: 54 } }, startPose: { ...baseStanding, torsoLean: 88, leftHip: 88, rightHip: 88, leftKnee: 94, rightKnee: 94 }, endPose: { ...baseStanding, torsoLean: 88, leftHip: 88, rightHip: 88, leftKnee: 2, rightKnee: 2 } }),
  leg_curl: byId('leg_curl', { equipment: 'machine', equipmentConfig: { bench: { x: 26, y: 126, width: 140 } }, startPose: { ...baseStanding, torsoLean: 90, leftHip: 88, rightHip: 88, leftKnee: 8, rightKnee: 8 }, endPose: { ...baseStanding, torsoLean: 90, leftHip: 88, rightHip: 88, leftKnee: 96, rightKnee: 96 } }),
  hip_thrust: byId('hip_thrust', { equipment: 'barbell', equipmentConfig: { bench: { x: 18, y: 102, width: 80 } }, startPose: { ...baseStanding, torsoLean: 74, leftHip: 76, rightHip: 76, leftKnee: 78, rightKnee: 78 }, endPose: { ...baseStanding, torsoLean: 88, leftHip: 8, rightHip: 8, leftKnee: 84, rightKnee: 84 } }),
  bulgarian_split_squat: byId('bulgarian_split_squat', { equipment: 'dumbbell', equipmentConfig: { bench: { x: 126, y: 122, width: 42 } }, startPose: { ...baseStanding, torsoLean: 8, leftHip: 34, leftKnee: 62, rightHip: -24, rightKnee: 92 }, endPose: { ...baseStanding, torsoLean: 10, leftHip: 8, leftKnee: 18, rightHip: -20, rightKnee: 36 } }),
  barbell_curl: byId('barbell_curl', { view: 'front', equipment: 'barbell', startPose: { ...baseStanding, leftShoulder: -8, rightShoulder: 8, leftElbow: 10, rightElbow: -10 }, endPose: { ...baseStanding, leftShoulder: -18, rightShoulder: 18, leftElbow: 118, rightElbow: -118 } }),
  hammer_curl: byId('hammer_curl', { equipment: 'dumbbell', startPose: { ...baseStanding, leftElbow: 8, rightElbow: 8 }, endPose: { ...baseStanding, leftElbow: 114, rightElbow: 114 } }),
  tricep_pushdown: byId('tricep_pushdown', { equipment: 'cable', equipmentConfig: { cableAnchor: { x: 168, y: 32 } }, startPose: { ...baseStanding, leftShoulder: -22, rightShoulder: -22, leftElbow: 96, rightElbow: 96 }, endPose: { ...baseStanding, leftShoulder: -22, rightShoulder: -22, leftElbow: 12, rightElbow: 12 } }),
  skull_crushers: byId('skull_crushers', { equipment: 'barbell', equipmentConfig: { bench: { x: 34, y: 130, width: 128 } }, startPose: { ...baseStanding, torsoLean: 90, leftShoulder: -114, rightShoulder: -114, leftElbow: 96, rightElbow: 96, leftHip: 84, rightHip: 84 }, endPose: { ...baseStanding, torsoLean: 90, leftShoulder: -114, rightShoulder: -114, leftElbow: 12, rightElbow: 12, leftHip: 84, rightHip: 84 } }),
  plank: byId('plank', { equipment: 'none', duration: 3200, startPose: { ...baseStanding, torsoLean: 86, leftShoulder: -94, rightShoulder: -94, leftElbow: 12, rightElbow: 12, leftHip: 82, rightHip: 82 }, endPose: { ...baseStanding, torsoLean: 84, leftShoulder: -94, rightShoulder: -94, leftElbow: 12, rightElbow: 12, leftHip: 80, rightHip: 80 }, movementHint: 'static' }),
  hanging_leg_raise: byId('hanging_leg_raise', { view: 'front', equipment: 'machine', equipmentConfig: { bars: { y: 20 } }, startPose: { ...baseStanding, leftShoulder: -124, rightShoulder: 124, leftElbow: 8, rightElbow: -8, leftHip: 4, rightHip: 4, leftKnee: 8, rightKnee: 8 }, endPose: { ...baseStanding, leftShoulder: -124, rightShoulder: 124, leftElbow: 8, rightElbow: -8, leftHip: 84, rightHip: 84, leftKnee: 6, rightKnee: 6 } }),
  cable_crunch: byId('cable_crunch', { equipment: 'cable', equipmentConfig: { cableAnchor: { x: 170, y: 26 } }, startPose: { ...baseStanding, torsoLean: 18, leftHip: 90, rightHip: 90, leftKnee: 98, rightKnee: 98 }, endPose: { ...baseStanding, torsoLean: 56, leftHip: 90, rightHip: 90, leftKnee: 98, rightKnee: 98 } }),
  russian_twist: byId('russian_twist', { view: 'front', equipment: 'none', duration: 2200, startPose: { ...baseStanding, torsoLean: 70, leftHip: 88, rightHip: 88, leftKnee: 98, rightKnee: 98, leftShoulder: -26, rightShoulder: 26 }, endPose: { ...baseStanding, torsoLean: 70, leftHip: 88, rightHip: 88, leftKnee: 98, rightKnee: 98, leftShoulder: 26, rightShoulder: -26 }, movementHint: 'rotation' }),
};

export const EXERCISE_ANIMATION_BY_NAME: Record<string, string> = {
  'Barbell Bench Press': 'bench_press',
  'Dumbbell Bench Press': 'dumbbell_bench_press',
  'Incline Dumbbell Press': 'incline_db_press',
  'Cable Fly': 'cable_fly',
  'Cable Crossover': 'cable_fly',
  'Push Ups': 'push_ups',
  Dips: 'dips',
  Deadlift: 'deadlift',
  'Barbell Row': 'barbell_row',
  'Lat Pulldown': 'lat_pulldown',
  'Seated Cable Row': 'seated_cable_row',
  Pullups: 'pull_ups',
  'Overhead Press': 'overhead_press',
  'Lateral Raise': 'lateral_raise',
  'Front Raise': 'front_raise',
  'Face Pull': 'face_pull',
  Squat: 'squat',
  'Leg Press': 'leg_press',
  'Romanian Deadlift': 'romanian_deadlift',
  'Leg Extension': 'leg_extension',
  'Leg Curl': 'leg_curl',
  'Hip Thrust': 'hip_thrust',
  'Bulgarian Split Squat': 'bulgarian_split_squat',
  'Barbell Curl': 'barbell_curl',
  'Hammer Curls': 'hammer_curl',
  'Tricep Pushdown': 'tricep_pushdown',
  'Skull Crushers': 'skull_crushers',
  Plank: 'plank',
  'Hanging Leg Raise': 'hanging_leg_raise',
  'Cable Crunch': 'cable_crunch',
  'Russian Twist': 'russian_twist',
};
