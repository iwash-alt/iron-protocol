import React, { useState, useMemo } from 'react';
import type { UserProfile, TrainingDays } from '@/shared/types';
import type { PlanState } from '@/features/training-plan/plan.reducer';
import { Icon } from '@/shared/components';
import { S, globalCss } from '@/shared/theme/styles';
import { workoutTemplates } from '@/data/templates';
import { createPlanFromTemplate } from '@/features/training-plan/plan.reducer';

const COMPOUND_NAMES = [
  'Barbell Bench Press',
  'Squat',
  'Deadlift',
  'Overhead Press',
  'Barbell Row',
];

const TEMPLATE_ORDER = ['ppl', 'upperLower', 'fullBody', 'broSplit'] as const;

interface OnboardingProps {
  onComplete: (profile: UserProfile, plan: PlanState) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [weights, setWeights] = useState<Record<string, number>>({});

  const compounds = useMemo(() => {
    if (!selectedTemplate) return [];
    const template = workoutTemplates[selectedTemplate];
    if (!template) return [];
    const allExercises = template.days.flatMap(d => d.exercises);
    const seen = new Set<string>();
    return COMPOUND_NAMES.filter(n => {
      if (seen.has(n)) return false;
      if (!allExercises.includes(n)) return false;
      seen.add(n);
      return true;
    });
  }, [selectedTemplate]);

  const handleWeightChange = (exerciseName: string, value: string) => {
    const num = value === '' ? 0 : Math.max(0, Math.round(Number(value)));
    setWeights(w => ({ ...w, [exerciseName]: num }));
  };

  const handleStart = () => {
    if (!selectedTemplate) return;
    const template = workoutTemplates[selectedTemplate];
    const profile: UserProfile = {
      name: name.trim(),
      height: 175,
      weight: 80,
      age: 30,
      level: 'intermediate',
      days: (template?.daysPerWeek ?? 3) as TrainingDays,
    };
    const plan = createPlanFromTemplate(selectedTemplate, weights);
    onComplete(profile, plan);
  };

  const steps = [
    // Screen 1: SPLASH
    <div key="splash" style={S.obStep}>
      <div style={S.obIcon}><Icon name="dumbbell" size={32} /></div>
      <h1 style={S.obTitle}>IRON PROTOCOL</h1>
      <p style={S.obText}>TRAIN HARDER. PROGRESS FASTER.</p>
      <button onClick={() => setStep(1)} style={S.obBtn}>GET STARTED</button>
    </div>,

    // Screen 2: YOUR NAME
    <div key="name" style={S.obStep}>
      <h2 style={S.obStepTitle}>What should we call you?</h2>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name"
        style={S.obInput}
        autoFocus
        enterKeyHint="next"
        onKeyDown={e => { if (e.key === 'Enter' && name.trim()) setStep(2); }}
      />
      <button
        onClick={() => setStep(2)}
        disabled={!name.trim()}
        style={S.obBtn}
      >
        NEXT
      </button>
    </div>,

    // Screen 3: CHOOSE YOUR PROGRAM
    <div key="program" style={S.obStep}>
      <h2 style={S.obStepTitle}>Pick a starting program</h2>
      <p style={S.obSubtext}>You can build your own later</p>
      <div style={S.obOpts}>
        {TEMPLATE_ORDER.map(key => {
          const t = workoutTemplates[key];
          const isSelected = selectedTemplate === key;
          return (
            <div
              key={key}
              onClick={() => setSelectedTemplate(key)}
              style={{ ...S.obCard, ...(isSelected ? S.obCardActive : {}) }}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedTemplate(key); }}
            >
              <div style={S.obCardHeader}>
                <span style={S.obCardName}>
                  {t.name}
                  {key === 'ppl' && <span style={S.obBadge}>POPULAR</span>}
                </span>
                <span style={S.obCardDays}>{t.daysPerWeek} days/week</span>
              </div>
              <span style={S.obCardDesc}>{t.description}</span>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => { setWeights({}); setStep(3); }}
        disabled={!selectedTemplate}
        style={S.obBtn}
      >
        NEXT
      </button>
    </div>,

    // Screen 4: SET YOUR WEIGHTS
    <div key="weights" style={S.obStep}>
      <h2 style={S.obStepTitle}>Set your starting weights</h2>
      <p style={S.obSubtext}>Leave at 0 if you're unsure</p>
      <div style={S.obWeightList}>
        {compounds.map(exerciseName => (
          <div key={exerciseName} style={S.obWeightRow}>
            <span style={S.obWeightLabel}>{exerciseName}</span>
            <div style={S.obWeightInputWrap}>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={weights[exerciseName] ?? 0}
                onChange={e => handleWeightChange(exerciseName, e.target.value)}
                style={S.obWeightInput}
              />
              <span style={S.obWeightUnit}>kg</span>
            </div>
          </div>
        ))}
      </div>
      <p style={S.obDisclaimer}>
        Iron Protocol is a training tool, not medical advice. Consult a physician before starting any exercise program.
      </p>
      <button onClick={handleStart} style={S.obBtn}>START TRAINING</button>
    </div>,
  ];

  return (
    <div style={S.obContainer}>
      <div style={S.obDots}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ ...S.obDot, background: i <= step ? '#FF3B30' : '#333' }} />
        ))}
      </div>
      {steps[step]}
      <style>{globalCss}</style>
    </div>
  );
}
