import React from 'react';
import { S } from '../styles';
import MiniChart from '../components/MiniChart';

export default function ExerciseHistoryModal({ exerciseName, history, onClose }) {
  if (!exerciseName) return null;
  const entries = history[exerciseName];
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.historyModal} onClick={e => e.stopPropagation()}>
        <h3 style={S.historyTitle}>{exerciseName}</h3>
        <p style={S.historySub}>Weight Progression</p>
        {entries?.length > 0 ? (
          <>
            <MiniChart data={entries.slice(-10).map(h => h.weight)} color="#FF3B30" height={80} />
            <div style={S.historyList}>
              {entries.slice(-10).reverse().map((h, i) => (
                <div key={i} style={S.historyItem}>
                  <span style={{ color: '#888' }}>{h.date}</span>
                  <span style={S.historyWeight}>{h.weight}kg &times; {h.reps}</span>
                  <span style={S.historyE1rm}>~{h.e1rm}kg</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>No history yet</p>
        )}
        <button onClick={onClose} style={S.historyClose}>CLOSE</button>
      </div>
    </div>
  );
}
