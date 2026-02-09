/**
 * FatigueCard — displays the current fatigue score on the Dashboard.
 *
 * Shows a colored arc/score, contributing factors, and recommendation.
 * Pro-only feature.
 */

import React from 'react';
import type { FatigueResult } from '@/training/fatigue';
import { colors, radii, typography, spacing } from '@/shared/theme/tokens';

interface FatigueCardProps {
  fatigue: FatigueResult;
}

export function FatigueCard({ fatigue }: FatigueCardProps) {
  const { score, trend, factors, recommendation, suggestedAction } = fatigue;

  const scoreColor = score <= 30 ? colors.success
    : score <= 50 ? '#FFD60A'
    : score <= 70 ? colors.warning
    : colors.primary;

  const trendIcon = trend === 'rising' ? '↑' : trend === 'falling' ? '↓' : '→';
  const trendColor = trend === 'rising' ? colors.primary : trend === 'falling' ? colors.success : colors.textSecondary;

  const actionBadge = suggestedAction === 'rest' ? '🛌 Rest Day'
    : suggestedAction === 'deload' ? '😴 Deload'
    : suggestedAction === 'lighter' ? '⚖️ Lighter'
    : '💪 Normal';

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Fatigue Index</h3>
        <span style={{ ...styles.badge, background: `${scoreColor}22`, color: scoreColor, borderColor: `${scoreColor}44` }}>
          {actionBadge}
        </span>
      </div>

      {/* Score display */}
      <div style={styles.scoreRow}>
        <div style={styles.scoreCircle}>
          <svg viewBox="0 0 100 100" width="80" height="80">
            {/* Background arc */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            {/* Score arc */}
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={scoreColor} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${score * 2.64} 264`}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div style={styles.scoreText}>
            <span style={{ ...styles.scoreNum, color: scoreColor }}>{score}</span>
            <span style={styles.scoreMax}>/100</span>
          </div>
        </div>
        <div style={styles.scoreInfo}>
          <div style={styles.trendRow}>
            <span style={{ color: trendColor, fontWeight: 700 }}>{trendIcon}</span>
            <span style={{ color: trendColor, fontSize: typography.sizes.md }}>
              {trend === 'rising' ? 'Rising' : trend === 'falling' ? 'Falling' : 'Stable'}
            </span>
          </div>
          <div style={styles.rec}>{recommendation}</div>
        </div>
      </div>

      {/* Factor breakdown */}
      {factors.length > 0 && (
        <div style={styles.factors}>
          {factors.map((f, i) => (
            <div key={i} style={styles.factor}>
              <div style={styles.factorHeader}>
                <span style={styles.factorName}>{f.name}</span>
                <span style={styles.factorScore}>+{f.contribution}</span>
              </div>
              <div style={styles.factorBar}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  background: f.contribution > 10 ? colors.primary : f.contribution > 5 ? colors.warning : colors.success,
                  width: `${Math.min(100, f.contribution * 3)}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={styles.factorDetail}>{f.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: spacing.lg, borderRadius: 18,
    background: colors.surface, border: `1px solid ${colors.surfaceBorder}`,
    marginBottom: spacing.md,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl, fontWeight: typography.weights.black,
    margin: 0,
  },
  badge: {
    fontSize: typography.sizes.sm, fontWeight: typography.weights.bold,
    padding: `${spacing.xs}px ${spacing.md}px`,
    borderRadius: radii.pill, border: '1px solid',
  },
  scoreRow: {
    display: 'flex', alignItems: 'center', gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  scoreCircle: { position: 'relative' as const, flexShrink: 0 },
  scoreText: {
    position: 'absolute' as const, inset: 0,
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: {
    fontSize: typography.sizes['5xl'], fontWeight: typography.weights.black,
    lineHeight: 1,
  },
  scoreMax: {
    fontSize: typography.sizes.xs, color: colors.textTertiary,
  },
  scoreInfo: { flex: 1 },
  trendRow: {
    display: 'flex', alignItems: 'center', gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  rec: {
    fontSize: typography.sizes.md, color: colors.textSecondary,
    lineHeight: 1.4,
  },
  factors: {
    borderTop: `1px solid ${colors.surfaceBorder}`,
    paddingTop: spacing.md,
    display: 'flex', flexDirection: 'column' as const, gap: spacing.md,
  },
  factor: {},
  factorHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  factorName: {
    fontSize: typography.sizes.sm, fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  factorScore: {
    fontSize: typography.sizes.sm, fontWeight: typography.weights.bold,
    color: colors.textTertiary,
  },
  factorBar: {
    height: 4, background: 'rgba(255,255,255,0.06)',
    borderRadius: 2, marginBottom: 4, overflow: 'hidden',
  },
  factorDetail: {
    fontSize: typography.sizes.xs, color: colors.textMuted,
  },
};
