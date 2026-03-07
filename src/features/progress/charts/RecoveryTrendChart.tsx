import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { RPETrendPoint } from '@/analytics/periodStats';
import { CHART_COLORS, AXIS_TICK_STYLE, TOOLTIP_CONTENT_STYLE } from '@/shared/theme/recharts';
import { colors, spacing, typography } from '@/shared/theme/tokens';
import { S } from '@/shared/theme/styles';

interface RecoveryTrendChartProps {
  data: RPETrendPoint[];
}

export function RecoveryTrendChart({ data }: RecoveryTrendChartProps) {
  const hasData = data.some(d => d.avgRPE > 0);

  if (!hasData) {
    return (
      <div>
        <h3 style={{ ...S.chartTitle, margin: 0, marginBottom: spacing.sm }}>Recovery Trend (RPE)</h3>
        <p style={styles.noData}>No RPE data for this period</p>
      </div>
    );
  }

  const maxRPE = Math.max(...data.map(d => d.avgRPE));
  const lineColor = maxRPE > 8 ? colors.warning : CHART_COLORS.info;

  return (
    <div>
      <div style={styles.header}>
        <h3 style={{ ...S.chartTitle, margin: 0 }}>Recovery Trend (RPE)</h3>
        {maxRPE > 8 && (
          <span style={styles.warningBadge}>High RPE</span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[5, 10]}
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            formatter={(value: unknown) => {
              const v = typeof value === 'number' ? value : 0;
              return [v > 0 ? v.toFixed(1) : '\u2014', 'Avg RPE'];
            }}
            labelStyle={{ color: colors.textSecondary, fontSize: 10 }}
          />
          <ReferenceLine
            y={8}
            stroke="rgba(255,149,0,0.4)"
            strokeDasharray="6 3"
            label={{
              value: 'RPE 8',
              position: 'right',
              fill: 'rgba(255,149,0,0.6)',
              fontSize: 9,
            }}
          />
          <Line
            type="monotone"
            dataKey="avgRPE"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: lineColor, strokeWidth: 2, stroke: '#fff' }}
            connectNulls={false}
          />
        </LineChart>
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
  warningBadge: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.warning,
    padding: '2px 8px',
    borderRadius: 10,
    background: colors.warningSurface,
    border: `1px solid ${colors.warningBorder}`,
  },
  noData: {
    color: colors.textTertiary,
    fontSize: typography.sizes.sm,
    textAlign: 'center' as const,
    padding: `${spacing.lg}px 0`,
    margin: 0,
  },
};
