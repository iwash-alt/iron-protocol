import React, { useState } from 'react';
import { S } from '@/shared/theme/styles';

interface MeasurementsModalProps {
  currentWeight: number;
  onSave: (data: { weight: number; bodyFat: string; chest: string; waist: string; arms: string; thighs: string }) => void;
  onClose: () => void;
}

export function MeasurementsModal({ currentWeight, onSave, onClose }: MeasurementsModalProps) {
  const [data, setData] = useState({
    weight: currentWeight || 80,
    bodyFat: '',
    chest: '',
    waist: '',
    arms: '',
    thighs: '',
  });

  const upd = (key: keyof typeof data, value: string | number) => {
    setData(d => ({ ...d, [key]: value }));
  };

  const fields: [string, string][] = [
    ['weight', 'Weight (kg)'],
    ['bodyFat', 'Body Fat %'],
    ['chest', 'Chest (cm)'],
    ['waist', 'Waist (cm)'],
    ['arms', 'Arms (cm)'],
    ['thighs', 'Thighs (cm)'],
  ];

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.measureModal} onClick={e => e.stopPropagation()}>
        <h3 style={S.measureTitle}>Log Measurements</h3>
        <p style={S.measureSub}>Track your body composition</p>
        <div style={S.measureGrid}>
          {fields.map(([key, label]) => (
            <div key={key} style={S.measureField}>
              <label style={S.measureLabel}>{label}</label>
              <input
                type="number"
                value={data[key as keyof typeof data]}
                onChange={e => upd(key as keyof typeof data, key === 'weight' ? +e.target.value : e.target.value)}
                style={S.measureInput}
                placeholder={key === 'weight' ? '' : 'Optional'}
              />
            </div>
          ))}
        </div>
        <button onClick={() => onSave(data)} style={S.measureSave}>SAVE MEASUREMENTS</button>
        <button onClick={onClose} style={S.measureCancel}>CANCEL</button>
      </div>
    </div>
  );
}
