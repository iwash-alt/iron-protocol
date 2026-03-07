---
name: debounce-nutrition-context
status: open
created: 2026-03-07T02:45:24Z
updated: 2026-03-07T02:45:24Z
epic: performance-fixes
github: https://github.com/iwash-alt/iron-protocol/issues/90
agent: feature-engineer
---

# Task: Debounce NutritionContext localStorage persistence

## Context

Add a 500 ms debounce to the function that writes nutrition state to localStorage. In-memory React state updates must remain synchronous — only the side-effect write is debounced.

## Steps

1. Locate the NutritionContext file (likely `src/hooks/useNutrition.ts` or within `src/features/nutrition/`).
2. Add a `useRef`-based debounce:
   ```ts
   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   ```
3. Wrap the localStorage write in the debounce:
   ```ts
   // In the effect or callback that currently writes to localStorage:
   if (debounceRef.current) clearTimeout(debounceRef.current);
   debounceRef.current = setTimeout(() => {
     localStorage.setItem(KEY, JSON.stringify(state));
   }, 500);
   ```
4. Ensure the React state dispatch (in-memory update) remains synchronous — only the `localStorage.setItem` call is inside the debounce.
5. Clean up on unmount:
   ```ts
   useEffect(() => {
     return () => {
       if (debounceRef.current) clearTimeout(debounceRef.current);
     };
   }, []);
   ```
6. Run `npm run typecheck` and `npm run lint` — 0 errors/warnings.

## Acceptance Criteria

- localStorage writes are debounced at 500 ms
- React state updates remain synchronous (no perceived input lag)
- No new npm packages introduced
- `npm run typecheck` passes with 0 errors
- `npm run lint` passes with 0 warnings
