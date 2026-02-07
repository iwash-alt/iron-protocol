import React, { useState } from 'react';
import type { UserProfile, ExperienceLevel, TrainingDays } from '@/shared/types';
import { Icon } from '@/shared/components';
import { S, globalCss } from '@/shared/theme/styles';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '',
    height: 180,
    weight: 80,
    age: 30,
    level: 'intermediate' as ExperienceLevel,
    days: 3 as TrainingDays,
    health: false,
  });

  const upd = <K extends keyof typeof data>(key: K, value: typeof data[K]) => {
    setData(d => ({ ...d, [key]: value }));
  };

  const steps = [
    <div key="0" style={S.obStep}>
      <div style={S.obIcon}><Icon name="dumbbell" size={32} /></div>
      <h1 style={S.obTitle}>IRON PROTOCOL</h1>
      <p style={S.obText}>Progressive overload with smart auto-regulation. Let's build your program.</p>
      <button onClick={() => setStep(1)} style={S.obBtn}>GET STARTED</button>
    </div>,

    <div key="1" style={S.obStep}>
      <h2 style={S.obStepTitle}>What's your name?</h2>
      <input value={data.name} onChange={e => upd('name', e.target.value)} placeholder="Enter your name" style={S.obInput} autoFocus />
      <button onClick={() => setStep(2)} disabled={!data.name} style={S.obBtn}>CONTINUE</button>
    </div>,

    <div key="2" style={S.obStep}>
      <h2 style={S.obStepTitle}>Your Stats</h2>
      <div style={S.obStats}>
        <div><label style={S.obLabel}>HEIGHT (cm)</label><input type="number" value={data.height} onChange={e => upd('height', +e.target.value)} style={S.obInputSm} /></div>
        <div><label style={S.obLabel}>WEIGHT (kg)</label><input type="number" value={data.weight} onChange={e => upd('weight', +e.target.value)} style={S.obInputSm} /></div>
        <div><label style={S.obLabel}>AGE</label><input type="number" value={data.age} onChange={e => upd('age', +e.target.value)} style={S.obInputSm} /></div>
      </div>
      <button onClick={() => setStep(3)} style={S.obBtn}>CONTINUE</button>
    </div>,

    <div key="3" style={S.obStep}>
      <h2 style={S.obStepTitle}>Experience Level</h2>
      <div style={S.obOpts}>
        {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
          <button key={l} onClick={() => upd('level', l)} style={{ ...S.obOpt, ...(data.level === l ? S.obOptActive : {}) }}>
            <span style={S.obOptText}>{l.toUpperCase()}</span>
            <span style={S.obOptSub}>{l === 'beginner' ? '< 1 year' : l === 'intermediate' ? '1-3 years' : '3+ years'}</span>
          </button>
        ))}
      </div>
      <button onClick={() => setStep(4)} style={S.obBtn}>CONTINUE</button>
    </div>,

    <div key="4" style={S.obStep}>
      <h2 style={S.obStepTitle}>Training Days</h2>
      <p style={S.obSubtext}>How many days per week?</p>
      <div style={S.dayPicker}>
        {([3, 4] as const).map(d => (
          <button key={d} onClick={() => upd('days', d)} style={{ ...S.dayBtn, ...(data.days === d ? S.dayBtnActive : {}) }}>{d}</button>
        ))}
      </div>
      <button onClick={() => setStep(5)} style={S.obBtn}>CONTINUE</button>
    </div>,

    <div key="5" style={S.obStep}>
      <h2 style={S.obStepTitle}>Health Check</h2>
      <p style={S.obSubtext}>Any conditions affecting hydration? (kidney, diabetes)</p>
      <div style={S.obOptRow}>
        <button onClick={() => { upd('health', true); setStep(6); }} style={S.obOptSmall}>YES</button>
        <button onClick={() => { upd('health', false); setStep(6); }} style={S.obOptSmall}>NO</button>
      </div>
    </div>,

    <div key="6" style={S.obStep}>
      <div style={{ ...S.obIcon, background: '#34C759' }}><Icon name="check" size={32} /></div>
      <h2 style={S.obStepTitle}>You're All Set!</h2>
      <p style={S.obText}>Your program is ready. Let's get strong!</p>
      <button onClick={() => onComplete(data)} style={{ ...S.obBtn, background: '#34C759' }}>START TRAINING</button>
    </div>,
  ];

  return (
    <div style={S.obContainer}>
      <div style={S.obDots}>
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ ...S.obDot, background: i <= step ? '#FF3B30' : '#333' }} />
        ))}
      </div>
      {steps[step]}
      <style>{globalCss}</style>
    </div>
  );
}
