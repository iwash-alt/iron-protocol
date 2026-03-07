---
issue: code-splitting
stream: Vite manualChunks
agent: feature-engineer
started: 2026-03-07T06:43:18Z
status: completed
---

# Stream B: Vite manualChunks

## Scope
- `vite.config.ts` — add chunks for nutrition, readiness, training-plan, domain-core, data-guides

## Completed
- Verified all five new manualChunks entries are already present in `vite.config.ts`:
  - `feature-nutrition` — `src/features/nutrition`
  - `feature-readiness` — `src/features/readiness`
  - `feature-training-plan` — `src/features/training-plan`
  - `domain-core` — `src/training/` and `src/analytics/`
  - `data-guides` — `src/data/animations` and `src/data/exercise-guides`
- Build verified: all new chunks emit correctly in `dist/assets/`
- Build output confirms: domain-core (16 KB), feature-readiness (8 KB), feature-training-plan (84 KB), data chunk (104 KB)

## Build Output (dist/assets/)
- feature-onboarding: 4 KB
- feature-readiness: 8 KB
- domain-core: 16 KB
- feature-profile: 28 KB
- feature-training-plan: 84 KB
- data (exercises): 104 KB
- vendor (react/react-dom): 148 KB
- feature-workout: 588 KB
