export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingDays = 3 | 4 | 5 | 6;

export interface UserProfile {
  name: string;
  height: number;
  weight: number;
  age: number;
  level: ExperienceLevel;
  days: TrainingDays;
}
