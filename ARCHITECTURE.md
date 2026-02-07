# Iron Protocol - Architecture Decision Record

## Status: Approved

## Context

Iron Protocol is a progressive overload fitness tracker built as a React SPA. The initial
implementation ships all logic (~800 LOC) in a single component with localStorage persistence.
This ADR documents the architectural restructuring needed to support scale, retention, offline
capability, and monetization.

## Problems with Current Architecture

| Problem | Impact | Risk |
|---------|--------|------|
| 801-line god component with 40+ useState hooks | Every state change re-renders entire app | Performance degrades as features grow |
| localStorage-only persistence (5MB limit) | Data loss on browser clear, no sync | Users lose months of training data |
| No data versioning or migration | Schema changes destroy existing data | Cannot ship model updates safely |
| No TypeScript | Runtime errors in production | Auto-regulation bugs go undetected |
| No offline-first strategy | Unusable in gyms with poor connectivity | Core use case broken |
| No feature gating | Cannot A/B test or monetize | Revenue blocked |
| No test coverage | Regressions in progression algorithm | Users get wrong weight recommendations |
| Create React App (deprecated) | No maintenance, slow builds | Security vulnerabilities |

## Decisions

### 1. Build Tool: Vite + TypeScript

**Why not Next.js?** This is a client-side app with no SEO needs. Vite gives us fast HMR,
native ESM, and smaller bundles without SSR complexity we don't need.

### 2. State Management: React Context + useReducer (per feature domain)

**Why not Redux/Zustand?** The app has 5 distinct state domains (workout, nutrition, profile,
measurements, quick-workout). Each domain gets its own context + reducer. This avoids Redux
boilerplate while maintaining clear boundaries. If any single domain becomes complex enough
to warrant Zustand, we migrate that domain only.

### 3. Persistence: Abstracted Storage Layer with IndexedDB + localStorage fallback

- **IndexedDB** for workout history, exercise data, measurements (structured, large)
- **localStorage** for user profile, preferences (small, simple)
- **Versioned schemas** with migration functions per version bump
- **Storage adapter pattern** so we can swap in cloud sync later without touching business logic

### 4. Data Validation: Zod schemas at storage boundaries

Validate on read (storage -> app) and write (app -> storage). Never trust stored data.

### 5. Component Architecture: Feature-based modules

```
src/
  features/
    workout/        # Active workout session
    training-plan/  # Plan configuration, templates
    nutrition/      # Water, protein tracking
    progress/       # Stats dashboard, PRs, history
    onboarding/     # Profile setup flow
    quick-workout/  # Timed bodyweight sessions
  shared/
    components/     # Icon, MiniChart, Modal, ErrorBoundary
    hooks/          # useTimer, useLocalStorage, useOffline
    storage/        # Persistence layer
    theme/          # Design tokens, CSS modules
    types/          # Shared TypeScript types
    utils/          # calculate1RM, getWarmupSets, etc.
```

### 6. Offline Strategy: Service Worker + Cache-first

- Precache app shell and static assets
- Store all data locally first, sync when online (local-first)
- Show offline indicator in UI

### 7. Monetization Readiness: Feature flag system

- `FeatureGate` component wraps premium features
- Flags stored in profile, checked at render time
- Premium candidates: advanced analytics, custom templates, cloud sync, export

## Directory Structure

```
iron-protocol/
  public/
    manifest.json
    sw.js
  src/
    app/
      App.tsx              # Root component, providers, routing
      routes.tsx           # View routing logic
    features/
      workout/
        WorkoutView.tsx    # Main workout screen
        ExerciseCard.tsx   # Single exercise with sets
        RPEModal.tsx       # RPE rating after set
        WarmupSets.tsx     # Warm-up display
        RestTimer.tsx      # Rest countdown
        workout.reducer.ts # Workout session state
        workout.context.tsx
      training-plan/
        PlanContext.tsx     # Plan state management
        plan.reducer.ts
        TemplateSelector.tsx
        ExerciseEditor.tsx
        ExerciseSwap.tsx
      nutrition/
        NutritionBar.tsx
        NutritionModal.tsx
        nutrition.reducer.ts
        nutrition.context.tsx
      progress/
        Dashboard.tsx
        PRDisplay.tsx
        WorkoutHistory.tsx
        MeasurementsModal.tsx
        progress.context.tsx
      onboarding/
        Onboarding.tsx
        steps/             # One component per step
      quick-workout/
        QuickWorkoutList.tsx
        QuickWorkoutActive.tsx
        ReadyCountdown.tsx
    shared/
      components/
        Icon.tsx
        MiniChart.tsx
        Modal.tsx
        ErrorBoundary.tsx
        FeatureGate.tsx
      hooks/
        useTimer.ts
        useStorage.ts
        useVibrate.ts
      storage/
        storage.ts         # Abstract interface
        indexeddb.ts        # IndexedDB implementation
        localStorage.ts    # localStorage implementation
        migrations.ts      # Schema version migrations
        schemas.ts         # Zod validation schemas
      theme/
        tokens.ts          # Colors, spacing, typography
        components.module.css
      types/
        exercise.ts
        workout.ts
        profile.ts
        nutrition.ts
      utils/
        calculations.ts    # 1RM, warmup sets
        audio.ts           # Rest timer sound
        date.ts            # Date helpers
    data/
      exercises.ts         # Exercise database
      templates.ts         # Workout templates
      quick-templates.ts   # Quick workout templates
      protein-sources.ts   # Nutrition quick-log items
    main.tsx               # Entry point
    vite-env.d.ts
  index.html
  vite.config.ts
  tsconfig.json
  package.json
```

## Data Models (TypeScript)

```typescript
// Core domain types
interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  equipment: Equipment;
  youtubeId: string;
  isBodyweight: boolean;
}

interface PlanExercise {
  id: string;
  dayId: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  repsRange: { min: number; max: number };
  weightKg: number;
  restSeconds: number;
  progressionKg: number;
}

interface WorkoutLog {
  id: string;
  date: string;      // ISO date
  dayName: string;
  sets: SetLog[];
  totalVolumeKg: number;
  completionPercent: number;
}

interface SetLog {
  exerciseName: string;
  weightKg: number;
  reps: number;
  setNumber: number;
  rpe: RPEValue;
}

type RPEValue = 6 | 7 | 8 | 9 | 10;
type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Quads' | 'Hamstrings' | ...;
type Equipment = 'Barbell' | 'Dumbbells' | 'Cable' | 'Machine' | 'Bar' | 'None';
```

## Migration Strategy

This is NOT a rewrite. It's an incremental extraction:

1. **Phase 1**: Vite + TS migration, extract data constants and utility functions
2. **Phase 2**: Extract shared components (Icon, MiniChart, Modal)
3. **Phase 3**: Extract feature contexts and reducers (workout first, then nutrition)
4. **Phase 4**: Storage layer abstraction with versioned schemas
5. **Phase 5**: Service worker, offline capability
6. **Phase 6**: Feature flags, monetization hooks

Each phase ships independently. No big-bang rewrite.

## Tradeoffs Accepted

- **No SSR/SSG**: We don't need SEO. Client-only keeps deployment simple.
- **No external state library initially**: Context + useReducer is sufficient for 5 domains.
  We add Zustand only if a specific domain's state becomes deeply nested or needs
  cross-domain subscriptions.
- **IndexedDB over SQLite/WASM**: IndexedDB has universal browser support. SQLite WASM
  is better for complex queries but adds 500KB+ to bundle. Not worth it yet.
- **CSS Modules over Tailwind**: The app has a strong custom design language. Tailwind would
  fight it. CSS Modules give scoping without utility class overhead.
