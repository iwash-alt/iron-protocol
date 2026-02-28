import { renderHook, act } from '@testing-library/react';
import { useFilterHistory } from './useFilterHistory';

const FILTER_HISTORY_KEY = 'ironFilterHistory';

describe('useFilterHistory', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with empty history when no data in localStorage', () => {
    const { result } = renderHook(() => useFilterHistory());
    expect(result.current.getTopEquipment(3)).toEqual([]);
    expect(result.current.getTopMuscle(3)).toEqual([]);
  });

  it('loads existing history from localStorage', () => {
    localStorage.setItem(
      FILTER_HISTORY_KEY,
      JSON.stringify({
        equipment: { Barbell: 5, Dumbbell: 3 },
        muscle: { Chest: 4, Back: 2 },
      }),
    );

    const { result } = renderHook(() => useFilterHistory());
    expect(result.current.getTopEquipment(2)).toEqual(['Barbell', 'Dumbbell']);
    expect(result.current.getTopMuscle(2)).toEqual(['Chest', 'Back']);
  });

  it('tracks equipment filter selections', () => {
    const { result } = renderHook(() => useFilterHistory());

    act(() => {
      result.current.trackFilter('equipment', 'Barbell');
    });
    act(() => {
      result.current.trackFilter('equipment', 'Barbell');
    });
    act(() => {
      result.current.trackFilter('equipment', 'Dumbbell');
    });

    expect(result.current.getTopEquipment(2)).toEqual(['Barbell', 'Dumbbell']);
  });

  it('tracks muscle filter selections', () => {
    const { result } = renderHook(() => useFilterHistory());

    act(() => {
      result.current.trackFilter('muscle', 'Chest');
    });
    act(() => {
      result.current.trackFilter('muscle', 'Legs');
    });
    act(() => {
      result.current.trackFilter('muscle', 'Chest');
    });

    expect(result.current.getTopMuscle(2)).toEqual(['Chest', 'Legs']);
  });

  it('ignores "All" values in trackFilter', () => {
    const { result } = renderHook(() => useFilterHistory());

    act(() => {
      result.current.trackFilter('equipment', 'All');
    });

    expect(result.current.getTopEquipment(3)).toEqual([]);
  });

  it('saves to localStorage after debounce', () => {
    const { result } = renderHook(() => useFilterHistory());

    act(() => {
      result.current.trackFilter('equipment', 'Barbell');
    });

    // Before debounce: nothing saved yet
    expect(localStorage.getItem(FILTER_HISTORY_KEY)).toBeNull();

    // After debounce
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const saved = JSON.parse(localStorage.getItem(FILTER_HISTORY_KEY)!);
    expect(saved.equipment.Barbell).toBe(1);
  });

  it('returns top N sorted by count', () => {
    const { result } = renderHook(() => useFilterHistory());

    // Track multiple filters with different counts
    act(() => {
      result.current.trackFilter('equipment', 'Dumbbell');
      result.current.trackFilter('equipment', 'Barbell');
      result.current.trackFilter('equipment', 'Barbell');
      result.current.trackFilter('equipment', 'Barbell');
      result.current.trackFilter('equipment', 'Cable');
      result.current.trackFilter('equipment', 'Cable');
    });

    // Should be sorted: Barbell (3), Cable (2), Dumbbell (1)
    expect(result.current.getTopEquipment(2)).toEqual(['Barbell', 'Cable']);
  });
});
