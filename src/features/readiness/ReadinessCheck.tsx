/**
 * Pre-Workout Readiness Check
 *
 * Three quick questions before training:
 *   1. Sleep quality (1–5)
 *   2. Energy level (1–5)
 *   3. Stress level (1–5, inverted: high stress = bad)
 *
 * Combined score (3–15):
 *   12–15: Full send. Train as programmed.
 *    9–11: Normal. Minor adjustments.
 *    6–8:  Reduced. Drop working weights 5–10%.
 *    3–5:  Low. Suggest bodyweight/mobility session.
 */

import React, { useState, useCallback } from 'react';
import { colors, radii, typography, spacing } from '@/shared/theme/tokens';

// ── Types ───────────────────────────────────────────────────────────────────

export interface ReadinessData {
  date: string;
  sleep: number;
  energy: number;
  stress: number;
  score: number;
}

export type ReadinessLevel = 'full_send' | 'normal' | 'reduced' | 'low';

export interface ReadinessResult {
  score: number;
  level: ReadinessLevel;
  label: string;
  recommendation: string;
  weightAdjustment: number; // 0 = no change, -5 = drop 5%, etc.
}

// ── Logic ───────────────────────────────────────────────────────────────────

const READINESS_KEY = 'ironReadiness';

export function calculateReadiness(sleep: number, energy: number, stress: number): ReadinessResult {
  // Stress is inverted: 5 (low stress) = good, 1 (high stress) = bad
  const score = sleep + energy + stress;

  if (score >= 12) {
    return { score, level: 'full_send', label: 'Full Send', recommendation: 'Train as programmed. You\'re ready.', weightAdjustment: 0 };
  } else if (score >= 9) {
    return { score, level: 'normal', label: 'Normal', recommendation: 'Minor adjustments OK. Listen to your body.', weightAdjustment: 0 };
  } else if (score >= 6) {
    return { score, level: 'reduced', label: 'Reduced', recommendation: 'Consider dropping working weights 5–10%.', weightAdjustment: -10 };
  } else {
    return { score, level: 'low', label: 'Low Readiness', recommendation: 'Consider a light bodyweight or mobility session instead.', weightAdjustment: -20 };
  }
}

export function saveReadiness(data: ReadinessData): void {
  try {
    const raw = localStorage.getItem(READINESS_KEY);
    const history: ReadinessData[] = raw ? JSON.parse(raw) : [];
    history.push(data);
    // Keep last 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const filtered = history.filter(d => d.date >= cutoff.toISOString().split('T')[0]);
    localStorage.setItem(READINESS_KEY, JSON.stringify(filtered));
  } catch { /* ignore */ }
}

export function loadReadinessHistory(): ReadinessData[] {
  try {
    const raw = localStorage.getItem(READINESS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getTodayReadiness(): ReadinessData | null {
  const today = new Date().toISOString().split('T')[0];
  return loadReadinessHistory().find(d => d.date === today) ?? null;
}

// ── Component ───────────────────────────────────────────────────────────────

const SLEEP_EMOJIS = ['😵', '😴', '😐', '🙂', '😊'];
const ENERGY_EMOJIS = ['🪫', '😮‍💨', '😐', '⚡', '🔥'];
const STRESS_EMOJIS = ['🤯', '😰', '😐', '😌', '🧘'];

const SLEEP_LABELS = ['Terrible', 'Poor', 'Okay', 'Good', 'Great'];
const ENERGY_LABELS = ['Empty', 'Low', 'Okay', 'Good', 'Charged'];
const STRESS_LABELS = ['Extreme', 'High', 'Moderate', 'Low', 'Calm'];

interface ReadinessCheckProps {
  onComplete: (result: ReadinessResult) => void;
  onSkip: () => void;
}

export function ReadinessCheck({ onComplete, onSkip }: ReadinessCheckProps) {
  const [sleep, setSleep] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [result, setResult] = useState<ReadinessResult | null>(null);

  const handleSubmit = useCallback(() => {
    if (sleep === null || energy === null || stress === null) return;

    const r = calculateReadiness(sleep, energy, stress);
    setResult(r);

    saveReadiness({
      date: new Date().toISOString().split('T')[0],
      sleep, energy, stress,
      score: r.score,
    });

    // Auto-dismiss after 2s
    setTimeout(() => onComplete(r), 2000);
  }, [sleep, energy, stress, onComplete]);

  const allSelected = sleep !== null && energy !== null && stress !== null;

  // ── Result screen ─────────────────────────────────────────────────────
  if (result) {
    const color = result.level === 'full_send' ? colors.success
      : result.level === 'normal' ? colors.info
      : result.level === 'reduced' ? colors.warning
      : colors.primary;

    return (
      <div style={styles.overlay}>
        <div style={styles.card}>
          <div style={{ fontSize: 56, marginBottom: 12, textAlign: 'center' as const }}>
            {result.level === 'full_send' ? '🚀' : result.level === 'normal' ? '👍' : result.level === 'reduced' ? '⚠️' : '🛌'}
          </div>
          <div style={{ ...styles.resultLabel, color }}>{result.label.toUpperCase()}</div>
          <div style={styles.resultScore}>Score: {result.score}/15</div>
          <div style={styles.resultRec}>{result.recommendation}</div>
        </div>
      </div>
    );
  }

  // ── Question screen ───────────────────────────────────────────────────
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.title}>READINESS CHECK</div>
        <div style={styles.subtitle}>Quick check before training</div>

        {/* Sleep */}
        <div style={styles.question}>
          <div style={styles.qLabel}>How did you sleep?</div>
          <div style={styles.emojiRow}>
            {SLEEP_EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setSleep(i + 1)}
                style={{
                  ...styles.emojiBtn,
                  ...(sleep === i + 1 ? styles.emojiBtnActive : {}),
                  borderColor: sleep === i + 1 ? colors.primary : 'rgba(255,255,255,0.08)',
                }}
              >
                <span style={styles.emoji}>{emoji}</span>
                <span style={styles.emojiLabel}>{SLEEP_LABELS[i]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div style={styles.question}>
          <div style={styles.qLabel}>Energy level?</div>
          <div style={styles.emojiRow}>
            {ENERGY_EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setEnergy(i + 1)}
                style={{
                  ...styles.emojiBtn,
                  ...(energy === i + 1 ? styles.emojiBtnActive : {}),
                  borderColor: energy === i + 1 ? colors.primary : 'rgba(255,255,255,0.08)',
                }}
              >
                <span style={styles.emoji}>{emoji}</span>
                <span style={styles.emojiLabel}>{ENERGY_LABELS[i]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stress */}
        <div style={styles.question}>
          <div style={styles.qLabel}>Stress level?</div>
          <div style={styles.emojiRow}>
            {STRESS_EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setStress(i + 1)}
                style={{
                  ...styles.emojiBtn,
                  ...(stress === i + 1 ? styles.emojiBtnActive : {}),
                  borderColor: stress === i + 1 ? colors.primary : 'rgba(255,255,255,0.08)',
                }}
              >
                <span style={styles.emoji}>{emoji}</span>
                <span style={styles.emojiLabel}>{STRESS_LABELS[i]}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allSelected}
          style={{
            ...styles.submitBtn,
            opacity: allSelected ? 1 : 0.4,
            cursor: allSelected ? 'pointer' : 'not-allowed',
          }}
        >
          CHECK READINESS
        </button>

        <button onClick={onSkip} style={styles.skipBtn}>SKIP</button>
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: colors.overlayDense,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16, zIndex: 150,
  },
  card: {
    background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
    borderRadius: radii.pill, padding: spacing.xxl,
    width: '100%', maxWidth: 380,
    border: `1px solid ${colors.surfaceBorder}`,
  },
  title: {
    fontSize: typography.sizes['3xl'], fontWeight: typography.weights.black,
    letterSpacing: '0.1em', textAlign: 'center' as const, marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sizes.md, color: colors.textSecondary,
    textAlign: 'center' as const, marginBottom: spacing.xxl,
  },
  question: { marginBottom: spacing.xl },
  qLabel: {
    fontSize: typography.sizes.lg, fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  emojiRow: {
    display: 'flex', gap: 6, justifyContent: 'space-between',
  },
  emojiBtn: {
    flex: 1, display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', gap: 4,
    padding: `${spacing.md}px ${spacing.xs}px`,
    borderRadius: radii.lg,
    border: '1px solid rgba(255,255,255,0.08)',
    background: colors.surface, cursor: 'pointer',
    transition: 'all 0.15s',
    color: colors.text,
  },
  emojiBtnActive: {
    background: colors.primarySurface,
    transform: 'scale(1.08)',
  },
  emoji: { fontSize: '1.4rem' },
  emojiLabel: { fontSize: '0.5rem', color: colors.textTertiary },
  submitBtn: {
    width: '100%', padding: 14, borderRadius: radii.xl,
    border: 'none', background: colors.primaryGradient,
    color: '#fff', fontWeight: typography.weights.black,
    fontSize: typography.sizes.lg, marginTop: spacing.lg,
    boxShadow: `0 4px 15px ${colors.primaryGlow}`,
  },
  skipBtn: {
    width: '100%', padding: spacing.md,
    background: 'transparent', border: 'none',
    color: colors.textTertiary, fontSize: typography.sizes.md,
    cursor: 'pointer', marginTop: spacing.sm,
    fontWeight: typography.weights.medium,
  },
  resultLabel: {
    fontSize: typography.sizes['4xl'], fontWeight: typography.weights.black,
    textAlign: 'center' as const, letterSpacing: '0.1em',
  },
  resultScore: {
    fontSize: typography.sizes.lg, color: colors.textSecondary,
    textAlign: 'center' as const, marginTop: 8,
  },
  resultRec: {
    fontSize: typography.sizes.md, color: colors.textSecondary,
    textAlign: 'center' as const, marginTop: 12, lineHeight: 1.4,
  },
};
