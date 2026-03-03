/**
 * Recharts theme constants — dark mode styling for all dashboard charts.
 * Derives from existing design tokens.
 */
import { colors, typography } from './tokens';

export const CHART_COLORS = {
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
  info: colors.info,
  grid: 'rgba(255,255,255,0.05)',
  axis: colors.textTertiary,
  tooltipBg: '#1a1a1a',
  tooltipBorder: 'rgba(255,255,255,0.1)',
} as const;

export const AXIS_TICK_STYLE = {
  fontSize: 10,
  fill: colors.textTertiary,
  fontFamily: typography.fontFamily,
} as const;

export const TOOLTIP_CONTENT_STYLE: React.CSSProperties = {
  background: CHART_COLORS.tooltipBg,
  border: `1px solid ${CHART_COLORS.tooltipBorder}`,
  borderRadius: 8,
  fontSize: 11,
  color: colors.text,
  padding: '6px 10px',
};

export const PR_LINE_COLORS = [
  '#FF3B30', '#3B82F6', '#34C759', '#FF9500', '#a855f7', '#06b6d4',
] as const;
