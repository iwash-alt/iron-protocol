---
name: workoutview-optimisations
status: open
created: 2026-03-07T02:45:24Z
updated: 2026-03-07T02:45:24Z
epic: performance-fixes
github: https://github.com/iwash-alt/iron-protocol/issues/89
agent: feature-engineer
---

# Task: Implement WorkoutView.tsx optimisations — useCallback, useMemo, ExerciseCard extraction

## Context

Apply three of the four performance fixes to `WorkoutView.tsx` and create the new `ExerciseCard.tsx` component.

## Steps

1. In `src/features/workout/WorkoutView.tsx`:
   - Import `useCallback` and `useMemo` from react (merge into existing import).
   - Wrap these 6 handlers in `useCallback` with correct dependency arrays:
     - `handleCompleteSet`
     - `handleRPESelect`
     - `handleEndWorkout`
     - `handleApplyTemplate`
     - `handleUpdateExercise`
     - `handleSkipExercise`
   - Wrap the `proteinGoal` derivation in `useMemo` with the correct dependency array (profile data inputs only).
   - Replace the inline ExerciseCard JSX block with `<ExerciseCard {...props} />` and add the import.

2. Create `src/features/workout/ExerciseCard.tsx`:
   - Extract the ExerciseCard JSX from WorkoutView into this new file.
   - Define and export the props interface (`ExerciseCardProps`).
   - Wrap the default export in `React.memo()` with a custom comparator that only re-renders when `exercise.id` changes or the exercise's completion count changes.

3. Run `npm run typecheck` to confirm 0 errors.

## Acceptance Criteria

- All 6 handlers are wrapped in `useCallback` with correct dependency arrays
- `proteinGoal` is wrapped in `useMemo`
- `src/features/workout/ExerciseCard.tsx` exists with `React.memo` wrapper
- `WorkoutView.tsx` imports and uses `<ExerciseCard />`
- `npm run typecheck` passes with 0 errors
- `npm run lint` passes with 0 warnings (exhaustive-deps satisfied)
