---
name: exercisecard-tests
status: open
created: 2026-03-07T02:45:24Z
updated: 2026-03-07T02:45:24Z
epic: performance-fixes
github: https://github.com/iwash-alt/iron-protocol/issues/91
agent: qa-engineer
---

# Task: Write ExerciseCard unit tests

## Context

Create `src/features/workout/ExerciseCard.test.tsx` with tests for props interface, render correctness, and memo behaviour.

## Steps

1. Create `src/features/workout/ExerciseCard.test.tsx`.
2. Write a test that renders `<ExerciseCard />` with valid props and asserts the component renders correctly.
3. Write a test that verifies `ExerciseCard` does **not** re-render when unrelated props change — use a render-count helper (e.g., a `vi.fn()` wrapper or `renderCount` ref pattern).
4. Write a test that verifies `ExerciseCard` **does** re-render when `exercise.id` changes.
5. Verify `ExerciseCardProps` type is correctly typed (TypeScript compile-time check covered by typecheck step).
6. Run `npm run test -- ExerciseCard` to confirm new tests pass.

## Acceptance Criteria

- `src/features/workout/ExerciseCard.test.tsx` exists
- Tests cover: renders with valid props, memo skips re-render on unrelated change, memo re-renders on exercise.id change
- All new tests pass
- No existing tests broken
