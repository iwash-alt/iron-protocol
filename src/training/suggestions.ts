/**
 * Mid-Workout Suggestion Engine
 *
 * Evaluates training signals after each set and generates contextual
 * suggestions. Displayed as dismissable toasts in the workout UI.
 *
 * Signals monitored:
 *   - RPE >= 9 on 2+ consecutive sets → suggest weight reduction
 *   - RPE <= 6 on 2+ sets → suggest weight increase
 *   - RPE jumped +2 from last session → recovery warning
 *   - Fatigue score > 60 → suggest dropping last sets
 */

import type { SetLog, PlanExercise, RPEValue, ExerciseHistory } from '@/shared/types';
import type { FatigueResult } from './fatigue';

// ── Types ───────────────────────────────────────────────────────────────────

export type SuggestionType = 'reduce_weight' | 'increase_weight' | 'recovery_warning' | 'fatigue_warning';
export type SuggestionPriority = 'info' | 'warning' | 'alert';

export interface WorkoutSuggestion {
  /** Unique ID for deduplication and tracking */
  id: string;
  /** Category of suggestion */
  type: SuggestionType;
  /** Display priority (drives color/icon) */
  priority: SuggestionPriority;
  /** Short message shown in the toast */
  message: string;
  /** The exercise this suggestion relates to */
  exerciseName: string;
  /** Timestamp when generated */
  timestamp: number;
}

export interface SuggestionEvent {
  /** The suggestion shown */
  suggestion: WorkoutSuggestion;
  /** How the user responded */
  outcome: 'accepted' | 'dismissed';
  /** When the user responded */
  respondedAt: number;
}

// ── Engine ───────────────────────────────────────────────────────────────────

/**
 * Evaluate the current workout state and return any new suggestions.
 *
 * Called after each set completion. Returns suggestions not yet shown
 * (caller should deduplicate by id).
 *
 * @param currentSets     Sets completed in this session so far
 * @param exercise        The exercise that was just completed
 * @param rpe             RPE of the set just completed
 * @param exerciseHistory Historical data for per-exercise RPE comparison
 * @param fatigue         Current fatigue result (if available)
 */
export function evaluateSuggestions(
  currentSets: SetLog[],
  exercise: PlanExercise,
  rpe: RPEValue,
  exerciseHistory: ExerciseHistory,
  fatigue: FatigueResult | null,
): WorkoutSuggestion[] {
  const suggestions: WorkoutSuggestion[] = [];
  const name = exercise.exercise.name;
  const now = Date.now();

  // Filter sets for this exercise in current session
  const exerciseSets = currentSets.filter(s => s.exerciseName === name);

  // ── 1. High RPE on consecutive sets → reduce weight ────────────────────
  if (exerciseSets.length >= 2) {
    const lastTwo = exerciseSets.slice(-2);
    if (lastTwo.every(s => s.rpe >= 9)) {
      suggestions.push({
        id: `reduce-${name}-${now}`,
        type: 'reduce_weight',
        priority: 'warning',
        message: `RPE climbing on ${name}. Consider dropping ${exercise.progressionKg}kg.`,
        exerciseName: name,
        timestamp: now,
      });
    }
  }

  // ── 2. Low RPE on 2+ sets → increase weight ───────────────────────────
  if (exerciseSets.length >= 2) {
    const lastTwo = exerciseSets.slice(-2);
    if (lastTwo.every(s => s.rpe <= 6)) {
      suggestions.push({
        id: `increase-${name}-${now}`,
        type: 'increase_weight',
        priority: 'info',
        message: `Feeling strong? Consider adding ${exercise.progressionKg}kg to ${name}.`,
        exerciseName: name,
        timestamp: now,
      });
    }
  }

  // ── 3. RPE jump from last session → recovery check ────────────────────
  const history = exerciseHistory[name];
  if (history && history.length > 0 && exerciseSets.length === 1) {
    // Compare current first-set RPE against last session's average RPE
    // We only have weight/reps in history, not RPE directly.
    // Use weight comparison as proxy: same weight but fewer reps = harder.
    const lastEntry = history[history.length - 1];
    if (
      exercise.weightKg === lastEntry.weightKg &&
      rpe >= 9 &&
      lastEntry.reps >= exercise.reps + 2
    ) {
      suggestions.push({
        id: `recovery-${name}-${now}`,
        type: 'recovery_warning',
        priority: 'alert',
        message: `${name} feels harder than last session. Check your recovery.`,
        exerciseName: name,
        timestamp: now,
      });
    }
  }

  // ── 4. High fatigue score → suggest dropping sets ─────────────────────
  if (fatigue && fatigue.score > 60 && exerciseSets.length === 1) {
    suggestions.push({
      id: `fatigue-${name}-${now}`,
      type: 'fatigue_warning',
      priority: fatigue.score > 80 ? 'alert' : 'warning',
      message: fatigue.score > 80
        ? 'Fatigue is high. Consider skipping remaining exercises.'
        : 'Fatigue is elevated. Consider dropping your last set on remaining exercises.',
      exerciseName: name,
      timestamp: now,
    });
  }

  return suggestions;
}
