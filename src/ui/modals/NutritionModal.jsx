import React from 'react';
import { S } from '../styles';
import { proteinSources } from '../../domain/nutrition';

export default function NutritionModal({ todayWater, waterGoal, todayProtein, proteinGoal, onSetWater, onAddWater, onAddProtein, onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.nutritionModal} onClick={e => e.stopPropagation()}>
        <h3 style={S.nutritionTitle}>Today's Nutrition</h3>
        <div style={S.nutritionSection}>
          <div style={S.nutritionSectionHeader}>
            <span>&#x1F4A7; Water</span>
            <span style={S.nutritionProgress}>{todayWater}/{waterGoal}</span>
          </div>
          <div style={S.waterTrack}>
            {[...Array(waterGoal)].map((_, i) => (
              <div key={i}
                style={{ ...S.waterGlass, background: i < todayWater ? '#3B82F6' : 'rgba(255,255,255,0.08)' }}
                onClick={() => onSetWater(i + 1)} />
            ))}
          </div>
          <button onClick={onAddWater} style={S.addWaterBtn}>+ ADD GLASS</button>
        </div>
        <div style={S.nutritionSection}>
          <div style={S.nutritionSectionHeader}>
            <span>&#x1F969; Protein</span>
            <span style={S.nutritionProgress}>{todayProtein}/{proteinGoal}g</span>
          </div>
          <div style={S.proteinBar}>
            <div style={{ ...S.proteinFill, width: `${Math.min(100, (todayProtein / proteinGoal) * 100)}%` }} />
          </div>
          <div style={S.proteinGrid}>
            {proteinSources.map(src => (
              <button key={src.name} onClick={() => onAddProtein(src)} style={S.proteinBtn}>
                <span style={S.proteinBtnIcon}>{src.icon}</span>
                <span style={S.proteinBtnName}>{src.name}</span>
                <span style={S.proteinBtnVal}>+{src.protein}g</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={onClose} style={S.nutritionClose}>DONE</button>
      </div>
    </div>
  );
}
