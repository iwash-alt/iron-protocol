---
name: lazy-imports-appshell
status: closed
created: 2026-03-07T02:25:08Z
updated: 2026-03-07T02:33:10Z
epic: code-splitting
agent: feature-engineer
---

# Task: Implement React.lazy() imports and Suspense in AppShell.tsx

## Context

Replace static tab-component imports in `src/app/AppShell.tsx` with `React.lazy()` dynamic imports and wrap each render site in `<Suspense fallback={<LoadingSpinner />}>`.

## Steps

1. In `src/app/AppShell.tsx`:
   - Remove static imports of Dashboard, Profile, QuickWorkout, Onboarding.
   - Add `import { lazy, Suspense } from 'react'` (merge into existing react import).
   - Add `import LoadingSpinner from '@/shared/components/LoadingSpinner'` (if not already imported).
   - Declare lazy constants:
     ```ts
     const Dashboard = lazy(() => import('@/features/progress/...'));
     const Profile = lazy(() => import('@/features/profile/...'));
     const QuickWorkout = lazy(() => import('@/features/quick-workout/...'));
     const Onboarding = lazy(() => import('@/features/onboarding/...'));
     ```
   - Wrap each component's render site in `<Suspense fallback={<LoadingSpinner />}>`.

2. Run `npm run typecheck` locally to confirm no TS errors introduced.

## Acceptance Criteria

- `AppShell.tsx` uses `React.lazy()` for all 4 tab components
- Each lazy component is wrapped in `<Suspense fallback={<LoadingSpinner />}>`
- `npm run typecheck` passes with 0 errors
- `npm run lint` passes with 0 warnings
