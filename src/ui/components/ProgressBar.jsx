import React from 'react';
import { S } from '../styles';

export default function ProgressBar({ progress }) {
  return (
    <div style={S.progBar}>
      <div style={S.progHeader}>
        <span style={S.progLabel}>WORKOUT PROGRESS</span>
        <span style={S.progPct}>{progress}%</span>
      </div>
      <div style={S.progTrack}>
        <div style={{ ...S.progFill, width: `${progress}%` }} />
      </div>
    </div>
  );
}
