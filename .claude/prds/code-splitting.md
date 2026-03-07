---
name: code-splitting
description: Route-based code splitting via React.lazy() and Vite manualChunks to reduce initial load size below 80 kB gzip
status: backlog
created: 2026-03-07T02:22:46Z
---

# PRD: Code Splitting — React.lazy() Route-Based Loading

## Executive Summary

Iron Protocol currently ships a single 365 kB (102 kB gzip) JavaScript bundle. Every user — including those on gym WiFi or mobile data — must download the entire app before seeing anything. By adopting React.lazy() for route-level components and Vite's `manualChunks` for vendor/feature/data splits, the critical-path initial load will drop below 80 kB gzip, improving perceived performance and Time to Interactive.

## Problem Statement

### What is the problem?
The app bundles all 147 modules into one chunk at build time. Features like the exercise database (`exercises.ts`, ~117 KB alone), Dashboard, Profile, QuickWorkout, and Onboarding are downloaded even when a user only needs the active tab.

### Why does this matter?
- Gym networks and mobile data connections are often congested or throttled.
- A 102 kB gzip initial payload is ~4× larger than the recommended budget for a fast mobile web app.
- Users experience a blank screen while the full bundle parses and evaluates, even for a simple login or readiness check.
- Every new feature added in the future compounds the problem unless chunking is established now.

### Why now?
The codebase is at a stable architecture milestone with clearly separated feature directories. Adding code splitting now prevents the snowball effect as more features are added.

## User Stories

### Primary Persona: Gym-goer on limited connectivity
**As a** user starting a workout session on gym WiFi,
**I want** the app to load quickly on first visit,
**So that** I can log my first set without waiting for unrelated features to download.

**Acceptance Criteria:**
- Initial page load delivers < 80 kB gzip to the browser
- The active tab (e.g., Workout) is interactive within 2 seconds on a simulated 3G connection
- Switching to another tab (e.g., Profile) triggers a lazy chunk load, visible via a LoadingSpinner

### Secondary Persona: Returning daily user
**As a** user who opens the app every morning for a readiness check,
**I want** the shell to appear instantly,
**So that** the app feels snappy even though I haven't used it since yesterday (cold cache).

**Acceptance Criteria:**
- App shell (AppShell, tab nav) is in the critical-path chunk
- Feature chunks are cached after first load; subsequent navigations are instant

### Developer / QA persona
**As a** developer,
**I want** the Vite build to output multiple named chunks,
**So that** I can verify the split is working correctly and measure chunk sizes in CI.

**Acceptance Criteria:**
- `npm run build` produces at minimum: `vendor`, one or more `feature-*` chunks, and a `data` chunk
- No runtime errors on tab switching in a production build (`npm run preview`)
- Existing tests continue to pass after the change

## Requirements

### Functional Requirements

**FR-1: Lazy-load tab components**
`src/app/AppShell.tsx` must replace static imports of Dashboard, Profile, QuickWorkout, and Onboarding with `React.lazy()` dynamic imports.

**FR-2: Suspense boundary with LoadingSpinner**
Each lazy-loaded component (or a single wrapping Suspense) must use `<Suspense fallback={<LoadingSpinner />}>`. The `LoadingSpinner` already exists at `src/shared/components/LoadingSpinner.tsx`; do not create a new one.

**FR-3: Vite manualChunks configuration**
`vite.config.ts` must define `build.rollupOptions.output.manualChunks` with at minimum:
- `vendor` — `react`, `react-dom` and their sub-packages
- `data` — `src/data/exercises.ts` (and optionally other large static data files)
- Per-feature chunks for each lazy-loaded tab module (e.g., `feature-dashboard`, `feature-profile`, etc.)

**FR-4: No regressions**
All existing Vitest tests must pass. No TypeScript errors (`tsc --noEmit`). No ESLint warnings (`eslint src/ --max-warnings 0`).

### Non-Functional Requirements

**NFR-1: Initial chunk target**
The critical-path JavaScript delivered on first load must be ≤ 80 kB gzip.

**NFR-2: Build output verification**
`npm run build` must produce multiple `.js` chunks in `dist/assets/` (not a single `index-*.js`).

**NFR-3: Runtime correctness**
Tab switching must work without errors in `npm run preview` (production build). No blank screens or unhandled promise rejections.

**NFR-4: CI compatibility**
The bundle size gate in `.github/workflows/ci.yml` warns at 1.5 MB total. The split must not break this gate or the existing build step.

**NFR-5: TypeScript strict compliance**
`React.lazy()` usage must be correctly typed; no `// @ts-ignore` or `as any`.

## Success Criteria

| Metric | Before | Target |
|--------|--------|--------|
| Initial JS bundle (gzip) | ~102 kB | < 80 kB |
| Number of build chunks | 1 | ≥ 4 (vendor, data, ≥2 feature) |
| Tab-switch runtime errors | 0 | 0 (no regression) |
| CI: typecheck + lint + test | pass | pass |
| Build output | single chunk | multiple named chunks |

## Constraints & Assumptions

- **React 18.2** — `React.lazy()` and `Suspense` are fully supported; no additional libraries needed.
- **Vite 7.3** — `manualChunks` is supported via `build.rollupOptions.output.manualChunks`.
- **LoadingSpinner already exists** — implementation must reuse `src/shared/components/LoadingSpinner.tsx`; do not add a new spinner component.
- **No routing library changes** — the current tab-navigation pattern in `AppShell.tsx` is retained; lazy loading is applied at the component boundary, not via a router.
- **exercises.ts is the dominant static data file** (~117 KB); other data files are smaller and may be bundled together or split individually based on actual size analysis.
- **No server-side rendering** — the app is a client-side SPA deployed to GitHub Pages; SSR concerns do not apply.

## Out of Scope

- Preloading / prefetching chunks on hover or idle (can be a follow-up)
- Image optimization or asset splitting (separate concern)
- Service worker / PWA caching strategy changes
- Splitting within a single tab's sub-components (only top-level tab components are split)
- Changing the tab navigation architecture or adding a client-side router
- Measuring real-user performance (Lighthouse CI, Web Vitals) — manual before/after measurement in the build output is sufficient for this PRD

## Dependencies

### Internal
- `src/app/AppShell.tsx` — primary file to modify (lazy imports + Suspense boundary)
- `vite.config.ts` — manualChunks configuration
- `src/shared/components/LoadingSpinner.tsx` — existing component to use as Suspense fallback

### Agent Assignment
- **Implementation agent:** `feature-engineer` — modifies `AppShell.tsx` and `vite.config.ts`
- **Verification agent:** `qa-engineer` — verifies build output (multiple chunks), runs full CI suite, tests tab switching in preview build

### External
- No external service dependencies
- No npm package additions required (React.lazy is built-in)
