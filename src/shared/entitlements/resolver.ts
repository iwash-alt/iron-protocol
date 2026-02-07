import type {
  Feature, EntitlementStore, ResolvedEntitlements, FeatureSource,
  TrialState, PromoUnlock,
} from '@/shared/types';
import { getPlan } from './plans';

/**
 * Resolve an EntitlementStore into a flat set of accessible features.
 *
 * This is a PURE FUNCTION — no side effects, no React, no storage.
 * It merges three independent sources:
 *
 *   1. Subscription plan features (if plan is active/not expired)
 *   2. Active trial features (not expired)
 *   3. Active promo features (not expired or permanent)
 *
 * The result is a ResolvedEntitlements object that answers:
 *   - hasFeature('analytics_advanced') → boolean
 *   - featureSource('analytics_advanced') → { type: 'trial', daysRemaining: 5 }
 */
export function resolveEntitlements(
  store: EntitlementStore,
  now: Date = new Date(),
): ResolvedEntitlements {
  const features = new Set<Feature>();
  const sourceMap = new Map<Feature, FeatureSource>();

  // --- 1. Subscription plan ---
  const plan = getPlan(store.subscription.planId);
  const planActive = isSubscriptionActive(store.subscription, now);

  if (planActive) {
    for (const feature of plan.features) {
      features.add(feature);
      sourceMap.set(feature, { type: 'plan', planId: plan.id });
    }
  }

  // --- 2. Active trials ---
  const activeTrials = store.trials.filter(t => isTrialActive(t, now));

  for (const trial of activeTrials) {
    for (const feature of trial.features) {
      features.add(feature);
      // Trial source only overwrites plan source if user doesn't have the plan feature
      // (prefer showing "Included in your plan" over "Trial: X days left")
      if (!sourceMap.has(feature)) {
        sourceMap.set(feature, {
          type: 'trial',
          trial,
          daysRemaining: daysUntil(trial.expiresAt, now),
        });
      }
    }
  }

  // --- 3. Active promos ---
  const activePromos = store.promos.filter(p => isPromoActive(p, now));

  for (const promo of activePromos) {
    for (const feature of promo.features) {
      features.add(feature);
      if (!sourceMap.has(feature)) {
        sourceMap.set(feature, {
          type: 'promo',
          promo,
          daysRemaining: promo.expiresAt ? daysUntil(promo.expiresAt, now) : null,
        });
      }
    }
  }

  return {
    features,
    planId: store.subscription.planId,
    activeTrials,
    activePromos,
    hasFeature: (f: Feature) => features.has(f),
    featureSource: (f: Feature) => sourceMap.get(f) ?? null,
  };
}

// ── Helpers ──────────────────────────────────────────────────

function isSubscriptionActive(
  sub: EntitlementStore['subscription'],
  now: Date,
): boolean {
  // Free plan is always active
  if (sub.planId === 'free') return true;

  // Paid plan: check expiration
  if (sub.expiresAt && new Date(sub.expiresAt) < now) return false;

  return true;
}

function isTrialActive(trial: TrialState, now: Date): boolean {
  return new Date(trial.expiresAt) > now;
}

function isPromoActive(promo: PromoUnlock, now: Date): boolean {
  if (!promo.expiresAt) return true; // permanent
  return new Date(promo.expiresAt) > now;
}

function daysUntil(isoDate: string, now: Date): number {
  const target = new Date(isoDate);
  const ms = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// ── Factory helpers ─────────────────────────────────────────

/** Default store for a new user (free plan, no trials, no promos). */
export function createDefaultEntitlementStore(): EntitlementStore {
  return {
    subscription: {
      planId: 'free',
      billing: null,
      startedAt: new Date().toISOString(),
      expiresAt: null,
      cancelledAt: null,
    },
    trials: [],
    promos: [],
  };
}

/** Create a trial that starts now and lasts `days` days. */
export function createTrial(
  id: string,
  features: Feature[],
  days: number,
  source: TrialState['source'] = 'manual',
): TrialState {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + days);

  return {
    id,
    features,
    startedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    source,
  };
}

/** Create a promo unlock. Pass null expiresAt for permanent. */
export function createPromoUnlock(
  id: string,
  code: string,
  features: Feature[],
  source: PromoUnlock['source'],
  expiresAt: string | null = null,
): PromoUnlock {
  return {
    id,
    code,
    features,
    grantedAt: new Date().toISOString(),
    expiresAt,
    source,
  };
}
