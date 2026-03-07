---
name: ci-verification
status: open
created: 2026-03-07T02:25:08Z
updated: 2026-03-07T02:25:08Z
epic: code-splitting
agent: qa-engineer
---

# Task: Run full CI suite and confirm zero regressions

## Context

Run the complete local CI check to ensure the code-splitting changes introduce no regressions in types, lint, or tests.

## Steps

1. Run the full CI pipeline locally:
   ```bash
   npm run typecheck && npm run lint && npm run test && npm run build
   ```
2. All four commands must exit 0.
3. If any step fails, report the failure with full output and block merge.

## Acceptance Criteria

- `npm run typecheck` — 0 errors
- `npm run lint` — 0 warnings (strict: `--max-warnings 0`)
- `npm run test` — all tests pass (vitest run)
- `npm run build` — exits 0, dist produced
- No new test files required (existing tests cover the changed logic)
