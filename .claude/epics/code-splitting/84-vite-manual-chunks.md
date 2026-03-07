---
name: vite-manual-chunks
status: open
created: 2026-03-07T02:25:08Z
updated: 2026-03-07T02:25:08Z
epic: code-splitting
agent: feature-engineer
---

# Task: Configure Vite manualChunks in vite.config.ts

## Context

Add `build.rollupOptions.output.manualChunks` to `vite.config.ts` to split the bundle into vendor / data / per-feature chunks. This is what causes the build to emit multiple files instead of one.

## Steps

1. In `vite.config.ts`, inside the `defineConfig({})` object, add or merge:
   ```ts
   build: {
     rollupOptions: {
       output: {
         manualChunks(id: string) {
           if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
             return 'vendor';
           }
           if (id.includes('src/data/exercises')) {
             return 'data';
           }
           if (id.includes('src/features/progress') || id.includes('src/features/workout') || id.includes('src/hooks/useWorkout')) {
             return 'feature-workout';
           }
           if (id.includes('src/features/profile') || id.includes('src/features/photos')) {
             return 'feature-profile';
           }
           if (id.includes('src/features/quick-workout')) {
             return 'feature-quick-workout';
           }
           if (id.includes('src/features/onboarding')) {
             return 'feature-onboarding';
           }
         },
       },
     },
   },
   ```
2. If `build` already has config (e.g., `target`, `outDir`), merge rather than replace.
3. Run `npm run build` and inspect `dist/assets/` to confirm multiple chunks appear.

## Acceptance Criteria

- `vite.config.ts` defines `manualChunks`
- `npm run build` succeeds without errors
- `dist/assets/` contains JS files named with `vendor`, `data`, and at least 2 `feature-*` prefixes
