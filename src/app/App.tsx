import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { UserProfile } from '@/shared/types';
import { Icon, MiniChart, ErrorBoundary } from '@/shared/components';
import { S, globalCss } from '@/shared/theme/styles';
import { colors } from '@/shared/theme/tokens';
import { getGreeting } from '@/shared/utils';
import { loadProfile, saveProfile, runMigrations } from '@/shared/storage';
import { DemoModeProvider, useDemoMode } from '@/shared/demo/DemoModeContext';
import { PlanProvider, usePlan } from '@/features/training-plan/PlanContext';
import { WorkoutProvider, useWorkout } from '@/features/workout/WorkoutContext';
import { NutritionProvider } from '@/features/nutrition/nutrition.context';
import { ProgressProvider, useProgress } from '@/features/progress/progress.context';
import { Onboarding } from '@/features/onboarding/Onboarding';
import { WorkoutView } from '@/features/workout/WorkoutView';
import { Dashboard } from '@/features/progress/Dashboard';
import { MeasurementsModal } from '@/features/progress/MeasurementsModal';
import { QuickWorkoutList } from '@/features/quick-workout/QuickWorkoutList';
import { QuickWorkoutActive } from '@/features/quick-workout/QuickWorkoutActive';
import { Profile } from '@/features/profile/Profile';
import type { QuickTemplate } from '@/data/quick-templates';
// @ts-ignore — JSX homepage component
import Homepage from '@/ui/screens/Homepage';
import { InstallBanner } from '@/features/pwa/InstallBanner';
import { EntitlementProvider } from '@/features/entitlements/EntitlementContext';

// Run migrations before first render
runMigrations();

// Dismiss splash screen once React is hydrated
function dismissSplash() {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('hide');
    setTimeout(() => splash.remove(), 500);
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────
type TabId = 'workout' | 'dashboard' | 'quick' | 'profile';

type IconName = Parameters<typeof Icon>[0]['name'];

interface TabDef {
  id: TabId;
  label: string;
  icon: IconName;
  iconActive: IconName;
}

const TABS: TabDef[] = [
  { id: 'workout', label: 'Workout', icon: 'dumbbell', iconActive: 'dumbbell-filled' },
  { id: 'dashboard', label: 'Dashboard', icon: 'chart', iconActive: 'chart-filled' },
  { id: 'quick', label: 'Quick', icon: 'lightning-outline', iconActive: 'lightning' },
  { id: 'profile', label: 'Profile', icon: 'user', iconActive: 'user-filled' },
];

const TAB_ORDER: TabId[] = ['workout', 'dashboard', 'quick', 'profile'];

// ─── Hash Router ────────────────────────────────────────────────────────────
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return hash;
}

export default function App() {
  const hash = useHashRoute();
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile());

  // Dismiss splash screen on mount
  useEffect(() => {
    dismissSplash();
  }, []);

  // Auto-redirect: if user has profile and is on homepage, go to app
  useEffect(() => {
    if (profile && (hash === '#/' || hash === '' || hash === '#')) {
      window.location.hash = '#/app';
    }
  }, [profile, hash]);

  const handleProfileComplete = useCallback((p: UserProfile) => {
    saveProfile(p);
    setProfile(p);
    window.location.hash = '#/app';
  }, []);

  // Route: Homepage
  if (hash === '#/' || hash === '' || hash === '#') {
    return <Homepage />;
  }

  // Route: Main App (#/app)
  if (!profile) {
    return <Onboarding onComplete={handleProfileComplete} />;
  }

  return (
    <ErrorBoundary>
      <EntitlementProvider>
        <DemoModeProvider>
          <PlanProvider profile={profile}>
            <WorkoutProvider>
              <NutritionProvider>
                <ProgressProvider>
                  <AppShell profile={profile} onProfileUpdate={setProfile} />
                  <InstallBanner />
                </ProgressProvider>
              </NutritionProvider>
            </WorkoutProvider>
          </PlanProvider>
        </DemoModeProvider>
      </EntitlementProvider>
    </ErrorBoundary>
  );
}

// ─── Bottom Navigation Component ────────────────────────────────────────────
function BottomNav({ active, onSelect }: { active: TabId; onSelect: (tab: TabId) => void }) {
  const [tapped, setTapped] = useState<TabId | null>(null);

  const handleTap = (tab: TabId) => {
    setTapped(tab);
    onSelect(tab);
    setTimeout(() => setTapped(null), 300);
  };

  return (
    <nav style={S.bottomNav}>
      {TABS.map(tab => {
        const isActive = active === tab.id;
        const isTapped = tapped === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTap(tab.id)}
            style={{
              ...S.bottomNavTab,
              ...(isActive ? S.bottomNavTabActive : {}),
            }}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span style={{
              display: 'inline-flex',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isTapped ? 'scale(1.2)' : 'scale(1)',
              animation: isTapped ? 'navBounce 0.3s ease' : 'none',
            }}>
              <Icon name={isActive ? tab.iconActive : tab.icon} size={22} />
            </span>
            {isActive && <span style={S.bottomNavLabel}>{tab.label.toUpperCase()}</span>}
          </button>
        );
      })}
    </nav>
  );
}

// ─── PR Celebration Overlay ─────────────────────────────────────────────────
function PRCelebration({ name, category, value, onDismiss }: { name: string; category: string; value: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  // Generate particles for burst effect
  const particles = useMemo(() => {
    const emojis = ['\u{1F525}', '\u{1F4AA}', '\u26A1', '\u{1F3C6}', '\u2728', '\u{1F3AF}', '\u{1F4A5}', '\u{1F680}'];
    return Array.from({ length: 16 }, (_, i) => ({
      emoji: emojis[i % emojis.length],
      left: `${10 + Math.random() * 80}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${1 + Math.random() * 1.5}s`,
    }));
  }, []);

  return (
    <div style={S.prCelebrate} onClick={onDismiss}>
      {/* Particle burst */}
      <div style={S.prParticleContainer}>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.left,
              bottom: '40%',
              fontSize: 24,
              animation: `confettiBurst ${p.duration} ease-out ${p.delay} both`,
              pointerEvents: 'none',
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      <div style={S.prCelebrateContent}>
        <div style={S.prCelebrateEmoji}>{'\u{1F525}'}</div>
        <div style={S.prCelebrateTitle}>NEW PR!</div>
        <div style={{ color: '#888', marginTop: 8, fontSize: '1rem' }}>{name}</div>
        <div style={{ color: colors.primary, fontSize: '2.5rem', fontWeight: 800, marginTop: 8 }}>{value}</div>
        <div style={{ color: '#555', fontSize: '0.8rem', marginTop: 4 }}>{category}</div>
      </div>
    </div>
  );
}

// ─── Swipe Day Indicator ────────────────────────────────────────────────────
function SwipeDayIndicator({ count, current }: { count: number; current: number }) {
  if (count <= 1) return null;
  return (
    <div style={S.swipeIndicator}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            ...S.swipeDot,
            background: i === current ? colors.primary : 'rgba(255,255,255,0.15)',
            width: i === current ? 18 : 6,
            borderRadius: 3,
          }}
        />
      ))}
    </div>
  );
}

// ─── Pull-to-Refresh Indicator ──────────────────────────────────────────────
function PullRefreshIndicator({ pullDistance, isRefreshing }: { pullDistance: number; isRefreshing: boolean }) {
  const height = Math.min(pullDistance, 60);
  if (height <= 0 && !isRefreshing) return null;

  return (
    <div style={{ ...S.pullRefresh, height: isRefreshing ? 50 : height }}>
      <span style={{
        ...S.pullRefreshSpinner,
        opacity: Math.min(1, height / 40),
        transform: isRefreshing ? undefined : `rotate(${pullDistance * 3}deg)`,
        animation: isRefreshing ? 'pullRefreshSpin 0.8s linear infinite' : 'none',
      }}>
        <Icon name="refresh" size={22} />
      </span>
    </div>
  );
}

// ─── AppShell (Main App with Bottom Nav) ────────────────────────────────────
function AppShell({ profile, onProfileUpdate }: { profile: UserProfile; onProfileUpdate: (p: UserProfile) => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('workout');
  const [prevTab, setPrevTab] = useState<TabId>('workout');
  const [showQuick, setShowQuick] = useState(false);
  const [quickWorkout, setQuickWorkout] = useState<QuickTemplate | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [showNutritionFromDash, setShowNutritionFromDash] = useState(false);
  const [showExerciseHistoryFromDash, setShowExerciseHistoryFromDash] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [tabTransition, setTabTransition] = useState<'left' | 'right' | null>(null);

  // Gesture state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const isSwiping = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartY = useRef(0);
  const isPulling = useRef(false);

  const demoMode = useDemoMode();
  const workout = useWorkout();
  const progress = useProgress();
  const plan = usePlan();

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

  // Handle tab switch with direction animation
  const handleTabSwitch = useCallback((tab: TabId) => {
    if (tab === activeTab) return;
    const fromIdx = TAB_ORDER.indexOf(activeTab);
    const toIdx = TAB_ORDER.indexOf(tab);
    setTabTransition(toIdx > fromIdx ? 'right' : 'left');
    setPrevTab(activeTab);
    setActiveTab(tab);
    setTimeout(() => setTabTransition(null), 300);
  }, [activeTab]);

  // ─── Swipe Gesture Handler (workout view day switching) ────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (activeTab !== 'workout') return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchDeltaX.current = 0;
    isSwiping.current = false;
  }, [activeTab]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (activeTab !== 'workout') return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;

    // Only start swiping if horizontal movement is dominant
    if (!isSwiping.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      isSwiping.current = true;
    }

    if (isSwiping.current) {
      touchDeltaX.current = dx;
      if (mainRef.current) {
        const clampedDx = Math.max(-60, Math.min(60, dx * 0.3));
        mainRef.current.style.transform = `translateX(${clampedDx}px)`;
        mainRef.current.style.transition = 'none';
      }
    }
  }, [activeTab]);

  const handleTouchEnd = useCallback(() => {
    if (activeTab !== 'workout') return;

    if (mainRef.current) {
      mainRef.current.style.transform = '';
      mainRef.current.style.transition = 'transform 0.25s ease';
    }

    if (isSwiping.current && Math.abs(touchDeltaX.current) > 50) {
      const direction = touchDeltaX.current > 0 ? -1 : 1;
      const newIndex = plan.dayIndex + direction;
      if (newIndex >= 0 && newIndex < plan.days.length) {
        plan.setDayIndex(newIndex);
        workout.resetWorkoutState();
      }
    }

    isSwiping.current = false;
    touchDeltaX.current = 0;
  }, [activeTab, plan, workout]);

  // ─── Pull-to-Refresh (dashboard) ──────────────────────────────────────
  const handlePullStart = useCallback((e: React.TouchEvent) => {
    if (activeTab !== 'dashboard') return;
    const scrollTop = mainRef.current?.scrollTop ?? 0;
    if (scrollTop <= 0) {
      pullStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [activeTab]);

  const handlePullMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || activeTab !== 'dashboard') return;
    const dy = e.touches[0].clientY - pullStartY.current;
    if (dy > 0) {
      setPullDistance(dy * 0.4);
    }
  }, [activeTab]);

  const handlePullEnd = useCallback(() => {
    if (!isPulling.current || activeTab !== 'dashboard') return;
    isPulling.current = false;

    if (pullDistance > 50) {
      setIsRefreshing(true);
      // Simulate refresh
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1000);
    } else {
      setPullDistance(0);
    }
  }, [activeTab, pullDistance]);

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

  // Get tab transition class
  const transitionClass = tabTransition === 'right' ? 'tab-enter-right' : tabTransition === 'left' ? 'tab-enter-left' : '';

  return (
    <div style={S.container}>
      {/* Celebrate overlay */}
      {celebrate && (
        <div style={S.celebrate}>
          <div style={S.celebContent}>
            <div style={{ fontSize: 48 }}>🏆</div>
            <div style={S.celebTitle}>GREAT WORK!</div>
          </div>
        </div>
      )}

      {/* PR Celebration */}
      {workout.newPR && (
        <PRCelebration
          name={workout.newPR.name}
          category={workout.newPR.category}
          value={workout.newPR.value}
          onDismiss={workout.dismissPR}
        />
      )}

      {/* Header */}
      <header style={{
        ...S.header,
        paddingTop: 'max(16px, env(safe-area-inset-top))',
      }}>
        <div style={S.headerLeft}>
          <div style={S.logo}><Icon name="dumbbell" size={22} /></div>
          <div>
            <h1 style={S.title}>IRON PROTOCOL</h1>
            <p style={S.welcome}>Good {getGreeting()}, {profile.name?.split(' ')[0]}</p>
          </div>
        </div>
        <div style={S.streak}><Icon name="flame" size={16} /> {streak}</div>
      </header>

      {workout.weekCount > 0 && activeTab === 'workout' && (
        <div style={S.weekBadge}>
          Week {workout.weekCount} of training
          {workout.weekCount >= 4 && <span style={{ color: '#FF9500' }}> · Deload recommended</span>}
        </div>
      )}

      {/* Main content with gestures */}
      <main
        ref={mainRef}
        style={{
          ...S.main,
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          willChange: activeTab === 'workout' ? 'transform' : 'auto',
        }}
        onTouchStart={activeTab === 'workout' ? handleTouchStart : handlePullStart}
        onTouchMove={activeTab === 'workout' ? handleTouchMove : handlePullMove}
        onTouchEnd={activeTab === 'workout' ? handleTouchEnd : handlePullEnd}
      >
        {/* Pull-to-refresh indicator */}
        {activeTab === 'dashboard' && (
          <PullRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
        )}

        {/* Tab content with transition */}
        <div className={transitionClass} key={activeTab}>
          {activeTab === 'workout' && (
            <>
              <SwipeDayIndicator count={plan.days.length} current={plan.dayIndex} />
              <WorkoutView profile={profile} />
            </>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              profile={profile}
              streak={streak}
              onOpenNutrition={() => setShowNutritionFromDash(true)}
              onOpenMeasurements={() => setShowMeasurements(true)}
              onShowExerciseHistory={setShowExerciseHistoryFromDash}
              demoMode={demoMode.enabled}
              onToggleDemo={demoMode.setEnabled}
            />
          )}

          {activeTab === 'quick' && (
            <QuickWorkoutList
              onSelect={(template) => { setQuickWorkout(template); }}
              onClose={() => handleTabSwitch('workout')}
              inline
            />
          )}

          {activeTab === 'profile' && (
            <Profile
              profile={profile}
              onProfileUpdate={onProfileUpdate}
            />
          )}
        </div>
      </main>

      {/* Measurements modal */}
      {showMeasurements && (
        <MeasurementsModal
          currentWeight={profile.weight}
          onSave={(data) => { progress.saveMeasurement(data); setShowMeasurements(false); }}
          onClose={() => setShowMeasurements(false)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav active={activeTab} onSelect={handleTabSwitch} />

      <style>{globalCss}</style>
    </div>
  );
}
