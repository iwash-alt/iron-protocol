import { useState, useEffect, useRef, useCallback } from 'react';
import { playRestComplete } from '@/shared/utils';

export function useTimer(onComplete?: () => void) {
  const [seconds, setSeconds] = useState(0);
  const activeRef = useRef(false);

  useEffect(() => {
    if (seconds <= 0) {
      if (activeRef.current) {
        activeRef.current = false;
        playRestComplete();
        onComplete?.();
      }
      return;
    }

    activeRef.current = true;
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, onComplete]);

  const start = useCallback((duration: number) => {
    setSeconds(duration);
  }, []);

  const skip = useCallback(() => {
    activeRef.current = false;
    setSeconds(0);
  }, []);

  return { seconds, start, skip, isActive: seconds > 0 };
}
