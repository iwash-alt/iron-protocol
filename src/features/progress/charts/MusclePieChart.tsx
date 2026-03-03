import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { MuscleGroupShare } from '@/analytics/periodStats';
import { TOOLTIP_CONTENT_STYLE } from '@/shared/theme/recharts';
import { colors, spacing, typography, radii } from '@/shared/theme/tokens';
import { S } from '@/shared/theme/styles';

interface MusclePieChartProps {
  distribution: MuscleGroupShare[];
}

export function MusclePieChart({ distribution }: MusclePieChartProps) {
  if (distribution.length === 0) {
    return null;
  }

  const totalSets = distribution.reduce((s, d) => s + d.sets, 0);
  const dominant = distribution[0];

  return (
    <div style={S.chartBox}>
      <h3 style={S.chartTitle}>Muscle Distribution</h3>
      <div style={styles.chartRow}>
        <div style={styles.pieWrapper}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                dataKey="sets"
                nameKey="muscle"
                strokeWidth={1}
                stroke="rgba(0,0,0,0.3)"
              >
                {distribution.map((entry, i) => (
                  <Cell
                    key={entry.muscle}
                    fill={entry.color}
                    opacity={i === 0 ? 1 : 0.8}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_CONTENT_STYLE}
                formatter={(value: number | undefined, name: string | undefined) => [
                  `${value ?? 0} sets (${Math.round(((value ?? 0) / totalSets) * 100)}%)`,
                  name ?? '',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div style={styles.centerLabel}>
            <div style={styles.centerValue}>{totalSets}</div>
            <div style={styles.centerText}>sets</div>
          </div>
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          {distribution.map(d => (
            <div key={d.muscle} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: d.color }} />
              <span style={styles.legendName}>{d.muscle}</span>
              <span style={styles.legendPct}>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {dominant && (
        <div style={styles.dominantBadge}>
          Top: {dominant.muscle} ({dominant.pct}%)
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  chartRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  pieWrapper: {
    position: 'relative',
    flex: '0 0 180px',
    height: 180,
  },
  centerLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as const,
    pointerEvents: 'none' as const,
  },
  centerValue: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.black,
    color: colors.text,
    lineHeight: 1,
  },
  centerText: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    letterSpacing: '0.04em',
  },
  legend: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    minWidth: 0,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendName: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.bold,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  legendPct: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.black,
    color: colors.textSecondary,
    minWidth: 28,
    textAlign: 'right' as const,
  },
  dominantBadge: {
    marginTop: spacing.sm,
    textAlign: 'center' as const,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    padding: `${spacing.xs}px ${spacing.md}px`,
    background: 'rgba(255,59,48,0.08)',
    borderRadius: radii.pill,
    display: 'inline-block',
    width: '100%',
  },
};
