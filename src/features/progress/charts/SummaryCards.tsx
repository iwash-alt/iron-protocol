import React from 'react';
import { formatVolume } from '@/shared/utils';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';

interface SummaryCardsProps {
  totalVolume: number;
  volumeChangePct: number;
  streak: number;
  topMuscle: string | null;
  topMusclePct: number;
  avgRPE: number;
  newPRs: number;
}

export function SummaryCards({
  totalVolume,
  volumeChangePct,
  streak,
  topMuscle,
  topMusclePct,
  avgRPE,
  newPRs,
}: SummaryCardsProps) {
  return (
    <div style={styles.grid}>
      <SummaryCard
        label="VOLUME"
        value={formatVolume(totalVolume, { abbreviated: true })}
        delta={volumeChangePct}
        color={colors.primary}
      />
      <SummaryCard
        label="STREAK"
        value={`${streak}d \u{1F525}`}
        color={colors.warning}
      />
      <SummaryCard
        label="TOP MUSCLE"
        value={topMuscle ? `${topMuscle}` : '\u2014'}
        subtitle={topMuscle ? `${topMusclePct}%` : undefined}
        color={colors.info}
      />
      <SummaryCard
        label={avgRPE > 0 ? 'AVG RPE' : 'NEW PRs'}
        value={avgRPE > 0 ? avgRPE.toFixed(1) : String(newPRs)}
        color={avgRPE > 8 ? colors.warning : colors.success}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  delta,
  subtitle,
  color,
}: {
  label: string;
  value: string;
  delta?: number;
  subtitle?: string;
  color: string;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div style={{ ...styles.value, color }}>{value}</div>
      {delta !== undefined && delta !== 0 && (
        <div style={{
          ...styles.delta,
          color: delta >= 0 ? colors.success : colors.primary,
        }}>
          {delta > 0 ? '\u2191' : '\u2193'}{Math.abs(delta)}%
        </div>
      )}
      {subtitle && (
        <div style={styles.subtitle}>{subtitle}</div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: radii.lg,
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
    textAlign: 'center' as const,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.textTertiary,
    letterSpacing: '0.08em',
    marginBottom: 4,
  },
  value: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.black,
    lineHeight: 1.2,
  },
  delta: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
};
