import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { BodyMeasurement } from '@/shared/types';
import { getTodayKey } from '@/shared/utils';
import { loadBodyMeasurements, saveBodyMeasurements } from '@/shared/storage';

interface ProgressContextValue {
  bodyMeasurements: BodyMeasurement[];
  saveMeasurement: (data: Omit<BodyMeasurement, 'date'>) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>(() => loadBodyMeasurements());

  const saveMeasurement = useCallback((data: Omit<BodyMeasurement, 'date'>) => {
    setBodyMeasurements(prev => {
      const updated = [...prev, { ...data, date: getTodayKey() }];
      saveBodyMeasurements(updated);
      return updated;
    });
  }, []);

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
