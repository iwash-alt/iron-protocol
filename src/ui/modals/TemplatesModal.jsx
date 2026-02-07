import React from 'react';
import { S } from '../styles';
import { workoutTemplates } from '../../domain/templates';

export default function TemplatesModal({ onApply, onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.templatesModal} onClick={e => e.stopPropagation()}>
        <h2 style={S.templatesTitle}>Choose Template</h2>
        <p style={S.templatesSub}>This will reset your workout plan</p>
        <div style={S.templatesList}>
          {Object.values(workoutTemplates).map(t => (
            <button key={t.id} onClick={() => onApply(t.id)} style={S.templateCard}>
              <div style={S.templateInfo}>
                <div style={S.templateName}>{t.name}</div>
                <div style={S.templateDesc}>{t.description}</div>
                <div style={S.templateDays}>{t.days.length} days/week</div>
              </div>
              <div style={S.templateArrow}>&rarr;</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={S.templatesCancel}>CANCEL</button>
      </div>
    </div>
  );
}
