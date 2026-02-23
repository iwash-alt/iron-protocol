import React from 'react';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';

export interface EmptyStateCTAButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'ghost';
}

interface EmptyStateProps {
  illustration: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: EmptyStateCTAButton[];
  style?: React.CSSProperties;
}

export function EmptyState({ illustration, title, subtitle, actions, style }: EmptyStateProps) {
  return (
    <div style={{ ...emptyStyles.wrap, ...style }}>
      <div style={emptyStyles.illustration}>{illustration}</div>
      <p style={emptyStyles.title}>{title}</p>
      {subtitle && <p style={emptyStyles.subtitle}>{subtitle}</p>}
      {actions && actions.length > 0 && (
        <div style={emptyStyles.actions}>
          {actions.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              style={btn.variant === 'ghost' ? emptyStyles.ghostBtn : emptyStyles.primaryBtn}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const emptyStyles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: `${spacing.xxxl}px ${spacing.xl}px`,
    gap: spacing.md,
  },
  illustration: {
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    opacity: 0.7,
  },
  title: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    margin: 0,
    lineHeight: 1.3,
    maxWidth: 260,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    margin: 0,
    lineHeight: 1.45,
    maxWidth: 260,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    width: '100%',
    maxWidth: 280,
    marginTop: spacing.sm,
  },
  primaryBtn: {
    padding: `${spacing.md}px ${spacing.xxl}px`,
    borderRadius: radii.xl,
    border: 'none',
    background: colors.primaryGradient,
    color: colors.text,
    cursor: 'pointer',
    fontWeight: typography.weights.black,
    fontSize: typography.sizes.lg,
    boxShadow: `0 4px 15px ${colors.primaryGlow}`,
  },
  ghostBtn: {
    padding: `${spacing.md}px ${spacing.xxl}px`,
    borderRadius: radii.xl,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'transparent',
    color: colors.textSecondary,
    cursor: 'pointer',
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
  },
};
