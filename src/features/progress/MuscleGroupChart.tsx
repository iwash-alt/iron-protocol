import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MuscleGroupVolume } from '@/shared/types';
import { TOOLTIP_CONTENT_STYLE } from '@/shared/theme/recharts';
import { colors, spacing, typography } from '@/shared/theme/tokens';

interface MuscleGroupChartProps {
  data: MuscleGroupVolume[];
}

/** Distinct palette for up to 8 muscle groups. */
const PIE_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#06b6d4',
  '#f97316',
  '#6b7280',
] as const;

/** Muscle group volume breakdown displayed as a Pie chart. */
export function MuscleGroupChart({ data }: MuscleGroupChartProps) {
  if (data.length === 0) {
    return (
      <div style={styles.wrapper}>
        <h3 style={styles.title}>Muscle Group Split</h3>
        <p style={styles.noData}>No muscle group data available</p>
      </div>
    );
  }

  const totalSets = data.reduce((sum, d) => sum + d.sets, 0);

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>Muscle Group Split</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={80}
            dataKey="sets"
            nameKey="group"
            strokeWidth={1}
            stroke="rgba(0,0,0,0.3)"
          >
            {data.map((entry, i) => (
              <Cell
                key={`cell-${entry.group}`}
                fill={PIE_COLORS[i % PIE_COLORS.length] ?? '#6b7280'}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            formatter={(value: unknown, name: unknown) => {
              const v = typeof value === 'number' ? value : 0;
              const n = typeof name === 'string' ? name : String(name);
              return [`${v} sets (${totalSets > 0 ? Math.round((v / totalSets) * 100) : 0}%)`, n];
            }}
            labelStyle={{ color: colors.textSecondary, fontSize: 10 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span style={styles.legendLabel}>{value}</span>
            )}
          />
        </PieChart>
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
  legendLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
};
