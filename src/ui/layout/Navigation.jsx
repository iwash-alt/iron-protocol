import React from 'react';
import { S } from '../styles';
import Icon from '../components/Icon';

export default function Navigation({ view, onSetView, onShowQuick }) {
  return (
    <nav style={S.nav}>
      <button onClick={() => onSetView('workout')} style={{ ...S.navBtn, ...(view === 'workout' ? S.navActive : {}) }}>
        <Icon name="dumbbell" size={16} /> WORKOUT
      </button>
      <button onClick={onShowQuick} style={S.navQuick}>
        <Icon name="lightning" size={16} /> QUICK
      </button>
      <button onClick={() => onSetView('stats')} style={{ ...S.navBtn, ...(view === 'stats' ? S.navActive : {}) }}>
        <Icon name="chart" size={16} /> STATS
      </button>
    </nav>
  );
}
