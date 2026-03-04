import { describe, it, expect } from 'vitest';
import { resolveEntitlements, createDefaultEntitlementStore, createTrial, createPromoUnlock } from './resolver';
import type { EntitlementStore } from '@/shared/types';

const now = new Date('2026-02-09T12:00:00Z');

function makeStore(overrides: Partial<EntitlementStore> = {}): EntitlementStore {
  return { ...createDefaultEntitlementStore(), ...overrides };
}

describe('resolveEntitlements', () => {
  describe('free plan', () => {
    it('has no features on free plan', () => {
      const store = makeStore();
      const resolved = resolveEntitlements(store, now);

      expect(resolved.features.size).toBe(0);
      expect(resolved.planId).toBe('free');
      expect(resolved.hasFeature('analytics_advanced')).toBe(false);
    });
  });

  describe('pro plan', () => {
    it('unlocks all pro features', () => {
      const store = makeStore({
        subscription: {
          planId: 'pro',
          billing: 'monthly',
          startedAt: '2026-01-01T00:00:00Z',
          expiresAt: '2026-03-01T00:00:00Z',
          cancelledAt: null,
        },
      });

      const resolved = resolveEntitlements(store, now);

      expect(resolved.planId).toBe('pro');
      expect(resolved.hasFeature('analytics_advanced')).toBe(true);
      expect(resolved.hasFeature('workout_unlimited_history')).toBe(true);
      expect(resolved.hasFeature('workout_export')).toBe(true);
      expect(resolved.hasFeature('platform_no_ads')).toBe(true);
    });

    it('does not include elite features', () => {
      const store = makeStore({
        subscription: {
          planId: 'pro',
          billing: 'monthly',
          startedAt: '2026-01-01T00:00:00Z',
          expiresAt: '2026-03-01T00:00:00Z',
          cancelledAt: null,
        },
      });

      const resolved = resolveEntitlements(store, now);

      expect(resolved.hasFeature('platform_cloud_sync')).toBe(false);
      expect(resolved.hasFeature('plan_ai_generation')).toBe(false);
      expect(resolved.hasFeature('workout_advanced_progression')).toBe(false);
    });
  });

  describe('expired subscription', () => {
    it('loses features when subscription expires', () => {
      const store = makeStore({
        subscription: {
          planId: 'pro',
          billing: 'monthly',
          startedAt: '2025-12-01T00:00:00Z',
          expiresAt: '2026-01-01T00:00:00Z', // expired before "now"
          cancelledAt: null,
        },
      });

      const resolved = resolveEntitlements(store, now);

      expect(resolved.planId).toBe('pro');
      expect(resolved.hasFeature('analytics_advanced')).toBe(false);
    });
  });

  describe('trials', () => {
    it('grants trial features while active', () => {
      const store = makeStore({
        trials: [
          createTrial('onboarding-trial', ['analytics_advanced', 'workout_export'], 14, 'onboarding'),
        ],
      });
      // Trials created with current date, so they're active
      const resolved = resolveEntitlements(store);

      expect(resolved.hasFeature('analytics_advanced')).toBe(true);
      expect(resolved.hasFeature('workout_export')).toBe(true);
      expect(resolved.activeTrials).toHaveLength(1);
    });

    it('loses trial features when expired', () => {
      const store = makeStore({
        trials: [{
          id: 'expired-trial',
          features: ['analytics_advanced'],
          startedAt: '2025-01-01T00:00:00Z',
          expiresAt: '2025-01-15T00:00:00Z', // way in the past
          source: 'onboarding' as const,
        }],
      });

      const resolved = resolveEntitlements(store, now);

      expect(resolved.hasFeature('analytics_advanced')).toBe(false);
      expect(resolved.activeTrials).toHaveLength(0);
    });

    it('prefers plan source over trial for same feature', () => {
      const store = makeStore({
        subscription: {
          planId: 'pro',
          billing: 'monthly',
          startedAt: '2026-01-01T00:00:00Z',
          expiresAt: '2026-03-01T00:00:00Z',
          cancelledAt: null,
        },
        trials: [
          createTrial('overlap-trial', ['analytics_advanced'], 7, 'manual'),
        ],
      });

      const resolved = resolveEntitlements(store, now);

      expect(resolved.hasFeature('analytics_advanced')).toBe(true);
      const source = resolved.featureSource('analytics_advanced');
      expect(source?.type).toBe('plan');
    });
  });

  describe('promos', () => {
    it('grants permanent promo features', () => {
      const store = makeStore({
        promos: [
          createPromoUnlock('ref-1', 'FRIEND10', ['platform_no_ads'], 'referral', null),
        ],
      });

      const resolved = resolveEntitlements(store, now);

      expect(resolved.hasFeature('platform_no_ads')).toBe(true);
      expect(resolved.activePromos).toHaveLength(1);
    });

    it('loses time-limited promo features when expired', () => {
      const store = makeStore({
        promos: [{
          id: 'expired-promo',
          code: 'SUMMER25',
          features: ['platform_no_ads'],
          grantedAt: '2025-06-01T00:00:00Z',
          expiresAt: '2025-07-01T00:00:00Z',
          source: 'event' as const,
        }],
      });

      const resolved = resolveEntitlements(store, now);

      expect(resolved.hasFeature('platform_no_ads')).toBe(false);
    });
  });

  describe('featureSource', () => {
    it('returns null for inaccessible features', () => {
      const store = makeStore();
      const resolved = resolveEntitlements(store, now);

      expect(resolved.featureSource('analytics_advanced')).toBeNull();
    });

    it('returns plan source for plan features', () => {
      const store = makeStore({
        subscription: {
          planId: 'elite',
          billing: 'yearly',
          startedAt: '2026-01-01T00:00:00Z',
          expiresAt: '2027-01-01T00:00:00Z',
          cancelledAt: null,
        },
      });

      const resolved = resolveEntitlements(store, now);
      const source = resolved.featureSource('platform_cloud_sync');

      expect(source?.type).toBe('plan');
      if (source?.type === 'plan') {
        expect(source.planId).toBe('elite');
      }
    });

    it('returns trial source with days remaining', () => {
      const store = makeStore({
        trials: [{
          id: 'active-trial',
          features: ['analytics_advanced'],
          startedAt: '2026-02-01T00:00:00Z',
          expiresAt: '2026-02-16T00:00:00Z', // 7 days from now
          source: 'onboarding' as const,
        }],
      });

      const resolved = resolveEntitlements(store, now);
      const source = resolved.featureSource('analytics_advanced');

      expect(source?.type).toBe('trial');
      if (source?.type === 'trial') {
        expect(source.daysRemaining).toBe(7);
      }
    });
  });

  describe('combined sources', () => {
    it('merges plan + trial + promo features', () => {
      const store = makeStore({
        subscription: {
          planId: 'pro',
          billing: 'monthly',
          startedAt: '2026-01-01T00:00:00Z',
          expiresAt: '2026-03-01T00:00:00Z',
          cancelledAt: null,
        },
        trials: [
          createTrial('elite-preview', ['platform_cloud_sync'], 7, 'upgrade_prompt'),
        ],
        promos: [
          createPromoUnlock('achievement-1', 'STREAK30', ['plan_ai_generation'], 'achievement', null),
        ],
      });

      const resolved = resolveEntitlements(store, now);

      // From plan
      expect(resolved.hasFeature('analytics_advanced')).toBe(true);
      // From trial
      expect(resolved.hasFeature('platform_cloud_sync')).toBe(true);
      // From promo
      expect(resolved.hasFeature('plan_ai_generation')).toBe(true);
    });
  });
});

describe('createDefaultEntitlementStore', () => {
  it('creates a free plan store', () => {
    const store = createDefaultEntitlementStore();

    expect(store.subscription.planId).toBe('free');
    expect(store.subscription.billing).toBeNull();
    expect(store.subscription.expiresAt).toBeNull();
    expect(store.trials).toEqual([]);
    expect(store.promos).toEqual([]);
  });
});
