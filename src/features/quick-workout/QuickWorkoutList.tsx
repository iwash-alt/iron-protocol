import React, { useState, useCallback, useRef } from 'react';
import { Icon, ExerciseBrowserModal, EmptyState } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { colors, spacing } from '@/shared/theme/tokens';
import { quickTemplates as defaultTemplates } from '@/data/quick-templates';
import type { QuickTemplate, QuickExerciseConfig, Difficulty } from '@/data/quick-templates';
import type { Exercise } from '@/shared/types';
import { useQuickTemplates } from './useQuickTemplates';

interface QuickWorkoutListProps {
  onStart: (template: QuickTemplate) => void;
  onClose: () => void;
  inline?: boolean;
}

const difficultyColors: Record<Difficulty, { bg: string; text: string }> = {
  easy: { bg: 'rgba(52,199,89,0.15)', text: colors.success },
  moderate: { bg: 'rgba(255,149,0,0.15)', text: colors.warning },
  hard: { bg: 'rgba(255,59,48,0.15)', text: colors.primary },
};

function formatExerciseDetail(config: QuickExerciseConfig): string {
  if (config.durationSeconds !== null) {
    return `${config.sets} \u00D7 ${config.durationSeconds}s`;
  }
  return `${config.sets} \u00D7 ${config.reps} reps`;
}

export function QuickWorkoutList({ onStart, onClose, inline }: QuickWorkoutListProps) {
  const { templates, saveCustomization, resetTemplate, isCustomized } = useQuickTemplates();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingExercises, setEditingExercises] = useState<QuickExerciseConfig[] | null>(null);
  const [showBrowser, setShowBrowser] = useState(false);
  const dirtyRef = useRef(false);

  const handleToggleExpand = useCallback((templateId: string) => {
    if (expandedId === templateId) {
      // Collapsing — save if dirty
      if (dirtyRef.current && editingExercises && editingExercises.length > 0) {
        saveCustomization(templateId, editingExercises);
      }
      setExpandedId(null);
      setEditingExercises(null);
      dirtyRef.current = false;
    } else {
      // Expanding — save previous if dirty
      if (expandedId && dirtyRef.current && editingExercises && editingExercises.length > 0) {
        saveCustomization(expandedId, editingExercises);
      }
      const template = templates.find(t => t.id === templateId);
      setExpandedId(templateId);
      setEditingExercises(template ? [...template.exercises.map(e => ({ ...e }))] : null);
      dirtyRef.current = false;
    }
  }, [expandedId, editingExercises, templates, saveCustomization]);

  const handleStart = useCallback((template: QuickTemplate) => {
    if (dirtyRef.current && editingExercises && editingExercises.length > 0) {
      saveCustomization(template.id, editingExercises);
      onStart({ ...template, exercises: editingExercises });
    } else {
      onStart(template);
    }
    setExpandedId(null);
    setEditingExercises(null);
    dirtyRef.current = false;
  }, [editingExercises, saveCustomization, onStart]);

  const handleAdjust = useCallback((index: number, field: 'reps' | 'durationSeconds', delta: number) => {
    setEditingExercises(prev => {
      if (!prev) return prev;
      const updated = [...prev];
      const ex = { ...updated[index] };
      if (field === 'reps' && ex.reps !== null) {
        ex.reps = Math.max(1, ex.reps + delta);
      } else if (field === 'durationSeconds' && ex.durationSeconds !== null) {
        ex.durationSeconds = Math.max(5, ex.durationSeconds + delta);
      }
      updated[index] = ex;
      dirtyRef.current = true;
      return updated;
    });
  }, []);

  const handleRemove = useCallback((index: number) => {
    setEditingExercises(prev => {
      if (!prev || prev.length === 0) return prev;
      const updated = prev.filter((_, i) => i !== index);
      dirtyRef.current = true;
      return updated;
    });
  }, []);

  const handleAddExercise = useCallback((exercise: Exercise) => {
    setEditingExercises(prev => {
      if (!prev) return prev;
      const newConfig: QuickExerciseConfig = {
        name: exercise.name,
        sets: 3,
        reps: 15,
        durationSeconds: null,
      };
      dirtyRef.current = true;
      return [...prev, newConfig];
    });
    setShowBrowser(false);
  }, []);

  const handleReset = useCallback((templateId: string) => {
    resetTemplate(templateId);
    const original = defaultTemplates.find(t => t.id === templateId);
    if (original) {
      setEditingExercises([...original.exercises.map(e => ({ ...e }))]);
    }
    dirtyRef.current = false;
  }, [resetTemplate]);

  const content = (
    <>
      <h2 style={{ ...S.modalTitle, textAlign: inline ? 'left' : 'center' } as React.CSSProperties}>Quick Workouts</h2>
      <p style={{ ...S.modalSub, textAlign: inline ? 'left' : 'center', marginBottom: 20 } as React.CSSProperties}>No equipment · 15-25 min</p>
      <div style={S.quickList}>
        {templates.map((t, i) => {
          const isExpanded = expandedId === t.id;
          const customized = isCustomized(t.id);
          const exercises = isExpanded && editingExercises ? editingExercises : t.exercises;
          const diffColors = difficultyColors[t.difficulty];

          return (
            <div
              key={t.id}
              style={{
                ...S.quickCard,
                ...(isExpanded ? S.quickCardExpanded : {}),
                ...(inline ? { animation: `fadeInUp 0.35s ease ${i * 0.05}s both` } : {}),
              }}
            >
              {/* Collapsed header — always visible */}
              <div
                style={S.quickCardHeader}
                onClick={() => handleToggleExpand(t.id)}
              >
                <div>
                  <div style={S.quickName}>{t.name}</div>
                  <div style={S.quickMeta}>
                    <span>{t.duration} min</span>
                    <span style={{ color: colors.textTertiary }}>&middot;</span>
                    <span style={{
                      ...S.quickDiffBadge,
                      background: diffColors.bg,
                      color: diffColors.text,
                    }}>
                      {t.difficulty}
                    </span>
                    <span style={{ color: colors.textTertiary }}>&middot;</span>
                    <span>{exercises.length} exercises</span>
                    {customized && <span style={S.quickCustomBadge}>Edited</span>}
                  </div>
                </div>
                <div style={{
                  ...S.quickChevron,
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  <Icon name="chevron-down" size={18} />
                </div>
              </div>

              {/* Expanded body */}
              {isExpanded && editingExercises && (
                <div style={S.quickExpandedBody}>
                  {editingExercises.length === 0 ? (
                    <EmptyState
                      illustration={<Icon name="plus" size={40} />}
                      title="Add exercises to customise this workout"
                      style={{ padding: `${spacing.lg}px ${spacing.sm}px` }}
                    />
                  ) : (
                    editingExercises.map((ex, idx) => (
                      <div key={`${ex.name}-${idx}`} style={S.quickExRow}>
                        <div style={S.quickExName}>{ex.name}</div>
                        <div style={S.quickExDetail}>{formatExerciseDetail(ex)}</div>
                        <div style={S.quickExControls}>
                          <button
                            style={S.quickAdjustBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              const field = ex.durationSeconds !== null ? 'durationSeconds' : 'reps';
                              const step = field === 'durationSeconds' ? -5 : -1;
                              handleAdjust(idx, field, step);
                            }}
                          >
                            −
                          </button>
                          <button
                            style={S.quickAdjustBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              const field = ex.durationSeconds !== null ? 'durationSeconds' : 'reps';
                              const step = field === 'durationSeconds' ? 5 : 1;
                              handleAdjust(idx, field, step);
                            }}
                          >
                            +
                          </button>
                          <button
                            style={{
                              ...S.quickRemoveBtn,
                              ...(editingExercises.length === 0 ? { opacity: 0.3, cursor: 'not-allowed' } : {}),
                            }}
                            disabled={editingExercises.length === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(idx);
                            }}
                          >
                            <Icon name="x" size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Add exercise button — always visible */}
                  <button
                    style={S.quickAddExBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBrowser(true);
                    }}
                  >
                    <Icon name="plus" size={14} /> Add Exercise
                  </button>

                  {/* Start button — hidden when no exercises */}
                  {editingExercises.length > 0 && (
                  <button
                    style={S.quickStartBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStart(t);
                    }}
                  >
                    START WORKOUT
                  </button>
                  )}

                  {/* Reset button (only if customized) */}
                  {customized && (
                    <button
                      style={S.quickResetBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset(t.id);
                      }}
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exercise browser modal */}
      {showBrowser && (
        <ExerciseBrowserModal
          title="Add Exercise"
          subtitle="Select an exercise to add"
          onSelect={handleAddExercise}
          onClose={() => setShowBrowser(false)}
        />
      )}
    </>
  );

  if (inline) {
    return <div style={{ paddingTop: 8 }}>{content}</div>;
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        {content}
      </div>
    </div>
  );
}
