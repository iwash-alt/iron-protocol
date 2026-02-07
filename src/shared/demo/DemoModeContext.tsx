import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { DemoData } from './demoData';
import { ensureDemoData, loadDemoData, loadDemoMode, saveDemoData, saveDemoMode } from './demoData';

interface DemoModeContextValue {
  enabled: boolean;
  demoData: DemoData | null;
  setEnabled: (enabled: boolean) => void;
  updateDemoData: (updater: (data: DemoData) => DemoData) => void;
}

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(() => loadDemoMode());
  const [demoData, setDemoData] = useState<DemoData | null>(() => {
    if (!loadDemoMode()) return null;
    return loadDemoData() ?? ensureDemoData();
  });

  const setEnabled = useCallback((next: boolean) => {
    saveDemoMode(next);
    setEnabledState(next);
    if (next) {
      const data = loadDemoData() ?? ensureDemoData();
      setDemoData(data);
    } else {
      setDemoData(null);
    }
  }, []);

  const updateDemoData = useCallback((updater: (data: DemoData) => DemoData) => {
    setDemoData(prev => {
      const base = prev ?? ensureDemoData();
      const updated = updater(base);
      saveDemoData(updated);
      return updated;
    });
  }, []);

  const value = useMemo(() => ({
    enabled,
    demoData,
    setEnabled,
    updateDemoData,
  }), [enabled, demoData, setEnabled, updateDemoData]);

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode(): DemoModeContextValue {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error('useDemoMode must be used within DemoModeProvider');
  return ctx;
}
