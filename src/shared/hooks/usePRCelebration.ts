import { useCallback, useEffect, useState } from 'react';

interface PRValue {
  name: string;
  category: string;
  value: string;
}

export function usePRCelebration(newPR: PRValue | null, clearPR: () => void) {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setShowCelebration(Boolean(newPR));
  }, [newPR]);

  const clearCelebration = useCallback(() => {
    setShowCelebration(false);
    clearPR();
  }, [clearPR]);

  return { newPR, showCelebration, clearCelebration };
}
