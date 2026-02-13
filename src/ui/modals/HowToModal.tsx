import React, { useMemo, useState } from 'react';
import type { Exercise } from '@/shared/types';
import { ExerciseAnimation } from '@/ui/components/ExerciseAnimation';
import { MuscleMap } from '@/ui/components/MuscleMap';
import { EXERCISE_ANIMATION_BY_NAME } from '@/data/animations';

interface Props {
  exercise: Exercise;
  onClose: () => void;
}

export function HowToModal({ exercise, onClose }: Props) {
  const [paused, setPaused] = useState(false);
  const [view, setView] = useState<'front' | 'side'>('side');
  const animationId = exercise.animationId || EXERCISE_ANIMATION_BY_NAME[exercise.name];
  const primary = exercise.primaryMuscles?.length ? exercise.primaryMuscles : [exercise.muscle];
  const tips = useMemo(() => [
    'Use controlled reps and own the bottom position.',
    'Stop 1–2 reps before technical breakdown.',
  ], []);

  return (
    <div style={st.backdrop} onClick={onClose}>
      <div style={st.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={st.handle} />
        <button onClick={onClose} style={st.close}>✕</button>
        <h3 style={st.title}>{exercise.name}</h3>

        <section style={st.section}>
          <ExerciseAnimation animationId={animationId} paused={paused} forceView={view} />
          <div style={st.row}>
            <button style={st.toggle} onClick={() => setView('side')} aria-pressed={view === 'side'}>Side View</button>
            <button style={st.toggle} onClick={() => setView('front')} aria-pressed={view === 'front'}>Front View</button>
            <button style={st.play} onClick={() => setPaused(p => !p)}>{paused ? 'Play' : 'Pause'}</button>
          </div>
        </section>

        <section style={st.section}>
          <MuscleMap view="both" primaryMuscles={primary} secondaryMuscles={exercise.secondaryMuscles} />
          <p style={st.meta}><strong>Primary:</strong> {primary.join(', ')}</p>
          <p style={st.meta}><strong>Secondary:</strong> {exercise.secondaryMuscles.join(', ') || '—'}</p>
        </section>

        <section style={{ ...st.section, marginBottom: 90 }}>
          <h4 style={st.h}>Form Cues</h4>
          <ul>{exercise.formCues.slice(0, 3).map(c => <li key={c} style={st.li}>• {c}</li>)}</ul>
          <h4 style={st.h}>Common Mistakes</h4>
          <ul>{exercise.commonMistakes.slice(0, 2).map(c => <li key={c} style={st.err}>✘ {c}</li>)}</ul>
          <h4 style={st.h}>Tips</h4>
          <ul>{tips.map(c => <li key={c} style={st.tip}>★ {c}</li>)}</ul>
        </section>
      </div>
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  backdrop: { position: 'fixed', inset: 0, zIndex: 130, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end' },
  sheet: { width: 'min(100%, 560px)', maxHeight: '92vh', overflowY: 'auto', margin: '0 auto', background: '#10151d', borderTopLeftRadius: 20, borderTopRightRadius: 20, border: '1px solid #243040', padding: 14, position: 'relative' },
  handle: { width: 38, height: 4, borderRadius: 3, background: '#4A5565', margin: '0 auto 10px' },
  close: { position: 'absolute', right: 10, top: 8, border: 'none', background: 'transparent', color: '#DDE6F2', fontSize: 22 },
  title: { color: '#fff', margin: '0 0 8px' },
  section: { border: '1px solid #222c39', background: '#0b1118', borderRadius: 12, padding: 10, marginBottom: 10 },
  row: { display: 'flex', gap: 8, marginTop: 8 },
  toggle: { background: '#1b2634', color: '#d6e1f0', border: '1px solid #2c3a4e', borderRadius: 8, padding: '6px 10px' },
  play: { marginLeft: 'auto', background: '#243447', color: '#fff', border: '1px solid #3c556f', borderRadius: 8, padding: '6px 12px' },
  meta: { color: '#b8c3d1', margin: '4px 0', fontSize: 13 },
  h: { color: '#dce6f2', margin: '8px 0 6px' },
  li: { color: '#cad4e1', marginBottom: 4, listStyle: 'none' },
  err: { color: '#ff9b9b', marginBottom: 4, listStyle: 'none' },
  tip: { color: '#ffd27f', marginBottom: 4, listStyle: 'none' },
};

export default HowToModal;
