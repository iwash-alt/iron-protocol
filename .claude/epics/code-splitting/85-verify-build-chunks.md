---
name: verify-build-chunks
status: open
created: 2026-03-07T02:25:08Z
updated: 2026-03-07T02:25:08Z
epic: code-splitting
agent: qa-engineer
---

# Task: Verify build produces multiple chunks and measure sizes

## Context

After Tasks 2 and 3 are merged, run a production build and confirm the chunk split goals are met.

## Steps

1. Run `npm run build`.
2. List `dist/assets/*.js` files; confirm at least 4 distinct JS chunks exist.
3. Measure gzip size of the critical-path (smallest, initial) chunk:
   ```bash
   gzip -c dist/assets/index-*.js | wc -c
   # Target: < 80 kB (81920 bytes)
   ```
4. Report actual chunk names and sizes in the task comment.
5. Run `npm run preview` (in background) and manually switch between tabs; confirm no console errors.

## Acceptance Criteria

- ≥ 4 JS chunks in `dist/assets/`
- Critical-path initial chunk ≤ 80 kB gzip
- `npm run preview` + tab switching produces zero console errors
- Results documented (chunk names + sizes)
