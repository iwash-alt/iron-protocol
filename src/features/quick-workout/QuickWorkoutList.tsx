import React from 'react';
import { Icon } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { quickTemplates } from '@/data/quick-templates';
import type { QuickTemplate } from '@/data/quick-templates';

interface QuickWorkoutListProps {
  onSelect: (template: QuickTemplate) => void;
  onClose: () => void;
}

export function QuickWorkoutList({ onSelect, onClose }: QuickWorkoutListProps) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <h2 style={S.modalTitle}>Quick Workouts</h2>
        <p style={S.modalSub}>No equipment · 15-25 min</p>
        <div style={S.quickList}>
          {quickTemplates.map(t => (
            <button key={t.id} onClick={() => onSelect(t)} style={S.quickCard}>
              <div>
                <div style={S.quickName}>{t.name}</div>
                <div style={S.quickMeta}>{t.duration} min · {t.exercises.length} exercises</div>
              </div>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
