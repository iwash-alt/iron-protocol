import { useCallback, useEffect, useState } from 'react';
import { exercises } from '../domain/exercises';

type Exercise = (typeof exercises)[number];

type QuickTemplate = {
  id: string;
  name: string;
  duration: number;
  exercises: string[];
};

type ActiveQuickTemplate = Omit<QuickTemplate, 'exercises'> & {
  exercises: Exercise[];
};

export function useQuickWorkout({ onComplete }: { onComplete?: () => void } = {}) {
  const [showQuick, setShowQuick] = useState(false);
  const [quickReady, setQuickReady] = useState<QuickTemplate | null>(null);
  const [readyCountdown, setReadyCountdown] = useState(0);
  const [quickActive, setQuickActive] = useState<ActiveQuickTemplate | null>(null);
  const [quickIdx, setQuickIdx] = useState(0);
  const [quickTimer, setQuickTimer] = useState(0);
  const [quickRest, setQuickRest] = useState(false);

  useEffect(() => {
    if (readyCountdown <= 0 || !quickReady) return;
    const t = setTimeout(() => {
      setReadyCountdown((prev) => {
        if (prev <= 1) {
          const exs = quickReady.exercises.map((n) => exercises.find((e) => e.name === n)).filter((e): e is Exercise => Boolean(e));
          setQuickActive({ ...quickReady, exercises: exs });
          setQuickIdx(0);
          setQuickTimer(40);
          setQuickRest(false);
          setQuickReady(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [readyCountdown, quickReady]);

  useEffect(() => {
    if (!quickActive || quickTimer <= 0) return;
    const t = setTimeout(() => {
      setQuickTimer((prev) => {
        if (prev <= 1) {
          if (quickRest) {
            if (quickIdx < quickActive.exercises.length - 1) {
              setQuickIdx((i) => i + 1);
              setQuickRest(false);
              return 40;
            }
            setQuickActive(null);
            onComplete?.();
            return 0;
          }
          setQuickRest(true);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [quickActive, quickTimer, quickRest, quickIdx, onComplete]);

  const startQuickWorkout = useCallback((template: QuickTemplate) => {
    setQuickReady(template);
    setReadyCountdown(3);
    setShowQuick(false);
  }, []);

  const cancelQuickReady = useCallback(() => {
    setQuickReady(null);
    setReadyCountdown(0);
  }, []);

  const cancelQuickActive = useCallback(() => {
    setQuickActive(null);
  }, []);

  return {
    showQuick,
    setShowQuick,
    quickReady,
    readyCountdown,
    quickActive,
    quickIdx,
    quickTimer,
    quickRest,
    startQuickWorkout,
    cancelQuickReady,
    cancelQuickActive,
  };
}
