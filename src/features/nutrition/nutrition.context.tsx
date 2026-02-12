import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ProteinSource, ProteinLogEntry, NutritionHistory } from '@/shared/types';
import { getTodayKey } from '@/shared/utils';
import { loadNutritionHistory, saveNutritionHistory } from '@/shared/storage';
import { useDemoMode } from '@/shared/demo/DemoModeContext';

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
  const demo = useDemoMode();
  const [nutritionHistory, setNutritionHistory] = useState<NutritionHistory>(() => (
    demo.enabled ? (demo.demoData?.nutritionHistory ?? {}) : loadNutritionHistory()
  ));
  const [todayWater, setTodayWater] = useState(() => {
    const today = getTodayKey();
    return (demo.enabled ? demo.demoData?.nutritionHistory[today]?.water : nutritionHistory[today]?.water) || 0;
  });
  const [todayProtein, setTodayProtein] = useState(() => {
    const today = getTodayKey();
    return (demo.enabled ? demo.demoData?.nutritionHistory[today]?.protein : nutritionHistory[today]?.protein) || 0;
  });
  const [proteinLog, setProteinLog] = useState<ProteinLogEntry[]>(() => {
    const today = getTodayKey();
    return (demo.enabled ? demo.demoData?.nutritionHistory[today]?.proteinLog : nutritionHistory[today]?.proteinLog) || [];
  });

  useEffect(() => {
    if (demo.enabled) {
      const history = demo.demoData?.nutritionHistory ?? {};
      const today = getTodayKey();
      setNutritionHistory(history);
      setTodayWater(history[today]?.water || 0);
      setTodayProtein(history[today]?.protein || 0);
      setProteinLog(history[today]?.proteinLog || []);
    } else {
      const history = loadNutritionHistory();
      const today = getTodayKey();
      setNutritionHistory(history);
      setTodayWater(history[today]?.water || 0);
      setTodayProtein(history[today]?.protein || 0);
      setProteinLog(history[today]?.proteinLog || []);
    }
  }, [demo.enabled, demo.demoData]);

  // Persist nutrition changes
  useEffect(() => {
    if (todayWater > 0 || todayProtein > 0 || proteinLog.length > 0) {
      const today = getTodayKey();
      setNutritionHistory(prev => {
        const updated = {
          ...prev,
          [today]: { water: todayWater, protein: todayProtein, proteinLog },
        };
        if (demo.enabled) {
          demo.updateDemoData(data => ({ ...data, nutritionHistory: updated }));
        } else {
          saveNutritionHistory(updated);
        }
        return updated;
      });
    }
  }, [todayWater, todayProtein, proteinLog, demo]);

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
