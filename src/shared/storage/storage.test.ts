import { beforeEach, describe, expect, it } from 'vitest';
import { clearAllStorage, loadTrainingPlan, StorageKeys } from './storage';

describe('loadTrainingPlan', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads legacy plans without programName safely', () => {
    localStorage.setItem(StorageKeys.TRAINING_PLAN, JSON.stringify({
      days: [{ id: 'd1', name: 'Push' }],
      exercises: [],
      dayIndex: 0,
    }));

    const plan = loadTrainingPlan();
    expect(plan).not.toBeNull();
    expect(plan?.programName).toBeUndefined();
    expect(plan?.days).toEqual([{ id: 'd1', name: 'Push' }]);
  });

  it('normalizes malformed legacy values to prevent crashes', () => {
    localStorage.setItem(StorageKeys.TRAINING_PLAN, JSON.stringify({
      days: [{ id: '', name: '   ' }, { id: 'd2', name: 'Legs' }],
      exercises: [{ id: 'x', dayId: 'missing' }, { id: 'y', dayId: 'd2' }],
      dayIndex: 999,
      programName: '  Program  ',
    }));

    const plan = loadTrainingPlan();
    expect(plan).not.toBeNull();
    expect(plan?.days[0]).toEqual({ id: 'legacy-d0', name: 'Day 1' });
    expect(plan?.dayIndex).toBe(1);
    expect(plan?.exercises).toHaveLength(1);
    expect(plan?.exercises[0].dayId).toBe('d2');
  });
});

describe('clearAllStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes all known storage keys and version key', () => {
    Object.values(StorageKeys).forEach((key) => {
      localStorage.setItem(key, 'mock');
    });
    localStorage.setItem('ironStorageVersion', '3');

    clearAllStorage();

    Object.values(StorageKeys).forEach((key) => {
      expect(localStorage.getItem(key)).toBeNull();
    });
    expect(localStorage.getItem('ironStorageVersion')).toBeNull();
  });
});
