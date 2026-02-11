/**
 * SuggestionToast — dismissable mid-workout suggestion display.
 *
 * Slides up below the exercise card. Tracks accepted/dismissed
 * for future ML training.
 */

import React, { useState, useEffect } from 'react';
import type { WorkoutSuggestion, SuggestionEvent } from '@/training/suggestions';
import { colors, radii, typography, spacing } from '@/shared/theme/tokens';

const SUGGESTION_LOG_KEY = 'ironSuggestionLog';

function logSuggestionEvent(event: SuggestionEvent): void {
  try {
    const raw = localStorage.getItem(SUGGESTION_LOG_KEY);
    const log: SuggestionEvent[] = raw ? JSON.parse(raw) : [];
    log.push(event);
    // Keep last 200 events
    const trimmed = log.slice(-200);
    localStorage.setItem(SUGGESTION_LOG_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

interface SuggestionToastProps {
  suggestion: WorkoutSuggestion;
  onDismiss: () => void;
}

export function SuggestionToast({ suggestion, onDismiss }: SuggestionToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleResponse = (outcome: 'accepted' | 'dismissed') => {
    logSuggestionEvent({
      suggestion,
      outcome,
      respondedAt: Date.now(),
    });
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const icon = suggestion.priority === 'alert' ? '🔴'
    : suggestion.priority === 'warning' ? '🟡'
    : '🟢';

  const borderColor = suggestion.priority === 'alert' ? colors.primaryBorder
    : suggestion.priority === 'warning' ? colors.warningBorder
    : colors.successBorder;

  return (
    <div style={{
      ...styles.toast,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      opacity: visible ? 1 : 0,
      borderColor,
    }}>
      <div style={styles.content}>
        <span style={styles.icon}>{icon}</span>
        <span style={styles.message}>{suggestion.message}</span>
      </div>
      <div style={styles.actions}>
        <button onClick={() => handleResponse('accepted')} style={styles.gotItBtn}>GOT IT</button>
        <button onClick={() => handleResponse('dismissed')} style={styles.dismissBtn}>DISMISS</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    margin: `${spacing.sm}px 0`,
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: radii.lg,
    background: 'rgba(30,30,30,0.95)',
    border: '1px solid',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  content: {
    display: 'flex', alignItems: 'flex-start', gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: { fontSize: '0.7rem', marginTop: 2, flexShrink: 0 },
  message: {
    fontSize: typography.sizes.md, color: colors.text,
    lineHeight: 1.4,
  },
  actions: {
    display: 'flex', gap: spacing.sm, justifyContent: 'flex-end',
  },
  gotItBtn: {
    padding: `${spacing.xs + 2}px ${spacing.md}px`,
    borderRadius: radii.sm, border: 'none',
    background: colors.primarySurface, color: colors.primary,
    fontSize: typography.sizes.sm, fontWeight: typography.weights.bold,
    cursor: 'pointer', letterSpacing: '0.03em',
  },
  dismissBtn: {
    padding: `${spacing.xs + 2}px ${spacing.md}px`,
    borderRadius: radii.sm, border: 'none',
    background: 'rgba(255,255,255,0.05)', color: colors.textTertiary,
    fontSize: typography.sizes.sm, fontWeight: typography.weights.medium,
    cursor: 'pointer',
  },
};
