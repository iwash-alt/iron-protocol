import React from 'react';
import { S, css } from '../styles';
import Icon from '../components/Icon';

export default function QuickWorkoutActive({ workout, currentIdx, timer, isResting, onCancel }) {
  const ex = workout.exercises[currentIdx];
  return (
    <div style={S.container}>
      <div style={S.quickActive}>
        <div style={S.qaHeader}>
          <h2 style={S.qaTitle}>{workout.name}</h2>
          <button onClick={onCancel} style={S.iconBtn}><Icon name="close" /></button>
        </div>
        <div style={S.qaDots}>
          {workout.exercises.map((_, i) => (
            <div key={i} style={{ ...S.qaDot, background: i < currentIdx ? '#34C759' : i === currentIdx ? '#FF3B30' : '#333' }} />
          ))}
        </div>
        <div style={S.qaMain}>
          <div style={{ ...S.qaCircle, borderColor: isResting ? '#34C759' : '#FF3B30' }}>
            <div style={S.qaTime}>{timer}</div>
            <div style={S.qaLabel}>{isResting ? 'REST' : 'WORK'}</div>
          </div>
          <h3 style={S.qaExName}>{isResting ? 'Get Ready...' : ex?.name?.toUpperCase()}</h3>
        </div>
      </div>
      <style>{css}</style>
    </div>
  );
}
