import { useEffect, useRef, useState } from 'react';
import { playRestComplete } from '../training/engine';

export function useRestTimer() {
  const [restTime, setRestTime] = useState(0);
  const [restFor, setRestFor] = useState<string | null>(null);
  const restTimerRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (restTime <= 0) {
      if (restTimerRef.current) {
        playRestComplete();
        restTimerRef.current = null;
      }
      return;
    }
    restTimerRef.current = true;
    const t = setTimeout(() => setRestTime((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [restTime]);

  const startRest = (duration: number, exerciseId: string) => {
    setRestTime(duration);
    setRestFor(exerciseId);
  };

  const skipRest = () => setRestTime(0);

  return { restTime, restFor, startRest, skipRest };
}
