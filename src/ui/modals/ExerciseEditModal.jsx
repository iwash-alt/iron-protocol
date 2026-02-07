import React from 'react';
import { S } from '../styles';
import Icon from '../components/Icon';

export default function ExerciseEditModal({ exercise, onUpdate, onRemove, onClose }) {
  if (!exercise) return null;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.editModal} onClick={e => e.stopPropagation()}>
        <h3 style={S.editTitle}>{exercise.exercise.name}</h3>
        {['sets', 'reps', 'weight', 'rest'].map(f => (
          <div key={f} style={S.editField}>
            <label style={S.editLabel}>
              {f === 'sets' ? 'Sets' : f === 'reps' ? 'Reps' : f === 'weight' ? 'Weight (kg)' : 'Rest (sec)'}
            </label>
            <div style={S.editControls}>
              <button onClick={() => onUpdate(exercise.id, f,
                Math.max(
                  f === 'rest' ? 30 : f === 'weight' ? 0 : (f === 'reps' ? (exercise.repsMin ?? 1) : 1),
                  exercise[f] - (f === 'weight' ? 2.5 : f === 'rest' ? 15 : 1)
                )
              )} style={S.editBtn2}><Icon name="minus" size={16} /></button>
              <span style={S.editValue}>{exercise[f]}{f === 'rest' ? 's' : ''}</span>
              <button onClick={() => onUpdate(exercise.id, f,
                Math.min(
                  f === 'sets' ? 10 : (f === 'reps' ? (exercise.repsMax ?? 30) : f === 'rest' ? 300 : 500),
                  exercise[f] + (f === 'weight' ? 2.5 : f === 'rest' ? 15 : 1)
                )
              )} style={S.editBtn2}><Icon name="plus" size={16} /></button>
            </div>
          </div>
        ))}
        <button onClick={onClose} style={S.editDone}>DONE</button>
        <button onClick={() => onRemove(exercise.id)} style={S.editRemove}>REMOVE EXERCISE</button>
      </div>
    </div>
  );
}
