import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Exercise, EquipmentFilter, MuscleFilter, ExerciseType, MuscleGroup, Equipment } from '@/shared/types';
import type { CustomExercise } from '@/shared/types/exercise';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { loadCustomExercises, saveCustomExercises } from '@/shared/storage';
import { ExerciseFilterPanel } from './ExerciseFilterPanel';
import { SuggestedExercises } from './SuggestedExercises';
import { useFilterHistory } from '@/shared/hooks/useFilterHistory';
import { suggestTags } from '@/shared/utils/exerciseAutoTag';

// ── Types ─────────────────────────────────────────────────────────────────────

type ExerciseTypeFilter = ExerciseType | 'All';

interface ExerciseBrowserModalProps {
  title?: string;
  subtitle?: string;
  /** Recently used exercise names (from workout history). Show at top when no search. */
  recentlyUsed?: string[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

interface ExerciseDataModule {
  filterExercises: (opts: {
    search?: string;
    equipment?: EquipmentFilter;
    muscle?: MuscleFilter;
    type?: ExerciseTypeFilter;
    extra?: Exercise[];
  }) => Exercise[];
  findExerciseByName: (name: string) => Exercise | undefined;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: Array<{ value: ExerciseTypeFilter; label: string }> = [
  { value: 'All', label: 'All Types' },
  { value: 'compound', label: 'Compound' },
  { value: 'isolation', label: 'Isolation' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'cardio', label: 'Cardio' },
];

// Default muscle groups for the select dropdown in create form
const CREATE_MUSCLE_OPTIONS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Full Body', 'Cardio',
];

const CREATE_EQUIPMENT_OPTIONS: Equipment[] = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine (pin/stack)', 'Machine (plate-loaded)',
  'Smith Machine', 'Kettlebell', 'Resistance Band', 'EZ Bar', 'None',
];

// ── Sub-components ────────────────────────────────────────────────────────────

function ExerciseDetailSheet({
  exercise,
  onAdd,
  onClose,
}: {
  exercise: Exercise;
  onAdd: (ex: Exercise) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div style={ebStyles.sheetOverlay} onClick={onClose} />
      <div style={ebStyles.detailSheet}>
        <div style={ebStyles.detailHandle} />
        <div style={ebStyles.detailHeader}>
          <div>
            <div style={ebStyles.detailName}>{exercise.name}</div>
            <div style={ebStyles.detailMeta}>
              <span style={{ ...ebStyles.typeBadge, ...getTypeBadgeStyle(exercise.type) }}>
                {exercise.type}
              </span>
              <span style={ebStyles.detailEquip}>{exercise.equipment === 'None' ? 'Bodyweight' : exercise.equipment}</span>
              <span style={ebStyles.detailMuscle}>{exercise.muscle}</span>
            </div>
          </div>
        </div>

        {exercise.secondaryMuscles.length > 0 && (
          <div style={ebStyles.detailSection}>
            <div style={ebStyles.detailSectionTitle}>SECONDARY MUSCLES</div>
            <div style={ebStyles.tagRow}>
              {exercise.secondaryMuscles.map(m => (
                <span key={m} style={ebStyles.tag}>{m}</span>
              ))}
            </div>
          </div>
        )}

        {exercise.formCues.length > 0 && (
          <div style={ebStyles.detailSection}>
            <div style={ebStyles.detailSectionTitle}>FORM CUES</div>
            {exercise.formCues.map((cue, i) => (
              <div key={i} style={ebStyles.cueRow}>
                <span style={ebStyles.cueBullet}>✓</span>
                <span style={ebStyles.cueText}>{cue}</span>
              </div>
            ))}
          </div>
        )}

        {exercise.commonMistakes.length > 0 && (
          <div style={ebStyles.detailSection}>
            <div style={ebStyles.detailSectionTitle}>COMMON MISTAKES</div>
            {exercise.commonMistakes.map((m, i) => (
              <div key={i} style={ebStyles.cueRow}>
                <span style={{ ...ebStyles.cueBullet, color: colors.primary }}>✗</span>
                <span style={ebStyles.cueText}>{m}</span>
              </div>
            ))}
          </div>
        )}

        <button style={ebStyles.addBigBtn} onClick={() => { onAdd(exercise); onClose(); }}>
          + Add to Workout
        </button>
        <button style={ebStyles.cancelLink} onClick={onClose}>Back to list</button>
      </div>
    </>
  );
}

function CreateExerciseSheet({
  onSave,
  onClose,
  allExercises,
  duplicateFrom,
}: {
  onSave: (ex: CustomExercise) => void;
  onClose: () => void;
  allExercises?: Exercise[];
  duplicateFrom?: Exercise | null;
}) {
  const [name, setName] = useState(duplicateFrom ? `${duplicateFrom.name} (Custom)` : '');
  const [muscle, setMuscle] = useState<MuscleGroup>(duplicateFrom?.muscle ?? 'Chest');
  const [equipment, setEquipment] = useState<Equipment>(duplicateFrom?.equipment ?? 'Barbell');
  const [type, setType] = useState<ExerciseType>(duplicateFrom?.type ?? 'compound');
  const [notes, setNotes] = useState('');
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [dupSearch, setDupSearch] = useState('');

  // Auto-tag: suggest muscle/equipment/type as user types name
  useEffect(() => {
    // Don't auto-tag if duplicating (already pre-filled)
    if (duplicateFrom) return;
    if (!name || name.trim().length < 3) return;

    const tags = suggestTags(name);
    if (tags.muscle) setMuscle(tags.muscle);
    if (tags.equipment) setEquipment(tags.equipment);
    if (tags.type) setType(tags.type);
  }, [name, duplicateFrom]);

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const custom: CustomExercise = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      muscle,
      equipment,
      type,
      isBodyweight: equipment === 'None',
      secondaryMuscles: duplicateFrom?.secondaryMuscles ?? [],
      formCues: duplicateFrom?.formCues ?? [],
      commonMistakes: duplicateFrom?.commonMistakes ?? [],
      isCustom: true,
      notes: notes.trim() || undefined,
      duplicatedFrom: duplicateFrom?.id,
    };
    onSave(custom);
  }, [name, muscle, equipment, type, notes, duplicateFrom, onSave]);

  // Duplicate search results
  const dupResults = useMemo(() => {
    if (!showDuplicate || !allExercises || !dupSearch.trim()) return [];
    const lower = dupSearch.toLowerCase();
    return allExercises.filter(e => e.name.toLowerCase().includes(lower)).slice(0, 8);
  }, [showDuplicate, allExercises, dupSearch]);

  const handleDuplicateSelect = useCallback((ex: Exercise) => {
    setName(`${ex.name} (Custom)`);
    setMuscle(ex.muscle);
    setEquipment(ex.equipment);
    setType(ex.type);
    setShowDuplicate(false);
    setDupSearch('');
  }, []);

  const muscleIcons: Record<string, string> = {
    Chest: '💪', Back: '🔙', Shoulders: '🏔️', Biceps: '💪',
    Triceps: '💪', Quads: '🦵', Hamstrings: '🦵', Glutes: '🍑',
    Calves: '🦶', Core: '🎯', 'Full Body': '⚡', Cardio: '❤️',
    Lats: '🔙', 'Rear Delts': '🏔️',
  };

  // Duplicate picker sub-sheet
  if (showDuplicate) {
    return (
      <>
        <div style={ebStyles.sheetOverlay} onClick={() => setShowDuplicate(false)} />
        <div style={ebStyles.detailSheet}>
          <div style={ebStyles.detailHandle} />
          <div style={ebStyles.createTitle}>Duplicate from Existing</div>
          <div style={ebStyles.createField}>
            <input
              type="text"
              value={dupSearch}
              placeholder="Search exercise to duplicate..."
              autoFocus
              onChange={e => setDupSearch(e.target.value)}
              style={ebStyles.createInput}
            />
          </div>
          <div style={csStyles.dupList}>
            {dupResults.length === 0 && dupSearch.trim() && (
              <div style={csStyles.dupEmpty}>No exercises found</div>
            )}
            {dupResults.map(ex => (
              <button
                key={ex.id}
                style={csStyles.dupRow}
                onClick={() => handleDuplicateSelect(ex)}
              >
                <div>
                  <div style={csStyles.dupName}>{ex.name}</div>
                  <div style={csStyles.dupMeta}>
                    {ex.muscle} · {ex.equipment === 'None' ? 'Bodyweight' : ex.equipment}
                  </div>
                </div>
                <span style={csStyles.dupArrow}>→</span>
              </button>
            ))}
          </div>
          <button style={ebStyles.cancelLink} onClick={() => setShowDuplicate(false)}>Back</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={ebStyles.sheetOverlay} onClick={onClose} />
      <div style={{ ...ebStyles.detailSheet, maxHeight: '90vh' }}>
        <div style={ebStyles.detailHandle} />
        <div style={csStyles.headerRow}>
          <div style={ebStyles.createTitle}>Create Custom Exercise</div>
          {allExercises && allExercises.length > 0 && (
            <button style={csStyles.dupBtn} onClick={() => setShowDuplicate(true)}>
              📋 Duplicate
            </button>
          )}
        </div>

        {/* Name */}
        <div style={ebStyles.createField}>
          <label style={ebStyles.createLabel}>Exercise Name</label>
          <input
            type="text"
            value={name}
            placeholder="e.g. Incline Dumbbell Press"
            maxLength={60}
            autoFocus
            onChange={e => setName(e.target.value)}
            style={csStyles.nameInput}
          />
          {name.trim().length >= 3 && suggestTags(name).muscle && !duplicateFrom && (
            <div style={csStyles.autoTagHint}>
              ✨ Auto-detected: {suggestTags(name).muscle}
              {suggestTags(name).equipment ? ` / ${suggestTags(name).equipment}` : ''}
            </div>
          )}
        </div>

        {/* Muscle Group with icons */}
        <div style={ebStyles.createField}>
          <label style={ebStyles.createLabel}>Primary Muscle Group</label>
          <div style={csStyles.muscleGrid}>
            {CREATE_MUSCLE_OPTIONS.map(m => (
              <button
                key={m}
                onClick={() => setMuscle(m)}
                style={{
                  ...csStyles.muscleChip,
                  ...(muscle === m ? csStyles.muscleChipActive : {}),
                }}
              >
                <span style={csStyles.muscleIcon}>{muscleIcons[m] ?? '🏋️'}</span>
                <span>{m}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div style={ebStyles.createField}>
          <label style={ebStyles.createLabel}>Equipment</label>
          <div style={csStyles.equipGrid}>
            {CREATE_EQUIPMENT_OPTIONS.map(eq => (
              <button
                key={eq}
                onClick={() => setEquipment(eq)}
                style={{
                  ...csStyles.equipChip,
                  ...(equipment === eq ? csStyles.equipChipActive : {}),
                }}
              >
                {eq === 'None' ? 'Bodyweight' : eq}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Type */}
        <div style={ebStyles.createField}>
          <label style={ebStyles.createLabel}>Exercise Type</label>
          <div style={ebStyles.typeRow}>
            {(['compound', 'isolation', 'bodyweight', 'cardio'] as ExerciseType[]).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  ...ebStyles.typePill,
                  ...(type === t ? ebStyles.typePillActive : {}),
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={ebStyles.createField}>
          <label style={ebStyles.createLabel}>Notes (optional)</label>
          <textarea
            value={notes}
            placeholder="e.g. Use wide grip, 3 second eccentric..."
            maxLength={200}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            style={csStyles.notesInput}
          />
        </div>

        {/* Live preview card */}
        {name.trim() && (
          <div style={csStyles.preview}>
            <div style={csStyles.previewLabel}>PREVIEW</div>
            <div style={csStyles.previewCard}>
              <div style={csStyles.previewNameRow}>
                <span style={csStyles.previewName}>{name.trim()}</span>
                <span style={ebStyles.customBadge}>CUSTOM</span>
              </div>
              <div style={csStyles.previewMeta}>
                <span style={{ ...ebStyles.typeBadge, ...getTypeBadgeStyle(type) }}>{type}</span>
                <span style={csStyles.previewDot}>·</span>
                <span style={csStyles.previewText}>{muscle}</span>
                <span style={csStyles.previewDot}>·</span>
                <span style={csStyles.previewText}>{equipment === 'None' ? 'Bodyweight' : equipment}</span>
              </div>
              {notes.trim() && (
                <div style={csStyles.previewNotes}>📝 {notes.trim()}</div>
              )}
            </div>
          </div>
        )}

        <button
          style={{ ...ebStyles.addBigBtn, opacity: name.trim() ? 1 : 0.4 }}
          onClick={handleSave}
          disabled={!name.trim()}
        >
          Save Exercise
        </button>
        <button style={ebStyles.cancelLink} onClick={onClose}>Cancel</button>
      </div>
    </>
  );
}

// ── CreateExerciseSheet styles ────────────────────────────────────────────────

const csStyles: Record<string, React.CSSProperties> = {
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dupBtn: {
    padding: `${spacing.xs}px ${spacing.sm}px`,
    borderRadius: radii.md,
    border: `1px solid rgba(168,85,247,0.3)`,
    background: 'rgba(168,85,247,0.1)',
    color: '#c084fc',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  nameInput: {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: `14px ${spacing.md}px`,
    borderRadius: radii.lg,
    border: `2px solid rgba(255,255,255,0.1)`,
    background: 'rgba(255,255,255,0.06)',
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    outline: 'none',
  },
  autoTagHint: {
    fontSize: typography.sizes.xs,
    color: '#a78bfa',
    marginTop: 6,
    padding: `3px 8px`,
    borderRadius: radii.sm,
    background: 'rgba(167,139,250,0.08)',
    display: 'inline-block',
  },
  muscleGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  muscleChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: `6px 10px`,
    borderRadius: radii.md,
    border: `1px solid rgba(255,255,255,0.08)`,
    background: 'rgba(255,255,255,0.04)',
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
  },
  muscleChipActive: {
    background: 'rgba(255,59,48,0.15)',
    border: `1px solid rgba(255,59,48,0.5)`,
    color: colors.text,
  },
  muscleIcon: {
    fontSize: '0.75rem',
  },
  equipGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  equipChip: {
    padding: `6px 10px`,
    borderRadius: radii.md,
    border: `1px solid rgba(255,255,255,0.08)`,
    background: 'rgba(255,255,255,0.04)',
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
  },
  equipChipActive: {
    background: 'rgba(255,59,48,0.15)',
    border: `1px solid rgba(255,59,48,0.5)`,
    color: colors.text,
  },
  notesInput: {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    border: `1px solid rgba(255,255,255,0.1)`,
    background: 'rgba(255,255,255,0.06)',
    color: colors.text,
    fontSize: typography.sizes.base,
    outline: 'none',
    resize: 'none' as const,
    fontFamily: 'inherit',
  },
  preview: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  previewLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.textTertiary,
    letterSpacing: '0.08em',
    marginBottom: spacing.xs,
  },
  previewCard: {
    padding: `${spacing.md}px`,
    borderRadius: radii.lg,
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid rgba(255,255,255,0.08)`,
  },
  previewNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  previewName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
    color: colors.text,
  },
  previewMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  previewDot: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
  },
  previewText: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  previewNotes: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 8,
    padding: `4px 8px`,
    borderRadius: radii.sm,
    background: 'rgba(255,255,255,0.03)',
    fontStyle: 'italic' as const,
  },
  // Duplicate picker styles
  dupList: {
    maxHeight: '50vh',
    overflowY: 'auto' as const,
  },
  dupEmpty: {
    textAlign: 'center' as const,
    color: colors.textTertiary,
    padding: spacing.lg,
    fontSize: typography.sizes.sm,
  },
  dupRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: `${spacing.sm}px 0`,
    borderBottom: `1px solid rgba(255,255,255,0.04)`,
    background: 'none',
    border: 'none',
    borderBottomStyle: 'solid' as const,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  dupName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  dupMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  dupArrow: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTypeBadgeStyle(type: ExerciseType): React.CSSProperties {
  const map: Record<ExerciseType, string> = {
    compound: '#ef4444',
    isolation: '#3b82f6',
    accessory: '#6b7280',
    bodyweight: '#22c55e',
    cardio: '#f59e0b',
  };
  return {
    background: `${map[type] ?? '#6b7280'}22`,
    color: map[type] ?? '#6b7280',
    border: `1px solid ${map[type] ?? '#6b7280'}44`,
  };
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ExerciseBrowserModal({
  title = 'Exercise Library',
  subtitle,
  recentlyUsed = [],
  onSelect,
  onClose,
}: ExerciseBrowserModalProps) {
  const [exerciseData, setExerciseData] = useState<ExerciseDataModule | null>(null);
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [exSearch, setExSearch] = useState('');
  const [exEquipment, setExEquipment] = useState<EquipmentFilter | 'All'>('All');
  const [exMuscle, setExMuscle] = useState<MuscleFilter | 'All'>('All');
  const [exType, setExType] = useState<ExerciseTypeFilter>('All');
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const filterHistory = useFilterHistory();

  // Lazy-load exercise data (117 KB chunk)
  useEffect(() => {
    import('@/data/exercises').then(mod => setExerciseData(mod));
  }, []);

  // Load custom exercises from storage
  useEffect(() => {
    setCustomExercises(loadCustomExercises());
  }, []);

  const customAsExercises: Exercise[] = useMemo(
    () => customExercises.map(c => ({ ...c } as Exercise)),
    [customExercises],
  );

  const filteredExercises = useMemo(() => {
    if (!exerciseData) return [];
    return exerciseData.filterExercises({
      search: exSearch,
      equipment: exEquipment === 'All' ? undefined : exEquipment as EquipmentFilter,
      muscle: exMuscle === 'All' ? undefined : exMuscle as MuscleFilter,
      type: exType === 'All' ? undefined : exType,
      extra: customAsExercises,
    });
  }, [exerciseData, exSearch, exEquipment, exMuscle, exType, customAsExercises]);

  // Recently used exercises resolved from data
  const recentExercises = useMemo(() => {
    if (!exerciseData || recentlyUsed.length === 0 || exSearch) return [];
    const hasFilters = exEquipment !== 'All' || exMuscle !== 'All' || exType !== 'All';
    if (hasFilters) return [];
    return recentlyUsed
      .slice(0, 5)
      .map(name => {
        const found = exerciseData.findExerciseByName(name);
        if (found) return found;
        return customAsExercises.find(e => e.name === name) ?? null;
      })
      .filter((e): e is Exercise => e !== null);
  }, [exerciseData, recentlyUsed, exSearch, exEquipment, exMuscle, exType, customAsExercises]);

  const hasFilters = exEquipment !== 'All' || exMuscle !== 'All' || exType !== 'All' || exSearch !== '';

  const handleClearFilters = useCallback(() => {
    setExSearch('');
    setExEquipment('All');
    setExMuscle('All');
    setExType('All');
  }, []);

  const handleSaveCustom = useCallback((ex: CustomExercise) => {
    const updated = [...customExercises, ex];
    setCustomExercises(updated);
    saveCustomExercises(updated);
    setShowCreate(false);
    // Immediately select it
    onSelect(ex as Exercise);
    onClose();
  }, [customExercises, onSelect, onClose]);

  const typeLabels = TYPE_OPTIONS.map(t => t.label);
  const typeValues = TYPE_OPTIONS.map(t => t.value);

  // Flat exercise list for autocomplete
  const allExercisesFlat = useMemo(() => {
    if (!exerciseData) return [];
    return exerciseData.filterExercises({ extra: customAsExercises });
  }, [exerciseData, customAsExercises]);

  // Wrapped handlers that track filter history
  const handleEquipmentChange = useCallback((v: EquipmentFilter | 'All') => {
    setExEquipment(v);
    filterHistory.trackFilter('equipment', v);
  }, [filterHistory]);

  const handleMuscleChange = useCallback((v: MuscleFilter | 'All') => {
    setExMuscle(v);
    filterHistory.trackFilter('muscle', v);
  }, [filterHistory]);

  const preferredEquipment = filterHistory.getTopEquipment(3);
  const preferredMuscles = filterHistory.getTopMuscle(3);
  const currentResultIds = useMemo(
    () => new Set(filteredExercises.map(ex => ex.id)),
    [filteredExercises],
  );

  return (
    <>
      {/* Backdrop */}
      <div style={ebStyles.overlay} onClick={onClose} />

      {/* Main sheet */}
      <div style={ebStyles.sheet}>
        {/* Header */}
        <div style={ebStyles.handle} />
        <div style={ebStyles.header}>
          <div>
            <div style={ebStyles.title}>{title}</div>
            {subtitle && <div style={ebStyles.subtitle}>{subtitle}</div>}
          </div>
          <button style={ebStyles.createBtn} onClick={() => setShowCreate(true)}>
            + Create
          </button>
        </div>

        {/* Filter panel (search + equipment + muscle) */}
        <div style={{ padding: `0 ${spacing.lg}px` }}>
          <ExerciseFilterPanel
            search={exSearch}
            onSearchChange={setExSearch}
            equipment={exEquipment}
            onEquipmentChange={handleEquipmentChange}
            muscle={exMuscle}
            onMuscleChange={handleMuscleChange}
            allExercises={allExercisesFlat}
            resultCount={filteredExercises.length}
            onCreateCustom={() => setShowCreate(true)}
            onClearFilters={handleClearFilters}
            hasFilters={hasFilters}
          />
        </div>

        {/* Type filter row (unique to ExerciseBrowserModal) */}
        <div style={ebStyles.filterTabRow}>
          {typeLabels.map((label, idx) => (
            <button
              key={label}
              onClick={() => setExType(typeValues[idx] ?? 'All')}
              style={{
                ...ebStyles.filterChip,
                ...((typeValues[idx] === exType) ? ebStyles.filterChipActive : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div style={ebStyles.list}>
          {/* Recently used section */}
          {recentExercises.length > 0 && (
            <>
              <div style={ebStyles.sectionLabel}>Recently Used</div>
              {recentExercises.map(ex => (
                <ExerciseRow
                  key={`recent-${ex.id}`}
                  exercise={ex}
                  isRecent
                  onAdd={onSelect}
                  onDetail={setDetailExercise}
                />
              ))}
              <div style={ebStyles.divider} />
              <div style={ebStyles.sectionLabel}>
                All Exercises ({filteredExercises.length})
              </div>
            </>
          )}

          {!exerciseData && (
            <div style={ebStyles.loading}>Loading exercises...</div>
          )}

          {exerciseData && filteredExercises.length === 0 && (
            <div style={ebStyles.emptyState}>
              <div style={ebStyles.emptyIcon}>🏋️</div>
              <div style={ebStyles.emptyText}>No exercises match your filters</div>
              <button style={ebStyles.emptyCreate} onClick={() => setShowCreate(true)}>
                + Create Custom Exercise
              </button>
              {hasFilters && (
                <button style={ebStyles.emptyClear} onClick={handleClearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {filteredExercises.map(ex => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              onAdd={onSelect}
              onDetail={setDetailExercise}
            />
          ))}

          {/* Suggested exercises based on filter history */}
          {exerciseData && hasFilters && (
            <SuggestedExercises
              allExercises={allExercisesFlat}
              currentResultIds={currentResultIds}
              preferredEquipment={preferredEquipment}
              preferredMuscles={preferredMuscles}
              onSelect={ex => { onSelect(ex); onClose(); }}
            />
          )}
        </div>

        <button onClick={onClose} style={ebStyles.closeBtn}>Close</button>
      </div>

      {/* Exercise detail sheet */}
      {detailExercise && (
        <ExerciseDetailSheet
          exercise={detailExercise}
          onAdd={ex => { onSelect(ex); onClose(); }}
          onClose={() => setDetailExercise(null)}
        />
      )}

      {/* Create custom exercise sheet */}
      {showCreate && (
        <CreateExerciseSheet
          onSave={handleSaveCustom}
          onClose={() => setShowCreate(false)}
          allExercises={allExercisesFlat}
        />
      )}
    </>
  );
}

// ── Exercise row ──────────────────────────────────────────────────────────────

function ExerciseRow({
  exercise,
  isRecent = false,
  onAdd,
  onDetail,
}: {
  exercise: Exercise;
  isRecent?: boolean;
  onAdd: (ex: Exercise) => void;
  onDetail: (ex: Exercise) => void;
}) {
  const isCustom = (exercise as Exercise & { isCustom?: boolean }).isCustom === true;

  return (
    <div style={ebStyles.exerciseRow}>
      {/* Left: info (tap = detail view) */}
      <button style={ebStyles.exerciseInfo} onClick={() => onDetail(exercise)}>
        <div style={ebStyles.exerciseNameRow}>
          <span style={ebStyles.exerciseName}>{exercise.name}</span>
          {isRecent && <span style={ebStyles.recentBadge}>RECENT</span>}
          {isCustom && <span style={ebStyles.customBadge}>CUSTOM</span>}
        </div>
        <div style={ebStyles.exerciseMeta}>
          <span style={{ ...ebStyles.typeBadge, ...getTypeBadgeStyle(exercise.type) }}>
            {exercise.type}
          </span>
          <span style={ebStyles.metaSep}>·</span>
          <span style={ebStyles.metaText}>{exercise.muscle}</span>
          <span style={ebStyles.metaSep}>·</span>
          <span style={ebStyles.metaText}>{exercise.equipment === 'None' ? 'Bodyweight' : exercise.equipment}</span>
        </div>
      </button>

      {/* Right: add button */}
      <button style={ebStyles.addBtn} onClick={() => onAdd(exercise)} aria-label={`Add ${exercise.name}`}>
        +
      </button>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const ebStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 200,
  },
  sheet: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 201,
    background: 'linear-gradient(180deg, #1c1c1e 0%, #141414 100%)',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.2)',
    margin: '10px auto 0',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: `${spacing.md}px ${spacing.lg}px ${spacing.sm}px`,
    flexShrink: 0,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.black,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  createBtn: {
    padding: `${spacing.xs}px ${spacing.md}px`,
    borderRadius: radii.pill,
    border: `1px solid ${colors.primaryBorder}`,
    background: 'rgba(255,59,48,0.1)',
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  filterTabRow: {
    display: 'flex',
    gap: spacing.xs,
    padding: `0 ${spacing.lg}px`,
    marginBottom: spacing.xs,
    flexShrink: 0,
    alignItems: 'center',
    overflowX: 'auto' as const,
    scrollbarWidth: 'none' as const,
  },
  filterChip: {
    padding: `5px 12px`,
    borderRadius: radii.pill,
    border: `1px solid rgba(255,255,255,0.1)`,
    background: 'rgba(255,255,255,0.04)',
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  },
  filterChipActive: {
    background: 'rgba(255,59,48,0.12)',
    border: `1px solid rgba(255,59,48,0.4)`,
    color: colors.text,
  },
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: `0 ${spacing.lg}px`,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.textTertiary,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    padding: `${spacing.sm}px 0 ${spacing.xs}px`,
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    margin: `${spacing.sm}px 0`,
  },
  loading: {
    textAlign: 'center' as const,
    color: colors.textTertiary,
    padding: spacing.xl,
    fontSize: typography.sizes.sm,
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: `${spacing.xl}px 0`,
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  emptyCreate: {
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: radii.pill,
    border: `1px solid ${colors.primaryBorder}`,
    background: 'rgba(255,59,48,0.1)',
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
    marginBottom: spacing.sm,
  },
  emptyClear: {
    display: 'block',
    margin: '0 auto',
    padding: `${spacing.xs}px ${spacing.md}px`,
    border: 'none',
    background: 'transparent',
    color: colors.textTertiary,
    fontSize: typography.sizes.sm,
    cursor: 'pointer',
    textDecoration: 'underline' as const,
  },
  exerciseRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.sm}px 0`,
    borderBottom: `1px solid rgba(255,255,255,0.04)`,
  },
  exerciseInfo: {
    flex: 1,
    background: 'none',
    border: 'none',
    padding: 0,
    textAlign: 'left' as const,
    cursor: 'pointer',
    minWidth: 0,
  },
  exerciseNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  exerciseName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  recentBadge: {
    fontSize: '0.5rem',
    fontWeight: typography.weights.black,
    color: '#22c55e',
    padding: '1px 5px',
    borderRadius: 3,
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.3)',
    flexShrink: 0,
    letterSpacing: '0.06em',
  },
  customBadge: {
    fontSize: '0.5rem',
    fontWeight: typography.weights.black,
    color: '#a855f7',
    padding: '1px 5px',
    borderRadius: 3,
    background: 'rgba(168,85,247,0.12)',
    border: '1px solid rgba(168,85,247,0.3)',
    flexShrink: 0,
    letterSpacing: '0.06em',
  },
  exerciseMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'nowrap' as const,
  },
  typeBadge: {
    fontSize: '0.6rem',
    fontWeight: typography.weights.bold,
    padding: '1px 6px',
    borderRadius: 3,
    textTransform: 'capitalize' as const,
    letterSpacing: '0.03em',
    flexShrink: 0,
  },
  metaSep: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    border: `1px solid ${colors.primaryBorder}`,
    background: 'rgba(255,59,48,0.1)',
    color: colors.primary,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.black,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  closeBtn: {
    width: '100%',
    padding: `${spacing.md}px`,
    border: 'none',
    background: 'transparent',
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
    cursor: 'pointer',
    flexShrink: 0,
  },

  // Detail sheet
  sheetOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 210,
  },
  detailSheet: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 211,
    background: 'linear-gradient(180deg, #1f1f21 0%, #161616 100%)',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '80vh',
    overflowY: 'auto' as const,
    padding: `0 ${spacing.lg}px ${spacing.xl}px`,
  },
  detailHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.2)',
    margin: '10px auto 16px',
  },
  detailHeader: {
    marginBottom: spacing.lg,
  },
  detailName: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.black,
    color: colors.text,
    marginBottom: 8,
  },
  detailMeta: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
    alignItems: 'center',
  },
  detailEquip: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    background: 'rgba(255,255,255,0.06)',
    padding: '3px 10px',
    borderRadius: radii.pill,
  },
  detailMuscle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    background: 'rgba(255,255,255,0.06)',
    padding: '3px 10px',
    borderRadius: radii.pill,
  },
  detailSection: {
    marginBottom: spacing.lg,
  },
  detailSectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.textTertiary,
    letterSpacing: '0.08em',
    marginBottom: spacing.sm,
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  tag: {
    padding: '4px 10px',
    borderRadius: radii.pill,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  cueRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 8,
  },
  cueBullet: {
    color: '#22c55e',
    fontWeight: typography.weights.black,
    flexShrink: 0,
  },
  cueText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 1.5,
  },
  addBigBtn: {
    width: '100%',
    padding: `${spacing.md}px`,
    borderRadius: radii.md,
    border: 'none',
    background: 'linear-gradient(135deg, #ff3b30, #ff6b30)',
    color: '#fff',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
    cursor: 'pointer',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  cancelLink: {
    display: 'block',
    width: '100%',
    padding: `${spacing.sm}px`,
    border: 'none',
    background: 'transparent',
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
    cursor: 'pointer',
    textAlign: 'center' as const,
  },

  // Create form
  createTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.black,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  createField: {
    marginBottom: spacing.md,
  },
  createLabel: {
    display: 'block',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.textTertiary,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginBottom: spacing.xs,
  },
  createInput: {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: `${spacing.md}px`,
    borderRadius: radii.md,
    border: `1px solid rgba(255,255,255,0.1)`,
    background: 'rgba(255,255,255,0.06)',
    color: colors.text,
    fontSize: typography.sizes.lg,
    outline: 'none',
  },
  createSelect: {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    border: `1px solid rgba(255,255,255,0.1)`,
    background: 'rgba(255,255,255,0.06)',
    color: colors.text,
    fontSize: typography.sizes.base,
    outline: 'none',
    appearance: 'none' as const,
  },
  typeRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
  },
  typePill: {
    padding: `${spacing.xs}px ${spacing.md}px`,
    borderRadius: radii.pill,
    border: `1px solid rgba(255,255,255,0.1)`,
    background: 'transparent',
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
    textTransform: 'capitalize' as const,
  },
  typePillActive: {
    background: 'rgba(255,59,48,0.12)',
    border: `1px solid rgba(255,59,48,0.4)`,
    color: colors.text,
  },
};

