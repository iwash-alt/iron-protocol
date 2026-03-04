/**
 * WorkoutSummary — shown after a workout ends, before returning to home.
 *
 * Displays duration, completion, per-exercise breakdown, and total stats.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { SetLog, WorkoutLog } from '@/shared/types';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { useProfilePhoto } from '@/features/photos/ProfilePhotoContext';
import { formatVolume, formatVolumeDelta, formatPctChange, computeMuscleVolumeBreakdown } from '@/shared/utils';
import type { MuscleVolumeEntry } from '@/shared/utils';
import { findExerciseByName } from '@/data/exercises';
import { useTier } from '@/hooks/useTier';
import type { SessionPR } from './WorkoutContext';

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
  /** PRs achieved during this workout session */
  sessionPRs: SessionPR[];
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
  dayExercises: { id: string; exercise: { name: string; isBodyweight?: boolean }; sets: number; weightKg: number; reps: number; repsMax: number; progressionKg: number }[],
  completedSets: Record<string, number>,
  currentLog: SetLog[],
  startedAt: number | null,
  completionPercent: number,
  workoutHistory: WorkoutLog[],
  sessionPRs: SessionPR[] = [],
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
    sessionPRs,
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

// ── Confetti overlay for PR celebrations ─────────────────────────────────────
const CONFETTI_COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#AF52DE', '#FF2D55'];
const CONFETTI_COUNT = 40;

function ConfettiOverlay() {
  const [particles] = useState(() =>
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.2 + Math.random() * 0.8,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotation: Math.random() * 360,
      size: 4 + Math.random() * 4,
    }))
  );

  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div style={ss.confettiContainer} aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute' as const,
            left: `${p.left}%`,
            top: -10,
            width: p.size,
            height: p.size * 1.5,
            background: p.color,
            borderRadius: 1,
            animation: `confettiBurst ${p.duration}s ${p.delay}s ease-out forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ── Share utility ────────────────────────────────────────────────────────────
function generateShareText(
  summary: WorkoutSummaryData,
  muscleBreakdown: MuscleVolumeEntry[],
): string {
  const lines: string[] = [];
  lines.push(`\u{1F3CB} Iron Protocol \u2014 ${summary.dayName}`);
  lines.push(`\u{1F4C5} ${summary.date}`);

  const duration = formatDuration(summary.durationSeconds);
  lines.push(`\u23F1 ${duration} | ${summary.completionPercent}% complete`);

  const vol = formatVolume(summary.totalVolumeKg);
  lines.push(`\u{1F4AA} Volume: ${vol} | Sets: ${summary.setsCompleted}/${summary.setsPlanned} | RPE ${summary.avgRPE || '\u2014'}`);

  if (muscleBreakdown.length > 0) {
    const top = muscleBreakdown[0];
    lines.push(`\u{1F3AF} Top: ${top.muscle} ${top.pct}%`);
  }

  if (summary.sessionPRs.length > 0) {
    lines.push(`\u{1F525} ${summary.sessionPRs.length} New PR${summary.sessionPRs.length > 1 ? 's' : ''}!`);
  }

  return lines.join('\n');
}

export function WorkoutSummary({ summary, onDone }: Props) {
  const { photo: profilePhoto } = useProfilePhoto();
  const { isFree } = useTier();
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const hasPRs = summary.sessionPRs.length > 0;
  const prExerciseNames = React.useMemo(
    () => new Set(summary.sessionPRs.map(pr => pr.exerciseName)),
    [summary.sessionPRs],
  );

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

  const handleShare = useCallback(async () => {
    const text = generateShareText(summary, muscleBreakdown);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled share — ignore
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  }, [summary, muscleBreakdown]);

  return (
    <div style={ss.overlay}>
      <div style={ss.container}>
        {/* Confetti burst on PRs */}
        {hasPRs && <ConfettiOverlay />}

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
          <div style={ss.icon}>{summary.endedEarly ? '\u{1F3C1}' : '\u{1F3C6}'}</div>
          <h2 style={ss.title}>
            {summary.endedEarly ? 'WORKOUT ENDED EARLY' : 'WORKOUT COMPLETE'}
          </h2>
          <p style={ss.subtitle}>{summary.dayName} \u2014 {summary.date}</p>
        </div>

        {/* PR celebration banner */}
        {hasPRs && (
          <div style={ss.prBanner}>
            <div style={ss.prBannerIcon}>{'\u{1F525}'}</div>
            <div>
              <div style={ss.prBannerTitle}>
                {summary.sessionPRs.length} NEW PR{summary.sessionPRs.length > 1 ? 'S' : ''}!
              </div>
              <div style={ss.prBannerList}>
                {summary.sessionPRs.map((pr, i) => (
                  <span key={i}>
                    {pr.exerciseName} ({pr.category}: {pr.value})
                    {i < summary.sessionPRs.length - 1 ? ' \u00B7 ' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

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
                ...(prExerciseNames.has(ex.name) ? ss.exerciseRowPR : {}),
              }}>
                <div style={ss.exerciseHeader}>
                  <span style={ss.exerciseName}>{ex.name}</span>
                  <div style={{ display: 'flex', gap: spacing.xs }}>
                    {prExerciseNames.has(ex.name) && (
                      <span style={ss.prTag}>PR</span>
                    )}
                    {ex.isIncomplete && ex.setsCompleted > 0 && (
                      <span style={ss.incompleteTag}>INCOMPLETE</span>
                    )}
                  </div>
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
                {summary.avgRPE || '\u2014'}
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

        {/* Pro teaser for free users */}
        {isFree && (
          <div style={ss.proTeaser}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <span style={{ fontSize: 20 }}>{'\u{1F4CA}'}</span>
              <div>
                <div style={ss.proTeaserTitle}>Pro unlocks custom graphs</div>
                <div style={ss.proTeaserDesc}>Track your progress with personalized charts and advanced analytics</div>
              </div>
            </div>
          </div>
        )}

        {/* Share + Done buttons */}
        <button onClick={handleShare} style={ss.shareBtn}>
          {shareStatus === 'copied' ? 'COPIED!' : 'SHARE WORKOUT'}
        </button>
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
  confettiContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    overflow: 'hidden' as const,
    pointerEvents: 'none' as const,
    zIndex: 10,
  },
  prBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    background: 'linear-gradient(135deg, rgba(255,59,48,0.15) 0%, rgba(255,149,0,0.15) 100%)',
    border: `1px solid ${colors.primaryBorder}`,
    marginBottom: spacing.xl,
    animation: 'prBurst 0.6s ease-out',
  },
  prBannerIcon: {
    fontSize: 32,
    flexShrink: 0,
  },
  prBannerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
    color: colors.primary,
    letterSpacing: '0.03em',
  },
  prBannerList: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 1.4,
  },
  exerciseRowPR: {
    border: `1px solid ${colors.primaryBorder}`,
    background: 'rgba(255,59,48,0.05)',
  },
  prTag: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    padding: `2px ${spacing.sm}px`,
    borderRadius: radii.sm,
    background: colors.primarySurface,
    color: colors.primary,
    letterSpacing: '0.05em',
  },
  proTeaser: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    background: colors.surface,
    border: `1px dashed ${colors.surfaceBorder}`,
    marginBottom: spacing.md,
  },
  proTeaserTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  proTeaserDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  shareBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: radii.xxl,
    border: `1px solid ${colors.surfaceBorder}`,
    background: colors.surface,
    color: colors.text,
    cursor: 'pointer',
    fontWeight: typography.weights.black,
    fontSize: typography.sizes.xl,
    marginBottom: spacing.sm,
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
