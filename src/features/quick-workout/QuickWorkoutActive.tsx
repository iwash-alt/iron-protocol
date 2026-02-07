import React, { useState, useEffect } from 'react';
import type { Exercise } from '@/shared/types';
import { Icon } from '@/shared/components';
import { S, globalCss } from '@/shared/theme/styles';
import { findExerciseByName } from '@/data/exercises';
import type { QuickTemplate } from '@/data/quick-templates';

interface QuickWorkoutActiveProps {
  template: QuickTemplate;
  onComplete: () => void;
  onCancel: () => void;
}

type Phase = 'countdown' | 'active';

export function QuickWorkoutActive({ template, onComplete, onCancel }: QuickWorkoutActiveProps) {
  const [phase, setPhase] = useState<Phase>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [timer, setTimer] = useState(40);
  const [isRest, setIsRest] = useState(false);

  const resolvedExercises = template.exercises
    .map(name => findExerciseByName(name))
    .filter((e): e is Exercise => e !== undefined);

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
              setExerciseIndex(i => i + 1);
              setIsRest(false);
              return 40;
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
  }, [phase, timer, isRest, exerciseIndex, resolvedExercises.length, onComplete]);

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

  const currentExercise = resolvedExercises[exerciseIndex];

  return (
    <div style={S.container}>
      <div style={S.quickActive}>
        <div style={S.qaHeader}>
          <h2 style={S.qaTitle}>{template.name}</h2>
          <button onClick={onCancel} style={S.iconBtn}><Icon name="close" /></button>
        </div>
        <div style={S.qaDots}>
          {resolvedExercises.map((_, i) => (
            <div key={i} style={{ ...S.qaDot, background: i < exerciseIndex ? '#34C759' : i === exerciseIndex ? '#FF3B30' : '#333' }} />
          ))}
        </div>
        <div style={S.qaMain}>
          <div style={{ ...S.qaCircle, borderColor: isRest ? '#34C759' : '#FF3B30' }}>
            <div style={S.qaTime}>{timer}</div>
            <div style={S.qaLabel}>{isRest ? 'REST' : 'WORK'}</div>
          </div>
          <h3 style={S.qaExName}>{isRest ? 'Get Ready...' : currentExercise?.name?.toUpperCase()}</h3>
        </div>
      </div>
      <style>{globalCss}</style>
    </div>
  );
}
