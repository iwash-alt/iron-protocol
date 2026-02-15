import { useMemo } from 'react';

interface HistoryItem { date: string }

export function useWorkoutStreak(workoutHistory: HistoryItem[]) {
  return useMemo(() => {
    if (!workoutHistory.length) return { currentStreak: 0, bestStreak: 0, isActive: false };
    const dates = [...new Set(workoutHistory.map((w) => w.date))].sort();

    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i += 1) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      const expectedDate = expected.toISOString().split('T')[0];
      const idx = dates.length - 1 - i;
      if (dates[idx] === expectedDate) currentStreak += 1;
      else break;
    }

    let bestStreak = 1;
    let running = 1;
    for (let i = 1; i < dates.length; i += 1) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        running += 1;
        bestStreak = Math.max(bestStreak, running);
      } else {
        running = 1;
      }
    }

    return { currentStreak, bestStreak, isActive: currentStreak > 0 };
  }, [workoutHistory]);
}
