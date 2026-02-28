import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { S as _S } from '../styles';
import type { Exercise, EquipmentFilter, MuscleFilter } from '@/shared/types';
import { MUSCLE_FILTER_MAP } from '@/shared/types';
import { ExerciseFilterPanel } from '@/shared/components/ExerciseFilterPanel';
import { useFilterHistory } from '@/shared/hooks/useFilterHistory';

const S = _S as Record<string, React.CSSProperties>;

type ExerciseDataModule = typeof import('@/data/exercises');

interface SwapTarget {
  id: string;
  exercise: { id: string; name: string; muscle: string; equipment: string };
}

interface SwapExerciseModalProps {
  showSwap: SwapTarget | null;
  onSwap: (peId: string, exercise: Exercise) => void;
  onClose: () => void;
}

/** Map a raw MuscleGroup to its curated filter value */
function toCuratedMuscle(raw: string): MuscleFilter | 'All' {
  for (const [filter, groups] of Object.entries(MUSCLE_FILTER_MAP)) {
    if ((groups as readonly string[]).includes(raw)) return filter as MuscleFilter;
  }
  return 'All';
}

export default function SwapExerciseModal({ showSwap, onSwap, onClose }: SwapExerciseModalProps) {
  const [search, setSearch] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter | 'All'>('All');
  const [muscleFilter, setMuscleFilter] = useState<MuscleFilter | 'All'>('All');
  const [exerciseData, setExerciseData] = useState<ExerciseDataModule | null>(null);
  const filterHistory = useFilterHistory();

  // Lazy-load exercise data
  useEffect(() => {
    if (!showSwap) return;
    let mounted = true;
    import('@/data/exercises').then(mod => {
      if (mounted) setExerciseData(mod);
    });
    return () => { mounted = false; };
  }, [showSwap]);

  // Default muscle filter based on swapped exercise
  const defaultMuscle = showSwap ? toCuratedMuscle(showSwap.exercise.muscle) : 'All';
  const effectiveMuscle = muscleFilter === 'All' ? defaultMuscle : muscleFilter;

  const filteredAlternatives = useMemo(() => {
    if (!exerciseData || !showSwap) return [];
    return exerciseData.filterExercises({
      search,
      equipment: equipmentFilter === 'All' ? undefined : equipmentFilter,
      muscle: effectiveMuscle === 'All' ? undefined : effectiveMuscle as MuscleFilter,
    }).filter(ex => ex.id !== showSwap.exercise.id);
  }, [exerciseData, showSwap, search, equipmentFilter, effectiveMuscle]);

  const allExercisesFlat = useMemo(() => {
    if (!exerciseData) return [];
    return exerciseData.filterExercises({});
  }, [exerciseData]);

  const hasFilters = search !== '' || equipmentFilter !== 'All' || muscleFilter !== 'All';

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setEquipmentFilter('All');
    setMuscleFilter('All');
  }, []);

  const handleEquipmentChange = useCallback((v: EquipmentFilter | 'All') => {
    setEquipmentFilter(v);
    filterHistory.trackFilter('equipment', v);
  }, [filterHistory]);

  const handleMuscleChange = useCallback((v: MuscleFilter | 'All') => {
    setMuscleFilter(v);
    filterHistory.trackFilter('muscle', v);
  }, [filterHistory]);

  if (!showSwap) return null;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.swapBox} onClick={e => e.stopPropagation()}>
        <h3 style={S.swapTitle}>Swap Exercise</h3>
        <p style={S.swapSub}>Replacing: {showSwap.exercise.name}</p>

        <ExerciseFilterPanel
          search={search}
          onSearchChange={setSearch}
          equipment={equipmentFilter}
          onEquipmentChange={handleEquipmentChange}
          muscle={effectiveMuscle}
          onMuscleChange={handleMuscleChange}
          allExercises={allExercisesFlat}
          resultCount={filteredAlternatives.length}
          onClearFilters={handleClearFilters}
          hasFilters={hasFilters}
        />

        {/* Alternatives list */}
        <div style={S.swapList}>
          {filteredAlternatives.map(ex => (
            <button key={ex.id} onClick={() => onSwap(showSwap.id, ex)} style={S.swapItem}>
              <div>
                <div style={S.swapItemName}>{ex.name}</div>
                <div style={S.swapItemMeta}>
                  {ex.muscle} · {ex.equipment === 'None' ? 'Bodyweight' : ex.equipment}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
