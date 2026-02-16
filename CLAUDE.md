# CLAUDE.md — Iron Protocol

## Project Overview

Iron Protocol is a progressive overload fitness tracker with RPE-based auto-regulation for strength training. It is a React SPA (PWA-ready) deployed to GitHub Pages at `https://iwash-alt.github.io/iron-protocol`.

**Tech stack:** TypeScript 5.9, React 18.2, Vite 7.3, Vitest 4, Zod 4

## Quick Reference

```bash
npm run dev          # Start dev server on port 3000
npm run build        # TypeScript check + Vite production build
npm run typecheck    # Type check only (tsc --noEmit)
npm run test         # Run all tests once (vitest run)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Tests with v8 coverage report
npm run lint         # ESLint with zero warnings allowed
```

## CI Pipeline

CI runs on every push to `main` and every PR targeting `main` (`.github/workflows/ci.yml`). It runs these checks in order:

1. **Type check** — `tsc --noEmit`
2. **Lint** — `eslint src/ --max-warnings 0` (strict: zero warnings)
3. **Tests** — `vitest run --reporter=verbose`
4. **Build** — `npm run build`
5. **Bundle size gate** — warns if `dist/` exceeds 1.5 MB

A separate deploy workflow (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on push to `main`.

All CI checks must pass before merging. Run `npm run typecheck && npm run lint && npm run test` locally before pushing.

## Project Structure

```
src/
├── app/              # App root — App.tsx (routing/providers), AppShell.tsx (tab nav/shell)
├── features/         # Feature modules organized by domain
│   ├── entitlements/ # Feature gating context (Free/Pro/Elite tiers)
│   ├── nutrition/    # Water and protein tracking
│   ├── onboarding/   # Profile setup flow
│   ├── photos/       # Profile and progress photos
│   ├── profile/      # User profile display/edit
│   ├── progress/     # Dashboard, insights, fatigue, measurements
│   ├── pwa/          # PWA install banner
│   ├── quick-workout/# HIIT/bodyweight circuit templates
│   ├── readiness/    # Morning readiness check-in
│   ├── training-plan/# Plan management, template selection
│   └── workout/      # Active workout session, suggestions, summary
├── shared/           # Shared utilities across features
│   ├── components/   # Icon, MiniChart, FeatureGate, ErrorBoundary, LoadingSpinner
│   ├── constants/    # Animation/UI timing constants
│   ├── demo/         # Demo mode context and sample data
│   ├── entitlements/ # Pure entitlement resolver logic and plan definitions
│   ├── hooks/        # Reusable hooks (swipe, pull-to-refresh, streak, timer, etc.)
│   ├── storage/      # Storage adapter, Zod schemas, batch operations
│   ├── theme/        # Design tokens and global styles
│   ├── types/        # Entity types (exercise, workout, profile, nutrition, etc.)
│   └── utils/        # Calculations (1RM, warmup sets), date utils, audio, image processing
├── training/         # Pure domain logic — progression, fatigue, suggestions, engine
├── analytics/        # Workout statistics and advanced insights
├── domain/           # Domain entities — exercise catalog, nutrition, templates
├── data/             # Static data — exercise DB (117 KB), templates, guides, animations
├── hooks/            # Feature-level hooks (useWorkout, useNutrition, useProfile, etc.)
├── ui/               # Non-feature UI — ExerciseAnimation, MuscleMap, Homepage
└── test/             # Test setup (localStorage mock, matchMedia mock)
```

## Architecture

**State management:** React Context + `useReducer` per feature domain. No Redux/Zustand. Each feature has its own context provider.

**Key contexts:** PlanContext, WorkoutContext, NutritionContext, ProgressContext, EntitlementContext, ProfilePhotoContext, DemoModeContext.

**Storage layer:** `src/shared/storage/` provides a backend-agnostic `StorageAdapter` interface. Currently uses `LocalStorageAdapter` (localStorage). Data is validated with Zod schemas on load. Storage keys are prefixed with `iron` (e.g., `ironProfile`, `ironWorkoutHistory`).

**Training domain:** `src/training/` contains pure functions (no React/storage dependencies) for RPE-based progression, fatigue calculation, and progression suggestions.

**Entitlement system:** Three tiers (Free/Pro/Elite) with a pure resolver function. Use `<FeatureGate feature="...">` component or `useTier()` hook for feature gating.

**Path alias:** `@/*` maps to `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`).

## Code Conventions

### TypeScript

- **Strict mode** is enabled. Do not use `// @ts-ignore` or `as any`.
- `@typescript-eslint/no-explicit-any` is set to `error`. Never use `any`; use `unknown` with type narrowing or proper generics.
- Unused variables must be prefixed with `_` (e.g., `_unused`). This applies to both variables and function arguments.
- Use `const` by default (`prefer-const` is enforced). `var` is banned.

### React

- `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` are both set to `error`. Always include all dependencies in hook dependency arrays.
- Use functional components with hooks. No class components.
- Feature modules live in `src/features/<feature-name>/`.

### Logging

- `console.log` triggers an ESLint warning. Use `console.warn` or `console.error` instead.

### Imports

- Use the `@/` path alias for imports from `src/`. Example: `import { something } from '@/shared/utils'`.
- Barrel exports (`index.ts`) exist in `shared/components`, `shared/hooks`, `shared/storage`, `shared/types`, `shared/utils`, `shared/entitlements`, `training/`, and `analytics/`.

### Testing

- **Framework:** Vitest with `globals: true` (no need to import `describe`, `it`, `expect`).
- **Environment:** jsdom with React Testing Library.
- **Test files:** Co-located with source as `*.test.ts` or `*.test.tsx`.
- **Setup:** `src/test/setup.ts` provides localStorage mock, matchMedia mock, and automatic cleanup after each test.
- **Coverage:** v8 provider. Coverage targets the pure logic layers: `training/`, `shared/storage/`, `shared/utils/`, `shared/entitlements/`, `analytics/`. UI/theme/demo/data directories are excluded.
- Tests should be fast and not depend on external services or real DOM APIs.

### File Organization

- Each feature directory may contain its own context, reducer, components, and tests.
- Reducers follow the pattern: `<feature>.reducer.ts` with a matching `<feature>.reducer.test.ts`.
- Pure domain logic belongs in `src/training/` or `src/shared/utils/`, not in React components.
- Types are defined in `src/shared/types/` with barrel exports.

## Key Files

| File | Purpose |
|------|---------|
| `src/app/App.tsx` | Root component — routing, context provider tree |
| `src/app/AppShell.tsx` | Main layout shell — tab navigation, swipe, pull-to-refresh |
| `src/training/progression.ts` | RPE-based weight/rep progression logic |
| `src/training/fatigue.ts` | Cumulative fatigue tracking and deload suggestions |
| `src/shared/storage/adapter.ts` | StorageAdapter interface and LocalStorageAdapter |
| `src/shared/storage/schemas.ts` | Zod validation schemas for all persisted data |
| `src/shared/entitlements/resolver.ts` | Pure entitlement resolver (subscription + trial + promo) |
| `src/data/exercises.ts` | Exercise database (~117 KB, 100+ exercises) |
| `vite.config.ts` | Build config, path aliases, test config, coverage settings |
| `eslint.config.js` | Flat ESLint config with TypeScript and React hooks rules |

## Common Workflows

### Adding a new feature

1. Create a directory under `src/features/<feature-name>/`.
2. Add context/reducer if the feature has its own state.
3. Wire the context provider into `src/app/App.tsx`.
4. If the feature is gated, add it to `src/shared/entitlements/plans.ts` and use `<FeatureGate>`.
5. Add tests for any pure logic.

### Adding a new exercise

Add the exercise to `src/data/exercises.ts`. Include muscle group, equipment, and category metadata. Optionally add animation data in `src/data/animations.ts` and a technique guide in `src/data/exercise-guides.ts`.

### Working with storage

Use the `StorageAdapter` interface from `src/shared/storage/adapter.ts`. Do not access `localStorage` directly in feature code. Data loaded from storage is validated through Zod schemas in `src/shared/storage/schemas.ts`.

### Running the full CI check locally

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```
