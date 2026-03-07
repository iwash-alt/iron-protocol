---
name: dashboard-graphs
status: blocked
priority: medium
agent: storage-schema-engineer
blocker: recharts not installed
created: 2026-03-07T06:43:18Z
updated: 2026-03-07T06:43:18Z
---

# Epic: Dashboard Graphs (recharts)

## Goal
Add rich data visualizations to the Progress Dashboard using recharts.

## Blocker
`recharts` is not yet installed. Before any work begins, run:
```bash
npm install recharts
npm install --save-dev @types/recharts 2>/dev/null || true
```
Verify it appears in `package.json` dependencies before starting.

## Standby Instructions for storage-schema-engineer
You are on standby until code-splitting and performance-fixes epics are merged. When unblocked:

1. Install recharts: `npm install recharts`
2. Add any new Zod schemas required for chart data shapes (e.g., `ChartDataPointSchema`)
3. Export new schemas from `src/shared/storage/schemas.ts`
4. Update schema inventory in shared memory

## Work Streams (activate after recharts installed)

### Stream A — Schema additions (storage-schema-engineer)
Files:
- `src/shared/storage/schemas.ts`
- `src/shared/types/`

Tasks:
1. Define `ChartDataPoint` type: `{ date: string; value: number; label?: string }`
2. Add Zod schema with `.strict()`
3. Export from barrel

### Stream B — Chart components (feature-engineer, AFTER storage-schema-engineer)
Files:
- `src/features/progress/charts/` (existing directory)
- `src/features/progress/Dashboard.tsx`

Tasks:
1. Build `VolumeChart` component using `recharts/LineChart`
2. Build `RPETrendChart` using `recharts/AreaChart`
3. Build `MuscleGroupPieChart` using `recharts/PieChart`
4. Wire into Dashboard.tsx using lazy imports

## Acceptance Criteria
- [ ] recharts in package.json
- [ ] Charts render without crashing in jsdom (mock recharts in tests)
- [ ] Each chart component has a snapshot or render test
- [ ] Bundle size gate still passes (recharts chunk isolated)
