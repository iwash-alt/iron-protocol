import React, { useMemo } from 'react';
import type { UserProfile } from '@/shared/types';
import { useWorkout } from '@/features/workout/WorkoutContext';
import { useNutrition } from '@/features/nutrition/nutrition.context';
import { useProgress } from './progress.context';
import { MiniChart } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { getProteinGoal, WATER_GOAL, getLast7Days } from '@/shared/utils';
import { useTier } from '@/hooks/useTier';
import { calculateFatigueScore } from '@/training/fatigue';
import { generateWeeklyInsights } from '@/analytics/insights';
import { FatigueCard } from './FatigueCard';
import { InsightsCard } from './InsightsCard';
import { colors, radii, typography, spacing } from '@/shared/theme/tokens';

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
          <div style={S.sumVal}>{streak} 🔥</div>
        </div>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>PROGRAMS</div>
          <div style={S.sumVal}>{programsCompleted}</div>
        </div>
      </div>

      {workout.weekCount > 0 && (
        <div style={S.weekCard}>
          📅 Training Week {workout.weekCount}
          {workout.weekCount >= 4 && <span style={S.weekWarning}> · Deload recommended</span>}
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
          <div style={lockedCardStyles.icon}>🔒</div>
          <div style={lockedCardStyles.title}>Smart Training Intelligence</div>
          <div style={lockedCardStyles.desc}>
            Fatigue tracking, weekly insights, adaptive rest, and mid-workout suggestions.
          </div>
          <div style={lockedCardStyles.price}>Unlock smart training — $2/mo</div>
        </div>
      )}

      {Object.keys(workout.personalRecords).length > 0 && (
        <div style={S.chartBox}>
          <h3 style={S.chartTitle}>🏆 Personal Records</h3>
          <div style={S.prGrid}>
            {Object.entries(workout.personalRecords).map(([name, weight]) => (
              <div key={name} style={S.prItem} onClick={() => onShowExerciseHistory(name)}>
                <div style={S.prName}>{name}</div>
                <div style={S.prWeight}>{weight}kg</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={S.chartBox}>
        <div style={S.chartHeader}>
          <h3 style={S.chartTitle}>📏 Body Measurements</h3>
          <button onClick={onOpenMeasurements} style={S.addMeasureBtn}>+ LOG</button>
        </div>
        {weightData.length > 1 ? (
          <>
            <MiniChart data={weightData} color="#3B82F6" height={60} />
            <div style={S.measureSummary}>
              <span>Current: {progress.bodyMeasurements[progress.bodyMeasurements.length - 1]?.weight}kg</span>
              <span>Start: {progress.bodyMeasurements[0]?.weight}kg</span>
            </div>
          </>
        ) : (
          <p style={S.emptyText}>Log measurements to track progress</p>
        )}
      </div>

      <div style={S.chartBox}>
        <h3 style={S.chartTitle}>🍽️ Today's Nutrition</h3>
        <div style={S.nutritionCards}>
          <div style={S.nutritionCard} onClick={onOpenNutrition}>
            <div style={S.nutritionCardHeader}><span style={{ fontSize: '1.25rem' }}>💧</span><span style={S.nutritionCardTitle}>Water</span></div>
            <div style={S.nutritionCardValue}>{nutrition.todayWater}<span style={S.nutritionCardUnit}>/{WATER_GOAL}</span></div>
            <div style={S.miniProgress}><div style={{ ...S.miniProgressFill, width: `${(nutrition.todayWater / WATER_GOAL) * 100}%`, background: '#3B82F6' }} /></div>
            <button onClick={e => { e.stopPropagation(); nutrition.addWater(); }} style={S.nutritionCardBtn}>+ ADD</button>
          </div>
          <div style={S.nutritionCard} onClick={onOpenNutrition}>
            <div style={S.nutritionCardHeader}><span style={{ fontSize: '1.25rem' }}>🥩</span><span style={S.nutritionCardTitle}>Protein</span></div>
            <div style={S.nutritionCardValue}>{nutrition.todayProtein}<span style={S.nutritionCardUnit}>g</span></div>
            <div style={S.miniProgress}><div style={{ ...S.miniProgressFill, width: `${Math.min(100, (nutrition.todayProtein / proteinGoal) * 100)}%`, background: '#34C759' }} /></div>
            <button onClick={e => { e.stopPropagation(); onOpenNutrition(); }} style={S.nutritionCardBtn}>+ LOG</button>
          </div>
        </div>
      </div>

      <div style={S.chartBox}>
        <h3 style={S.chartTitle}>📊 Protein (7 Days)</h3>
        <MiniChart data={proteinData.length ? proteinData : [0]} color="#34C759" height={60} />
        <div style={S.chartLabels}><span>7 days ago</span><span>Today</span></div>
      </div>

      {workout.workoutHistory.length > 0 && (
        <div style={S.chartBox}>
          <h3 style={S.chartTitle}>📋 Recent Workouts</h3>
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
        <h3 style={S.chartTitle}>👤 Profile</h3>
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
