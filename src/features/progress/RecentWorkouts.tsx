import React from 'react';
import type { WorkoutLog } from '@/shared/types';
import { formatVolume } from '@/shared/utils';
import { S } from '@/shared/theme/styles';

interface RecentWorkoutsProps {
  workoutHistory: WorkoutLog[];
}

export function RecentWorkouts({ workoutHistory }: RecentWorkoutsProps) {
  if (workoutHistory.length === 0) return null;

  return (
    <div style={S.chartBox}>
      <h3 style={S.chartTitle}>{'\u{1F4CB}'} Recent Workouts</h3>
      <div style={S.recentList}>
        {workoutHistory.slice(-5).reverse().map((w, i) => (
          <div key={i} style={S.recentItem}>
            <div><div style={S.recentDay}>{w.dayName}</div><div style={S.recentDate}>{w.date}</div></div>
            <div style={S.recentStats}>
              <span style={S.recentPct}>{w.completionPercent}%</span>
              <span style={S.recentVol}>{formatVolume(w.totalVolumeKg)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
