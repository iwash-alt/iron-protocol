---
name: audit-source-files
status: open
created: 2026-03-07T02:45:24Z
updated: 2026-03-07T02:45:24Z
epic: performance-fixes
github: https://github.com/iwash-alt/iron-protocol/issues/88
agent: feature-engineer
---

# Task: Audit WorkoutView.tsx and NutritionContext source files

## Context

Before modifying files, confirm the exact structure of the code to be changed. This task produces no file edits — only knowledge passed implicitly to Tasks 2 and 3.

## Steps

1. Read `src/features/workout/WorkoutView.tsx` in full — locate:
   - The 6 handler functions: `handleCompleteSet`, `handleRPESelect`, `handleEndWorkout`, `handleApplyTemplate`, `handleUpdateExercise`, `handleSkipExercise`
   - The `proteinGoal` derivation and its inputs
   - The inline ExerciseCard JSX block (currently rendered inside WorkoutView)
2. Find the NutritionContext localStorage write — search `src/hooks/useNutrition.ts`, `src/features/nutrition/`, or `src/context/` for the file that writes nutrition state to localStorage.
3. Confirm the ExerciseCard props interface (what props WorkoutView passes to the inline block).
4. Document findings — pass to Task 2/3 implicitly through file edits.

## Acceptance Criteria

- Handler signatures and dependency inputs are known
- ExerciseCard props interface is confirmed
- NutritionContext file path is known
- No files modified in this task
