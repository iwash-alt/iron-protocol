export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingDays = 3 | 4;

export interface UserProfile {
  name: string;
  height: number;
  weight: number;
  age: number;
  level: ExperienceLevel;
  days: TrainingDays;
  health: boolean;
}
