import React, { useState, useCallback, useEffect } from 'react';

import { useProfile } from './hooks/useProfile';
import { useWorkout } from './hooks/useWorkout';
import { useRestTimer } from './hooks/useRestTimer';
import { useQuickWorkout } from './hooks/useQuickWorkout';
import { useNutrition } from './hooks/useNutrition';
import { useTrainingHistory } from './hooks/useTrainingHistory';

import { calculate1RM, calculateSetProgression, calculateIncompleteSetPenalty, getTodayKey } from './training/engine';
import { calculateProteinGoal, WATER_GOAL } from './analytics/stats';

import { S, css } from './ui/styles';
import Header from './ui/layout/Header';
import Navigation from './ui/layout/Navigation';
import Onboarding from './ui/screens/Onboarding';
import WorkoutView from './ui/screens/WorkoutView';
import QuickWorkoutReady from './ui/screens/QuickWorkoutReady';
import QuickWorkoutActive from './ui/screens/QuickWorkoutActive';
import Dashboard from './ui/screens/Dashboard';

import RPEModal from './ui/modals/RPEModal';
import NutritionModal from './ui/modals/NutritionModal';
import ExerciseEditModal from './ui/modals/ExerciseEditModal';
import SwapExerciseModal from './ui/modals/SwapExerciseModal';
import VideoModal from './ui/modals/VideoModal';
import TemplatesModal from './ui/modals/TemplatesModal';
import AddExerciseModal from './ui/modals/AddExerciseModal';
import EndWorkoutModal from './ui/modals/EndWorkoutModal';
import ExerciseHistoryModal from './ui/modals/ExerciseHistoryModal';
import MeasurementsModal from './ui/modals/MeasurementsModal';
import DeloadModal from './ui/modals/DeloadModal';
import QuickWorkoutModal from './ui/modals/QuickWorkoutModal';

export default function IronProtocol() {
  // --- State hooks ---
  const { profile, saveProfile } = useProfile();
  const workout = useWorkout(profile);
  const restTimer = useRestTimer();
  const history = useTrainingHistory();
  const nutrition = useNutrition(profile);

  const [celebrate, setCelebrate] = useState(false);
  const [newPR, setNewPR] = useState(null);

  const triggerCelebrate = useCallback(() => {
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2000);
  }, []);

  const quickWorkout = useQuickWorkout({ onComplete: triggerCelebrate });

  // --- UI state ---
  const [view, setView] = useState('workout');
  const [showWarmup, setShowWarmup] = useState(null);
  const [showDeloadAlert, setShowDeloadAlert] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [showVideo, setShowVideo] = useState(null);
  const [showSwap, setShowSwap] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showRPE, setShowRPE] = useState(null);
  const [showExerciseHistory, setShowExerciseHistory] = useState(null);

  // --- Initialize plan on profile load ---
  useEffect(() => {
    if (profile) workout.initializePlan(profile);
  }, [profile]);

  // --- Derived values ---
  const proteinGoal = calculateProteinGoal(profile);
  const progress = workout.progress();

  // --- Orchestration: RPE confirmation ---
  const handleCompleteSet = useCallback((pe) => {
    const done = workout.completed[pe.id] || 0;
    if (done < pe.sets) {
      setShowRPE({ visId: pe.id, setNum: done + 1, exercise: pe });
    }
  }, [workout.completed]);

  const handleConfirmRPE = useCallback((rpe) => {
    if (!showRPE) return;
    const { visId, setNum, exercise } = showRPE;

    workout.logSet(exercise.exercise.name, exercise.weight, exercise.reps, setNum, rpe);

    if (!exercise.exercise.bodyweight) {
      const e1rm = calculate1RM(exercise.weight, exercise.reps);
      const prResult = history.checkAndUpdatePR(exercise.exercise.name, e1rm);
      if (prResult) {
        setNewPR(prResult);
        setTimeout(() => setNewPR(null), 3000);
      }
      history.addExerciseEntry(exercise.exercise.name, {
        date: getTodayKey(), weight: exercise.weight, reps: exercise.reps, e1rm,
      });
    }

    workout.markSetComplete(visId, setNum);
    restTimer.startRest(exercise.rest, visId);

    if (setNum === exercise.sets) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1500);
      const progression = calculateSetProgression(rpe, exercise);
      if (progression) workout.updateExercise(visId, progression);
    }

    setShowRPE(null);
  }, [showRPE, workout, history, restTimer]);

  // --- Orchestration: End workout ---
  const handleEndWorkout = useCallback((force = false) => {
    if (!force && progress < 100) {
      setShowEndConfirm(true);
      return;
    }

    workout.dayExercises.forEach(pe => {
      const done = workout.completed[pe.id] || 0;
      if (!pe.exercise.bodyweight && done < pe.sets) {
        const penalty = calculateIncompleteSetPenalty(pe);
        if (penalty) workout.updateExercise(pe.id, penalty);
      }
    });

    const vol = workout.currentWorkoutLog.reduce((a, l) => a + l.weight * l.reps, 0);
    history.addWorkoutToHistory({
      date: getTodayKey(),
      dayName: workout.currentDay?.name,
      exercises: workout.currentWorkoutLog,
      volume: vol,
      completedPct: progress,
    });

    const newWeekCount = history.trackWeek();
    if (newWeekCount > 0 && newWeekCount % 4 === 0) {
      setShowDeloadAlert(true);
    }

    workout.resetWorkoutState();
    setShowEndConfirm(false);
    triggerCelebrate();
  }, [progress, workout, history, triggerCelebrate]);

  // --- Orchestration: Template change ---
  const handleApplyTemplate = useCallback((templateKey) => {
    workout.applyTemplate(templateKey);
    setShowTemplates(false);
  }, [workout]);

  // --- Orchestration: Exercise edit ---
  const handleUpdateExercise = useCallback((id, fieldOrObj, value) => {
    workout.updateExercise(id, fieldOrObj, value);
    if (editingExercise?.id === id) {
      const patch = (fieldOrObj && typeof fieldOrObj === 'object') ? fieldOrObj : { [fieldOrObj]: value };
      setEditingExercise(prev => ({ ...prev, ...patch }));
    }
  }, [workout, editingExercise]);

  const handleRemoveExercise = useCallback((id) => {
    workout.removeExercise(id);
    setEditingExercise(null);
  }, [workout]);

  const handleAddExercise = useCallback((exercise) => {
    workout.addExerciseToDay(exercise);
    setShowAddExercise(false);
  }, [workout]);

  // --- Orchestration: Swap exercise ---
  const handleSwap = useCallback((peId, newExercise) => {
    workout.updateExercise(peId, { exercise: newExercise });
    setShowSwap(null);
  }, [workout]);

  // --- Orchestration: Measurements ---
  const handleSaveMeasurement = useCallback((data) => {
    history.saveMeasurement(data);
    setShowMeasurements(false);
  }, [history]);

  // --- Orchestration: Profile save ---
  const handleSaveProfile = useCallback((p) => {
    saveProfile(p);
  }, [saveProfile]);

  // --- Render: Onboarding ---
  if (!profile) return <Onboarding onComplete={handleSaveProfile} />;

  // --- Render: Quick workout screens ---
  if (quickWorkout.quickReady && quickWorkout.readyCountdown > 0) {
    return <QuickWorkoutReady template={quickWorkout.quickReady} countdown={quickWorkout.readyCountdown} onCancel={quickWorkout.cancelQuickReady} />;
  }
  if (quickWorkout.quickActive) {
    return <QuickWorkoutActive workout={quickWorkout.quickActive} currentIdx={quickWorkout.quickIdx} timer={quickWorkout.quickTimer} isResting={quickWorkout.quickRest} onCancel={quickWorkout.cancelQuickActive} />;
  }

  // --- Render: Main app ---
  return (
    <div style={S.container}>
      {celebrate && <div style={S.celebrate}><div style={S.celebContent}><div style={{ fontSize: 48 }}>&#x1F3C6;</div><div style={S.celebTitle}>GREAT WORK!</div></div></div>}
      {newPR && <div style={S.celebrate}><div style={S.celebContent}><div style={{ fontSize: 48 }}>&#x1F525;</div><div style={S.celebTitle}>NEW PR!</div><div style={{ color: '#888', marginTop: 8, fontSize: '0.9rem' }}>{newPR.name}</div><div style={{ color: '#FF3B30', fontSize: '1.75rem', fontWeight: 800, marginTop: 4 }}>{newPR.weight}kg</div><div style={{ color: '#555', fontSize: '0.75rem' }}>Estimated 1RM</div></div></div>}

      {showDeloadAlert && <DeloadModal weekCount={history.weekCount} onReset={() => { history.resetDeload(); setShowDeloadAlert(false); }} onDismiss={() => setShowDeloadAlert(false)} />}

      <Header profile={profile} streak={history.streak} />

      {history.weekCount > 0 && (
        <div style={S.weekBadge}>
          Week {history.weekCount} of training
          {history.weekCount >= 4 && <span style={{ color: '#FF9500' }}> &bull; Deload recommended</span>}
        </div>
      )}

      <Navigation view={view} onSetView={setView} onShowQuick={() => quickWorkout.setShowQuick(true)} />

      <main style={S.main}>
        {view === 'workout' ? (
          <WorkoutView
            days={workout.days}
            dayIdx={workout.dayIdx}
            dayExercises={workout.dayExercises}
            completed={workout.completed}
            progress={progress}
            restTime={restTimer.restTime}
            restFor={restTimer.restFor}
            proteinGoal={proteinGoal}
            waterGoal={WATER_GOAL}
            todayWater={nutrition.todayWater}
            todayProtein={nutrition.todayProtein}
            exerciseHistory={history.exerciseHistory}
            showWarmup={showWarmup}
            onSwitchDay={workout.switchDay}
            onCompleteSet={handleCompleteSet}
            onEditExercise={setEditingExercise}
            onShowSwap={setShowSwap}
            onShowVideo={setShowVideo}
            onShowWarmup={setShowWarmup}
            onShowExerciseHistory={setShowExerciseHistory}
            onShowAddExercise={() => setShowAddExercise(true)}
            onShowTemplates={() => setShowTemplates(true)}
            onShowNutrition={() => setShowNutrition(true)}
            onAddWater={nutrition.addWater}
            onEndWorkout={() => handleEndWorkout()}
            onSkipRest={restTimer.skipRest}
          />
        ) : (
          <Dashboard
            profile={profile}
            workoutHistory={history.workoutHistory}
            exerciseHistory={history.exerciseHistory}
            todayWater={nutrition.todayWater}
            todayProtein={nutrition.todayProtein}
            proteinGoal={proteinGoal}
            waterGoal={WATER_GOAL}
            nutritionHistory={nutrition.nutritionHistory}
            personalRecords={history.personalRecords}
            bodyMeasurements={history.bodyMeasurements}
            streak={history.streak}
            weekCount={history.weekCount}
            onAddWater={nutrition.addWater}
            onOpenNutrition={() => setShowNutrition(true)}
            onOpenMeasurements={() => setShowMeasurements(true)}
            onShowExerciseHistory={setShowExerciseHistory}
          />
        )}
      </main>

      {quickWorkout.showQuick && <QuickWorkoutModal onStart={quickWorkout.startQuickWorkout} onClose={() => quickWorkout.setShowQuick(false)} />}
      {editingExercise && <ExerciseEditModal exercise={editingExercise} onUpdate={handleUpdateExercise} onRemove={handleRemoveExercise} onClose={() => setEditingExercise(null)} />}
      {showNutrition && <NutritionModal todayWater={nutrition.todayWater} waterGoal={WATER_GOAL} todayProtein={nutrition.todayProtein} proteinGoal={proteinGoal} onSetWater={nutrition.setTodayWater} onAddWater={nutrition.addWater} onAddProtein={nutrition.addProtein} onClose={() => setShowNutrition(false)} />}
      {showMeasurements && <MeasurementsModal onSave={handleSaveMeasurement} onClose={() => setShowMeasurements(false)} currentWeight={profile.weight} />}
      {showExerciseHistory && <ExerciseHistoryModal exerciseName={showExerciseHistory} history={history.exerciseHistory} onClose={() => setShowExerciseHistory(null)} />}
      {showEndConfirm && <EndWorkoutModal progress={progress} onKeepGoing={() => setShowEndConfirm(false)} onEnd={() => handleEndWorkout(true)} />}
      {showVideo && <VideoModal exercise={showVideo} onClose={() => setShowVideo(null)} />}
      {showSwap && <SwapExerciseModal showSwap={showSwap} onSwap={handleSwap} onClose={() => setShowSwap(null)} />}
      {showRPE && <RPEModal showRPE={showRPE} onConfirm={handleConfirmRPE} onCancel={() => setShowRPE(null)} />}
      {showAddExercise && <AddExerciseModal dayName={workout.currentDay?.name} onAdd={handleAddExercise} onClose={() => setShowAddExercise(false)} />}
      {showTemplates && <TemplatesModal onApply={handleApplyTemplate} onClose={() => setShowTemplates(false)} />}

      <style>{css}</style>
    </div>
  );
}
