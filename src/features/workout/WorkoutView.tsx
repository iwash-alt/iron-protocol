import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { PlanExercise, RPEValue, Exercise } from '@/shared/types';
import { usePlan } from '@/features/training-plan/PlanContext';
import { useWorkout } from './WorkoutContext';
import { useNutrition } from '@/features/nutrition/nutrition.context';
import { useTimer, getAdaptiveRest } from '@/shared/hooks';
import { Icon, MiniChart } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { getWarmupSets, formatTime, getProteinGoal, WATER_GOAL } from '@/shared/utils';
import { getExercisesByMuscle, getWeightedExercises } from '@/data/exercises';
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
import { HowToSheet } from './HowToSheet';
import { WorkoutSummary, buildWorkoutSummary } from './WorkoutSummary';
import type { WorkoutSummaryData } from './WorkoutSummary';

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
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showExerciseHistory, setShowExerciseHistory] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  // Intelligence features (Pro only)
  const [activeSuggestion, setActiveSuggestion] = useState<WorkoutSuggestion | null>(null);
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<Set<string>>(new Set());
  const [showReadinessCheck, setShowReadinessCheck] = useState<boolean>(() => {
    if (!isPro) return false;
    return !getTodayReadiness();
  });
  const [readinessResult, setReadinessResult] = useState<ReadinessResult | null>(null);

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
      setTimeout(() => setCelebrate(false), 1500);
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
        <div style={S.nutritionItem} onClick={() => setShowNutrition(true)}>
          <span style={S.nutritionIcon}>🥩</span>
          <span style={S.nutritionValue}>{nutrition.todayProtein}/{proteinGoal}g</span>
          <button onClick={e => { e.stopPropagation(); setShowNutrition(true); }} style={S.addBtn}>+</button>
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

      {/* Exercise History Modal */}
      {showExerciseHistory && (
        <div style={S.overlay} onClick={() => setShowExerciseHistory(null)}>
          <div style={S.historyModal} onClick={e => e.stopPropagation()}>
            <h3 style={S.historyTitle}>{showExerciseHistory}</h3>
            <p style={S.historySub}>Weight Progression</p>
            {workout.exerciseHistory[showExerciseHistory]?.length ? (
              <>
                <MiniChart data={workout.exerciseHistory[showExerciseHistory].slice(-10).map(h => h.weightKg)} color="#FF3B30" height={80} />
                <div style={S.historyList}>
                  {workout.exerciseHistory[showExerciseHistory].slice(-10).reverse().map((h, i) => (
                    <div key={i} style={S.historyItem}>
                      <span style={{ color: '#888' }}>{h.date}</span>
                      <span style={S.historyWeight}>{h.weightKg}kg x {h.reps}</span>
                      <span style={S.historyE1rm}>~{h.estimated1RM}kg</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>No history yet</p>
            )}
            <button onClick={() => setShowExerciseHistory(null)} style={S.historyClose}>CLOSE</button>
          </div>
        </div>
      )}

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
        <HowToSheet exercise={showHowTo} onClose={() => setShowHowTo(null)} />
      )}

      {/* Swap exercise modal */}
      {showSwap && (
        <div style={S.overlay} onClick={() => setShowSwap(null)}>
          <div style={S.swapBox} onClick={e => e.stopPropagation()}>
            <h3 style={S.swapTitle}>Swap Exercise</h3>
            <p style={S.swapSub}>Replacing: {showSwap.exercise.name}</p>
            <div style={S.swapList}>
              {getExercisesByMuscle(showSwap.exercise.muscle, showSwap.exercise.id).map(ex => (
                <button key={ex.id} onClick={() => { plan.swapExercise(showSwap.id, ex); setShowSwap(null); }} style={S.swapItem}>
                  <div><div style={S.swapItemName}>{ex.name}</div><div style={S.swapItemMeta}>{ex.equipment}</div></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add exercise modal */}
      {showAddExercise && (
        <div style={S.overlay} onClick={() => setShowAddExercise(false)}>
          <div style={S.addExModal} onClick={e => e.stopPropagation()}>
            <h3 style={S.addExTitle}>Add Exercise</h3>
            <p style={S.addExSub}>Add to {plan.currentDay?.name}</p>
            <div style={S.addExList}>
              {getWeightedExercises().map(ex => (
                <button key={ex.id} onClick={() => { plan.addExercise(ex); setShowAddExercise(false); }} style={S.addExItem}>
                  <div><div style={S.addExName}>{ex.name}</div><div style={S.addExMeta}>{ex.muscle} · {ex.equipment}</div></div>
                  <div style={S.addExArrow}>+</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowAddExercise(false)} style={S.addExCancel}>CANCEL</button>
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
            <button onClick={() => setShowTemplates(false)} style={S.templatesCancel}>CANCEL</button>
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
