import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { TIMINGS } from '@/shared/constants/timings';

interface AutocompleteExercise {
  name: string;
  muscle: string;
  equipment: string;
}

interface ExerciseSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  exercises: AutocompleteExercise[];
  placeholder?: string;
}

const MAX_SUGGESTIONS = 5;
const MIN_CHARS_FOR_AUTOCOMPLETE = 2;

export function ExerciseSearchBar({
  value,
  onChange,
  exercises,
  placeholder = 'Search exercises...',
}: ExerciseSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const id = useId();

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedOnChange = useCallback(
    (text: string) => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        onChange(text);
      }, TIMINGS.DEBOUNCE_SEARCH);
    },
    [onChange],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setLocalValue(text);
      setShowDropdown(text.length >= MIN_CHARS_FOR_AUTOCOMPLETE);
      debouncedOnChange(text);
    },
    [debouncedOnChange],
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    setShowDropdown(false);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    onChange('');
  }, [onChange]);

  const handleSelect = useCallback(
    (name: string) => {
      setLocalValue(name);
      setShowDropdown(false);
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      onChange(name);
    },
    [onChange],
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Compute autocomplete suggestions from localValue (instant, not debounced)
  const suggestions = showDropdown && localValue.length >= MIN_CHARS_FOR_AUTOCOMPLETE
    ? exercises
        .filter(ex => ex.name.toLowerCase().includes(localValue.toLowerCase()))
        .slice(0, MAX_SUGGESTIONS)
    : [];

  return (
    <>
      <style>{`[data-search-id="${id}"] input::placeholder { color: ${colors.textTertiary}; }`}</style>
      <div ref={wrapperRef} style={wrapperStyle} data-search-id={id}>
        <div style={inputContainerStyle}>
          <span style={searchIconStyle}>🔍</span>
          <input
            type="text"
            placeholder={placeholder}
            value={localValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (localValue.length >= MIN_CHARS_FOR_AUTOCOMPLETE) setShowDropdown(true);
            }}
            style={inputStyle}
          />
          {localValue && (
            <button type="button" style={clearBtnStyle} onClick={handleClear}>
              ✕
            </button>
          )}
        </div>

        {suggestions.length > 0 && (
          <div style={dropdownStyle}>
            {suggestions.map(ex => (
              <button
                key={ex.name}
                type="button"
                style={dropdownItemStyle}
                onClick={() => handleSelect(ex.name)}
              >
                <span style={suggestionNameStyle}>{ex.name}</span>
                <span style={suggestionMetaStyle}>
                  {ex.muscle} · {ex.equipment === 'None' ? 'Bodyweight' : ex.equipment}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const wrapperStyle: React.CSSProperties = {
  position: 'relative',
  marginBottom: spacing.sm,
};

const inputContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spacing.sm,
  padding: `${spacing.sm}px ${spacing.md}px`,
  borderRadius: radii.md,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
};

const searchIconStyle: React.CSSProperties = {
  fontSize: 14,
  flexShrink: 0,
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'none',
  border: 'none',
  outline: 'none',
  color: colors.text,
  fontSize: typography.sizes.base,
  fontFamily: 'inherit',
};

const clearBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: colors.textTertiary,
  cursor: 'pointer',
  fontSize: 14,
  padding: 0,
  flexShrink: 0,
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  background: '#1c1c1e',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: radii.md,
  zIndex: 10,
  maxHeight: 200,
  overflowY: 'auto',
  marginTop: 2,
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: '8px 12px',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  textAlign: 'left',
};

const suggestionNameStyle: React.CSSProperties = {
  fontSize: typography.sizes.base,
  color: colors.text,
  fontWeight: 600,
};

const suggestionMetaStyle: React.CSSProperties = {
  fontSize: typography.sizes.xs,
  color: colors.textTertiary,
  marginTop: 1,
};
