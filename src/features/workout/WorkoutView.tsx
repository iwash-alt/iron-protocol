import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { PlanExercise, RPEValue, Exercise, EquipmentFilter, MuscleFilter } from '@/shared/types';
import { EQUIPMENT_FILTER_OPTIONS, MUSCLE_FILTER_OPTIONS, MUSCLE_FILTER_MAP, isLowerBody } from '@/shared/types';
import { usePlan } from '@/features/training-plan/PlanContext';
import { useWorkout } from './WorkoutContext';
import { useTimer, getAdaptiveRest } from '@/shared/hooks';
import { Icon, MiniChart } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { TIMINGS } from '@/shared/constants/timings';
import { getWarmupSets, formatTime, formatVolume } from '@/shared/utils';
import { workoutTemplates } from '@/data/templates';
import type { UserProfile } from '@/shared/types';
import { useTier } from '@/hooks/useTier';
import { calculateFatigueScore } from '@/training/fatigue';
import { evaluateSuggestions } from '@/training/suggestions';
import { formatProgressionBanner } from '@/training/progression';
import type { WorkoutSuggestion } from '@/training/suggestions';
import { SuggestionToast } from './SuggestionToast';
import { ReadinessCheck, getTodayReadiness } from '@/features/readiness/ReadinessCheck';
import type { ReadinessResult } from '@/features/readiness/ReadinessCheck';
import { HowToModal } from '@/ui/modals/HowToModal';
import { WorkoutSummary, buildWorkoutSummary } from './WorkoutSummary';
import type { WorkoutSummaryData } from './WorkoutSummary';


type ExerciseDataModule = typeof import('@/data/exercises');

/** Map a raw MuscleGroup (e.g. 'Lats') to its curated filter value (e.g. 'Back') */
function toCuratedMuscle(raw: string): MuscleFilter {
  for (const [filter, groups] of Object.entries(MUSCLE_FILTER_MAP)) {
    if ((groups as readonly string[]).includes(raw)) return filter as MuscleFilter;
  }
  return 'All';
}

interface WorkoutViewProps {
  profile: UserProfile;
}

interface CustomWorkoutDraftExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  weightKg: number;
}

interface CustomWorkoutDraftDay {
  id: string;
  name: string;
  exercises: CustomWorkoutDraftExercise[];
}

interface CustomWorkoutDraft {
  name: string;
  daysPerWeek: number;
  days: CustomWorkoutDraftDay[];
}

const EMPTY_CUSTOM_WORKOUT_DRAFT: CustomWorkoutDraft = {
  name: 'Custom Program',
  daysPerWeek: 1,
  days: [{ id: 'draft-day-1', name: '', exercises: [] }],
};


// ── Inline Editable Field ─────────────────────────────────────────────────────
// Tappable number field with +/- buttons for gym use (large touch targets).

interface InlineEditProps {
  value: number;
  step: number;
  min: number;
  max: number;
  /** 'decimal' for weight, 'numeric' for reps */
  inputMode: 'decimal' | 'numeric';
  color: string;
  suffix?: string;
  onChange: (val: number) => void;
}

function InlineEdit({ value, step, min, max, inputMode, color, suffix = '', onChange }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Sync draft when value changes externally
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const commit = useCallback(() => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      // Round to step precision
      const rounded = Math.round(clamped / step) * step;
      // Fix floating point: round to 1 decimal
      const fixed = Math.round(rounded * 10) / 10;
      onChange(fixed);
    }
    setEditing(false);
  }, [draft, min, max, step, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <div style={ie.editRow}>
        <button
          onClick={() => {
            const next = Math.max(min, value - step);
            const fixed = Math.round(next * 10) / 10;
            onChange(fixed);
            setDraft(String(fixed));
          }}
          style={ie.stepBtn}
        >
          -
        </button>
        <input
          ref={inputRef}
          type="text"
          inputMode={inputMode}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          style={{ ...ie.input, color }}
        />
        <button
          onClick={() => {
            const next = Math.min(max, value + step);
            const fixed = Math.round(next * 10) / 10;
            onChange(fixed);
            setDraft(String(fixed));
          }}
          style={ie.stepBtn}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      style={{ ...ie.display, color, cursor: 'pointer' }}
      role="button"
      tabIndex={0}
    >
      {value}{suffix}
    </div>
  );
}

const ie: Record<string, React.CSSProperties> = {
  editRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    border: 'none',
    background: colors.surfaceHover,
    color: colors.text,
    cursor: 'pointer',
    fontWeight: typography.weights.black,
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  input: {
    width: 52,
    textAlign: 'center' as const,
    background: 'rgba(255,255,255,0.08)',
    border: `1px solid ${colors.primaryBorder}`,
    borderRadius: radii.sm,
    color: colors.text,
    fontWeight: typography.weights.black,
    fontSize: typography.sizes.xl,
    padding: '4px 2px',
    outline: 'none',
  },
  display: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
  },
};

// ── WorkoutView ───────────────────────────────────────────────────────────────

export function WorkoutView({ profile }: WorkoutViewProps) {
  const plan = usePlan();
  const workout = useWorkout();
  const { canAccess } = useTier();
  const isPro = canAccess('analytics_advanced');

  // Modal states
  const [showWarmup, setShowWarmup] = useState<string | null>(null);
  const [showHowTo, setShowHowTo] = useState<Exercise | null>(null);
  const [showSwap, setShowSwap] = useState<PlanExercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<PlanExercise | null>(null);
  const [showRPE, setShowRPE] = useState<{ exerciseId: string; setNum: number; exercise: PlanExercise } | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCustomWorkout, setShowCustomWorkout] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showExerciseHistory, setShowExerciseHistory] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [justCompleted, setJustCompleted] = useState<{ exerciseId: string; setNum: number } | null>(null);
  const [restTimerEnding, setRestTimerEnding] = useState(false);
  const [restPulseTarget, setRestPulseTarget] = useState<string | null>(null);
  const [customBuilderStep, setCustomBuilderStep] = useState<1 | 2 | 3 | 4>(1);
  const [customWorkoutDraft, setCustomWorkoutDraft] = useState<CustomWorkoutDraft>(EMPTY_CUSTOM_WORKOUT_DRAFT);
  const [selectedBuilderDayId, setSelectedBuilderDayId] = useState<string | null>(null);

  // Exercise browser filter states (shared between Add and Swap modals)
  const [exSearch, setExSearch] = useState('');
  const [exEquipment, setExEquipment] = useState<EquipmentFilter>('All');
  const [exMuscle, setExMuscle] = useState<MuscleFilter>('All');

  const [exerciseData, setExerciseData] = useState<ExerciseDataModule | null>(null);

  // Ref to hold the current "next exercise" ID for the timer complete callback
  const nextExerciseIdRef = useRef<string | null>(null);

  const handleTimerComplete = useCallback(() => {
    // Brief vibration on timer end
    navigator.vibrate?.(100);

    // Pulse the next exercise card
    const targetId = nextExerciseIdRef.current;
    if (targetId) {
      setRestPulseTarget(targetId);
      setTimeout(() => setRestPulseTarget(null), TIMINGS.REST_PULSE_DURATION);
    }

    // Slide-up collapse animation
    setRestTimerEnding(true);
    setTimeout(() => setRestTimerEnding(false), TIMINGS.REST_BANNER_COLLAPSE);
  }, []);

  const timer = useTimer(handleTimerComplete);

  useEffect(() => {
    if (!showAddExercise && !showSwap && !showExerciseHistory) return;
    let mounted = true;
    import('@/data/exercises').then((mod) => {
      if (mounted) setExerciseData(mod);
    });
    return () => { mounted = false; };
  }, [showAddExercise, showSwap, showExerciseHistory]);

  // Filtered exercise list for dual-filter
  const filteredExercises = useMemo(() => {
    if (!exerciseData) return [];
    return exerciseData.filterExercises({ search: exSearch, equipment: exEquipment, muscle: exMuscle });
  }, [exerciseData, exSearch, exEquipment, exMuscle]);

  // Intelligence features (Pro only)
  const [activeSuggestion, setActiveSuggestion] = useState<WorkoutSuggestion | null>(null);
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<Set<string>>(new Set());
  const [showReadinessCheck, setShowReadinessCheck] = useState<boolean>(() => {
    if (!isPro) return false;
    return !getTodayReadiness();
  });
  const [_readinessResult, setReadinessResult] = useState<ReadinessResult | null>(null);

  // Workout summary (Change 3)
  const [summaryData, setSummaryData] = useState<WorkoutSummaryData | null>(null);
  const workoutStartedAt = useRef<number | null>(null);

  const fatigue = useMemo(() => {
    if (!isPro || workout.workoutHistory.length < 2) return null;
    return calculateFatigueScore(workout.workoutHistory, workout.exerciseHistory);
  }, [isPro, workout.workoutHistory, workout.exerciseHistory]);

  // Derive "next exercise" info for the rest timer banner
  const nextExerciseInfo = useMemo(() => {
    const timerId = workout.restTimerFor;
    if (!timerId) return null;

    const exercises = plan.dayExercises;
    const currentIndex = exercises.findIndex(pe => pe.id === timerId);
    if (currentIndex === -1) return null;

    const current = exercises[currentIndex];
    const done = workout.completedSets[current.id] || 0;

    // Still has sets remaining on the same exercise
    if (done < current.sets) {
      const weight = current.exercise.isBodyweight ? 'BW' : `${current.weightKg}kg`;
      return {
        id: current.id,
        text: `${current.exercise.name} \u2014 Set ${done + 1} \u2014 ${weight} \u00d7 ${current.reps}`,
      };
    }

    // All sets done — find next incomplete exercise
    for (let i = currentIndex + 1; i < exercises.length; i++) {
      const pe = exercises[i];
      const peDone = workout.completedSets[pe.id] || 0;
      if (peDone < pe.sets) {
        const weight = pe.exercise.isBodyweight ? 'BW' : `${pe.weightKg}kg`;
        return {
          id: pe.id,
          text: `${pe.exercise.name} \u2014 Set ${peDone + 1} \u2014 ${weight} \u00d7 ${pe.reps}`,
        };
      }
    }

    return null; // All exercises complete
  }, [workout.restTimerFor, workout.completedSets, plan.dayExercises]);

  // Keep the ref in sync for the timer complete callback
  useEffect(() => {
    nextExerciseIdRef.current = nextExerciseInfo?.id ?? null;
  }, [nextExerciseInfo]);

  const completeSet = (pe: PlanExercise) => {
    const done = workout.completedSets[pe.id] || 0;
    if (done < pe.sets) {
      setShowRPE({ exerciseId: pe.id, setNum: done + 1, exercise: pe });
    }
  };

  const confirmRPE = (rpe: RPEValue) => {
    if (!showRPE) return;
    const { exercise } = showRPE;

    // Start tracking workout duration on first set
    if (!workoutStartedAt.current) {
      workoutStartedAt.current = Date.now();
    }

    workout.completeSet(exercise, rpe);

    // Haptic feedback for set completion
    navigator.vibrate?.(15);

    // Trigger set completion animation
    const completedSetNum = (workout.completedSets[exercise.id] || 0) + 1;
    setJustCompleted({ exerciseId: exercise.id, setNum: completedSetNum });
    setTimeout(() => setJustCompleted(null), TIMINGS.SET_COMPLETE_DURATION);

    // Adaptive rest timer (Pro) or default
    if (isPro) {
      const adaptive = getAdaptiveRest(exercise, rpe);
      timer.start(adaptive.seconds, adaptive.label);
    } else {
      timer.start(exercise.restSeconds);
    }

    // Mid-workout suggestions (Pro)
    if (isPro) {
      const suggestions = evaluateSuggestions(
        workout.currentLog,
        exercise,
        rpe,
        workout.exerciseHistory,
        fatigue,
      );
      const newSuggestion = suggestions.find(s => !dismissedSuggestionIds.has(s.id));
      if (newSuggestion) {
        setActiveSuggestion(newSuggestion);
      }
    }

    const setNum = (workout.completedSets[exercise.id] || 0) + 1;
    if (setNum === exercise.sets) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), TIMINGS.CELEBRATION_DURATION);
    }
    setShowRPE(null);
  };

  const handleEndWorkout = (force = false) => {
    if (!force && workout.progress() < 100) {
      setShowEndConfirm(true);
      return;
    }

    // Capture summary BEFORE endWorkout resets state
    const summary = buildWorkoutSummary(
      plan.currentDay?.name || '',
      plan.dayExercises,
      workout.completedSets,
      workout.currentLog,
      workoutStartedAt.current,
      workout.progress(),
      workout.workoutHistory,
    );

    workout.endWorkout(force);
    setShowEndConfirm(false);
    workoutStartedAt.current = null;

    // Show summary instead of celebrate animation
    setSummaryData(summary);
  };

  const handleSummaryDone = () => {
    setSummaryData(null);
  };

  const updateExerciseField = (id: string, field: string, value: number) => {
    plan.updateExercise(id, { [field]: value });
    if (editingExercise?.id === id) {
      setEditingExercise(prev => prev ? { ...prev, [field]: value } : prev);
    }
  };

  const handleApplyTemplate = (key: string) => {
    plan.initialize(profile, key);
    workout.resetWorkoutState();
    setShowTemplates(false);
  };

  const updateDraftExerciseField = (dayId: string, exerciseIndex: number, patch: Partial<CustomWorkoutDraftExercise>) => {
    setCustomWorkoutDraft(prev => ({
      ...prev,
      days: prev.days.map(day => day.id === dayId
        ? { ...day, exercises: day.exercises.map((ex, i) => i === exerciseIndex ? { ...ex, ...patch } : ex) }
        : day),
    }));
  };

  const removeDraftExercise = (dayId: string, exerciseIndex: number) => {
    setCustomWorkoutDraft(prev => ({
      ...prev,
      days: prev.days.map(day => day.id === dayId
        ? { ...day, exercises: day.exercises.filter((_, i) => i !== exerciseIndex) }
        : day),
    }));
  };

  const reorderDraftExercise = (dayId: string, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setCustomWorkoutDraft(prev => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.id !== dayId) return day;
        const exercises = [...day.exercises];
        const [moved] = exercises.splice(fromIndex, 1);
        exercises.splice(toIndex, 0, moved);
        return { ...day, exercises };
      }),
    }));
  };

  const resetCustomWorkoutBuilder = () => {
    setCustomBuilderStep(1);
    setSelectedBuilderDayId(null);
    setCustomWorkoutDraft(EMPTY_CUSTOM_WORKOUT_DRAFT);
  };

  const handleCustomWorkoutDraftDaysChange = (daysPerWeek: number) => {
    setCustomWorkoutDraft(prev => {
      const nextDays = Array.from({ length: daysPerWeek }, (_, i) => {
        const existing = prev.days[i];
        return existing ?? {
          id: `draft-day-${i + 1}`,
          name: '',
          exercises: [],
        };
      });
      return { ...prev, daysPerWeek, days: nextDays };
    });
  };

  const handleCreateCustomWorkout = () => {
    const programName = customWorkoutDraft.name.trim() || 'Custom Program';
    plan.createCustomWorkout({
      name: programName,
      days: customWorkoutDraft.daysPerWeek,
      dayExercises: customWorkoutDraft.days.map((day, index) => ({
        name: day.name.trim() || `Day ${index + 1}`,
        exercises: day.exercises.map(de => ({
          exercise: de.exercise,
          sets: de.sets,
          reps: de.reps,
          weightKg: de.weightKg,
        })),
      })),
    });
    workout.resetWorkoutState();
    setShowAddExercise(false);
    setSelectedBuilderDayId(null);
    setShowCustomWorkout(false);
    setShowTemplates(false);
    resetCustomWorkoutBuilder();
  };

  const handleDayChange = (index: number) => {
    plan.setDayIndex(index);
    workout.resetWorkoutState();
  };

  const prog = workout.progress();

  // Show workout summary overlay (Change 3)
  if (summaryData) {
    return <WorkoutSummary summary={summaryData} onDone={handleSummaryDone} />;
  }

  return (
    <>
      {celebrate && <div style={S.celebrate}><div style={S.celebContent}><div style={{ fontSize: 48 }}>🏆</div><div style={S.celebTitle}>GREAT WORK!</div></div></div>}

      {/* Day tabs */}
      <div style={S.tabs}>
        {plan.days.map((d, i) => (
          <button key={d.id} onClick={() => handleDayChange(i)} style={{ ...S.tab, ...(plan.dayIndex === i ? S.tabActive : {}) }}>
            {d.name.toUpperCase()}
          </button>
        ))}
        <button onClick={() => setShowTemplates(true)} style={S.tabSettings}>⚙️</button>
      </div>

      {/* Progress bar */}
      <div style={S.progBar}>
        <div style={S.progHeader}><span style={S.progLabel}>WORKOUT PROGRESS</span><span style={S.progPct}>{prog}%</span></div>
        <div style={S.progTrack}><div style={{ ...S.progFill, width: `${prog}%` }} /></div>
      </div>

      {/* Rest timer — sticky banner with progress bar & next preview */}
      {(timer.isActive || restTimerEnding) && (
        <div style={{
          ...S.restBanner,
          ...(restTimerEnding ? { animation: 'restBannerSlideUp 0.3s ease-out forwards' } : {}),
        }}>
          <div style={S.restTimerRow}>
            <div>
              <div style={S.restLabel}>{timer.label || 'REST'}</div>
              <div style={S.restTime}>{formatTime(timer.seconds)}</div>
            </div>
            <button onClick={timer.skip} style={S.skipBtn}>SKIP</button>
          </div>
          <div style={S.restProgressTrack}>
            <div style={{
              ...S.restProgressFill,
              width: timer.totalSeconds > 0 ? `${(timer.seconds / timer.totalSeconds) * 100}%` : '0%',
            }} />
          </div>
          {nextExerciseInfo && (
            <div style={S.restNextPreview}>
              Next: {nextExerciseInfo.text}
            </div>
          )}
        </div>
      )}

      {/* Mid-workout suggestion toast (Pro) */}
      {activeSuggestion && (
        <SuggestionToast
          suggestion={activeSuggestion}
          onDismiss={() => {
            setDismissedSuggestionIds(prev => new Set([...prev, activeSuggestion.id]));
            setActiveSuggestion(null);
          }}
        />
      )}

      {/* Exercise list */}
      <div style={S.exList}>
        {plan.dayExercises.map((pe, index) => {
          const done = workout.completedSets[pe.id] || 0;
          const isDone = done >= pe.sets;
          const isWarmupOpen = showWarmup === pe.id;
          const warmups = getWarmupSets(pe.weightKg);
          const hasHistory = (workout.exerciseHistory[pe.exercise.name]?.length || 0) > 0;
          const isFirstExercise = index === 0;
          const isLastExercise = index === plan.dayExercises.length - 1;

          // Current exercise volume from logged sets
          const currentExVol = workout.currentLog
            .filter(s => s.exerciseName === pe.exercise.name)
            .reduce((sum, s) => sum + s.weightKg * s.reps, 0);

          // Ghost/target: volume from last session of same day
          const previousSession = workout.workoutHistory
            .slice()
            .reverse()
            .find(w => w.dayName === plan.currentDay?.name);
          const previousExVol = previousSession
            ? previousSession.sets
                .filter(s => s.exerciseName === pe.exercise.name)
                .reduce((sum, s) => sum + s.weightKg * s.reps, 0)
            : 0;

          return (
            <div key={pe.id} style={{
              ...S.exCard,
              ...(isDone ? S.exDone : {}),
              ...(done > 0 && !isDone ? S.exInProgress : {}),
              ...(justCompleted?.exerciseId === pe.id && justCompleted.setNum === pe.sets ? S.exFinalFlash : {}),
              ...(restPulseTarget === pe.id ? { animation: 'restCardPulse 0.5s ease-out' } : {}),
            }}>
              <div style={S.exHeader}>
                <div>
                  <div style={S.exTags}>
                    <span style={S.muscleTag}>{pe.exercise.muscle}</span>
                    {isDone && <span style={S.doneTag}><Icon name="check" size={12} /> Done</span>}
                  </div>
                  <h3 style={{ ...S.exName, color: isDone ? '#34C759' : '#fff' }}>{pe.exercise.name}</h3>
                  <div style={orderStyles.row}>
                    <button
                      onClick={() => plan.reorderDayExercises(index, index - 1)}
                      disabled={isFirstExercise}
                      style={{ ...orderStyles.button, ...(isFirstExercise ? orderStyles.buttonDisabled : {}) }}
                      aria-label={`Move ${pe.exercise.name} up`}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => plan.reorderDayExercises(index, index + 1)}
                      disabled={isLastExercise}
                      style={{ ...orderStyles.button, ...(isLastExercise ? orderStyles.buttonDisabled : {}) }}
                      aria-label={`Move ${pe.exercise.name} down`}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
                <div style={S.exActions}>
                  {hasHistory && <button onClick={() => setShowExerciseHistory(pe.exercise.name)} style={S.historyBtn}><Icon name="history" size={16} /></button>}
                  {!pe.exercise.isBodyweight && <button onClick={() => setShowWarmup(isWarmupOpen ? null : pe.id)} style={isWarmupOpen ? S.warmupBtnActive : S.warmupBtn}><Icon name="fire" size={16} /></button>}
                  <button onClick={() => setEditingExercise(pe)} style={S.editBtn}><Icon name="edit" size={16} /></button>
                  <button onClick={() => setShowSwap(pe)} style={S.swapBtn}><Icon name="swap" size={16} /></button>
                  <button onClick={() => setShowHowTo(pe.exercise)} style={howToBtn}>?</button>
                </div>
              </div>

              {isWarmupOpen && (
                <div style={S.warmupBox}>
                  <div style={S.warmupTitle}>WARM-UP SETS</div>
                  <div style={S.warmupGrid}>
                    {warmups.map((w, i) => (
                      <div key={i} style={S.warmupRow}>
                        <span style={S.warmupLabel}>{w.label}</span>
                        <span style={S.warmupVal}>{w.weightKg}kg x {w.reps}</span>
                        <input type="checkbox" style={{ accentColor: '#FF9500', width: 18, height: 18 }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats grid with inline editable weight + reps */}
              <div style={{ ...S.stats, gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div style={S.stat}>
                  <div style={S.statLabel}>SETS</div>
                  <div
                    key={`sets-${pe.id}-${done}`}
                    style={{
                      ...S.statVal,
                      ...(justCompleted?.exerciseId === pe.id ? S.setCountAnimate : {}),
                    }}
                  >
                    {done}/{pe.sets}
                  </div>
                  <div style={S.progressDots}>
                    {Array.from({ length: pe.sets }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          ...S.progressDot,
                          ...(i < done ? {
                            ...S.progressDotFilled,
                            animationDelay: justCompleted?.exerciseId === pe.id
                              ? `${i * 50}ms` : '0ms',
                          } : {}),
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={S.stat}>
                  <div style={S.statLabel}>REPS</div>
                  <InlineEdit
                    value={pe.reps}
                    step={1}
                    min={pe.repsMin ?? 1}
                    max={pe.repsMax ?? 30}
                    inputMode="numeric"
                    color={colors.text}
                    onChange={val => plan.updateExercise(pe.id, { reps: val })}
                  />
                </div>
                <div style={S.stat}>
                  <div style={S.statLabel}>WEIGHT</div>
                  {pe.exercise.isBodyweight ? (
                    <div style={S.statVal}>BW</div>
                  ) : (
                    <InlineEdit
                      value={pe.weightKg}
                      step={2.5}
                      min={0}
                      max={500}
                      inputMode="decimal"
                      color={colors.primary}
                      suffix="kg"
                      onChange={val => plan.updateExercise(pe.id, { weightKg: val })}
                    />
                  )}
                </div>
                <div style={S.stat}>
                  <div style={S.statLabel}>VOLUME</div>
                  <div style={S.statVal}>{formatVolume(currentExVol, { abbreviated: true })}</div>
                  {previousExVol > 0 && (
                    <div style={{
                      fontSize: typography.sizes.xs,
                      color: currentExVol >= previousExVol ? colors.success : colors.textTertiary,
                      marginTop: 2,
                    }}>
                      / {formatVolume(previousExVol, { abbreviated: true })}
                    </div>
                  )}
                </div>
              </div>

              {isDone && !pe.exercise.isBodyweight && pe.id in workout.progressions && (() => {
                const banner = formatProgressionBanner(
                  workout.progressions[pe.id],
                  pe.weightKg,
                );
                return (
                  <div style={{ ...progressionBannerStyles[banner.tone], animation: 'fadeInUp 0.35s ease both' }}>
                    <span style={progressionBannerStyles.icon}>{banner.icon}</span>
                    <div>
                      <div style={progressionBannerStyles.label}>{banner.label}</div>
                      <div style={progressionBannerStyles.subtext}>{banner.subtext}</div>
                    </div>
                  </div>
                );
              })()}

              {isDone && justCompleted?.exerciseId === pe.id && (
                <div style={{
                  textAlign: 'center' as const,
                  padding: '14px',
                  color: colors.success,
                  fontWeight: typography.weights.black,
                  fontSize: typography.sizes.lg,
                  animation: 'setComplete 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                  <Icon name="check" size={24} /> ALL SETS COMPLETE
                </div>
              )}

              {!isDone && (
                <button
                  onClick={() => completeSet(pe)}
                  disabled={timer.isActive && workout.restTimerFor === pe.id}
                  style={{ ...S.completeBtn, ...(timer.isActive && workout.restTimerFor === pe.id ? S.completeBtnOff : {}) }}
                >
                  {timer.isActive && workout.restTimerFor === pe.id ? `RESTING... ${formatTime(timer.seconds)}` : `COMPLETE SET ${done + 1}`}
                </button>
              )}
            </div>
          );
        })}
        <button onClick={() => setShowAddExercise(true)} style={S.addExerciseBtn}>
          <Icon name="plus" size={18} /> ADD EXERCISE
        </button>
      </div>

      {Object.keys(workout.completedSets).length > 0 && (
        <button onClick={() => handleEndWorkout()} style={S.finishBtn}>
          {prog >= 100 ? 'FINISH WORKOUT' : 'END WORKOUT EARLY'}
        </button>
      )}

      {/* === Modals === */}

      {/* RPE Modal */}
      {showRPE && (
        <div style={S.overlay}>
          <div style={S.rpeModal}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>💪</div>
            <h3 style={S.rpeTitle}>Set {showRPE.setNum} Complete!</h3>
            <p style={S.rpeSubtitle}>{showRPE.exercise.exercise.name}</p>
            <p style={S.rpeQuestion}>How hard was that?</p>
            <div style={S.rpeGrid}>
              {([6, 7, 8, 9, 10] as const).map(rpe => (
                <button key={rpe} onClick={() => confirmRPE(rpe)} style={{ ...S.rpeBtn, background: rpe <= 7 ? '#34C759' : rpe === 8 ? '#FF9500' : '#FF3B30' }}>
                  <div style={S.rpeNum}>{rpe}</div>
                  <div style={S.rpeLabel}>{rpe === 6 ? 'Easy' : rpe === 7 ? 'Moderate' : rpe === 8 ? 'Hard' : rpe === 9 ? 'Very Hard' : 'Failed'}</div>
                </button>
              ))}
            </div>
            <p style={S.rpeHint}>RPE 6-8 = progression · RPE 10 = reduce weight</p>
            <button onClick={() => setShowRPE(null)} style={S.rpeCancel}>CANCEL</button>
          </div>
        </div>
      )}

      {/* Edit Exercise Modal */}
      {editingExercise && (
        <div style={S.overlay} onClick={() => setEditingExercise(null)}>
          <div style={S.editModal} onClick={e => e.stopPropagation()}>
            <h3 style={S.editTitle}>{editingExercise.exercise.name}</h3>
            {(['sets', 'reps', 'weightKg', 'restSeconds'] as const).map(f => {
              const label = f === 'sets' ? 'Sets' : f === 'reps' ? 'Reps' : f === 'weightKg' ? 'Weight (kg)' : 'Rest (sec)';
              const step = f === 'weightKg' ? 2.5 : f === 'restSeconds' ? 15 : 1;
              const min = f === 'restSeconds' ? 30 : f === 'weightKg' ? 0 : f === 'reps' ? (editingExercise.repsMin ?? 1) : 1;
              const max = f === 'sets' ? 10 : f === 'reps' ? (editingExercise.repsMax ?? 30) : f === 'restSeconds' ? 300 : 500;
              return (
                <div key={f} style={S.editField}>
                  <label style={S.editLabel}>{label}</label>
                  <div style={S.editControls}>
                    <button onClick={() => updateExerciseField(editingExercise.id, f, Math.max(min, editingExercise[f] - step))} style={S.editBtn2}><Icon name="minus" size={16} /></button>
                    <span style={S.editValue}>{editingExercise[f]}{f === 'restSeconds' ? 's' : ''}</span>
                    <button onClick={() => updateExerciseField(editingExercise.id, f, Math.min(max, editingExercise[f] + step))} style={S.editBtn2}><Icon name="plus" size={16} /></button>
                  </div>
                </div>
              );
            })}
            <button onClick={() => setEditingExercise(null)} style={S.editDone}>DONE</button>
            <button onClick={() => { plan.removeExercise(editingExercise.id); setEditingExercise(null); }} style={S.editRemove}>REMOVE EXERCISE</button>
          </div>
        </div>
      )}

      {/* Exercise History Modal (Overhauled) */}
      {showExerciseHistory && (() => {
        const entries = workout.exerciseHistory[showExerciseHistory] || [];
        // Group entries by date for per-session display
        const sessionMap = new Map<string, typeof entries>();
        entries.forEach(e => {
          const existing = sessionMap.get(e.date) ?? [];
          existing.push(e);
          sessionMap.set(e.date, existing);
        });
        const sessions = [...sessionMap.entries()].sort(([a], [b]) => b.localeCompare(a));

        // Chart data (use per-session aggregates, last 20 sessions)
        const chartSessions = [...sessionMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-20);
        const weightData = chartSessions.map(([, es]) => Math.max(...es.map(e => e.weightKg)));
        const volumeData = chartSessions.map(([, es]) => es.reduce((a, e) => a + e.weightKg * e.reps, 0));
        const repsData = chartSessions.map(([, es]) => es.reduce((a, e) => a + e.reps, 0));

        // Also look up RPE from currentLog / workoutHistory
        const rpeByDateSet: Record<string, Record<number, number>> = {};
        workout.workoutHistory.forEach(w => {
          w.sets.filter(s => s.exerciseName === showExerciseHistory).forEach(s => {
            if (!rpeByDateSet[w.date]) rpeByDateSet[w.date] = {};
            rpeByDateSet[w.date][s.setNumber] = s.rpe;
          });
        });

        return (
          <div style={S.overlay} onClick={() => setShowExerciseHistory(null)}>
            <div style={{ ...S.historyModal, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <h3 style={S.historyTitle}>{showExerciseHistory} History</h3>
              {entries.length > 0 ? (
                <>
                  {/* Charts */}
                  <div style={ehStyles.chartSection}>
                    <div style={ehStyles.chartLabel}>Weight Over Time</div>
                    <MiniChart data={weightData.length ? weightData : [0]} color="#FF3B30" height={70} />
                  </div>
                  <div style={ehStyles.chartSection}>
                    <div style={ehStyles.chartLabel}>Volume Over Time</div>
                    <MiniChart data={volumeData.length ? volumeData : [0]} color="#3B82F6" type="bar" height={70} />
                  </div>
                  <div style={ehStyles.chartSection}>
                    <div style={ehStyles.chartLabel}>Total Reps Over Time</div>
                    <MiniChart data={repsData.length ? repsData : [0]} color="#34C759" height={70} />
                  </div>

                  {/* Session log */}
                  <div style={ehStyles.sessionLogTitle}>SESSION LOG</div>
                  <div style={ehStyles.sessionList}>
                    {sessions.map(([date, sets]) => {
                      const sessionVol = sets.reduce((a, s) => a + s.weightKg * s.reps, 0);
                      const dateRPE = rpeByDateSet[date] || {};
                      return (
                        <div key={date} style={ehStyles.sessionBlock}>
                          <div style={ehStyles.sessionDate}>{date}</div>
                          {sets.map((s, i) => (
                            <div key={i} style={ehStyles.setRow}>
                              <span style={ehStyles.setLabel}>Set {i + 1}:</span>
                              <span style={ehStyles.setDetail}>
                                {s.weightKg}kg x {s.reps}
                                {dateRPE[i + 1] != null && (
                                  <span style={ehStyles.rpeTag}> @ RPE {dateRPE[i + 1]}</span>
                                )}
                              </span>
                            </div>
                          ))}
                          <div style={ehStyles.sessionVolume}>Volume: {formatVolume(sessionVol)}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>No history yet</p>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { const ex = exerciseData?.exercises.find(e => e.name === showExerciseHistory); if (ex) setShowHowTo(ex); }} style={howToBtn}>?</button>
                <button onClick={() => setShowExerciseHistory(null)} style={{ ...S.historyClose, flex: 1 }}>CLOSE</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* End workout confirm */}
      {showEndConfirm && (
        <div style={S.overlay}>
          <div style={S.confirmBox}>
            <Icon name="alert" size={32} />
            <h3 style={S.confirmTitle}>End Workout Early?</h3>
            <p style={S.confirmText}>You've done {prog}% - incomplete exercises will have weight reduced next time.</p>
            <div style={S.confirmBtns}>
              <button onClick={() => setShowEndConfirm(false)} style={S.keepBtn}>KEEP GOING</button>
              <button onClick={() => handleEndWorkout(true)} style={S.endBtn}>END IT</button>
            </div>
          </div>
        </div>
      )}

      {/* How-To bottom sheet (Change 2) */}
      {showHowTo && (
        <HowToModal exercise={showHowTo} onClose={() => setShowHowTo(null)} />
      )}

      {/* Swap exercise modal (Dual Filter) */}
      {showSwap && (() => {
        const defaultMuscle = toCuratedMuscle(showSwap.exercise.muscle);
        const swapResults = exerciseData?.filterExercises({
          search: exSearch,
          equipment: exEquipment,
          muscle: exMuscle === 'All' ? defaultMuscle : exMuscle,
        }).filter(ex => ex.id !== showSwap.exercise.id) ?? [];
        return (
          <div style={S.overlay} onClick={() => { setShowSwap(null); setExSearch(''); setExEquipment('All'); setExMuscle('All'); }}>
            <div style={{ ...S.swapBox, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <h3 style={S.swapTitle}>Swap Exercise</h3>
              <p style={S.swapSub}>Replacing: {showSwap.exercise.name}</p>

              {/* Search */}
              <input
                type="text"
                placeholder="Search exercises..."
                value={exSearch}
                onChange={e => setExSearch(e.target.value)}
                style={ebStyles.searchInput}
              />

              {/* Dual filter dropdowns */}
              <div style={ebStyles.filterRow}>
                <select
                  value={exEquipment}
                  onChange={e => setExEquipment(e.target.value as EquipmentFilter)}
                  style={ebStyles.select}
                >
                  <option value="All">All Equipment</option>
                  {EQUIPMENT_FILTER_OPTIONS.map(eq => (
                    <option key={eq} value={eq} style={ebStyles.option}>{eq}</option>
                  ))}
                </select>
                <select
                  value={exMuscle === 'All' ? defaultMuscle : exMuscle}
                  onChange={e => setExMuscle(e.target.value as MuscleFilter)}
                  style={ebStyles.select}
                >
                  <option value="All">All Muscles</option>
                  {MUSCLE_FILTER_OPTIONS.map(m => (
                    <option key={m} value={m} style={ebStyles.option}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Result count */}
              <p style={ebStyles.resultCount}>
                {swapResults.length > 0
                  ? `${swapResults.length} exercise${swapResults.length !== 1 ? 's' : ''}`
                  : 'No exercises match these filters'}
              </p>

              <div style={S.swapList}>
                {swapResults.map(ex => (
                  <div key={ex.id} style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        plan.swapExercise(showSwap.id, ex);
                        setShowSwap(null);
                        setExSearch(''); setExEquipment('All'); setExMuscle('All');
                      }}
                      style={{ ...S.swapItem, flex: 1 }}
                    >
                      <div>
                        <div style={S.swapItemName}>{ex.name}</div>
                        <div style={S.swapItemMeta}>
                          {ex.muscle} {'\u00B7'} {ex.equipment === 'None' ? 'Bodyweight' : ex.equipment}
                          {ex.isBodyweight ? '' : ' \u00B7 Weighted'}
                        </div>
                      </div>
                    </button>
                    <button onClick={() => setShowHowTo(ex)} style={howToBtn}>?</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add exercise modal (Dual Filter) */}
      {showAddExercise && (
        <div style={S.overlay} onClick={() => { setShowAddExercise(false); setSelectedBuilderDayId(null); setExSearch(''); setExEquipment('All'); setExMuscle('All'); }}>
          <div style={{ ...S.addExModal, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={S.addExTitle}>Add Exercise</h3>
            <p style={S.addExSub}>Add to {selectedBuilderDayId ? customWorkoutDraft.days.find(day => day.id === selectedBuilderDayId)?.name.trim() || 'Selected day' : plan.currentDay?.name}</p>

            {/* Search bar */}
            <input
              type="text"
              placeholder="Search exercises..."
              value={exSearch}
              onChange={e => setExSearch(e.target.value)}
              style={ebStyles.searchInput}
            />

            {/* Dual filter dropdowns */}
            <div style={ebStyles.filterRow}>
              <select
                value={exEquipment}
                onChange={e => setExEquipment(e.target.value as EquipmentFilter)}
                style={ebStyles.select}
              >
                <option value="All">All Equipment</option>
                {EQUIPMENT_FILTER_OPTIONS.map(eq => (
                  <option key={eq} value={eq} style={ebStyles.option}>{eq}</option>
                ))}
              </select>
              <select
                value={exMuscle}
                onChange={e => setExMuscle(e.target.value as MuscleFilter)}
                style={ebStyles.select}
              >
                <option value="All">All Muscles</option>
                {MUSCLE_FILTER_OPTIONS.map(m => (
                  <option key={m} value={m} style={ebStyles.option}>{m}</option>
                ))}
              </select>
            </div>

            {/* Result count */}
            <p style={ebStyles.resultCount}>
              {filteredExercises.length > 0
                ? `${filteredExercises.length} exercise${filteredExercises.length !== 1 ? 's' : ''}`
                : 'No exercises match these filters'}
            </p>

            {/* Results */}
            <div style={S.addExList}>
              {filteredExercises.map(ex => (
                <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => {
                      if (selectedBuilderDayId) {
                        const lower = isLowerBody(ex.muscle);
                        setCustomWorkoutDraft(prev => ({
                          ...prev,
                          days: prev.days.map(day => day.id === selectedBuilderDayId
                            ? { ...day, exercises: [...day.exercises, {
                                exercise: ex,
                                sets: 3,
                                reps: lower ? 8 : 10,
                                weightKg: ex.isBodyweight ? 0 : 20,
                              }] }
                            : day),
                        }));
                      } else {
                        plan.addExercise(ex);
                      }
                      setShowAddExercise(false);
                      setSelectedBuilderDayId(null);
                      setExSearch(''); setExEquipment('All'); setExMuscle('All');
                    }}
                    style={{ ...S.addExItem, flex: 1 }}
                  >
                    <div>
                      <div style={S.addExName}>{ex.name}</div>
                      <div style={S.addExMeta}>
                        {ex.muscle} {'\u00B7'} {ex.equipment === 'None' ? 'Bodyweight' : ex.equipment}
                        {ex.isBodyweight ? '' : ' \u00B7 Weighted'}
                      </div>
                    </div>
                    <div style={S.addExArrow}>+</div>
                  </button>
                  <button onClick={() => setShowHowTo(ex)} style={howToBtn}>?</button>
                </div>
              ))}
            </div>
            <button onClick={() => { setShowAddExercise(false); setSelectedBuilderDayId(null); setExSearch(''); setExEquipment('All'); setExMuscle('All'); }} style={S.addExCancel}>CANCEL</button>
          </div>
        </div>
      )}

      {/* Template selector */}
      {showTemplates && (
        <div style={S.overlay} onClick={() => setShowTemplates(false)}>
          <div style={S.templatesModal} onClick={e => e.stopPropagation()}>
            <h2 style={S.templatesTitle}>Choose Template</h2>
            <p style={S.templatesSub}>This will reset your workout plan</p>
            <div style={S.templatesList}>
              {Object.values(workoutTemplates).map(t => (
                <button key={t.id} onClick={() => handleApplyTemplate(t.id)} style={S.templateCard}>
                  <div style={S.templateInfo}>
                    <div style={S.templateName}>{t.name}</div>
                    <div style={S.templateDesc}>{t.description}</div>
                    <div style={S.templateDays}>{t.days.length} days/week</div>
                  </div>
                  <div style={S.templateArrow}>→</div>
                </button>
              ))}
            </div>
            <button onClick={() => { resetCustomWorkoutBuilder(); setShowCustomWorkout(true); }} style={templatesCustomStyles.launchBtn}>+ CREATE YOUR OWN WORKOUT</button>
            <button onClick={() => setShowTemplates(false)} style={S.templatesCancel}>CANCEL</button>
          </div>
        </div>
      )}

      {showCustomWorkout && (
        <div
          style={S.overlay}
          onClick={() => {
            setShowCustomWorkout(false);
            resetCustomWorkoutBuilder();
          }}
        >
          <div style={templatesCustomStyles.modal} onClick={e => e.stopPropagation()}>
            <div style={templatesCustomStyles.stepBadge}>Step {customBuilderStep} of 4</div>

            {customBuilderStep === 1 && (
              <>
                <h3 style={templatesCustomStyles.title}>Name your program</h3>
                <p style={templatesCustomStyles.sub}>Give your training program a name.</p>
                <label style={templatesCustomStyles.label}>Program Name</label>
                <input
                  type="text"
                  value={customWorkoutDraft.name}
                  maxLength={32}
                  onChange={e => setCustomWorkoutDraft(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Custom Program"
                  style={templatesCustomStyles.input}
                />
              </>
            )}

            {customBuilderStep === 2 && (
              <>
                <h3 style={templatesCustomStyles.title}>How many days per week?</h3>
                <p style={templatesCustomStyles.sub}>Select your training frequency.</p>
                <select
                  value={customWorkoutDraft.daysPerWeek}
                  onChange={e => handleCustomWorkoutDraftDaysChange(Number(e.target.value))}
                  style={templatesCustomStyles.select}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <option key={day} value={day} style={templatesCustomStyles.option}>{day} {day === 1 ? 'day' : 'days'}</option>
                  ))}
                </select>
                <div style={templatesCustomStyles.dayPreviewList}>
                  {customWorkoutDraft.days.map((day, index) => (
                    <div key={day.id} style={templatesCustomStyles.dayPreviewCard}>
                      <div style={templatesCustomStyles.dayPreviewTitle}>{day.name.trim() || `Day ${index + 1}`}</div>
                      <div style={templatesCustomStyles.dayPreviewMeta}>{day.exercises.length} exercise{day.exercises.length === 1 ? '' : 's'}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {customBuilderStep === 3 && (
              <>
                <h3 style={templatesCustomStyles.title}>Name each day &amp; add exercises</h3>
                <p style={templatesCustomStyles.sub}>Customize day names and pick exercises.</p>
                <div style={templatesCustomStyles.dayCardsList}>
                  {customWorkoutDraft.days.map((day, dayIndex) => (
                    <div key={day.id} style={templatesCustomStyles.dayCard}>
                      <input
                        type="text"
                        value={day.name}
                        maxLength={32}
                        placeholder={`Day ${dayIndex + 1}`}
                        onChange={e => setCustomWorkoutDraft(prev => ({
                          ...prev,
                          days: prev.days.map(d => d.id === day.id ? { ...d, name: e.target.value } : d),
                        }))}
                        style={templatesCustomStyles.dayNameInput}
                      />
                      <div style={templatesCustomStyles.dayExerciseList}>
                        {day.exercises.length === 0 ? (
                          <div style={templatesCustomStyles.emptyExerciseText}>No exercises added yet.</div>
                        ) : day.exercises.map((de, exerciseIndex) => (
                          <div key={`${day.id}-${de.exercise.id}-${exerciseIndex}`} style={templatesCustomStyles.dayExerciseRow}>
                            <div style={templatesCustomStyles.rowOrderBtns}>
                              <button
                                onClick={() => reorderDraftExercise(day.id, exerciseIndex, exerciseIndex - 1)}
                                disabled={exerciseIndex === 0}
                                style={{ ...templatesCustomStyles.rowOrderBtn, ...(exerciseIndex === 0 ? templatesCustomStyles.rowOrderBtnDisabled : {}) }}
                                aria-label={`Move ${de.exercise.name} up`}
                              >
                                {'\u2191'}
                              </button>
                              <button
                                onClick={() => reorderDraftExercise(day.id, exerciseIndex, exerciseIndex + 1)}
                                disabled={exerciseIndex === day.exercises.length - 1}
                                style={{ ...templatesCustomStyles.rowOrderBtn, ...(exerciseIndex === day.exercises.length - 1 ? templatesCustomStyles.rowOrderBtnDisabled : {}) }}
                                aria-label={`Move ${de.exercise.name} down`}
                              >
                                {'\u2193'}
                              </button>
                            </div>
                            <div style={templatesCustomStyles.rowMeta}>
                              <div style={templatesCustomStyles.rowName}>{de.exercise.name}</div>
                              <div style={templatesCustomStyles.rowSub}>{de.exercise.muscle}</div>
                            </div>
                            <input
                              type="number"
                              min={1}
                              step={1}
                              value={de.sets}
                              onChange={e => updateDraftExerciseField(day.id, exerciseIndex, { sets: Math.max(1, Number(e.target.value)) })}
                              style={templatesCustomStyles.rowInput}
                              aria-label="Sets"
                              title="Sets"
                            />
                            <input
                              type="number"
                              min={1}
                              step={1}
                              value={de.reps}
                              onChange={e => updateDraftExerciseField(day.id, exerciseIndex, { reps: Math.max(1, Number(e.target.value)) })}
                              style={templatesCustomStyles.rowInput}
                              aria-label="Reps"
                              title="Reps"
                            />
                            <input
                              type="number"
                              min={0}
                              step={2.5}
                              value={de.weightKg}
                              onChange={e => updateDraftExerciseField(day.id, exerciseIndex, { weightKg: Math.max(0, Number(e.target.value)) })}
                              style={templatesCustomStyles.rowInput}
                              aria-label="Weight (kg)"
                              title="Weight (kg)"
                            />
                            <button
                              onClick={() => removeDraftExercise(day.id, exerciseIndex)}
                              style={templatesCustomStyles.rowRemoveBtn}
                              aria-label={`Remove ${de.exercise.name}`}
                            >
                              {'\u00D7'}
                            </button>
                          </div>
                        ))}
                      </div>
                      {day.exercises.length > 0 && (
                        <div style={templatesCustomStyles.rowHeaderLabels}>
                          <span style={templatesCustomStyles.rowHeaderSpacer} />
                          <span style={templatesCustomStyles.rowHeaderLabel}>Sets</span>
                          <span style={templatesCustomStyles.rowHeaderLabel}>Reps</span>
                          <span style={templatesCustomStyles.rowHeaderLabel}>kg</span>
                          <span style={templatesCustomStyles.rowHeaderRemoveSpacer} />
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedBuilderDayId(day.id);
                          setShowAddExercise(true);
                        }}
                        style={templatesCustomStyles.addExerciseBtn}
                      >
                        + Add Exercise
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {customBuilderStep === 4 && (
              <>
                <h3 style={templatesCustomStyles.title}>Review your program</h3>
                <p style={templatesCustomStyles.sub}>Confirm everything looks good before saving.</p>
                <div style={templatesCustomStyles.summaryHeader}>{customWorkoutDraft.name.trim() || 'Custom Program'}</div>
                <div style={templatesCustomStyles.summarySubHeader}>{customWorkoutDraft.daysPerWeek} day{customWorkoutDraft.daysPerWeek === 1 ? '' : 's'} per week</div>
                <div style={templatesCustomStyles.summaryList}>
                  {customWorkoutDraft.days.map((day, index) => (
                    <div key={day.id} style={templatesCustomStyles.summaryDayCard}>
                      <div style={templatesCustomStyles.summaryDayTitle}>{day.name.trim() || `Day ${index + 1}`}</div>
                      {day.exercises.length === 0 ? (
                        <div style={templatesCustomStyles.emptyExerciseText}>No exercises selected</div>
                      ) : day.exercises.map((de, ei) => (
                        <div key={`${day.id}-${de.exercise.id}-summary-${ei}`} style={templatesCustomStyles.summaryExerciseRow}>
                          <span>{de.exercise.name}</span>
                          <span style={templatesCustomStyles.summaryDefaults}>
                            {de.sets} set{de.sets !== 1 ? 's' : ''} {'\u00B7'} {de.reps} rep{de.reps !== 1 ? 's' : ''} {'\u00B7'} {de.weightKg}kg
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={templatesCustomStyles.actions}>
              <button
                onClick={() => {
                  if (customBuilderStep === 1) {
                    setShowCustomWorkout(false);
                    resetCustomWorkoutBuilder();
                    return;
                  }
                  setCustomBuilderStep((customBuilderStep - 1) as 1 | 2 | 3 | 4);
                }}
                style={templatesCustomStyles.cancel}
              >
                {customBuilderStep === 1 ? 'Cancel' : 'Back'}
              </button>

              {customBuilderStep < 4 ? (
                <button
                  onClick={() => setCustomBuilderStep((customBuilderStep + 1) as 1 | 2 | 3 | 4)}
                  style={templatesCustomStyles.create}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreateCustomWorkout}
                  style={templatesCustomStyles.create}
                >
                  Save Program
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deload alert */}
      {workout.showDeloadAlert && (
        <div style={S.overlay}>
          <div style={S.deloadBox}>
            <div style={{ fontSize: 48 }}>😴</div>
            <h3 style={S.deloadTitle}>Time for a Deload!</h3>
            <p style={S.deloadText}>You've trained hard for {workout.weekCount} weeks. Consider:</p>
            <ul style={S.deloadList}><li>Reduce weight 40-50%</li><li>Keep sets/reps the same</li><li>Focus on form & recovery</li></ul>
            <button onClick={() => workout.dismissDeloadAlert(true)} style={S.deloadBtn}>GOT IT</button>
            <button onClick={() => workout.dismissDeloadAlert(false)} style={S.deloadSkip}>KEEP PUSHING</button>
          </div>
        </div>
      )}

      {/* Pre-workout readiness check (Pro) */}
      {showReadinessCheck && (
        <ReadinessCheck
          onComplete={(result) => {
            setReadinessResult(result);
            setShowReadinessCheck(false);
          }}
          onSkip={() => setShowReadinessCheck(false)}
        />
      )}
    </>
  );
}

/** How-To button style (replaces play/video button) */
const howToBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: radii.md,
  border: `1px solid rgba(255,149,0,0.3)`,
  background: 'rgba(255,149,0,0.08)',
  color: colors.warning,
  cursor: 'pointer',
  fontWeight: typography.weights.black,
  fontSize: typography.sizes.lg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};

/** Exercise History modal styles */
const ehStyles: Record<string, React.CSSProperties> = {
  chartSection: {
    marginBottom: spacing.md,
  },
  chartLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 4,
  },
  sessionLogTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.textTertiary,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
    borderTop: `1px solid ${colors.surfaceBorder}`,
  },
  sessionList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing.md,
  },
  sessionBlock: {
    borderBottom: `1px solid ${colors.surfaceBorder}`,
    paddingBottom: spacing.sm,
  },
  sessionDate: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  setRow: {
    display: 'flex',
    gap: 8,
    fontSize: typography.sizes.md,
    padding: '2px 0',
  },
  setLabel: {
    color: colors.textTertiary,
    fontWeight: typography.weights.medium,
    width: 48,
    flexShrink: 0,
  },
  setDetail: {
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  rpeTag: {
    color: colors.warning,
    fontWeight: typography.weights.medium,
    fontSize: typography.sizes.sm,
  },
  sessionVolume: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: typography.weights.bold,
  },
};

/** Exercise browser styles (shared by Add and Swap modals) */
const ebStyles: Record<string, React.CSSProperties> = {
  searchInput: {
    width: '100%',
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'rgba(255,255,255,0.06)',
    color: colors.text,
    fontSize: typography.sizes.base,
    outline: 'none',
    marginBottom: spacing.sm,
    boxSizing: 'border-box' as const,
  },
  filterRow: {
    display: 'flex',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  select: {
    flex: 1,
    padding: `${spacing.sm}px ${spacing.sm}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    background: colors.surface,
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
    appearance: 'auto' as const,
  },
  option: {
    background: '#111',
    color: '#fff',
  },
  resultCount: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: 'center' as const,
    marginBottom: spacing.sm,
    marginTop: 0,
  },
};


const orderStyles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    gap: 6,
    marginTop: 8,
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'rgba(255,255,255,0.06)',
    color: colors.text,
    fontWeight: typography.weights.black,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  buttonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};

const templatesCustomStyles: Record<string, React.CSSProperties> = {
  launchBtn: {
    width: '100%', borderRadius: radii.md, border: `1px solid ${colors.primaryBorder}`, background: 'rgba(255,59,48,0.08)', color: colors.primary,
    fontWeight: typography.weights.black, fontSize: typography.sizes.sm, padding: `${spacing.sm}px ${spacing.md}px`, marginTop: spacing.sm, marginBottom: spacing.sm,
  },
  modal: { width: 'min(92vw, 420px)', borderRadius: radii.xl, background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, padding: spacing.lg },
  title: { color: colors.text, margin: 0, marginBottom: spacing.xs, fontSize: typography.sizes.xl },
  sub: { color: colors.textSecondary, marginTop: 0, marginBottom: spacing.md, fontSize: typography.sizes.sm },
  label: { display: 'block', color: colors.textSecondary, marginBottom: 6, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: { width: '100%', boxSizing: 'border-box', padding: `${spacing.sm}px ${spacing.md}px`, borderRadius: radii.md, border: `1px solid ${colors.surfaceBorder}`, background: 'rgba(255,255,255,0.06)', color: colors.text, marginBottom: spacing.md },
  select: { width: '100%', padding: `${spacing.sm}px ${spacing.md}px`, borderRadius: radii.md, border: `1px solid ${colors.surfaceBorder}`, background: colors.surface, color: colors.text, marginBottom: spacing.md },
  option: { background: '#111', color: '#fff' },
  stepBadge: { display: 'inline-block', fontSize: typography.sizes.xs, fontWeight: typography.weights.black, color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: '0.08em' },
  dayPreviewList: { display: 'flex', flexDirection: 'column', gap: spacing.xs, marginBottom: spacing.sm },
  dayPreviewCard: { padding: spacing.sm, borderRadius: radii.md, border: `1px solid ${colors.surfaceBorder}`, background: 'rgba(255,255,255,0.03)' },
  dayPreviewTitle: { color: colors.text, fontWeight: typography.weights.bold },
  dayPreviewMeta: { color: colors.textSecondary, fontSize: typography.sizes.xs, marginTop: 2 },
  dayCards: { maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.sm, marginBottom: spacing.md },
  dayCardsList: { display: 'flex', flexDirection: 'column', gap: spacing.sm, maxHeight: '45vh', overflowY: 'auto', paddingRight: 2, marginBottom: spacing.sm },
  dayCard: { borderRadius: radii.md, border: `1px solid ${colors.surfaceBorder}`, padding: spacing.sm, background: 'rgba(255,255,255,0.03)' },
  dayHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  dayName: { color: colors.text, fontWeight: typography.weights.black, fontSize: typography.sizes.sm },
  dayNameInput: { width: '100%', boxSizing: 'border-box', padding: `${spacing.sm}px ${spacing.md}px`, borderRadius: radii.md, border: `1px solid ${colors.surfaceBorder}`, background: 'rgba(255,255,255,0.06)', color: colors.text, marginBottom: spacing.sm },
  dayAddBtn: { borderRadius: radii.sm, border: `1px solid ${colors.primaryBorder}`, background: 'rgba(255,59,48,0.08)', color: colors.primary, padding: `4px ${spacing.sm}px`, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  dayExerciseList: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: spacing.sm },
  dayEmpty: { color: colors.textTertiary, fontSize: typography.sizes.xs },
  dayExerciseRow: { display: 'grid', gridTemplateColumns: '28px 1fr 52px 52px 60px 28px', alignItems: 'center', gap: 6 },
  rowOrderBtns: { display: 'flex', flexDirection: 'column' as const, gap: 2 },
  rowOrderBtn: { width: 24, height: 16, borderRadius: radii.sm, border: `1px solid ${colors.surfaceBorder}`, background: 'rgba(255,255,255,0.06)', color: colors.text, fontSize: '0.6rem', lineHeight: 1, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  rowOrderBtnDisabled: { opacity: 0.3, cursor: 'not-allowed' },
  rowRemoveBtn: { width: 28, height: 28, borderRadius: radii.sm, border: 'none', background: 'rgba(255,59,48,0.14)', color: colors.primary, fontSize: typography.sizes.lg, lineHeight: '28px', padding: 0, cursor: 'pointer' },
  rowHeaderLabels: { display: 'grid', gridTemplateColumns: '28px 1fr 52px 52px 60px 28px', gap: 6, marginBottom: 4 },
  rowHeaderLabel: { color: colors.textTertiary, fontSize: '0.6rem', fontWeight: typography.weights.bold, textTransform: 'uppercase' as const, textAlign: 'center' as const },
  rowHeaderSpacer: {},
  rowHeaderRemoveSpacer: {},
  rowMeta: { minWidth: 0 },
  rowName: { color: colors.text, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowSub: { color: colors.textTertiary, fontSize: '0.65rem' },
  rowInput: { width: '100%', borderRadius: radii.sm, border: `1px solid ${colors.surfaceBorder}`, background: 'rgba(255,255,255,0.06)', color: colors.text, padding: `${spacing.xs}px ${spacing.sm}px`, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  emptyExerciseText: { color: colors.textSecondary, fontSize: typography.sizes.xs },
  exerciseItem: { color: colors.text, fontSize: typography.sizes.sm },
  addExerciseBtn: { width: '100%', borderRadius: radii.md, border: `1px solid ${colors.primaryBorder}`, background: 'rgba(255,59,48,0.08)', color: colors.primary, padding: `4px ${spacing.sm}px`, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  summaryHeader: { color: colors.text, fontWeight: typography.weights.black, fontSize: typography.sizes.lg, marginBottom: 2 },
  summarySubHeader: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginBottom: spacing.sm },
  summaryList: { display: 'flex', flexDirection: 'column', gap: spacing.sm, maxHeight: '46vh', overflowY: 'auto', marginBottom: spacing.sm, paddingRight: 2 },
  summaryDayCard: { borderRadius: radii.md, border: `1px solid ${colors.surfaceBorder}`, padding: spacing.sm, background: 'rgba(255,255,255,0.03)' },
  summaryDayTitle: { color: colors.text, fontWeight: typography.weights.bold, marginBottom: 6 },
  summaryExerciseRow: { display: 'flex', justifyContent: 'space-between', gap: spacing.sm, color: colors.text, fontSize: typography.sizes.sm, marginBottom: 4 },
  summaryDefaults: { color: colors.textSecondary, fontSize: typography.sizes.xs, whiteSpace: 'nowrap' },
  actions: { display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' },
  cancel: { borderRadius: radii.md, border: `1px solid ${colors.surfaceBorder}`, background: 'transparent', color: colors.textSecondary, padding: `${spacing.sm}px ${spacing.md}px` },
  create: { borderRadius: radii.md, border: 'none', background: colors.primary, color: '#fff', padding: `${spacing.sm}px ${spacing.md}px`, fontWeight: typography.weights.bold },
};

const progressionBannerBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: spacing.sm,
  padding: `${spacing.sm + 2}px ${spacing.md}px`,
  borderRadius: radii.lg,
  marginBottom: spacing.md,
};

const progressionBannerStyles: Record<string, React.CSSProperties> = {
  success: { ...progressionBannerBase, background: colors.successSurface, border: `1px solid ${colors.successBorder}` },
  warning: { ...progressionBannerBase, background: colors.warningSurface, border: `1px solid ${colors.warningBorder}` },
  neutral: { ...progressionBannerBase, background: colors.surface, border: `1px solid ${colors.surfaceBorder}` },
  icon: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.black, lineHeight: '1.2', flexShrink: 0 },
  label: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.text },
  subtext: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
};
