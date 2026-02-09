import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from './adapter';
import type { StorageAdapter } from './adapter';

describe('LocalStorageAdapter', () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter();
    localStorage.clear();
  });

  describe('load', () => {
    it('returns default for empty keys', async () => {
      expect(await adapter.load('profile')).toBeNull();
      expect(await adapter.load('workoutHistory')).toEqual([]);
      expect(await adapter.load('exerciseHistory')).toEqual({});
      expect(await adapter.load('personalRecords')).toEqual({});
      expect(await adapter.load('bodyMeasurements')).toEqual([]);
      expect(await adapter.load('nutritionHistory')).toEqual({});
      expect(await adapter.load('weekCount')).toBe(0);
      expect(await adapter.load('lastWorkoutWeek')).toBeNull();
      expect(await adapter.load('entitlements')).toBeNull();
    });
  });

  describe('save + load roundtrip', () => {
    it('persists and retrieves a profile', async () => {
      const profile = {
        name: 'Test',
        height: 175,
        weight: 80,
        age: 28,
        level: 'intermediate' as const,
        days: 3 as const,
        health: true,
      };

      await adapter.save('profile', profile);
      const loaded = await adapter.load('profile');

      expect(loaded).toEqual(profile);
    });

    it('persists and retrieves workout history', async () => {
      const history = [{
        date: '2026-02-09',
        dayName: 'Push',
        sets: [{
          exerciseName: 'Bench Press',
          weightKg: 80,
          reps: 8,
          setNumber: 1,
          rpe: 8 as const,
        }],
        totalVolumeKg: 640,
        completionPercent: 100,
      }];

      await adapter.save('workoutHistory', history);
      const loaded = await adapter.load('workoutHistory');

      expect(loaded).toHaveLength(1);
      expect(loaded[0].dayName).toBe('Push');
    });

    it('persists and retrieves week count', async () => {
      await adapter.save('weekCount', 12);
      expect(await adapter.load('weekCount')).toBe(12);
    });
  });

  describe('remove', () => {
    it('removes a stored value', async () => {
      await adapter.save('weekCount', 5);
      expect(await adapter.load('weekCount')).toBe(5);

      await adapter.remove('weekCount');
      expect(await adapter.load('weekCount')).toBe(0); // returns default
    });
  });

  describe('clear', () => {
    it('removes all app data', async () => {
      await adapter.save('weekCount', 10);
      await adapter.save('personalRecords', { 'Bench Press': 100 });

      await adapter.clear();

      expect(await adapter.load('weekCount')).toBe(0);
      expect(await adapter.load('personalRecords')).toEqual({});
    });
  });
});
