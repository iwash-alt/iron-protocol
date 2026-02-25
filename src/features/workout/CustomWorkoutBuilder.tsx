import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Exercise, CustomWorkoutInput } from '@/shared/types';
import { ExerciseBrowserModal } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';

// ── Draft types ──────────────────────────────────────────────────────────────

interface DraftExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  weightKg: number;
}

interface DraftDay {
  id: string;
  name: string;
  exercises: DraftExercise[];
}

function makeDays(count: number, existing: DraftDay[]): DraftDay[] {
  return Array.from({ length: count }, (_, i) =>
    existing[i] ?? { id: `draft-day-${i + 1}`, name: '', exercises: [] },
  );
}

// ── Props ────────────────────────────────────────────────────────────────────

interface CustomWorkoutBuilderProps {
  onSave: (config: CustomWorkoutInput) => void;
  onCancel: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function CustomWorkoutBuilder({ onSave, onCancel }: CustomWorkoutBuilderProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [programName, setProgramName] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [days, setDays] = useState<DraftDay[]>(() => makeDays(3, []));
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set(['draft-day-1']));
  const [browserForDayId, setBrowserForDayId] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the name input on step 1
  useEffect(() => {
    if (step === 1) {
      // Small delay to ensure the modal is rendered
      const t = setTimeout(() => nameInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [step]);

  // ── Day management ───────────────────────────────────────────────────────

  const handleDaysChange = useCallback((count: number) => {
    setDaysPerWeek(count);
    setDays(prev => makeDays(count, prev));
  }, []);

  const toggleDay = useCallback((dayId: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  }, []);

  const updateDayName = useCallback((dayId: string, name: string) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, name } : d));
  }, []);

  // ── Exercise management ──────────────────────────────────────────────────

  const addExercise = useCallback((dayId: string, exercise: Exercise) => {
    setDays(prev => prev.map(d =>
      d.id === dayId
        ? { ...d, exercises: [...d.exercises, { exercise, sets: 3, reps: 8, weightKg: 0 }] }
        : d,
    ));
  }, []);

  const updateExerciseField = useCallback((dayId: string, index: number, patch: Partial<DraftExercise>) => {
    setDays(prev => prev.map(d =>
      d.id === dayId
        ? { ...d, exercises: d.exercises.map((ex, i) => i === index ? { ...ex, ...patch } : ex) }
        : d,
    ));
  }, []);

  const removeExercise = useCallback((dayId: string, index: number) => {
    setDays(prev => prev.map(d =>
      d.id === dayId
        ? { ...d, exercises: d.exercises.filter((_, i) => i !== index) }
        : d,
    ));
  }, []);

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    const name = programName.trim() || 'Custom Program';
    const config: CustomWorkoutInput = {
      name,
      days: daysPerWeek,
      dayExercises: days.map((day, index) => ({
        name: day.name.trim() || `Day ${index + 1}`,
        exercises: day.exercises.map(de => ({
          exercise: de.exercise,
          sets: de.sets,
          reps: de.reps,
          weightKg: de.weightKg,
        })),
      })),
    };
    onSave(config);
  }, [programName, daysPerWeek, days, onSave]);

  // ── Navigation ───────────────────────────────────────────────────────────

  const goNext = () => {
    if (step < 4) setStep((step + 1) as 1 | 2 | 3 | 4);
  };

  const goBack = () => {
    if (step === 1) {
      onCancel();
    } else {
      setStep((step - 1) as 1 | 2 | 3 | 4);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div style={S.overlay} onClick={onCancel}>
        <div style={bStyles.modal} onClick={e => e.stopPropagation()}>
          <div style={bStyles.stepBadge}>Step {step} of 4</div>

          {/* ── Step 1: Name ──────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <h3 style={bStyles.title}>Name Your Program</h3>
              <div style={bStyles.nameInputWrap}>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={programName}
                  maxLength={40}
                  onChange={e => setProgramName(e.target.value)}
                  placeholder="e.g. My Power Program"
                  style={bStyles.nameInput}
                />
              </div>
            </>
          )}

          {/* ── Step 2: Days ──────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <h3 style={bStyles.title}>How Many Days?</h3>
              <div style={bStyles.pillRow}>
                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                  <button
                    key={n}
                    onClick={() => handleDaysChange(n)}
                    style={n === daysPerWeek ? bStyles.pillActive : bStyles.pill}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p style={bStyles.helper}>You can add or remove days later</p>
            </>
          )}

          {/* ── Step 3: Build Each Day ────────────────────────────────── */}
          {step === 3 && (
            <>
              <h3 style={bStyles.title}>Build Each Day</h3>
              <div style={bStyles.dayCardsList}>
                {days.map((day, dayIndex) => {
                  const isExpanded = expandedDays.has(day.id);
                  const displayName = day.name.trim() || 'Untitled';
                  return (
                    <div key={day.id} style={bStyles.dayCard}>
                      {/* Collapsible header */}
                      <button
                        onClick={() => toggleDay(day.id)}
                        style={bStyles.dayHeader}
                        aria-expanded={isExpanded}
                      >
                        <span style={bStyles.dayHeaderText}>
                          Day {dayIndex + 1}: {displayName}
                        </span>
                        <span style={bStyles.dayHeaderRight}>
                          <span style={bStyles.exerciseBadge}>
                            {day.exercises.length}
                          </span>
                          <span style={{
                            ...bStyles.chevron,
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}>
                            {'\u25BC'}
                          </span>
                        </span>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div style={bStyles.dayBody}>
                          <input
                            type="text"
                            value={day.name}
                            maxLength={32}
                            placeholder="e.g. Heavy Upper"
                            onChange={e => updateDayName(day.id, e.target.value)}
                            style={bStyles.dayNameInput}
                          />

                          {/* Column headers */}
                          {day.exercises.length > 0 && (
                            <div style={bStyles.exHeaderRow}>
                              <span style={bStyles.exHeaderName}>Exercise</span>
                              <span style={bStyles.exHeaderLabel}>Sets</span>
                              <span style={bStyles.exHeaderLabel}>Reps</span>
                              <span style={bStyles.exHeaderLabel}>kg</span>
                              <span style={bStyles.exHeaderRemove} />
                            </div>
                          )}

                          {/* Exercise list */}
                          {day.exercises.length === 0 ? (
                            <p style={bStyles.emptyText}>No exercises added yet</p>
                          ) : (
                            day.exercises.map((de, exIdx) => (
                              <div key={`${day.id}-${de.exercise.id}-${exIdx}`} style={bStyles.exRow}>
                                <div style={bStyles.exMeta}>
                                  <div style={bStyles.exName}>{de.exercise.name}</div>
                                  <div style={bStyles.exMuscle}>{de.exercise.muscle}</div>
                                </div>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={1}
                                  max={10}
                                  value={de.sets}
                                  onChange={e => updateExerciseField(day.id, exIdx, {
                                    sets: Math.min(10, Math.max(1, Number(e.target.value) || 1)),
                                  })}
                                  style={bStyles.fieldInput}
                                  aria-label="Sets"
                                />
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={1}
                                  max={100}
                                  value={de.reps}
                                  onChange={e => updateExerciseField(day.id, exIdx, {
                                    reps: Math.min(100, Math.max(1, Number(e.target.value) || 1)),
                                  })}
                                  style={bStyles.fieldInput}
                                  aria-label="Reps"
                                />
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  min={0}
                                  step={0.5}
                                  value={de.weightKg}
                                  onChange={e => updateExerciseField(day.id, exIdx, {
                                    weightKg: Math.max(0, Number(e.target.value) || 0),
                                  })}
                                  style={bStyles.fieldInput}
                                  aria-label="Weight (kg)"
                                />
                                <button
                                  onClick={() => removeExercise(day.id, exIdx)}
                                  style={bStyles.removeBtn}
                                  aria-label={`Remove ${de.exercise.name}`}
                                >
                                  {'\u00D7'}
                                </button>
                              </div>
                            ))
                          )}

                          <button
                            onClick={() => setBrowserForDayId(day.id)}
                            style={bStyles.addExBtn}
                          >
                            + ADD EXERCISE
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Step 4: Review ────────────────────────────────────────── */}
          {step === 4 && (
            <>
              <h3 style={bStyles.title}>Review + Save</h3>
              <div style={bStyles.reviewHeader}>
                {programName.trim() || 'Custom Program'}
              </div>
              <div style={bStyles.reviewSubHeader}>
                {daysPerWeek} day{daysPerWeek === 1 ? '' : 's'}
              </div>
              <div style={bStyles.reviewList}>
                {days.map((day, index) => (
                  <div key={day.id} style={bStyles.reviewDayCard}>
                    <div style={bStyles.reviewDayTitle}>
                      {day.name.trim() || `Day ${index + 1}`}
                      <span style={bStyles.reviewDayCount}>
                        {' '}{'\u2014'} {day.exercises.length} exercise{day.exercises.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    {day.exercises.length === 0 ? (
                      <div style={bStyles.emptyText}>No exercises</div>
                    ) : day.exercises.map((de, ei) => (
                      <div key={`review-${day.id}-${ei}`} style={bStyles.reviewExRow}>
                        <span>{de.exercise.name}</span>
                        <span style={bStyles.reviewExDetail}>
                          {de.sets}x{de.reps} @ {de.weightKg}kg
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Navigation ────────────────────────────────────────────── */}
          <div style={bStyles.actions}>
            <button onClick={goBack} style={bStyles.backBtn}>
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            {step < 4 ? (
              <button onClick={goNext} style={bStyles.nextBtn}>
                Next
              </button>
            ) : (
              <button onClick={handleSave} style={bStyles.saveBtn}>
                SAVE PROGRAM
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exercise browser — rendered outside main modal so it stacks on top */}
      {browserForDayId && (
        <ExerciseBrowserModal
          title="Add Exercise"
          subtitle={`Adding to ${days.find(d => d.id === browserForDayId)?.name.trim() || 'this day'}`}
          onSelect={(exercise) => {
            addExercise(browserForDayId, exercise);
            setBrowserForDayId(null);
          }}
          onClose={() => setBrowserForDayId(null)}
        />
      )}
    </>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const bStyles: Record<string, React.CSSProperties> = {
  modal: {
    width: 'min(92vw, 420px)',
    maxHeight: '85vh',
    overflowY: 'auto',
    borderRadius: radii.xl,
    background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)',
    border: `1px solid ${colors.surfaceHover}`,
    padding: spacing.xl,
  },
  stepBadge: {
    display: 'inline-block',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  title: {
    color: colors.text,
    margin: `0 0 ${spacing.md}px`,
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.black,
    textAlign: 'center',
  },

  // Step 1
  nameInputWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  nameInput: {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'rgba(255,255,255,0.06)',
    color: colors.text,
    fontSize: typography.sizes['4xl'],
    textAlign: 'center' as const,
    outline: 'none',
  },

  // Step 2
  pillRow: {
    display: 'flex',
    gap: spacing.sm,
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    marginBottom: spacing.md,
  },
  pill: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'transparent',
    color: colors.textSecondary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    border: `2px solid ${colors.primary}`,
    background: colors.primarySurface,
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: 'center' as const,
    margin: 0,
  },

  // Step 3
  dayCardsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing.sm,
    maxHeight: '55vh',
    overflowY: 'auto' as const,
    marginBottom: spacing.sm,
    paddingRight: 2,
  },
  dayCard: {
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  dayHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.md}px ${spacing.md}px`,
    background: 'transparent',
    border: 'none',
    color: colors.text,
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  dayHeaderText: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.base,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    flex: 1,
    minWidth: 0,
  },
  dayHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  exerciseBadge: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: radii.pill,
    padding: `2px ${spacing.sm}px`,
    minWidth: 20,
    textAlign: 'center' as const,
  },
  chevron: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    transition: 'transform 0.2s ease',
  },
  dayBody: {
    padding: `0 ${spacing.md}px ${spacing.md}px`,
  },
  dayNameInput: {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'rgba(255,255,255,0.06)',
    color: colors.text,
    fontSize: typography.sizes.base,
    outline: 'none',
    marginBottom: spacing.sm,
  },
  exHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 52px 52px 60px 28px',
    gap: 6,
    marginBottom: 4,
    paddingLeft: 2,
  },
  exHeaderName: {
    color: colors.textTertiary,
    fontSize: '0.6rem',
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase' as const,
  },
  exHeaderLabel: {
    color: colors.textTertiary,
    fontSize: '0.6rem',
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
  },
  exHeaderRemove: {
    width: 28,
  },
  exRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 52px 52px 60px 28px',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  exMeta: {
    minWidth: 0,
  },
  exName: {
    color: colors.text,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exMuscle: {
    color: colors.textTertiary,
    fontSize: '0.65rem',
  },
  fieldInput: {
    width: '100%',
    boxSizing: 'border-box' as const,
    borderRadius: radii.sm,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'rgba(255,255,255,0.06)',
    color: colors.text,
    padding: `${spacing.xs}px ${spacing.sm}px`,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textAlign: 'center' as const,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    border: 'none',
    background: 'rgba(255,59,48,0.14)',
    color: colors.primary,
    fontSize: typography.sizes.lg,
    lineHeight: '28px',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    margin: `${spacing.sm}px 0`,
  },
  addExBtn: {
    width: '100%',
    borderRadius: radii.md,
    border: `1px solid ${colors.primaryBorder}`,
    background: 'rgba(255,59,48,0.08)',
    color: colors.primary,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
    marginTop: spacing.xs,
  },

  // Step 4
  reviewHeader: {
    color: colors.text,
    fontWeight: typography.weights.black,
    fontSize: typography.sizes['2xl'],
    textAlign: 'center' as const,
    marginBottom: 2,
  },
  reviewSubHeader: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: 'center' as const,
    marginBottom: spacing.md,
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing.sm,
    maxHeight: '46vh',
    overflowY: 'auto' as const,
    marginBottom: spacing.sm,
    paddingRight: 2,
  },
  reviewDayCard: {
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    padding: spacing.sm,
    background: 'rgba(255,255,255,0.03)',
  },
  reviewDayTitle: {
    color: colors.text,
    fontWeight: typography.weights.bold,
    marginBottom: 6,
  },
  reviewDayCount: {
    color: colors.textSecondary,
    fontWeight: typography.weights.normal,
    fontSize: typography.sizes.sm,
  },
  reviewExRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: spacing.sm,
    color: colors.text,
    fontSize: typography.sizes.sm,
    marginBottom: 4,
  },
  reviewExDetail: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    whiteSpace: 'nowrap' as const,
  },

  // Navigation
  actions: {
    display: 'flex',
    gap: spacing.sm,
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  backBtn: {
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'transparent',
    color: colors.textSecondary,
    padding: `${spacing.sm}px ${spacing.md}px`,
    cursor: 'pointer',
    fontWeight: typography.weights.medium,
  },
  nextBtn: {
    borderRadius: radii.md,
    border: 'none',
    background: colors.primary,
    color: '#fff',
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
  },
  saveBtn: {
    borderRadius: radii.md,
    border: 'none',
    background: colors.primaryGradient,
    color: '#fff',
    padding: `${spacing.sm}px ${spacing.lg}px`,
    fontWeight: typography.weights.black,
    cursor: 'pointer',
    fontSize: typography.sizes.base,
  },
};
