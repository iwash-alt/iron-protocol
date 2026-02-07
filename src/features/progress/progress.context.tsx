import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { BodyMeasurement } from '@/shared/types';
import { getTodayKey } from '@/shared/utils';
import { loadBodyMeasurements, saveBodyMeasurements } from '@/shared/storage';
import { useDemoMode } from '@/shared/demo/DemoModeContext';

interface ProgressContextValue {
  bodyMeasurements: BodyMeasurement[];
  saveMeasurement: (data: Omit<BodyMeasurement, 'date'>) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const demo = useDemoMode();
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>(() => (
    demo.enabled ? (demo.demoData?.bodyMeasurements ?? []) : loadBodyMeasurements()
  ));

  useEffect(() => {
    if (demo.enabled) {
      setBodyMeasurements(demo.demoData?.bodyMeasurements ?? []);
    } else {
      setBodyMeasurements(loadBodyMeasurements());
    }
  }, [demo.enabled, demo.demoData]);

  const saveMeasurement = useCallback((data: Omit<BodyMeasurement, 'date'>) => {
    setBodyMeasurements(prev => {
      const updated = [...prev, { ...data, date: getTodayKey() }];
      if (demo.enabled) {
        demo.updateDemoData(d => ({ ...d, bodyMeasurements: updated }));
      } else {
        saveBodyMeasurements(updated);
      }
      return updated;
    });
  }, [demo]);

  return (
    <ProgressContext.Provider value={{ bodyMeasurements, saveMeasurement }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
