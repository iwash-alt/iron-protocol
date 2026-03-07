---
name: code-splitting
status: in-progress
priority: high
agent: feature-engineer
created: 2026-03-07T06:43:18Z
updated: 2026-03-07T06:43:18Z
---

# Epic: Code-Splitting & Lazy Loading

## Goal
Reduce initial bundle size and improve time-to-interactive by applying React.lazy + Suspense boundaries and tuning Vite manualChunks.

## Current State
- `AppShell.tsx` already lazy-loads: WorkoutView, Dashboard, Profile, QuickWorkoutList, QuickWorkoutActive, HomeTab ✅
- `App.tsx` eagerly imports: Onboarding, InstallBanner (these load on every cold start even when unnecessary)
- `vite.config.ts` has manualChunks for: vendor, data, feature-workout, feature-profile, feature-quick-workout, feature-onboarding
- Missing chunks: nutrition, readiness, training-plan, analytics

## Work Streams

### Stream A — React.lazy / Suspense (feature-engineer)
Files:
- `src/app/App.tsx`
- `src/app/AppShell.tsx`

Tasks:
1. Lazy-load `Onboarding` in `App.tsx` — wrap with `<Suspense fallback={<LoadingSpinner />}>`
2. Lazy-load `InstallBanner` in `App.tsx` — it's a progressive-enhancement banner, safe to defer
3. Lazy-load `MeasurementsModal` in `AppShell.tsx` — already eagerly imported
4. Audit all remaining eager feature imports in AppShell and convert if safe

### Stream B — Vite manualChunks (feature-engineer)
Files:
- `vite.config.ts`

Tasks:
1. Add chunk for `src/features/nutrition/` → `feature-nutrition`
2. Add chunk for `src/features/readiness/` → `feature-readiness`
3. Add chunk for `src/features/training-plan/` → `feature-training-plan`
4. Add chunk for `src/training/` + `src/analytics/` → `domain-core`
5. Add chunk for `src/data/animations` and `src/data/exercise-guides` → `data-guides`

## Acceptance Criteria
- [ ] `npm run build` succeeds with zero TS/lint errors
- [ ] Initial bundle (vendor + main) < 300 KB gzipped
- [ ] All lazy components wrapped in Suspense with appropriate skeleton fallbacks
- [ ] No regressions in existing tests
