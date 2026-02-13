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
  bars?: { y?: number; width?: number };
}

export interface ExerciseAnimationData {
  exerciseId: string;
  view: ExerciseView;
  startPose: ExercisePose;
  endPose: ExercisePose;
  duration: number;
  equipment: 'barbell' | 'none';
  equipmentConfig?: EquipmentConfig;
}

const baseStanding: ExercisePose = {
  torsoLean: 0,
  leftShoulder: -16,
  leftElbow: 12,
  rightShoulder: -16,
  rightElbow: 12,
  leftHip: 0,
  leftKnee: 8,
  rightHip: 0,
  rightKnee: 8,
};

const byId = (exerciseId: string, config: Partial<ExerciseAnimationData>): ExerciseAnimationData => ({
  exerciseId,
  view: 'side',
  startPose: baseStanding,
  endPose: { ...baseStanding },
  duration: 2400,
  equipment: 'none',
  ...config,
});

export const EXERCISE_ANIMATIONS: Record<string, ExerciseAnimationData> = {
  squat: byId('squat', {
    equipment: 'barbell',
    duration: 2600,
    equipmentConfig: { bars: { y: 62, width: 56 } },
    startPose: { ...baseStanding, leftHip: -6, rightHip: -6, leftKnee: 12, rightKnee: 12 },
    endPose: { ...baseStanding, torsoLean: 16, leftHip: 56, rightHip: 56, leftKnee: 74, rightKnee: 74 },
  }),
  bench_press: byId('bench_press', {
    equipment: 'barbell',
    duration: 2200,
    equipmentConfig: { bench: { x: 38, y: 132, width: 124 }, bars: { y: 92, width: 68 } },
    startPose: {
      ...baseStanding,
      torsoLean: 90,
      leftShoulder: -70,
      rightShoulder: -70,
      leftElbow: 86,
      rightElbow: 86,
      leftHip: 84,
      rightHip: 84,
      leftKnee: 68,
      rightKnee: 68,
    },
    endPose: {
      ...baseStanding,
      torsoLean: 90,
      leftShoulder: -98,
      rightShoulder: -98,
      leftElbow: 14,
      rightElbow: 14,
      leftHip: 84,
      rightHip: 84,
      leftKnee: 68,
      rightKnee: 68,
    },
  }),
  overhead_press: byId('overhead_press', {
    equipment: 'barbell',
    duration: 2000,
    equipmentConfig: { bars: { y: 88, width: 56 } },
    startPose: { ...baseStanding, leftShoulder: -42, rightShoulder: -42, leftElbow: 90, rightElbow: 90 },
    endPose: { ...baseStanding, leftShoulder: -102, rightShoulder: -102, leftElbow: 10, rightElbow: 10 },
  }),
};

export const EXERCISE_ANIMATION_BY_NAME: Record<string, string> = {
  Squat: 'squat',
  'Barbell Bench Press': 'bench_press',
  'Bench Press': 'bench_press',
  'Overhead Press': 'overhead_press',
};

