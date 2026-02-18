/**
 * Fatigue Score Engine
 *
 * Calculates a rolling fatigue score (0–100) from the last 7–14 days
 * of workout data. No wearable required — uses training signals only.
 *
 * Weighted factors:
 *   RPE trend        35% — rising average RPE is the #1 fatigue signal
 *   Volume drop      20% — doing less work than usual
 *   Incomplete       15% — ending workouts early
 *   High frequency   15% — not enough rest days
 *   Failed sets      15% — RPE 10 = muscular failure
 */

import type { WorkoutLog, ExerciseHistory } from '@/shared/types';
import { formatVolume } from '@/shared/utils';

// ── Result types ────────────────────────────────────────────────────────────

export interface FatigueFactor {
  /** Human-readable factor name */
  name: string;
  /** Contribution to total score (0–100 scaled by weight) */
  contribution: number;
  /** Explanation for the user */
  detail: string;
}

export type FatigueTrend = 'rising' | 'stable' | 'falling';
export type SuggestedAction = 'normal' | 'lighter' | 'deload' | 'rest';

export interface FatigueResult {
  /** Overall fatigue score 0–100 */
  score: number;
  /** Is fatigue trending up, down, or flat? */
  trend: FatigueTrend;
  /** Breakdown of contributing factors */
  factors: FatigueFactor[];
  /** One-line recommendation for the user */
  recommendation: string;
  /** Actionable suggestion for training today */
  suggestedAction: SuggestedAction;
}

// ── Weights ─────────────────────────────────────────────────────────────────

const W_RPE_TREND = 0.35;
const W_VOLUME_DROP = 0.20;
const W_INCOMPLETE = 0.15;
const W_FREQUENCY = 0.15;
const W_FAILED_SETS = 0.15;

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Get workouts within the last N days from a reference date. */
function workoutsInWindow(history: WorkoutLog[], days: number, now: Date): WorkoutLog[] {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return history.filter(w => w.date >= cutoffStr);
}

/** Average RPE across all sets in a workout. */
function avgRPE(workout: WorkoutLog): number {
  if (!workout.sets.length) return 0;
  return workout.sets.reduce((sum, s) => sum + s.rpe, 0) / workout.sets.length;
}

/** Simple linear regression slope for a numeric series. */
function slope(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

/** Clamp a value to 0–100. */
function clamp100(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/** Count unique dates in a workout array. */
function uniqueDates(workouts: WorkoutLog[]): string[] {
  return [...new Set(workouts.map(w => w.date))];
}

// ── Main calculator ─────────────────────────────────────────────────────────

/**
 * Calculate the fatigue score from workout history.
 *
 * @param history    Full workout history (will be windowed internally)
 * @param _exercises Exercise history (reserved for future per-exercise analysis)
 * @param now        Reference date (defaults to today)
 */
export function calculateFatigueScore(
  history: WorkoutLog[],
  _exercises?: ExerciseHistory,
  now: Date = new Date(),
): FatigueResult {
  const recent = workoutsInWindow(history, 14, now);
  const lastWeek = workoutsInWindow(history, 7, now);

  // Not enough data — can't assess fatigue
  if (recent.length < 2) {
    return {
      score: 0,
      trend: 'stable',
      factors: [],
      recommendation: 'Train a few more sessions to unlock fatigue tracking.',
      suggestedAction: 'normal',
    };
  }

  const factors: FatigueFactor[] = [];

  // ── 1. RPE Trend (35%) ──────────────────────────────────────────────────
  const rpeValues = recent.map(avgRPE);
  const rpeSlope = slope(rpeValues);
  const avgOverall = rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length;

  // Normalize: slope > 0 means RPE is rising (bad). 0.5/session = very fatigued.
  // Also factor in absolute RPE level: avg > 8.5 is concerning regardless of slope.
  const slopeScore = clamp100(rpeSlope * 200); // 0.5 slope → 100
  const absoluteScore = clamp100((avgOverall - 7) * 33); // RPE 7=0, 10=100
  const rpeScore = clamp100(slopeScore * 0.6 + absoluteScore * 0.4);

  factors.push({
    name: 'RPE Trend',
    contribution: Math.round(rpeScore * W_RPE_TREND),
    detail: rpeSlope > 0.1
      ? `Average RPE rising (${avgOverall.toFixed(1)} avg, +${rpeSlope.toFixed(2)}/session)`
      : `Average RPE ${avgOverall.toFixed(1)} — ${avgOverall > 8.5 ? 'consistently high' : 'stable'}`,
  });

  // ── 2. Volume Drop (20%) ────────────────────────────────────────────────
  const prevWeek = workoutsInWindow(history, 14, now)
    .filter(w => {
      const cutoff7 = new Date(now);
      cutoff7.setDate(cutoff7.getDate() - 7);
      return w.date < cutoff7.toISOString().split('T')[0];
    });

  const thisWeekVol = lastWeek.reduce((s, w) => s + w.totalVolumeKg, 0);
  const prevWeekVol = prevWeek.reduce((s, w) => s + w.totalVolumeKg, 0);

  let volumeScore = 0;
  if (prevWeekVol > 0) {
    const dropPct = ((prevWeekVol - thisWeekVol) / prevWeekVol) * 100;
    // Volume dropping > 30% suggests involuntary reduction (fatigue).
    // Volume increasing is fine (score = 0).
    volumeScore = clamp100(Math.max(0, dropPct) * 3);
  }

  factors.push({
    name: 'Volume Drop',
    contribution: Math.round(volumeScore * W_VOLUME_DROP),
    detail: prevWeekVol > 0
      ? `This week: ${formatVolume(thisWeekVol)} vs prev: ${formatVolume(prevWeekVol)}`
      : 'Not enough history for comparison',
  });

  // ── 3. Incomplete Workouts (15%) ────────────────────────────────────────
  const completionRates = lastWeek.map(w => w.completionPercent);
  const avgCompletion = completionRates.length
    ? completionRates.reduce((a, b) => a + b, 0) / completionRates.length
    : 100;

  // Finishing < 70% of workouts is a strong fatigue signal.
  const incompleteScore = clamp100((100 - avgCompletion) * 2.5);

  factors.push({
    name: 'Incomplete Workouts',
    contribution: Math.round(incompleteScore * W_INCOMPLETE),
    detail: `Average completion: ${avgCompletion.toFixed(0)}% this week`,
  });

  // ── 4. Training Frequency (15%) ─────────────────────────────────────────
  const dates = uniqueDates(lastWeek);
  const sessionCount = dates.length;

  // Check for consecutive training days (no rest).
  let consecutiveDays = 0;
  const sortedDates = dates.sort();
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) consecutiveDays++;
  }

  // 6+ sessions/week or 3+ consecutive days is high frequency.
  const freqScore = clamp100(
    Math.max(0, (sessionCount - 4) * 25) + consecutiveDays * 20
  );

  factors.push({
    name: 'Training Frequency',
    contribution: Math.round(freqScore * W_FREQUENCY),
    detail: `${sessionCount} sessions, ${consecutiveDays} consecutive days this week`,
  });

  // ── 5. Failed Sets (15%) ────────────────────────────────────────────────
  const totalSets = lastWeek.reduce((s, w) => s + w.sets.length, 0);
  const failedSets = lastWeek.reduce(
    (s, w) => s + w.sets.filter(set => set.rpe === 10).length,
    0,
  );

  // >20% failure rate is alarming. Any failure is a signal.
  const failRate = totalSets > 0 ? (failedSets / totalSets) * 100 : 0;
  const failScore = clamp100(failRate * 5 + failedSets * 8);

  factors.push({
    name: 'Failed Sets',
    contribution: Math.round(failScore * W_FAILED_SETS),
    detail: failedSets > 0
      ? `${failedSets} sets at RPE 10 (${failRate.toFixed(0)}% of total)`
      : 'No failed sets — good',
  });

  // ── Aggregate ─────────────────────────────────────────────────────────────
  const score = Math.round(
    rpeScore * W_RPE_TREND +
    volumeScore * W_VOLUME_DROP +
    incompleteScore * W_INCOMPLETE +
    freqScore * W_FREQUENCY +
    failScore * W_FAILED_SETS,
  );

  // ── Trend ─────────────────────────────────────────────────────────────────
  // Compare first-half vs second-half RPE of the 14-day window.
  const half = Math.floor(recent.length / 2);
  const firstHalf = recent.slice(0, half).map(avgRPE);
  const secondHalf = recent.slice(half).map(avgRPE);
  const avgFirst = firstHalf.length ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
  const avgSecond = secondHalf.length ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
  const trendDelta = avgSecond - avgFirst;

  const trend: FatigueTrend =
    trendDelta > 0.3 ? 'rising' :
    trendDelta < -0.3 ? 'falling' :
    'stable';

  // ── Recommendation ────────────────────────────────────────────────────────
  let recommendation: string;
  let suggestedAction: SuggestedAction;

  if (score <= 30) {
    recommendation = 'You\'re fresh. Train as programmed.';
    suggestedAction = 'normal';
  } else if (score <= 50) {
    recommendation = 'Moderate fatigue. Monitor RPE closely today.';
    suggestedAction = 'normal';
  } else if (score <= 70) {
    recommendation = 'Fatigue is elevated. Consider reducing volume 10–20%.';
    suggestedAction = 'lighter';
  } else if (score <= 85) {
    recommendation = 'High fatigue detected. Strongly consider a deload or lighter session.';
    suggestedAction = 'deload';
  } else {
    recommendation = 'Critical fatigue. Take a rest day — your body needs recovery.';
    suggestedAction = 'rest';
  }

  return { score, trend, factors, recommendation, suggestedAction };
}
