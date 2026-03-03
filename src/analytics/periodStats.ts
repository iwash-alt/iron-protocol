/**
 * Period-based analytics for the Dashboard.
 * Pure functions — no React, no localStorage, easy to test.
 */

import type { WorkoutLog, PersonalRecords, ExerciseHistory } from '@/shared/types';
import { calculate1RM } from '@/shared/utils';
import { findExerciseByName } from '@/data/exercises';
import { MUSCLE_FILTER_MAP } from '@/shared/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DashboardPeriod = 'week' | 'month' | 'quarter' | 'year';

export interface PeriodDataPoint {
  label: string;
  volumeKg: number;
  sessions: number;
}

export interface PeriodStats {
  dataPoints: PeriodDataPoint[];
  totalVolume: number;
  totalSessions: number;
  avgRPE: number;
  newPRs: number;
  volumeChangePct: number;  // vs previous same-length period
}

export interface MuscleGroupShare {
  muscle: string;
  sets: number;
  pct: number;
  color: string;
}

export interface PRTrendPoint {
  label: string;
  [exercise: string]: string | number;
}

export interface PRTrendsResult {
  exercises: string[];
  dataPoints: PRTrendPoint[];
}

export interface RPETrendPoint {
  label: string;
  avgRPE: number;
  sessions: number;
}

// Muscle group display colors
export const MUSCLE_COLORS: Record<string, string> = {
  Chest: '#ef4444',
  Back: '#3b82f6',
  Legs: '#22c55e',
  Shoulders: '#f59e0b',
  Arms: '#a855f7',
  Core: '#06b6d4',
  Other: '#6b7280',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse a "YYYY-MM-DD" date string safely to a Date (midnight UTC). */
function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z');
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Get the Monday of the week containing `d` (UTC). */
function weekStart(d: Date): Date {
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
}

/** Get the first day of the month for `d` (UTC). */
function monthStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

// ── Period window helpers ─────────────────────────────────────────────────────

/** Returns the [start, end] dates for the current period window and bucket count. */
function periodWindow(period: DashboardPeriod, now: Date): {
  windowStart: Date;
  windowEnd: Date;
  buckets: Array<{ label: string; start: Date; end: Date }>;
} {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (period === 'week') {
    // Current Mon–Sun
    const mon = weekStart(today);
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon.getTime() + i * 86400000);
      return {
        label: SHORT_DAYS[(i + 1) % 7 === 0 ? 0 : i + 1] ?? SHORT_DAYS[i],
        start: d,
        end: new Date(d.getTime() + 86400000 - 1),
      };
    });
    // Labels: Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    buckets.forEach((b, i) => { b.label = dayNames[i] ?? b.label; });
    return { windowStart: mon, windowEnd: new Date(mon.getTime() + 7 * 86400000 - 1), buckets };
  }

  if (period === 'month') {
    // Current month — one bucket per week (up to 5)
    const ms = monthStart(today);
    const nextMonth = new Date(Date.UTC(ms.getUTCFullYear(), ms.getUTCMonth() + 1, 1));
    const buckets: Array<{ label: string; start: Date; end: Date }> = [];
    let cursor = weekStart(ms);
    // If week starts before month, move to first day of month for display
    if (cursor < ms) cursor = ms;
    let wk = 1;
    while (cursor < nextMonth) {
      const wkEnd = new Date(cursor.getTime() + 7 * 86400000 - 1);
      buckets.push({
        label: `Wk ${wk}`,
        start: cursor,
        end: wkEnd < nextMonth ? wkEnd : new Date(nextMonth.getTime() - 1),
      });
      cursor = new Date(cursor.getTime() + 7 * 86400000);
      wk++;
    }
    return { windowStart: ms, windowEnd: new Date(nextMonth.getTime() - 1), buckets };
  }

  if (period === 'quarter') {
    // Last 3 calendar months (including current)
    const buckets = Array.from({ length: 3 }, (_, i) => {
      const monthOffset = 2 - i; // 2, 1, 0 → oldest to newest
      const ms2 = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - monthOffset, 1));
      const me = new Date(Date.UTC(ms2.getUTCFullYear(), ms2.getUTCMonth() + 1, 1));
      return {
        label: SHORT_MONTHS[ms2.getUTCMonth()] ?? '',
        start: ms2,
        end: new Date(me.getTime() - 1),
      };
    });
    return {
      windowStart: buckets[0]!.start,
      windowEnd: buckets[2]!.end,
      buckets,
    };
  }

  // year — last 12 calendar months
  const buckets = Array.from({ length: 12 }, (_, i) => {
    const monthOffset = 11 - i;
    const ms2 = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - monthOffset, 1));
    const me = new Date(Date.UTC(ms2.getUTCFullYear(), ms2.getUTCMonth() + 1, 1));
    return {
      label: SHORT_MONTHS[ms2.getUTCMonth()] ?? '',
      start: ms2,
      end: new Date(me.getTime() - 1),
    };
  });
  return {
    windowStart: buckets[0]!.start,
    windowEnd: buckets[11]!.end,
    buckets,
  };
}

// ── Main export functions ─────────────────────────────────────────────────────

/**
 * Computes period-bucketed volume + session counts, plus summary stats.
 */
export function getPeriodStats(
  history: WorkoutLog[],
  period: DashboardPeriod,
  personalRecords: PersonalRecords,
  now: Date = new Date(),
): PeriodStats {
  const { windowStart, windowEnd, buckets } = periodWindow(period, now);

  // Filter workouts within the window
  const inWindow = history.filter(w => {
    const d = parseDate(w.date);
    return d >= windowStart && d <= windowEnd;
  });

  // Build buckets
  const dataPoints: PeriodDataPoint[] = buckets.map(bucket => {
    const bucketed = inWindow.filter(w => {
      const d = parseDate(w.date);
      return d >= bucket.start && d <= bucket.end;
    });
    return {
      label: bucket.label,
      volumeKg: bucketed.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0),
      sessions: bucketed.length,
    };
  });

  const totalVolume = dataPoints.reduce((s, p) => s + p.volumeKg, 0);
  const totalSessions = dataPoints.reduce((s, p) => s + p.sessions, 0);

  // Average RPE across all sets in window
  let totalRPE = 0;
  let rpeCount = 0;
  for (const w of inWindow) {
    for (const s of w.sets) {
      if (s.rpe) { totalRPE += s.rpe; rpeCount++; }
    }
  }
  const avgRPE = rpeCount > 0 ? Math.round((totalRPE / rpeCount) * 10) / 10 : 0;

  // Count PRs set within the window (by checking PR dates)
  let newPRs = 0;
  for (const pr of Object.values(personalRecords)) {
    const dates = [
      pr.heaviestWeight?.date,
      pr.bestEstimated1RM?.date,
      pr.bestSetVolume?.date,
      pr.bestSessionVolume?.date,
    ];
    const hasNew = dates.some(d => {
      if (!d) return false;
      const dt = parseDate(d);
      return dt >= windowStart && dt <= windowEnd;
    });
    if (hasNew) newPRs++;
  }

  // Volume change vs previous equal-length period
  const windowMs = windowEnd.getTime() - windowStart.getTime();
  const prevStart = new Date(windowStart.getTime() - windowMs - 86400000);
  const prevEnd = new Date(windowStart.getTime() - 1);
  const prevVol = history
    .filter(w => { const d = parseDate(w.date); return d >= prevStart && d <= prevEnd; })
    .reduce((s, w) => s + (w.totalVolumeKg || 0), 0);
  const volumeChangePct = prevVol > 0
    ? Math.round(((totalVolume - prevVol) / prevVol) * 100)
    : 0;

  return { dataPoints, totalVolume, totalSessions, avgRPE, newPRs, volumeChangePct };
}

/**
 * Returns the % of sets per curated muscle group for the given period.
 * Uses the exercise database to map exercise names → muscle group.
 */
export function getMuscleGroupDistribution(
  history: WorkoutLog[],
  period: DashboardPeriod,
  now: Date = new Date(),
): MuscleGroupShare[] {
  const { windowStart, windowEnd } = periodWindow(period, now);

  const inWindow = history.filter(w => {
    const d = parseDate(w.date);
    return d >= windowStart && d <= windowEnd;
  });

  // Map raw muscle → curated filter group
  function toCurated(raw: string): string {
    for (const [group, muscles] of Object.entries(MUSCLE_FILTER_MAP)) {
      if ((muscles as readonly string[]).includes(raw)) return group;
    }
    return 'Other';
  }

  const setCounts: Record<string, number> = {};
  let totalSets = 0;

  for (const workout of inWindow) {
    for (const set of workout.sets) {
      const ex = findExerciseByName(set.exerciseName);
      const group = ex ? toCurated(ex.muscle) : 'Other';
      setCounts[group] = (setCounts[group] ?? 0) + 1;
      totalSets++;
    }
  }

  if (totalSets === 0) return [];

  return Object.entries(setCounts)
    .map(([muscle, sets]) => ({
      muscle,
      sets,
      pct: Math.round((sets / totalSets) * 100),
      color: MUSCLE_COLORS[muscle] ?? MUSCLE_COLORS['Other'] ?? '#6b7280',
    }))
    .sort((a, b) => b.sets - a.sets);
}

/**
 * Computes per-exercise estimated 1RM trends over period buckets.
 * Selects top N exercises by highest recent 1RM.
 */
export function getPRTrends(
  exerciseHistory: ExerciseHistory,
  period: DashboardPeriod,
  topN: number = 3,
  now: Date = new Date(),
): PRTrendsResult {
  const { buckets } = periodWindow(period, now);
  const entries = Object.entries(exerciseHistory);

  if (entries.length === 0) return { exercises: [], dataPoints: [] };

  // Find top N exercises by their best 1RM across all history
  const exerciseBest = entries.map(([name, hist]) => {
    const best = hist.reduce((max, e) => Math.max(max, e.estimated1RM || calculate1RM(e.weightKg, e.reps)), 0);
    return { name, best };
  });
  exerciseBest.sort((a, b) => b.best - a.best);
  const topExercises = exerciseBest.slice(0, topN).map(e => e.name);

  // Build data points: for each bucket, find best 1RM per exercise
  const dataPoints: PRTrendPoint[] = buckets.map(bucket => {
    const point: PRTrendPoint = { label: bucket.label };
    for (const exName of topExercises) {
      const hist = exerciseHistory[exName] ?? [];
      const inBucket = hist.filter(h => {
        const d = parseDate(h.date);
        return d >= bucket.start && d <= bucket.end;
      });
      const best1RM = inBucket.reduce(
        (max, e) => Math.max(max, e.estimated1RM || calculate1RM(e.weightKg, e.reps)),
        0,
      );
      point[exName] = best1RM;
    }
    return point;
  });

  return { exercises: topExercises, dataPoints };
}

/**
 * Returns average RPE per period bucket for recovery/intensity trend.
 */
export function getAvgRPETrend(
  history: WorkoutLog[],
  period: DashboardPeriod,
  now: Date = new Date(),
): RPETrendPoint[] {
  const { windowStart, windowEnd, buckets } = periodWindow(period, now);

  const inWindow = history.filter(w => {
    const d = parseDate(w.date);
    return d >= windowStart && d <= windowEnd;
  });

  return buckets.map(bucket => {
    const bucketed = inWindow.filter(w => {
      const d = parseDate(w.date);
      return d >= bucket.start && d <= bucket.end;
    });

    let totalRPE = 0;
    let rpeCount = 0;
    for (const w of bucketed) {
      for (const s of w.sets) {
        if (s.rpe) { totalRPE += s.rpe; rpeCount++; }
      }
    }

    return {
      label: bucket.label,
      avgRPE: rpeCount > 0 ? Math.round((totalRPE / rpeCount) * 10) / 10 : 0,
      sessions: bucketed.length,
    };
  });
}
