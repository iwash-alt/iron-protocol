import React, { useState, useMemo, useCallback } from 'react';
import { S as _S } from '../styles';
import { exercises, type DomainExercise } from '../../domain/exercises';

const S = _S as Record<string, React.CSSProperties>;
import { FilterPills } from '@/shared/components/FilterPills';
import {
  MUSCLE_FILTER_OPTIONS,
  MUSCLE_FILTER_MAP,
  EQUIPMENT_FILTER_OPTIONS,
} from '@/shared/types/exercise';

interface AddExerciseModalProps {
  dayName: string | undefined;
  onAdd: (exercise: DomainExercise) => void;
  onClose: () => void;
}

function matchesEquipment(exerciseEquipment: string, filter: string): boolean {
  const eq = exerciseEquipment.toLowerCase();
  const f = filter.toLowerCase();
  if (f === 'machine') return eq.includes('machine');
  if (f === 'band') return eq === 'resistance band' || eq === 'band';
  if (f === 'bodyweight') return eq === 'bodyweight' || eq === 'none';
  return eq === f || eq.startsWith(f);
}

export default function AddExerciseModal({ dayName, onAdd, onClose }: AddExerciseModalProps) {
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [equipmentFilter, setEquipmentFilter] = useState('All');

  const filteredExercises = useMemo(() => {
    let result = exercises.filter(e => !e.bodyweight);

    if (search) {
      const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
      result = result.filter(ex => {
        const name = ex.name.toLowerCase();
        return terms.every(t => name.includes(t));
      });
    }

    if (muscleFilter !== 'All') {
      const key = muscleFilter as typeof MUSCLE_FILTER_OPTIONS[number];
      const groups = MUSCLE_FILTER_MAP[key];
      if (groups) {
        result = result.filter(ex =>
          (groups as readonly string[]).includes(ex.muscle),
        );
      }
    }

    if (equipmentFilter !== 'All') {
      result = result.filter(ex => matchesEquipment(ex.equipment, equipmentFilter));
    }

    return result;
  }, [search, muscleFilter, equipmentFilter]);

  const hasFilters = search !== '' || muscleFilter !== 'All' || equipmentFilter !== 'All';

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setMuscleFilter('All');
    setEquipmentFilter('All');
  }, []);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.addExModal} onClick={e => e.stopPropagation()}>
        <h3 style={S.addExTitle}>Add Exercise</h3>
        <p style={S.addExSub}>Add to {dayName}</p>

        {/* Search */}
        <div style={S.addExSearchWrap}>
          <span style={S.addExSearchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={S.addExSearch}
          />
          {search && (
            <button style={S.addExSearchClear} onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Muscle filter */}
        <div style={S.addExFilterLabel}>MUSCLE GROUP</div>
        <FilterPills
          options={MUSCLE_FILTER_OPTIONS}
          value={muscleFilter}
          onChange={setMuscleFilter}
        />

        {/* Equipment filter */}
        <div style={S.addExFilterLabel}>EQUIPMENT</div>
        <FilterPills
          options={EQUIPMENT_FILTER_OPTIONS}
          value={equipmentFilter}
          onChange={setEquipmentFilter}
        />

        {/* Result count */}
        <div style={S.addExResultCount}>{filteredExercises.length} found</div>

        {/* Exercise list */}
        <div style={S.addExList}>
          {filteredExercises.length === 0 ? (
            <div style={S.addExEmpty}>
              <div style={S.addExEmptyIcon}>🏋️</div>
              <div style={S.addExEmptyText}>No exercises match your filters</div>
              {hasFilters && (
                <button style={S.addExClearBtn} onClick={handleClearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredExercises.map(ex => (
              <button key={ex.id} onClick={() => onAdd(ex)} style={S.addExItem}>
                <div>
                  <div style={S.addExName}>{ex.name}</div>
                  <div style={S.addExMeta}>{ex.muscle} &bull; {ex.equipment}</div>
                </div>
                <div style={S.addExArrow}>+</div>
              </button>
            ))
          )}
        </div>

        <button onClick={onClose} style={S.addExCancel}>CANCEL</button>
      </div>
    </div>
  );
}
