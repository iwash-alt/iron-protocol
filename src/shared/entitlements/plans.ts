import type { PlanDefinition, PlanId } from '@/shared/types';

/**
 * Plan catalog — the single source of truth for what each plan includes.
 *
 * To add a new plan:
 *   1. Add the PlanId to types/entitlement.ts
 *   2. Add a PlanDefinition here
 *   3. That's it — the resolver, context, and FeatureGate pick it up automatically
 *
 * To add a feature to a plan:
 *   1. Add the Feature to types/entitlement.ts
 *   2. Add it to the relevant plan's `features` array here
 */
export const PLAN_CATALOG: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    features: [],
    monthlyPrice: null,
    yearlyPrice: null,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    features: [
      'workout_unlimited_history',
      'workout_custom_exercises',
      'workout_export',
      'nutrition_macros',
      'analytics_advanced',
      'analytics_body_composition',
      'plan_custom_templates',
      'platform_no_ads',
    ],
    monthlyPrice: 4.99,
    yearlyPrice: 39.99,
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    features: [
      // Elite includes everything in Pro
      'workout_unlimited_history',
      'workout_custom_exercises',
      'workout_export',
      'workout_advanced_progression',
      'nutrition_macros',
      'nutrition_meal_plans',
      'analytics_advanced',
      'analytics_body_composition',
      'plan_custom_templates',
      'plan_ai_generation',
      'platform_cloud_sync',
      'platform_no_ads',
      'platform_priority_support',
    ],
    monthlyPrice: 9.99,
    yearlyPrice: 79.99,
  },
};

/** Get a plan definition by ID. Falls back to free. */
export function getPlan(planId: PlanId): PlanDefinition {
  return PLAN_CATALOG[planId] ?? PLAN_CATALOG.free;
}

/** All plan definitions sorted by price ascending. */
export function getAllPlans(): PlanDefinition[] {
  return Object.values(PLAN_CATALOG).sort(
    (a, b) => (a.monthlyPrice ?? 0) - (b.monthlyPrice ?? 0)
  );
}
