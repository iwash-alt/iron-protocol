---
name: audit-appshell-imports
status: closed
created: 2026-03-07T02:25:08Z
updated: 2026-03-07T02:33:10Z
epic: code-splitting
agent: feature-engineer
---

# Task: Audit current AppShell imports and Vite config

## Context

Before modifying files, confirm the exact import paths for the four tab components in `AppShell.tsx` and the current shape of `vite.config.ts` so subsequent tasks use the correct identifiers.

## Steps

1. Read `src/app/AppShell.tsx` — locate imports for Dashboard, Profile, QuickWorkout, Onboarding; note exact import paths.
2. Read `vite.config.ts` — note existing `build` config; confirm `rollupOptions` is absent or present.
3. Read `src/shared/components/LoadingSpinner.tsx` — confirm the default export name.
4. Document findings as a comment in the epic or pass to Task 2 implicitly through file edits.

## Acceptance Criteria

- Exact import paths for all 4 tab components are known
- Vite config shape (especially whether `build.rollupOptions` already exists) is confirmed
- No files modified in this task
