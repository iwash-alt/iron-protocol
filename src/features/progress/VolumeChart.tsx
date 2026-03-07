import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { VolumePoint } from '@/shared/types';
import { CHART_COLORS, AXIS_TICK_STYLE, TOOLTIP_CONTENT_STYLE } from '@/shared/theme/recharts';
import { colors, spacing, typography } from '@/shared/theme/tokens';

interface VolumeChartProps {
  data: VolumePoint[];
  height?: number;
}

/** Format a "YYYY-MM-DD" date string as a short label, e.g. "Jan 5". */
function formatDateLabel(dateStr: string): string {
  const SHORT_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const parts = dateStr.split('-');
  const month = parseInt(parts[1] ?? '1', 10) - 1;
  const day = parseInt(parts[2] ?? '1', 10);
  return `${SHORT_MONTHS[month] ?? ''} ${day}`;
}

/** Weekly volume trend chart using AreaChart. */
export function VolumeChart({ data, height = 200 }: VolumeChartProps) {
  const chartData = data.map(d => ({
    ...d,
    label: formatDateLabel(d.date),
  }));

  if (data.length === 0) {
    return (
      <div style={styles.wrapper}>
        <h3 style={styles.title}>Volume Trend</h3>
        <p style={styles.noData}>No volume data available</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>Volume Trend</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)}
          />
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            formatter={(value) => [
              typeof value === 'number' ? `${value} kg` : String(value),
              'Volume',
            ]}
            labelStyle={{ color: colors.textSecondary, fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill="url(#volumeTrendGrad)"
            dot={{ r: 3, fill: CHART_COLORS.primary, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: CHART_COLORS.primary, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
    color: colors.text,
    margin: `0 0 ${spacing.sm}px`,
  },
  noData: {
    color: colors.textTertiary,
    fontSize: typography.sizes.sm,
    textAlign: 'center' as const,
    padding: `${spacing.lg}px 0`,
    margin: 0,
  },
};
