type WorkoutHistoryEntry = {
  date: string;
};

type ProfileLike = {
  weight: number;
};

export function calculateStreak(workoutHistory: WorkoutHistoryEntry[]): number {
  if (!workoutHistory.length) return 0;
  const dates = [...new Set(workoutHistory.map((w) => w.date))].sort().reverse();
  let count = 0;
  for (let i = 0; i < dates.length; i += 1) {
    const exp = new Date();
    exp.setDate(exp.getDate() - i);
    if (dates[i] === exp.toISOString().split('T')[0]) count += 1;
    else break;
  }
  return count;
}

export function getTimeGreeting(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

export function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function calculateProteinGoal(profile: ProfileLike | null): number {
  return profile ? Math.round(profile.weight * 1.8) : 150;
}

export const WATER_GOAL = 8;
