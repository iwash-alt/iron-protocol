import React, { useMemo, useState } from 'react';
import type { UserProfile, ExercisePR } from '@/shared/types';
import { useWorkout } from '@/features/workout/WorkoutContext';
import { useNutrition } from '@/features/nutrition/nutrition.context';
import { useProgress } from './progress.context';
import { MiniChart, Icon } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { getProteinGoal, WATER_GOAL, getLast7Days } from '@/shared/utils';
import { useTier } from '@/hooks/useTier';
import { calculateFatigueScore } from '@/training/fatigue';
import { generateWeeklyInsights } from '@/analytics/insights';
import { FatigueCard } from './FatigueCard';
import { InsightsCard } from './InsightsCard';
import { findExerciseByName } from '@/data/exercises';
import { colors, radii, typography, spacing } from '@/shared/theme/tokens';
import { ProgressPhotos } from '@/features/photos/ProgressPhotos';

/** Muscle group filter categories - maps UI labels to exercise muscle groups */
const PR_FILTER_GROUPS: Record<string, string[]> = {
  All: [],
  Chest: ['Chest'],
  Back: ['Back', 'Lats', 'Rear Delts'],
  Legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Shoulders: ['Shoulders'],
  Arms: ['Biceps', 'Triceps'],
  Core: ['Core'],
};

/** Check if a PR was set within the last 7 days */
function isNewPR(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const prDate = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - prDate.getTime()) / 86400000;
  return diff <= 7;
}

function formatVolume(vol: number): string {
  return vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${Math.round(vol)}kg`;
}

interface DashboardProps {
  profile: UserProfile;
  streak: number;
  onOpenNutrition: () => void;
  onOpenMeasurements: () => void;
  onShowExerciseHistory: (name: string) => void;
  demoMode: boolean;
  onToggleDemo: (enabled: boolean) => void;
}

export function Dashboard({
  profile,
  streak,
  onOpenNutrition,
  onOpenMeasurements,
  onShowExerciseHistory,
  demoMode,
  onToggleDemo,
}: DashboardProps) {
  const workout = useWorkout();
  const nutrition = useNutrition();
  const progress = useProgress();
  const { canAccess } = useTier();
  const isPro = canAccess('analytics_advanced');

  const [prFilter, setPrFilter] = useState('All');
  const [measureTab, setMeasureTab] = useState<'measurements' | 'photos'>('measurements');

  const proteinGoal = getProteinGoal(profile.weight);
  const totalVol = workout.workoutHistory.reduce((a, w) => a + (w.totalVolumeKg || 0), 0);
  const volData = workout.workoutHistory.slice(-7).map(w => w.totalVolumeKg || 0);
  const last7 = getLast7Days();
  const proteinData = last7.map(d => nutrition.nutritionHistory[d]?.protein || 0);
  const weightData = progress.bodyMeasurements.slice(-10).map(m => parseFloat(String(m.weight)) || 0);
  const programsCompleted = Math.floor(workout.weekCount / 4);

  // Intelligence features (Pro only)
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

  // Filter PRs by muscle group
  const filteredPRs = useMemo(() => {
    const entries = Object.entries(workout.personalRecords);
    if (prFilter === 'All') return entries;
    const allowedMuscles = PR_FILTER_GROUPS[prFilter] || [];
    return entries.filter(([name]) => {
      const ex = findExerciseByName(name);
      return ex && allowedMuscles.includes(ex.muscle);
    });
  }, [workout.personalRecords, prFilter]);

  return (
    <div>
      <div style={S.sumGrid}>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>WORKOUTS</div>
          <div style={S.sumVal}>{workout.workoutHistory.length}</div>
          {volData.length > 1 && <MiniChart data={volData} type="bar" height={35} />}
        </div>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>VOLUME</div>
          <div style={S.sumVal}>{(totalVol / 1000).toFixed(0)}t</div>
        </div>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>STREAK</div>
          <div style={S.sumVal}>{streak} {'\u{1F525}'}</div>
        </div>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>PROGRAMS</div>
          <div style={S.sumVal}>{programsCompleted}</div>
        </div>
      </div>

      {workout.weekCount > 0 && (
        <div style={S.weekCard}>
          {'\u{1F4C5}'} Training Week {workout.weekCount}
          {workout.weekCount >= 4 && <span style={S.weekWarning}> {'\u00B7'} Deload recommended</span>}
        </div>
      )}

      {/* Intelligence cards (Pro) or upgrade prompt (Free) */}
      {isPro ? (
        <>
          {fatigue && <FatigueCard fatigue={fatigue} />}
          {insights && <InsightsCard insight={insights} />}
        </>
      ) : (
        <div style={lockedCardStyles.card}>
          <div style={lockedCardStyles.icon}>{'\u{1F512}'}</div>
          <div style={lockedCardStyles.title}>Smart Training Intelligence</div>
          <div style={lockedCardStyles.desc}>
            Fatigue tracking, weekly insights, adaptive rest, and mid-workout suggestions.
          </div>
          <div style={lockedCardStyles.price}>Unlock smart training {'\u2014'} $2/mo</div>
        </div>
      )}

      {/* Enhanced Personal Records Board */}
      {Object.keys(workout.personalRecords).length > 0 && (
        <div style={S.chartBox}>
          <h3 style={S.chartTitle}>{'\u{1F3C6}'} Personal Records</h3>

          {/* Muscle group filter tabs */}
          <div style={prStyles.filterRow}>
            {Object.keys(PR_FILTER_GROUPS).map(group => (
              <button
                key={group}
                onClick={() => setPrFilter(group)}
                style={{
                  ...prStyles.filterBtn,
                  ...(prFilter === group ? prStyles.filterBtnActive : {}),
                }}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Global PRs */}
          {prFilter === 'All' && workout.globalPRs && (
            <div style={prStyles.globalSection}>
              <div style={prStyles.globalTitle}>GLOBAL RECORDS</div>
              <div style={prStyles.globalGrid}>
                {workout.globalPRs.highestSessionVolume && (
                  <div style={prStyles.globalItem}>
                    <div style={prStyles.globalLabel}>Session Volume</div>
                    <div style={prStyles.globalValue}>{formatVolume(workout.globalPRs.highestSessionVolume.value)}</div>
                    <div style={prStyles.globalDate}>{workout.globalPRs.highestSessionVolume.date}</div>
                  </div>
                )}
                {workout.globalPRs.longestStreak && (
                  <div style={prStyles.globalItem}>
                    <div style={prStyles.globalLabel}>Longest Streak</div>
                    <div style={prStyles.globalValue}>{workout.globalPRs.longestStreak.days}d</div>
                    <div style={prStyles.globalDate}>ended {workout.globalPRs.longestStreak.endDate}</div>
                  </div>
                )}
                {workout.globalPRs.mostSetsInWorkout && (
                  <div style={prStyles.globalItem}>
                    <div style={prStyles.globalLabel}>Most Sets</div>
                    <div style={prStyles.globalValue}>{workout.globalPRs.mostSetsInWorkout.count}</div>
                    <div style={prStyles.globalDate}>{workout.globalPRs.mostSetsInWorkout.date}</div>
                  </div>
                )}
                {workout.globalPRs.highestAvgRPE && (
                  <div style={prStyles.globalItem}>
                    <div style={prStyles.globalLabel}>Toughest Avg RPE</div>
                    <div style={prStyles.globalValue}>{workout.globalPRs.highestAvgRPE.value}</div>
                    <div style={prStyles.globalDate}>{workout.globalPRs.highestAvgRPE.date}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Per-exercise PRs */}
          <div style={prStyles.exerciseList}>
            {filteredPRs.map(([name, pr]) => (
              <PRExerciseCard
                key={name}
                name={name}
                pr={pr}
                onClick={() => onShowExerciseHistory(name)}
              />
            ))}
            {filteredPRs.length === 0 && (
              <p style={{ color: colors.textTertiary, textAlign: 'center', padding: '16px 0', fontSize: typography.sizes.md }}>
                No PRs for this muscle group yet
              </p>
            )}
          </div>
        </div>
      )}

      <div style={S.chartBox}>
        <div style={S.chartHeader}>
          <h3 style={S.chartTitle}>{'\u{1F4CF}'} Body Tracking</h3>
          {measureTab === 'measurements' && (
            <button onClick={onOpenMeasurements} style={S.addMeasureBtn}>+ LOG</button>
          )}
        </div>
        {/* Measurements / Photos tabs */}
        <div style={measureTabStyles.tabRow}>
          <button
            onClick={() => setMeasureTab('measurements')}
            style={{
              ...measureTabStyles.tab,
              ...(measureTab === 'measurements' ? measureTabStyles.tabActive : {}),
            }}
          >
            <Icon name="ruler" size={14} /> Measurements
          </button>
          <button
            onClick={() => setMeasureTab('photos')}
            style={{
              ...measureTabStyles.tab,
              ...(measureTab === 'photos' ? measureTabStyles.tabActive : {}),
            }}
          >
            <Icon name="camera" size={14} /> Progress Photos
          </button>
        </div>
        {measureTab === 'measurements' ? (
          weightData.length > 1 ? (
            <>
              <MiniChart data={weightData} color="#3B82F6" height={60} />
              <div style={S.measureSummary}>
                <span>Current: {progress.bodyMeasurements[progress.bodyMeasurements.length - 1]?.weight}kg</span>
                <span>Start: {progress.bodyMeasurements[0]?.weight}kg</span>
              </div>
            </>
          ) : (
            <p style={S.emptyText}>Log measurements to track progress</p>
          )
        ) : (
          <ProgressPhotos currentWeight={profile.weight} />
        )}
      </div>

      <div style={S.chartBox}>
        <h3 style={S.chartTitle}>{'\u{1F37D}\uFE0F'} Today's Nutrition</h3>
        <div style={S.nutritionCards}>
          <div style={S.nutritionCard} onClick={onOpenNutrition}>
            <div style={S.nutritionCardHeader}><span style={{ fontSize: '1.25rem' }}>{'\u{1F4A7}'}</span><span style={S.nutritionCardTitle}>Water</span></div>
            <div style={S.nutritionCardValue}>{nutrition.todayWater}<span style={S.nutritionCardUnit}>/{WATER_GOAL}</span></div>
            <div style={S.miniProgress}><div style={{ ...S.miniProgressFill, width: `${(nutrition.todayWater / WATER_GOAL) * 100}%`, background: '#3B82F6' }} /></div>
            <button onClick={e => { e.stopPropagation(); nutrition.addWater(); }} style={S.nutritionCardBtn}>+ ADD</button>
          </div>
          <div style={S.nutritionCard} onClick={onOpenNutrition}>
            <div style={S.nutritionCardHeader}><span style={{ fontSize: '1.25rem' }}>{'\u{1F969}'}</span><span style={S.nutritionCardTitle}>Protein</span></div>
            <div style={S.nutritionCardValue}>{nutrition.todayProtein}<span style={S.nutritionCardUnit}>g</span></div>
            <div style={S.miniProgress}><div style={{ ...S.miniProgressFill, width: `${Math.min(100, (nutrition.todayProtein / proteinGoal) * 100)}%`, background: '#34C759' }} /></div>
            <button onClick={e => { e.stopPropagation(); onOpenNutrition(); }} style={S.nutritionCardBtn}>+ LOG</button>
          </div>
        </div>
      </div>

      <div style={S.chartBox}>
        <h3 style={S.chartTitle}>{'\u{1F4CA}'} Protein (7 Days)</h3>
        <MiniChart data={proteinData.length ? proteinData : [0]} color="#34C759" height={60} />
        <div style={S.chartLabels}><span>7 days ago</span><span>Today</span></div>
      </div>

      {workout.workoutHistory.length > 0 && (
        <div style={S.chartBox}>
          <h3 style={S.chartTitle}>{'\u{1F4CB}'} Recent Workouts</h3>
          <div style={S.recentList}>
            {workout.workoutHistory.slice(-5).reverse().map((w, i) => (
              <div key={i} style={S.recentItem}>
                <div><div style={S.recentDay}>{w.dayName}</div><div style={S.recentDate}>{w.date}</div></div>
                <div style={S.recentStats}>
                  <span style={S.recentPct}>{w.completionPercent}%</span>
                  <span style={S.recentVol}>{(w.totalVolumeKg / 1000).toFixed(1)}t</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={S.profileBox}>
        <h3 style={S.chartTitle}>{'\u{1F464}'} Profile</h3>
        <div style={S.profileGrid}>
          <div style={S.profileItem}><span style={S.profileLabel}>Height</span><span>{profile.height}cm</span></div>
          <div style={S.profileItem}><span style={S.profileLabel}>Weight</span><span>{profile.weight}kg</span></div>
          <div style={S.profileItem}><span style={S.profileLabel}>Level</span><span style={{ textTransform: 'capitalize' }}>{profile.level}</span></div>
          <div style={S.profileItem}><span style={S.profileLabel}>Schedule</span><span>{profile.days}x/week</span></div>
        </div>
        <div style={S.demoRow}>
          <div>
            <div style={S.demoLabel}>Demo Mode</div>
            <div style={S.demoHint}>Load 6 months of serious lifter data</div>
          </div>
          <button
            type="button"
            onClick={() => onToggleDemo(!demoMode)}
            style={{ ...S.demoToggle, ...(demoMode ? S.demoToggleOn : {}) }}
            aria-pressed={demoMode}
          >
            <span style={{ ...S.demoKnob, ...(demoMode ? S.demoKnobOn : {}) }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Single exercise PR card with expanded display */
function PRExerciseCard({ name, pr, onClick }: { name: string; pr: ExercisePR; onClick: () => void }) {
  const hasAnyNew = [
    pr.heaviestWeight?.date,
    pr.bestEstimated1RM?.date,
    pr.bestSetVolume?.date,
    pr.bestSessionVolume?.date,
  ].some(d => isNewPR(d));

  return (
    <div style={prStyles.exerciseCard} onClick={onClick}>
      <div style={prStyles.exerciseHeader}>
        <div style={prStyles.exerciseName}>{name}</div>
        {hasAnyNew && <span style={prStyles.newBadge}>NEW</span>}
      </div>
      <div style={prStyles.prEntries}>
        {pr.heaviestWeight && (
          <PREntryRow
            icon={'\u{1F4AA}'}
            label="Heavy"
            value={`${pr.heaviestWeight.weightKg}kg x ${pr.heaviestWeight.reps}`}
            date={pr.heaviestWeight.date}
          />
        )}
        {pr.bestEstimated1RM && (
          <PREntryRow
            icon={'\u{1F3AF}'}
            label="Est 1RM"
            value={`${pr.bestEstimated1RM.value}kg`}
            date={pr.bestEstimated1RM.date}
          />
        )}
        {pr.bestSetVolume && (
          <PREntryRow
            icon={'\u26A1'}
            label="Best Set"
            value={`${pr.bestSetVolume.weightKg}kg x ${pr.bestSetVolume.reps} = ${formatVolume(pr.bestSetVolume.value)}`}
            date={pr.bestSetVolume.date}
          />
        )}
        {pr.bestSessionVolume && (
          <PREntryRow
            icon={'\u{1F4C8}'}
            label="Session Vol"
            value={formatVolume(pr.bestSessionVolume.value)}
            date={pr.bestSessionVolume.date}
          />
        )}
      </div>
    </div>
  );
}

function PREntryRow({ icon, label, value, date }: { icon: string; label: string; value: string; date: string }) {
  const isNew = isNewPR(date);
  return (
    <div style={prStyles.prRow}>
      <span style={prStyles.prRowIcon}>{icon}</span>
      <span style={prStyles.prRowLabel}>{label}:</span>
      <span style={{ ...prStyles.prRowValue, color: isNew ? colors.primary : colors.text }}>{value}</span>
      <span style={prStyles.prRowDate}>({date})</span>
      {isNew && <span style={prStyles.prRowNew}>NEW</span>}
    </div>
  );
}

const prStyles: Record<string, React.CSSProperties> = {
  filterRow: {
    display: 'flex',
    gap: 6,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    overflowX: 'auto',
    paddingBottom: 4,
  },
  filterBtn: {
    padding: `6px ${spacing.md}px`,
    borderRadius: radii.pill,
    border: `1px solid ${colors.surfaceHover}`,
    background: colors.surface,
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    whiteSpace: 'nowrap',
  },
  filterBtnActive: {
    background: colors.primarySurface,
    border: `1px solid ${colors.primaryBorder}`,
    color: colors.text,
  },
  globalSection: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    background: 'rgba(255,149,0,0.06)',
    border: '1px solid rgba(255,149,0,0.15)',
  },
  globalTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.warning,
    letterSpacing: '0.08em',
    marginBottom: spacing.sm,
  },
  globalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: spacing.sm,
  },
  globalItem: {
    textAlign: 'center' as const,
    padding: spacing.sm,
  },
  globalLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  globalValue: {
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.black,
    color: colors.warning,
  },
  globalDate: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  exerciseList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing.sm,
  },
  exerciseCard: {
    padding: spacing.md,
    background: colors.surface,
    border: `1px solid rgba(255,255,255,0.05)`,
    borderRadius: radii.lg,
    cursor: 'pointer',
  },
  exerciseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exerciseName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  newBadge: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.primary,
    padding: '2px 8px',
    borderRadius: radii.sm,
    background: colors.primarySurface,
    border: `1px solid ${colors.primaryBorder}`,
    letterSpacing: '0.05em',
  },
  prEntries: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  prRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: typography.sizes.md,
    lineHeight: 1.5,
  },
  prRowIcon: {
    fontSize: typography.sizes.base,
    width: 16,
    flexShrink: 0,
  },
  prRowLabel: {
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    flexShrink: 0,
  },
  prRowValue: {
    fontWeight: typography.weights.black,
    color: colors.text,
  },
  prRowDate: {
    color: colors.textTertiary,
    fontSize: typography.sizes.sm,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  prRowNew: {
    fontSize: '0.5rem',
    fontWeight: typography.weights.black,
    color: colors.primary,
    padding: '1px 4px',
    borderRadius: 3,
    background: colors.primarySurface,
    marginLeft: 4,
    flexShrink: 0,
  },
};

const measureTabStyles: Record<string, React.CSSProperties> = {
  tabRow: {
    display: 'flex',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: `${spacing.sm + 2}px ${spacing.md}px`,
    borderRadius: radii.pill,
    border: `1px solid ${colors.surfaceHover}`,
    background: colors.surface,
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    whiteSpace: 'nowrap' as const,
  },
  tabActive: {
    background: colors.primarySurface,
    border: `1px solid ${colors.primaryBorder}`,
    color: colors.text,
  },
};

const lockedCardStyles: Record<string, React.CSSProperties> = {
  card: {
    padding: spacing.xl,
    borderRadius: 18,
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
    marginBottom: spacing.md,
    textAlign: 'center' as const,
  },
  icon: { fontSize: 32, marginBottom: spacing.sm },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  desc: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 1.4,
    marginBottom: spacing.md,
  },
  price: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    padding: `${spacing.sm}px ${spacing.lg}px`,
    background: colors.primarySurface,
    borderRadius: radii.pill,
    display: 'inline-block',
    border: `1px solid ${colors.primaryBorder}`,
  },
};
