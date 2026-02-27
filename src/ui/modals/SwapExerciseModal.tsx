import React, { useState, useMemo, useCallback } from 'react';
import { S as _S } from '../styles';
import { exercises, type DomainExercise } from '../../domain/exercises';

const S = _S as Record<string, React.CSSProperties>;
import { FilterPills } from '@/shared/components/FilterPills';
import { EQUIPMENT_FILTER_OPTIONS } from '@/shared/types/exercise';

interface SwapTarget {
  id: string;
  exercise: DomainExercise;
}

interface SwapExerciseModalProps {
  showSwap: SwapTarget | null;
  onSwap: (peId: string, exercise: DomainExercise) => void;
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

export default function SwapExerciseModal({ showSwap, onSwap, onClose }: SwapExerciseModalProps) {
  const [search, setSearch] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('All');

  const filteredAlternatives = useMemo(() => {
    if (!showSwap) return [];

    let result = exercises.filter(
      e => e.muscle === showSwap.exercise.muscle && e.id !== showSwap.exercise.id,
    );

    if (search) {
      const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
      result = result.filter(ex => {
        const name = ex.name.toLowerCase();
        return terms.every(t => name.includes(t));
      });
    }

    if (equipmentFilter !== 'All') {
      result = result.filter(ex => matchesEquipment(ex.equipment, equipmentFilter));
    }

    return result;
  }, [showSwap, search, equipmentFilter]);

  const hasFilters = search !== '' || equipmentFilter !== 'All';

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setEquipmentFilter('All');
  }, []);

  if (!showSwap) return null;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.swapBox} onClick={e => e.stopPropagation()}>
        <h3 style={S.swapTitle}>Swap Exercise</h3>
        <p style={S.swapSub}>Replacing: {showSwap.exercise.name}</p>

        {/* Search */}
        <div style={S.addExSearchWrap}>
          <span style={S.addExSearchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search alternatives..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={S.addExSearch}
          />
          {search && (
            <button style={S.addExSearchClear} onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Equipment filter */}
        <div style={S.addExFilterLabel}>EQUIPMENT</div>
        <FilterPills
          options={EQUIPMENT_FILTER_OPTIONS}
          value={equipmentFilter}
          onChange={setEquipmentFilter}
        />

        {/* Result count */}
        <div style={S.addExResultCount}>{filteredAlternatives.length} found</div>

        {/* Alternatives list */}
        <div style={S.swapList}>
          {filteredAlternatives.length === 0 ? (
            <div style={S.addExEmpty}>
              <div style={S.addExEmptyIcon}>🏋️</div>
              <div style={S.addExEmptyText}>No alternatives match your filters</div>
              {hasFilters && (
                <button style={S.addExClearBtn} onClick={handleClearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredAlternatives.map(ex => (
              <button key={ex.id} onClick={() => onSwap(showSwap.id, ex)} style={S.swapItem}>
                <div>
                  <div style={S.swapItemName}>{ex.name}</div>
                  <div style={S.swapItemMeta}>{ex.equipment}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
