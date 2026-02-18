/**
 * WorkoutSummary — shown after a workout ends, before returning to home.
 *
 * Displays duration, completion, per-exercise breakdown, and total stats.
 */

import React from 'react';
import type { PlanExercise, SetLog, WorkoutLog } from '@/shared/types';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { useProfilePhoto } from '@/features/photos/ProfilePhotoContext';
import { formatVolume, formatVolumeDelta, formatPctChange, computeMuscleVolumeBreakdown } from '@/shared/utils';
import type { MuscleVolumeEntry } from '@/shared/utils';
import { findExerciseByName } from '@/data/exercises';

export interface WorkoutSummaryData {
  dayName: string;
  date: string;
  durationSeconds: number;
  completionPercent: number;
  endedEarly: boolean;
  exercises: ExerciseSummary[];
  totalVolumeKg: number;
  setsCompleted: number;
  setsPlanned: number;
  avgRPE: number;
  /** Volume from the previous session of the same day type */
  previousVolumeKg: number | null;
  /** Label for comparison, e.g. "last Push Day" */
  previousDayLabel: string | null;
  /** Raw set logs for muscle breakdown computation */
  sets: SetLog[];
}

interface ExerciseSummary {
  name: string;
  setsCompleted: number;
  setsPlanned: number;
  weightKg: number;
  reps: number;
  avgRPE: number;
  isIncomplete: boolean;
}

interface Props {
  summary: WorkoutSummaryData;
  onDone: () => void;
}

/**
 * Build summary data from current workout state.
 * Call this BEFORE endWorkout() dispatches RESET.
 */
export function buildWorkoutSummary(
  dayName: string,
  dayExercises: PlanExercise[],
  completedSets: Record<string, number>,
  currentLog: SetLog[],
  startedAt: number | null,
  completionPercent: number,
  workoutHistory: WorkoutLog[],
): WorkoutSummaryData {
  const now = Date.now();
  const durationSeconds = startedAt ? Math.round((now - startedAt) / 1000) : 0;

  const exercises: ExerciseSummary[] = dayExercises.map(pe => {
    const done = completedSets[pe.id] || 0;
    const exerciseSets = currentLog.filter(s => s.exerciseName === pe.exercise.name);
    const avgRPE = exerciseSets.length
      ? exerciseSets.reduce((sum, s) => sum + s.rpe, 0) / exerciseSets.length
      : 0;

    return {
      name: pe.exercise.name,
      setsCompleted: done,
      setsPlanned: pe.sets,
      weightKg: pe.weightKg,
      reps: pe.reps,
      avgRPE: Math.round(avgRPE * 10) / 10,
      isIncomplete: done < pe.sets,
    };
  });

  const totalVolumeKg = currentLog.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
  const setsCompleted = Object.values(completedSets).reduce((a, b) => a + b, 0);
  const setsPlanned = dayExercises.reduce((a, pe) => a + pe.sets, 0);
  const avgRPE = currentLog.length
    ? Math.round((currentLog.reduce((sum, s) => sum + s.rpe, 0) / currentLog.length) * 10) / 10
    : 0;

  // Find previous session with same day name for comparison
  const previousSession = workoutHistory
    .slice()
    .reverse()
    .find(w => w.dayName === dayName);

  return {
    dayName,
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    durationSeconds,
    completionPercent,
    endedEarly: completionPercent < 100,
    exercises,
    totalVolumeKg,
    setsCompleted,
    setsPlanned,
    avgRPE,
    previousVolumeKg: previousSession?.totalVolumeKg ?? null,
    previousDayLabel: previousSession ? `last ${previousSession.dayName}` : null,
    sets: currentLog,
  };
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}

export function WorkoutSummary({ summary, onDone }: Props) {
  const { photo: profilePhoto } = useProfilePhoto();

  // Compute muscle volume breakdown
  const muscleBreakdown: MuscleVolumeEntry[] = React.useMemo(() => {
    const lookupMuscle = (name: string): string =>
      findExerciseByName(name)?.muscle ?? 'Other';
    return computeMuscleVolumeBreakdown(summary.sets, lookupMuscle);
  }, [summary.sets]);

  // Volume comparison helpers
  const hasPrevious = summary.previousVolumeKg !== null && summary.previousVolumeKg > 0;
  const volumeDelta = hasPrevious ? summary.totalVolumeKg - summary.previousVolumeKg! : 0;
  const volumePct = hasPrevious
    ? Math.round((volumeDelta / summary.previousVolumeKg!) * 100)
    : 0;
  const maxVol = hasPrevious
    ? Math.max(summary.totalVolumeKg, summary.previousVolumeKg!)
    : summary.totalVolumeKg;

  return (
    <div style={ss.overlay}>
      <div style={ss.container}>
        {/* Header */}
        <div style={ss.header}>
          {profilePhoto && (
            <img
              src={profilePhoto}
              alt=""
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover' as const,
                border: `2px solid ${colors.primaryBorder}`,
                marginBottom: spacing.sm,
              }}
            />
          )}
          <div style={ss.icon}>{summary.endedEarly ? '🏁' : '🏆'}</div>
          <h2 style={ss.title}>
            {summary.endedEarly ? 'WORKOUT ENDED EARLY' : 'WORKOUT COMPLETE'}
          </h2>
          <p style={ss.subtitle}>{summary.dayName} — {summary.date}</p>
        </div>

        {/* Duration + Completion */}
        <div style={ss.topStats}>
          <div style={ss.topStat}>
            <div style={ss.topStatLabel}>DURATION</div>
            <div style={ss.topStatValue}>{formatDuration(summary.durationSeconds)}</div>
          </div>
          <div style={ss.topStatDivider} />
          <div style={ss.topStat}>
            <div style={ss.topStatLabel}>COMPLETION</div>
            <div style={{
              ...ss.topStatValue,
              color: summary.completionPercent >= 100 ? colors.success : colors.warning,
            }}>
              {summary.completionPercent}%
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div style={ss.section}>
          <div style={ss.sectionTitle}>EXERCISES</div>
          <div style={ss.exerciseList}>
            {summary.exercises.map((ex, i) => (
              <div key={i} style={{
                ...ss.exerciseRow,
                opacity: ex.setsCompleted === 0 ? 0.4 : 1,
              }}>
                <div style={ss.exerciseHeader}>
                  <span style={ss.exerciseName}>{ex.name}</span>
                  {ex.isIncomplete && ex.setsCompleted > 0 && (
                    <span style={ss.incompleteTag}>INCOMPLETE</span>
                  )}
                </div>
                <div style={ss.exerciseStats}>
                  {ex.setsCompleted > 0 ? (
                    <>
                      <span style={ss.exerciseDetail}>
                        {ex.setsCompleted}{ex.isIncomplete ? `/${ex.setsPlanned}` : ''} x {ex.weightKg}kg x {ex.reps}
                      </span>
                      <span style={ss.exerciseRPE}>RPE {ex.avgRPE}</span>
                    </>
                  ) : (
                    <span style={ss.exerciseDetail}>Skipped</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Stats */}
        <div style={ss.section}>
          <div style={ss.sectionTitle}>STATS</div>
          <div style={ss.statsGrid}>
            <div style={ss.statBox}>
              <div style={ss.statLabel}>VOLUME</div>
              <div style={ss.statValue}>
                {formatVolume(summary.totalVolumeKg)}
              </div>
              {hasPrevious && (
                <div style={{
                  fontSize: typography.sizes.xs,
                  color: volumeDelta >= 0 ? colors.success : colors.primary,
                  marginTop: 4,
                }}>
                  {formatVolumeDelta(volumeDelta)} vs {summary.previousDayLabel} ({formatPctChange(volumePct)})
                </div>
              )}
            </div>
            <div style={ss.statBox}>
              <div style={ss.statLabel}>SETS</div>
              <div style={ss.statValue}>
                {summary.setsCompleted}/{summary.setsPlanned}
              </div>
            </div>
            <div style={ss.statBox}>
              <div style={ss.statLabel}>AVG RPE</div>
              <div style={{
                ...ss.statValue,
                color: summary.avgRPE >= 9 ? colors.primary : summary.avgRPE >= 8 ? colors.warning : colors.success,
              }}>
                {summary.avgRPE || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Visual comparison bar: today vs last session */}
        {hasPrevious && (
          <div style={ss.section}>
            <div style={ss.sectionTitle}>VS LAST SESSION</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: spacing.sm }}>
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: typography.sizes.sm,
                  marginBottom: 4,
                }}>
                  <span style={{ color: colors.text, fontWeight: typography.weights.bold }}>Today</span>
                  <span style={{ color: colors.text }}>{formatVolume(summary.totalVolumeKg)}</span>
                </div>
                <div style={ss.barTrack}>
                  <div style={{
                    ...ss.barFillToday,
                    width: `${maxVol > 0 ? (summary.totalVolumeKg / maxVol) * 100 : 0}%`,
                  }} />
                </div>
              </div>
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: typography.sizes.sm,
                  marginBottom: 4,
                }}>
                  <span style={{ color: colors.textTertiary }}>Last time</span>
                  <span style={{ color: colors.textTertiary }}>{formatVolume(summary.previousVolumeKg!)}</span>
                </div>
                <div style={ss.barTrack}>
                  <div style={{
                    ...ss.barFillPrev,
                    width: `${maxVol > 0 ? (summary.previousVolumeKg! / maxVol) * 100 : 0}%`,
                  }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Volume Breakdown by muscle group */}
        {muscleBreakdown.length > 0 && (
          <div style={ss.section}>
            <div style={ss.sectionTitle}>VOLUME BREAKDOWN</div>
            {muscleBreakdown.map(entry => (
              <div key={entry.muscle} style={ss.breakdownRow}>
                <span style={ss.breakdownMuscle}>{entry.muscle}</span>
                <div style={ss.breakdownBarTrack}>
                  <div style={{ ...ss.breakdownBarFill, width: `${entry.pct}%` }} />
                </div>
                <span style={ss.breakdownVol}>{formatVolume(entry.volumeKg)}</span>
                <span style={ss.breakdownPct}>{entry.pct}%</span>
              </div>
            ))}
            <div style={ss.breakdownTotal}>
              <span>Total</span>
              <span style={{ fontWeight: typography.weights.black }}>{formatVolume(summary.totalVolumeKg)}</span>
            </div>
          </div>
        )}

        {/* Done button */}
        <button onClick={onDone} style={ss.doneBtn}>DONE</button>
      </div>
    </div>
  );
}

const ss: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: colors.overlayDense,
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    zIndex: 150,
    overflowY: 'auto',
  },
  container: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '92vh',
    overflowY: 'auto',
    background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
    borderRadius: 24,
    border: `1px solid ${colors.surfaceBorder}`,
    padding: spacing.xxl,
  },
  header: { textAlign: 'center' as const, marginBottom: spacing.xxl },
  icon: { fontSize: 48, marginBottom: spacing.sm },
  title: {
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.black,
    color: colors.text,
    margin: 0,
    letterSpacing: '0.03em',
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    margin: `${spacing.xs}px 0 0`,
  },
  topStats: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    padding: `${spacing.lg}px 0`,
    marginBottom: spacing.xl,
    borderRadius: radii.xl,
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
  },
  topStat: { textAlign: 'center' as const, flex: 1 },
  topStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontWeight: typography.weights.black,
    letterSpacing: '0.05em',
    marginBottom: 4,
  },
  topStatValue: {
    fontSize: typography.sizes['6xl'],
    fontWeight: typography.weights.black,
    color: colors.text,
  },
  topStatDivider: {
    width: 1,
    height: 36,
    background: colors.surfaceBorder,
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontWeight: typography.weights.black,
    letterSpacing: '0.08em',
    marginBottom: spacing.md,
  },
  exerciseList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing.sm,
  },
  exerciseRow: {
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: radii.lg,
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
  },
  exerciseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  incompleteTag: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    padding: `2px ${spacing.sm}px`,
    borderRadius: radii.sm,
    background: colors.warningSurface,
    color: colors.warning,
    letterSpacing: '0.03em',
  },
  exerciseStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseDetail: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  exerciseRPE: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacing.sm,
  },
  statBox: {
    textAlign: 'center' as const,
    padding: `${spacing.md}px ${spacing.sm}px`,
    borderRadius: radii.lg,
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontWeight: typography.weights.black,
    letterSpacing: '0.05em',
    marginBottom: 4,
  },
  statValue: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.black,
    color: colors.text,
  },
  doneBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: radii.xxl,
    border: 'none',
    background: colors.primaryGradient,
    color: colors.text,
    cursor: 'pointer',
    fontWeight: typography.weights.black,
    fontSize: typography.sizes.xl,
    boxShadow: `0 4px 15px ${colors.primaryGlow}`,
    marginTop: spacing.sm,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    background: colors.surfaceHover,
    overflow: 'hidden' as const,
  },
  barFillToday: {
    height: '100%',
    borderRadius: 4,
    background: colors.success,
    transition: 'width 0.3s ease',
  },
  barFillPrev: {
    height: '100%',
    borderRadius: 4,
    background: colors.textTertiary,
    transition: 'width 0.3s ease',
  },
  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  breakdownMuscle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    width: 80,
    flexShrink: 0,
  },
  breakdownBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    background: colors.surfaceHover,
    overflow: 'hidden' as const,
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 3,
    background: colors.primary,
  },
  breakdownVol: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.bold,
    width: 70,
    textAlign: 'right' as const,
    flexShrink: 0,
  },
  breakdownPct: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    width: 32,
    textAlign: 'right' as const,
    flexShrink: 0,
  },
  breakdownTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: typography.sizes.md,
    color: colors.text,
    paddingTop: spacing.sm,
    borderTop: `1px solid ${colors.surfaceBorder}`,
    marginTop: spacing.xs,
  },
};
