---
name: performance-fixes
description: Memoisation and re-render prevention — useCallback handlers, React.memo ExerciseCard, useMemo, and debounced NutritionContext persistence
status: backlog
created: 2026-03-07T02:43:07Z
---

# PRD: Performance Fixes — Memoisation & Re-render Prevention

## Executive Summary

Four targeted React performance fixes for the active workout session flow. The fixes prevent unnecessary re-renders during high-frequency interactions (completing sets, typing nutrition values) using idiomatic React optimisation: `useCallback`, `React.memo`, `useMemo`, and a debounce on localStorage writes. No architectural changes; no new dependencies.

## Problem Statement

### What is the problem?

During an active workout, completing a set triggers a cascade of re-renders: the handler functions are recreated on every render (no `useCallback`), the ExerciseCard component re-renders even when its props haven't changed (no `React.memo`), and a protein-goal computation runs on every render even though its inputs rarely change (no `useMemo`). Separately, the NutritionContext writes to localStorage on every individual keystroke, causing up to 10+ writes per second when a user types a food weight.

### Specific symptoms

- **WorkoutView.tsx handlers (lines 40–88):** `handleCompleteSet`, `handleRPESelect`, `handleEndWorkout`, `handleApplyTemplate`, `handleUpdateExercise`, `handleSkipExercise` are recreated on every render because they lack `useCallback`. Any child component receiving them as props re-renders unnecessarily.
- **ExerciseCard (lines 136–195):** Currently rendered inline in WorkoutView, so it cannot be memoised at all. It re-renders on every parent state change even when the exercise data hasn't changed.
- **proteinGoal (line 38):** A derived calculation that runs on every WorkoutView render regardless of whether its inputs (profile data) changed.
- **NutritionContext:** localStorage write on every `onChange` event — potentially 10–20 writes per second during data entry.

### Why now?

The code-splitting epic reduced the initial load cost. The next bottleneck is runtime re-render cost during the core loop: the active workout session. React DevTools Profiler confirms multiple redundant renders per set-completion event.

## User Stories

### Primary: Gym-goer logging a workout set

**As a** user completing a set mid-workout,
**I want** the UI to respond immediately without lag,
**So that** I can log my reps and move on without friction.

**Acceptance Criteria:**
- Completing a set causes ≤ 1 ExerciseCard re-render (down from 3–5 without memoisation)
- No visible jank or delay on set-completion tap

### Secondary: User entering nutrition data

**As a** user typing a food weight or calorie count,
**I want** the input to feel instant,
**So that** I don't experience typing lag caused by synchronous localStorage writes on every keystroke.

**Acceptance Criteria:**
- localStorage is written at most once per 500 ms during continuous typing
- Input field remains fully responsive; no dropped characters

### Developer / QA

**As a** developer,
**I want** ExerciseCard to be a standalone component with its own file and tests,
**So that** it can be independently tested, reviewed, and further optimised.

**Acceptance Criteria:**
- `src/features/workout/ExerciseCard.tsx` exists as a standalone file
- ExerciseCard has unit tests for its props interface and memo behaviour
- All 60+ existing tests continue to pass

## Requirements

### Functional Requirements

**FR-1: useCallback for WorkoutView handlers**
The following 6 functions in `WorkoutView.tsx` must be wrapped in `useCallback` with correct dependency arrays:
- `handleCompleteSet`
- `handleRPESelect`
- `handleEndWorkout`
- `handleApplyTemplate`
- `handleUpdateExercise`
- `handleSkipExercise`

**FR-2: Extract and memoize ExerciseCard**
- Create `src/features/workout/ExerciseCard.tsx` as a standalone component
- Extract the JSX currently at WorkoutView lines 136–195 into this file
- Wrap the exported component in `React.memo()`
- The memo comparator should only re-render when `exercise.id` changes or the exercise's completion count changes (props that affect visual output)

**FR-3: useMemo for proteinGoal**
The `proteinGoal` derivation at WorkoutView line 38 must be wrapped in `useMemo` with the correct dependency array (profile data inputs).

**FR-4: Debounce NutritionContext localStorage persistence**
Add a 500 ms debounce to the function that writes nutrition state to localStorage. Immediate in-memory state updates must remain synchronous (React state); only the side-effect write to localStorage is debounced.

### Non-Functional Requirements

**NFR-1: No new dependencies**
All four fixes use built-in React APIs (`useCallback`, `useMemo`, `React.memo`) and a hand-rolled debounce or the existing utility layer. No new npm packages.

**NFR-2: TypeScript strict compliance**
All new code must pass `tsc --noEmit` with zero errors. No `as any`, no `// @ts-ignore`.

**NFR-3: Lint compliance**
`eslint src/ --max-warnings 0`. In particular, `react-hooks/exhaustive-deps` must be satisfied — all dependency arrays must be correct (no suppression comments).

**NFR-4: Test coverage**
- All existing tests (currently ≥ 60) must pass.
- New unit tests for `ExerciseCard.tsx`: props interface, renders correctly, does not re-render when unrelated props change (verify with `vi.spyOn` or render-count helper).
- No tests required for useCallback/useMemo directly (implementation details), but the ExerciseCard extraction requires test coverage.

**NFR-5: No behaviour change**
The fixes are pure optimisations. No visible feature change to the user. Set completion, RPE selection, end-workout flow, nutrition entry — all must behave identically to before.

## Success Criteria

| Metric | Before | Target |
|--------|--------|--------|
| ExerciseCard re-renders per set completion | 3–5 | ≤ 1 |
| localStorage writes during typing (per second) | 10–20 | ≤ 2 (500 ms debounce) |
| ExerciseCard test file exists | No | Yes |
| All existing tests pass | ≥ 60 pass | ≥ 60 pass (no regression) |
| `npm run typecheck` | pass | pass |
| `npm run lint` | pass | pass |

## Constraints & Assumptions

- **React 18.2** — `useCallback`, `useMemo`, `React.memo` all available natively.
- **Vitest** — test framework already configured; new tests use the same setup.
- **`react-hooks/exhaustive-deps` is set to `error`** — dependency arrays must be complete and correct; no lint suppressions allowed.
- **No custom memo comparator library** — the `React.memo` second argument (custom comparator) is plain JavaScript comparing `exercise.id` and completion count.
- **Debounce implementation** — use a simple `useRef`-based debounce inside the NutritionContext hook, or extract a `debounce` utility to `src/shared/utils/`. Either approach is acceptable as long as it doesn't introduce a new npm package.
- **WorkoutView lines 40–88 and 136–195** are reference points based on the current file; actual line numbers may shift during implementation — navigate by function/component name, not line number.

## Out of Scope

- Virtualisation of exercise lists (separate concern)
- Service worker caching or network-level optimisation
- Profiling or optimising components outside WorkoutView and NutritionContext
- Adding React DevTools Profiler instrumentation to the codebase
- Any changes to the training domain logic (`src/training/`)
- Reducing the debounce delay below 500 ms or making it configurable
- Migrating localStorage to IndexedDB or any other storage backend

## Dependencies

### Internal files to modify

| File | Change |
|------|--------|
| `src/features/workout/WorkoutView.tsx` | Add `useCallback` to 6 handlers; add `useMemo` to proteinGoal; replace inline ExerciseCard JSX with `<ExerciseCard />` import |
| `src/features/workout/ExerciseCard.tsx` | **New file** — extracted + memoized component |
| `src/features/workout/ExerciseCard.test.tsx` | **New file** — unit tests for ExerciseCard |
| NutritionContext file (exact path TBD from code audit) | Add 500 ms debounce to localStorage write |

### Agent Assignment
- **Implementation:** `feature-engineer` — all four fixes
- **QA / Tests:** `qa-engineer` — new ExerciseCard tests, full CI suite verification
