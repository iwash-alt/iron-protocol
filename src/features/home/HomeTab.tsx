import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { UserProfile, WorkoutLog } from '@/shared/types';
import { usePlan } from '@/features/training-plan/PlanContext';
import { useWorkout } from '@/features/workout/WorkoutContext';
import { useWorkoutStreak } from '@/shared/hooks';
import { useTier } from '@/hooks/useTier';
import { getGreeting, getLast7Days, getTodayKey, formatVolume } from '@/shared/utils';
import { calculateFatigueScore } from '@/training/fatigue';
import { Icon } from '@/shared/components';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { computeGhostRecord, countThisWeekSessions, estimateWorkoutMinutes } from './home.utils';

interface HomeTabProps {
  profile: UserProfile;
  onNavigateToWorkout: () => void;
}

export function HomeTab({ profile, onNavigateToWorkout }: HomeTabProps) {
  const plan = usePlan();
  const workout = useWorkout();
  const { currentStreak } = useWorkoutStreak(workout.workoutHistory);
  const { canAccess } = useTier();

  const firstName = profile.name?.split(' ')[0] || 'Athlete';
  const greeting = getGreeting();
  const todayKey = getTodayKey();

  const workoutDates = useMemo(() => {
    return new Set(workout.workoutHistory.map((w) => w.date));
  }, [workout.workoutHistory]);

  const thisWeekSessions = useMemo(() => {
    return countThisWeekSessions(workout.workoutHistory, getLast7Days());
  }, [workout.workoutHistory]);

  const estimatedMinutes = useMemo(() => {
    return estimateWorkoutMinutes(plan.dayExercises);
  }, [plan.dayExercises]);

  const fatigue = useMemo(() => {
    if (workout.workoutHistory.length < 2) return null;
    return calculateFatigueScore(workout.workoutHistory, workout.exerciseHistory);
  }, [workout.workoutHistory, workout.exerciseHistory]);

  const recentWorkouts = useMemo(() => {
    return workout.workoutHistory.slice(-3).reverse();
  }, [workout.workoutHistory]);

  const ghostRecord = useMemo(() => {
    if (!canAccess('analytics_advanced')) return null;
    return computeGhostRecord(workout.workoutHistory);
  }, [workout.workoutHistory, canAccess]);

  return (
    <div>
      <CalendarStrip
        todayKey={todayKey}
        workoutDates={workoutDates}
        workoutHistory={workout.workoutHistory}
      />

      {/* Greeting */}
      <div style={hs.greeting}>
        <h2 style={hs.greetingText}>Good {greeting}, {firstName}</h2>
        <p style={hs.greetingSub}>Here&apos;s your training overview</p>
      </div>

      {/* Today's Workout Card */}
      {plan.days.length > 0 && plan.currentDay ? (
        <div style={hs.workoutCard}>
          <div style={hs.sectionLabel}>TODAY&apos;S WORKOUT</div>
          <h3 style={hs.dayName}>{plan.currentDay.name}</h3>
          <div style={hs.workoutMeta}>
            <span>{plan.dayExercises.length} exercises</span>
            <span style={hs.dot} />
            <span>~{estimatedMinutes} min</span>
          </div>
          {plan.dayExercises.length > 0 && (
            <div style={hs.exercisePreview}>
              {plan.dayExercises.slice(0, 3).map((pe) => (
                <div key={pe.id} style={hs.exercisePreviewItem}>
                  {pe.exercise.name}
                </div>
              ))}
              {plan.dayExercises.length > 3 && (
                <div style={{ color: colors.textMuted, fontSize: typography.sizes.sm }}>
                  +{plan.dayExercises.length - 3} more
                </div>
              )}
            </div>
          )}
          <button style={hs.startButton} onClick={onNavigateToWorkout}>
            START WORKOUT
          </button>
        </div>
      ) : (
        <div style={hs.emptyCard}>
          <div style={hs.sectionLabel}>TODAY&apos;S WORKOUT</div>
          <p style={{ color: colors.textSecondary, margin: `${spacing.sm}px 0` }}>
            No training plan configured yet.
          </p>
          <button style={hs.startButton} onClick={onNavigateToWorkout}>
            SET UP PLAN
          </button>
        </div>
      )}

      {/* Quick Stats Row */}
      <div style={hs.statsRow}>
        <div style={hs.statCard}>
          <div style={hs.statIcon}><Icon name="flame" size={18} /></div>
          <div style={hs.statValue}>{currentStreak}</div>
          <div style={hs.statLabel}>Streak</div>
        </div>
        <div style={hs.statCard}>
          <div style={{ ...hs.statIcon, color: colors.info }}>
            <Icon name="chart" size={18} />
          </div>
          <div style={hs.statValue}>{thisWeekSessions}/{profile.days}</div>
          <div style={hs.statLabel}>This Week</div>
        </div>
        <div style={hs.statCard}>
          <div style={{ ...hs.statIcon, color: fatigue ? getFatigueColor(fatigue.score) : colors.textMuted }}>
            <Icon name="fire" size={18} />
          </div>
          <div style={hs.statValue}>
            {fatigue ? fatigue.score : '--'}
          </div>
          <div style={hs.statLabel}>Fatigue</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={hs.section}>
        <div style={hs.sectionLabel}>RECENT ACTIVITY</div>
        {recentWorkouts.length > 0 ? (
          <div style={hs.recentList}>
            {recentWorkouts.map((w, i) => (
              <div key={`${w.date}-${i}`} style={hs.recentItem}>
                <div>
                  <div style={hs.recentDay}>{w.dayName}</div>
                  <div style={hs.recentDate}>{formatDate(w.date)}</div>
                </div>
                <div style={hs.recentRight}>
                  <div style={hs.recentVol}>{formatVolume(w.totalVolumeKg, { abbreviated: true })}</div>
                  <div style={{ ...hs.recentPct, color: w.completionPercent >= 100 ? colors.success : colors.warning }}>
                    {Math.round(w.completionPercent)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={hs.emptyState}>
            Complete your first workout to see your activity here.
          </div>
        )}
      </div>

      {/* Ghost Status (Pro only) */}
      {ghostRecord && (ghostRecord.wins > 0 || ghostRecord.losses > 0) && (
        <div style={hs.ghostCard}>
          <div>
            <div style={hs.sectionLabel}>GHOST RECORD</div>
            <div style={hs.ghostScore}>
              <span style={{ color: colors.success }}>{ghostRecord.wins}W</span>
              {' – '}
              <span style={{ color: colors.primary }}>{ghostRecord.losses}L</span>
            </div>
          </div>
          <div style={hs.ghostStreak}>
            {ghostRecord.wins > ghostRecord.losses ? (
              <Icon name="flame" size={20} />
            ) : (
              <Icon name="chart" size={20} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Calendar Strip ──────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SWIPE_THRESHOLD = 50;

interface CalendarStripProps {
  todayKey: string;
  workoutDates: Set<string>;
  workoutHistory: WorkoutLog[];
}

function CalendarStrip({ todayKey, workoutDates, workoutHistory }: CalendarStripProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const touchStartX = useRef(0);

  const weekDays = useMemo(() => {
    const today = new Date(todayKey + 'T12:00:00');
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + weekOffset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = d.toISOString().split('T')[0];
      const dayNum = d.getDate();
      const isFuture = key > todayKey;
      return {
        key,
        label: DAY_LABELS[i],
        dayNum,
        isToday: key === todayKey,
        hasWorkout: workoutDates.has(key),
        isFuture,
      };
    });
  }, [todayKey, workoutDates, weekOffset]);

  const monthLabel = useMemo(() => {
    const first = new Date(weekDays[0].key + 'T12:00:00');
    const last = new Date(weekDays[6].key + 'T12:00:00');
    const firstMonth = MONTH_NAMES[first.getMonth()];
    const lastMonth = MONTH_NAMES[last.getMonth()];
    const firstYear = first.getFullYear();
    const lastYear = last.getFullYear();

    if (firstYear !== lastYear) {
      return `${firstMonth} ${firstYear} – ${lastMonth} ${lastYear}`;
    }
    if (firstMonth !== lastMonth) {
      return `${firstMonth} – ${lastMonth} ${firstYear}`;
    }
    return `${firstMonth} ${firstYear}`;
  }, [weekDays]);

  const selectedWorkout = useMemo(() => {
    if (!selectedDate) return null;
    return workoutHistory.find((w) => w.date === selectedDate) ?? null;
  }, [selectedDate, workoutHistory]);

  const handlePrevWeek = useCallback(() => {
    setWeekOffset((o) => o - 1);
  }, []);

  const handleNextWeek = useCallback(() => {
    setWeekOffset((o) => Math.min(o + 1, 0));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta > 0) {
        setWeekOffset((o) => o - 1);
      } else {
        setWeekOffset((o) => Math.min(o + 1, 0));
      }
    }
  }, []);

  const handleDayTap = useCallback((day: { key: string; hasWorkout: boolean }) => {
    if (day.hasWorkout) {
      setSelectedDate(day.key);
    }
  }, []);

  return (
    <>
      <div style={hs.calSticky}>
        {/* Month header */}
        <div style={hs.calHeader}>
          <button style={hs.calHeaderBtn} onClick={handlePrevWeek} aria-label="Previous week">
            <Icon name="chevron-left" size={16} />
          </button>
          <span style={hs.calHeaderLabel}>{monthLabel}</span>
          <button
            style={{ ...hs.calHeaderBtn, ...(weekOffset >= 0 ? { opacity: 0.2, pointerEvents: 'none' as const } : {}) }}
            onClick={handleNextWeek}
            aria-label="Next week"
          >
            <Icon name="chevron-right" size={16} />
          </button>
        </div>

        {/* Day cells */}
        <div
          style={hs.calStrip}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {weekDays.map((day) => (
            <div
              key={day.key}
              style={{
                ...hs.calDay,
                ...(day.isToday ? hs.calDayToday : {}),
                ...(day.isFuture ? { opacity: 0.3 } : {}),
                ...(day.hasWorkout && !day.isFuture ? { cursor: 'pointer' } : {}),
              }}
              onClick={() => handleDayTap(day)}
            >
              <span style={hs.calLabel}>{day.label}</span>
              <span style={{ fontWeight: day.isToday ? typography.weights.black : typography.weights.medium, fontSize: typography.sizes.lg }}>
                {day.dayNum}
              </span>
              {day.hasWorkout && <span style={hs.calDot} />}
            </div>
          ))}
        </div>
      </div>

      {selectedWorkout && selectedDate && (
        <WorkoutSummarySheet
          date={selectedDate}
          workout={selectedWorkout}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}

// ── Workout Summary Bottom Sheet ────────────────────────────────────────────

function WorkoutSummarySheet({ date, workout, onClose }: { date: string; workout: WorkoutLog; onClose: () => void }) {
  const exerciseSummaries = useMemo(() => {
    const map = new Map<string, { sets: number; topWeight: number; topReps: number }>();
    for (const set of workout.sets) {
      const existing = map.get(set.exerciseName);
      if (existing) {
        existing.sets++;
        if (set.weightKg > existing.topWeight || (set.weightKg === existing.topWeight && set.reps > existing.topReps)) {
          existing.topWeight = set.weightKg;
          existing.topReps = set.reps;
        }
      } else {
        map.set(set.exerciseName, { sets: 1, topWeight: set.weightKg, topReps: set.reps });
      }
    }
    return Array.from(map.entries());
  }, [workout.sets]);

  return (
    <div style={hs.sheetOverlay} onClick={onClose}>
      <div className="modal-sheet" style={hs.sheetContainer} onClick={(e) => e.stopPropagation()}>
        <div style={hs.sheetHandle} />
        <div style={hs.sheetDate}>{formatDate(date)}</div>
        <div style={hs.sheetDayName}>{workout.dayName}</div>

        <div style={hs.sheetStatsRow}>
          <div style={hs.sheetStat}>
            <div style={hs.sheetStatValue}>{formatVolume(workout.totalVolumeKg, { abbreviated: true })}</div>
            <div style={hs.sheetStatLabel}>Volume</div>
          </div>
          <div style={hs.sheetStat}>
            <div style={{ ...hs.sheetStatValue, color: workout.completionPercent >= 100 ? colors.success : colors.warning }}>
              {Math.round(workout.completionPercent)}%
            </div>
            <div style={hs.sheetStatLabel}>Completed</div>
          </div>
          <div style={hs.sheetStat}>
            <div style={hs.sheetStatValue}>{workout.sets.length}</div>
            <div style={hs.sheetStatLabel}>Sets</div>
          </div>
        </div>

        {exerciseSummaries.length > 0 && (
          <div style={hs.sheetExercises}>
            <div style={hs.sectionLabel}>EXERCISES</div>
            {exerciseSummaries.map(([name, info]) => (
              <div key={name} style={hs.sheetExItem}>
                <span style={hs.sheetExName}>{name}</span>
                <span style={hs.sheetExDetail}>
                  {info.sets}s · {info.topWeight}kg × {info.topReps}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getFatigueColor(score: number): string {
  if (score <= 30) return colors.success;
  if (score <= 50) return colors.warning;
  if (score <= 70) return '#FF9500';
  return colors.primary;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

// ── Styles ──────────────────────────────────────────────────────────────────

const hs: Record<string, React.CSSProperties> = {
  // Calendar — sticky wrapper
  calSticky: { position: 'sticky', top: 0, zIndex: 10, background: colors.background, paddingTop: spacing.sm, paddingBottom: spacing.xs, marginLeft: -spacing.xl, marginRight: -spacing.xl, paddingLeft: spacing.xl, paddingRight: spacing.xl },

  // Calendar — header
  calHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  calHeaderLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.textSecondary, letterSpacing: '0.05em' },
  calHeaderBtn: { background: 'none', border: 'none', color: colors.textSecondary, padding: spacing.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, minHeight: 36, borderRadius: radii.md },

  // Calendar — strip & day cells
  calStrip: { display: 'flex', justifyContent: 'space-between', gap: spacing.xs, padding: spacing.sm, borderRadius: radii.xl, background: colors.surface, border: `1px solid ${colors.surfaceBorder}` },
  calDay: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1, padding: `${spacing.sm}px 0`, borderRadius: radii.md, position: 'relative' },
  calDayToday: { background: colors.primarySurface, border: `1px solid ${colors.primaryBorder}` },
  calLabel: { fontSize: typography.sizes.xs, color: colors.textTertiary, fontWeight: typography.weights.bold },
  calDot: { width: 4, height: 4, borderRadius: '50%', background: colors.success, position: 'absolute' as const, bottom: 2 },

  // Greeting
  greeting: { marginBottom: spacing.xl },
  greetingText: { fontSize: typography.sizes['6xl'], fontWeight: typography.weights.black, margin: 0, color: colors.text },
  greetingSub: { fontSize: typography.sizes.lg, color: colors.textSecondary, margin: `4px 0 0` },

  // Today's Workout Card
  workoutCard: { padding: spacing.xl, borderRadius: radii.xxl, background: `linear-gradient(135deg, ${colors.primarySurface} 0%, rgba(255,59,48,0.05) 100%)`, border: `1px solid ${colors.primaryBorder}`, marginBottom: spacing.lg },
  emptyCard: { padding: spacing.xl, borderRadius: radii.xxl, background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, marginBottom: spacing.lg },
  dayName: { fontSize: typography.sizes['5xl'], fontWeight: typography.weights.black, margin: `${spacing.sm}px 0` },
  workoutMeta: { display: 'flex', alignItems: 'center', gap: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.base, marginBottom: spacing.md },
  dot: { width: 4, height: 4, borderRadius: '50%', background: colors.textMuted },
  exercisePreview: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: spacing.md },
  exercisePreviewItem: { fontSize: typography.sizes.base, color: colors.textSecondary, paddingLeft: spacing.sm },
  startButton: { width: '100%', padding: '14px', borderRadius: radii.xl, border: 'none', background: colors.primaryGradient, color: colors.text, cursor: 'pointer', fontWeight: typography.weights.black, fontSize: typography.sizes.lg, boxShadow: `0 4px 15px ${colors.primaryGlow}`, marginTop: spacing.sm },

  // Quick Stats
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { padding: `${spacing.md}px ${spacing.sm}px`, borderRadius: radii.lg, background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  statIcon: { color: colors.warning },
  statValue: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.black },
  statLabel: { fontSize: typography.sizes.xs, color: colors.textTertiary, fontWeight: typography.weights.bold, letterSpacing: '0.05em' },

  // Section
  section: { marginBottom: spacing.lg },
  sectionLabel: { fontSize: typography.sizes.xs, fontWeight: typography.weights.black, color: colors.textTertiary, letterSpacing: '0.1em', marginBottom: spacing.sm },

  // Recent Activity
  recentList: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  recentItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${spacing.md}px ${spacing.lg}px`, borderRadius: radii.lg, background: colors.surface, border: `1px solid ${colors.surfaceBorder}` },
  recentDay: { fontWeight: typography.weights.bold, fontSize: typography.sizes.base },
  recentDate: { fontSize: typography.sizes.sm, color: colors.textTertiary, marginTop: 2 },
  recentRight: { textAlign: 'right' },
  recentVol: { fontWeight: typography.weights.bold, fontSize: typography.sizes.base },
  recentPct: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, marginTop: 2 },

  // Empty
  emptyState: { color: colors.textMuted, fontSize: typography.sizes.base, padding: `${spacing.lg}px 0` },

  // Ghost
  ghostCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${spacing.lg}px ${spacing.xl}px`, borderRadius: radii.xl, background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, marginBottom: spacing.lg },
  ghostScore: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.black, marginTop: 4 },
  ghostStreak: { color: colors.warning },

  // Workout Summary Sheet
  sheetOverlay: { position: 'fixed', inset: 0, background: colors.overlay, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-end' },
  sheetContainer: { width: '100%', background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)', borderRadius: '20px 20px 0 0', padding: `${spacing.xl}px`, paddingBottom: 'max(24px, env(safe-area-inset-bottom))', maxHeight: '70vh', overflowY: 'auto' },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: `0 auto ${spacing.lg}px` },
  sheetDate: { fontSize: typography.sizes.sm, color: colors.textTertiary, fontWeight: typography.weights.bold, letterSpacing: '0.05em' },
  sheetDayName: { fontSize: typography.sizes['5xl'], fontWeight: typography.weights.black, margin: `${spacing.xs}px 0 ${spacing.lg}px` },
  sheetStatsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.sm, marginBottom: spacing.xl },
  sheetStat: { textAlign: 'center', padding: `${spacing.md}px ${spacing.sm}px`, borderRadius: radii.lg, background: colors.surface, border: `1px solid ${colors.surfaceBorder}` },
  sheetStatValue: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.black },
  sheetStatLabel: { fontSize: typography.sizes.xs, color: colors.textTertiary, fontWeight: typography.weights.bold, letterSpacing: '0.05em', marginTop: 2 },
  sheetExercises: { marginTop: spacing.md },
  sheetExItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${spacing.sm}px 0`, borderBottom: `1px solid ${colors.surfaceBorder}` },
  sheetExName: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.text },
  sheetExDetail: { fontSize: typography.sizes.sm, color: colors.textSecondary },
};
