import React from 'react';
import { S } from '../styles';

export default function RPEModal({ showRPE, onConfirm, onCancel }) {
  if (!showRPE) return null;
  return (
    <div style={S.overlay}>
      <div style={S.rpeModal}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>&#x1F4AA;</div>
        <h3 style={S.rpeTitle}>Set {showRPE.setNum} Complete!</h3>
        <p style={S.rpeSubtitle}>{showRPE.exercise.exercise.name}</p>
        <p style={S.rpeQuestion}>How hard was that?</p>
        <div style={S.rpeGrid}>
          {[6, 7, 8, 9, 10].map(rpe => (
            <button key={rpe} onClick={() => onConfirm(rpe)}
              style={{ ...S.rpeBtn, background: rpe <= 7 ? '#34C759' : rpe === 8 ? '#FF9500' : '#FF3B30' }}>
              <div style={S.rpeNum}>{rpe}</div>
              <div style={S.rpeLabel}>
                {rpe === 6 ? 'Easy' : rpe === 7 ? 'Moderate' : rpe === 8 ? 'Hard' : rpe === 9 ? 'Very Hard' : 'Failed'}
              </div>
            </button>
          ))}
        </div>
        <p style={S.rpeHint}>RPE 6-8 = progression &bull; RPE 10 = reduce weight</p>
        <button onClick={onCancel} style={S.rpeCancel}>CANCEL</button>
      </div>
    </div>
  );
}
