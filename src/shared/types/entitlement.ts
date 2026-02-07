// ============================================================
// Entitlement System — Core Types
// ============================================================
// The central idea: separate WHAT a user can access (Feature)
// from HOW they got access (subscription, trial, promo).
//
// All gating logic asks: "does the user have Feature X?"
// It never asks: "is the user on Plan Y?" — that's an
// implementation detail resolved upstream.
// ============================================================

/**
 * Every gatable capability in the app. Add new entries here
 * as features are built — this is the single source of truth.
 *
 * Naming convention: DOMAIN_CAPABILITY
 */
export type Feature =
  // Workout features
  | 'workout_unlimited_history'    // View full workout history (free: last 30 days)
  | 'workout_custom_exercises'     // Create custom exercises beyond the catalog
  | 'workout_advanced_progression' // Auto-regulation with periodization schemes
  | 'workout_export'               // Export workout data (CSV, JSON)

  // Nutrition features
  | 'nutrition_macros'             // Full macro tracking beyond protein/water
  | 'nutrition_meal_plans'         // AI-generated meal suggestions

  // Analytics features
  | 'analytics_advanced'           // Volume trends, muscle balance, fatigue index
  | 'analytics_body_composition'   // Body comp charts over time

  // Plan features
  | 'plan_custom_templates'        // Create & save custom workout templates
  | 'plan_ai_generation'           // AI-generated plans based on goals

  // Platform features
  | 'platform_cloud_sync'          // Sync data across devices
  | 'platform_no_ads'              // Remove advertisements
  | 'platform_priority_support';   // Priority support channel

/**
 * Subscription plan identifiers. Each maps to a set of Features
 * defined in the plan catalog (plans.ts).
 */
export type PlanId = 'free' | 'pro' | 'elite';

/**
 * Billing interval for paid plans.
 */
export type BillingInterval = 'monthly' | 'yearly';

/**
 * Persistent subscription state. Stored in localStorage,
 * later synced from a billing backend.
 */
export interface SubscriptionState {
  planId: PlanId;
  billing: BillingInterval | null;     // null for free plan
  startedAt: string;                   // ISO date
  expiresAt: string | null;            // null = no expiration (free)
  cancelledAt: string | null;          // set when user cancels, still active until expiresAt
}

/**
 * A time-limited unlock of specific features. Used for:
 * - New user trials ("try Pro for 14 days")
 * - Feature-specific trials ("try advanced analytics for 7 days")
 */
export interface TrialState {
  id: string;                          // Unique trial identifier
  features: Feature[];                 // What this trial unlocks
  startedAt: string;                   // ISO date
  expiresAt: string;                   // ISO date
  source: 'onboarding' | 'upgrade_prompt' | 'retention' | 'manual';
}

/**
 * A permanent or time-limited feature unlock from a promo.
 * Used for: referral rewards, seasonal events, achievement unlocks.
 */
export interface PromoUnlock {
  id: string;                          // Unique promo identifier
  code: string;                        // The promo code used
  features: Feature[];                 // What this promo unlocks
  grantedAt: string;                   // ISO date
  expiresAt: string | null;            // null = permanent unlock
  source: 'referral' | 'event' | 'achievement' | 'manual';
}

/**
 * Full entitlement state persisted to storage.
 * The EntitlementContext hydrates from this on startup.
 */
export interface EntitlementStore {
  subscription: SubscriptionState;
  trials: TrialState[];
  promos: PromoUnlock[];
}

/**
 * Resolved entitlements — the output of the resolver.
 * This is what React components consume.
 */
export interface ResolvedEntitlements {
  /** The set of features the user currently has access to. */
  features: Set<Feature>;

  /** The active subscription plan. */
  planId: PlanId;

  /** Active trials (not expired). */
  activeTrials: TrialState[];

  /** Active promos (not expired). */
  activePromos: PromoUnlock[];

  /** Check if a specific feature is accessible. */
  hasFeature: (feature: Feature) => boolean;

  /**
   * Why a feature is accessible. Returns null if not accessible.
   * Useful for UI: "Available via Pro plan" vs "Trial: 3 days left"
   */
  featureSource: (feature: Feature) => FeatureSource | null;
}

/**
 * Describes why a user has access to a given feature.
 * Drives UI copy like "Included in your Pro plan" or "Trial expires in 3 days".
 */
export type FeatureSource =
  | { type: 'plan'; planId: PlanId }
  | { type: 'trial'; trial: TrialState; daysRemaining: number }
  | { type: 'promo'; promo: PromoUnlock; daysRemaining: number | null };

/**
 * Plan catalog entry — metadata for display and feature mapping.
 */
export interface PlanDefinition {
  id: PlanId;
  name: string;
  features: Feature[];
  monthlyPrice: number | null;         // null = free
  yearlyPrice: number | null;          // null = free
}
