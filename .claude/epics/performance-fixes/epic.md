---
name: performance-fixes
status: backlog
created: 2026-03-07T02:45:24Z
progress: 0%
prd: .claude/prds/performance-fixes.md
github: https://github.com/iwash-alt/iron-protocol/issues/87
---

# Epic: Performance Fixes — Memoisation & Re-render Prevention

## Overview

Four targeted React performance optimisations for the active workout session flow. All fixes use built-in React APIs (`useCallback`, `useMemo`, `React.memo`) and a hand-rolled debounce. Two files are modified, two new files are created. No new npm dependencies. No behaviour changes.

## Architecture Decisions

- **useCallback scope** — Wrap all 6 handler functions in WorkoutView.tsx that are passed as props to children. Dependency arrays must satisfy `react-hooks/exhaustive-deps` (error-level rule); no suppression comments allowed.
- **ExerciseCard extraction** — Moving the inline JSX block to its own file is the prerequisite for `React.memo`. The component receives stable props (exercise data + memoised callbacks); the custom comparator compares `exercise.id` and a completion-count derived from exercise state, which are the only props that affect visual output.
- **useMemo for proteinGoal** — The derived value depends only on profile data (weight/goal fields). Wrapping prevents recalculation on every WorkoutView render caused by unrelated state updates.
- **Debounce in NutritionContext** — Only the localStorage *write* side-effect is debounced; React state updates remain synchronous so the input stays responsive. Implemented with `useRef`-based timeout (no library). 500 ms is the minimum per PRD; not configurable.
- **No new dependencies** — All APIs are React 18.2 built-ins or hand-rolled utilities.

## Technical Approach

### Files to Modify

| File | Change |
|------|--------|
| `src/features/workout/WorkoutView.tsx` | Wrap 6 handlers in `useCallback`; wrap `proteinGoal` in `useMemo`; replace inline ExerciseCard JSX with `<ExerciseCard />` import |
| NutritionContext file (path confirmed during implementation) | Add 500 ms `useRef`-based debounce to localStorage write |

### Files to Create

| File | Purpose |
|------|---------|
| `src/features/workout/ExerciseCard.tsx` | Extracted component wrapped in `React.memo()` with custom comparator |
| `src/features/workout/ExerciseCard.test.tsx` | Unit tests — props interface, render correctness, memo behaviour |

### Implementation Notes

- Navigate WorkoutView by **function name**, not line number (lines shift after edits).
- Handlers to wrap: `handleCompleteSet`, `handleRPESelect`, `handleEndWorkout`, `handleApplyTemplate`, `handleUpdateExercise`, `handleSkipExercise`.
- `React.memo` second argument: `(prev, next) => prev.exercise.id === next.exercise.id && completionCount(prev) === completionCount(next)` — exact shape confirmed during implementation after reading the props interface.
- Debounce pattern: `const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)` inside the context; clear + reset on each state change before writing to localStorage.
- NutritionContext path: audit `src/hooks/useNutrition.ts` or `src/features/nutrition/` during implementation.

## Task Breakdown

- [ ] **Task 1 — Audit source files** — Read WorkoutView.tsx (full file) and NutritionContext file; confirm handler signatures, ExerciseCard JSX block boundaries, proteinGoal derivation, and current localStorage write location (feature-engineer)
- [ ] **Task 2 — Implement WorkoutView optimisations** — Add `useCallback` to 6 handlers, `useMemo` to proteinGoal, extract ExerciseCard JSX into new file with `React.memo` (feature-engineer)
- [ ] **Task 3 — Debounce NutritionContext localStorage** — Add 500 ms `useRef` debounce to the localStorage write; verify in-memory state remains synchronous (feature-engineer)
- [ ] **Task 4 — Write ExerciseCard tests** — Props interface test, render test, memo no-re-render test using render-count helper (qa-engineer)
- [ ] **Task 5 — Full CI verification** — `npm run typecheck && npm run lint && npm run test` must pass with 0 errors/warnings; all ≥ 60 existing tests pass (qa-engineer)

## Dependencies

- `src/features/workout/WorkoutView.tsx` — modified by feature-engineer
- `src/features/workout/ExerciseCard.tsx` — new file, feature-engineer
- `src/features/workout/ExerciseCard.test.tsx` — new file, qa-engineer
- NutritionContext file (TBD) — modified by feature-engineer
- No npm package additions

## Success Criteria (Technical)

- `npm run typecheck` — 0 errors
- `npm run lint` — 0 warnings (`react-hooks/exhaustive-deps` satisfied)
- `npm run test` — all tests pass (≥ 60 existing + new ExerciseCard tests)
- `ExerciseCard.tsx` exists at `src/features/workout/ExerciseCard.tsx`
- `ExerciseCard.test.tsx` exists and covers props interface, render, and memo behaviour

## Estimated Effort

- 4 files changed/created, ~100–150 lines of code
- Low risk: pure optimisations with no behaviour changes, no new dependencies
- Critical path: Task 1 (audit) → Task 2 (WorkoutView) → Task 3 (NutritionContext) → Task 4 (tests) → Task 5 (CI)
