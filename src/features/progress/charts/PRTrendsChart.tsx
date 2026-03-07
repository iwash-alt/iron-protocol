import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { PRTrendsResult } from '@/analytics/periodStats';
import { CHART_COLORS, AXIS_TICK_STYLE, TOOLTIP_CONTENT_STYLE } from '@/shared/theme/recharts';
import { PR_LINE_COLORS } from '@/shared/theme/recharts';
import { colors, spacing, typography } from '@/shared/theme/tokens';
import { S } from '@/shared/theme/styles';

interface PRTrendsChartProps {
  trends: PRTrendsResult;
}

export function PRTrendsChart({ trends }: PRTrendsChartProps) {
  if (trends.exercises.length === 0 || trends.dataPoints.length === 0) {
    return (
      <div>
        <h3 style={{ ...S.chartTitle, margin: 0, marginBottom: spacing.sm }}>PR Trends (Est. 1RM)</h3>
        <p style={styles.noData}>No PR data for this period</p>
      </div>
    );
  }

  // Truncate exercise names for legend
  const shortName = (name: string) => name.length > 16 ? name.slice(0, 14) + '\u2026' : name;

  return (
    <div>
      <h3 style={{ ...S.chartTitle, margin: 0, marginBottom: spacing.sm }}>PR Trends (Est. 1RM)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={trends.dataPoints} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
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
            tickFormatter={(v: number) => `${Math.round(v)}kg`}
          />
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            formatter={(value: unknown, name: unknown) => {
              const v = typeof value === 'number' ? value : 0;
              const n = typeof name === 'string' ? name : '';
              return [v > 0 ? `${Math.round(v)}kg` : '\u2014', shortName(n)];
            }}
            labelStyle={{ color: colors.textSecondary, fontSize: 10 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 10, color: colors.textTertiary }}
            formatter={(value: string) => shortName(value)}
          />
          {trends.exercises.map((ex, i) => (
            <Bar
              key={ex}
              dataKey={ex}
              fill={PR_LINE_COLORS[i % PR_LINE_COLORS.length]}
              radius={[3, 3, 0, 0]}
              maxBarSize={24}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  noData: {
    color: colors.textTertiary,
    fontSize: typography.sizes.sm,
    textAlign: 'center' as const,
    padding: `${spacing.lg}px 0`,
    margin: 0,
  },
};
