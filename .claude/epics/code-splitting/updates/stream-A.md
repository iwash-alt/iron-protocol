---
issue: code-splitting
stream: React.lazy + Suspense boundaries
agent: feature-engineer
started: 2026-03-07T06:43:18Z
status: completed
---

# Stream A: React.lazy / Suspense Boundaries

## Scope
- `src/app/App.tsx` — lazy-load Onboarding, InstallBanner
- `src/app/AppShell.tsx` — lazy-load MeasurementsModal; audit other eager imports

## Completed
- Verified `Onboarding` is already converted to `React.lazy` with named-export pattern in `src/app/App.tsx`
- Verified `InstallBanner` is already converted to `React.lazy` with named-export pattern in `src/app/App.tsx`
- Both wrapped in `<Suspense>` with appropriate fallbacks: `<LoadingSpinner />` for Onboarding, `null` for InstallBanner
- Verified `MeasurementsModal` is already converted to `React.lazy` with named-export pattern in `src/app/AppShell.tsx`
- `MeasurementsModal` wrapped in `<Suspense fallback={null}>` (overlay — null fallback is correct)
- All other feature imports in AppShell.tsx are already lazy (WorkoutView, Dashboard, Profile, QuickWorkoutList, QuickWorkoutActive, HomeTab)
- Fixed pre-existing lint errors in `src/features/workout/ExerciseCard.test.tsx` (unused vars `statLabels`, `container`)
- All CI checks pass: tsc, eslint (0 warnings), 301 tests, build

## Build Output
- InstallBanner: 4 KB (separate lazy chunk)
- feature-onboarding: 4 KB
- All other feature chunks correctly split
