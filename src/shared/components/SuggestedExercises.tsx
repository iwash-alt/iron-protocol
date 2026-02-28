import React, { useMemo } from 'react';
import type { Exercise } from '@/shared/types';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';

interface SuggestedExercisesProps {
  allExercises: Exercise[];
  currentResultIds: Set<string>;
  preferredEquipment: string[];
  preferredMuscles: string[];
  onSelect: (exercise: Exercise) => void;
}

const MAX_SUGGESTIONS = 5;

export function SuggestedExercises({
  allExercises,
  currentResultIds,
  preferredEquipment,
  preferredMuscles,
  onSelect,
}: SuggestedExercisesProps) {
  const suggestions = useMemo(() => {
    if (preferredEquipment.length === 0 && preferredMuscles.length === 0) return [];

    const equipSet = new Set(preferredEquipment.map(e => e.toLowerCase()));
    const muscleSet = new Set(preferredMuscles.map(m => m.toLowerCase()));

    const scored = allExercises
      .filter(ex => !currentResultIds.has(ex.id))
      .map(ex => {
        let score = 0;
        const eqLower = ex.equipment.toLowerCase();
        const muscleLower = ex.muscle.toLowerCase();
        if (equipSet.has(eqLower)) score += 2;
        if (muscleSet.has(muscleLower)) score += 2;
        // Partial equipment match (e.g. 'machine' in 'machine (pin/stack)')
        for (const pref of equipSet) {
          if (eqLower.includes(pref) && !equipSet.has(eqLower)) score += 1;
        }
        return { exercise: ex, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SUGGESTIONS)
      .map(item => item.exercise);

    return scored;
  }, [allExercises, currentResultIds, preferredEquipment, preferredMuscles]);

  if (suggestions.length === 0) return null;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>SUGGESTED FOR YOU</div>
      {suggestions.map(ex => (
        <button
          key={ex.id}
          type="button"
          style={itemStyle}
          onClick={() => onSelect(ex)}
        >
          <div>
            <div style={nameStyle}>{ex.name}</div>
            <div style={metaStyle}>
              {ex.muscle} · {ex.equipment === 'None' ? 'Bodyweight' : ex.equipment}
            </div>
          </div>
          <div style={addStyle}>+</div>
        </button>
      ))}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  marginTop: spacing.md,
  paddingTop: spacing.sm,
  borderTop: '1px solid rgba(255,255,255,0.06)',
};

const headerStyle: React.CSSProperties = {
  fontSize: typography.sizes.xs,
  fontWeight: 800,
  color: colors.textTertiary,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: `${spacing.sm}px 0 ${spacing.xs}px`,
};

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: `${spacing.sm}px 0`,
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  background: 'none',
  border: 'none',
  borderBlockEnd: '1px solid rgba(255,255,255,0.04)',
  cursor: 'pointer',
  textAlign: 'left',
};

const nameStyle: React.CSSProperties = {
  fontSize: typography.sizes.base,
  fontWeight: 700,
  color: colors.text,
};

const metaStyle: React.CSSProperties = {
  fontSize: typography.sizes.xs,
  color: colors.textTertiary,
  marginTop: 2,
};

const addStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: radii.sm,
  border: `1px solid ${colors.primaryBorder}`,
  background: 'rgba(255,59,48,0.1)',
  color: colors.primary,
  fontSize: typography.sizes.lg,
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};
