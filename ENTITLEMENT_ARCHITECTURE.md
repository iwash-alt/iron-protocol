# Entitlement Architecture — ADR

## Status: Proposed

## Problem

Iron Protocol needs to support subscription plans, feature gating, time-limited trials, and promotional unlocks — without coupling gating logic to any specific monetization strategy. Adding a new plan, feature, or unlock source should not require changes to core workout/nutrition/analytics logic.

## Core Principle: Entitlement-Based Access

The architecture separates **what** a user can access from **how** they got access.

```
┌─────────────────────────────────────────────────────┐
│              Sources (independent)                    │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Sub Plan │  │  Trials  │  │  Promo Unlocks   │   │
│  │ (Pro)    │  │ (14-day) │  │  (referral code) │   │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │              │                 │              │
│       └──────────────┼─────────────────┘              │
│                      ▼                                │
│           ┌──────────────────┐                        │
│           │    Resolver      │  Pure function          │
│           │  (merges sources │  No React, no storage   │
│           │   into features) │                        │
│           └────────┬─────────┘                        │
│                    ▼                                  │
│         Set<Feature> + sourceMap                      │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Consumption (React)                      │
│                                                       │
│  useCanAccess('analytics_advanced') → boolean         │
│  useFeatureSource('analytics_advanced') → source      │
│  <FeatureGate feature="...">children</FeatureGate>   │
└─────────────────────────────────────────────────────┘
```

**Components never ask "is the user on Pro?"** — they ask **"can the user access advanced analytics?"** This means:

- A free user with an active trial sees advanced analytics
- A Pro subscriber sees advanced analytics
- A user with a referral promo sees advanced analytics
- The `<AdvancedAnalytics>` component doesn't know or care which case applies

## File Layout

```
src/
  shared/
    types/
      entitlement.ts        # Feature, PlanId, SubscriptionState, TrialState, PromoUnlock
    entitlements/
      plans.ts              # Plan catalog: what features each plan includes
      resolver.ts           # Pure function: EntitlementStore → ResolvedEntitlements
      index.ts              # Public API
    storage/
      schemas.ts            # Zod schemas for entitlement persistence (added)
      storage.ts            # loadEntitlementStore / saveEntitlementStore (added)
    components/
      FeatureGate.tsx       # <FeatureGate feature="..." fallback={...}>
  features/
    entitlements/
      EntitlementContext.tsx # React provider + hooks (useEntitlements, useCanAccess)
```

## How Each Scenario Works

### Adding a new subscription plan

1. Add the `PlanId` to `types/entitlement.ts` (e.g., `'team'`)
2. Add a `PlanDefinition` to `entitlements/plans.ts`
3. Done. The resolver picks it up. No UI changes unless you want a new pricing card.

### Adding a new gatable feature

1. Add the `Feature` string to `types/entitlement.ts` (e.g., `'workout_supersets'`)
2. Add it to the relevant plan(s) in `plans.ts`
3. Wrap the UI with `<FeatureGate feature="workout_supersets">`
4. Done. Existing subscribers on qualifying plans get it immediately.

### Starting a trial

```tsx
const { startTrial } = useEntitlements();

// Give the user 14 days of Pro-level analytics
startTrial('onboarding-analytics-trial', ['analytics_advanced', 'analytics_body_composition'], 14, 'onboarding');
```

The trial is stored, the resolver includes those features, `<FeatureGate>` opens.
When the trial expires, the resolver excludes those features, `<FeatureGate>` closes.
No cleanup code needed.

### Applying a promo code

```tsx
const { applyPromo } = useEntitlements();

// Permanent unlock from a referral
applyPromo('ref-abc123', 'FRIEND2024', ['workout_export', 'platform_no_ads'], 'referral');

// Time-limited event unlock
applyPromo('summer-event', 'SUMMER24', ['analytics_advanced'], 'event', '2024-09-01T00:00:00Z');
```

### Checking access in business logic (non-React)

```ts
import { resolveEntitlements } from '@/shared/entitlements';

// In a use case or service that doesn't have React context:
const resolved = resolveEntitlements(store);
if (resolved.hasFeature('workout_export')) {
  // allow export
}
```

### Showing upgrade prompts

```tsx
<FeatureGate
  feature="analytics_advanced"
  fallback={<UpgradePrompt feature="analytics_advanced" />}
>
  <AdvancedAnalytics />
</FeatureGate>
```

### Showing "trial expires" badges

```tsx
const source = useFeatureSource('analytics_advanced');
if (source?.type === 'trial') {
  return <Badge>Trial: {source.daysRemaining} days left</Badge>;
}
```

## Design Decisions

### Why not a simple `isPro` boolean?

A boolean gates on the plan, not the feature. When you add a third plan, every
`isPro` check becomes `isPro || isElite`. When you add trials, every check becomes
`isPro || isElite || hasActiveTrial`. This scales O(plans × features × sources).

The entitlement pattern scales O(1) for consumers: `hasFeature('x')`.

### Why are trials and promos separate from the subscription?

They have different lifecycles:
- Subscriptions renew and have billing intervals
- Trials are one-time, fixed-duration, and can be feature-specific
- Promos can be permanent or time-limited, and stack with subscriptions

Merging them would require a complex state machine. Keeping them separate and
merging at resolution time is simpler and more flexible.

### Why is the resolver a pure function?

- **Testability**: Unit test every combination of plan + trial + promo without React or localStorage
- **Portability**: The same resolver works in React context, in a service worker, or server-side
- **Predictability**: Given the same `EntitlementStore`, you always get the same `ResolvedEntitlements`

### Why localStorage instead of a billing backend?

This is the client-only MVP. The `EntitlementStore` shape is designed to be
hydrated from either localStorage or an API response. When a backend is added:

1. Replace `loadEntitlementStore()` with an API call
2. Keep localStorage as a cache for offline access
3. The resolver, context, hooks, and `FeatureGate` don't change at all

### Feature source priority (plan > trial > promo)

When a feature is available from multiple sources, the resolver prefers showing
the most "permanent" source: plan > trial > promo. This avoids confusing
messages like "Trial: 5 days left" when the user's plan already includes the feature.

## Future Extensions (no rewrites needed)

| Extension | What changes |
|-----------|-------------|
| Add billing backend (Stripe) | Replace storage load/save with API calls. Resolver unchanged. |
| A/B testing features | Add an `experiments` source array to `EntitlementStore`. Add a resolver clause. |
| Team/org plans | Add `teamId` to `SubscriptionState`. Resolver merges personal + team features. |
| Usage-based limits | Add a `UsageQuota` type alongside features. Resolver returns remaining quota. |
| Feature rollout (% of users) | Add a `rollout` source. Resolver checks user ID hash against rollout %. |
| Offline entitlements | Already works — localStorage is the source of truth. Add TTL for staleness. |

## Provider Wiring

Add `EntitlementProvider` to the app's provider stack:

```tsx
// In App.tsx or AppProvider.tsx
<EntitlementProvider>
  <DemoModeProvider>
    <PlanProvider>
      ...
    </PlanProvider>
  </DemoModeProvider>
</EntitlementProvider>
```

`EntitlementProvider` should be near the root (outside feature providers)
since any feature may need to check entitlements.
