---
issue: code-splitting
stream: QA Review + ExerciseCard Tests
agent: qa-engineer
started: 2026-03-07T06:43:18Z
status: in_progress
---

# QA: Code-Splitting Review + ExerciseCard Tests

## Responsibilities
1. Monitor feature-engineer changes to App.tsx and AppShell.tsx
2. Run full CI gate after each stream completes
3. Write tests for ExerciseCard (`src/features/workout/ExerciseCard.test.tsx`)

## ExerciseCard Test Plan
- renders exercise name and target sets/reps
- shows warmup sets when isWarmupOpen=true
- calls onCompleteSet when the complete button is pressed
- displays rest timer when isResting=true
- shows progression banner when progression prop is provided
- calls onReorder when up/down arrows clicked
- shows volume delta (current vs previous)
- isFirst=true hides the up-reorder button; isLast=true hides down-reorder button

## Progress
- Starting implementation
