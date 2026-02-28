import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { PlanExercise, RPEValue, Exercise, EquipmentFilter, MuscleFilter } from '@/shared/types';
import { MUSCLE_FILTER_MAP } from '@/shared/types';
import { usePlan } from '@/features/training-plan/PlanContext';
import { useWorkout } from './WorkoutContext';
import { useTimer, getAdaptiveRest, useSwipeNavigation, useFilterHistory } from '@/shared/hooks';
import { Icon, MiniChart, EmptyState, useToast, ExerciseFilterPanel } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { TIMINGS } from '@/shared/constants/timings';
import { formatTime, formatVolume } from '@/shared/utils';
import { ExerciseCard } from './ExerciseCard';
import { workoutTemplates } from '@/data/templates';
import type { UserProfile } from '@/shared/types';
import { useTier } from '@/hooks/useTier';
import { calculateFatigueScore } from '@/training/fatigue';
import { evaluateSuggestions } from '@/training/suggestions';

import type { SuggestionEvent } from '@/training/suggestions';
import { ReadinessCheck, getTodayReadiness } from '@/features/readiness/ReadinessCheck';
import type { ReadinessResult } from '@/features/readiness/ReadinessCheck';
import { HowToModal } from '@/ui/modals/HowToModal';
import { WorkoutSummary, buildWorkoutSummary } from './WorkoutSummary';
import type { WorkoutSummaryData } from './WorkoutSummary';
import { CustomWorkoutBuilder } from './CustomWorkoutBuilder';


type ExerciseDataModule = typeof import('@/data/exercises');

// ── Suggestion logging (persisted for future ML training) ─────────────────────
const SUGGESTION_LOG_KEY = 'ironSuggestionLog';

function logSuggestionEvent(event: SuggestionEvent): void {
  try {
    const raw = localStorage.getItem(SUGGESTION_LOG_KEY);
    const log: SuggestionEvent[] = raw ? (JSON.parse(raw) as SuggestionEvent[]) : [];
    log.push(event);
    localStorage.setItem(SUGGESTION_LOG_KEY, JSON.stringify(log.slice(-200)));
  } catch { /* ignore */ }
}

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


const DumbbellIllustration = (
  <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <rect x="8" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2.5"/>
    <rect x="4" y="22" width="8" height="20" rx="2" stroke="currentColor" strokeWidth="2.5"/>
    <rect x="48" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2.5"/>
    <rect x="52" y="22" width="8" height="20" rx="2" stroke="currentColor" strokeWidth="2.5"/>
    <line x1="16" y1="32" x2="48" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

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
  const [justCompleted, setJustCompleted] = useState<{ exerciseId: string; setNum: number } | null>(null);
  const [restTimerEnding, setRestTimerEnding] = useState(false);
  const [restPulseTarget, setRestPulseTarget] = useState<string | null>(null);
  const [dayAnimKey, setDayAnimKey] = useState(0);
  const [dayAnimClass, setDayAnimClass] = useState('');
  // Exercise browser filter states (shared between Add and Swap modals)
  const [exSearch, setExSearch] = useState('');
  const [exEquipment, setExEquipment] = useState<EquipmentFilter>('All');
  const [exMuscle, setExMuscle] = useState<MuscleFilter>('All');

  const [exerciseData, setExerciseData] = useState<ExerciseDataModule | null>(null);
  const filterHistory = useFilterHistory();

  // Ref to hold the current "next exercise" ID for the timer complete callback
  const nextExerciseIdRef = useRef<string | null>(null);

  // Ref map: exerciseId → card DOM element for scroll-into-view
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const scrollToCard = useCallback((exerciseId: string, block: ScrollLogicalPosition = 'center') => {
    const el = cardRefs.current.get(exerciseId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block });
  }, []);

  const handleTimerComplete = useCallback(() => {
    // Brief vibration on timer end
    navigator.vibrate?.(100);

    // Pulse the next exercise card and scroll it into center view
    const targetId = nextExerciseIdRef.current;
    if (targetId) {
      setRestPulseTarget(targetId);
      setTimeout(() => setRestPulseTarget(null), TIMINGS.REST_PULSE_DURATION);
      scrollToCard(targetId, 'center');
    }

    // Slide-up collapse animation
    setRestTimerEnding(true);
    setTimeout(() => setRestTimerEnding(false), TIMINGS.REST_BANNER_COLLAPSE);
  }, [scrollToCard]);

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

  // All exercises flat list for autocomplete
  const allExercisesFlat = useMemo(() => {
    if (!exerciseData) return [];
    return exerciseData.filterExercises({});
  }, [exerciseData]);

  const handleExEquipmentChange = useCallback((v: EquipmentFilter | 'All') => {
    setExEquipment(v as EquipmentFilter);
    filterHistory.trackFilter('equipment', v);
  }, [filterHistory]);

  const handleExMuscleChange = useCallback((v: MuscleFilter | 'All') => {
    setExMuscle(v as MuscleFilter);
    filterHistory.trackFilter('muscle', v);
  }, [filterHistory]);

  const hasExFilters = exEquipment !== 'All' || exMuscle !== 'All' || exSearch !== '';

  const handleClearExFilters = useCallback(() => {
    setExSearch('');
    setExEquipment('All');
    setExMuscle('All');
  }, []);

  // Intelligence features (Pro only)
  const { showToast, dismissToast } = useToast();
  const activeSuggestionToastId = useRef<string | null>(null);
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

  // Per-day completion status for pill indicators
  const dayStatuses = useMemo(() => {
    return plan.days.map(d => {
      const dayExs = plan.exercises.filter(pe => pe.dayId === d.id);
      const total = dayExs.reduce((sum, pe) => sum + pe.sets, 0);
      const done = dayExs.reduce((sum, pe) => sum + (workout.completedSets[pe.id] || 0), 0);
      if (total === 0 || done === 0) return 'none' as const;
      if (done >= total) return 'complete' as const;
      return 'partial' as const;
    });
  }, [plan.days, plan.exercises, workout.completedSets]);

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
        if (activeSuggestionToastId.current) dismissToast(activeSuggestionToastId.current);
        const suggestion = newSuggestion;
        setDismissedSuggestionIds(prev => new Set([...prev, suggestion.id]));
        activeSuggestionToastId.current = showToast({
          type: 'suggestion',
          message: suggestion.message,
          actions: [
            {
              label: 'GOT IT',
              primary: true,
              onClick: () => {
                logSuggestionEvent({ suggestion, outcome: 'accepted', respondedAt: Date.now() });
                activeSuggestionToastId.current = null;
              },
            },
            {
              label: 'DISMISS',
              onClick: () => {
                logSuggestionEvent({ suggestion, outcome: 'dismissed', respondedAt: Date.now() });
                activeSuggestionToastId.current = null;
              },
            },
          ],
        });
      }
    }

    const setNum = (workout.completedSets[exercise.id] || 0) + 1;
    if (setNum === exercise.sets) {
      showToast({ type: 'success', message: '✅ All sets complete!' });
    }
    setShowRPE(null);

    // Scroll to the next exercise card after set completion animation
    // Compute synchronously — workout.completedSets hasn't updated yet
    const newDoneCount = (workout.completedSets[exercise.id] || 0) + 1;
    const exercises = plan.dayExercises;
    const currentIndex = exercises.findIndex(pe => pe.id === exercise.id);
    let scrollTargetId: string | null = null;
    if (newDoneCount < exercise.sets) {
      scrollTargetId = exercise.id;
    } else {
      for (let i = currentIndex + 1; i < exercises.length; i++) {
        const pe = exercises[i];
        if ((workout.completedSets[pe.id] || 0) < pe.sets) {
          scrollTargetId = pe.id;
          break;
        }
      }
    }
    if (scrollTargetId) {
      const targetId = scrollTargetId;
      // 'nearest' gives partial reveal below the sticky rest banner
      setTimeout(() => scrollToCard(targetId, 'nearest'), TIMINGS.SET_COMPLETE_DURATION + 50);
    }
  };

  const handleEndWorkout = (force = false) => {
    if (!force && workout.progress() < 100) {
      setShowEndConfirm(true);
      return;
    }

    const endedEarly = force && workout.progress() < 100;

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

    // Scroll to top so the summary overlay renders from the start
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (endedEarly) {
      showToast({ type: 'warning', message: 'Workout ended early' });
    }
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

  const handleDayChange = (index: number) => {
    if (index === plan.dayIndex) return;
    const animClass = index > plan.dayIndex ? 'day-enter-right' : 'day-enter-left';
    plan.setDayIndex(index);
    workout.resetWorkoutState();
    setDayAnimKey(prev => prev + 1);
    setDayAnimClass(animClass);
    setTimeout(() => setDayAnimClass(''), 250);
  };

  const swipe = useSwipeNavigation({
    enabled: plan.days.length > 1,
    onSwipeLeft: () => {
      if (plan.dayIndex < plan.days.length - 1) handleDayChange(plan.dayIndex + 1);
    },
    onSwipeRight: () => {
      if (plan.dayIndex > 0) handleDayChange(plan.dayIndex - 1);
    },
  });

  const prog = workout.progress();

  // Show workout summary overlay (Change 3)
  if (summaryData) {
    return <WorkoutSummary summary={summaryData} onDone={handleSummaryDone} />;
  }

  return (
    <>
      {plan.days.length === 0 ? (
        <EmptyState
          illustration={DumbbellIllustration}
          title="No workout planned for today"
          subtitle="Pick a template or build your own"
          actions={[
            { label: 'Choose Template', onClick: () => setShowTemplates(true) },
            { label: 'Build Custom', onClick: () => setShowCustomWorkout(true), variant: 'ghost' },
          ]}
        />
      ) : (
      <>
      {/* Day pills */}
      <div style={S.tabs}>
        {plan.days.map((d, i) => {
          const isActive = plan.dayIndex === i;
          const status = dayStatuses[i];
          return (
            <button
              key={d.id}
              onClick={() => handleDayChange(i)}
              style={{ ...S.tab, ...(isActive ? S.tabActive : {}), position: 'relative' }}
            >
              {d.name.toUpperCase()}
              {status !== 'none' && (
                <span style={{
                  position: 'absolute',
                  top: 5,
                  right: 6,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: status === 'complete' ? '#34C759' : '#FFD60A',
                }} />
              )}
            </button>
          );
        })}
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

      {/* Exercise list — animated on day change, swipeable between days */}
      <div
        key={dayAnimKey}
        className={dayAnimClass}
        style={{ transform: `translateX(${swipe.swipeOffset}px)` }}
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={swipe.onTouchEnd}
      >
      <div style={S.exList}>
        {plan.dayExercises.map((pe, index) => {
          const done = workout.completedSets[pe.id] || 0;
          const hasHistory = (workout.exerciseHistory[pe.exercise.name]?.length || 0) > 0;

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
            <div
              key={pe.id}
              ref={(el) => {
                if (el) cardRefs.current.set(pe.id, el);
                else cardRefs.current.delete(pe.id);
              }}
            >
              <ExerciseCard
                exercise={pe}
                index={index}
                isFirst={index === 0}
                isLast={index === plan.dayExercises.length - 1}
                completedSets={done}
                currentVolume={currentExVol}
                previousVolume={previousExVol}
                isWarmupOpen={showWarmup === pe.id}
                hasHistory={hasHistory}
                isResting={timer.isActive && workout.restTimerFor === pe.id}
                restSeconds={timer.seconds}
                justCompleted={justCompleted}
                restPulseTarget={restPulseTarget}
                progression={pe.id in workout.progressions ? workout.progressions[pe.id] : undefined}
                onCompleteSet={completeSet}
                onReorder={(from, to) => plan.reorderDayExercises(from, to)}
                onUpdateExercise={(id, updates) => plan.updateExercise(id, updates)}
                onShowWarmup={setShowWarmup}
                onShowHistory={setShowExerciseHistory}
                onShowEdit={setEditingExercise}
                onShowSwap={setShowSwap}
                onShowHowTo={setShowHowTo}
              />
            </div>
          );
        })}
        <button onClick={() => setShowAddExercise(true)} style={S.addExerciseBtn}>
          <Icon name="plus" size={18} /> ADD EXERCISE
        </button>
      </div>
      </div>

      {Object.keys(workout.completedSets).length > 0 && (
        <button onClick={() => handleEndWorkout()} style={S.finishBtn}>
          {prog >= 100 ? 'FINISH WORKOUT' : 'END WORKOUT EARLY'}
        </button>
      )}
      </>
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
              const step = f === 'weightKg' ? 0.5 : f === 'restSeconds' ? 15 : 1;
              const min = f === 'restSeconds' ? 30 : f === 'weightKg' ? 0 : f === 'reps' ? 1 : 1;
              const max = f === 'sets' ? 10 : f === 'reps' ? 100 : f === 'restSeconds' ? 300 : 500;
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
        const swapMuscle = exMuscle === 'All' ? defaultMuscle : exMuscle;
        const swapResults = exerciseData?.filterExercises({
          search: exSearch,
          equipment: exEquipment,
          muscle: swapMuscle,
        }).filter(ex => ex.id !== showSwap.exercise.id) ?? [];
        return (
          <div style={S.overlay} onClick={() => { setShowSwap(null); handleClearExFilters(); }}>
            <div style={{ ...S.swapBox, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <h3 style={S.swapTitle}>Swap Exercise</h3>
              <p style={S.swapSub}>Replacing: {showSwap.exercise.name}</p>

              <ExerciseFilterPanel
                search={exSearch}
                onSearchChange={setExSearch}
                equipment={exEquipment}
                onEquipmentChange={handleExEquipmentChange}
                muscle={swapMuscle}
                onMuscleChange={handleExMuscleChange}
                allExercises={allExercisesFlat}
                resultCount={swapResults.length}
                onClearFilters={handleClearExFilters}
                hasFilters={hasExFilters}
              />

              <div style={S.swapList}>
                {swapResults.map(ex => (
                  <div key={ex.id} style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        plan.swapExercise(showSwap.id, ex);
                        setShowSwap(null);
                        handleClearExFilters();
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
        <div style={S.overlay} onClick={() => { setShowAddExercise(false); handleClearExFilters(); }}>
          <div style={{ ...S.addExModal, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={S.addExTitle}>Add Exercise</h3>
            <p style={S.addExSub}>Add to {plan.currentDay?.name}</p>

            <ExerciseFilterPanel
              search={exSearch}
              onSearchChange={setExSearch}
              equipment={exEquipment}
              onEquipmentChange={handleExEquipmentChange}
              muscle={exMuscle}
              onMuscleChange={handleExMuscleChange}
              allExercises={allExercisesFlat}
              resultCount={filteredExercises.length}
              onClearFilters={handleClearExFilters}
              hasFilters={hasExFilters}
            />

            {/* Results */}
            <div style={S.addExList}>
              {filteredExercises.map(ex => (
                <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => {
                      plan.addExercise(ex);
                      setShowAddExercise(false);
                      handleClearExFilters();
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
            <button onClick={() => { setShowAddExercise(false); handleClearExFilters(); }} style={S.addExCancel}>CANCEL</button>
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
            <button onClick={() => setShowCustomWorkout(true)} style={launchCustomBtnStyle}>+ CREATE YOUR OWN WORKOUT</button>
            <button onClick={() => setShowTemplates(false)} style={S.templatesCancel}>CANCEL</button>
          </div>
        </div>
      )}

      {showCustomWorkout && (
        <CustomWorkoutBuilder
          onSave={(config) => {
            plan.createCustomWorkout(config);
            workout.resetWorkoutState();
            setShowCustomWorkout(false);
            setShowTemplates(false);
          }}
          onCancel={() => setShowCustomWorkout(false)}
        />
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




/** Style for "CREATE YOUR OWN WORKOUT" button in template selector */
const launchCustomBtnStyle: React.CSSProperties = {
  width: '100%', borderRadius: radii.md, border: `1px solid ${colors.primaryBorder}`, background: 'rgba(255,59,48,0.08)', color: colors.primary,
  fontWeight: typography.weights.black, fontSize: typography.sizes.sm, padding: `${spacing.sm}px ${spacing.md}px`, marginTop: spacing.sm, marginBottom: spacing.sm, cursor: 'pointer',
};

