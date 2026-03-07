---
name: code-splitting
status: completed
created: 2026-03-07T02:23:49Z
progress: 100%
prd: .claude/prds/code-splitting.md
github: https://github.com/iwash-alt/iron-protocol/issues/81
---

# Epic: Code Splitting — React.lazy() Route-Based Loading

## Overview

Convert the app from a single 365 kB bundle to a multi-chunk build using React.lazy() for route-level components and Vite `manualChunks` for vendor/data/feature splits. Two files are modified; no new dependencies, no new components. The existing `LoadingSpinner` component is reused as the Suspense fallback.

## Architecture Decisions

- **React.lazy() at tab level only** — Split at the AppShell tab boundary (Dashboard, Profile, QuickWorkout, Onboarding). Sub-components within a tab stay in their feature chunk. This is the highest-impact / lowest-risk split point.
- **Single Suspense boundary per tab slot** — One `<Suspense fallback={<LoadingSpinner />}>` per lazy component in AppShell rather than deeply nested boundaries. Keeps the implementation simple and the loading UX consistent.
- **Vite manualChunks over dynamic `import()` hints** — `manualChunks` in `vite.config.ts` gives deterministic chunk names and fine-grained control over the vendor and data splits without modifying individual source files.
- **exercises.ts in its own `data` chunk** — At ~117 KB it is the single largest module. Splitting it out of the critical path alone yields the majority of the bundle size reduction.
- **Reuse existing LoadingSpinner** — `src/shared/components/LoadingSpinner.tsx` already exists; no new UI work required.

## Technical Approach

### AppShell.tsx changes
- Replace static imports of `Dashboard`, `Profile`, `QuickWorkout`, `Onboarding` with `React.lazy(() => import('...'))`.
- Wrap each lazy component render site in `<Suspense fallback={<LoadingSpinner />}>`.
- Keep all non-lazy imports (AppShell shell structure, tab nav, hooks) as-is — they stay in the critical-path chunk.

### vite.config.ts changes
Add `build.rollupOptions.output.manualChunks`:
```ts
manualChunks(id) {
  if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor';
  if (id.includes('src/data/exercises')) return 'data';
  if (id.includes('src/features/progress') || id.includes('src/features/workout')) return 'feature-workout';
  if (id.includes('src/features/profile') || id.includes('src/features/photos')) return 'feature-profile';
  if (id.includes('src/features/quick-workout')) return 'feature-quick-workout';
  if (id.includes('src/features/onboarding')) return 'feature-onboarding';
}
```
Exact groupings to be confirmed by inspecting actual bundle output.

### No other file changes
The `LoadingSpinner` import in AppShell is already available (it's in `src/shared/components`). No new files, no new packages.

## Task Breakdown

- [ ] **Task 1 — Audit current AppShell imports** — Read `AppShell.tsx` and `vite.config.ts`, confirm exact import paths for tab components and current Vite config shape (feature-engineer)
- [ ] **Task 2 — Implement lazy imports + Suspense in AppShell.tsx** — Replace static tab imports with `React.lazy()`, add `<Suspense>` wrappers using `LoadingSpinner` (feature-engineer)
- [ ] **Task 3 — Add manualChunks to vite.config.ts** — Configure vendor / data / per-feature chunk splits (feature-engineer)
- [ ] **Task 4 — Build and verify chunks** — Run `npm run build`, confirm multiple named chunks exist in `dist/assets/`, measure initial chunk size (qa-engineer)
- [ ] **Task 5 — Run full CI suite** — `npm run typecheck && npm run lint && npm run test` must pass with zero errors/warnings (qa-engineer)

## Dependencies

- `src/app/AppShell.tsx` — modified by feature-engineer
- `vite.config.ts` — modified by feature-engineer
- `src/shared/components/LoadingSpinner.tsx` — consumed (read-only)
- No npm package additions

## Success Criteria (Technical)

- `dist/assets/` contains ≥ 4 JS chunks after `npm run build`
- Largest single chunk ≤ 80 kB gzip (measured with `du` or build output)
- `npm run typecheck` — 0 errors
- `npm run lint` — 0 warnings
- `npm run test` — all tests pass
- Tab switching in `npm run preview` produces no console errors

## Estimated Effort

- 2 files modified, ~50–80 lines of code total
- Low risk: no logic changes, no new dependencies, no schema changes
- Critical path: Task 2 (AppShell) → Task 3 (vite.config) → Task 4 (build verify) → Task 5 (CI)
