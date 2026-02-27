import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Exercise, EquipmentFilter, MuscleFilter, ExerciseType, MuscleGroup, Equipment } from '@/shared/types';
import {
  EQUIPMENT_FILTER_OPTIONS,
  MUSCLE_FILTER_OPTIONS,
} from '@/shared/types';
import type { CustomExercise } from '@/shared/types/exercise';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { loadCustomExercises, saveCustomExercises } from '@/shared/storage';

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

function FilterScroll({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={ebStyles.filterScroll}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            ...ebStyles.filterChip,
            ...(value === opt ? ebStyles.filterChipActive : {}),
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

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
}: {
  onSave: (ex: CustomExercise) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup>('Chest');
  const [equipment, setEquipment] = useState<Equipment>('Barbell');
  const [type, setType] = useState<ExerciseType>('compound');

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
      secondaryMuscles: [],
      formCues: [],
      commonMistakes: [],
      isCustom: true,
    };
    onSave(custom);
  }, [name, muscle, equipment, type, onSave]);

  return (
    <>
      <div style={ebStyles.sheetOverlay} onClick={onClose} />
      <div style={ebStyles.detailSheet}>
        <div style={ebStyles.detailHandle} />
        <div style={ebStyles.createTitle}>Create Custom Exercise</div>

        <div style={ebStyles.createField}>
          <label style={ebStyles.createLabel}>Exercise Name</label>
          <input
            type="text"
            value={name}
            placeholder="e.g. Meadows Row"
            maxLength={50}
            autoFocus
            onChange={e => setName(e.target.value)}
            style={ebStyles.createInput}
          />
        </div>

        <div style={ebStyles.createField}>
          <label style={ebStyles.createLabel}>Primary Muscle</label>
          <select
            value={muscle}
            onChange={e => setMuscle(e.target.value as MuscleGroup)}
            style={ebStyles.createSelect}
          >
            {CREATE_MUSCLE_OPTIONS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div style={ebStyles.createField}>
          <label style={ebStyles.createLabel}>Equipment</label>
          <select
            value={equipment}
            onChange={e => setEquipment(e.target.value as Equipment)}
            style={ebStyles.createSelect}
          >
            {CREATE_EQUIPMENT_OPTIONS.map(eq => (
              <option key={eq} value={eq}>{eq === 'None' ? 'Bodyweight / No Equipment' : eq}</option>
            ))}
          </select>
        </div>

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

        <button
          style={{ ...ebStyles.addBigBtn, opacity: name.trim() ? 1 : 0.5 }}
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
  const [activeFilterRow, setActiveFilterRow] = useState<'equipment' | 'muscle' | 'type'>('equipment');
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [showCreate, setShowCreate] = useState(false);

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

  const equipmentLabels = ['All', ...EQUIPMENT_FILTER_OPTIONS];
  const muscleLabels = ['All', ...MUSCLE_FILTER_OPTIONS];
  const typeLabels = TYPE_OPTIONS.map(t => t.label);
  const typeValues = TYPE_OPTIONS.map(t => t.value);

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

        {/* Search */}
        <div style={ebStyles.searchWrap}>
          <span style={ebStyles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search exercises..."
            value={exSearch}
            onChange={e => setExSearch(e.target.value)}
            style={ebStyles.searchInput}
          />
          {exSearch && (
            <button style={ebStyles.searchClear} onClick={() => setExSearch('')}>✕</button>
          )}
        </div>

        {/* Filter row selector */}
        <div style={ebStyles.filterTabRow}>
          {(['equipment', 'muscle', 'type'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilterRow(tab)}
              style={{
                ...ebStyles.filterTab,
                ...(activeFilterRow === tab ? ebStyles.filterTabActive : {}),
              }}
            >
              {tab === 'equipment' ? 'Equipment' : tab === 'muscle' ? 'Muscle' : 'Type'}
              {(tab === 'equipment' && exEquipment !== 'All') ||
               (tab === 'muscle' && exMuscle !== 'All') ||
               (tab === 'type' && exType !== 'All') ? (
                 <span style={ebStyles.filterDot} />
               ) : null}
            </button>
          ))}
          {hasFilters && (
            <button style={ebStyles.clearBtn} onClick={handleClearFilters}>Clear</button>
          )}
        </div>

        {/* Active filter row */}
        {activeFilterRow === 'equipment' && (
          <FilterScroll
            options={equipmentLabels}
            value={exEquipment}
            onChange={v => setExEquipment(v as EquipmentFilter | 'All')}
          />
        )}
        {activeFilterRow === 'muscle' && (
          <FilterScroll
            options={muscleLabels}
            value={exMuscle}
            onChange={v => setExMuscle(v as MuscleFilter | 'All')}
          />
        )}
        {activeFilterRow === 'type' && (
          <FilterScroll
            options={typeLabels}
            value={TYPE_OPTIONS.find(t => t.value === exType)?.label ?? 'All Types'}
            onChange={label => {
              const idx = typeLabels.indexOf(label);
              if (idx >= 0) setExType(typeValues[idx] ?? 'All');
            }}
          />
        )}

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
            <div style={ebStyles.empty}>
              <div style={ebStyles.emptyIcon}>🏋️</div>
              <div style={ebStyles.emptyText}>No exercises match</div>
              <button style={ebStyles.emptyCreate} onClick={() => setShowCreate(true)}>
                Create Custom Exercise
              </button>
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
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    margin: `0 ${spacing.lg}px ${spacing.sm}px`,
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    border: `1px solid rgba(255,255,255,0.1)`,
    background: 'rgba(255,255,255,0.06)',
    flexShrink: 0,
  },
  searchIcon: {
    fontSize: 14,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: colors.text,
    fontSize: typography.sizes.base,
  },
  searchClear: {
    background: 'none',
    border: 'none',
    color: colors.textTertiary,
    cursor: 'pointer',
    fontSize: 14,
    padding: 0,
    flexShrink: 0,
  },
  filterTabRow: {
    display: 'flex',
    gap: spacing.xs,
    padding: `0 ${spacing.lg}px`,
    marginBottom: spacing.xs,
    flexShrink: 0,
    alignItems: 'center',
  },
  filterTab: {
    padding: `${spacing.xs}px ${spacing.md}px`,
    borderRadius: radii.pill,
    border: `1px solid rgba(255,255,255,0.08)`,
    background: 'transparent',
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
    position: 'relative' as const,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  filterTabActive: {
    background: 'rgba(255,255,255,0.1)',
    border: `1px solid rgba(255,255,255,0.2)`,
    color: colors.text,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: colors.primary,
    display: 'inline-block',
  },
  clearBtn: {
    marginLeft: 'auto' as const,
    padding: `${spacing.xs}px ${spacing.sm}px`,
    borderRadius: radii.pill,
    border: 'none',
    background: 'transparent',
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
  },
  filterScroll: {
    display: 'flex',
    gap: 6,
    overflowX: 'auto' as const,
    padding: `${spacing.xs}px ${spacing.lg}px`,
    marginBottom: spacing.xs,
    flexShrink: 0,
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
  empty: {
    textAlign: 'center' as const,
    padding: `${spacing.xl}px 0`,
  },
  emptyIcon: { fontSize: 40, marginBottom: spacing.sm },
  emptyText: { color: colors.textSecondary, fontSize: typography.sizes.base, marginBottom: spacing.md },
  emptyCreate: {
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: radii.pill,
    border: `1px solid ${colors.primaryBorder}`,
    background: 'rgba(255,59,48,0.1)',
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    cursor: 'pointer',
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

