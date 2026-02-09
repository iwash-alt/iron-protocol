import React from 'react';
import { Icon } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { quickTemplates } from '@/data/quick-templates';
import type { QuickTemplate } from '@/data/quick-templates';

interface QuickWorkoutListProps {
  onSelect: (template: QuickTemplate) => void;
  onClose: () => void;
  inline?: boolean;
}

export function QuickWorkoutList({ onSelect, onClose, inline }: QuickWorkoutListProps) {
  const content = (
    <>
      <h2 style={{ ...S.modalTitle, textAlign: inline ? 'left' : 'center' } as any}>Quick Workouts</h2>
      <p style={{ ...S.modalSub, textAlign: inline ? 'left' : 'center', marginBottom: 20 } as any}>No equipment · 15-25 min</p>
      <div style={S.quickList}>
        {quickTemplates.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            style={{
              ...S.quickCard,
              minHeight: 64,
              ...(inline ? { animation: `fadeInUp 0.35s ease ${i * 0.05}s both` } : {}),
            }}
          >
            <div>
              <div style={S.quickName}>{t.name}</div>
              <div style={S.quickMeta}>{t.duration} min · {t.exercises.length} exercises</div>
            </div>
            <Icon name="arrow" />
          </button>
        ))}
      </div>
    </>
  );

  if (inline) {
    return <div style={{ paddingTop: 8 }}>{content}</div>;
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        {content}
      </div>
    </div>
  );
}
