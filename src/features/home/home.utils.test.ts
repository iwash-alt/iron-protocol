import type { WorkoutLog } from '@/shared/types';
import { computeGhostRecord, countThisWeekSessions, estimateWorkoutMinutes } from './home.utils';

function makeLog(overrides: Partial<WorkoutLog> & Pick<WorkoutLog, 'dayName'>): WorkoutLog {
  return {
    date: '2026-02-01',
    sets: [],
    totalVolumeKg: 1000,
    completionPercent: 100,
    ...overrides,
  };
}

describe('computeGhostRecord', () => {
  it('returns 0/0 for empty history', () => {
    expect(computeGhostRecord([])).toEqual({ wins: 0, losses: 0 });
  });

  it('returns 0/0 for a single workout', () => {
    expect(computeGhostRecord([makeLog({ dayName: 'Push' })])).toEqual({ wins: 0, losses: 0 });
  });

  it('counts a win when volume increases for the same day', () => {
    const history = [
      makeLog({ dayName: 'Push', totalVolumeKg: 1000 }),
      makeLog({ dayName: 'Push', totalVolumeKg: 1200 }),
    ];
    expect(computeGhostRecord(history)).toEqual({ wins: 1, losses: 0 });
  });

  it('counts a loss when volume decreases for the same day', () => {
    const history = [
      makeLog({ dayName: 'Push', totalVolumeKg: 1200 }),
      makeLog({ dayName: 'Push', totalVolumeKg: 1000 }),
    ];
    expect(computeGhostRecord(history)).toEqual({ wins: 0, losses: 1 });
  });

  it('ignores workouts with no same-day predecessor', () => {
    const history = [
      makeLog({ dayName: 'Push', totalVolumeKg: 1000 }),
      makeLog({ dayName: 'Pull', totalVolumeKg: 800 }),
    ];
    expect(computeGhostRecord(history)).toEqual({ wins: 0, losses: 0 });
  });

  it('treats equal volume as neither win nor loss', () => {
    const history = [
      makeLog({ dayName: 'Legs', totalVolumeKg: 1500 }),
      makeLog({ dayName: 'Legs', totalVolumeKg: 1500 }),
    ];
    expect(computeGhostRecord(history)).toEqual({ wins: 0, losses: 0 });
  });

  it('handles mixed results across multiple days', () => {
    const history = [
      makeLog({ dayName: 'Push', totalVolumeKg: 1000 }),
      makeLog({ dayName: 'Pull', totalVolumeKg: 800 }),
      makeLog({ dayName: 'Push', totalVolumeKg: 1100 }), // win vs Push 1000
      makeLog({ dayName: 'Pull', totalVolumeKg: 700 }),   // loss vs Pull 800
      makeLog({ dayName: 'Push', totalVolumeKg: 900 }),   // loss vs Push 1100
    ];
    expect(computeGhostRecord(history)).toEqual({ wins: 1, losses: 2 });
  });
});

describe('countThisWeekSessions', () => {
  it('returns 0 for empty history', () => {
    expect(countThisWeekSessions([], ['2026-02-01', '2026-02-02'])).toBe(0);
  });

  it('counts workouts within the given date window', () => {
    const history = [
      makeLog({ dayName: 'Push', date: '2026-02-01' }),
      makeLog({ dayName: 'Pull', date: '2026-02-03' }),
      makeLog({ dayName: 'Legs', date: '2026-02-10' }), // outside window
    ];
    const window = ['2026-02-01', '2026-02-02', '2026-02-03'];
    expect(countThisWeekSessions(history, window)).toBe(2);
  });

  it('deduplicates multiple workouts on the same day', () => {
    const history = [
      makeLog({ dayName: 'Push', date: '2026-02-01' }),
      makeLog({ dayName: 'Pull', date: '2026-02-01' }),
    ];
    expect(countThisWeekSessions(history, ['2026-02-01', '2026-02-02'])).toBe(1);
  });
});

describe('estimateWorkoutMinutes', () => {
  it('returns 0 for empty exercises', () => {
    expect(estimateWorkoutMinutes([])).toBe(0);
  });

  it('estimates duration based on sets and rest', () => {
    const exercises = [
      { sets: 3, restSeconds: 90 }, // 3 * (1.5 + 1.5) = 9
      { sets: 3, restSeconds: 60 }, // 3 * (1.5 + 1) = 7.5
    ];
    expect(estimateWorkoutMinutes(exercises)).toBe(17); // round(16.5) = 17
  });

  it('handles exercises with zero rest', () => {
    const exercises = [{ sets: 4, restSeconds: 0 }]; // 4 * 1.5 = 6
    expect(estimateWorkoutMinutes(exercises)).toBe(6);
  });
});
