import React, { useState, useMemo, useEffect } from 'react';
import type { Exercise, EquipmentFilter, MuscleFilter } from '@/shared/types';
import { EQUIPMENT_FILTER_OPTIONS, MUSCLE_FILTER_OPTIONS } from '@/shared/types';
import { S } from '@/shared/theme/styles';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';

interface ExerciseBrowserModalProps {
  title?: string;
  subtitle?: string;
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

interface ExerciseModule {
  filterExercises: (opts: { search?: string; equipment?: EquipmentFilter; muscle?: MuscleFilter }) => Exercise[];
}

const ebStyles: Record<string, React.CSSProperties> = {
  searchInput: {
    width: '100%',
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    background: 'rgba(255,255,255,0.06)',
    color: colors.text,
    fontSize: typography.sizes.base,
    outline: 'none',
    marginBottom: spacing.sm,
    boxSizing: 'border-box' as const,
  },
  filterRow: {
    display: 'flex',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  select: {
    flex: 1,
    padding: `${spacing.sm}px ${spacing.sm}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.surfaceBorder}`,
    background: colors.surface,
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
    appearance: 'auto' as const,
  },
  option: {
    background: '#111',
    color: '#fff',
  },
  resultCount: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: 'center' as const,
    marginBottom: spacing.sm,
    marginTop: 0,
  },
};

export function ExerciseBrowserModal({ title = 'Add Exercise', subtitle, onSelect, onClose }: ExerciseBrowserModalProps) {
  const [exerciseData, setExerciseData] = useState<ExerciseModule | null>(null);
  const [exSearch, setExSearch] = useState('');
  const [exEquipment, setExEquipment] = useState<EquipmentFilter>('All');
  const [exMuscle, setExMuscle] = useState<MuscleFilter>('All');

  useEffect(() => {
    import('@/data/exercises').then(mod => setExerciseData(mod));
  }, []);

  const filteredExercises = useMemo(() => {
    if (!exerciseData) return [];
    return exerciseData.filterExercises({
      search: exSearch,
      equipment: exEquipment,
      muscle: exMuscle,
    });
  }, [exerciseData, exSearch, exEquipment, exMuscle]);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.addExModal, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <h3 style={S.addExTitle}>{title}</h3>
        {subtitle && <p style={S.addExSub}>{subtitle}</p>}

        <input
          type="text"
          placeholder="Search exercises..."
          value={exSearch}
          onChange={e => setExSearch(e.target.value)}
          style={ebStyles.searchInput}
        />

        <div style={ebStyles.filterRow}>
          <select
            value={exEquipment}
            onChange={e => setExEquipment(e.target.value as EquipmentFilter)}
            style={ebStyles.select}
          >
            <option value="All">All Equipment</option>
            {EQUIPMENT_FILTER_OPTIONS.map(eq => (
              <option key={eq} value={eq} style={ebStyles.option}>{eq}</option>
            ))}
          </select>
          <select
            value={exMuscle}
            onChange={e => setExMuscle(e.target.value as MuscleFilter)}
            style={ebStyles.select}
          >
            <option value="All">All Muscles</option>
            {MUSCLE_FILTER_OPTIONS.map(m => (
              <option key={m} value={m} style={ebStyles.option}>{m}</option>
            ))}
          </select>
        </div>

        <p style={ebStyles.resultCount}>
          {filteredExercises.length > 0
            ? `${filteredExercises.length} exercise${filteredExercises.length !== 1 ? 's' : ''}`
            : 'No exercises match these filters'}
        </p>

        <div style={S.addExList}>
          {filteredExercises.map(ex => (
            <button
              key={ex.id}
              onClick={() => onSelect(ex)}
              style={{ ...S.addExItem, width: '100%' }}
            >
              <div>
                <div style={S.addExName}>{ex.name}</div>
                <div style={S.addExMeta}>
                  {ex.muscle} {'\u00B7'} {ex.equipment === 'None' ? 'Bodyweight' : ex.equipment}
                </div>
              </div>
              <div style={S.addExArrow}>+</div>
            </button>
          ))}
        </div>

        <button onClick={onClose} style={S.addExCancel}>Cancel</button>
      </div>
    </div>
  );
}
