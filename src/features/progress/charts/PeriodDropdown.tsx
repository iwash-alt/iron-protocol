import React from 'react';
import type { DashboardPeriod } from '@/analytics/periodStats';
import { colors, radii, typography, spacing } from '@/shared/theme/tokens';

interface PeriodDropdownProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}

const OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'quarter', label: 'Quarterly' },
  { value: 'year', label: 'Yearly' },
];

export function PeriodDropdown({ value, onChange }: PeriodDropdownProps) {
  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>TIME PERIOD</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as DashboardPeriod)}
        style={styles.select}
      >
        {OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    padding: `${spacing.sm}px 0`,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.textTertiary,
    letterSpacing: '0.08em',
  },
  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
    borderRadius: radii.md,
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    padding: `${spacing.sm}px ${spacing.xl}px ${spacing.sm}px ${spacing.md}px`,
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${spacing.sm}px center`,
  },
};
