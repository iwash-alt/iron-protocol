import React, { useId } from 'react';
import { spacing, radii, typography } from '@/shared/theme/tokens';

interface FilterPillsProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
}

const scrollContainer: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  overflowX: 'auto',
  paddingBottom: 4,
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  marginBottom: spacing.sm,
};

const pillBase: React.CSSProperties = {
  borderRadius: radii.pill,
  padding: '4px 12px',
  fontSize: typography.sizes.sm,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  flexShrink: 0,
  lineHeight: 1.4,
  outline: 'none',
  fontFamily: 'inherit',
};

const activePill: React.CSSProperties = {
  ...pillBase,
  background: '#E5262A',
  color: '#fff',
  border: '2px solid #E5262A',
};

const inactivePill: React.CSSProperties = {
  ...pillBase,
  background: 'transparent',
  color: '#888',
  border: '1px solid #333',
};

export function FilterPills({ options, value, onChange, allLabel = 'All' }: FilterPillsProps) {
  const id = useId();

  return (
    <>
      <style>{`[data-filter-pills-id="${id}"]::-webkit-scrollbar { display: none; }`}</style>
      <div style={scrollContainer} data-filter-pills-id={id}>
        <button
          type="button"
          style={value === 'All' ? activePill : inactivePill}
          onClick={() => onChange('All')}
        >
          {allLabel}
        </button>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            style={value === opt ? activePill : inactivePill}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}
