/**
 * Exercise Auto-Tag Engine
 *
 * Suggests muscle group, equipment, and type based on exercise name.
 * Used in the Create Custom Exercise form to reduce friction.
 *
 * e.g. "Incline Dumbbell Press" → Chest / Dumbbell / compound
 *      "Cable Lateral Raise" → Shoulders / Cable / isolation
 */

import type { MuscleGroup, Equipment, ExerciseType } from '@/shared/types';

export interface AutoTagSuggestion {
  muscle: MuscleGroup | null;
  equipment: Equipment | null;
  type: ExerciseType | null;
}

// ── Keyword maps ──────────────────────────────────────────────────────────────

const MUSCLE_KEYWORDS: Array<{ keywords: string[]; muscle: MuscleGroup }> = [
  { keywords: ['bench', 'press', 'fly', 'flye', 'chest', 'pec', 'push-up', 'pushup', 'push up', 'incline press', 'decline press', 'dip'], muscle: 'Chest' },
  { keywords: ['row', 'pull-up', 'pullup', 'pull up', 'chin-up', 'chinup', 'chin up', 'lat pull', 'pulldown', 'back ext'], muscle: 'Back' },
  { keywords: ['overhead press', 'ohp', 'shoulder press', 'military press', 'lateral raise', 'front raise', 'face pull', 'upright row', 'arnold', 'delt'], muscle: 'Shoulders' },
  { keywords: ['squat', 'leg press', 'lunge', 'leg ext', 'quad', 'hack squat', 'sissy squat', 'step-up', 'step up'], muscle: 'Quads' },
  { keywords: ['romanian', 'rdl', 'leg curl', 'hamstring', 'good morning', 'nordic', 'stiff leg', 'stiff-leg'], muscle: 'Hamstrings' },
  { keywords: ['hip thrust', 'glute', 'bridge', 'kickback', 'abduct'], muscle: 'Glutes' },
  { keywords: ['calf raise', 'calf press', 'calves', 'seated calf', 'standing calf'], muscle: 'Calves' },
  { keywords: ['curl', 'bicep', 'hammer', 'preacher', 'concentration'], muscle: 'Biceps' },
  { keywords: ['tricep', 'skull crush', 'skullcrusher', 'close grip', 'close-grip', 'pushdown', 'push down', 'overhead ext', 'kickback'], muscle: 'Triceps' },
  { keywords: ['crunch', 'sit-up', 'situp', 'sit up', 'plank', 'ab ', 'abs', 'rollout', 'leg raise', 'woodchop', 'pallof', 'core', 'oblique', 'twist'], muscle: 'Core' },
  { keywords: ['deadlift', 'clean', 'snatch', 'thruster', 'burpee', 'turkish'], muscle: 'Full Body' },
];

const EQUIPMENT_KEYWORDS: Array<{ keywords: string[]; equipment: Equipment; priority: number }> = [
  { keywords: ['dumbbell', 'db ', 'db-', 'dumbell'], equipment: 'Dumbbell', priority: 10 },
  { keywords: ['cable', 'pulley'], equipment: 'Cable', priority: 10 },
  { keywords: ['smith'], equipment: 'Smith Machine', priority: 10 },
  { keywords: ['kettlebell', 'kb '], equipment: 'Kettlebell', priority: 10 },
  { keywords: ['band', 'resistance band'], equipment: 'Resistance Band', priority: 10 },
  { keywords: ['barbell', 'bar '], equipment: 'Barbell', priority: 8 },
  { keywords: ['machine', 'hack squat', 'leg press', 'pec deck', 'chest press machine'], equipment: 'Machine (pin/stack)', priority: 6 },
  { keywords: ['bench press', 'squat', 'deadlift', 'ohp', 'military press', 'clean', 'snatch', 'ez bar', 'ez-bar'], equipment: 'Barbell', priority: 5 },
  { keywords: ['bodyweight', 'push-up', 'pushup', 'push up', 'pull-up', 'pullup', 'pull up', 'chin-up', 'chinup', 'plank', 'crunch', 'burpee'], equipment: 'None', priority: 4 },
  { keywords: ['dip'], equipment: 'None', priority: 2 },
];

const COMPOUND_KEYWORDS = ['press', 'squat', 'deadlift', 'row', 'pull-up', 'pullup', 'chin-up', 'chinup', 'clean', 'snatch', 'thruster', 'lunge', 'dip', 'hip thrust'];
const ISOLATION_KEYWORDS = ['curl', 'raise', 'fly', 'flye', 'extension', 'ext', 'kickback', 'pulldown', 'pushdown', 'cross', 'crunch', 'twist'];
const BODYWEIGHT_KEYWORDS = ['push-up', 'pushup', 'pull-up', 'pullup', 'chin-up', 'chinup', 'plank', 'burpee', 'dip', 'crunch', 'sit-up', 'situp'];

// ── Engine ────────────────────────────────────────────────────────────────────

/**
 * Generate auto-tag suggestions from an exercise name.
 * Returns null for each field it can't confidently determine.
 */
export function suggestTags(name: string): AutoTagSuggestion {
  if (!name || name.trim().length < 2) {
    return { muscle: null, equipment: null, type: null };
  }

  const lower = name.toLowerCase().trim();

  // Resolve conflicts: "dip" could be Chest (weighted dip) or Triceps (tricep dip)
  // We use the most specific match by checking longer keywords first
  let muscle: MuscleGroup | null = null;
  let bestMuscleLen = 0;
  for (const entry of MUSCLE_KEYWORDS) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw) && kw.length > bestMuscleLen) {
        muscle = entry.muscle;
        bestMuscleLen = kw.length;
      }
    }
  }

  let equipment: Equipment | null = null;
  let bestEquipPriority = 0;
  for (const entry of EQUIPMENT_KEYWORDS) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw) && entry.priority > bestEquipPriority) {
        equipment = entry.equipment;
        bestEquipPriority = entry.priority;
      }
    }
  }

  // Smith Machine is a more specific match than generic Machine
  if (lower.includes('smith')) {
    equipment = 'Smith Machine';
  }

  // "Weighted" prefix implies external load — override bodyweight detection
  const hasWeightedPrefix = lower.startsWith('weighted') || lower.includes('weighted ');

  let type: ExerciseType | null = null;
  if (!hasWeightedPrefix && BODYWEIGHT_KEYWORDS.some(kw => lower.includes(kw)) && (!equipment || equipment === 'None')) {
    type = 'bodyweight';
  } else if (COMPOUND_KEYWORDS.some(kw => lower.includes(kw))) {
    type = 'compound';
  } else if (ISOLATION_KEYWORDS.some(kw => lower.includes(kw))) {
    type = 'isolation';
  }

  return { muscle, equipment, type };
}
