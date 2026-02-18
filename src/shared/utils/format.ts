/**
 * Volume formatting and breakdown utilities.
 *
 * Centralizes all volume display logic so every screen
 * shows consistent, comma-separated numbers with context.
 */

import type { SetLog } from '@/shared/types';

// ── Volume formatting ────────────────────────────────────────────────────────

interface FormatVolumeOpts {
  /** Use abbreviated tonnes for >= 1000 (e.g. "14.2t") */
  abbreviated?: boolean;
}

/**
 * Format a volume number for display with comma separators.
 *
 * Default mode:  14200 → "14,200kg"
 * Abbreviated:   14200 → "14.2t"  (only for >= 1000)
 */
export function formatVolume(volumeKg: number, opts?: FormatVolumeOpts): string {
  const rounded = Math.round(volumeKg);
  if (opts?.abbreviated && rounded >= 1000) {
    return `${(rounded / 1000).toFixed(1)}t`;
  }
  return `${rounded.toLocaleString('en-US')}kg`;
}

/**
 * Format a signed volume delta with +/- prefix.
 * e.g. 1400 → "+1,400kg", -200 → "-200kg"
 */
export function formatVolumeDelta(deltaKg: number): string {
  const rounded = Math.round(deltaKg);
  const sign = rounded >= 0 ? '+' : '';
  return `${sign}${rounded.toLocaleString('en-US')}kg`;
}

/**
 * Format a percentage change with sign.
 * e.g. 11 → "+11%", -5 → "-5%"
 */
export function formatPctChange(pct: number): string {
  const rounded = Math.round(pct);
  const sign = rounded >= 0 ? '+' : '';
  return `${sign}${rounded}%`;
}

// ── Muscle volume breakdown ──────────────────────────────────────────────────

export interface MuscleVolumeEntry {
  muscle: string;
  volumeKg: number;
  /** Percentage of total volume (0–100, rounded) */
  pct: number;
}

/**
 * Compute per-muscle-group volume breakdown from a list of SetLogs.
 *
 * @param sets         Array of logged sets
 * @param lookupMuscle Callback to resolve exercise name → muscle group string.
 *                     Callers typically pass `(name) => findExerciseByName(name)?.muscle ?? 'Other'`.
 * @returns            Array sorted by volume descending
 */
export function computeMuscleVolumeBreakdown(
  sets: SetLog[],
  lookupMuscle: (exerciseName: string) => string,
): MuscleVolumeEntry[] {
  if (sets.length === 0) return [];

  const volumeByMuscle: Record<string, number> = {};
  let total = 0;

  for (const s of sets) {
    const vol = s.weightKg * s.reps;
    const muscle = lookupMuscle(s.exerciseName);
    volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + vol;
    total += vol;
  }

  if (total === 0) return [];

  return Object.entries(volumeByMuscle)
    .map(([muscle, volumeKg]) => ({
      muscle,
      volumeKg,
      pct: Math.round((volumeKg / total) * 100),
    }))
    .sort((a, b) => b.volumeKg - a.volumeKg);
}
