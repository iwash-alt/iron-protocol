import React from 'react';
import { S } from '../styles';
import MiniChart from '../components/MiniChart';

export default function Dashboard({
  profile, workoutHistory, exerciseHistory,
  todayWater, todayProtein, proteinGoal, waterGoal,
  nutritionHistory, personalRecords, bodyMeasurements,
  streak, weekCount,
  onAddWater, onOpenNutrition, onOpenMeasurements, onShowExerciseHistory,
}) {
  const totalVol = workoutHistory.reduce((a, w) => a + (w.volume || 0), 0);
  const volData = workoutHistory.slice(-7).map(w => w.volume || 0);
  const last7 = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0]; });
  const proteinData = last7.map(d => nutritionHistory[d]?.protein || 0);
  const weightData = bodyMeasurements.slice(-10).map(m => parseFloat(m.weight) || 0);

  return (
    <div>
      <div style={S.sumGrid}>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>WORKOUTS</div>
          <div style={S.sumVal}>{workoutHistory.length}</div>
          {volData.length > 1 && <MiniChart data={volData} type="bar" height={35} />}
        </div>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>VOLUME</div>
          <div style={S.sumVal}>{(totalVol / 1000).toFixed(0)}t</div>
        </div>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>STREAK</div>
          <div style={S.sumVal}>{streak} &#x1F525;</div>
        </div>
      </div>

      {weekCount > 0 && (
        <div style={S.weekCard}>
          &#x1F4C5; Training Week {weekCount}
          {weekCount >= 4 && <span style={S.weekWarning}> &bull; Deload recommended</span>}
        </div>
      )}

      {Object.keys(personalRecords).length > 0 && (
        <div style={S.chartBox}>
          <h3 style={S.chartTitle}>&#x1F3C6; Personal Records</h3>
          <div style={S.prGrid}>
            {Object.entries(personalRecords).map(([name, weight]) => (
              <div key={name} style={S.prItem} onClick={() => onShowExerciseHistory(name)}>
                <div style={S.prName}>{name}</div>
                <div style={S.prWeight}>{weight}kg</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={S.chartBox}>
        <div style={S.chartHeader}>
          <h3 style={S.chartTitle}>&#x1F4CF; Body Measurements</h3>
          <button onClick={onOpenMeasurements} style={S.addMeasureBtn}>+ LOG</button>
        </div>
        {weightData.length > 1 ? (
          <>
            <MiniChart data={weightData} color="#3B82F6" height={60} />
            <div style={S.measureSummary}>
              <span>Current: {bodyMeasurements[bodyMeasurements.length - 1]?.weight}kg</span>
              <span>Start: {bodyMeasurements[0]?.weight}kg</span>
            </div>
          </>
        ) : (
          <p style={S.emptyText}>Log measurements to track progress</p>
        )}
      </div>

      <div style={S.chartBox}>
        <h3 style={S.chartTitle}>&#x1F37D;&#xFE0F; Today's Nutrition</h3>
        <div style={S.nutritionCards}>
          <div style={S.nutritionCard} onClick={onOpenNutrition}>
            <div style={S.nutritionCardHeader}>
              <span style={{ fontSize: '1.25rem' }}>&#x1F4A7;</span>
              <span style={S.nutritionCardTitle}>Water</span>
            </div>
            <div style={S.nutritionCardValue}>{todayWater}<span style={S.nutritionCardUnit}>/{waterGoal}</span></div>
            <div style={S.miniProgress}>
              <div style={{ ...S.miniProgressFill, width: `${(todayWater / waterGoal) * 100}%`, background: '#3B82F6' }} />
            </div>
            <button onClick={e => { e.stopPropagation(); onAddWater(); }} style={S.nutritionCardBtn}>+ ADD</button>
          </div>
          <div style={S.nutritionCard} onClick={onOpenNutrition}>
            <div style={S.nutritionCardHeader}>
              <span style={{ fontSize: '1.25rem' }}>&#x1F969;</span>
              <span style={S.nutritionCardTitle}>Protein</span>
            </div>
            <div style={S.nutritionCardValue}>{todayProtein}<span style={S.nutritionCardUnit}>g</span></div>
            <div style={S.miniProgress}>
              <div style={{ ...S.miniProgressFill, width: `${Math.min(100, (todayProtein / proteinGoal) * 100)}%`, background: '#34C759' }} />
            </div>
            <button onClick={e => { e.stopPropagation(); onOpenNutrition(); }} style={S.nutritionCardBtn}>+ LOG</button>
          </div>
        </div>
      </div>

      <div style={S.chartBox}>
        <h3 style={S.chartTitle}>&#x1F4CA; Protein (7 Days)</h3>
        <MiniChart data={proteinData.length ? proteinData : [0]} color="#34C759" height={60} />
        <div style={S.chartLabels}><span>7 days ago</span><span>Today</span></div>
      </div>

      {workoutHistory.length > 0 && (
        <div style={S.chartBox}>
          <h3 style={S.chartTitle}>&#x1F4CB; Recent Workouts</h3>
          <div style={S.recentList}>
            {workoutHistory.slice(-5).reverse().map((w, i) => (
              <div key={i} style={S.recentItem}>
                <div>
                  <div style={S.recentDay}>{w.dayName}</div>
                  <div style={S.recentDate}>{w.date}</div>
                </div>
                <div style={S.recentStats}>
                  <span style={S.recentPct}>{w.completedPct}%</span>
                  <span style={S.recentVol}>{(w.volume / 1000).toFixed(1)}t</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={S.profileBox}>
        <h3 style={S.chartTitle}>&#x1F464; Profile</h3>
        <div style={S.profileGrid}>
          <div style={S.profileItem}><span style={S.profileLabel}>Height</span><span>{profile.height}cm</span></div>
          <div style={S.profileItem}><span style={S.profileLabel}>Weight</span><span>{profile.weight}kg</span></div>
          <div style={S.profileItem}><span style={S.profileLabel}>Level</span><span style={{ textTransform: 'capitalize' }}>{profile.level}</span></div>
          <div style={S.profileItem}><span style={S.profileLabel}>Schedule</span><span>{profile.days}x/week</span></div>
        </div>
      </div>
    </div>
  );
}
