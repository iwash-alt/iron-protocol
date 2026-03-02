import { describe, it, expect } from 'vitest';

/**
 * Pure reorder logic extracted for testing.
 * Mirrors the reorderExercise handler in CustomWorkoutBuilder.
 */
function reorderArray<T>(arr: T[], fromIdx: number, toIdx: number): T[] {
  if (toIdx < 0 || toIdx >= arr.length) return arr;
  const copy = [...arr];
  const [moved] = copy.splice(fromIdx, 1);
  copy.splice(toIdx, 0, moved);
  return copy;
}

describe('CustomWorkoutBuilder exercise reorder', () => {
  const exercises = ['Bench Press', 'Squat', 'Deadlift', 'OHP'];

  it('moves exercise up one position', () => {
    const result = reorderArray(exercises, 2, 1);
    expect(result).toEqual(['Bench Press', 'Deadlift', 'Squat', 'OHP']);
  });

  it('moves exercise down one position', () => {
    const result = reorderArray(exercises, 0, 1);
    expect(result).toEqual(['Squat', 'Bench Press', 'Deadlift', 'OHP']);
  });

  it('no-op when moving first element up (toIdx = -1)', () => {
    const result = reorderArray(exercises, 0, -1);
    expect(result).toBe(exercises); // same reference — unchanged
  });

  it('no-op when moving last element down (toIdx = length)', () => {
    const result = reorderArray(exercises, 3, 4);
    expect(result).toBe(exercises);
  });

  it('moves last element to first position', () => {
    const result = reorderArray(exercises, 3, 0);
    expect(result).toEqual(['OHP', 'Bench Press', 'Squat', 'Deadlift']);
  });

  it('moves first element to last position', () => {
    const result = reorderArray(exercises, 0, 3);
    expect(result).toEqual(['Squat', 'Deadlift', 'OHP', 'Bench Press']);
  });

  it('handles single-element array', () => {
    const single = ['Solo'];
    // Can't move down
    expect(reorderArray(single, 0, 1)).toBe(single);
    // Can't move up
    expect(reorderArray(single, 0, -1)).toBe(single);
  });

  it('preserves all elements after reorder (no data loss)', () => {
    const result = reorderArray(exercises, 3, 0);
    expect(result).toHaveLength(4);
    expect(new Set(result)).toEqual(new Set(exercises));
  });

  it('handles two-element swap', () => {
    const pair = ['A', 'B'];
    expect(reorderArray(pair, 0, 1)).toEqual(['B', 'A']);
    expect(reorderArray(pair, 1, 0)).toEqual(['B', 'A']);
  });
});
