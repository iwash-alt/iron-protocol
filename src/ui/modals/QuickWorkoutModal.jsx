import React from 'react';
import { S } from '../styles';
import Icon from '../components/Icon';
import { quickTemplates } from '../../domain/templates';

export default function QuickWorkoutModal({ onStart, onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <h2 style={S.modalTitle}>Quick Workouts</h2>
        <p style={S.modalSub}>No equipment &bull; 15-25 min</p>
        <div style={S.quickList}>
          {quickTemplates.map(t => (
            <button key={t.id} onClick={() => onStart(t)} style={S.quickCard}>
              <div>
                <div style={S.quickName}>{t.name}</div>
                <div style={S.quickMeta}>{t.duration} min &bull; {t.exercises.length} exercises</div>
              </div>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
