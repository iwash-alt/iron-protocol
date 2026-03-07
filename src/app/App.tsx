import React, { Suspense, useCallback, useEffect, useState } from 'react';
import type { UserProfile } from '@/shared/types';
import { ErrorBoundary, LoadingSpinner, ToastProvider } from '@/shared/components';
import { TIMINGS } from '@/shared/constants/timings';
import { loadProfile, runMigrations, saveProfile, saveTrainingPlan } from '@/shared/storage';
import { DemoModeProvider } from '@/shared/demo/DemoModeContext';
import { PlanProvider, usePlan } from '@/features/training-plan/PlanContext';
import { WorkoutProvider } from '@/features/workout/WorkoutContext';
import type { ProgressionResult } from '@/training/progression';
import { ProgressProvider } from '@/features/progress/progress.context';
import { EntitlementProvider } from '@/features/entitlements/EntitlementContext';
import { ProfilePhotoProvider } from '@/features/photos/ProfilePhotoContext';
import { AppShell } from '@/app/AppShell';
import type { PlanState } from '@/features/training-plan/plan.reducer';

// @ts-expect-error — JSX homepage component without type declarations
const Homepage = React.lazy(() => import('@/ui/screens/Homepage'));
const Onboarding = React.lazy(() =>
  import('@/features/onboarding/Onboarding').then(m => ({ default: m.Onboarding }))
);
const InstallBanner = React.lazy(() =>
  import('@/features/pwa/InstallBanner').then(m => ({ default: m.InstallBanner }))
);
runMigrations();

function dismissSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;
  const splashStart = (window as Window & { __splashStart?: number }).__splashStart ?? Date.now();
  const elapsed = Date.now() - splashStart;
  const delay = Math.max(0, 300 - elapsed);
  window.setTimeout(() => {
    splash.classList.add('hide');
    window.setTimeout(() => splash.remove(), TIMINGS.ANIMATION_FAST);
  }, delay);
}

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return hash;
}

function WorkoutPlanBridge({ children }: { children: React.ReactNode }) {
  const plan = usePlan();
  const handleProgression = useCallback((result: ProgressionResult) => {
    plan.updateExercise(result.exerciseId, { [result.field]: result.newValue });
  }, [plan]);

  return <WorkoutProvider dayExercises={plan.dayExercises} currentDayName={plan.currentDay?.name ?? ''} onProgression={handleProgression}>{children}</WorkoutProvider>;
}

export default function App() {
  const hash = useHashRoute();
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile());

  useEffect(() => dismissSplash(), []);
  useEffect(() => {
    if (profile && (hash === '#/' || hash === '' || hash === '#')) window.location.hash = '#/app';
  }, [profile, hash]);

  const handleProfileComplete = useCallback((p: UserProfile, plan: PlanState) => {
    saveTrainingPlan(plan);
    saveProfile(p);
    setProfile(p);
    window.location.hash = '#/app';
  }, []);

  if (hash === '#/' || hash === '' || hash === '#') {
    return <Suspense fallback={<LoadingSpinner />}><Homepage /></Suspense>;
  }
  if (!profile) return <Suspense fallback={<LoadingSpinner />}><Onboarding onComplete={handleProfileComplete} /></Suspense>;

  return (
    <ErrorBoundary>
      <ToastProvider>
      <EntitlementProvider>
        <ProfilePhotoProvider>
          <DemoModeProvider>
            <PlanProvider profile={profile}>
              <WorkoutPlanBridge>
                <ProgressProvider>
                  <AppShell profile={profile} onProfileUpdate={setProfile} />
                  <Suspense fallback={null}><InstallBanner /></Suspense>
                </ProgressProvider>
              </WorkoutPlanBridge>
            </PlanProvider>
          </DemoModeProvider>
        </ProfilePhotoProvider>
      </EntitlementProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
