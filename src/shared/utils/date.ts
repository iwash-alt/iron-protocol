export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekNumber(): number {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now.getTime() - yearStart.getTime()) / 604800000) + 1;
}

export function getGreeting(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function getLast7Days(): string[] {
  return [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}
