import { useState, useCallback, useMemo } from 'react';
import { quickTemplates } from '@/data/quick-templates';
import type { QuickTemplate, QuickExerciseConfig, QuickTemplateCustomizations } from '@/data/quick-templates';
import { loadQuickCustomizations, saveQuickCustomizations } from '@/shared/storage';

export function useQuickTemplates() {
  const [customizations, setCustomizations] = useState<QuickTemplateCustomizations>(() => loadQuickCustomizations());

  const templates: QuickTemplate[] = useMemo(() => {
    return quickTemplates.map(t => {
      const custom = customizations[t.id];
      if (custom) {
        return { ...t, exercises: custom.exercises };
      }
      return t;
    });
  }, [customizations]);

  const saveCustomization = useCallback((templateId: string, exercises: QuickExerciseConfig[]) => {
    setCustomizations(prev => {
      const updated = {
        ...prev,
        [templateId]: {
          templateId,
          exercises,
          lastModified: new Date().toISOString(),
        },
      };
      saveQuickCustomizations(updated);
      return updated;
    });
  }, []);

  const resetTemplate = useCallback((templateId: string) => {
    setCustomizations(prev => {
      const updated = { ...prev };
      delete updated[templateId];
      saveQuickCustomizations(updated);
      return updated;
    });
  }, []);

  const isCustomized = useCallback((templateId: string) => {
    return templateId in customizations;
  }, [customizations]);

  return { templates, saveCustomization, resetTemplate, isCustomized };
}
