import React from 'react';
import { S } from '../styles';
import { exercises } from '../../domain/exercises';

export default function SwapExerciseModal({ showSwap, onSwap, onClose }) {
  if (!showSwap) return null;
  const alternatives = exercises.filter(e => e.muscle === showSwap.exercise.muscle && e.id !== showSwap.exercise.id);
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.swapBox} onClick={e => e.stopPropagation()}>
        <h3 style={S.swapTitle}>Swap Exercise</h3>
        <p style={S.swapSub}>Replacing: {showSwap.exercise.name}</p>
        <div style={S.swapList}>
          {alternatives.map(ex => (
            <button key={ex.id} onClick={() => onSwap(showSwap.id, ex)} style={S.swapItem}>
              <div>
                <div style={S.swapItemName}>{ex.name}</div>
                <div style={S.swapItemMeta}>{ex.equipment}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
