export function calculateStreak(workoutHistory) {
  if (!workoutHistory.length) return 0;
  const dates = [...new Set(workoutHistory.map(w => w.date))].sort().reverse();
  let count = 0;
  for (let i = 0; i < dates.length; i++) {
    const exp = new Date();
    exp.setDate(exp.getDate() - i);
    if (dates[i] === exp.toISOString().split('T')[0]) count++;
    else break;
  }
  return count;
}

export function getTimeGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

export function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function calculateProteinGoal(profile) {
  return profile ? Math.round(profile.weight * 1.8) : 150;
}

export const WATER_GOAL = 8;
