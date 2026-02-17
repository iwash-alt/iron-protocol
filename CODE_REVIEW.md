# Code Review Findings

## Scope reviewed
- `src/features/training-plan/plan.reducer.ts`
- `src/features/training-plan/plan.reducer.test.ts`
- `src/features/workout/WorkoutView.tsx`

## Findings

### 1) Critical: `createCustomWorkout` in `plan.reducer.ts` contains an incomplete merge and is syntactically invalid
- The function starts one implementation using `dayExercises`, then abruptly begins another implementation using `dayConfigs` before the first one is closed.
- This leaves the file in an unparsable state and blocks TypeScript compilation.
- Observed around line 129 onward, with the break beginning near line 155.

### 2) Critical: `plan.reducer.test.ts` has a broken `describe` block and missing braces
- The `REORDER_DAY_EXERCISES` test case never closes before `describe('CREATE_CUSTOM_WORKOUT', ...)` starts.
- The file ends with unmatched braces, causing Vitest/esbuild transform failure.
- This prevents execution of reducer tests.

### 3) Critical: `WorkoutView.tsx` contains duplicated state declarations and an interrupted function body
- `showAddExercise`, `showExerciseHistory`, and `celebrate` are declared twice in the same scope.
- A `plan.createCustomWorkout` call is interrupted by a second block that redefines handlers (`handleCustomWorkoutDaysChange`, `handleCreateCustomWorkout`).
- The interrupted JSX/function flow causes widespread parser errors.

## Verification commands run
- `npm test`
- `npm run typecheck`

Both commands fail due to syntax-level issues in the files above.
