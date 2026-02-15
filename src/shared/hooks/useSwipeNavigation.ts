import { useCallback, useRef, useState } from 'react';
import { TIMINGS } from '@/shared/constants/timings';

interface SwipeNavigationOptions {
  enabled: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function useSwipeNavigation({ enabled, onSwipeLeft, onSwipeRight }: SwipeNavigationOptions) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const isSwiping = useRef(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchDeltaX.current = 0;
    isSwiping.current = false;
  }, [enabled]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;

    if (!isSwiping.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      isSwiping.current = true;
    }

    if (isSwiping.current) {
      touchDeltaX.current = dx;
      setSwipeOffset(Math.max(-60, Math.min(60, dx * 0.3)));
    }
  }, [enabled]);

  const onTouchEnd = useCallback(() => {
    if (!enabled) return;
    if (isSwiping.current && Math.abs(touchDeltaX.current) > TIMINGS.SWIPE_THRESHOLD) {
      if (touchDeltaX.current > 0) onSwipeRight();
      else onSwipeLeft();
    }

    isSwiping.current = false;
    touchDeltaX.current = 0;
    setSwipeOffset(0);
  }, [enabled, onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchMove, onTouchEnd, swipeOffset };
}
