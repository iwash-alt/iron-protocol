/**
 * Weekly Insights Generator
 *
 * Generates a weekly training summary from workout history.
 * Runs after 4+ sessions or at the end of each week.
 *
 * Metrics:
 *   - Volume comparison vs 4-week rolling average
 *   - RPE trend across the week
 *   - Muscle group balance (which groups were undertrained)
 *   - Consistency (sessions completed / planned)
 *   - Fatigue trend with data points
 *   - Top PR of the week
 *   - Actionable recommendation
 */

import type { WorkoutLog, PersonalRecords, ExerciseHistory } from '@/shared/types';
import { calculateFatigueScore } from '@/training/fatigue';
import type { FatigueResult } from '@/training/fatigue';

// ── Types ───────────────────────────────────────────────────────────────────

export interface MuscleBalance {
  /** Muscle group name */
  muscle: string;
  /** Number of sets targeting this group this week */
  sets: number;
  /** Status relative to a balanced program */
  status: 'undertrained' | 'balanced' | 'overtrained';
}

export interface WeeklyInsight {
  /** ISO date string for the week start (Monday) */
  weekOf: string;

  /** Total volume this week (kg) */
  volumeThisWeek: number;
  /** 4-week rolling average volume (kg) */
  volumeAverage: number;
  /** Volume change percentage vs average */
  volumeChangePct: number;

  /** Average RPE this week */
  avgRPE: number;
  /** RPE trend label */
  rpeTrend: 'easier' | 'consistent' | 'harder';

  /** Per-muscle-group set counts and balance */
  muscleBalance: MuscleBalance[];

  /** Sessions completed this week */
  sessionsCompleted: number;
  /** Sessions planned (from profile) */
  sessionsPlanned: number;
  /** Consistency percentage */
  consistencyPct: number;

  /** Fatigue data points (one per session, for sparkline) */
  fatigueDataPoints: number[];
  /** Current fatigue result */
  currentFatigue: FatigueResult;

  /** Top PR of the week (if any) */
  topPR: { exercise: string; weight: number } | null;

  /** One-line actionable recommendation */
  recommendation: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Get the Monday of the week containing a date. */
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

/** Group workouts by ISO week start date. */
function groupByWeek(history: WorkoutLog[]): Map<string, WorkoutLog[]> {
  const groups = new Map<string, WorkoutLog[]>();
  for (const w of history) {
    const weekStart = getWeekStart(new Date(w.date));
    const existing = groups.get(weekStart) ?? [];
    existing.push(w);
    groups.set(weekStart, existing);
  }
  return groups;
}

/** Infer muscle group from exercise name (best-effort from set logs). */
function inferMuscle(exerciseName: string): string {
  const lower = exerciseName.toLowerCase();
  if (lower.includes('squat') || lower.includes('leg press') || lower.includes('lunge')) return 'Quads';
  if (lower.includes('deadlift') || lower.includes('row') || lower.includes('pull')) return 'Back';
  if (lower.includes('bench') || lower.includes('push up') || lower.includes('chest')) return 'Chest';
  if (lower.includes('overhead') || lower.includes('shoulder') || lower.includes('lateral') || lower.includes('pike')) return 'Shoulders';
  if (lower.includes('curl') || lower.includes('bicep')) return 'Biceps';
  if (lower.includes('tricep') || lower.includes('pushdown') || lower.includes('dip')) return 'Triceps';
  if (lower.includes('romanian') || lower.includes('hamstring')) return 'Hamstrings';
  if (lower.includes('glute') || lower.includes('hip thrust')) return 'Glutes';
  if (lower.includes('calf')) return 'Calves';
  if (lower.includes('plank') || lower.includes('crunch') || lower.includes('core') || lower.includes('ab')) return 'Core';
  if (lower.includes('lat') || lower.includes('pulldown')) return 'Lats';
  if (lower.includes('face pull') || lower.includes('rear delt')) return 'Rear Delts';
  return 'Other';
}

// ── Main generator ──────────────────────────────────────────────────────────

/**
 * Generate weekly insights from workout history.
 *
 * @param history       Full workout history
 * @param personalRecords Current PR map
 * @param exerciseHistory Per-exercise history
 * @param plannedSessions Sessions/week from user profile (3 or 4)
 * @param now           Reference date
 */
export function generateWeeklyInsights(
  history: WorkoutLog[],
  personalRecords: PersonalRecords,
  exerciseHistory: ExerciseHistory,
  plannedSessions: number,
  now: Date = new Date(),
): WeeklyInsight | null {
  const weekStart = getWeekStart(now);
  const grouped = groupByWeek(history);
  const thisWeek = grouped.get(weekStart) ?? [];

  if (thisWeek.length < 1) return null;

  // ── Volume comparison ─────────────────────────────────────────────────
  const volumeThisWeek = thisWeek.reduce((s, w) => s + w.totalVolumeKg, 0);

  // 4-week rolling average (excluding this week)
  const weeks = [...grouped.entries()]
    .filter(([k]) => k !== weekStart)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 4);

  const prevVolumes = weeks.map(([, wks]) =>
    wks.reduce((s, w) => s + w.totalVolumeKg, 0)
  );
  const volumeAverage = prevVolumes.length
    ? prevVolumes.reduce((a, b) => a + b, 0) / prevVolumes.length
    : volumeThisWeek;

  const volumeChangePct = volumeAverage > 0
    ? Math.round(((volumeThisWeek - volumeAverage) / volumeAverage) * 100)
    : 0;

  // ── RPE trend ─────────────────────────────────────────────────────────
  const allSets = thisWeek.flatMap(w => w.sets);
  const avgRPE = allSets.length
    ? allSets.reduce((s, set) => s + set.rpe, 0) / allSets.length
    : 0;

  const prevWeekSets = weeks.length > 0
    ? weeks[0][1].flatMap(w => w.sets)
    : [];
  const prevAvgRPE = prevWeekSets.length
    ? prevWeekSets.reduce((s, set) => s + set.rpe, 0) / prevWeekSets.length
    : avgRPE;

  const rpeDelta = avgRPE - prevAvgRPE;
  const rpeTrend: 'easier' | 'consistent' | 'harder' =
    rpeDelta > 0.3 ? 'harder' :
    rpeDelta < -0.3 ? 'easier' :
    'consistent';

  // ── Muscle group balance ──────────────────────────────────────────────
  const muscleSetCounts: Record<string, number> = {};
  for (const set of allSets) {
    const muscle = inferMuscle(set.exerciseName);
    muscleSetCounts[muscle] = (muscleSetCounts[muscle] || 0) + 1;
  }

  const totalSets = allSets.length;
  const expectedPerGroup = totalSets > 0 ? totalSets / Math.max(Object.keys(muscleSetCounts).length, 1) : 0;

  const muscleBalance: MuscleBalance[] = Object.entries(muscleSetCounts).map(([muscle, sets]) => ({
    muscle,
    sets,
    status: sets < expectedPerGroup * 0.5
      ? 'undertrained'
      : sets > expectedPerGroup * 1.5
        ? 'overtrained'
        : 'balanced',
  }));

  // ── Consistency ───────────────────────────────────────────────────────
  const sessionsCompleted = thisWeek.length;
  const consistencyPct = Math.min(100, Math.round((sessionsCompleted / plannedSessions) * 100));

  // ── Fatigue data points ───────────────────────────────────────────────
  // Compute cumulative fatigue after each session this week.
  const fatigueDataPoints: number[] = [];
  for (let i = 1; i <= thisWeek.length; i++) {
    const partialHistory = history.slice(0, history.indexOf(thisWeek[i - 1]) + 1);
    const f = calculateFatigueScore(partialHistory, exerciseHistory, new Date(thisWeek[i - 1].date));
    fatigueDataPoints.push(f.score);
  }

  const currentFatigue = calculateFatigueScore(history, exerciseHistory, now);

  // ── Top PR ────────────────────────────────────────────────────────────
  let topPR: { exercise: string; weight: number } | null = null;

  // Check exercise history for PRs achieved this week
  for (const [exName, entries] of Object.entries(exerciseHistory)) {
    const weekEntries = entries.filter(e => {
      const entryWeek = getWeekStart(new Date(e.date));
      return entryWeek === weekStart;
    });

    const prEntry = personalRecords[exName];
    const best1RM = prEntry?.bestEstimated1RM?.value ?? 0;

    for (const entry of weekEntries) {
      if (
        best1RM > 0 &&
        entry.estimated1RM >= best1RM &&
        (!topPR || entry.estimated1RM > topPR.weight)
      ) {
        topPR = { exercise: exName, weight: entry.estimated1RM };
      }
    }
  }

  // ── Recommendation ────────────────────────────────────────────────────
  let recommendation: string;

  if (currentFatigue.score > 70) {
    recommendation = 'Fatigue is high — schedule a deload or rest day soon.';
  } else if (volumeChangePct < -20) {
    recommendation = 'Volume dropped significantly. Prioritize consistency next week.';
  } else if (consistencyPct < 75) {
    recommendation = `You missed ${plannedSessions - sessionsCompleted} session(s). Try to stay on schedule.`;
  } else if (rpeTrend === 'harder') {
    recommendation = 'RPE is trending up. Consider a small weight reduction to stay sustainable.';
  } else if (topPR) {
    recommendation = `Great week — PR on ${topPR.exercise}! Keep the momentum.`;
  } else if (consistencyPct >= 100 && currentFatigue.score < 40) {
    recommendation = 'Consistent training and low fatigue. You\'re in a great spot.';
  } else {
    recommendation = 'Solid week. Stay the course and keep showing up.';
  }

  return {
    weekOf: weekStart,
    volumeThisWeek,
    volumeAverage: Math.round(volumeAverage),
    volumeChangePct,
    avgRPE: Math.round(avgRPE * 10) / 10,
    rpeTrend,
    muscleBalance,
    sessionsCompleted,
    sessionsPlanned: plannedSessions,
    consistencyPct,
    fatigueDataPoints,
    currentFatigue,
    topPR,
    recommendation,
  };
}
