export interface WarmupSet {
  label: string;
  weightKg: number;
  reps: number;
}

/** Epley formula for estimated 1RM */
export function calculate1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30));
}

/** Generate warm-up sets for a given working weight (kg) */
export function getWarmupSets(workingWeightKg: number): WarmupSet[] {
  if (workingWeightKg < 20) return [];

  const roundTo2_5 = (v: number) => Math.round(v / 2.5) * 2.5;
  const w50 = roundTo2_5(workingWeightKg * 0.5);
  const w70 = roundTo2_5(workingWeightKg * 0.7);
  const w90 = roundTo2_5(workingWeightKg * 0.9);

  const sets: WarmupSet[] = [{ label: 'Bar', weightKg: 20, reps: 10 }];
  if (w50 > 20) sets.push({ label: '50%', weightKg: w50, reps: 5 });
  if (w70 > w50) sets.push({ label: '70%', weightKg: w70, reps: 3 });
  if (w90 > w70) sets.push({ label: '90%', weightKg: w90, reps: 1 });

  return sets;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export function getProteinGoal(weightKg: number): number {
  return Math.round(weightKg * 1.8);
}

export const WATER_GOAL = 8;
