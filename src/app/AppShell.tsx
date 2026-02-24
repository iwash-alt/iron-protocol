import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UserProfile } from '@/shared/types';
import { Icon, LoadingSpinner, useToast, HomeSkeleton, WorkoutSkeleton, DashboardSkeleton, QuickWorkoutSkeleton, ProfileSkeleton } from '@/shared/components';
import { S, globalCss } from '@/shared/theme/styles';
import { colors } from '@/shared/theme/tokens';
import { getGreeting } from '@/shared/utils';
import { useDemoMode } from '@/shared/demo/DemoModeContext';
import { useWorkout } from '@/features/workout/WorkoutContext';
import { useProgress } from '@/features/progress/progress.context';
import { MeasurementsModal } from '@/features/progress/MeasurementsModal';
import type { QuickTemplate } from '@/data/quick-templates';
import { useProfilePhoto } from '@/features/photos/ProfilePhotoContext';
import { TIMINGS } from '@/shared/constants/timings';
import { usePRCelebration, usePullToRefresh, useWorkoutStreak } from '@/shared/hooks';

const WorkoutView = lazy(() => import('@/features/workout/WorkoutView').then((m) => ({ default: m.WorkoutView })));
const Dashboard = lazy(() => import('@/features/progress/Dashboard').then((m) => ({ default: m.Dashboard })));
const Profile = lazy(() => import('@/features/profile/Profile').then((m) => ({ default: m.Profile })));
const QuickWorkoutList = lazy(() => import('@/features/quick-workout/QuickWorkoutList').then((m) => ({ default: m.QuickWorkoutList })));
const QuickWorkoutActive = lazy(() => import('@/features/quick-workout/QuickWorkoutActive').then((m) => ({ default: m.QuickWorkoutActive })));
const HomeTab = lazy(() => import('@/features/home/HomeTab').then((m) => ({ default: m.HomeTab })));

type TabId = 'home' | 'workout' | 'dashboard' | 'quick' | 'profile';
const TAB_ORDER: TabId[] = ['home', 'workout', 'dashboard', 'quick', 'profile'];

export function AppShell({ profile, onProfileUpdate }: { profile: UserProfile; onProfileUpdate: (p: UserProfile) => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [quickWorkout, setQuickWorkout] = useState<QuickTemplate | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [tabTransition, setTabTransition] = useState<'left' | 'right' | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const demoMode = useDemoMode();
  const workout = useWorkout();
  const progress = useProgress();
  const { photo: profilePhoto } = useProfilePhoto();
  const { currentStreak } = useWorkoutStreak(workout.workoutHistory);
  const pr = usePRCelebration(workout.newPR, workout.dismissPR);
  const { newPR: prData, clearCelebration } = pr;
  const { showToast } = useToast();

  // PR celebration → toast
  const prevPRRef = useRef<typeof prData>(null);
  useEffect(() => {
    if (prData && prData !== prevPRRef.current) {
      prevPRRef.current = prData;
      showToast({ type: 'success', message: `🔥 NEW PR — ${prData.name}: ${prData.value}` });
      clearCelebration();
    }
  }, [prData, clearCelebration, showToast]);

  // Demo mode enabled → toast
  const prevDemoRef = useRef(false);
  useEffect(() => {
    if (!prevDemoRef.current && demoMode.enabled) {
      showToast({ type: 'info', message: 'Ghost data loaded' });
    }
    prevDemoRef.current = demoMode.enabled;
  }, [demoMode.enabled, showToast]);

  const handleTabSwitch = useCallback((tab: TabId) => {
    if (tab === activeTab) return;
    const fromIdx = TAB_ORDER.indexOf(activeTab);
    const toIdx = TAB_ORDER.indexOf(tab);
    setTabTransition(toIdx > fromIdx ? 'right' : 'left');
    setActiveTab(tab);
    window.setTimeout(() => setTabTransition(null), TIMINGS.ANIMATION_NORMAL);
  }, [activeTab]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const pull = usePullToRefresh({
    enabled: activeTab === 'dashboard',
    scrollTop: () => mainRef.current?.scrollTop ?? 0,
    onRefresh: () => {
      setIsRefreshing(true);
      window.setTimeout(() => setIsRefreshing(false), TIMINGS.REST_TIMER_TICK);
    },
  });

  const transitionClass = tabTransition === 'right' ? 'tab-enter-right' : tabTransition === 'left' ? 'tab-enter-left' : '';

  if (quickWorkout) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <QuickWorkoutActive
        template={quickWorkout}
        onComplete={() => {
          setQuickWorkout(null);
          showToast({ type: 'success', message: '🏆 Workout complete!' });
        }}
        onCancel={() => setQuickWorkout(null)}
      />
      </Suspense>
    );
  }

  return (
    <div style={S.container}>
      <header style={{ ...S.header, paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <div style={S.headerLeft}>{profilePhoto ? <img src={profilePhoto} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colors.primaryBorder}` }} /> : <div style={S.logo}><Icon name="dumbbell" size={22} /></div>}<div><h1 style={S.title}>IRON PROTOCOL</h1><p style={S.welcome}>Good {getGreeting()}, {profile.name?.split(' ')[0]}</p></div></div>
        <div style={S.streak}><Icon name="flame" size={16} /> {currentStreak}</div>
      </header>

      <main
        ref={mainRef}
        style={{ ...S.main, paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
        onTouchStart={pull.onTouchStart}
        onTouchMove={pull.onTouchMove}
        onTouchEnd={pull.onTouchEnd}
      >
        {activeTab === 'dashboard' && (pull.pullDistance > 0 || isRefreshing) && <div style={{ ...S.pullRefresh, height: isRefreshing ? 50 : Math.min(pull.pullDistance, 60) }}><span style={{ ...S.pullRefreshSpinner, animation: isRefreshing ? 'pullRefreshSpin 0.8s linear infinite' : 'none' }}><Icon name="refresh" size={22} /></span></div>}

        <div className={transitionClass} key={activeTab}>
          {activeTab === 'home' && (
            <Suspense fallback={<HomeSkeleton />}>
              <HomeTab profile={profile} onNavigateToWorkout={() => handleTabSwitch('workout')} />
            </Suspense>
          )}
          {activeTab === 'workout' && (
            <Suspense fallback={<WorkoutSkeleton />}>
              <WorkoutView profile={profile} />
            </Suspense>
          )}
          {activeTab === 'dashboard' && (
            <Suspense fallback={<DashboardSkeleton />}>
              <Dashboard
                profile={profile}
                streak={currentStreak}
                onOpenMeasurements={() => setShowMeasurements(true)}
                onShowExerciseHistory={() => undefined}
                demoMode={demoMode.enabled}
                onToggleDemo={demoMode.setEnabled}
              />
            </Suspense>
          )}
          {activeTab === 'quick' && (
            <Suspense fallback={<QuickWorkoutSkeleton />}>
              <QuickWorkoutList onStart={setQuickWorkout} onClose={() => handleTabSwitch('workout')} inline />
            </Suspense>
          )}
          {activeTab === 'profile' && (
            <Suspense fallback={<ProfileSkeleton />}>
              <Profile profile={profile} onProfileUpdate={onProfileUpdate} />
            </Suspense>
          )}
        </div>
      </main>

      {showMeasurements && <MeasurementsModal currentWeight={profile.weight} onSave={(data) => { progress.saveMeasurement(data); setShowMeasurements(false); }} onClose={() => setShowMeasurements(false)} />}
      <BottomNav active={activeTab} onSelect={handleTabSwitch} />
      <style>{globalCss}</style>
    </div>
  );
}

function BottomNav({ active, onSelect }: { active: TabId; onSelect: (tab: TabId) => void }) {
  const tabs = useMemo(() => ([
    { id: 'home' as const, label: 'Home', icon: 'home' as const, iconActive: 'home-filled' as const },
    { id: 'workout' as const, label: 'Workout', icon: 'dumbbell' as const, iconActive: 'dumbbell-filled' as const },
    { id: 'dashboard' as const, label: 'Dashboard', icon: 'chart' as const, iconActive: 'chart-filled' as const },
    { id: 'quick' as const, label: 'Quick', icon: 'lightning-outline' as const, iconActive: 'lightning' as const },
    { id: 'profile' as const, label: 'Profile', icon: 'user' as const, iconActive: 'user-filled' as const },
  ]), []);
  return (
    <nav style={S.bottomNav}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onSelect(tab.id)} style={{ ...S.bottomNavTab, ...(isActive ? S.bottomNavTabActive : {}) }} aria-label={tab.label}>
            <Icon name={isActive ? tab.iconActive : tab.icon} size={22} />
            {isActive && <span style={S.bottomNavLabel}>{tab.label.toUpperCase()}</span>}
          </button>
        );
      })}
    </nav>
  );
}
