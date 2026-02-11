# Iron Protocol — Technical Audit

**Date:** 2026-02-09
**Codebase:** 5,321 LOC across 51 files
**Stack:** React 18 + TypeScript 5.9 + Vite 7 + Zod 4
**Bundle:** 365 kB raw / 102 kB gzip (single chunk)

---

## 1. Component Architecture — Rating: 6/10

### Findings

**AppShell is a kitchen-sink component** (523 lines, `App.tsx:253`)
- 13 `useState` + 4 context subscriptions + 7 `useRef` for gestures
- Manages: tab navigation, swipe gestures, pull-to-refresh, PR celebrations, modal orchestration, streak computation
- **Fix:** Extract `useSwipeNavigation()`, `usePullToRefresh()`, `useWorkoutStreak()` hooks

**WorkoutView has 11 modal states** (`WorkoutView.tsx:26-36`)
- Every modal toggle causes full component re-render (330+ lines of modal JSX)
- **Fix:** Extract `ExerciseCard`, `RPEModal`, `NutritionPanel` as separate components

**Prop drilling through Dashboard** (`App.tsx:481-488`)
- 6 props passed from AppShell → Dashboard
- `demoMode` and `onToggleDemo` are passed but unused in Dashboard
- **Fix:** Dashboard should read DemoModeContext directly

**WorkoutContext mutates PlanContext** (`WorkoutContext.tsx:143-155`)
- `plan.updateExercise()` called from workout context for auto-regulation
- Creates tight coupling between workout and plan features
- **Fix:** Emit events or create shared progression service

**EntitlementProvider was not wired** (`App.tsx:104`)
- Full entitlement system existed but was unreachable
- **Fixed in this PR:** Now mounted in provider hierarchy

### TODO: Specific Refactors
- [ ] Extract `useSwipeNavigation()` hook from AppShell gesture handling
- [ ] Extract `usePullToRefresh()` hook from AppShell
- [ ] Extract `useWorkoutStreak()` from AppShell streak computation
- [ ] Split WorkoutView into ExerciseCard + modal sub-components
- [ ] Remove unused demoMode/onToggleDemo props from Dashboard
- [ ] Create ProgressionEngine service to decouple WorkoutContext from PlanContext

---

## 2. Performance — Rating: 7/10

### Bundle Analysis
| Metric | Current | Target |
|--------|---------|--------|
| JS Bundle (raw) | 365 kB | <200 kB |
| JS Bundle (gzip) | 102 kB | <60 kB |
| Modules loaded | 147 (all upfront) | ~80 critical path |
| Code splitting | None | Route-based |

### Re-render Cascades

**Demo mode toggle:** Reloads all 5 context providers synchronously
(`DemoModeContext.tsx:22-31` → WorkoutContext, NutritionContext, ProgressContext all reload)

**WorkoutContext is too wide:** Changing `newPR` state causes Dashboard/Profile to re-render unnecessarily. Every consumer re-renders on any state change.

### Missing Memoization
- `WorkoutView.tsx:40-88` — 6 handler functions missing `useCallback`
- `WorkoutView.tsx:136-195` — Exercise list should use React.memo ExerciseCard
- `WorkoutView.tsx:38` — `proteinGoal` recalculated every render

### TODO: Performance Fixes
- [ ] Add React.lazy() for Dashboard, Profile, QuickWorkout tabs
- [ ] Configure Vite manualChunks: vendor (react+react-dom), features
- [ ] Add React.memo to ExerciseCard component (once extracted)
- [ ] Add missing useCallback to WorkoutView handlers
- [ ] Split WorkoutContext into WorkoutSessionContext (sets/timer) + WorkoutHistoryContext (history/PRs)
- [ ] Debounce NutritionContext persistence (currently saves on every keystroke)

---

## 3. State Management — Rating: 7/10

### Current Architecture
```
localStorage → storage.ts (Zod validation) → React Context → Components
```

### Storage Adapter (Implemented)
Created `src/shared/storage/adapter.ts` — backend-agnostic interface:

```typescript
interface StorageAdapter {
  load<K>(key: K): Promise<StorageDataMap[K]>;
  save<K>(key: K, value: StorageDataMap[K]): Promise<void>;
  remove(key: StorageKey): Promise<void>;
  clear(): Promise<void>;
}
```

**Phase 1:** `LocalStorageAdapter` wraps existing storage.ts functions
**Phase 2:** `SupabaseAdapter` stub documented for cloud sync

### TODO: Storage Migration Path
- [ ] Migrate contexts to use `storage.load()`/`storage.save()` instead of direct imports
- [ ] Implement SupabaseAdapter with local cache + conflict resolution
- [ ] Add storage event listener for cross-tab sync
- [ ] Persist PlanContext state (currently lost on page refresh)
- [ ] Add app-level reset/logout that clears context memory state

### Direct localStorage Access (Policy Violation)
Files bypassing storage module:
- `InstallBanner.tsx:35` — reads `ironWorkoutHistory` directly
- `demoData.ts:185-203` — reads/writes demo keys directly
- `Profile.tsx:54-55` — calls `localStorage.removeItem()` directly

---

## 4. Testing — Rating: 8/10 (engine logic)

### Setup (Implemented)
- **Framework:** Vitest 4 + React Testing Library + jsdom
- **Config:** `vite.config.ts` with `test` block, globals enabled
- **Setup:** `src/test/setup.ts` — localStorage mock, matchMedia mock, auto-cleanup

### Test Coverage

| Test Suite | Tests | Status |
|------------|-------|--------|
| calculations.test.ts | 14 | All pass |
| workout.reducer.test.ts | 9 | All pass |
| plan.reducer.test.ts | 17 | All pass |
| resolver.test.ts | 14 | All pass |
| adapter.test.ts | 6 | All pass |
| **Total** | **60** | **60 pass** |

### TODO: Additional Tests
- [ ] Test auto-regulation logic (RPE-based progression) — requires extracting from WorkoutContext
- [ ] Test fatigue calculator (once built)
- [ ] Test storage migration v1→v2
- [ ] Test entitlement plan catalog completeness
- [ ] Integration tests for workout flow (complete set → check progression)
- [ ] Target: 90%+ coverage on engine logic (`utils/`, `*.reducer.ts`, `entitlements/`)

---

## 5. CI/CD — Rating: 9/10

### GitHub Actions (Implemented)
`.github/workflows/ci.yml` runs on every PR and push to main:

1. **Lint** — `eslint src/ --max-warnings 0`
2. **Type Check** — `tsc --noEmit`
3. **Test** — `vitest run --coverage` with threshold check
4. **Build** — `tsc && vite build` + bundle size gate (500 kB limit)

All jobs run in parallel; build depends on lint+typecheck+test passing.

### ESLint (Implemented)
`eslint.config.js` with flat config:
- TypeScript-ESLint recommended rules
- React hooks rules (rules-of-hooks, exhaustive-deps)
- No console.log (warn/error allowed)
- Unused vars warning (with `_` prefix ignore)

### TODO: CI/CD Enhancements
- [ ] Add branch protection on main (require CI pass + 1 review)
- [ ] Add Lighthouse CI for performance regression detection
- [ ] Add bundle size tracking (compare against main)
- [ ] Add preview deployment (Vercel/Netlify) on PR
- [ ] Add Dependabot for dependency updates

---

## 6. Free/Pro Gating — Rating: 8/10

### Architecture (Existing + Enhanced)

**Three-tier system:** Free → Pro ($4.99/mo) → Elite ($9.99/mo)

**Type layer:** `src/shared/types/entitlement.ts` — 18 features, 3 plans
**Plan catalog:** `src/shared/entitlements/plans.ts` — single source of truth
**Resolver:** `src/shared/entitlements/resolver.ts` — pure function merging subscriptions + trials + promos
**Context:** `src/features/entitlements/EntitlementContext.tsx` — now wired into app tree
**Gate component:** `src/shared/components/FeatureGate.tsx` — declarative feature gating

### useTier Hook (Implemented)
`src/hooks/useTier.ts` — lightweight hook for tier-based UI:

```typescript
const { tier, isPro, canAccess, cheapestPlanFor } = useTier();

if (canAccess('analytics_advanced')) { /* show feature */ }

const upgrade = cheapestPlanFor('platform_cloud_sync');
// → { name: 'Elite', monthlyPrice: 9.99 }
```

### Pro Feature Mapping
| Feature | Gate Key | Plan |
|---------|----------|------|
| Ghost system | `workout_advanced_progression` | Elite |
| Fatigue engine | `analytics_advanced` | Pro |
| Advanced insights | `analytics_advanced` | Pro |
| Unlimited history | `workout_unlimited_history` | Pro |
| Share cards | `workout_export` | Pro |
| Nutrition macros | `nutrition_macros` | Pro |
| Body composition | `analytics_body_composition` | Pro |
| Cloud sync | `platform_cloud_sync` | Elite |
| AI plans | `plan_ai_generation` | Elite |

### TODO: Gating Implementation
- [ ] Add FeatureGate wrappers to Dashboard analytics sections
- [ ] Add FeatureGate to workout history (30-day limit for free)
- [ ] Add FeatureGate to custom exercise creation
- [ ] Add FeatureGate to export functionality
- [ ] Build UpgradePrompt component with graceful messaging
- [ ] Add onboarding trial (14-day Pro) after profile creation
- [ ] Wire billing integration (Stripe/RevenueCat)

---

## Prioritised Action Plan

### P0 — Immediate (this PR) ✅
1. ~~Storage adapter interface~~ → `src/shared/storage/adapter.ts`
2. ~~useTier hook~~ → `src/hooks/useTier.ts`
3. ~~Wire EntitlementProvider~~ → `App.tsx`
4. ~~CI/CD pipeline~~ → `.github/workflows/ci.yml`
5. ~~ESLint config~~ → `eslint.config.js`
6. ~~Vitest + 60 tests~~ → 5 test files, all passing

### P1 — Next Sprint
7. Extract hooks from AppShell (swipe, pull-to-refresh, streak)
8. Split WorkoutView into sub-components
9. Add React.lazy() code splitting for tabs
10. Add FeatureGate to Dashboard/Profile sections
11. Build UpgradePrompt component
12. Add onboarding trial flow

### P2 — Phase 2
13. Implement SupabaseAdapter for cloud sync
14. Migrate contexts to use storage adapter
15. Add Lighthouse CI
16. Extract ProgressionEngine from WorkoutContext
17. Build fatigue calculator + tests
18. Reach 90%+ coverage on engine logic

### P3 — Phase 3
19. Bundle optimization (target <60 kB gzip)
20. Offline-first conflict resolution
21. Cross-tab state sync
22. E2E tests with Playwright
