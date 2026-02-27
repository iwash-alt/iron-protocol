import React from 'react';
import type { MuscleGroupShare } from '@/analytics/periodStats';
import type { DashboardPeriod } from '@/analytics/periodStats';
import { S } from '@/shared/theme/styles';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';

interface MuscleDistributionCardProps {
  distribution: MuscleGroupShare[];
  period: DashboardPeriod;
}

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  week: 'This Week',
  month: 'This Month',
  quarter: 'Last 3 Months',
  year: 'Last 12 Months',
};

export function MuscleDistributionCard({ distribution, period }: MuscleDistributionCardProps) {
  if (distribution.length === 0) {
    return null;
  }

  const maxPct = Math.max(...distribution.map(d => d.pct), 1);

  return (
    <div style={S.chartBox}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <h3 style={S.chartTitle}>💪 Muscle Focus</h3>
        <span style={mdStyles.periodBadge}>{PERIOD_LABELS[period]}</span>
      </div>

      {/* Stacked bar overview */}
      <div style={mdStyles.stackedBar}>
        {distribution.map(d => (
          <div
            key={d.muscle}
            title={`${d.muscle}: ${d.pct}%`}
            style={{
              ...mdStyles.stackedSegment,
              width: `${d.pct}%`,
              background: d.color,
            }}
          />
        ))}
      </div>

      {/* Per-muscle rows */}
      <div style={mdStyles.rows}>
        {distribution.map(d => (
          <div key={d.muscle} style={mdStyles.row}>
            <div style={mdStyles.rowLeft}>
              <span style={{ ...mdStyles.colorDot, background: d.color }} />
              <span style={mdStyles.muscleName}>{d.muscle}</span>
            </div>
            <div style={mdStyles.barWrap}>
              <div
                style={{
                  ...mdStyles.bar,
                  width: `${(d.pct / maxPct) * 100}%`,
                  background: d.color,
                }}
              />
            </div>
            <div style={mdStyles.rowRight}>
              <span style={mdStyles.pct}>{d.pct}%</span>
              <span style={mdStyles.sets}>{d.sets}s</span>
            </div>
          </div>
        ))}
      </div>

      <div style={mdStyles.footer}>
        {distribution.reduce((s, d) => s + d.sets, 0)} total sets
      </div>
    </div>
  );
}

const mdStyles: Record<string, React.CSSProperties> = {
  periodBadge: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontWeight: typography.weights.bold,
    letterSpacing: '0.04em',
  },
  stackedBar: {
    display: 'flex',
    height: 10,
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginBottom: spacing.md,
    gap: 1,
    background: colors.surface,
  },
  stackedSegment: {
    height: '100%',
    minWidth: 2,
    transition: 'width 0.4s ease',
  },
  rows: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr 68px',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  muscleName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  barWrap: {
    height: 6,
    borderRadius: radii.pill,
    background: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: radii.pill,
    transition: 'width 0.5s ease',
    opacity: 0.85,
  },
  rowRight: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  pct: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.black,
    color: colors.text,
    minWidth: 32,
    textAlign: 'right' as const,
  },
  sets: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    minWidth: 24,
    textAlign: 'right' as const,
  },
  footer: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    textAlign: 'center' as const,
    letterSpacing: '0.04em',
  },
};
