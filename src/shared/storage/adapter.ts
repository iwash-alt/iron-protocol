/**
 * Storage Adapter — backend-agnostic persistence interface.
 *
 * Components and contexts never call localStorage or Supabase directly.
 * They call the active adapter, which routes to the correct backend.
 *
 * Phase 1: LocalStorageAdapter (current)
 * Phase 2: SupabaseAdapter (cloud sync)
 *
 * Both adapters implement the same StorageAdapter interface.
 * The active adapter is set once at app startup via setAdapter().
 *
 * Usage:
 *   import { storage } from '@/shared/storage/adapter';
 *   const profile = await storage.load('profile');
 *   await storage.save('profile', updatedProfile);
 */

import type {
  UserProfile, WorkoutLog, ExerciseHistory, PersonalRecords,
  BodyMeasurement, NutritionHistory, EntitlementStore,
} from '@/shared/types';

// ── Data Map ──────────────────────────────────────────────────────────────────
// Single source of truth for all storable data shapes.
// Every adapter must handle exactly these keys.

export interface StorageDataMap {
  profile: UserProfile | null;
  workoutHistory: WorkoutLog[];
  exerciseHistory: ExerciseHistory;
  personalRecords: PersonalRecords;
  bodyMeasurements: BodyMeasurement[];
  nutritionHistory: NutritionHistory;
  weekCount: number;
  lastWorkoutWeek: number | null;
  entitlements: EntitlementStore | null;
}

export type StorageKey = keyof StorageDataMap;

// ── Adapter Interface ─────────────────────────────────────────────────────────

export interface StorageAdapter {
  /** Load a value by key. Returns the typed default if nothing stored. */
  load<K extends StorageKey>(key: K): Promise<StorageDataMap[K]>;

  /** Save a value by key. */
  save<K extends StorageKey>(key: K, value: StorageDataMap[K]): Promise<void>;

  /** Remove a value by key. */
  remove(key: StorageKey): Promise<void>;

  /** Remove all app data (logout / reset). */
  clear(): Promise<void>;
}

// ── Default Values ────────────────────────────────────────────────────────────

const DEFAULTS: StorageDataMap = {
  profile: null,
  workoutHistory: [],
  exerciseHistory: {},
  personalRecords: {},
  bodyMeasurements: [],
  nutritionHistory: {},
  weekCount: 0,
  lastWorkoutWeek: null,
  entitlements: null,
};

// ── LocalStorage Adapter ──────────────────────────────────────────────────────

import {
  loadProfile, saveProfile,
  loadWorkoutHistory, saveWorkoutHistory,
  loadExerciseHistory, saveExerciseHistory,
  loadPersonalRecords, savePersonalRecords,
  loadBodyMeasurements, saveBodyMeasurements,
  loadNutritionHistory, saveNutritionHistory,
  loadWeekCount, saveWeekCount,
  loadLastWorkoutWeek, saveLastWorkoutWeek,
  loadEntitlementStore, saveEntitlementStore,
  StorageKeys,
} from './storage';

/** Wraps the existing localStorage functions behind the adapter interface. */
export class LocalStorageAdapter implements StorageAdapter {
  async load<K extends StorageKey>(key: K): Promise<StorageDataMap[K]> {
    const loaders: Record<StorageKey, () => unknown> = {
      profile: loadProfile,
      workoutHistory: loadWorkoutHistory,
      exerciseHistory: loadExerciseHistory,
      personalRecords: loadPersonalRecords,
      bodyMeasurements: loadBodyMeasurements,
      nutritionHistory: loadNutritionHistory,
      weekCount: loadWeekCount,
      lastWorkoutWeek: loadLastWorkoutWeek,
      entitlements: loadEntitlementStore,
    };
    const result = loaders[key]();
    return (result ?? DEFAULTS[key]) as StorageDataMap[K];
  }

  async save<K extends StorageKey>(key: K, value: StorageDataMap[K]): Promise<void> {
    const savers: Record<StorageKey, (v: any) => void> = {
      profile: saveProfile,
      workoutHistory: saveWorkoutHistory,
      exerciseHistory: saveExerciseHistory,
      personalRecords: savePersonalRecords,
      bodyMeasurements: saveBodyMeasurements,
      nutritionHistory: saveNutritionHistory,
      weekCount: saveWeekCount,
      lastWorkoutWeek: saveLastWorkoutWeek,
      entitlements: saveEntitlementStore,
    };
    savers[key](value);
  }

  async remove(key: StorageKey): Promise<void> {
    const keyMap: Record<StorageKey, string> = {
      profile: StorageKeys.PROFILE,
      workoutHistory: StorageKeys.WORKOUT_HISTORY,
      exerciseHistory: StorageKeys.EXERCISE_HISTORY,
      personalRecords: StorageKeys.PRS,
      bodyMeasurements: StorageKeys.BODY_MEASUREMENTS,
      nutritionHistory: StorageKeys.NUTRITION,
      weekCount: StorageKeys.WEEK_COUNT,
      lastWorkoutWeek: StorageKeys.LAST_WORKOUT_WEEK,
      entitlements: StorageKeys.ENTITLEMENTS,
    };
    localStorage.removeItem(keyMap[key]);
  }

  async clear(): Promise<void> {
    Object.values(StorageKeys).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('ironStorageVersion');
  }
}

// ── Supabase Adapter (Stub for Phase 2) ───────────────────────────────────────

/**
 * TODO: Phase 2 — Implement SupabaseAdapter
 *
 * This adapter will:
 *   1. Read/write from Supabase tables instead of localStorage
 *   2. Maintain a local cache (localStorage) for offline use
 *   3. Sync changes when connectivity returns (background sync)
 *   4. Handle conflict resolution (last-write-wins or merge)
 *
 * Implementation outline:
 *
 *   export class SupabaseAdapter implements StorageAdapter {
 *     private supabase: SupabaseClient;
 *     private localFallback: LocalStorageAdapter;
 *
 *     async load<K extends StorageKey>(key: K) {
 *       try {
 *         const { data } = await this.supabase
 *           .from('user_data')
 *           .select(key)
 *           .single();
 *         return data[key] ?? DEFAULTS[key];
 *       } catch {
 *         // Offline: fall back to local cache
 *         return this.localFallback.load(key);
 *       }
 *     }
 *
 *     async save<K extends StorageKey>(key: K, value: StorageDataMap[K]) {
 *       // Always save locally first (optimistic)
 *       await this.localFallback.save(key, value);
 *       try {
 *         await this.supabase
 *           .from('user_data')
 *           .upsert({ user_id: this.userId, [key]: value });
 *       } catch {
 *         // Queue for background sync
 *         this.queueSync(key, value);
 *       }
 *     }
 *   }
 */

// ── Singleton ─────────────────────────────────────────────────────────────────

let _adapter: StorageAdapter = new LocalStorageAdapter();

/** Replace the active storage adapter (call once at app startup). */
export function setAdapter(adapter: StorageAdapter): void {
  _adapter = adapter;
}

/** The active storage adapter. Import this in components/contexts. */
export const storage: StorageAdapter = {
  load: (...args) => _adapter.load(...args),
  save: (...args) => _adapter.save(...args),
  remove: (...args) => _adapter.remove(...args),
  clear: () => _adapter.clear(),
};
