import { useState, useEffect, useRef, useCallback } from 'react';
import { playRestComplete } from '@/shared/utils';
import type { RPEValue, PlanExercise } from '@/shared/types';

export function useTimer(onComplete?: () => void) {
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [label, setLabel] = useState<string | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    if (seconds <= 0) {
      if (activeRef.current) {
        activeRef.current = false;
        setLabel(null);
        playRestComplete();
        onComplete?.();
      }
      return;
    }

    activeRef.current = true;
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, onComplete]);

  const start = useCallback((duration: number, timerLabel?: string) => {
    setSeconds(duration);
    setTotalSeconds(duration);
    setLabel(timerLabel ?? null);
  }, []);

  const skip = useCallback(() => {
    activeRef.current = false;
    setSeconds(0);
    setTotalSeconds(0);
    setLabel(null);
  }, []);

  return { seconds, totalSeconds, start, skip, isActive: seconds > 0, label };
}

// ── Adaptive Rest Timer ─────────────────────────────────────────────────────
//
// Adjusts rest time based on exercise type and RPE.
//
// Base times:
//   Compound (Squat/Bench/Deadlift/OHP): 180s
//   Accessories (weighted, non-compound):  90s
//   Bodyweight:                             60s
//
// RPE multipliers:
//   RPE 6–7: 0.75x (fresh, keep moving)
//   RPE 8:   1.0x  (standard)
//   RPE 9:   1.25x (need more recovery)
//   RPE 10:  1.5x  (muscular failure)

const COMPOUND_EXERCISES = [
  'squat', 'bench press', 'deadlift', 'overhead press',
  'barbell row', 'romanian deadlift', 'leg press',
];

/** Get the RPE-based multiplier for rest duration. */
function rpeMultiplier(rpe: RPEValue): number {
  if (rpe <= 7) return 0.75;
  if (rpe === 8) return 1.0;
  if (rpe === 9) return 1.25;
  return 1.5; // RPE 10
}

/** Check if an exercise is a compound movement. */
function isCompound(exerciseName: string): boolean {
  const lower = exerciseName.toLowerCase();
  return COMPOUND_EXERCISES.some(c => lower.includes(c));
}

/** Get the base rest duration for an exercise type. */
function baseRestSeconds(exercise: PlanExercise): number {
  if (exercise.exercise.isBodyweight) return 60;
  if (isCompound(exercise.exercise.name)) return 180;
  return 90;
}

/**
 * Calculate adaptive rest duration based on exercise type and RPE.
 *
 * @returns Object with adjusted seconds and a display label.
 */
export function getAdaptiveRest(
  exercise: PlanExercise,
  rpe: RPEValue,
): { seconds: number; label: string } {
  const base = baseRestSeconds(exercise);
  const mult = rpeMultiplier(rpe);
  const adjusted = Math.round(base * mult);

  const mins = Math.floor(adjusted / 60);
  const secs = adjusted % 60;
  const timeStr = secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${mins}:00`;

  return {
    seconds: adjusted,
    label: `Rest: ${timeStr} (RPE adjusted)`,
  };
}
