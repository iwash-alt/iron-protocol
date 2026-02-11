import { exercises } from './exercises';

export interface ExerciseGuide {
  /** Primary and secondary muscles worked */
  muscles: string[];
  /** 2-3 evidence-based form cues */
  cues: string[];
  /** 1-2 common mistakes to avoid */
  mistakes: string[];
}

/** Keyed by exercise name (must match Exercise.name exactly) */
export const exerciseGuides: Record<string, ExerciseGuide> = Object.fromEntries(
  exercises.map(e => [
    e.name,
    {
      muscles: [e.muscle, ...e.secondaryMuscles],
      cues: e.formCues,
      mistakes: e.commonMistakes,
    },
  ]),
);
