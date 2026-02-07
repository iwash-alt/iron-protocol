import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  Feature, PlanId, BillingInterval,
  EntitlementStore, ResolvedEntitlements,
  TrialState, PromoUnlock,
} from '@/shared/types';
import {
  resolveEntitlements,
  createDefaultEntitlementStore,
  createTrial,
  createPromoUnlock,
} from '@/shared/entitlements';
import { loadEntitlementStore, saveEntitlementStore } from '@/shared/storage';

// ── Context value ───────────────────────────────────────────

interface EntitlementContextValue extends ResolvedEntitlements {
  /** Raw store (for debugging / admin UIs). */
  store: EntitlementStore;

  /** Upgrade to a paid plan. In production, called after payment confirmation. */
  setPlan: (planId: PlanId, billing: BillingInterval, expiresAt: string) => void;

  /** Downgrade to free (e.g., after cancellation expires). */
  revertToFree: () => void;

  /** Start a trial. Idempotent — ignores duplicate trial IDs. */
  startTrial: (id: string, features: Feature[], days: number, source?: TrialState['source']) => void;

  /** Apply a promo code. Idempotent — ignores duplicate promo IDs. */
  applyPromo: (id: string, code: string, features: Feature[], source: PromoUnlock['source'], expiresAt?: string | null) => void;

  /** Remove an expired or revoked trial. */
  removeTrial: (id: string) => void;

  /** Remove an expired or revoked promo. */
  removePromo: (id: string) => void;
}

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<EntitlementStore>(() =>
    loadEntitlementStore() ?? createDefaultEntitlementStore()
  );

  // Persist on every change
  const updateStore = useCallback((updater: (prev: EntitlementStore) => EntitlementStore) => {
    setStore(prev => {
      const next = updater(prev);
      saveEntitlementStore(next);
      return next;
    });
  }, []);

  const setPlan = useCallback((planId: PlanId, billing: BillingInterval, expiresAt: string) => {
    updateStore(prev => ({
      ...prev,
      subscription: {
        planId,
        billing,
        startedAt: new Date().toISOString(),
        expiresAt,
        cancelledAt: null,
      },
    }));
  }, [updateStore]);

  const revertToFree = useCallback(() => {
    updateStore(prev => ({
      ...prev,
      subscription: {
        planId: 'free',
        billing: null,
        startedAt: new Date().toISOString(),
        expiresAt: null,
        cancelledAt: null,
      },
    }));
  }, [updateStore]);

  const startTrial = useCallback((
    id: string,
    features: Feature[],
    days: number,
    source: TrialState['source'] = 'manual',
  ) => {
    updateStore(prev => {
      if (prev.trials.some(t => t.id === id)) return prev; // idempotent
      return { ...prev, trials: [...prev.trials, createTrial(id, features, days, source)] };
    });
  }, [updateStore]);

  const applyPromo = useCallback((
    id: string,
    code: string,
    features: Feature[],
    source: PromoUnlock['source'],
    expiresAt: string | null = null,
  ) => {
    updateStore(prev => {
      if (prev.promos.some(p => p.id === id)) return prev; // idempotent
      return { ...prev, promos: [...prev.promos, createPromoUnlock(id, code, features, source, expiresAt)] };
    });
  }, [updateStore]);

  const removeTrial = useCallback((id: string) => {
    updateStore(prev => ({
      ...prev,
      trials: prev.trials.filter(t => t.id !== id),
    }));
  }, [updateStore]);

  const removePromo = useCallback((id: string) => {
    updateStore(prev => ({
      ...prev,
      promos: prev.promos.filter(p => p.id !== id),
    }));
  }, [updateStore]);

  // Resolve entitlements (memoized on store reference)
  const resolved = useMemo(() => resolveEntitlements(store), [store]);

  const value: EntitlementContextValue = useMemo(() => ({
    ...resolved,
    store,
    setPlan,
    revertToFree,
    startTrial,
    applyPromo,
    removeTrial,
    removePromo,
  }), [resolved, store, setPlan, revertToFree, startTrial, applyPromo, removeTrial, removePromo]);

  return (
    <EntitlementContext.Provider value={value}>
      {children}
    </EntitlementContext.Provider>
  );
}

// ── Hooks ───────────────────────────────────────────────────

/** Full entitlement context. Use for mutation operations (setPlan, startTrial, etc). */
export function useEntitlements(): EntitlementContextValue {
  const ctx = useContext(EntitlementContext);
  if (!ctx) throw new Error('useEntitlements must be used within EntitlementProvider');
  return ctx;
}

/** Check if the current user can access a specific feature. */
export function useCanAccess(feature: Feature): boolean {
  const { hasFeature } = useEntitlements();
  return hasFeature(feature);
}

/** Get the source/reason for access to a feature (for UI messaging). */
export function useFeatureSource(feature: Feature) {
  const { featureSource } = useEntitlements();
  return featureSource(feature);
}
