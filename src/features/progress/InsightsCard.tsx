/**
 * InsightsCard — expandable weekly insights display on the Dashboard.
 *
 * Shows this week's training summary with volume, RPE trend,
 * muscle balance, consistency, and actionable recommendation.
 */

import React, { useState } from 'react';
import type { WeeklyInsight } from '@/analytics/insights';
import { MiniChart } from '@/shared/components';
import { colors, radii, typography, spacing } from '@/shared/theme/tokens';

interface InsightsCardProps {
  insight: WeeklyInsight;
}

export function InsightsCard({ insight }: InsightsCardProps) {
  const [expanded, setExpanded] = useState(false);

  const volColor = insight.volumeChangePct >= 0 ? colors.success : colors.primary;
  const rpeColor = insight.rpeTrend === 'harder' ? colors.warning
    : insight.rpeTrend === 'easier' ? colors.success
    : colors.textSecondary;

  return (
    <div style={styles.card}>
      <button onClick={() => setExpanded(!expanded)} style={styles.headerBtn}>
        <div>
          <h3 style={styles.title}>Weekly Insights</h3>
          <div style={styles.subtitle}>Week of {insight.weekOf}</div>
        </div>
        <span style={{ ...styles.chevron, transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
          ▾
        </span>
      </button>

      {/* Recommendation always visible */}
      <div style={styles.rec}>{insight.recommendation}</div>

      {/* Summary row always visible */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryItem}>
          <div style={styles.summaryLabel}>VOLUME</div>
          <div style={{ ...styles.summaryVal, color: volColor }}>
            {insight.volumeChangePct >= 0 ? '+' : ''}{insight.volumeChangePct}%
          </div>
        </div>
        <div style={styles.summaryItem}>
          <div style={styles.summaryLabel}>RPE</div>
          <div style={{ ...styles.summaryVal, color: rpeColor }}>
            {insight.avgRPE} {insight.rpeTrend === 'harder' ? '↑' : insight.rpeTrend === 'easier' ? '↓' : '→'}
          </div>
        </div>
        <div style={styles.summaryItem}>
          <div style={styles.summaryLabel}>SESSIONS</div>
          <div style={styles.summaryVal}>
            {insight.sessionsCompleted}/{insight.sessionsPlanned}
          </div>
        </div>
        <div style={styles.summaryItem}>
          <div style={styles.summaryLabel}>FATIGUE</div>
          <div style={{
            ...styles.summaryVal,
            color: insight.currentFatigue.score > 60 ? colors.primary : insight.currentFatigue.score > 30 ? colors.warning : colors.success,
          }}>
            {insight.currentFatigue.score}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={styles.details}>
          {/* Volume comparison */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Volume</div>
            <div style={styles.volCompare}>
              <span>This week: <strong>{(insight.volumeThisWeek / 1000).toFixed(1)}t</strong></span>
              <span style={{ color: colors.textTertiary }}>
                Avg: {(insight.volumeAverage / 1000).toFixed(1)}t
              </span>
            </div>
          </div>

          {/* Fatigue trend */}
          {insight.fatigueDataPoints.length > 1 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Fatigue Trend</div>
              <MiniChart
                data={insight.fatigueDataPoints}
                color={insight.currentFatigue.score > 60 ? colors.primary : colors.warning}
                height={50}
              />
            </div>
          )}

          {/* Muscle balance */}
          {insight.muscleBalance.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Muscle Balance</div>
              <div style={styles.muscleGrid}>
                {insight.muscleBalance.map(m => (
                  <div key={m.muscle} style={styles.muscleItem}>
                    <span style={{
                      ...styles.muscleDot,
                      background: m.status === 'undertrained' ? colors.primary
                        : m.status === 'overtrained' ? colors.warning
                        : colors.success,
                    }} />
                    <span style={styles.muscleName}>{m.muscle}</span>
                    <span style={styles.muscleSets}>{m.sets}s</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top PR */}
          {insight.topPR && (
            <div style={styles.prRow}>
              <span>🏆</span>
              <span>PR: <strong>{insight.topPR.exercise}</strong> — {insight.topPR.weight}kg e1RM</span>
            </div>
          )}
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
  headerBtn: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', background: 'none', border: 'none',
    color: colors.text, cursor: 'pointer', padding: 0,
    textAlign: 'left' as const,
  },
  title: {
    fontSize: typography.sizes.xl, fontWeight: typography.weights.black,
    margin: 0,
  },
  subtitle: {
    fontSize: typography.sizes.sm, color: colors.textTertiary, marginTop: 2,
  },
  chevron: {
    fontSize: typography.sizes['3xl'], color: colors.textTertiary,
    transition: 'transform 0.2s',
  },
  rec: {
    fontSize: typography.sizes.md, color: colors.textSecondary,
    marginTop: spacing.md, lineHeight: 1.4,
    padding: `${spacing.sm}px ${spacing.md}px`,
    background: colors.primarySurface, borderRadius: radii.md,
    border: `1px solid ${colors.primaryBorder}`,
  },
  summaryRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: spacing.sm, marginTop: spacing.md,
  },
  summaryItem: {
    textAlign: 'center' as const, padding: `${spacing.sm}px 0`,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs, color: colors.textTertiary,
    fontWeight: typography.weights.black, letterSpacing: '0.03em',
    marginBottom: 4,
  },
  summaryVal: {
    fontSize: typography.sizes.xl, fontWeight: typography.weights.black,
    color: colors.text,
  },
  details: {
    borderTop: `1px solid ${colors.surfaceBorder}`,
    marginTop: spacing.md, paddingTop: spacing.md,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: typography.sizes.sm, fontWeight: typography.weights.black,
    color: colors.textTertiary, letterSpacing: '0.05em',
    marginBottom: spacing.sm,
  },
  volCompare: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: typography.sizes.md, color: colors.text,
  },
  muscleGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    gap: `${spacing.xs}px ${spacing.md}px`,
  },
  muscleItem: {
    display: 'flex', alignItems: 'center', gap: spacing.xs,
    fontSize: typography.sizes.sm,
  },
  muscleDot: {
    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
  },
  muscleName: { flex: 1, color: colors.textSecondary },
  muscleSets: { color: colors.textTertiary, fontWeight: typography.weights.bold },
  prRow: {
    display: 'flex', alignItems: 'center', gap: spacing.sm,
    fontSize: typography.sizes.md, color: colors.text,
    padding: `${spacing.sm}px ${spacing.md}px`,
    background: 'rgba(255,215,0,0.08)',
    borderRadius: radii.md,
    border: '1px solid rgba(255,215,0,0.2)',
  },
};
