import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeekNumber } from './date';

afterEach(() => {
  vi.useRealTimers();
});

describe('getWeekNumber', () => {
  it('returns week 1 for Jan 1st', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'));

    expect(getWeekNumber()).toBe(1);
  });

  it('increments only after 7 full days have elapsed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-07T12:00:00Z'));
    expect(getWeekNumber()).toBe(1);

    vi.setSystemTime(new Date('2025-01-08T12:00:00Z'));
    expect(getWeekNumber()).toBe(2);
  });
});
