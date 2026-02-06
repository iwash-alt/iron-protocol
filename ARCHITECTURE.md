# Iron Protocol — Clean Architecture Proposal

## Current State

The entire application lives in one 801-line file (`src/App.jsx`). Constants, domain logic, data persistence, UI components, and 260+ inline styles are all interleaved in a single React component with 30+ `useState` calls.

### Key Problems

| Problem | Location | Impact |
|---|---|---|
| 30+ `useState` calls in one component | `App.jsx:100-190` | Untestable, unmaintainable state |
| Business logic in event handlers | `App.jsx:286-310` | Can't unit test without React |
| Data access hardcoded to localStorage | `App.jsx:191-207` | Can't swap to API/DB |
| 260+ inline style definitions | `App.jsx:530+` | No theming, no reuse |
| 10+ props drilled into Dashboard | `App.jsx` | Fragile coupling |
| Zero tests | — | No safety net |
| Hardcoded exercise/template data | `App.jsx:4-78` | Can't load from server |

---

## Proposed Architecture

Dependencies point inward. Domain logic knows nothing about React, localStorage, or UI.

```
┌─────────────────────────────────────────────────┐
│                  Presentation                    │  React components, hooks, styles
├─────────────────────────────────────────────────┤
│               Interface Adapters                 │  Repositories, mappers, context
├─────────────────────────────────────────────────┤
│                 Application                      │  Use cases / services
├─────────────────────────────────────────────────┤
│                   Domain                         │  Entities, value objects, interfaces
└─────────────────────────────────────────────────┘
```

## Folder Structure

```
src/
├── domain/                              # LAYER 1: Enterprise business rules
│   ├── entities/
│   │   ├── Exercise.ts                  # Exercise entity
│   │   ├── WorkoutPlan.ts               # Plan with days, exercises, sets/reps/weight
│   │   ├── WorkoutLog.ts                # Completed workout record
│   │   ├── UserProfile.ts               # Profile value object
│   │   ├── PersonalRecord.ts            # PR tracking entity
│   │   ├── Measurement.ts               # Body composition entry
│   │   └── NutritionLog.ts              # Daily water/protein tracking
│   ├── value-objects/
│   │   ├── RPE.ts                       # RPE rating (6-10) with validation
│   │   ├── Weight.ts                    # Weight with unit (kg/lb)
│   │   └── SetResult.ts                 # Completed set (weight × reps @ RPE)
│   ├── services/
│   │   ├── ProgressionEngine.ts         # RPE-based auto-regulation (pure logic)
│   │   ├── OneRepMaxCalculator.ts       # Epley/Brzycki 1RM formulas
│   │   └── WarmupCalculator.ts          # Warmup set generation
│   └── interfaces/                      # Port definitions (contracts only)
│       ├── IWorkoutRepository.ts
│       ├── IProfileRepository.ts
│       ├── IMeasurementRepository.ts
│       ├── INutritionRepository.ts
│       └── INotificationService.ts
│
├── application/                         # LAYER 2: Application use cases
│   ├── use-cases/
│   │   ├── StartWorkout.ts              # Initialize workout session from plan
│   │   ├── CompleteSet.ts               # Record set, apply progression
│   │   ├── EndWorkout.ts                # Finalize, log, adjust incompletes
│   │   ├── GeneratePlan.ts              # Build plan from profile + template
│   │   ├── LogMeasurement.ts            # Save body composition
│   │   ├── TrackNutrition.ts            # Water/protein logging
│   │   └── GetDashboardStats.ts         # Aggregate stats, streaks, PRs
│   └── dto/
│       ├── WorkoutSessionDTO.ts
│       └── DashboardStatsDTO.ts
│
├── infrastructure/                      # LAYER 3: Interface adapters
│   ├── repositories/
│   │   ├── LocalStorageWorkoutRepo.ts   # Implements IWorkoutRepository
│   │   ├── LocalStorageProfileRepo.ts   # Implements IProfileRepository
│   │   ├── LocalStorageMeasurementRepo.ts
│   │   ├── LocalStorageNutritionRepo.ts
│   │   └── ApiWorkoutRepo.ts            # Future: REST/GraphQL backend
│   ├── services/
│   │   ├── AudioNotificationService.ts  # Web Audio API wrapper
│   │   └── VibrationService.ts          # Navigator.vibrate wrapper
│   ├── mappers/
│   │   └── StorageMapper.ts             # JSON ↔ Entity hydration
│   └── data/
│       ├── exercises.ts                 # Exercise catalog (static)
│       ├── workout-templates.ts         # 3-day, 4-day, PPL templates
│       ├── quick-templates.ts           # HIIT/bodyweight circuits
│       └── protein-sources.ts           # Quick-log protein items
│
├── presentation/                        # LAYER 4: UI framework (React)
│   ├── providers/
│   │   └── AppProvider.tsx              # DI container via React Context
│   ├── hooks/
│   │   ├── useWorkoutSession.ts         # Orchestrates workout use cases
│   │   ├── useRestTimer.ts              # Countdown timer + audio/vibration
│   │   ├── useNutrition.ts              # Water/protein state + persistence
│   │   ├── useDashboard.ts              # Aggregated stats
│   │   └── useOnboarding.ts             # Onboarding flow state machine
│   ├── components/
│   │   ├── common/
│   │   │   ├── Icon.tsx
│   │   │   ├── MiniChart.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Button.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── workout/
│   │   │   ├── WorkoutView.tsx
│   │   │   ├── SetRow.tsx
│   │   │   ├── RPEModal.tsx
│   │   │   ├── RestTimer.tsx
│   │   │   └── WarmupSets.tsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   └── PRList.tsx
│   │   ├── nutrition/
│   │   │   ├── NutritionPanel.tsx
│   │   │   ├── WaterTracker.tsx
│   │   │   └── ProteinLogger.tsx
│   │   ├── measurements/
│   │   │   └── MeasurementsModal.tsx
│   │   ├── onboarding/
│   │   │   └── Onboarding.tsx
│   │   └── plan/
│   │       ├── PlanView.tsx
│   │       └── ExerciseCard.tsx
│   ├── styles/
│   │   ├── theme.ts                     # Color tokens, spacing, typography
│   │   └── mixins.ts                    # Shared style patterns
│   └── App.tsx                          # Root composition
│
├── di/                                  # Dependency injection wiring
│   └── container.ts                     # Factory that builds the object graph
│
├── index.tsx
└── types/
    └── index.ts                         # Shared TypeScript types
```

---

## Layer Responsibilities

### Domain (innermost — zero dependencies)

Contains entities (`Exercise`, `WorkoutPlan`, `WorkoutLog`), value objects (`RPE`, `Weight`, `SetResult`), domain services (`ProgressionEngine`, `OneRepMaxCalculator`), and repository interfaces.

The `ProgressionEngine` encapsulates the RPE-based auto-regulation logic currently at `App.jsx:286-310`:
- RPE 6-7 → increase reps
- RPE 8 → increase reps or weight if at rep ceiling
- RPE 9 → hold steady
- RPE 10 → reduce weight

This is a pure function. No React, no localStorage, no side effects. Directly unit-testable.

Repository interfaces (`IWorkoutRepository`, etc.) define contracts without implementations — the Repository pattern's foundation.

### Application (orchestration)

Each use case represents one user intention:
- `CompleteSet` — records a set, delegates to `ProgressionEngine`, persists via repository
- `EndWorkout` — finalizes workout, calculates volume, handles incomplete sets
- `GeneratePlan` — builds a plan from profile + template selection

Use cases receive repository implementations via constructor injection. They don't know whether data lives in localStorage or a remote API.

### Infrastructure (adapters)

Where abstractions meet browser APIs:
- `LocalStorageWorkoutRepo` implements `IWorkoutRepository` using `window.localStorage`
- `StorageMapper` handles JSON ↔ entity hydration with validation
- `AudioNotificationService` wraps Web Audio API
- Static data (exercises, templates) lives here as importable modules

This is the only layer that touches `window`, `localStorage`, or `navigator`.

### Presentation (React)

React lives here and only here:
- Custom hooks (`useWorkoutSession`, `useRestTimer`) wrap use cases and manage UI state
- Components are thin rendering shells that receive data and callbacks from hooks
- Feature folders (`workout/`, `dashboard/`, `nutrition/`) group related components
- A theme system replaces the 260+ inline style definitions

### DI Container

A single `container.ts` factory assembles the object graph:

```typescript
export function createContainer() {
  const workoutRepo = new LocalStorageWorkoutRepo();
  const profileRepo = new LocalStorageProfileRepo();
  const progressionEngine = new ProgressionEngine();

  return {
    completeSet: new CompleteSet(workoutRepo, progressionEngine),
    startWorkout: new StartWorkout(workoutRepo, new WarmupCalculator()),
    endWorkout: new EndWorkout(workoutRepo, progressionEngine),
    generatePlan: new GeneratePlan(profileRepo),
    getDashboardStats: new GetDashboardStats(workoutRepo),
  };
}
```

Exposed to React via `AppProvider` context. Swapping localStorage for an API means changing one line per repository.

---

## Scaling Risks

### 1. LocalStorage Ceiling (Critical)
LocalStorage caps at 5-10 MB. A user training 4x/week for 2 years generates ~400 workout logs. `setItem` will silently throw, losing data.

**Mitigation**: Repository pattern enables swap to IndexedDB (50+ MB) or a backend API without touching business logic.

### 2. State Explosion
30+ `useState` calls grow with every feature. React re-renders the entire component on every change.

**Mitigation**: Custom hooks isolate state into bounded contexts. Maps cleanly onto Zustand stores or `useReducer` if complexity grows further.

### 3. No Offline/Sync Strategy
Purely client-side. Adding user accounts or cross-device sync requires reconciling local vs server state.

**Mitigation**: Repository abstraction + a `SyncManager` service. Repositories queue writes locally, sync when online. Domain layer stays unaware of network state.

### 4. Hardcoded Exercise Data
30 exercises are code constants. Users can't add custom exercises. Changes require redeployment.

**Mitigation**: Move to `infrastructure/data/`. Later, load from API with static fallback. Domain `Exercise` entity stays unchanged.

### 5. No TypeScript
Repository interfaces can't be enforced. Entity shapes drift silently. Refactoring without tests is dangerous.

**Mitigation**: Migrate incrementally — rename `.jsx` → `.tsx`, add types starting from `domain/` inward.

### 6. Bundle Size
CRA bundles everything into one chunk. Exercise catalog, all templates, and all components load on first paint.

**Mitigation**: Modular component structure enables `React.lazy()` code splitting per feature folder.

### 7. No Error Boundaries or Validation
Corrupted localStorage crashes the app with no recovery. No input validation on profile data, RPE, or measurements.

**Mitigation**: Value objects enforce invariants at construction. `StorageMapper` validates during hydration. Error boundaries per feature folder.

---

## Migration Path (Recommended Order)

1. **Extract domain entities + ProgressionEngine** — Pure TS, immediately unit-testable
2. **Define repository interfaces + localStorage implementations** — Data access becomes swappable
3. **Extract use cases** — Business orchestration leaves the component
4. **Wire DI container + AppProvider** — React consumes use cases via context
5. **Split components into feature folders** — One component per file, hooks per feature
6. **Add TypeScript incrementally** — domain → application → infrastructure → presentation
7. **Add tests** — Domain services (pure), use cases (mocked repos), components (integration)
