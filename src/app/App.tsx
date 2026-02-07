import React, { useState, useMemo, useCallback } from 'react';
import type { UserProfile } from '@/shared/types';
import { Icon, MiniChart, ErrorBoundary } from '@/shared/components';
import { S, globalCss } from '@/shared/theme/styles';
import { getGreeting } from '@/shared/utils';
import { loadProfile, saveProfile, runMigrations } from '@/shared/storage';
import { PlanProvider } from '@/features/training-plan/PlanContext';
import { WorkoutProvider, useWorkout } from '@/features/workout/WorkoutContext';
import { NutritionProvider } from '@/features/nutrition/nutrition.context';
import { ProgressProvider, useProgress } from '@/features/progress/progress.context';
import { Onboarding } from '@/features/onboarding/Onboarding';
import { WorkoutView } from '@/features/workout/WorkoutView';
import { Dashboard } from '@/features/progress/Dashboard';
import { MeasurementsModal } from '@/features/progress/MeasurementsModal';
import { QuickWorkoutList } from '@/features/quick-workout/QuickWorkoutList';
import { QuickWorkoutActive } from '@/features/quick-workout/QuickWorkoutActive';
import type { QuickTemplate } from '@/data/quick-templates';

// Run migrations before first render
runMigrations();

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile());

  const handleProfileComplete = useCallback((p: UserProfile) => {
    saveProfile(p);
    setProfile(p);
  }, []);

  if (!profile) {
    return <Onboarding onComplete={handleProfileComplete} />;
  }

  return (
    <ErrorBoundary>
      <PlanProvider profile={profile}>
        <WorkoutProvider>
          <NutritionProvider>
            <ProgressProvider>
              <AppShell profile={profile} />
            </ProgressProvider>
          </NutritionProvider>
        </WorkoutProvider>
      </PlanProvider>
    </ErrorBoundary>
  );
}

function AppShell({ profile }: { profile: UserProfile }) {
  const [view, setView] = useState<'workout' | 'stats'>('workout');
  const [showQuick, setShowQuick] = useState(false);
  const [quickWorkout, setQuickWorkout] = useState<QuickTemplate | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [showNutritionFromDash, setShowNutritionFromDash] = useState(false);
  const [showExerciseHistoryFromDash, setShowExerciseHistoryFromDash] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const workout = useWorkout();
  const progress = useProgress();

  const streak = useMemo(() => {
    if (!workout.workoutHistory.length) return 0;
    const dates = [...new Set(workout.workoutHistory.map(w => w.date))].sort().reverse();
    let count = 0;
    for (let i = 0; i < dates.length; i++) {
      const exp = new Date();
      exp.setDate(exp.getDate() - i);
      if (dates[i] === exp.toISOString().split('T')[0]) count++;
      else break;
    }
    return count;
  }, [workout.workoutHistory]);

  // Quick workout flow
  if (quickWorkout) {
    return (
      <QuickWorkoutActive
        template={quickWorkout}
        onComplete={() => {
          setQuickWorkout(null);
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 2000);
        }}
        onCancel={() => setQuickWorkout(null)}
      />
    );
  }

  return (
    <div style={S.container}>
      {celebrate && (
        <div style={S.celebrate}>
          <div style={S.celebContent}>
            <div style={{ fontSize: 48 }}>🏆</div>
            <div style={S.celebTitle}>GREAT WORK!</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logo}><Icon name="dumbbell" size={22} /></div>
          <div>
            <h1 style={S.title}>IRON PROTOCOL</h1>
            <p style={S.welcome}>Good {getGreeting()}, {profile.name?.split(' ')[0]}</p>
          </div>
        </div>
        <div style={S.streak}><Icon name="flame" size={16} /> {streak}</div>
      </header>

      {workout.weekCount > 0 && (
        <div style={S.weekBadge}>
          Week {workout.weekCount} of training
          {workout.weekCount >= 4 && <span style={{ color: '#FF9500' }}> · Deload recommended</span>}
        </div>
      )}

      {/* Navigation */}
      <nav style={S.nav}>
        <button onClick={() => setView('workout')} style={{ ...S.navBtn, ...(view === 'workout' ? S.navActive : {}) }}>
          <Icon name="dumbbell" size={16} /> WORKOUT
        </button>
        <button onClick={() => setShowQuick(true)} style={S.navQuick}>
          <Icon name="lightning" size={16} /> QUICK
        </button>
        <button onClick={() => setView('stats')} style={{ ...S.navBtn, ...(view === 'stats' ? S.navActive : {}) }}>
          <Icon name="chart" size={16} /> STATS
        </button>
      </nav>

      {/* Main content */}
      <main style={S.main}>
        {view === 'workout' ? (
          <WorkoutView profile={profile} />
        ) : (
          <Dashboard
            profile={profile}
            streak={streak}
            onOpenNutrition={() => setShowNutritionFromDash(true)}
            onOpenMeasurements={() => setShowMeasurements(true)}
            onShowExerciseHistory={setShowExerciseHistoryFromDash}
          />
        )}
      </main>

      {/* Quick workout modal */}
      {showQuick && (
        <QuickWorkoutList
          onSelect={(template) => { setQuickWorkout(template); setShowQuick(false); }}
          onClose={() => setShowQuick(false)}
        />
      )}

      {/* Measurements modal */}
      {showMeasurements && (
        <MeasurementsModal
          currentWeight={profile.weight}
          onSave={(data) => { progress.saveMeasurement(data); setShowMeasurements(false); }}
          onClose={() => setShowMeasurements(false)}
        />
      )}

      <style>{globalCss}</style>
    </div>
  );
}
