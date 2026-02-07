import React, { useState } from 'react';
import { S } from '../styles';

export default function MeasurementsModal({ onSave, onClose, currentWeight }) {
  const [data, setData] = useState({
    weight: currentWeight || 80, bodyFat: '', chest: '', waist: '', arms: '', thighs: '',
  });
  const upd = (k, v) => setData(d => ({ ...d, [k]: v }));

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.measureModal} onClick={e => e.stopPropagation()}>
        <h3 style={S.measureTitle}>Log Measurements</h3>
        <p style={S.measureSub}>Track your body composition</p>
        <div style={S.measureGrid}>
          {[['weight', 'Weight (kg)'], ['bodyFat', 'Body Fat %'], ['chest', 'Chest (cm)'], ['waist', 'Waist (cm)'], ['arms', 'Arms (cm)'], ['thighs', 'Thighs (cm)']].map(([k, l]) => (
            <div key={k} style={S.measureField}>
              <label style={S.measureLabel}>{l}</label>
              <input type="number" value={data[k]} onChange={e => upd(k, e.target.value)}
                style={S.measureInput} placeholder={k === 'weight' ? '' : 'Optional'} />
            </div>
          ))}
        </div>
        <button onClick={() => onSave(data)} style={S.measureSave}>SAVE MEASUREMENTS</button>
        <button onClick={onClose} style={S.measureCancel}>CANCEL</button>
      </div>
    </div>
  );
}
