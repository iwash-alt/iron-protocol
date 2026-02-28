import React, { useId } from 'react';
import { spacing, radii, typography, colors } from '@/shared/theme/tokens';

export interface FilterCardOption {
  value: string;
  label: string;
  icon: string;
}

interface FilterCardsProps {
  options: readonly FilterCardOption[];
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
  allIcon?: string;
}

const scrollContainer: React.CSSProperties = {
  display: 'flex',
  gap: spacing.sm,
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  padding: '4px 0',
  marginBottom: spacing.sm,
};

const cardBase: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: radii.lg,
  fontSize: typography.sizes.sm,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  minHeight: 38,
  outline: 'none',
  fontFamily: 'inherit',
  lineHeight: 1.4,
};

const inactiveCard: React.CSSProperties = {
  ...cardBase,
  border: `1px solid ${colors.surfaceBorder}`,
  background: colors.surface,
  color: colors.textSecondary,
};

const activeCard: React.CSSProperties = {
  ...cardBase,
  background: colors.primary,
  color: '#fff',
  border: `1px solid ${colors.primary}`,
};

const iconSpan: React.CSSProperties = {
  fontSize: '1rem',
};

export function FilterCards({
  options,
  value,
  onChange,
  allLabel = 'All',
  allIcon = '🔄',
}: FilterCardsProps) {
  const id = useId();

  return (
    <>
      <style>{`[data-filter-cards-id="${id}"]::-webkit-scrollbar { display: none; }`}</style>
      <div style={scrollContainer} data-filter-cards-id={id}>
        <button
          type="button"
          style={value === 'All' ? activeCard : inactiveCard}
          onClick={() => onChange('All')}
        >
          <span style={iconSpan}>{allIcon}</span>
          {allLabel}
        </button>
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            style={value === opt.value ? activeCard : inactiveCard}
            onClick={() => onChange(opt.value)}
          >
            <span style={iconSpan}>{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </>
  );
}
