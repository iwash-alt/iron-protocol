import { useState, useRef, useCallback, useEffect } from 'react';

const FILTER_HISTORY_KEY = 'ironFilterHistory';
const MAX_ENTRIES_PER_TYPE = 100;
const SAVE_DEBOUNCE_MS = 500;

interface FilterHistoryData {
  equipment: Record<string, number>;
  muscle: Record<string, number>;
}

function loadHistory(): FilterHistoryData {
  try {
    const raw = localStorage.getItem(FILTER_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FilterHistoryData;
      return {
        equipment: parsed.equipment ?? {},
        muscle: parsed.muscle ?? {},
      };
    }
  } catch { /* ignore corrupt data */ }
  return { equipment: {}, muscle: {} };
}

function saveHistory(data: FilterHistoryData): void {
  try {
    localStorage.setItem(FILTER_HISTORY_KEY, JSON.stringify(data));
  } catch { /* ignore quota errors */ }
}

function pruneRecord(record: Record<string, number>, max: number): Record<string, number> {
  const entries = Object.entries(record);
  if (entries.length <= max) return record;
  entries.sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(entries.slice(0, max));
}

function getTopN(record: Record<string, number>, n: number): string[] {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key);
}

export function useFilterHistory() {
  const [history, setHistory] = useState<FilterHistoryData>(loadHistory);
  const saveTimeoutRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const trackFilter = useCallback((type: 'equipment' | 'muscle', value: string) => {
    if (value === 'All') return;

    setHistory(prev => {
      const updated = { ...prev };
      const bucket = { ...updated[type] };
      bucket[value] = (bucket[value] ?? 0) + 1;
      updated[type] = pruneRecord(bucket, MAX_ENTRIES_PER_TYPE);

      // Debounced save
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(() => {
        saveHistory(updated);
      }, SAVE_DEBOUNCE_MS);

      return updated;
    });
  }, []);

  const getTopEquipment = useCallback(
    (n: number) => getTopN(history.equipment, n),
    [history.equipment],
  );

  const getTopMuscle = useCallback(
    (n: number) => getTopN(history.muscle, n),
    [history.muscle],
  );

  return { trackFilter, getTopEquipment, getTopMuscle };
}
