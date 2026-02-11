/**
 * HowToSheet — bottom-sheet style overlay showing exercise form cues,
 * muscles worked, common mistakes, and optional YouTube link.
 */

import React from 'react';
import type { Exercise } from '@/shared/types';
import { exerciseGuides } from '@/data/exercise-guides';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';

interface Props {
  exercise: Exercise;
  onClose: () => void;
}

export function HowToSheet({ exercise, onClose }: Props) {
  const guide = exerciseGuides[exercise.name];

  return (
    <div style={ss.backdrop} onClick={onClose}>
      <div style={ss.sheet} onClick={e => e.stopPropagation()}>
        {/* Handle bar */}
        <div style={ss.handle} />

        {/* Header */}
        <h3 style={ss.title}>{exercise.name}</h3>

        {/* Muscles */}
        {guide?.muscles.length ? (
          <div style={ss.section}>
            <div style={ss.sectionLabel}>MUSCLES</div>
            <div style={ss.muscleRow}>
              {guide.muscles.map((m, i) => (
                <span key={i} style={i === 0 ? ss.musclePrimary : ss.muscleSecondary}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Form Cues */}
        {guide?.cues.length ? (
          <div style={ss.section}>
            <div style={ss.sectionLabel}>FORM CUES</div>
            <ul style={ss.list}>
              {guide.cues.map((cue, i) => (
                <li key={i} style={ss.listItem}>{cue}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Common Mistakes */}
        {guide?.mistakes.length ? (
          <div style={ss.section}>
            <div style={ss.sectionLabel}>COMMON MISTAKES</div>
            <ul style={ss.mistakeList}>
              {guide.mistakes.map((m, i) => (
                <li key={i} style={ss.mistakeItem}>{m}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* YouTube link (optional) */}
        {exercise.youtubeId && (
          <a
            href={`https://youtube.com/watch?v=${exercise.youtubeId}`}
            target="_blank"
            rel="noreferrer"
            style={ss.videoLink}
          >
            ▶ Watch Video
          </a>
        )}

        {/* No guide fallback */}
        {!guide && (
          <div style={ss.noGuide}>
            <p style={ss.noGuideText}>
              Form guide not available for this exercise yet.
            </p>
            {exercise.youtubeId && (
              <a
                href={`https://youtube.com/watch?v=${exercise.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                style={ss.videoLink}
              >
                ▶ Watch Video
              </a>
            )}
          </div>
        )}

        <button onClick={onClose} style={ss.closeBtn}>CLOSE</button>
      </div>
    </div>
  );
}

const ss: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: colors.overlay,
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 100,
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80vh',
    overflowY: 'auto',
    background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
    borderRadius: '24px 24px 0 0',
    border: `1px solid ${colors.surfaceBorder}`,
    borderBottom: 'none',
    padding: `${spacing.md}px ${spacing.xxl}px ${spacing.xxl}px`,
    paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.2)',
    margin: `0 auto ${spacing.xl}px`,
  },
  title: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.black,
    color: colors.text,
    margin: `0 0 ${spacing.xl}px`,
    textAlign: 'center' as const,
  },
  section: { marginBottom: spacing.xl },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.textTertiary,
    letterSpacing: '0.08em',
    marginBottom: spacing.sm,
  },
  muscleRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
  },
  musclePrimary: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    padding: `${spacing.xs}px ${spacing.md}px`,
    borderRadius: radii.sm,
    background: colors.primarySurface,
    border: `1px solid ${colors.primaryBorder}`,
    color: colors.primary,
  },
  muscleSecondary: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    padding: `${spacing.xs}px ${spacing.md}px`,
    borderRadius: radii.sm,
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
    color: colors.textSecondary,
  },
  list: {
    margin: 0,
    paddingLeft: spacing.xl,
    listStyleType: 'disc',
  },
  listItem: {
    fontSize: typography.sizes.lg,
    color: '#ddd',
    lineHeight: 1.6,
    marginBottom: spacing.xs,
  },
  mistakeList: {
    margin: 0,
    paddingLeft: spacing.xl,
    listStyleType: 'none',
  },
  mistakeItem: {
    fontSize: typography.sizes.md,
    color: colors.warning,
    lineHeight: 1.6,
    marginBottom: spacing.xs,
    position: 'relative' as const,
    paddingLeft: spacing.xl,
  },
  videoLink: {
    display: 'block',
    textAlign: 'center' as const,
    padding: `${spacing.md}px ${spacing.xl}px`,
    borderRadius: radii.lg,
    background: 'rgba(255,0,0,0.08)',
    border: '1px solid rgba(255,0,0,0.25)',
    color: colors.youtube,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
    textDecoration: 'none',
    marginBottom: spacing.md,
  },
  noGuide: {
    textAlign: 'center' as const,
    padding: `${spacing.xl}px 0`,
  },
  noGuideText: {
    color: colors.textTertiary,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.md,
  },
  closeBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: radii.xl,
    border: `1px solid ${colors.surfaceHover}`,
    background: colors.surface,
    color: colors.text,
    cursor: 'pointer',
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
  },
};
