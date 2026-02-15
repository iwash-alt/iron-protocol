import { useEffect, useRef } from 'react';

export function useDebouncedSave<T>(key: string, value: T, save: (key: string, value: T) => void, delay = 500) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      save(key, value);
    }, delay);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [key, value, delay, save]);
}
