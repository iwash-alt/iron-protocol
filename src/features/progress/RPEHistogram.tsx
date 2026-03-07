import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { RPEDistribution } from '@/shared/types';
import { CHART_COLORS, AXIS_TICK_STYLE, TOOLTIP_CONTENT_STYLE } from '@/shared/theme/recharts';
import { colors, spacing, typography } from '@/shared/theme/tokens';

interface RPEHistogramProps {
  data: RPEDistribution[];
}

/** Color scale from green (easy) to red (max effort) across RPE 1–10. */
const RPE_COLORS: Record<number, string> = {
  1: '#22c55e',
  2: '#4ade80',
  3: '#86efac',
  4: '#fbbf24',
  5: '#f59e0b',
  6: '#f97316',
  7: '#ef4444',
  8: '#dc2626',
  9: '#b91c1c',
  10: '#7f1d1d',
};

/** RPE distribution histogram using BarChart. X-axis is RPE 1–10. */
export function RPEHistogram({ data }: RPEHistogramProps) {
  // Ensure all RPE values 1-10 are represented so the x-axis is complete
  const chartData = Array.from({ length: 10 }, (_, i) => {
    const rpe = i + 1;
    const found = data.find(d => d.rpe === rpe);
    return { rpe, count: found?.count ?? 0 };
  });

  const hasData = data.length > 0 && data.some(d => d.count > 0);

  if (!hasData) {
    return (
      <div style={styles.wrapper}>
        <h3 style={styles.title}>RPE Distribution</h3>
        <p style={styles.noData}>No RPE data available</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>RPE Distribution</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
          barCategoryGap="20%"
        >
          <XAxis
            dataKey="rpe"
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            formatter={(value: unknown) => [typeof value === 'number' ? value : 0, 'Sets']}
            labelFormatter={(label: unknown) => `RPE ${typeof label === 'number' ? label : String(label)}`}
            labelStyle={{ color: colors.textSecondary, fontSize: 10 }}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {chartData.map(entry => (
              <Cell
                key={`rpe-${entry.rpe}`}
                fill={RPE_COLORS[entry.rpe] ?? CHART_COLORS.primary}
                opacity={entry.count > 0 ? 1 : 0.2}
              />
            ))}
          </Bar>
        </BarChart>
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
