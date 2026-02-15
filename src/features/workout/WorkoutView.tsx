import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { PlanExercise, RPEValue, Exercise, Equipment, MuscleGroup } from '@/shared/types';
import { EQUIPMENT_TYPES, MUSCLE_GROUPS } from '@/shared/types';
import { usePlan } from '@/features/training-plan/PlanContext';
import { useWorkout } from './WorkoutContext';
import { useNutrition } from '@/features/nutrition/nutrition.context';
import { useTimer, getAdaptiveRest } from '@/shared/hooks';
import { Icon, MiniChart } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { TIMINGS } from '@/shared/constants/timings';
import { getWarmupSets, formatTime, getProteinGoal, WATER_GOAL } from '@/shared/utils';
import { workoutTemplates } from '@/data/templates';
import { proteinSources } from '@/data/protein-sources';
import type { UserProfile } from '@/shared/types';
import { useTier } from '@/hooks/useTier';
import { calculateFatigueScore } from '@/training/fatigue';
import { evaluateSuggestions } from '@/training/suggestions';
import type { WorkoutSuggestion } from '@/training/suggestions';
import { SuggestionToast } from './SuggestionToast';
import { ReadinessCheck, getTodayReadiness } from '@/features/readiness/ReadinessCheck';
import type { ReadinessResult } from '@/features/readiness/ReadinessCheck';
import { HowToModal } from '@/ui/modals/HowToModal';
import { WorkoutSummary, buildWorkoutSummary } from './WorkoutSummary';
import type { WorkoutSummaryData } from './WorkoutSummary';


type ExerciseDataModule = typeof import('@/data/exercises');
interface WorkoutViewProps {
  profile: UserProfile;
}

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
  const nutrition = useNutrition();
  const timer = useTimer();
  const { canAccess } = useTier();
  const isPro = canAccess('analytics_advanced');

  // Modal states
  const [showWarmup, setShowWarmup] = useState<string | null>(null);
  const [showHowTo, setShowHowTo] = useState<Exercise | null>(null);
  const [showSwap, setShowSwap] = useState<PlanExercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<PlanExercise | null>(null);
  const [showRPE, setShowRPE] = useState<{ exerciseId: string; setNum: number; exercise: PlanExercise } | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCustomWorkout, setShowCustomWorkout] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showExerciseHistory, setShowExerciseHistory] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [customWorkoutName, setCustomWorkoutName] = useState('My Workout');
  const [customWorkoutDays, setCustomWorkoutDays] = useState(4);

  // Exercise browser filter states (shared between Add and Swap modals)
  const [exSearch, setExSearch] = useState('');
  const [exEquipment, setExEquipment] = useState<Equipment | 'All'>('All');
  const [exMuscle, setExMuscle] = useState<MuscleGroup | 'All'>('All');

  const [exerciseData, setExerciseData] = useState<ExerciseDataModule | null>(null);

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

  const proteinGoal = getProteinGoal(profile.weight);

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

  const handleCreateCustomWorkout = () => {
    plan.createCustomWorkout({ name: customWorkoutName, days: customWorkoutDays });
    workout.resetWorkoutState();
    setShowCustomWorkout(false);
    setShowTemplates(false);
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

      {/* Nutrition bar */}
      <div style={S.nutritionBar}>
        <div style={S.nutritionItem} onClick={() => setShowNutrition(true)}>
          <span style={S.nutritionIcon}>💧</span>
          <span style={S.nutritionValue}>{nutrition.todayWater}/{WATER_GOAL}</span>
          <button onClick={e => { e.stopPropagation(); nutrition.addWater(); }} style={S.addBtn}>+</button>
        </div>
      </div>

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

      {/* Rest timer */}
      {timer.isActive && (
        <div style={S.restBanner}>
          <div><div style={S.restLabel}>{timer.label || 'REST TIME'}</div><div style={S.restTime}>{formatTime(timer.seconds)}</div></div>
          <button onClick={timer.skip} style={S.skipBtn}>SKIP</button>
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
        {plan.dayExercises.map(pe => {
          const done = workout.completedSets[pe.id] || 0;
          const isDone = done >= pe.sets;
          const isWarmupOpen = showWarmup === pe.id;
          const warmups = getWarmupSets(pe.weightKg);
          const hasHistory = (workout.exerciseHistory[pe.exercise.name]?.length || 0) > 0;

          return (
            <div key={pe.id} style={{ ...S.exCard, ...(isDone ? S.exDone : {}) }}>
              <div style={S.exHeader}>
                <div>
                  <div style={S.exTags}>
                    <span style={S.muscleTag}>{pe.exercise.muscle}</span>
                    {isDone && <span style={S.doneTag}><Icon name="check" size={12} /> Done</span>}
                  </div>
                  <h3 style={{ ...S.exName, color: isDone ? '#34C759' : '#fff' }}>{pe.exercise.name}</h3>
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

              {/* Stats grid with inline editable weight + reps (Change 1) */}
              <div style={S.stats}>
                <div style={S.stat}>
                  <div style={S.statLabel}>SETS</div>
                  <div style={S.statVal}>{done}/{pe.sets}</div>
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
                  <div style={S.statLabel}>NEXT</div>
                  <div style={S.statValGreen}>+{pe.progressionKg}</div>
                </div>
              </div>

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

      {/* Nutrition Modal */}
      {showNutrition && (
        <div style={S.overlay} onClick={() => setShowNutrition(false)}>
          <div style={S.nutritionModal} onClick={e => e.stopPropagation()}>
            <h3 style={S.nutritionTitle}>Today's Nutrition</h3>
            <div style={S.nutritionSection}>
              <div style={S.nutritionSectionHeader}><span>💧 Water</span><span style={S.nutritionProgress}>{nutrition.todayWater}/{WATER_GOAL}</span></div>
              <div style={S.waterTrack}>
                {[...Array(WATER_GOAL)].map((_, i) => (
                  <div key={i} style={{ ...S.waterGlass, background: i < nutrition.todayWater ? '#3B82F6' : 'rgba(255,255,255,0.08)' }} onClick={() => nutrition.setWaterTo(i + 1)} />
                ))}
              </div>
              <button onClick={nutrition.addWater} style={S.addWaterBtn}>+ ADD GLASS</button>
            </div>
            <div style={S.nutritionSection}>
              <div style={S.nutritionSectionHeader}><span>🥩 Protein</span><span style={S.nutritionProgress}>{nutrition.todayProtein}/{proteinGoal}g</span></div>
              <div style={S.proteinBar}><div style={{ ...S.proteinFill, width: `${Math.min(100, (nutrition.todayProtein / proteinGoal) * 100)}%` }} /></div>
              <div style={S.proteinGrid}>
                {proteinSources.map(src => (
                  <button key={src.name} onClick={() => nutrition.addProtein(src)} style={S.proteinBtn}>
                    <span style={S.proteinBtnIcon}>{src.icon}</span>
                    <span style={S.proteinBtnName}>{src.name}</span>
                    <span style={S.proteinBtnVal}>+{src.protein}g</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setShowNutrition(false)} style={S.nutritionClose}>DONE</button>
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
                          <div style={ehStyles.sessionVolume}>Volume: {sessionVol >= 1000 ? `${(sessionVol / 1000).toFixed(1)}t` : `${Math.round(sessionVol)}kg`}</div>
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
        const swapResults = exerciseData?.filterExercises({
          search: exSearch,
          equipment: exEquipment,
          muscle: exMuscle === 'All' ? showSwap.exercise.muscle as MuscleGroup : exMuscle,
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
                  onChange={e => setExEquipment(e.target.value as Equipment | 'All')}
                  style={ebStyles.select}
                >
                  <option value="All">All Equipment</option>
                  {EQUIPMENT_TYPES.map(eq => (
                    <option key={eq} value={eq} style={ebStyles.option}>{eq === 'None' ? 'Bodyweight' : eq}</option>
                  ))}
                </select>
                <select
                  value={exMuscle === 'All' ? showSwap.exercise.muscle : exMuscle}
                  onChange={e => setExMuscle(e.target.value as MuscleGroup | 'All')}
                  style={ebStyles.select}
                >
                  <option value="All">All Muscles</option>
                  {MUSCLE_GROUPS.map(m => (
                    <option key={m} value={m} style={ebStyles.option}>{m}</option>
                  ))}
                </select>
              </div>

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
                {swapResults.length === 0 && (
                  <p style={{ color: colors.textTertiary, textAlign: 'center', padding: '1rem 0' }}>No exercises match filters</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add exercise modal (Dual Filter) */}
      {showAddExercise && (
        <div style={S.overlay} onClick={() => { setShowAddExercise(false); setExSearch(''); setExEquipment('All'); setExMuscle('All'); }}>
          <div style={{ ...S.addExModal, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={S.addExTitle}>Add Exercise</h3>
            <p style={S.addExSub}>Add to {plan.currentDay?.name}</p>

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
                onChange={e => setExEquipment(e.target.value as Equipment | 'All')}
                style={ebStyles.select}
              >
                <option value="All">All Equipment</option>
                {EQUIPMENT_TYPES.map(eq => (
                  <option key={eq} value={eq} style={ebStyles.option}>{eq === 'None' ? 'Bodyweight' : eq}</option>
                ))}
              </select>
              <select
                value={exMuscle}
                onChange={e => setExMuscle(e.target.value as MuscleGroup | 'All')}
                style={ebStyles.select}
              >
                <option value="All">All Muscles</option>
                {MUSCLE_GROUPS.map(m => (
                  <option key={m} value={m} style={ebStyles.option}>{m}</option>
                ))}
              </select>
            </div>

            {/* Results */}
            <div style={S.addExList}>
              {filteredExercises.map(ex => (
                <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => {
                      plan.addExercise(ex);
                      setShowAddExercise(false);
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
              {filteredExercises.length === 0 && (
                <p style={{ color: colors.textTertiary, textAlign: 'center', padding: '1rem 0' }}>No exercises match filters</p>
              )}
            </div>
            <button onClick={() => { setShowAddExercise(false); setExSearch(''); setExEquipment('All'); setExMuscle('All'); }} style={S.addExCancel}>CANCEL</button>
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
            <button onClick={() => setShowCustomWorkout(true)} style={templatesCustomStyles.launchBtn}>+ CREATE YOUR OWN WORKOUT</button>
            <button onClick={() => setShowTemplates(false)} style={S.templatesCancel}>CANCEL</button>
          </div>
        </div>
      )}

      {showCustomWorkout && (
        <div style={S.overlay} onClick={() => setShowCustomWorkout(false)}>
          <div style={templatesCustomStyles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={templatesCustomStyles.title}>Create Your Own Workout</h3>
            <p style={templatesCustomStyles.sub}>Start from scratch with your own named split.</p>
            <label style={templatesCustomStyles.label}>Workout Name</label>
            <input
              type="text"
              value={customWorkoutName}
              maxLength={32}
              onChange={e => setCustomWorkoutName(e.target.value)}
              placeholder="My Workout"
              style={templatesCustomStyles.input}
            />
            <label style={templatesCustomStyles.label}>Training Days / Week</label>
            <select
              value={customWorkoutDays}
              onChange={e => setCustomWorkoutDays(Number(e.target.value))}
              style={templatesCustomStyles.select}
            >
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <option key={day} value={day} style={templatesCustomStyles.option}>{day} {day === 1 ? 'day' : 'days'}</option>
              ))}
            </select>
            <div style={templatesCustomStyles.actions}>
              <button onClick={() => setShowCustomWorkout(false)} style={templatesCustomStyles.cancel}>Cancel</button>
              <button onClick={handleCreateCustomWorkout} style={templatesCustomStyles.create}>Create Workout</button>
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
};

const templatesCustomStyles: Record<string, React.CSSProperties> = {
  launchBtn: {
    width: '100%',
    borderRadius: radii.md,
    border: `1px solid ${colors.primaryBorder}`,
    background: 'rgba(255,59,48,0.08)',
    color: colors.primary,
    fontWeight: typography.weights.black,
    fontSize: typography.sizes.sm,
    padding: `${spacing.sm}px ${spacing.md}px`,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  modal: {
    width: 'min(92vw, 420px)',
    borderRadius: radii.xl,
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
    padding: spacing.lg,
  },
  title: { color: colors.text, margin: 0, marginBottom: spacing.xs, fontSize: typography.sizes.xl },
  sub: { color: colors.textSecondary, marginTop: 0, marginBottom: spacing.md, fontSize: typography.sizes.sm },
  label: { display: 'block', color: colors.textSecondary, marginBottom: 6, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'rgba(255,255,255,0.06)',
    color: colors.text,
    marginBottom: spacing.md,
  },
  select: {
    width: '100%',
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    background: colors.surface,
    color: colors.text,
    marginBottom: spacing.md,
  },
  option: { background: '#111', color: '#fff' },
  actions: { display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' },
  cancel: {
    borderRadius: radii.md, border: `1px solid ${colors.surfaceBorder}`, background: 'transparent', color: colors.textSecondary, padding: `${spacing.sm}px ${spacing.md}px`,
  },
  create: {
    borderRadius: radii.md, border: 'none', background: colors.primary, color: '#fff', padding: `${spacing.sm}px ${spacing.md}px`, fontWeight: typography.weights.bold,
  },
};
