import React from 'react';
import { S } from '../styles';
import { formatTime } from '../../analytics/stats';

export default function RestBanner({ restTime, onSkip }) {
  if (restTime <= 0) return null;
  return (
    <div style={S.restBanner}>
      <div>
        <div style={S.restLabel}>REST TIME</div>
        <div style={S.restTime}>{formatTime(restTime)}</div>
      </div>
      <button onClick={onSkip} style={S.skipBtn}>SKIP</button>
    </div>
  );
}
