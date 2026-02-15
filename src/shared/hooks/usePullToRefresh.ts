import { useCallback, useRef, useState } from 'react';
import { TIMINGS } from '@/shared/constants/timings';

interface PullToRefreshOptions {
  enabled: boolean;
  scrollTop: () => number;
  onRefresh?: () => void;
}

export function usePullToRefresh({ enabled, scrollTop, onRefresh }: PullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pullStartY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    if (scrollTop() <= 0) {
      pullStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [enabled, scrollTop]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || !isPulling) return;
    const dy = e.touches[0].clientY - pullStartY.current;
    if (dy > 0) setPullDistance(dy * 0.4);
  }, [enabled, isPulling]);

  const onTouchEnd = useCallback(() => {
    if (!enabled || !isPulling) return;
    setIsPulling(false);
    if (pullDistance > TIMINGS.SWIPE_THRESHOLD) {
      onRefresh?.();
    }
    setPullDistance(0);
  }, [enabled, isPulling, onRefresh, pullDistance]);

  return { onTouchStart, onTouchMove, onTouchEnd, isPulling, pullDistance };
}
