import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ProteinSource, ProteinLogEntry, NutritionHistory } from '@/shared/types';
import { getTodayKey } from '@/shared/utils';
import { loadNutritionHistory, saveNutritionHistory } from '@/shared/storage';

interface NutritionContextValue {
  todayWater: number;
  todayProtein: number;
  proteinLog: ProteinLogEntry[];
  nutritionHistory: NutritionHistory;
  addWater: () => void;
  setWaterTo: (count: number) => void;
  addProtein: (source: ProteinSource) => void;
}

const NutritionContext = createContext<NutritionContextValue | null>(null);

export function NutritionProvider({ children }: { children: ReactNode }) {
  const [nutritionHistory, setNutritionHistory] = useState<NutritionHistory>(() => loadNutritionHistory());
  const [todayWater, setTodayWater] = useState(() => {
    const today = getTodayKey();
    return nutritionHistory[today]?.water || 0;
  });
  const [todayProtein, setTodayProtein] = useState(() => {
    const today = getTodayKey();
    return nutritionHistory[today]?.protein || 0;
  });
  const [proteinLog, setProteinLog] = useState<ProteinLogEntry[]>(() => {
    const today = getTodayKey();
    return nutritionHistory[today]?.proteinLog || [];
  });

  // Persist nutrition changes
  useEffect(() => {
    if (todayWater > 0 || todayProtein > 0 || proteinLog.length > 0) {
      const today = getTodayKey();
      const updated = {
        ...nutritionHistory,
        [today]: { water: todayWater, protein: todayProtein, proteinLog },
      };
      setNutritionHistory(updated);
      saveNutritionHistory(updated);
    }
  }, [todayWater, todayProtein, proteinLog]);

  const addWater = useCallback(() => {
    setTodayWater(w => w + 1);
  }, []);

  const setWaterTo = useCallback((count: number) => {
    setTodayWater(count);
  }, []);

  const addProtein = useCallback((source: ProteinSource) => {
    setTodayProtein(p => p + source.protein);
    setProteinLog(log => [...log, {
      ...source,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  }, []);

  return (
    <NutritionContext.Provider value={{
      todayWater,
      todayProtein,
      proteinLog,
      nutritionHistory,
      addWater,
      setWaterTo,
      addProtein,
    }}>
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutrition(): NutritionContextValue {
  const ctx = useContext(NutritionContext);
  if (!ctx) throw new Error('useNutrition must be used within NutritionProvider');
  return ctx;
}
