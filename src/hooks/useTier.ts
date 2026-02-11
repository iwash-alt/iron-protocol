/**
 * useTier — lightweight hook for tier-based feature gating.
 *
 * Reads the user's subscription tier from the EntitlementContext
 * (which reads from localStorage, and later from Supabase auth).
 *
 * Components use this to check feature access and show upgrade prompts.
 *
 * Usage:
 *
 *   const { tier, isPro, isElite, canAccess, UpgradePrompt } = useTier();
 *
 *   // Simple tier check
 *   if (isPro) { ... }
 *
 *   // Feature-level check (preferred — decoupled from plan names)
 *   if (canAccess('analytics_advanced')) { ... }
 *
 *   // Render upgrade prompt for gated feature
 *   {!canAccess('workout_export') && <UpgradePrompt feature="workout_export" />}
 */

import { useMemo, useCallback } from 'react';
import type { Feature, PlanId } from '@/shared/types';
import { useEntitlements, useCanAccess } from '@/features/entitlements/EntitlementContext';
import { getAllPlans } from '@/shared/entitlements';

export interface TierInfo {
  /** Current plan ID: 'free' | 'pro' | 'elite' */
  tier: PlanId;

  /** Convenience booleans */
  isFree: boolean;
  isPro: boolean;
  isElite: boolean;

  /** Check if user can access a specific feature (from any source: plan, trial, promo) */
  canAccess: (feature: Feature) => boolean;

  /** Get the cheapest plan that includes a given feature (for upgrade prompts) */
  cheapestPlanFor: (feature: Feature) => { name: string; monthlyPrice: number | null } | null;

  /** Whether the user has any active trial */
  hasActiveTrial: boolean;

  /** Number of days remaining on their subscription (null if free or permanent) */
  daysRemaining: number | null;
}

export function useTier(): TierInfo {
  const entitlements = useEntitlements();
  const allPlans = useMemo(() => getAllPlans(), []);

  const tier = entitlements.planId;
  const isFree = tier === 'free';
  const isPro = tier === 'pro';
  const isElite = tier === 'elite';

  const canAccess = useCallback(
    (feature: Feature) => entitlements.hasFeature(feature),
    [entitlements],
  );

  const cheapestPlanFor = useCallback(
    (feature: Feature) => {
      const plan = allPlans.find(p => p.features.includes(feature));
      if (!plan) return null;
      return { name: plan.name, monthlyPrice: plan.monthlyPrice };
    },
    [allPlans],
  );

  const hasActiveTrial = entitlements.activeTrials.length > 0;

  const daysRemaining = useMemo(() => {
    const sub = entitlements.store.subscription;
    if (!sub.expiresAt) return null;
    const ms = new Date(sub.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }, [entitlements.store.subscription]);

  return useMemo(() => ({
    tier,
    isFree,
    isPro,
    isElite,
    canAccess,
    cheapestPlanFor,
    hasActiveTrial,
    daysRemaining,
  }), [tier, isFree, isPro, isElite, canAccess, cheapestPlanFor, hasActiveTrial, daysRemaining]);
}

/**
 * Standalone hook for checking a single feature.
 * Lighter than useTier() when you only need one check.
 */
export { useCanAccess };
