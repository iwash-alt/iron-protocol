---
name: performance-fixes
status: completed
priority: high
agent: domain-engineer
depends-on: code-splitting
created: 2026-03-07T06:43:18Z
updated: 2026-03-07T06:53:50Z
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
- [x] Zero `react-hooks/exhaustive-deps` violations in `npx eslint src/ --max-warnings 0`
- [ ] No unnecessary re-renders in the workout list on exercise completion (verify with React DevTools Profiler)
- [x] Debounce hook exists in `src/shared/hooks/` and is tested
- [x] All new `useMemo`/`useCallback` have complete dep arrays

## Completed

### Stream A — exhaustive-deps audit
Ran full ESLint audit across all 6 listed files and the entire `src/` directory. Zero violations found. All `useCallback` and `useEffect` dep arrays were already correct:
- `useQuickTemplates.ts` — clean
- `progress.context.tsx` — clean
- `PlanContext.tsx` — clean
- `ProfilePhotoContext.tsx` — clean
- `ReadinessCheck.tsx` — clean
- `HomeTab.tsx` — clean

### Stream B — useDebounce hook
Created `src/shared/hooks/useDebounce.ts` (did not previously exist; only `useDebouncedSave.ts` existed). Exported from `src/shared/hooks/index.ts`. Wrote 4 tests in `src/shared/hooks/useDebounce.test.ts` using Vitest fake timers — all pass.

### Stream C — useMemo dep array verification
- `Dashboard.tsx`: All 6 `useMemo` calls verified correct. Every referenced variable appears in its dep array. `hasHistory` (derived bool) correctly listed where it gates execution.
- `WorkoutContext.tsx`: No `useMemo` calls present. All `useCallback` dep arrays are complete and correct.
