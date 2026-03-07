import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PeriodDataPoint } from '@/analytics/periodStats';
import { formatVolume } from '@/shared/utils';
import { CHART_COLORS, AXIS_TICK_STYLE, TOOLTIP_CONTENT_STYLE } from '@/shared/theme/recharts';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { S } from '@/shared/theme/styles';

interface VolumeChartProps {
  dataPoints: PeriodDataPoint[];
  volumeChangePct: number;
}

export function VolumeChart({ dataPoints, volumeChangePct }: VolumeChartProps) {
  const hasData = dataPoints.some(d => d.volumeKg > 0);

  if (!hasData) {
    return (
      <div style={S.chartBox}>
        <h3 style={S.chartTitle}>Training Volume</h3>
        <p style={styles.noData}>No volume data for this period</p>
      </div>
    );
  }

  const isPositive = volumeChangePct >= 0;

  return (
    <div>
      <div style={styles.header}>
        <h3 style={{ ...S.chartTitle, margin: 0 }}>Training Volume</h3>
        {volumeChangePct !== 0 && (
          <span style={{
            ...styles.delta,
            color: isPositive ? colors.success : colors.primary,
            background: isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(255,59,48,0.1)',
            border: `1px solid ${isPositive ? 'rgba(34,197,94,0.3)' : 'rgba(255,59,48,0.3)'}`,
          }}>
            {isPositive ? '\u2191' : '\u2193'} {Math.abs(volumeChangePct)}%
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={dataPoints} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatVolume(v, { abbreviated: true })}
          />
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            formatter={(value) => [formatVolume(typeof value === 'number' ? value : 0), 'Volume']}
            labelStyle={{ color: colors.textSecondary, fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey="volumeKg"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill="url(#volumeGrad)"
            dot={{ r: 3, fill: CHART_COLORS.primary, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: CHART_COLORS.primary, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  delta: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    padding: '3px 10px',
    borderRadius: radii.pill,
  },
  noData: {
    color: colors.textTertiary,
    fontSize: typography.sizes.sm,
    textAlign: 'center' as const,
    padding: `${spacing.lg}px 0`,
    margin: 0,
  },
};
