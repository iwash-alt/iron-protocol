import React from 'react';
import { S } from '../styles';
import { exercises } from '../../domain/exercises';

export default function AddExerciseModal({ dayName, onAdd, onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.addExModal} onClick={e => e.stopPropagation()}>
        <h3 style={S.addExTitle}>Add Exercise</h3>
        <p style={S.addExSub}>Add to {dayName}</p>
        <div style={S.addExList}>
          {exercises.filter(e => !e.bodyweight).map(ex => (
            <button key={ex.id} onClick={() => onAdd(ex)} style={S.addExItem}>
              <div>
                <div style={S.addExName}>{ex.name}</div>
                <div style={S.addExMeta}>{ex.muscle} &bull; {ex.equipment}</div>
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
