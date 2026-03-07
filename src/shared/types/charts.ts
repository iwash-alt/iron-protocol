/** Weekly volume trend data point for time-series graphs. */
export interface VolumePoint {
  date: string;
  volume: number;
  sessionCount: number;
}

/** Histogram bucket for RPE rating distribution. */
export interface RPEDistribution {
  rpe: number;
  count: number;
}

/** Per-muscle-group volume breakdown for pie/bar charts. */
export interface MuscleGroupVolume {
  group: string;
  sets: number;
  percentage: number;
}

/** Single exercise personal-record timeline point. */
export interface ProgressionPoint {
  date: string;
  weight: number;
  exercise: string;
}
