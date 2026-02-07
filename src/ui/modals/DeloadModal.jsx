import React from 'react';
import { S } from '../styles';

export default function DeloadModal({ weekCount, onReset, onDismiss }) {
  return (
    <div style={S.overlay}>
      <div style={S.deloadBox}>
        <div style={{ fontSize: 48 }}>&#x1F634;</div>
        <h3 style={S.deloadTitle}>Time for a Deload!</h3>
        <p style={S.deloadText}>You've trained hard for {weekCount} weeks. Consider:</p>
        <ul style={S.deloadList}>
          <li>Reduce weight 40-50%</li>
          <li>Keep sets/reps the same</li>
          <li>Focus on form &amp; recovery</li>
        </ul>
        <button onClick={onReset} style={S.deloadBtn}>GOT IT</button>
        <button onClick={onDismiss} style={S.deloadSkip}>KEEP PUSHING</button>
      </div>
    </div>
  );
}
