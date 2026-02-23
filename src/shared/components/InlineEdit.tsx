import React, { useState, useRef, useEffect, useCallback } from 'react';
import { colors, radii, typography } from '@/shared/theme/tokens';

export interface InlineEditProps {
  value: number;
  step: number;
  min: number;
  max: number;
  /** 'decimal' for weight, 'numeric' for reps */
  inputMode: 'decimal' | 'numeric';
  color: string;
  suffix?: string;
  onChange: (val: number) => void;
}

export function InlineEdit({ value, step, min, max, inputMode, color, suffix = '', onChange }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Sync draft when value changes externally
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const commit = useCallback(() => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      // Round to step precision
      const rounded = Math.round(clamped / step) * step;
      // Fix floating point: round to 1 decimal
      const fixed = Math.round(rounded * 10) / 10;
      onChange(fixed);
    }
    setEditing(false);
  }, [draft, min, max, step, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <div style={ie.editRow}>
        <button
          onClick={() => {
            const next = Math.max(min, value - step);
            const fixed = Math.round(next * 10) / 10;
            onChange(fixed);
            setDraft(String(fixed));
          }}
          style={ie.stepBtn}
        >
          -
        </button>
        <input
          ref={inputRef}
          type="text"
          inputMode={inputMode}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          style={{ ...ie.input, color }}
        />
        <button
          onClick={() => {
            const next = Math.min(max, value + step);
            const fixed = Math.round(next * 10) / 10;
            onChange(fixed);
            setDraft(String(fixed));
          }}
          style={ie.stepBtn}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      style={{ ...ie.display, color, cursor: 'pointer' }}
      role="button"
      tabIndex={0}
    >
      {value}{suffix}
    </div>
  );
}

const ie: Record<string, React.CSSProperties> = {
  editRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    border: 'none',
    background: colors.surfaceHover,
    color: colors.text,
    cursor: 'pointer',
    fontWeight: typography.weights.black,
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  input: {
    width: 52,
    textAlign: 'center' as const,
    background: 'rgba(255,255,255,0.08)',
    border: `1px solid ${colors.primaryBorder}`,
    borderRadius: radii.sm,
    color: colors.text,
    fontWeight: typography.weights.black,
    fontSize: typography.sizes.xl,
    padding: '4px 2px',
    outline: 'none',
  },
  display: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
  },
};
