import React, { useMemo } from 'react';
import { FRONT_MUSCLE_PATHS, BACK_MUSCLE_PATHS, MUSCLE_LABELS } from '@/data/muscleMapPaths';

type MuscleView = 'front' | 'back' | 'both';

interface Props {
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  view?: MuscleView;
}

const resolveKey = (name: string) => name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');

function BodyView({ paths, primary, secondary, label }: { paths: Record<string, string>; primary: Set<string>; secondary: Set<string>; label: string }) {
  return (
    <div style={{ width: 180 }}>
      <div style={{ color: '#8E99A8', fontSize: 11, textAlign: 'center', marginBottom: 4 }}>{label}</div>
      <svg viewBox="0 0 140 190" width="100%" style={{ background: '#0d1118', borderRadius: 12 }}>
        <style>{`@keyframes muscle-fade{from{opacity:0}to{opacity:1}}`}</style>
        <circle cx="70" cy="18" r="12" fill="#1f2630" />
        <rect x="46" y="32" width="48" height="72" rx="20" fill="#1f2630" />
        <rect x="26" y="46" width="16" height="52" rx="8" fill="#1f2630" />
        <rect x="98" y="46" width="16" height="52" rx="8" fill="#1f2630" />
        <rect x="50" y="102" width="18" height="76" rx="10" fill="#1f2630" />
        <rect x="72" y="102" width="18" height="76" rx="10" fill="#1f2630" />
        {Object.entries(paths).map(([key, d]) => {
          const isPrimary = primary.has(key);
          const isSecondary = secondary.has(key);
          const fill = isPrimary ? 'rgba(204,0,0,0.8)' : isSecondary ? 'rgba(255,149,0,0.5)' : '#333333';
          return <path key={key} d={d} fill={fill} style={{ animation: 'muscle-fade 500ms ease' }}><title>{MUSCLE_LABELS[key]}</title></path>;
        })}
      </svg>
    </div>
  );
}

export function MuscleMap({ primaryMuscles, secondaryMuscles = [], view = 'both' }: Props) {
  const primary = useMemo(() => new Set(primaryMuscles.map(resolveKey)), [primaryMuscles]);
  const secondary = useMemo(() => new Set(secondaryMuscles.map(resolveKey)), [secondaryMuscles]);

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {(view === 'front' || view === 'both') && <BodyView paths={FRONT_MUSCLE_PATHS} primary={primary} secondary={secondary} label="Front" />}
      {(view === 'back' || view === 'both') && <BodyView paths={BACK_MUSCLE_PATHS} primary={primary} secondary={secondary} label="Back" />}
    </div>
  );
}

export default MuscleMap;
