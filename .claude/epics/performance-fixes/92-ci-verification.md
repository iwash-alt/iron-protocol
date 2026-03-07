---
name: ci-verification
status: open
created: 2026-03-07T02:45:24Z
updated: 2026-03-07T02:45:24Z
epic: performance-fixes
github: https://github.com/iwash-alt/iron-protocol/issues/92
agent: qa-engineer
---

# Task: Full CI suite verification

## Context

Run the complete CI check to confirm all four performance fixes integrate cleanly with the existing codebase. No regressions allowed.

## Steps

1. Run `npm run typecheck` — must produce 0 errors.
2. Run `npm run lint` — must produce 0 warnings (`react-hooks/exhaustive-deps` is set to error; all dependency arrays must be correct).
3. Run `npm run test` — all tests must pass. Minimum ≥ 60 existing tests plus new ExerciseCard tests.
4. Run `npm run build` — must succeed without errors.
5. Report results: pass/fail per step, test count, any warnings.

## Acceptance Criteria

- `npm run typecheck` — 0 errors
- `npm run lint` — 0 warnings
- `npm run test` — all tests pass (≥ 60 existing + new ExerciseCard tests)
- `npm run build` — succeeds
