import React from 'react';
import type { EquipmentFilter, MuscleFilter, ExerciseType } from '@/shared/types';
import { EQUIPMENT_FILTER_OPTIONS, MUSCLE_FILTER_OPTIONS } from '@/shared/types';
import { colors, spacing, typography } from '@/shared/theme/tokens';
import { ExerciseSearchBar } from './ExerciseSearchBar';
import { FilterCards } from './FilterCards';
import type { FilterCardOption } from './FilterCards';

// ── Emoji icon mappings ──────────────────────────────────────────────────────

const EQUIPMENT_ICONS: Record<string, string> = {
  Barbell: '🏋️',
  Dumbbell: '💪',
  'Smith Machine': '🔩',
  Cable: '🔗',
  Machine: '⚙️',
  Bodyweight: '🤸',
  'EZ Bar': '🏋️',
  Kettlebell: '🔔',
  Band: '🪢',
};

const MUSCLE_ICONS: Record<string, string> = {
  Chest: '💪',
  Back: '🔙',
  Shoulders: '🏔️',
  Arms: '💪',
  Legs: '🦵',
  Core: '🎯',
};

const EQUIPMENT_CARD_OPTIONS: readonly FilterCardOption[] = EQUIPMENT_FILTER_OPTIONS.map(eq => ({
  value: eq,
  label: eq,
  icon: EQUIPMENT_ICONS[eq] ?? '🏋️',
}));

const MUSCLE_CARD_OPTIONS: readonly FilterCardOption[] = MUSCLE_FILTER_OPTIONS.map(m => ({
  value: m,
  label: m,
  icon: MUSCLE_ICONS[m] ?? '💪',
}));

const TYPE_CARD_OPTIONS: readonly FilterCardOption[] = [
  { value: 'compound', label: 'Compound', icon: '🏋️' },
  { value: 'isolation', label: 'Isolation', icon: '🎯' },
  { value: 'bodyweight', label: 'Bodyweight', icon: '🤸' },
  { value: 'cardio', label: 'Cardio', icon: '❤️' },
];

// ── Props ────────────────────────────────────────────────────────────────────

interface ExerciseFilterPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  equipment: EquipmentFilter | 'All';
  onEquipmentChange: (value: EquipmentFilter | 'All') => void;
  muscle: MuscleFilter | 'All';
  onMuscleChange: (value: MuscleFilter | 'All') => void;
  type?: ExerciseType | 'All';
  onTypeChange?: (value: ExerciseType | 'All') => void;
  allExercises: Array<{ name: string; muscle: string; equipment: string }>;
  resultCount: number;
  onCreateCustom?: () => void;
  onClearFilters?: () => void;
  hasFilters: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ExerciseFilterPanel({
  search,
  onSearchChange,
  equipment,
  onEquipmentChange,
  muscle,
  onMuscleChange,
  type,
  onTypeChange,
  allExercises,
  resultCount,
  onCreateCustom,
  onClearFilters,
  hasFilters,
}: ExerciseFilterPanelProps) {
  return (
    <div style={panelStyle}>
      {/* Search with autocomplete */}
      <ExerciseSearchBar
        value={search}
        onChange={onSearchChange}
        exercises={allExercises}
      />

      {/* Equipment filter row */}
      <div style={rowLabelStyle}>EQUIPMENT</div>
      <FilterCards
        options={EQUIPMENT_CARD_OPTIONS}
        value={equipment}
        onChange={v => onEquipmentChange(v as EquipmentFilter | 'All')}
        allLabel="All"
        allIcon="🏋️"
      />

      {/* Muscle group filter row */}
      <div style={rowLabelStyle}>MUSCLE GROUP</div>
      <FilterCards
        options={MUSCLE_CARD_OPTIONS}
        value={muscle}
        onChange={v => onMuscleChange(v as MuscleFilter | 'All')}
        allLabel="All"
        allIcon="💪"
      />

      {/* Type filter row (optional) */}
      {onTypeChange && (
        <>
          <div style={rowLabelStyle}>TYPE</div>
          <FilterCards
            options={TYPE_CARD_OPTIONS}
            value={type ?? 'All'}
            onChange={v => onTypeChange(v as ExerciseType | 'All')}
            allLabel="All Types"
            allIcon="🏋️"
          />
        </>
      )}

      {/* Result count + clear filters */}
      <div style={resultRowStyle}>
        <span style={resultCountStyle}>{resultCount} matches</span>
        {hasFilters && onClearFilters && (
          <button type="button" style={clearBtnStyle} onClick={onClearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {/* Empty state with create custom */}
      {resultCount === 0 && hasFilters && onCreateCustom && (
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>🏋️</div>
          <div style={emptyTextStyle}>No exercises match</div>
          <button type="button" style={createBtnStyle} onClick={onCreateCustom}>
            No luck? Create custom
          </button>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const panelStyle: React.CSSProperties = {
  flexShrink: 0,
};

const rowLabelStyle: React.CSSProperties = {
  fontSize: typography.sizes.xs,
  fontWeight: 800,
  color: colors.textTertiary,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: spacing.xs,
};

const resultRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: spacing.sm,
};

const resultCountStyle: React.CSSProperties = {
  fontSize: typography.sizes.sm,
  color: colors.textSecondary,
};

const clearBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: colors.primary,
  fontSize: typography.sizes.sm,
  fontWeight: 700,
  cursor: 'pointer',
  padding: 0,
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: `${spacing.xl}px 0`,
};

const emptyIconStyle: React.CSSProperties = {
  fontSize: 40,
  marginBottom: spacing.sm,
};

const emptyTextStyle: React.CSSProperties = {
  color: colors.textSecondary,
  fontSize: typography.sizes.base,
  marginBottom: spacing.md,
};

const createBtnStyle: React.CSSProperties = {
  padding: `${spacing.sm}px ${spacing.lg}px`,
  borderRadius: 20,
  border: `1px solid ${colors.primaryBorder}`,
  background: 'rgba(255,59,48,0.1)',
  color: colors.primary,
  fontSize: typography.sizes.sm,
  fontWeight: 700,
  cursor: 'pointer',
};
