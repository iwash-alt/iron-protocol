---
name: performance-fixes
status: pending
priority: high
agent: domain-engineer
depends-on: code-splitting
created: 2026-03-07T06:43:18Z
updated: 2026-03-07T06:43:18Z
---

# Epic: Performance Fixes — useCallback, useMemo, Debounce

## Goal
Audit and fix unstable references, missing memoization, and missing debounce patterns across features and hooks to prevent unnecessary re-renders and expensive recalculations.

## Scope
This is a **pure-domain + hooks** task. No React component layout changes. Focus on:
- Correctness of useCallback dep arrays
- useMemo for expensive derived state
- Debounce for rapid-fire event handlers

## Work Streams

### Stream A — Hook dep array audit (domain-engineer)
Files:
- `src/features/quick-workout/useQuickTemplates.ts`
- `src/features/progress/progress.context.tsx`
- `src/features/training-plan/PlanContext.tsx`
- `src/features/photos/ProfilePhotoContext.tsx`
- `src/features/readiness/ReadinessCheck.tsx`

Tasks:
1. Run: `npx eslint src/ --rule '{"react-hooks/exhaustive-deps": "error"}' --max-warnings 0`
2. Fix every exhaustive-deps violation found
3. Where callback identity needs to be stable (passed to child components), wrap with `useCallback`
4. Where derived values are expensive, wrap with `useMemo`

### Stream B — Debounce patterns (domain-engineer)
Files:
- `src/features/workout/WorkoutView.tsx`
- `src/features/profile/Profile.tsx`
- `src/shared/hooks/`

Tasks:
1. Search for inline onChange handlers that fire on every keystroke without debounce
2. Add debounce (300ms) to any search/filter inputs using the existing `useDebounce` hook (if exists) or create one in `src/shared/hooks/useDebounce.ts`
3. Export new hook from `src/shared/hooks/index.ts`

### Stream C — useMemo for computationally expensive operations (domain-engineer)
Files:
- `src/features/progress/Dashboard.tsx` (already has several useMemo — verify deps are correct)
- `src/features/workout/WorkoutContext.tsx`
- `src/hooks/useWorkout.ts`

Tasks:
1. Verify existing `useMemo` calls in Dashboard.tsx have complete dep arrays
2. Find any `.filter().map().sort()` chains without memoization on expensive datasets (workoutHistory)
3. Add `useMemo` with correct deps

## Acceptance Criteria
- [ ] Zero `react-hooks/exhaustive-deps` violations in `npx eslint src/ --max-warnings 0`
- [ ] No unnecessary re-renders in the workout list on exercise completion (verify with React DevTools Profiler)
- [ ] Debounce hook exists in `src/shared/hooks/` and is tested
- [ ] All new `useMemo`/`useCallback` have complete dep arrays
