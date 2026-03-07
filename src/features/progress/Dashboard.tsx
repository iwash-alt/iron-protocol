import React, { useMemo, useState } from 'react';
import type { UserProfile } from '@/shared/types';
import { useWorkout } from '@/features/workout/WorkoutContext';
import { useProgress } from './progress.context';
import { EmptyState } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { formatVolume } from '@/shared/utils';
import { useTier } from '@/hooks/useTier';
import { calculateFatigueScore } from '@/training/fatigue';
import { generateWeeklyInsights } from '@/analytics/insights';
import { getPeriodStats, getMuscleGroupDistribution, getPRTrends, getAvgRPETrend } from '@/analytics/periodStats';
import type { DashboardPeriod } from '@/analytics/periodStats';
import { FatigueCard } from './FatigueCard';
import { InsightsCard } from './InsightsCard';
import { MuscleDistributionCard } from './MuscleDistributionCard';
import { PRBoard } from './PRBoard';
import { BodyTracking } from './BodyTracking';
import { RecentWorkouts } from './RecentWorkouts';
import { ProfileSummary } from './ProfileSummary';
import {
  PeriodDropdown,
  VolumeChart,
  PRTrendsChart,
  MusclePieChart,
  RecoveryTrendChart,
  SummaryCards,
  ChartCarousel,
} from './charts';
import { VolumeChart as VolumeChartNew } from './VolumeChart';
import { RPEHistogram } from './RPEHistogram';
import { MuscleGroupChart } from './MuscleGroupChart';
import type { VolumePoint, RPEDistribution, MuscleGroupVolume } from '@/shared/types';
import { colors, spacing, typography } from '@/shared/theme/tokens';

const ChartIllustration = (
  <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <rect x="8" y="40" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="2.5"/>
    <rect x="22" y="28" width="10" height="28" rx="2" stroke="currentColor" strokeWidth="2.5"/>
    <rect x="36" y="20" width="10" height="36" rx="2" stroke="currentColor" strokeWidth="2.5"/>
    <rect x="50" y="32" width="10" height="24" rx="2" stroke="currentColor" strokeWidth="2.5"/>
    <line x1="8" y1="58" x2="60" y2="58" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

interface DashboardProps {
  profile: UserProfile;
  streak: number;
  onOpenMeasurements: () => void;
  onShowExerciseHistory: (name: string) => void;
  demoMode: boolean;
  onToggleDemo: (enabled: boolean) => void;
}

export function Dashboard({
  profile,
  streak,
  onOpenMeasurements,
  onShowExerciseHistory,
  demoMode,
  onToggleDemo,
}: DashboardProps) {
  const workout = useWorkout();
  const progress = useProgress();
  const { canAccess } = useTier();
  const isPro = canAccess('analytics_advanced');

  const [period, setPeriod] = useState<DashboardPeriod>('month');

  const hasHistory = workout.workoutHistory.length > 0;

  // ── Computed analytics (all driven by `period`) ──────────────────────────
  const periodStats = useMemo(() => {
    if (!hasHistory) return null;
    return getPeriodStats(workout.workoutHistory, period, workout.personalRecords);
  }, [workout.workoutHistory, workout.personalRecords, period, hasHistory]);

  const muscleDistribution = useMemo(() => {
    if (!hasHistory) return [];
    return getMuscleGroupDistribution(workout.workoutHistory, period);
  }, [workout.workoutHistory, period, hasHistory]);

  const prTrends = useMemo(() => {
    return getPRTrends(workout.exerciseHistory, period);
  }, [workout.exerciseHistory, period]);

  const rpeTrend = useMemo(() => {
    if (!hasHistory) return [];
    return getAvgRPETrend(workout.workoutHistory, period);
  }, [workout.workoutHistory, period, hasHistory]);

  // Pro-only intelligence
  const fatigue = useMemo(() => {
    if (!isPro || workout.workoutHistory.length < 2) return null;
    return calculateFatigueScore(workout.workoutHistory, workout.exerciseHistory);
  }, [isPro, workout.workoutHistory, workout.exerciseHistory]);

  const insights = useMemo(() => {
    if (!isPro || workout.workoutHistory.length < 1) return null;
    return generateWeeklyInsights(
      workout.workoutHistory,
      workout.personalRecords,
      workout.exerciseHistory,
      profile.days,
    );
  }, [isPro, workout.workoutHistory, workout.personalRecords, workout.exerciseHistory, profile.days]);

  // ── Data for new recharts components ─────────────────────────────────────
  const volumePoints = useMemo((): VolumePoint[] => {
    if (!hasHistory) return [];
    // Build one point per workout in the current period, grouped by date
    const byDate: Map<string, { volume: number; sessionCount: number }> = new Map();
    for (const w of workout.workoutHistory) {
      const existing = byDate.get(w.date);
      if (existing) {
        existing.volume += w.totalVolumeKg ?? 0;
        existing.sessionCount += 1;
      } else {
        byDate.set(w.date, { volume: w.totalVolumeKg ?? 0, sessionCount: 1 });
      }
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-20)
      .map(([date, vals]) => ({ date, ...vals }));
  }, [hasHistory, workout.workoutHistory]);

  const rpeDistribution = useMemo((): RPEDistribution[] => {
    if (!hasHistory) return [];
    const counts: Record<number, number> = {};
    for (const w of workout.workoutHistory) {
      for (const s of w.sets) {
        if (s.rpe) {
          counts[s.rpe] = (counts[s.rpe] ?? 0) + 1;
        }
      }
    }
    return Object.entries(counts)
      .map(([rpe, count]) => ({ rpe: Number(rpe), count }))
      .sort((a, b) => a.rpe - b.rpe);
  }, [hasHistory, workout.workoutHistory]);

  const muscleGroupVolume = useMemo((): MuscleGroupVolume[] => {
    return muscleDistribution.map(d => ({
      group: d.muscle,
      sets: d.sets,
      percentage: d.pct,
    }));
  }, [muscleDistribution]);

  // Derived display values
  const topMuscle = muscleDistribution.length > 0 ? muscleDistribution[0] : null;

  return (
    <div>
      {/* ── Period Dropdown ─────────────────────────────────────────── */}
      <PeriodDropdown value={period} onChange={setPeriod} />

      {/* ── Summary Cards ──────────────────────────────────────────── */}
      <SummaryCards
        totalVolume={periodStats?.totalVolume ?? 0}
        volumeChangePct={periodStats?.volumeChangePct ?? 0}
        streak={streak}
        topMuscle={topMuscle?.muscle ?? null}
        topMusclePct={topMuscle?.pct ?? 0}
        avgRPE={periodStats?.avgRPE ?? 0}
        newPRs={periodStats?.newPRs ?? 0}
      />

      {/* ── Empty state ────────────────────────────────────────────── */}
      {!hasHistory && (
        <EmptyState
          illustration={ChartIllustration}
          title="Log workouts to see stats!"
          subtitle="Your first workout builds the foundation"
        />
      )}

      {/* ── Training Week ──────────────────────────────────────────── */}
      {workout.weekCount > 0 && (
        <div style={S.weekCard}>
          {'\u{1F4C5}'} Training Week {workout.weekCount}
          {workout.weekCount >= 4 && <span style={S.weekWarning}> {'\u00B7'} Deload recommended</span>}
        </div>
      )}

      {/* ── Chart Carousel (Volume, PR Trends, Recovery) ─────────── */}
      {hasHistory && (
        <ChartCarousel titles={['Volume', 'PR Trends', 'Recovery']}>
          {[
            <VolumeChart
              key="volume"
              dataPoints={periodStats?.dataPoints ?? []}
              volumeChangePct={periodStats?.volumeChangePct ?? 0}
            />,
            <PRTrendsChart
              key="pr-trends"
              trends={prTrends}
            />,
            <RecoveryTrendChart
              key="recovery"
              data={rpeTrend}
            />,
          ]}
        </ChartCarousel>
      )}

      {/* ── Trends Section ──────────────────────────────────────────── */}
      {hasHistory && (
        <div style={dashStyles.trendsSection}>
          <h2 style={dashStyles.trendsHeading}>Trends</h2>
          <div style={dashStyles.trendsCard}>
            <VolumeChartNew data={volumePoints} height={180} />
          </div>
          <div style={dashStyles.trendsCard}>
            <RPEHistogram data={rpeDistribution} />
          </div>
          {muscleGroupVolume.length > 0 && (
            <div style={dashStyles.trendsCard}>
              <MuscleGroupChart data={muscleGroupVolume} />
            </div>
          )}
        </div>
      )}

      {/* ── Period Stats Summary Row ───────────────────────────────── */}
      {periodStats && periodStats.totalSessions > 0 && (
        <div style={dashStyles.periodSummary}>
          <div style={dashStyles.periodSumItem}>
            <div style={dashStyles.periodSumVal}>{periodStats.totalSessions}</div>
            <div style={dashStyles.periodSumLabel}>SESSIONS</div>
          </div>
          <div style={dashStyles.divider} />
          <div style={dashStyles.periodSumItem}>
            <div style={dashStyles.periodSumVal}>{formatVolume(periodStats.totalVolume, { abbreviated: true })}</div>
            <div style={dashStyles.periodSumLabel}>VOLUME</div>
          </div>
          <div style={dashStyles.divider} />
          <div style={dashStyles.periodSumItem}>
            <div style={dashStyles.periodSumVal}>
              {periodStats.avgRPE > 0 ? periodStats.avgRPE.toFixed(1) : '\u2014'}
            </div>
            <div style={dashStyles.periodSumLabel}>AVG RPE</div>
          </div>
          <div style={dashStyles.divider} />
          <div style={dashStyles.periodSumItem}>
            <div style={{
              ...dashStyles.periodSumVal,
              color: periodStats.newPRs > 0 ? colors.primary : colors.text,
            }}>
              {periodStats.newPRs}
            </div>
            <div style={dashStyles.periodSumLabel}>NEW PRs</div>
          </div>
        </div>
      )}

      {/* ── Muscle Distribution ─────────────────────────────────────── */}
      {muscleDistribution.length > 0 && (
        <>
          <MusclePieChart distribution={muscleDistribution} />
          <MuscleDistributionCard distribution={muscleDistribution} period={period} />
        </>
      )}

      {/* ── Intelligence Cards (Pro) ────────────────────────────────── */}
      {isPro ? (
        <>
          {fatigue && <FatigueCard fatigue={fatigue} />}
          {insights && <InsightsCard insight={insights} />}
        </>
      ) : (
        <div style={dashStyles.lockedCard}>
          <div style={{ fontSize: 32, marginBottom: spacing.sm }}>{'\u{1F512}'}</div>
          <div style={dashStyles.lockedTitle}>Intelligent Training Progression</div>
          <div style={dashStyles.lockedDesc}>
            Fatigue tracking, weekly insights, adaptive rest, and mid-workout suggestions.
          </div>
          <div style={dashStyles.lockedPrice}>Unlock intelligent progression {'\u2014'} $2/mo</div>
        </div>
      )}

      {/* ── Personal Records Board ──────────────────────────────────── */}
      <PRBoard
        personalRecords={workout.personalRecords}
        globalPRs={workout.globalPRs}
        onShowExerciseHistory={onShowExerciseHistory}
      />

      {/* ── Body Tracking ───────────────────────────────────────────── */}
      <BodyTracking
        profile={profile}
        bodyMeasurements={progress.bodyMeasurements}
        onOpenMeasurements={onOpenMeasurements}
      />

      {/* ── Recent Workouts ─────────────────────────────────────────── */}
      <RecentWorkouts workoutHistory={workout.workoutHistory} />

      {/* ── Profile Summary ─────────────────────────────────────────── */}
      <ProfileSummary
        profile={profile}
        demoMode={demoMode}
        onToggleDemo={onToggleDemo}
      />
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const dashStyles: Record<string, React.CSSProperties> = {
  periodSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: `${spacing.sm}px ${spacing.xs}px`,
    marginBottom: spacing.lg,
    border: '1px solid rgba(255,255,255,0.05)',
  },
  periodSumItem: {
    textAlign: 'center' as const,
    flex: 1,
  },
  periodSumVal: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.black,
    color: colors.text,
    lineHeight: 1.1,
  },
  periodSumLabel: {
    fontSize: '0.55rem',
    fontWeight: typography.weights.black,
    color: colors.textTertiary,
    letterSpacing: '0.08em',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
    background: 'rgba(255,255,255,0.07)',
  },
  lockedCard: {
    padding: spacing.xl,
    borderRadius: 18,
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
    marginBottom: spacing.md,
    textAlign: 'center' as const,
  },
  lockedTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  lockedDesc: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 1.4,
    marginBottom: spacing.md,
  },
  trendsSection: {
    marginBottom: spacing.md,
  },
  trendsHeading: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.black,
    color: colors.text,
    margin: `0 0 ${spacing.sm}px`,
  },
  trendsCard: {
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
    borderRadius: 14,
    marginBottom: spacing.sm,
    overflow: 'hidden' as const,
  },
  lockedPrice: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    padding: `${spacing.sm}px ${spacing.lg}px`,
    background: colors.primarySurface,
    borderRadius: 20,
    display: 'inline-block',
    border: `1px solid ${colors.primaryBorder}`,
  },
};
