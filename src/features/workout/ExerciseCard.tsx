import React, { useState } from 'react';
import type { PlanExercise, Exercise } from '@/shared/types';
import type { ProgressionResult, ProgressionBanner } from '@/training/progression';
import { formatProgressionBanner } from '@/training/progression';
import { Icon, InlineEdit } from '@/shared/components';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { getWarmupSets, formatTime, formatVolume } from '@/shared/utils';

// ── Props ────────────────────────────────────────────────────────────────────

export interface ExerciseCardProps {
  exercise: PlanExercise;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  completedSets: number;
  currentVolume: number;
  previousVolume: number;
  isWarmupOpen: boolean;
  hasHistory: boolean;
  /** Rest timer is active for this exercise */
  isResting: boolean;
  /** Current rest timer seconds remaining */
  restSeconds: number;
  justCompleted: { exerciseId: string; setNum: number } | null;
  restPulseTarget: string | null;
  progression: ProgressionResult | null | undefined;
  onCompleteSet: (pe: PlanExercise) => void;
  onReorder: (from: number, to: number) => void;
  onUpdateExercise: (id: string, updates: Partial<Pick<PlanExercise, 'reps' | 'weightKg'>>) => void;
  onShowWarmup: (id: string | null) => void;
  onShowHistory: (name: string) => void;
  onShowEdit: (pe: PlanExercise) => void;
  onShowSwap: (pe: PlanExercise) => void;
  onShowHowTo: (exercise: Exercise) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ExerciseCard({
  exercise: pe,
  index,
  isFirst,
  isLast,
  completedSets: done,
  currentVolume,
  previousVolume,
  isWarmupOpen,
  hasHistory,
  isResting,
  restSeconds,
  justCompleted,
  restPulseTarget,
  progression,
  onCompleteSet,
  onReorder,
  onUpdateExercise,
  onShowWarmup,
  onShowHistory,
  onShowEdit,
  onShowSwap,
  onShowHowTo,
}: ExerciseCardProps) {
  const isDone = done >= pe.sets;
  const warmups = getWarmupSets(pe.weightKg);
  const isJustFinished = justCompleted?.exerciseId === pe.id && justCompleted.setNum === pe.sets;
  const isPulsing = restPulseTarget === pe.id;
  const [showActions, setShowActions] = useState(false);

  // ── Card state style ───────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    ...cs.card,
    ...(isDone ? cs.cardDone : {}),
    ...(done > 0 && !isDone ? cs.cardInProgress : {}),
    ...(isResting ? cs.cardResting : {}),
    ...(isJustFinished ? cs.cardFinalFlash : {}),
    ...(isPulsing ? { animation: 'restCardPulse 0.5s ease-out' } : {}),
  };

  // ── Progression banner ─────────────────────────────────────────────────
  const banner: ProgressionBanner | null = (isDone && !pe.exercise.isBodyweight && progression !== undefined)
    ? formatProgressionBanner(progression ?? null, pe.weightKg)
    : null;

  // ── Volume delta ───────────────────────────────────────────────────────
  const volDelta = previousVolume > 0 ? currentVolume - previousVolume : null;

  return (
    <div style={cardStyle}>
      {/* Progression ribbon — shown at top when exercise is complete */}
      {banner && (
        <div style={{ ...progressionStyles[banner.tone], animation: 'fadeInUp 0.35s ease both' }}>
          <span style={progressionStyles.icon}>{banner.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={progressionStyles.label}>{banner.label}</div>
            <div style={progressionStyles.subtext}>{banner.subtext}</div>
          </div>
        </div>
      )}

      {/* ── Header row ──────────────────────────────────────────────────── */}
      <div style={cs.header}>
        {/* Reorder handle */}
        <div style={cs.reorderCol}>
          <button
            onClick={() => onReorder(index, index - 1)}
            disabled={isFirst}
            style={{ ...cs.reorderBtn, ...(isFirst ? cs.reorderDisabled : {}) }}
            aria-label={`Move ${pe.exercise.name} up`}
          >
            ↑
          </button>
          <button
            onClick={() => onReorder(index, index + 1)}
            disabled={isLast}
            style={{ ...cs.reorderBtn, ...(isLast ? cs.reorderDisabled : {}) }}
            aria-label={`Move ${pe.exercise.name} down`}
          >
            ↓
          </button>
        </div>

        {/* Name + tags */}
        <div style={cs.titleCol}>
          <div style={cs.tagRow}>
            <span style={cs.muscleTag}>{pe.exercise.muscle}</span>
            {pe.exercise.equipment && pe.exercise.equipment !== 'Bodyweight' && (
              <span style={cs.equipTag}>{pe.exercise.equipment}</span>
            )}
            {isDone && <span style={cs.doneChip}><Icon name="check" size={10} /> Done</span>}
          </div>
          <h3 style={{ ...cs.name, color: isDone ? colors.success : colors.text }}>{pe.exercise.name}</h3>
        </div>

        {/* Action buttons: primary visible + overflow */}
        <div style={cs.actionsCol}>
          {hasHistory && (
            <button onClick={() => onShowHistory(pe.exercise.name)} style={cs.actionBtn} title="History">
              <Icon name="history" size={14} />
            </button>
          )}
          <button onClick={() => onShowEdit(pe)} style={cs.actionBtnBlue} title="Edit">
            <Icon name="edit" size={14} />
          </button>
          <button
            onClick={() => setShowActions(v => !v)}
            style={{ ...cs.actionBtn, ...(showActions ? cs.actionBtnActive : {}) }}
            title="More"
          >
            ···
          </button>
        </div>
      </div>

      {/* Overflow actions row */}
      {showActions && (
        <div style={cs.overflowRow}>
          {!pe.exercise.isBodyweight && (
            <button
              onClick={() => { onShowWarmup(isWarmupOpen ? null : pe.id); setShowActions(false); }}
              style={cs.overflowBtn}
            >
              <Icon name="fire" size={12} />
              <span>Warm-up</span>
            </button>
          )}
          <button onClick={() => { onShowSwap(pe); setShowActions(false); }} style={cs.overflowBtn}>
            <Icon name="swap" size={12} />
            <span>Swap</span>
          </button>
          <button onClick={() => { onShowHowTo(pe.exercise); setShowActions(false); }} style={cs.overflowBtn}>
            <span style={{ fontWeight: typography.weights.black }}>?</span>
            <span>How-to</span>
          </button>
        </div>
      )}

      {/* ── Warmup section ──────────────────────────────────────────────── */}
      {isWarmupOpen && (
        <div style={cs.warmupBox}>
          <div style={cs.warmupTitle}>WARM-UP SETS</div>
          {warmups.map((w, i) => (
            <div key={i} style={cs.warmupRow}>
              <span style={cs.warmupLabel}>{w.label}</span>
              <span style={cs.warmupVal}>{w.weightKg}kg x {w.reps}</span>
              <input type="checkbox" style={{ accentColor: colors.warning, width: 18, height: 18 }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Stats section ───────────────────────────────────────────────── */}
      <div style={cs.statsRow}>
        {/* Weight — dominant stat */}
        <div style={cs.statPrimary}>
          <div style={cs.statLabel}>WEIGHT</div>
          {pe.exercise.isBodyweight ? (
            <div style={{ ...cs.statValLarge, color: colors.text }}>BW</div>
          ) : (
            <InlineEdit
              value={pe.weightKg}
              step={2.5}
              min={0}
              max={500}
              inputMode="decimal"
              color={colors.primary}
              suffix="kg"
              onChange={val => onUpdateExercise(pe.id, { weightKg: val })}
            />
          )}
        </div>

        {/* Reps */}
        <div style={cs.stat}>
          <div style={cs.statLabel}>REPS</div>
          <InlineEdit
            value={pe.reps}
            step={1}
            min={pe.repsMin ?? 1}
            max={pe.repsMax ?? 30}
            inputMode="numeric"
            color={colors.text}
            onChange={val => onUpdateExercise(pe.id, { reps: val })}
          />
        </div>

        {/* Sets — segmented progress bar */}
        <div style={cs.stat}>
          <div style={cs.statLabel}>SETS</div>
          <div
            key={`sets-${pe.id}-${done}`}
            style={{
              ...cs.statVal,
              ...(justCompleted?.exerciseId === pe.id ? { animation: 'setCountPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' } : {}),
            }}
          >
            {done}/{pe.sets}
          </div>
          <div style={cs.segmentBar}>
            {Array.from({ length: pe.sets }, (_, i) => (
              <div
                key={i}
                style={{
                  ...cs.segment,
                  ...(i < done ? {
                    ...cs.segmentFilled,
                    animationDelay: justCompleted?.exerciseId === pe.id
                      ? `${i * 60}ms` : '0ms',
                  } : {}),
                }}
              />
            ))}
          </div>
        </div>

        {/* Volume */}
        <div style={cs.stat}>
          <div style={cs.statLabel}>VOLUME</div>
          <div style={cs.statVal}>{formatVolume(currentVolume, { abbreviated: true })}</div>
          {volDelta !== null && (
            <div style={{
              ...cs.volDelta,
              color: volDelta >= 0 ? colors.success : colors.textTertiary,
            }}>
              {volDelta >= 0 ? '+' : ''}{formatVolume(Math.abs(volDelta), { abbreviated: true })}
            </div>
          )}
        </div>
      </div>

      {/* ── All sets complete ───────────────────────────────────────────── */}
      {isDone && isJustFinished && (
        <div style={cs.allDone}>
          <Icon name="check" size={24} /> ALL SETS COMPLETE
        </div>
      )}

      {/* ── Complete Set button ─────────────────────────────────────────── */}
      {!isDone && (
        <button
          onClick={() => onCompleteSet(pe)}
          disabled={isResting}
          style={{ ...cs.completeBtn, ...(isResting ? cs.completeBtnResting : {}) }}
        >
          {isResting
            ? `RESTING... ${formatTime(restSeconds)}`
            : `COMPLETE SET ${done + 1}`
          }
        </button>
      )}
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const cs: Record<string, React.CSSProperties> = {
  // Card container
  card: {
    padding: spacing.lg,
    borderRadius: 20,
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
    transition: 'all 0.25s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  cardDone: {
    background: colors.successSurface,
    border: `1px solid ${colors.successBorder}`,
  },
  cardInProgress: {
    borderLeft: `3px solid ${colors.success}`,
    background: 'rgba(52,199,89,0.03)',
  },
  cardResting: {
    borderColor: colors.warningBorder,
    boxShadow: `0 0 12px rgba(255,149,0,0.08)`,
  },
  cardFinalFlash: {
    animation: 'greenFlash 0.35s ease, cardCompleteSlide 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  // Reorder column
  reorderCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    paddingTop: 2,
    flexShrink: 0,
  },
  reorderBtn: {
    width: 22,
    height: 18,
    borderRadius: radii.sm,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'transparent',
    color: colors.textTertiary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'all 0.15s',
  },
  reorderDisabled: {
    opacity: 0.25,
    cursor: 'not-allowed',
  },

  // Title column
  titleCol: {
    flex: 1,
    minWidth: 0,
  },
  tagRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  muscleTag: {
    fontSize: '0.55rem',
    fontWeight: typography.weights.black,
    padding: '3px 8px',
    borderRadius: radii.sm,
    background: colors.surfaceHover,
    color: colors.textSecondary,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  },
  equipTag: {
    fontSize: '0.55rem',
    fontWeight: typography.weights.bold,
    padding: '3px 8px',
    borderRadius: radii.sm,
    background: 'rgba(59,130,246,0.08)',
    color: colors.info,
    letterSpacing: '0.03em',
  },
  doneChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: '0.55rem',
    fontWeight: typography.weights.black,
    padding: '3px 8px',
    borderRadius: radii.sm,
    background: 'rgba(52,199,89,0.15)',
    color: colors.success,
  },
  name: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.black,
    margin: 0,
    lineHeight: 1.2,
  },

  // Actions
  actionsCol: {
    display: 'flex',
    gap: 4,
    flexShrink: 0,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'transparent',
    color: colors.textSecondary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'all 0.15s',
  },
  actionBtnBlue: {
    width: 30,
    height: 30,
    borderRadius: radii.md,
    border: `1px solid ${colors.infoBorder}`,
    background: 'rgba(59,130,246,0.06)',
    color: colors.info,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  actionBtnActive: {
    background: colors.surfaceHover,
    borderColor: colors.textTertiary,
  },

  // Overflow actions
  overflowRow: {
    display: 'flex',
    gap: 6,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottom: `1px solid ${colors.surfaceBorder}`,
  },
  overflowBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'transparent',
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },

  // Warmup
  warmupBox: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    background: 'rgba(255,149,0,0.06)',
    border: `1px solid ${colors.warningBorder}`,
  },
  warmupTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.warning,
    marginBottom: spacing.sm,
    letterSpacing: '0.06em',
  },
  warmupRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: typography.sizes.md,
    color: '#ddd',
    padding: `4px 0`,
  },
  warmupLabel: { color: colors.warning, fontWeight: typography.weights.bold },
  warmupVal: { fontWeight: typography.weights.bold },

  // Stats row
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statPrimary: {
    padding: `${spacing.sm + 2}px ${spacing.sm}px`,
    borderRadius: radii.lg,
    background: 'rgba(255,59,48,0.06)',
    border: `1px solid ${colors.primaryBorder}`,
    textAlign: 'center',
  },
  stat: {
    padding: `${spacing.sm + 2}px ${spacing.sm}px`,
    borderRadius: radii.lg,
    background: colors.surface,
    border: '1px solid rgba(255,255,255,0.05)',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontWeight: typography.weights.black,
    marginBottom: 4,
    letterSpacing: '0.04em',
  },
  statVal: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
    color: colors.text,
  },
  statValLarge: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.black,
  },
  volDelta: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
    fontWeight: typography.weights.bold,
  },

  // Segmented progress bar (replaces dots)
  segmentBar: {
    display: 'flex',
    gap: 3,
    justifyContent: 'center',
    marginTop: 4,
  },
  segment: {
    flex: 1,
    maxWidth: 20,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.1)',
    transition: 'all 0.25s ease',
  },
  segmentFilled: {
    background: colors.success,
    animation: 'dotFill 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },

  // All done message
  allDone: {
    textAlign: 'center' as const,
    padding: '14px',
    color: colors.success,
    fontWeight: typography.weights.black,
    fontSize: typography.sizes.lg,
    animation: 'setComplete 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Complete set button
  completeBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: radii.xl,
    border: 'none',
    background: colors.primaryGradient,
    color: colors.text,
    cursor: 'pointer',
    fontWeight: typography.weights.black,
    fontSize: typography.sizes.lg,
    boxShadow: `0 4px 15px ${colors.primaryGlow}`,
    transition: 'all 0.2s ease',
  },
  completeBtnResting: {
    background: 'rgba(255,149,0,0.08)',
    border: `1px solid ${colors.warningBorder}`,
    color: colors.warning,
    cursor: 'not-allowed',
    boxShadow: 'none',
    fontWeight: typography.weights.bold,
  },
};

// Progression banner styles
const progressionBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: spacing.sm,
  padding: `${spacing.sm}px ${spacing.md}px`,
  borderRadius: radii.lg,
  marginBottom: spacing.md,
};

const progressionStyles: Record<string, React.CSSProperties> = {
  success: { ...progressionBase, background: colors.successSurface, border: `1px solid ${colors.successBorder}` },
  warning: { ...progressionBase, background: colors.warningSurface, border: `1px solid ${colors.warningBorder}` },
  neutral: { ...progressionBase, background: colors.surface, border: `1px solid ${colors.surfaceBorder}` },
  icon: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.black, lineHeight: '1.2', flexShrink: 0 },
  label: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.text },
  subtext: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
};
