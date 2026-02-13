import * as analytics from '@/analytics';
import { generateWeeklyInsights } from '@/analytics/insights';

import * as entitlements from '@/shared/entitlements';
import { PLAN_CATALOG, getAllPlans, getPlan } from '@/shared/entitlements/plans';
import { createDefaultEntitlementStore, resolveEntitlements } from '@/shared/entitlements/resolver';

import * as hooks from '@/shared/hooks';
import { getAdaptiveRest } from '@/shared/hooks/useTimer';

import * as storage from '@/shared/storage';
import { StorageKeys } from '@/shared/storage/storage';

import * as utils from '@/shared/utils';
import { WATER_GOAL, formatTime } from '@/shared/utils/calculations';

import * as training from '@/training';
import { calculateFatigueScore } from '@/training/fatigue';
import { evaluateSuggestions } from '@/training/suggestions';

import * as types from '@/shared/types';

describe('barrel exports', () => {
  it('re-exports analytics members from index.ts', () => {
    expect(analytics.generateWeeklyInsights).toBe(generateWeeklyInsights);
    expect(typeof analytics.generateWeeklyInsights).toBe('function');
  });

  it('re-exports entitlements members from index.ts', () => {
    expect(entitlements.PLAN_CATALOG).toBe(PLAN_CATALOG);
    expect(entitlements.getPlan).toBe(getPlan);
    expect(entitlements.getAllPlans).toBe(getAllPlans);
    expect(entitlements.resolveEntitlements).toBe(resolveEntitlements);
    expect(entitlements.createDefaultEntitlementStore).toBe(createDefaultEntitlementStore);
  });

  it('re-exports shared hooks and utilities', () => {
    expect(hooks.getAdaptiveRest).toBe(getAdaptiveRest);
    expect(typeof hooks.useTimer).toBe('function');

    expect(storage.StorageKeys).toBe(StorageKeys);
    expect(typeof storage.loadProfile).toBe('function');
    expect(typeof storage.saveProfile).toBe('function');

    expect(utils.WATER_GOAL).toBe(WATER_GOAL);
    expect(utils.formatTime).toBe(formatTime);
    expect(utils.getTodayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('re-exports training and type-runtime constants', () => {
    expect(training.calculateFatigueScore).toBe(calculateFatigueScore);
    expect(training.evaluateSuggestions).toBe(evaluateSuggestions);

    expect(Array.isArray(types.MUSCLE_GROUPS)).toBe(true);
    expect(Array.isArray(types.LOWER_BODY_MUSCLES)).toBe(true);
    expect(types.isLowerBody('Quads')).toBe(true);
  });
});
