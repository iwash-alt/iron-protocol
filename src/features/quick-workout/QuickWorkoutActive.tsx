import React, { useState, useEffect, useMemo } from 'react';
import type { Exercise } from '@/shared/types';
import { Icon } from '@/shared/components';
import { S, globalCss } from '@/shared/theme/styles';
import { findExerciseByName } from '@/data/exercises';
import type { QuickTemplate, QuickExerciseConfig } from '@/data/quick-templates';

interface QuickWorkoutActiveProps {
  template: QuickTemplate;
  onComplete: () => void;
  onCancel: () => void;
}

interface ResolvedQuickExercise {
  exercise: Exercise;
  config: QuickExerciseConfig;
}

type Phase = 'countdown' | 'active';

function getWorkDuration(config: QuickExerciseConfig): number {
  return config.durationSeconds ?? 40;
}

function formatTarget(config: QuickExerciseConfig): string {
  if (config.durationSeconds !== null) {
    return `${config.durationSeconds}s`;
  }
  return `${config.reps} REPS`;
}

export function QuickWorkoutActive({ template, onComplete, onCancel }: QuickWorkoutActiveProps) {
  const [phase, setPhase] = useState<Phase>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [isRest, setIsRest] = useState(false);

  const resolvedExercises = useMemo<ResolvedQuickExercise[]>(() =>
    template.exercises
      .map(config => {
        const exercise = findExerciseByName(config.name);
        return exercise ? { exercise, config } : null;
      })
      .filter((e): e is ResolvedQuickExercise => e !== null),
  [template.exercises]);

  const initialDuration = resolvedExercises.length > 0
    ? getWorkDuration(resolvedExercises[0].config)
    : 40;
  const [timer, setTimer] = useState(initialDuration);

  // Countdown phase
  useEffect(() => {
    if (phase !== 'countdown' || countdown <= 0) return;
    const t = setTimeout(() => {
      if (countdown <= 1) {
        setPhase('active');
      } else {
        setCountdown(c => c - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Active phase timer
  useEffect(() => {
    if (phase !== 'active' || timer <= 0) return;
    const t = setTimeout(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (isRest) {
            if (exerciseIndex < resolvedExercises.length - 1) {
              const nextIndex = exerciseIndex + 1;
              setExerciseIndex(nextIndex);
              setIsRest(false);
              return getWorkDuration(resolvedExercises[nextIndex].config);
            }
            onComplete();
            return 0;
          }
          setIsRest(true);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, timer, isRest, exerciseIndex, resolvedExercises, onComplete]);

  if (phase === 'countdown') {
    return (
      <div style={S.container}>
        <div style={S.readyScreen}>
          <h2 style={S.readyTitle}>{template.name}</h2>
          <div style={S.readyCircle}>
            <div style={S.readyCount}>{countdown}</div>
          </div>
          <p style={S.readyText}>GET READY!</p>
          <button onClick={onCancel} style={S.readyCancel}>CANCEL</button>
        </div>
        <style>{globalCss}</style>
      </div>
    );
  }

  const current = resolvedExercises[exerciseIndex];

  return (
    <div style={S.container}>
      <div style={S.quickActive}>
        <div style={S.qaHeader}>
          <h2 style={S.qaTitle}>{template.name}</h2>
          <button onClick={onCancel} style={S.iconBtn}><Icon name="close" /></button>
        </div>
        <div style={S.qaDots}>
          {resolvedExercises.map((_entry, i) => (
            <div key={i} style={{ ...S.qaDot, background: i < exerciseIndex ? '#34C759' : i === exerciseIndex ? '#FF3B30' : '#333' }} />
          ))}
        </div>
        <div style={S.qaMain}>
          <div style={{ ...S.qaCircle, borderColor: isRest ? '#34C759' : '#FF3B30' }}>
            <div style={S.qaTime}>{timer}</div>
            <div style={S.qaLabel}>{isRest ? 'REST' : 'WORK'}</div>
          </div>
          <h3 style={S.qaExName}>{isRest ? 'Get Ready...' : current?.exercise.name?.toUpperCase()}</h3>
          {!isRest && current && (
            <p style={{ color: '#888', fontSize: '1.1rem', marginTop: 8, textAlign: 'center' }}>
              {formatTarget(current.config)}
            </p>
          )}
        </div>
      </div>
      <style>{globalCss}</style>
    </div>
  );
}
