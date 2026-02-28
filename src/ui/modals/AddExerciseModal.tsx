import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { S as _S } from '../styles';
import type { Exercise, EquipmentFilter, MuscleFilter } from '@/shared/types';
import { ExerciseFilterPanel } from '@/shared/components/ExerciseFilterPanel';
import { useFilterHistory } from '@/shared/hooks/useFilterHistory';

const S = _S as Record<string, React.CSSProperties>;

type ExerciseDataModule = typeof import('@/data/exercises');

interface AddExerciseModalProps {
  dayName: string | undefined;
  onAdd: (exercise: Exercise) => void;
  onClose: () => void;
}

export default function AddExerciseModal({ dayName, onAdd, onClose }: AddExerciseModalProps) {
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleFilter | 'All'>('All');
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter | 'All'>('All');
  const [exerciseData, setExerciseData] = useState<ExerciseDataModule | null>(null);
  const filterHistory = useFilterHistory();

  // Lazy-load exercise data
  useEffect(() => {
    let mounted = true;
    import('@/data/exercises').then(mod => {
      if (mounted) setExerciseData(mod);
    });
    return () => { mounted = false; };
  }, []);

  const filteredExercises = useMemo(() => {
    if (!exerciseData) return [];
    return exerciseData.filterExercises({
      search,
      equipment: equipmentFilter === 'All' ? undefined : equipmentFilter,
      muscle: muscleFilter === 'All' ? undefined : muscleFilter,
    });
  }, [exerciseData, search, muscleFilter, equipmentFilter]);

  const allExercisesFlat = useMemo(() => {
    if (!exerciseData) return [];
    return exerciseData.filterExercises({});
  }, [exerciseData]);

  const hasFilters = search !== '' || muscleFilter !== 'All' || equipmentFilter !== 'All';

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setMuscleFilter('All');
    setEquipmentFilter('All');
  }, []);

  const handleEquipmentChange = useCallback((v: EquipmentFilter | 'All') => {
    setEquipmentFilter(v);
    filterHistory.trackFilter('equipment', v);
  }, [filterHistory]);

  const handleMuscleChange = useCallback((v: MuscleFilter | 'All') => {
    setMuscleFilter(v);
    filterHistory.trackFilter('muscle', v);
  }, [filterHistory]);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.addExModal} onClick={e => e.stopPropagation()}>
        <h3 style={S.addExTitle}>Add Exercise</h3>
        <p style={S.addExSub}>Add to {dayName}</p>

        <ExerciseFilterPanel
          search={search}
          onSearchChange={setSearch}
          equipment={equipmentFilter}
          onEquipmentChange={handleEquipmentChange}
          muscle={muscleFilter}
          onMuscleChange={handleMuscleChange}
          allExercises={allExercisesFlat}
          resultCount={filteredExercises.length}
          onClearFilters={handleClearFilters}
          hasFilters={hasFilters}
        />

        {/* Exercise list */}
        <div style={S.addExList}>
          {filteredExercises.map(ex => (
            <button key={ex.id} onClick={() => onAdd(ex)} style={S.addExItem}>
              <div>
                <div style={S.addExName}>{ex.name}</div>
                <div style={S.addExMeta}>{ex.muscle} &bull; {ex.equipment === 'None' ? 'Bodyweight' : ex.equipment}</div>
              </div>
              <div style={S.addExArrow}>+</div>
            </button>
          ))}
        </div>

        <button onClick={onClose} style={S.addExCancel}>CANCEL</button>
      </div>
    </div>
  );
}
