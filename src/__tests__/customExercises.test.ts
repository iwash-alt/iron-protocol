import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { CustomExercise } from '@/shared/types/exercise';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((_: number) => null),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// Must import after mocking localStorage
const { loadCustomExercises, saveCustomExercises } = await import('@/shared/storage/storage');

describe('Custom exercise storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('returns empty array when no custom exercises saved', () => {
    const result = loadCustomExercises();
    expect(result).toEqual([]);
  });

  it('saves and loads a custom exercise', () => {
    const custom: CustomExercise = {
      id: 'custom-123',
      name: 'Weighted Dip',
      muscle: 'Chest',
      equipment: 'None',
      type: 'compound',
      isBodyweight: false,
      secondaryMuscles: ['Triceps', 'Shoulders'],
      formCues: [],
      commonMistakes: [],
      isCustom: true,
      notes: 'Add weight belt',
    };

    saveCustomExercises([custom]);
    const loaded = loadCustomExercises();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('Weighted Dip');
    expect(loaded[0].isCustom).toBe(true);
    expect(loaded[0].notes).toBe('Add weight belt');
  });

  it('filters out invalid entries from storage', () => {
    // Directly write invalid data to localStorage
    store['ironCustomExercises'] = JSON.stringify([
      { id: 'custom-1', name: 'Valid', muscle: 'Chest', isCustom: true },
      { name: 'Missing id', muscle: 'Back' },  // invalid: no id
      'not-an-object',
      null,
    ]);

    const loaded = loadCustomExercises();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('Valid');
  });

  it('handles corrupted JSON gracefully', () => {
    store['ironCustomExercises'] = '{broken json';
    const loaded = loadCustomExercises();
    expect(loaded).toEqual([]);
  });
});

describe('Custom exercise filtering', () => {
  it('custom exercises appear in filterExercises with extra param', async () => {
    const { filterExercises } = await import('@/data/exercises');

    const custom: CustomExercise = {
      id: 'custom-456',
      name: 'Weighted Dip',
      muscle: 'Chest',
      equipment: 'None',
      type: 'compound',
      isBodyweight: false,
      secondaryMuscles: [],
      formCues: [],
      commonMistakes: [],
      isCustom: true,
    };

    // No filter — should include custom
    const all = filterExercises({ extra: [custom] });
    const found = all.find(e => e.name === 'Weighted Dip');
    expect(found).toBeDefined();
    expect((found as CustomExercise).isCustom).toBe(true);
  });

  it('Chest + Barbell filter returns only matching exercises', async () => {
    const { filterExercises } = await import('@/data/exercises');

    const results = filterExercises({
      muscle: 'Chest',
      equipment: 'Barbell',
    });

    // All results should be Chest muscle and Barbell equipment
    for (const ex of results) {
      expect(ex.muscle).toBe('Chest');
      expect(ex.equipment).toBe('Barbell');
    }
    // Should include known exercises
    const names = results.map(e => e.name);
    expect(names).toContain('Barbell Bench Press');
    expect(names).toContain('Incline Barbell Bench Press');
    expect(names).toContain('Decline Barbell Bench Press');
  });

  it('custom exercise with Chest + Barbell appears in filtered results', async () => {
    const { filterExercises } = await import('@/data/exercises');

    const custom: CustomExercise = {
      id: 'custom-789',
      name: 'Close-Grip Barbell Press',
      muscle: 'Chest',
      equipment: 'Barbell',
      type: 'compound',
      isBodyweight: false,
      secondaryMuscles: [],
      formCues: [],
      commonMistakes: [],
      isCustom: true,
    };

    const results = filterExercises({
      muscle: 'Chest',
      equipment: 'Barbell',
      extra: [custom],
    });

    const customResult = results.find(e => e.name === 'Close-Grip Barbell Press');
    expect(customResult).toBeDefined();
  });

  it('Weighted Dip does NOT appear in Chest + Barbell filter (equipment mismatch)', async () => {
    const { filterExercises } = await import('@/data/exercises');

    const custom: CustomExercise = {
      id: 'custom-dip',
      name: 'Weighted Dip',
      muscle: 'Chest',
      equipment: 'None',
      type: 'compound',
      isBodyweight: false,
      secondaryMuscles: [],
      formCues: [],
      commonMistakes: [],
      isCustom: true,
    };

    const results = filterExercises({
      muscle: 'Chest',
      equipment: 'Barbell',
      extra: [custom],
    });

    const dip = results.find(e => e.name === 'Weighted Dip');
    expect(dip).toBeUndefined();
  });
});
