import React, { useState, useEffect, useMemo, useRef } from 'react';

// ============ DATA & CONSTANTS ============
const exercises = [
  { id: '1', name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell', youtube: 'rT7DgCr-3pg', bodyweight: false },
  { id: '2', name: 'Push Ups', muscle: 'Chest', equipment: 'None', youtube: 'IODxDxX7oi4', bodyweight: true },
  { id: '3', name: 'Diamond Push Ups', muscle: 'Chest', equipment: 'None', youtube: 'J0DnG1_S92I', bodyweight: true },
  { id: '4', name: 'Incline Push Ups', muscle: 'Chest', equipment: 'None', youtube: 'cfns5VDVVvk', bodyweight: true },
  { id: '5', name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', youtube: '_RlRDWO2jfg', bodyweight: false },
  { id: '6', name: 'Pike Push Ups', muscle: 'Shoulders', equipment: 'None', youtube: 'sposDXWEB0A', bodyweight: true },
  { id: '7', name: 'Lateral Raises', muscle: 'Shoulders', equipment: 'Dumbbells', youtube: '3VcKaXpzqRo', bodyweight: false },
  { id: '8', name: 'Tricep Pushdown', muscle: 'Triceps', equipment: 'Cable', youtube: '2-LAMcpzODU', bodyweight: false },
  { id: '9', name: 'Tricep Dips', muscle: 'Triceps', equipment: 'None', youtube: '6kALZikXxLc', bodyweight: true },
  { id: '10', name: 'Deadlift', muscle: 'Back', equipment: 'Barbell', youtube: 'XxWcirHIwVo', bodyweight: false },
  { id: '11', name: 'Pull Ups', muscle: 'Back', equipment: 'Bar', youtube: 'eGo4IYlbE5g', bodyweight: true },
  { id: '12', name: 'Inverted Rows', muscle: 'Back', equipment: 'None', youtube: 'XZV9IwluPjw', bodyweight: true },
  { id: '13', name: 'Barbell Row', muscle: 'Back', equipment: 'Barbell', youtube: 'FWJR5Ve8bnQ', bodyweight: false },
  { id: '14', name: 'Lat Pulldown', muscle: 'Lats', equipment: 'Cable', youtube: 'CAwf7n6Luuc', bodyweight: false },
  { id: '15', name: 'Face Pulls', muscle: 'Rear Delts', equipment: 'Cable', youtube: 'rep-qVOkqgk', bodyweight: false },
  { id: '16', name: 'Barbell Curl', muscle: 'Biceps', equipment: 'Barbell', youtube: 'kwG2ipFRgfo', bodyweight: false },
  { id: '17', name: 'Squat', muscle: 'Quads', equipment: 'Barbell', youtube: 'bEv6CCg2BC8', bodyweight: false },
  { id: '18', name: 'Bodyweight Squats', muscle: 'Quads', equipment: 'None', youtube: 'aclHkVaku9U', bodyweight: true },
  { id: '19', name: 'Jump Squats', muscle: 'Quads', equipment: 'None', youtube: 'A-cFYWvaHr0', bodyweight: true },
  { id: '20', name: 'Lunges', muscle: 'Quads', equipment: 'None', youtube: 'QOVaHwm-Q6U', bodyweight: true },
  { id: '21', name: 'Bulgarian Split Squat', muscle: 'Quads', equipment: 'None', youtube: '2C-uNgKwPLE', bodyweight: true },
  { id: '22', name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Barbell', youtube: '7j-2w4-P14I', bodyweight: false },
  { id: '23', name: 'Glute Bridge', muscle: 'Glutes', equipment: 'None', youtube: 'OUgsJ8-Vi0E', bodyweight: true },
  { id: '24', name: 'Leg Press', muscle: 'Quads', equipment: 'Machine', youtube: 'IZxyjW7MPJQ', bodyweight: false },
  { id: '25', name: 'Calf Raises', muscle: 'Calves', equipment: 'None', youtube: 'gwLzBJYoWlI', bodyweight: true },
  { id: '26', name: 'Plank', muscle: 'Core', equipment: 'None', youtube: 'ASdvN_XEl_c', bodyweight: true },
  { id: '27', name: 'Mountain Climbers', muscle: 'Core', equipment: 'None', youtube: 'nmwgirgXLYM', bodyweight: true },
  { id: '28', name: 'Bicycle Crunches', muscle: 'Core', equipment: 'None', youtube: '9FGilxCbdz8', bodyweight: true },
  { id: '29', name: 'Burpees', muscle: 'Full Body', equipment: 'None', youtube: 'TU8QYVW0gDU', bodyweight: true },
  { id: '30', name: 'High Knees', muscle: 'Cardio', equipment: 'None', youtube: 'D0lLwTwjVbE', bodyweight: true },
];

const quickTemplates = [
  { id: 'full', name: 'Full Body Blast', duration: 20, exercises: ['Burpees', 'Push Ups', 'Bodyweight Squats', 'Plank', 'Mountain Climbers', 'Lunges'] },
  { id: 'upper', name: 'Upper Body Burn', duration: 20, exercises: ['Push Ups', 'Diamond Push Ups', 'Tricep Dips', 'Pike Push Ups', 'Plank', 'Inverted Rows'] },
  { id: 'lower', name: 'Leg Day Express', duration: 20, exercises: ['Bodyweight Squats', 'Lunges', 'Glute Bridge', 'Jump Squats', 'Calf Raises', 'Bulgarian Split Squat'] },
  { id: 'core', name: 'Core Crusher', duration: 15, exercises: ['Plank', 'Bicycle Crunches', 'Mountain Climbers', 'Glute Bridge', 'Burpees'] },
  { id: 'hiit', name: 'HIIT It Hard', duration: 25, exercises: ['Burpees', 'Jump Squats', 'Mountain Climbers', 'High Knees', 'Push Ups'] },
];

const workoutTemplates = {
  ppl: { id: 'ppl', name: 'Push / Pull / Legs', description: 'Classic 3-day split', days: [
    { name: 'Push', exercises: ['Barbell Bench Press', 'Overhead Press', 'Lateral Raises', 'Tricep Pushdown'] },
    { name: 'Pull', exercises: ['Deadlift', 'Barbell Row', 'Lat Pulldown', 'Barbell Curl', 'Face Pulls'] },
    { name: 'Legs', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raises'] }
  ]},
  upperLower: { id: 'upperLower', name: 'Upper / Lower', description: '4-day split', days: [
    { name: 'Upper A', exercises: ['Barbell Bench Press', 'Barbell Row', 'Overhead Press', 'Barbell Curl', 'Tricep Pushdown'] },
    { name: 'Lower A', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raises'] },
    { name: 'Upper B', exercises: ['Barbell Bench Press', 'Lat Pulldown', 'Lateral Raises', 'Barbell Curl', 'Tricep Pushdown'] },
    { name: 'Lower B', exercises: ['Deadlift', 'Squat', 'Leg Press', 'Calf Raises'] }
  ]},
  fullBody: { id: 'fullBody', name: 'Full Body', description: '3-day full body', days: [
    { name: 'Day A', exercises: ['Squat', 'Barbell Bench Press', 'Barbell Row', 'Overhead Press'] },
    { name: 'Day B', exercises: ['Deadlift', 'Barbell Bench Press', 'Lat Pulldown', 'Barbell Curl'] },
    { name: 'Day C', exercises: ['Squat', 'Overhead Press', 'Barbell Row', 'Tricep Pushdown'] }
  ]},
  broSplit: { id: 'broSplit', name: 'Bro Split', description: '5-day bodybuilding', days: [
    { name: 'Chest', exercises: ['Barbell Bench Press', 'Barbell Bench Press', 'Push Ups'] },
    { name: 'Back', exercises: ['Deadlift', 'Barbell Row', 'Lat Pulldown', 'Face Pulls'] },
    { name: 'Shoulders', exercises: ['Overhead Press', 'Lateral Raises', 'Face Pulls'] },
    { name: 'Legs', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raises'] },
    { name: 'Arms', exercises: ['Barbell Curl', 'Barbell Curl', 'Tricep Pushdown', 'Tricep Dips'] }
  ]}
};

const proteinSources = [
  { name: 'Chicken Breast', protein: 31, icon: '🍗' },
  { name: 'Protein Shake', protein: 25, icon: '🥤' },
  { name: 'Eggs (2)', protein: 12, icon: '🥚' },
  { name: 'Greek Yogurt', protein: 15, icon: '🥛' },
  { name: 'Tuna Can', protein: 20, icon: '🐟' },
  { name: 'Beef Steak', protein: 26, icon: '🥩' },
];

const calculate1RM = (weight, reps) => reps === 1 ? weight : Math.round(weight * (1 + reps / 30));
const getWarmupSets = (w) => w < 20 ? [] : [
  { label: 'Bar', weight: 20, reps: 10 },
  ...(Math.round(w*0.5/2.5)*2.5 > 20 ? [{ label: '50%', weight: Math.round(w*0.5/2.5)*2.5, reps: 5 }] : []),
  ...(Math.round(w*0.7/2.5)*2.5 > Math.round(w*0.5/2.5)*2.5 ? [{ label: '70%', weight: Math.round(w*0.7/2.5)*2.5, reps: 3 }] : []),
  ...(Math.round(w*0.9/2.5)*2.5 > Math.round(w*0.7/2.5)*2.5 ? [{ label: '90%', weight: Math.round(w*0.9/2.5)*2.5, reps: 1 }] : [])
];
const getTodayKey = () => new Date().toISOString().split('T')[0];
const getWeekNum = () => Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 604800000);

const playRestComplete = () => {
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 800; osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(); osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
};

const Icon = ({ name, size = 20 }) => {
  const icons = {
    dumbbell: <path d="M6.5 6.5L17.5 17.5M6 12L12 6M12 18L18 12M3 9L9 3M15 21L21 15" strokeWidth="2" stroke="currentColor" fill="none"/>,
    check: <polyline points="20 6 9 17 4 12" strokeWidth="3" stroke="currentColor" fill="none"/>,
    play: <path d="M8 5v14l11-7z" fill="currentColor"/>,
    close: <><line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" stroke="currentColor"/><line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" stroke="currentColor"/></>,
    swap: <><polyline points="17 1 21 5 17 9" strokeWidth="2" stroke="currentColor" fill="none"/><path d="M3 11V9a4 4 0 0 1 4-4h14" strokeWidth="2" stroke="currentColor" fill="none"/><polyline points="7 23 3 19 7 15" strokeWidth="2" stroke="currentColor" fill="none"/><path d="M21 13v2a4 4 0 0 1-4 4H3" strokeWidth="2" stroke="currentColor" fill="none"/></>,
    chart: <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeWidth="2" stroke="currentColor" fill="none"/>,
    lightning: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/>,
    flame: <path d="M12 23c-3.65 0-7-2.76-7-7.5 0-3.75 2.94-7.57 5.25-10.06C5.86 4.76 12 2 12 2s6.14 2.76 6.75 3.44C21.06 7.93 19 11.25 19 15.5c0 4.74-3.35 7.5-7 7.5z" fill="currentColor"/>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" stroke="currentColor" fill="none"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" stroke="currentColor" fill="none"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" stroke="currentColor"/><line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" stroke="currentColor"/></>,
    minus: <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" stroke="currentColor"/>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" stroke="currentColor"/><polyline points="12 5 19 12 12 19" strokeWidth="2" stroke="currentColor" fill="none"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2" stroke="currentColor" fill="none"/><line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" stroke="currentColor"/></>,
    fire: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.3.3.5.6.7.9z" strokeWidth="2" stroke="currentColor" fill="none"/>,
    history: <><circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none"/><polyline points="12 6 12 12 16 14" strokeWidth="2" stroke="currentColor" fill="none"/></>,
    ruler: <><path d="M21 3H3v18h18V3z" strokeWidth="2" stroke="currentColor" fill="none"/><path d="M21 9H15M21 15H15M9 21V15M15 21V15" strokeWidth="2" stroke="currentColor"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{icons[name]}</svg>;
};

const MiniChart = ({ data, color = '#FF3B30', type = 'line', height = 50 }) => {
  if (!data?.length) return null;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  if (type === 'bar') return (
    <svg width="100%" height={height} viewBox="0 0 100 50" preserveAspectRatio="none">
      {data.map((v, i) => <rect key={i} x={i*(100/data.length)+1} y={50-(v/max)*45} width={100/data.length-2} height={(v/max)*45} fill={color} opacity={0.5+i*0.05} rx="2"/>)}
    </svg>
  );
  const pts = data.map((v,i) => `${(i/(data.length-1))*100},${50-((v-min)/range)*40-5}`).join(' ');
  return (
    <svg width="100%" height={height} viewBox="0 0 100 50" preserveAspectRatio="none">
      <defs><linearGradient id="cg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={`0,50 ${pts} 100,50`} fill="url(#cg)"/><polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default function IronProtocol() {
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('workout');
  const [dayIdx, setDayIdx] = useState(0);
  const [completed, setCompleted] = useState({});
  const [restTime, setRestTime] = useState(0);
  const [restFor, setRestFor] = useState(null);
  const restTimerRef = useRef(null);
  
  const [showWarmup, setShowWarmup] = useState(null);
  const [personalRecords, setPersonalRecords] = useState({});
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [exerciseHistory, setExerciseHistory] = useState({});
  const [weekCount, setWeekCount] = useState(0);
  const [lastWorkoutWeek, setLastWorkoutWeek] = useState(null);
  const [showDeloadAlert, setShowDeloadAlert] = useState(false);
  const [bodyMeasurements, setBodyMeasurements] = useState([]);
  const [showMeasurements, setShowMeasurements] = useState(false);
  
  const [showQuick, setShowQuick] = useState(false);
  const [quickReady, setQuickReady] = useState(null);
  const [readyCountdown, setReadyCountdown] = useState(0);
  const [quickActive, setQuickActive] = useState(null);
  const [quickIdx, setQuickIdx] = useState(0);
  const [quickTimer, setQuickTimer] = useState(0);
  const [quickRest, setQuickRest] = useState(false);
  
  const [showVideo, setShowVideo] = useState(null);
  const [showSwap, setShowSwap] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showRPE, setShowRPE] = useState(null);
  const [newPR, setNewPR] = useState(null);
  const [showExerciseHistory, setShowExerciseHistory] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  
  const [planExercises, setPlanExercises] = useState([]);
  const [days, setDays] = useState([]);
  const [currentWorkoutLog, setCurrentWorkoutLog] = useState([]);
  
  const [todayWater, setTodayWater] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [proteinLog, setProteinLog] = useState([]);
  const [nutritionHistory, setNutritionHistory] = useState({});

  useEffect(() => {
    const p = localStorage.getItem('ironProfile');
    if (p) { const prof = JSON.parse(p); setProfile(prof); initializePlan(prof); }
    const pr = localStorage.getItem('ironPRs'); if (pr) setPersonalRecords(JSON.parse(pr));
    const wh = localStorage.getItem('ironWorkoutHistory'); if (wh) setWorkoutHistory(JSON.parse(wh));
    const eh = localStorage.getItem('ironExerciseHistory'); if (eh) setExerciseHistory(JSON.parse(eh));
    const wc = localStorage.getItem('ironWeekCount'); if (wc) setWeekCount(parseInt(wc));
    const lw = localStorage.getItem('ironLastWorkoutWeek'); if (lw) setLastWorkoutWeek(parseInt(lw));
    const bm = localStorage.getItem('ironBodyMeasurements'); if (bm) setBodyMeasurements(JSON.parse(bm));
    const nh = localStorage.getItem('ironNutrition');
    if (nh) {
      const data = JSON.parse(nh);
      setNutritionHistory(data);
      const today = getTodayKey();
      if (data[today]) { setTodayWater(data[today].water||0); setTodayProtein(data[today].protein||0); setProteinLog(data[today].proteinLog||[]); }
    }
  }, []);

  useEffect(() => { 
    if (profile && (todayWater > 0 || todayProtein > 0 || proteinLog.length > 0)) { 
      const t = getTodayKey(); 
      setNutritionHistory(prev => {
        const u = {...prev, [t]: {water: todayWater, protein: todayProtein, proteinLog}}; 
        localStorage.setItem('ironNutrition', JSON.stringify(u));
        return u;
      });
    }
  }, [todayWater, todayProtein, proteinLog, profile]);
  useEffect(() => { if (Object.keys(personalRecords).length) localStorage.setItem('ironPRs', JSON.stringify(personalRecords)); }, [personalRecords]);
  useEffect(() => { if (workoutHistory.length) localStorage.setItem('ironWorkoutHistory', JSON.stringify(workoutHistory)); }, [workoutHistory]);
  useEffect(() => { if (Object.keys(exerciseHistory).length) localStorage.setItem('ironExerciseHistory', JSON.stringify(exerciseHistory)); }, [exerciseHistory]);
  useEffect(() => { if (bodyMeasurements.length) localStorage.setItem('ironBodyMeasurements', JSON.stringify(bodyMeasurements)); }, [bodyMeasurements]);

  useEffect(() => {
    if (restTime <= 0) { if (restTimerRef.current) { playRestComplete(); restTimerRef.current = null; } return; }
    restTimerRef.current = true;
    const t = setTimeout(() => setRestTime(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [restTime]);

  useEffect(() => {
    if (readyCountdown <= 0) return;
    const t = setTimeout(() => {
      setReadyCountdown(prev => {
        if (prev <= 1) {
          const exs = quickReady.exercises.map(n => exercises.find(e => e.name === n)).filter(Boolean);
          setQuickActive({ ...quickReady, exercises: exs }); setQuickIdx(0); setQuickTimer(40); setQuickRest(false); setQuickReady(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [readyCountdown, quickReady]);

  useEffect(() => {
    if (!quickActive || quickTimer <= 0) return;
    const t = setTimeout(() => {
      setQuickTimer(prev => {
        if (prev <= 1) {
          if (quickRest) {
            if (quickIdx < quickActive.exercises.length - 1) { setQuickIdx(i => i + 1); setQuickRest(false); return 40; }
            setQuickActive(null); setCelebrate(true); setTimeout(() => setCelebrate(false), 2000); return 0;
          }
          setQuickRest(true); return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [quickActive, quickTimer, quickRest, quickIdx]);

  const initializePlan = (p, templateKey = null) => {
    const mult = p.level === 'beginner' ? 0.6 : p.level === 'intermediate' ? 0.8 : 1;
    let template = templateKey && workoutTemplates[templateKey] ? workoutTemplates[templateKey] : p.days === 4 ? workoutTemplates.upperLower : workoutTemplates.ppl;
    setDays(template.days.map((d, i) => ({ id: `d${i}`, name: d.name })));
    const pe = [];
    template.days.forEach((day, di) => {
      day.exercises.forEach((name, ei) => {
        const ex = exercises.find(e => e.name === name);
        if (ex) {
          const isLower = ['Quads','Hamstrings','Glutes','Calves'].includes(ex.muscle);
          pe.push({ id: `d${di}-${ei}`, dayId: `d${di}`, exercise: ex, sets: 4, repsMin: isLower ? 6 : 8, repsMax: isLower ? 10 : 12, reps: isLower ? 8 : 10, weight: Math.round((name.includes('Squat')||name.includes('Deadlift') ? 100 : 60) * mult), rest: 90, progression: 2.5 });
        }
      });
    });
    setPlanExercises(pe); setDayIdx(0); setCompleted({});
  };

  const applyTemplate = (k) => { if (profile) { initializePlan(profile, k); setShowTemplates(false); }};
  const currentDay = days[dayIdx];
  const dayExercises = planExercises.filter(p => p.dayId === currentDay?.id);
  const progress = () => { if (!dayExercises.length) return 0; let t=0,d=0; dayExercises.forEach(p => { t+=p.sets; d+=completed[p.id]||0; }); return Math.round((d/t)*100); };
  const completeSet = (pe) => { const c = completed[pe.id]||0; if (c < pe.sets) setShowRPE({ visId: pe.id, setNum: c+1, exercise: pe }); };

  const confirmRPE = (rpe) => {
    if (!showRPE) return;
    const { visId, setNum, exercise } = showRPE;
    setCurrentWorkoutLog(p => [...p, { exerciseName: exercise.exercise.name, weight: exercise.weight, reps: exercise.reps, setNum, rpe }]);
    if (!exercise.exercise.bodyweight) {
      const e1rm = calculate1RM(exercise.weight, exercise.reps);
      const name = exercise.exercise.name;
      if (e1rm > (personalRecords[name]||0)) { setPersonalRecords(p => ({...p, [name]: e1rm})); setNewPR({ name, weight: e1rm }); setTimeout(() => setNewPR(null), 3000); }
      setExerciseHistory(p => ({...p, [name]: [...(p[name]||[]), { date: getTodayKey(), weight: exercise.weight, reps: exercise.reps, e1rm }]}));
    }
    setCompleted(c => ({...c, [visId]: setNum})); setRestTime(exercise.rest); setRestFor(visId);
    if (setNum === exercise.sets) {
      setCelebrate(true); setTimeout(() => setCelebrate(false), 1500);
      if (!exercise.exercise.bodyweight) {
        const repsMin = exercise.repsMin ?? exercise.reps, repsMax = exercise.repsMax ?? exercise.reps;
        if (rpe <= 8) {
          if (exercise.reps < repsMax) updateExercise(visId, 'reps', exercise.reps + 1);
          else updateExercise(visId, { weight: exercise.weight + exercise.progression, reps: repsMin });
        } else if (rpe === 10) {
          updateExercise(visId, { weight: Math.max(0, exercise.weight - exercise.progression), reps: repsMin });
        }
      }
    }
    setShowRPE(null);
  };

  const endWorkout = (force = false) => {
    if (!force && progress() < 100) { setShowEndConfirm(true); return; }
    dayExercises.forEach(pe => {
      const done = completed[pe.id] || 0;
      if (!pe.exercise.bodyweight && done < pe.sets) {
        const repsMin = pe.repsMin ?? pe.reps;
        updateExercise(pe.id, { weight: Math.max(0, pe.weight - pe.progression), reps: repsMin });
      }
    });
    const vol = currentWorkoutLog.reduce((a, l) => a + l.weight * l.reps, 0);
    setWorkoutHistory(p => [...p, { date: getTodayKey(), dayName: currentDay?.name, exercises: currentWorkoutLog, volume: vol, completedPct: progress() }]);
    const cw = getWeekNum();
    if (cw !== lastWorkoutWeek) {
      const nw = weekCount + 1; setWeekCount(nw); setLastWorkoutWeek(cw);
      localStorage.setItem('ironWeekCount', nw.toString()); localStorage.setItem('ironLastWorkoutWeek', cw.toString());
      if (nw > 0 && nw % 4 === 0) setShowDeloadAlert(true);
    }
    setCompleted({}); setCurrentWorkoutLog([]); setShowEndConfirm(false); setCelebrate(true); setTimeout(() => setCelebrate(false), 2000);
  };

  const updateExercise = (id, fieldOrObj, value) => {
    const patch = (fieldOrObj && typeof fieldOrObj === 'object') ? fieldOrObj : { [fieldOrObj]: value };
    setPlanExercises(p => p.map(pe => pe.id === id ? { ...pe, ...patch } : pe));
    if (editingExercise?.id === id) setEditingExercise(p => ({ ...p, ...patch }));
  };
  
  const addExerciseToDay = (ex) => {
    if (!currentDay) return;
    const isLower = ['Quads','Hamstrings','Glutes','Calves'].includes(ex.muscle);
    setPlanExercises(p => [...p, { id: `${currentDay.id}-${Date.now()}`, dayId: currentDay.id, exercise: ex, sets: 3, repsMin: isLower ? 6 : 8, repsMax: isLower ? 10 : 12, reps: isLower ? 8 : 10, weight: 20, rest: 90, progression: 2.5 }]);
    setShowAddExercise(false);
  };
  
  const removeExercise = (id) => { setPlanExercises(p => p.filter(pe => pe.id !== id)); setCompleted(p => { const s={...p}; delete s[id]; return s; }); setEditingExercise(null); };
  const addWater = () => setTodayWater(w => w + 1);
  const addProtein = (src) => { setTodayProtein(p => p + src.protein); setProteinLog(l => [...l, {...src, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}]); };
  const saveMeasurement = (d) => { setBodyMeasurements(p => [...p, {...d, date: getTodayKey()}]); setShowMeasurements(false); };
  const saveProfile = (p) => { localStorage.setItem('ironProfile', JSON.stringify(p)); setProfile(p); initializePlan(p); };
  const resetDeload = () => { setWeekCount(0); localStorage.setItem('ironWeekCount', '0'); setShowDeloadAlert(false); };
  const timeStr = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; };
  const proteinGoal = profile ? Math.round(profile.weight * 1.8) : 150;
  const waterGoal = 8;
  
  const streak = useMemo(() => {
    if (!workoutHistory.length) return 0;
    const dates = [...new Set(workoutHistory.map(w => w.date))].sort().reverse();
    let c = 0;
    for (let i = 0; i < dates.length; i++) { const exp = new Date(); exp.setDate(exp.getDate() - i); if (dates[i] === exp.toISOString().split('T')[0]) c++; else break; }
    return c;
  }, [workoutHistory]);

  if (!profile) return <Onboarding onComplete={saveProfile} />;
  if (quickReady && readyCountdown > 0) return (<div style={S.container}><div style={S.readyScreen}><h2 style={S.readyTitle}>{quickReady.name}</h2><div style={S.readyCircle}><div style={S.readyCount}>{readyCountdown}</div></div><p style={S.readyText}>GET READY!</p><button onClick={() => { setQuickReady(null); setReadyCountdown(0); }} style={S.readyCancel}>CANCEL</button></div><style>{css}</style></div>);
  if (quickActive) { const ex = quickActive.exercises[quickIdx]; return (<div style={S.container}><div style={S.quickActive}><div style={S.qaHeader}><h2 style={S.qaTitle}>{quickActive.name}</h2><button onClick={() => setQuickActive(null)} style={S.iconBtn}><Icon name="close"/></button></div><div style={S.qaDots}>{quickActive.exercises.map((_, i) => <div key={i} style={{...S.qaDot, background: i < quickIdx ? '#34C759' : i === quickIdx ? '#FF3B30' : '#333'}}></div>)}</div><div style={S.qaMain}><div style={{...S.qaCircle, borderColor: quickRest ? '#34C759' : '#FF3B30'}}><div style={S.qaTime}>{quickTimer}</div><div style={S.qaLabel}>{quickRest ? 'REST' : 'WORK'}</div></div><h3 style={S.qaExName}>{quickRest ? 'Get Ready...' : ex?.name?.toUpperCase()}</h3></div></div><style>{css}</style></div>); }

  return (
    <div style={S.container}>
      {celebrate && <div style={S.celebrate}><div style={S.celebContent}><div style={{fontSize:48}}>🏆</div><div style={S.celebTitle}>GREAT WORK!</div></div></div>}
      {newPR && <div style={S.celebrate}><div style={S.celebContent}><div style={{fontSize:48}}>🔥</div><div style={S.celebTitle}>NEW PR!</div><div style={{color:'#888',marginTop:8,fontSize:'0.9rem'}}>{newPR.name}</div><div style={{color:'#FF3B30',fontSize:'1.75rem',fontWeight:800,marginTop:4}}>{newPR.weight}kg</div><div style={{color:'#555',fontSize:'0.75rem'}}>Estimated 1RM</div></div></div>}
      
      {showDeloadAlert && (<div style={S.overlay}><div style={S.deloadBox}><div style={{fontSize:48}}>😴</div><h3 style={S.deloadTitle}>Time for a Deload!</h3><p style={S.deloadText}>You've trained hard for {weekCount} weeks. Consider:</p><ul style={S.deloadList}><li>Reduce weight 40-50%</li><li>Keep sets/reps the same</li><li>Focus on form & recovery</li></ul><button onClick={resetDeload} style={S.deloadBtn}>GOT IT</button><button onClick={() => setShowDeloadAlert(false)} style={S.deloadSkip}>KEEP PUSHING</button></div></div>)}

      <header style={S.header}>
        <div style={S.headerLeft}><div style={S.logo}><Icon name="dumbbell" size={22}/></div><div><h1 style={S.title}>IRON PROTOCOL</h1><p style={S.welcome}>Good {greeting()}, {profile.name?.split(' ')[0]} 💪</p></div></div>
        <div style={S.streak}><Icon name="flame" size={16}/> {streak}</div>
      </header>

      {weekCount > 0 && <div style={S.weekBadge}>Week {weekCount} of training{weekCount >= 4 && <span style={{color:'#FF9500'}}> • Deload recommended</span>}</div>}

      <nav style={S.nav}>
        <button onClick={() => setView('workout')} style={{...S.navBtn, ...(view === 'workout' ? S.navActive : {})}}><Icon name="dumbbell" size={16}/> WORKOUT</button>
        <button onClick={() => setShowQuick(true)} style={S.navQuick}><Icon name="lightning" size={16}/> QUICK</button>
        <button onClick={() => setView('stats')} style={{...S.navBtn, ...(view === 'stats' ? S.navActive : {})}}><Icon name="chart" size={16}/> STATS</button>
      </nav>

      <main style={S.main}>
        {view === 'workout' ? (<>
          <div style={S.nutritionBar}>
            <div style={S.nutritionItem} onClick={() => setShowNutrition(true)}><span style={S.nutritionIcon}>💧</span><span style={S.nutritionValue}>{todayWater}/{waterGoal}</span><button onClick={e => { e.stopPropagation(); addWater(); }} style={S.addBtn}>+</button></div>
            <div style={S.nutritionItem} onClick={() => setShowNutrition(true)}><span style={S.nutritionIcon}>🥩</span><span style={S.nutritionValue}>{todayProtein}/{proteinGoal}g</span><button onClick={e => { e.stopPropagation(); setShowNutrition(true); }} style={S.addBtn}>+</button></div>
          </div>

          <div style={S.tabs}>
            {days.map((d, i) => <button key={d.id} onClick={() => { setDayIdx(i); setCompleted({}); setCurrentWorkoutLog([]); }} style={{...S.tab, ...(dayIdx === i ? S.tabActive : {})}}>{d.name.toUpperCase()}</button>)}
            <button onClick={() => setShowTemplates(true)} style={S.tabSettings}>⚙️</button>
          </div>

          <div style={S.progBar}><div style={S.progHeader}><span style={S.progLabel}>WORKOUT PROGRESS</span><span style={S.progPct}>{progress()}%</span></div><div style={S.progTrack}><div style={{...S.progFill, width: `${progress()}%`}}></div></div></div>

          {restTime > 0 && <div style={S.restBanner}><div><div style={S.restLabel}>REST TIME</div><div style={S.restTime}>{timeStr(restTime)}</div></div><button onClick={() => setRestTime(0)} style={S.skipBtn}>SKIP</button></div>}

          <div style={S.exList}>
            {dayExercises.map(pe => {
              const done = completed[pe.id] || 0, isDone = done >= pe.sets, isWarmupOpen = showWarmup === pe.id, warmups = getWarmupSets(pe.weight), hasHistory = exerciseHistory[pe.exercise.name]?.length > 0, hasRange = typeof pe.repsMin === 'number' && typeof pe.repsMax === 'number';
              return (
                <div key={pe.id} style={{...S.exCard, ...(isDone ? S.exDone : {})}}>
                  <div style={S.exHeader}>
                    <div><div style={S.exTags}><span style={S.muscleTag}>{pe.exercise.muscle}</span>{isDone && <span style={S.doneTag}><Icon name="check" size={12}/> Done</span>}</div><h3 style={{...S.exName, color: isDone ? '#34C759' : '#fff'}}>{pe.exercise.name}</h3></div>
                    <div style={S.exActions}>
                      {hasHistory && <button onClick={() => setShowExerciseHistory(pe.exercise.name)} style={S.historyBtn}><Icon name="history" size={16}/></button>}
                      {!pe.exercise.bodyweight && <button onClick={() => setShowWarmup(isWarmupOpen ? null : pe.id)} style={isWarmupOpen ? S.warmupBtnActive : S.warmupBtn}><Icon name="fire" size={16}/></button>}
                      <button onClick={() => setEditingExercise(pe)} style={S.editBtn}><Icon name="edit" size={16}/></button>
                      <button onClick={() => setShowSwap(pe)} style={S.swapBtn}><Icon name="swap" size={16}/></button>
                      <button onClick={() => setShowVideo(pe.exercise)} style={S.playBtn}><Icon name="play" size={16}/></button>
                    </div>
                  </div>
                  {isWarmupOpen && <div style={S.warmupBox}><div style={S.warmupTitle}>WARM-UP SETS</div><div style={S.warmupGrid}>{warmups.map((w, i) => <div key={i} style={S.warmupRow}><span style={S.warmupLabel}>{w.label}</span><span style={S.warmupVal}>{w.weight}kg × {w.reps}</span><input type="checkbox" style={{accentColor:'#FF9500',width:18,height:18}}/></div>)}</div></div>}
                  <div style={S.stats}>
                    <div style={S.stat}><div style={S.statLabel}>SETS</div><div style={S.statVal}>{done}/{pe.sets}</div></div>
                    <div style={S.stat}><div style={S.statLabel}>REPS</div><div style={S.statVal}>{pe.reps}{hasRange && <span style={{color:'#666',fontSize:'0.65rem'}}> ({pe.repsMin}-{pe.repsMax})</span>}</div></div>
                    <div style={S.stat}><div style={S.statLabel}>WEIGHT</div><div style={S.statValRed}>{pe.weight}kg</div></div>
                    <div style={S.stat}><div style={S.statLabel}>NEXT</div><div style={S.statValGreen}>+{pe.progression}</div></div>
                  </div>
                  {!isDone && <button onClick={() => completeSet(pe)} disabled={restTime > 0 && restFor === pe.id} style={{...S.completeBtn, ...(restTime > 0 && restFor === pe.id ? S.completeBtnOff : {})}}>{restTime > 0 && restFor === pe.id ? `RESTING... ${timeStr(restTime)}` : `COMPLETE SET ${done + 1}`}</button>}
                </div>
              );
            })}
            <button onClick={() => setShowAddExercise(true)} style={S.addExerciseBtn}><Icon name="plus" size={18}/> ADD EXERCISE</button>
          </div>
          {Object.keys(completed).length > 0 && <button onClick={() => endWorkout()} style={S.finishBtn}>{progress() >= 100 ? 'FINISH WORKOUT 🎉' : 'END WORKOUT EARLY'}</button>}
        </>) : (
          <Dashboard profile={profile} workoutHistory={workoutHistory} exerciseHistory={exerciseHistory} todayWater={todayWater} todayProtein={todayProtein} proteinGoal={proteinGoal} waterGoal={waterGoal} nutritionHistory={nutritionHistory} personalRecords={personalRecords} bodyMeasurements={bodyMeasurements} streak={streak} weekCount={weekCount} onAddWater={addWater} onOpenNutrition={() => setShowNutrition(true)} onOpenMeasurements={() => setShowMeasurements(true)} onShowExerciseHistory={setShowExerciseHistory} />
        )}
      </main>

      {showQuick && <div style={S.overlay} onClick={() => setShowQuick(false)}><div style={S.modal} onClick={e => e.stopPropagation()}><h2 style={S.modalTitle}>Quick Workouts</h2><p style={S.modalSub}>No equipment • 15-25 min</p><div style={S.quickList}>{quickTemplates.map(t => <button key={t.id} onClick={() => { setQuickReady(t); setReadyCountdown(3); setShowQuick(false); }} style={S.quickCard}><div><div style={S.quickName}>{t.name}</div><div style={S.quickMeta}>{t.duration} min • {t.exercises.length} exercises</div></div><Icon name="arrow"/></button>)}</div></div></div>}

      {editingExercise && <div style={S.overlay} onClick={() => setEditingExercise(null)}><div style={S.editModal} onClick={e => e.stopPropagation()}><h3 style={S.editTitle}>{editingExercise.exercise.name}</h3>{['sets','reps','weight','rest'].map(f => <div key={f} style={S.editField}><label style={S.editLabel}>{f==='sets'?'Sets':f==='reps'?'Reps':f==='weight'?'Weight (kg)':'Rest (sec)'}</label><div style={S.editControls}><button onClick={() => updateExercise(editingExercise.id, f, Math.max(f==='rest'?30:f==='weight'?0:(f==='reps'?(editingExercise.repsMin ?? 1):1), editingExercise[f]-(f==='weight'?2.5:f==='rest'?15:1)))} style={S.editBtn2}><Icon name="minus" size={16}/></button><span style={S.editValue}>{editingExercise[f]}{f==='rest'?'s':''}</span><button onClick={() => updateExercise(editingExercise.id, f, Math.min(f==='sets'?10:(f==='reps'?(editingExercise.repsMax ?? 30):f==='rest'?300:500), editingExercise[f]+(f==='weight'?2.5:f==='rest'?15:1)))} style={S.editBtn2}><Icon name="plus" size={16}/></button></div></div>)}<button onClick={() => setEditingExercise(null)} style={S.editDone}>DONE</button><button onClick={() => removeExercise(editingExercise.id)} style={S.editRemove}>REMOVE EXERCISE</button></div></div>}

      {showNutrition && <div style={S.overlay} onClick={() => setShowNutrition(false)}><div style={S.nutritionModal} onClick={e => e.stopPropagation()}><h3 style={S.nutritionTitle}>Today's Nutrition</h3><div style={S.nutritionSection}><div style={S.nutritionSectionHeader}><span>💧 Water</span><span style={S.nutritionProgress}>{todayWater}/{waterGoal}</span></div><div style={S.waterTrack}>{[...Array(waterGoal)].map((_, i) => <div key={i} style={{...S.waterGlass, background: i < todayWater ? '#3B82F6' : 'rgba(255,255,255,0.08)'}} onClick={() => setTodayWater(i+1)}></div>)}</div><button onClick={addWater} style={S.addWaterBtn}>+ ADD GLASS</button></div><div style={S.nutritionSection}><div style={S.nutritionSectionHeader}><span>🥩 Protein</span><span style={S.nutritionProgress}>{todayProtein}/{proteinGoal}g</span></div><div style={S.proteinBar}><div style={{...S.proteinFill, width: `${Math.min(100,(todayProtein/proteinGoal)*100)}%`}}></div></div><div style={S.proteinGrid}>{proteinSources.map(src => <button key={src.name} onClick={() => addProtein(src)} style={S.proteinBtn}><span style={S.proteinBtnIcon}>{src.icon}</span><span style={S.proteinBtnName}>{src.name}</span><span style={S.proteinBtnVal}>+{src.protein}g</span></button>)}</div></div><button onClick={() => setShowNutrition(false)} style={S.nutritionClose}>DONE</button></div></div>}

      {showMeasurements && <MeasurementsModal onSave={saveMeasurement} onClose={() => setShowMeasurements(false)} currentWeight={profile.weight}/>}

      {showExerciseHistory && <div style={S.overlay} onClick={() => setShowExerciseHistory(null)}><div style={S.historyModal} onClick={e => e.stopPropagation()}><h3 style={S.historyTitle}>{showExerciseHistory}</h3><p style={S.historySub}>Weight Progression</p>{exerciseHistory[showExerciseHistory]?.length > 0 ? <><MiniChart data={exerciseHistory[showExerciseHistory].slice(-10).map(h => h.weight)} color="#FF3B30" height={80}/><div style={S.historyList}>{exerciseHistory[showExerciseHistory].slice(-10).reverse().map((h, i) => <div key={i} style={S.historyItem}><span style={{color:'#888'}}>{h.date}</span><span style={S.historyWeight}>{h.weight}kg × {h.reps}</span><span style={S.historyE1rm}>~{h.e1rm}kg</span></div>)}</div></> : <p style={{color:'#666',textAlign:'center',padding:'2rem 0'}}>No history yet</p>}<button onClick={() => setShowExerciseHistory(null)} style={S.historyClose}>CLOSE</button></div></div>}

      {showEndConfirm && <div style={S.overlay}><div style={S.confirmBox}><Icon name="alert" size={32}/><h3 style={S.confirmTitle}>End Workout Early?</h3><p style={S.confirmText}>You've done {progress()}% - incomplete exercises will have weight reduced next time.</p><div style={S.confirmBtns}><button onClick={() => setShowEndConfirm(false)} style={S.keepBtn}>KEEP GOING</button><button onClick={() => endWorkout(true)} style={S.endBtn}>END IT</button></div></div></div>}

      {showVideo && <div style={S.overlay} onClick={() => setShowVideo(null)}><div style={S.videoBox} onClick={e => e.stopPropagation()}><img src={`https://img.youtube.com/vi/${showVideo.youtube}/mqdefault.jpg`} alt="" style={S.thumb}/><h3 style={S.videoTitle}>{showVideo.name}</h3><a href={`https://youtube.com/watch?v=${showVideo.youtube}`} target="_blank" rel="noreferrer" style={S.ytBtn}>WATCH ON YOUTUBE</a></div></div>}

      {showSwap && <div style={S.overlay} onClick={() => setShowSwap(null)}><div style={S.swapBox} onClick={e => e.stopPropagation()}><h3 style={S.swapTitle}>Swap Exercise</h3><p style={S.swapSub}>Replacing: {showSwap.exercise.name}</p><div style={S.swapList}>{exercises.filter(e => e.muscle === showSwap.exercise.muscle && e.id !== showSwap.exercise.id).map(ex => <button key={ex.id} onClick={() => { setPlanExercises(p => p.map(pe => pe.id === showSwap.id ? {...pe, exercise: ex} : pe)); setShowSwap(null); }} style={S.swapItem}><div><div style={S.swapItemName}>{ex.name}</div><div style={S.swapItemMeta}>{ex.equipment}</div></div></button>)}</div></div></div>}

      {showRPE && <div style={S.overlay}><div style={S.rpeModal}><div style={{fontSize:48,marginBottom:8}}>💪</div><h3 style={S.rpeTitle}>Set {showRPE.setNum} Complete!</h3><p style={S.rpeSubtitle}>{showRPE.exercise.exercise.name}</p><p style={S.rpeQuestion}>How hard was that?</p><div style={S.rpeGrid}>{[6,7,8,9,10].map(rpe => <button key={rpe} onClick={() => confirmRPE(rpe)} style={{...S.rpeBtn, background: rpe <= 7 ? '#34C759' : rpe === 8 ? '#FF9500' : '#FF3B30'}}><div style={S.rpeNum}>{rpe}</div><div style={S.rpeLabel}>{rpe===6?'Easy':rpe===7?'Moderate':rpe===8?'Hard':rpe===9?'Very Hard':'Failed'}</div></button>)}</div><p style={S.rpeHint}>RPE 6-8 = progression • RPE 10 = reduce weight</p><button onClick={() => setShowRPE(null)} style={S.rpeCancel}>CANCEL</button></div></div>}

      {showAddExercise && <div style={S.overlay} onClick={() => setShowAddExercise(false)}><div style={S.addExModal} onClick={e => e.stopPropagation()}><h3 style={S.addExTitle}>Add Exercise</h3><p style={S.addExSub}>Add to {currentDay?.name}</p><div style={S.addExList}>{exercises.filter(e => !e.bodyweight).map(ex => <button key={ex.id} onClick={() => addExerciseToDay(ex)} style={S.addExItem}><div><div style={S.addExName}>{ex.name}</div><div style={S.addExMeta}>{ex.muscle} • {ex.equipment}</div></div><div style={S.addExArrow}>+</div></button>)}</div><button onClick={() => setShowAddExercise(false)} style={S.addExCancel}>CANCEL</button></div></div>}

      {showTemplates && <div style={S.overlay} onClick={() => setShowTemplates(false)}><div style={S.templatesModal} onClick={e => e.stopPropagation()}><h2 style={S.templatesTitle}>Choose Template</h2><p style={S.templatesSub}>This will reset your workout plan</p><div style={S.templatesList}>{Object.values(workoutTemplates).map(t => <button key={t.id} onClick={() => applyTemplate(t.id)} style={S.templateCard}><div style={S.templateInfo}><div style={S.templateName}>{t.name}</div><div style={S.templateDesc}>{t.description}</div><div style={S.templateDays}>{t.days.length} days/week</div></div><div style={S.templateArrow}>→</div></button>)}</div><button onClick={() => setShowTemplates(false)} style={S.templatesCancel}>CANCEL</button></div></div>}

      <style>{css}</style>
    </div>
  );
}

function MeasurementsModal({ onSave, onClose, currentWeight }) {
  const [data, setData] = useState({ weight: currentWeight||80, bodyFat: '', chest: '', waist: '', arms: '', thighs: '' });
  const upd = (k, v) => setData(d => ({...d, [k]: v}));
  return (
    <div style={S.overlay} onClick={onClose}><div style={S.measureModal} onClick={e => e.stopPropagation()}>
      <h3 style={S.measureTitle}>Log Measurements</h3><p style={S.measureSub}>Track your body composition</p>
      <div style={S.measureGrid}>
        {[['weight','Weight (kg)'],['bodyFat','Body Fat %'],['chest','Chest (cm)'],['waist','Waist (cm)'],['arms','Arms (cm)'],['thighs','Thighs (cm)']].map(([k,l]) => (
          <div key={k} style={S.measureField}><label style={S.measureLabel}>{l}</label><input type="number" value={data[k]} onChange={e => upd(k, e.target.value)} style={S.measureInput} placeholder={k==='weight'?'':'Optional'}/></div>
        ))}
      </div>
      <button onClick={() => onSave(data)} style={S.measureSave}>SAVE MEASUREMENTS</button>
      <button onClick={onClose} style={S.measureCancel}>CANCEL</button>
    </div></div>
  );
}

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: '', height: 180, weight: 80, age: 30, level: 'intermediate', days: 3, health: false });
  const upd = (k, v) => setData(d => ({...d, [k]: v}));
  const steps = [
    <div key="0" style={S.obStep}><div style={S.obIcon}><Icon name="dumbbell" size={32}/></div><h1 style={S.obTitle}>IRON PROTOCOL</h1><p style={S.obText}>Progressive overload with smart auto-regulation. Let's build your program.</p><button onClick={() => setStep(1)} style={S.obBtn}>GET STARTED</button></div>,
    <div key="1" style={S.obStep}><h2 style={S.obStepTitle}>What's your name?</h2><input value={data.name} onChange={e => upd('name', e.target.value)} placeholder="Enter your name" style={S.obInput} autoFocus/><button onClick={() => setStep(2)} disabled={!data.name} style={S.obBtn}>CONTINUE</button></div>,
    <div key="2" style={S.obStep}><h2 style={S.obStepTitle}>Your Stats</h2><div style={S.obStats}><div><label style={S.obLabel}>HEIGHT (cm)</label><input type="number" value={data.height} onChange={e => upd('height', +e.target.value)} style={S.obInputSm}/></div><div><label style={S.obLabel}>WEIGHT (kg)</label><input type="number" value={data.weight} onChange={e => upd('weight', +e.target.value)} style={S.obInputSm}/></div><div><label style={S.obLabel}>AGE</label><input type="number" value={data.age} onChange={e => upd('age', +e.target.value)} style={S.obInputSm}/></div></div><button onClick={() => setStep(3)} style={S.obBtn}>CONTINUE</button></div>,
    <div key="3" style={S.obStep}><h2 style={S.obStepTitle}>Experience Level</h2><div style={S.obOpts}>{['beginner','intermediate','advanced'].map(l => <button key={l} onClick={() => upd('level', l)} style={{...S.obOpt, ...(data.level === l ? S.obOptActive : {})}}><span style={S.obOptText}>{l.toUpperCase()}</span><span style={S.obOptSub}>{l === 'beginner' ? '< 1 year' : l === 'intermediate' ? '1-3 years' : '3+ years'}</span></button>)}</div><button onClick={() => setStep(4)} style={S.obBtn}>CONTINUE</button></div>,
    <div key="4" style={S.obStep}><h2 style={S.obStepTitle}>Training Days</h2><p style={S.obSubtext}>How many days per week?</p><div style={S.dayPicker}>{[3,4].map(d => <button key={d} onClick={() => upd('days', d)} style={{...S.dayBtn, ...(data.days === d ? S.dayBtnActive : {})}}>{d}</button>)}</div><button onClick={() => setStep(5)} style={S.obBtn}>CONTINUE</button></div>,
    <div key="5" style={S.obStep}><h2 style={S.obStepTitle}>Health Check</h2><p style={S.obSubtext}>Any conditions affecting hydration? (kidney, diabetes)</p><div style={S.obOptRow}><button onClick={() => { upd('health', true); setStep(6); }} style={S.obOptSmall}>YES</button><button onClick={() => { upd('health', false); setStep(6); }} style={S.obOptSmall}>NO</button></div></div>,
    <div key="6" style={S.obStep}><div style={{...S.obIcon, background: '#34C759'}}><Icon name="check" size={32}/></div><h2 style={S.obStepTitle}>You're All Set!</h2><p style={S.obText}>Your program is ready. Let's get strong! 💪</p><button onClick={() => onComplete(data)} style={{...S.obBtn, background: '#34C759'}}>START TRAINING</button></div>
  ];
  return <div style={S.obContainer}><div style={S.obDots}>{[0,1,2,3,4,5,6].map(i => <div key={i} style={{...S.obDot, background: i <= step ? '#FF3B30' : '#333'}}></div>)}</div>{steps[step]}<style>{css}</style></div>;
}

function Dashboard({ profile, workoutHistory, exerciseHistory, todayWater, todayProtein, proteinGoal, waterGoal, nutritionHistory, personalRecords, bodyMeasurements, streak, weekCount, onAddWater, onOpenNutrition, onOpenMeasurements, onShowExerciseHistory }) {
  const totalVol = workoutHistory.reduce((a, w) => a + (w.volume||0), 0);
  const volData = workoutHistory.slice(-7).map(w => w.volume||0);
  const last7 = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate()-(6-i)); return d.toISOString().split('T')[0]; });
  const proteinData = last7.map(d => nutritionHistory[d]?.protein||0);
  const weightData = bodyMeasurements.slice(-10).map(m => parseFloat(m.weight)||0);

  return (
    <div>
      <div style={S.sumGrid}>
        <div style={S.sumCard}><div style={S.sumLabel}>WORKOUTS</div><div style={S.sumVal}>{workoutHistory.length}</div>{volData.length > 1 && <MiniChart data={volData} type="bar" height={35}/>}</div>
        <div style={S.sumCard}><div style={S.sumLabel}>VOLUME</div><div style={S.sumVal}>{(totalVol/1000).toFixed(0)}t</div></div>
        <div style={S.sumCard}><div style={S.sumLabel}>STREAK</div><div style={S.sumVal}>{streak} 🔥</div></div>
      </div>

      {weekCount > 0 && <div style={S.weekCard}>📅 Training Week {weekCount}{weekCount >= 4 && <span style={S.weekWarning}> • Deload recommended</span>}</div>}

      {Object.keys(personalRecords).length > 0 && <div style={S.chartBox}><h3 style={S.chartTitle}>🏆 Personal Records</h3><div style={S.prGrid}>{Object.entries(personalRecords).map(([name, weight]) => <div key={name} style={S.prItem} onClick={() => onShowExerciseHistory(name)}><div style={S.prName}>{name}</div><div style={S.prWeight}>{weight}kg</div></div>)}</div></div>}

      <div style={S.chartBox}><div style={S.chartHeader}><h3 style={S.chartTitle}>📏 Body Measurements</h3><button onClick={onOpenMeasurements} style={S.addMeasureBtn}>+ LOG</button></div>{weightData.length > 1 ? <><MiniChart data={weightData} color="#3B82F6" height={60}/><div style={S.measureSummary}><span>Current: {bodyMeasurements[bodyMeasurements.length-1]?.weight}kg</span><span>Start: {bodyMeasurements[0]?.weight}kg</span></div></> : <p style={S.emptyText}>Log measurements to track progress</p>}</div>

      <div style={S.chartBox}><h3 style={S.chartTitle}>🍽️ Today's Nutrition</h3><div style={S.nutritionCards}><div style={S.nutritionCard} onClick={onOpenNutrition}><div style={S.nutritionCardHeader}><span style={{fontSize:'1.25rem'}}>💧</span><span style={S.nutritionCardTitle}>Water</span></div><div style={S.nutritionCardValue}>{todayWater}<span style={S.nutritionCardUnit}>/{waterGoal}</span></div><div style={S.miniProgress}><div style={{...S.miniProgressFill, width: `${(todayWater/waterGoal)*100}%`, background: '#3B82F6'}}></div></div><button onClick={e => { e.stopPropagation(); onAddWater(); }} style={S.nutritionCardBtn}>+ ADD</button></div><div style={S.nutritionCard} onClick={onOpenNutrition}><div style={S.nutritionCardHeader}><span style={{fontSize:'1.25rem'}}>🥩</span><span style={S.nutritionCardTitle}>Protein</span></div><div style={S.nutritionCardValue}>{todayProtein}<span style={S.nutritionCardUnit}>g</span></div><div style={S.miniProgress}><div style={{...S.miniProgressFill, width: `${Math.min(100,(todayProtein/proteinGoal)*100)}%`, background: '#34C759'}}></div></div><button onClick={e => { e.stopPropagation(); onOpenNutrition(); }} style={S.nutritionCardBtn}>+ LOG</button></div></div></div>

      <div style={S.chartBox}><h3 style={S.chartTitle}>📊 Protein (7 Days)</h3><MiniChart data={proteinData.length ? proteinData : [0]} color="#34C759" height={60}/><div style={S.chartLabels}><span>7 days ago</span><span>Today</span></div></div>

      {workoutHistory.length > 0 && <div style={S.chartBox}><h3 style={S.chartTitle}>📋 Recent Workouts</h3><div style={S.recentList}>{workoutHistory.slice(-5).reverse().map((w, i) => <div key={i} style={S.recentItem}><div><div style={S.recentDay}>{w.dayName}</div><div style={S.recentDate}>{w.date}</div></div><div style={S.recentStats}><span style={S.recentPct}>{w.completedPct}%</span><span style={S.recentVol}>{(w.volume/1000).toFixed(1)}t</span></div></div>)}</div></div>}

      <div style={S.profileBox}><h3 style={S.chartTitle}>👤 Profile</h3><div style={S.profileGrid}><div style={S.profileItem}><span style={S.profileLabel}>Height</span><span>{profile.height}cm</span></div><div style={S.profileItem}><span style={S.profileLabel}>Weight</span><span>{profile.weight}kg</span></div><div style={S.profileItem}><span style={S.profileLabel}>Level</span><span style={{textTransform:'capitalize'}}>{profile.level}</span></div><div style={S.profileItem}><span style={S.profileLabel}>Schedule</span><span>{profile.days}x/week</span></div></div></div>
    </div>
  );
}

const S = {
  container: { minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '0 16px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 },
  celebrate: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  celebContent: { textAlign: 'center' },
  celebTitle: { fontSize: '1.5rem', fontWeight: 800, color: '#FF3B30', marginTop: 8 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  logo: { width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, rgba(255,59,48,0.2) 0%, rgba(255,59,48,0.05) 100%)', border: '1px solid rgba(255,59,48,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF3B30' },
  title: { fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.05em', margin: 0 },
  welcome: { fontSize: '0.8rem', color: '#888', margin: '2px 0 0' },
  streak: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, background: 'rgba(255,149,0,0.15)', border: '1px solid rgba(255,149,0,0.3)', fontSize: '0.85rem', fontWeight: 700, color: '#FF9500' },
  weekBadge: { margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#999', fontSize: '0.8rem', textAlign: 'center' },
  nav: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, marginBottom: 16 },
  navBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#888', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', transition: 'all 0.2s' },
  navActive: { background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', color: '#fff' },
  navQuick: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B47 100%)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem', boxShadow: '0 4px 15px rgba(255,59,48,0.3)' },
  main: { paddingBottom: 32 },
  nutritionBar: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 },
  nutritionItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' },
  nutritionIcon: { fontSize: '1.2rem' },
  nutritionValue: { flex: 1, fontWeight: 800, fontSize: '0.95rem' },
  addBtn: { width: 30, height: 30, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem' },
  tabs: { display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 },
  tab: { padding: '10px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#888', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', color: '#fff' },
  tabSettings: { width: 40, height: 40, borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#888', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 },
  progBar: { marginBottom: 16, padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' },
  progHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progLabel: { fontSize: '0.7rem', color: '#666', fontWeight: 800, letterSpacing: '0.05em' },
  progPct: { fontSize: '0.9rem', fontWeight: 800, color: '#fff' },
  progTrack: { height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' },
  progFill: { height: '100%', background: 'linear-gradient(90deg, #FF3B30 0%, #FF6B47 100%)', borderRadius: 4, transition: 'width 0.3s ease' },
  restBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, background: 'rgba(255,149,0,0.1)', border: '1px solid rgba(255,149,0,0.3)', marginBottom: 16 },
  restLabel: { fontSize: '0.7rem', color: '#FF9500', fontWeight: 800, letterSpacing: '0.05em' },
  restTime: { fontSize: '1.5rem', fontWeight: 800, color: '#fff' },
  skipBtn: { padding: '10px 16px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' },
  exList: { display: 'flex', flexDirection: 'column', gap: 12 },
  exCard: { padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s' },
  exDone: { background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.25)' },
  exHeader: { display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  exTags: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' },
  muscleTag: { fontSize: '0.6rem', fontWeight: 800, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: '#888', letterSpacing: '0.03em' },
  doneTag: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6rem', fontWeight: 800, padding: '4px 10px', borderRadius: 6, background: 'rgba(52,199,89,0.15)', color: '#34C759' },
  exName: { fontSize: '0.95rem', fontWeight: 700, margin: 0 },
  exActions: { display: 'flex', gap: 6 },
  historyBtn: { padding: 8, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#888', cursor: 'pointer' },
  warmupBtn: { padding: 8, borderRadius: 10, border: '1px solid rgba(255,149,0,0.25)', background: 'rgba(255,149,0,0.08)', color: '#FF9500', cursor: 'pointer' },
  warmupBtnActive: { padding: 8, borderRadius: 10, border: '1px solid rgba(255,149,0,0.4)', background: 'rgba(255,149,0,0.15)', color: '#FF9500', cursor: 'pointer' },
  editBtn: { padding: 8, borderRadius: 10, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.08)', color: '#3B82F6', cursor: 'pointer' },
  swapBtn: { padding: 8, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#888', cursor: 'pointer' },
  playBtn: { padding: 8, borderRadius: 10, border: '1px solid rgba(255,59,48,0.25)', background: 'rgba(255,59,48,0.08)', color: '#FF3B30', cursor: 'pointer' },
  warmupBox: { marginTop: 12, padding: 14, borderRadius: 12, background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)' },
  warmupTitle: { fontSize: '0.65rem', fontWeight: 800, color: '#FF9500', marginBottom: 10, letterSpacing: '0.05em' },
  warmupGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  warmupRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#ddd' },
  warmupLabel: { color: '#FF9500', fontWeight: 700 },
  warmupVal: { fontWeight: 700 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 12, marginBottom: 14 },
  stat: { padding: '10px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' },
  statLabel: { fontSize: '0.55rem', color: '#666', fontWeight: 800, marginBottom: 4, letterSpacing: '0.03em' },
  statVal: { fontSize: '0.9rem', fontWeight: 800, color: '#fff' },
  statValRed: { fontSize: '0.9rem', fontWeight: 800, color: '#FF3B30' },
  statValGreen: { fontSize: '0.9rem', fontWeight: 800, color: '#34C759' },
  completeBtn: { width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B47 100%)', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', boxShadow: '0 4px 15px rgba(255,59,48,0.3)' },
  completeBtnOff: { background: 'rgba(255,255,255,0.05)', color: '#666', cursor: 'not-allowed', boxShadow: 'none' },
  addExerciseBtn: { width: '100%', padding: '14px', borderRadius: 14, border: '1px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)', color: '#888', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.85rem' },
  finishBtn: { width: '100%', padding: '16px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', marginTop: 16, boxShadow: '0 4px 15px rgba(52,199,89,0.3)' },
  modal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: 20, width: '100%', maxWidth: 420, padding: 20, border: '1px solid rgba(255,255,255,0.08)' },
  modalTitle: { fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', textAlign: 'center' },
  modalSub: { fontSize: '0.8rem', color: '#888', margin: '0 0 16px', textAlign: 'center' },
  quickList: { display: 'flex', flexDirection: 'column', gap: 10 },
  quickCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, cursor: 'pointer', color: '#fff', textAlign: 'left' },
  quickName: { fontSize: '0.9rem', fontWeight: 700 },
  quickMeta: { fontSize: '0.75rem', color: '#888', marginTop: 2 },
  deloadBox: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: 20, padding: 24, textAlign: 'center', maxWidth: 340, border: '1px solid rgba(255,255,255,0.08)' },
  deloadTitle: { fontSize: '1.1rem', fontWeight: 800, margin: '12px 0 8px' },
  deloadText: { fontSize: '0.85rem', color: '#888', marginBottom: 12 },
  deloadList: { textAlign: 'left', color: '#aaa', fontSize: '0.8rem', margin: '0 0 16px 16px', lineHeight: 1.6 },
  deloadBtn: { width: '100%', padding: 14, background: 'linear-gradient(135deg, #FF9500 0%, #FFAA33 100%)', border: 'none', borderRadius: 12, color: '#000', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', marginBottom: 8 },
  deloadSkip: { width: '100%', padding: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#888', fontSize: '0.8rem', cursor: 'pointer' },
  editModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: 20, width: '100%', maxWidth: 340, padding: 20, border: '1px solid rgba(255,255,255,0.08)' },
  editTitle: { fontSize: '1rem', fontWeight: 700, margin: '0 0 16px', textAlign: 'center' },
  editField: { marginBottom: 16 },
  editLabel: { fontSize: '0.75rem', color: '#888', marginBottom: 8, display: 'block' },
  editControls: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 },
  editBtn2: { width: 44, height: 44, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  editValue: { fontSize: '1.5rem', fontWeight: 800, minWidth: 60, textAlign: 'center' },
  editDone: { width: '100%', padding: 14, background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B47 100%)', border: 'none', borderRadius: 12, color: '#fff', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', marginTop: 8 },
  editRemove: { width: '100%', padding: 12, background: 'transparent', border: '1px solid rgba(255,59,48,0.4)', borderRadius: 12, color: '#FF3B30', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginTop: 10 },
  
  nutritionModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: 20, width: '100%', maxWidth: 400, padding: 20, maxHeight: '85vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)' },
  nutritionTitle: { fontSize: '1rem', fontWeight: 800, margin: '0 0 16px', textAlign: 'center' },
  nutritionSection: { marginBottom: 20 },
  nutritionSectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: '0.9rem', fontWeight: 700 },
  nutritionProgress: { fontSize: '0.8rem', color: '#888' },
  waterTrack: { display: 'flex', gap: 6, marginBottom: 12 },
  waterGlass: { flex: 1, height: 36, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' },
  addWaterBtn: { width: '100%', padding: 12, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, color: '#3B82F6', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' },
  proteinBar: { height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 5, marginBottom: 16, overflow: 'hidden' },
  proteinFill: { height: '100%', background: 'linear-gradient(90deg, #34C759 0%, #30D158 100%)', borderRadius: 5, transition: 'width 0.3s' },
  proteinGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 },
  proteinBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, cursor: 'pointer', color: '#fff' },
  proteinBtnIcon: { fontSize: '1.5rem', marginBottom: 4 },
  proteinBtnName: { fontSize: '0.7rem', color: '#888' },
  proteinBtnVal: { fontSize: '0.85rem', fontWeight: 800, color: '#34C759', marginTop: 4 },
  nutritionClose: { width: '100%', padding: 14, background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B47 100%)', border: 'none', borderRadius: 12, color: '#fff', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', marginTop: 8 },
  
  historyModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: 20, width: '100%', maxWidth: 400, padding: 20, border: '1px solid rgba(255,255,255,0.08)' },
  historyTitle: { fontSize: '1rem', fontWeight: 800, margin: '0 0 4px', textAlign: 'center' },
  historySub: { fontSize: '0.8rem', color: '#888', margin: '0 0 16px', textAlign: 'center' },
  historyList: { marginTop: 16 },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' },
  historyWeight: { fontWeight: 800, color: '#FF3B30' },
  historyE1rm: { color: '#666', fontSize: '0.75rem' },
  historyClose: { width: '100%', padding: 14, background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B47 100%)', border: 'none', borderRadius: 12, color: '#fff', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', marginTop: 16 },
  
  measureModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: 20, width: '100%', maxWidth: 400, padding: 20, border: '1px solid rgba(255,255,255,0.08)' },
  measureTitle: { fontSize: '1rem', fontWeight: 800, margin: '0 0 4px', textAlign: 'center' },
  measureSub: { fontSize: '0.8rem', color: '#888', margin: '0 0 16px', textAlign: 'center' },
  measureGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 },
  measureField: { display: 'flex', flexDirection: 'column', gap: 6 },
  measureLabel: { fontSize: '0.75rem', color: '#888' },
  measureInput: { padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: '0.9rem' },
  measureSave: { width: '100%', padding: 14, background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)', border: 'none', borderRadius: 12, color: '#fff', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', marginBottom: 8 },
  measureCancel: { width: '100%', padding: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#888', fontSize: '0.8rem', cursor: 'pointer' },
  measureSummary: { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888', marginTop: 8 },
  
  confirmBox: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: 20, padding: 24, textAlign: 'center', maxWidth: 320, border: '1px solid rgba(255,255,255,0.08)' },
  confirmTitle: { fontSize: '1.1rem', fontWeight: 800, margin: '12px 0 8px' },
  confirmText: { fontSize: '0.85rem', color: '#888', marginBottom: 20, lineHeight: 1.5 },
  confirmBtns: { display: 'flex', gap: 10 },
  keepBtn: { flex: 1, padding: 14, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer' },
  endBtn: { flex: 1, padding: 14, background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B47 100%)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer' },
  
  videoBox: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: 20, padding: 20, textAlign: 'center', maxWidth: 360, border: '1px solid rgba(255,255,255,0.08)' },
  thumb: { width: '100%', borderRadius: 12, marginBottom: 16 },
  videoTitle: { fontSize: '1rem', fontWeight: 700, margin: '0 0 16px' },
  ytBtn: { display: 'inline-block', padding: '14px 24px', background: '#FF0000', borderRadius: 12, color: '#fff', textDecoration: 'none', fontWeight: 700 },
  
  swapBox: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: 20, padding: 20, width: '100%', maxWidth: 400, maxHeight: '70vh', overflow: 'auto', border: '1px solid rgba(255,255,255,0.08)' },
  swapTitle: { fontSize: '1rem', fontWeight: 800, margin: '0 0 4px' },
  swapSub: { fontSize: '0.8rem', color: '#888', margin: '0 0 16px' },
  swapList: { display: 'flex', flexDirection: 'column', gap: 8 },
  swapItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: '#fff', cursor: 'pointer', textAlign: 'left' },
  swapItemName: { fontWeight: 700, fontSize: '0.9rem' },
  swapItemMeta: { fontSize: '0.75rem', color: '#888', marginTop: 2 },
  
  rpeModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: 20, width: '100%', maxWidth: 360, padding: 24, textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' },
  rpeTitle: { fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', color: '#34C759' },
  rpeSubtitle: { fontSize: '0.85rem', color: '#888', margin: '0 0 12px' },
  rpeQuestion: { fontSize: '1rem', margin: '0 0 16px', fontWeight: 600 },
  rpeGrid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 16 },
  rpeBtn: { padding: '12px 4px', border: 'none', borderRadius: 12, cursor: 'pointer', color: '#fff' },
  rpeNum: { fontSize: '1.5rem', fontWeight: 800 },
  rpeLabel: { fontSize: '0.5rem', marginTop: 4, opacity: 0.9 },
  rpeHint: { fontSize: '0.75rem', color: '#666', margin: '0 0 16px' },
  rpeCancel: { padding: '10px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#888', fontSize: '0.8rem', cursor: 'pointer' },
  
  addExModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: 20, width: '100%', maxWidth: 420, padding: 20, maxHeight: '80vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)' },
  addExTitle: { fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', textAlign: 'center' },
  addExSub: { fontSize: '0.8rem', color: '#888', margin: '0 0 16px', textAlign: 'center' },
  addExList: { display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '50vh', overflowY: 'auto' },
  addExItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', color: '#fff' },
  addExName: { fontSize: '0.9rem', fontWeight: 700 },
  addExMeta: { fontSize: '0.75rem', color: '#888', marginTop: 2 },
  addExArrow: { fontSize: '1.25rem', color: '#34C759', fontWeight: 800 },
  addExCancel: { width: '100%', marginTop: 16, padding: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#888', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' },
  
  templatesModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: 20, width: '100%', maxWidth: 420, padding: 20, maxHeight: '85vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)' },
  templatesTitle: { fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', textAlign: 'center' },
  templatesSub: { fontSize: '0.8rem', color: '#888', margin: '0 0 16px', textAlign: 'center' },
  templatesList: { display: 'flex', flexDirection: 'column', gap: 10 },
  templateCard: { display: 'flex', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, cursor: 'pointer', textAlign: 'left', color: '#fff' },
  templateInfo: { flex: 1 },
  templateName: { fontSize: '1rem', fontWeight: 800, marginBottom: 4 },
  templateDesc: { fontSize: '0.8rem', color: '#888', marginBottom: 4 },
  templateDays: { fontSize: '0.75rem', color: '#FF3B30', fontWeight: 700 },
  templateArrow: { fontSize: '1.25rem', color: '#FF3B30', marginLeft: 12 },
  templatesCancel: { width: '100%', marginTop: 16, padding: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#888', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' },
  
  iconBtn: { padding: 10, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer' },
  readyScreen: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 },
  readyTitle: { fontSize: '1.25rem', fontWeight: 800, marginBottom: 32 },
  readyCircle: { width: 180, height: 180, borderRadius: '50%', border: '6px solid #FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'pulse 1s infinite' },
  readyCount: { fontSize: '5rem', fontWeight: 800, color: '#FF3B30' },
  readyText: { fontSize: '1.5rem', fontWeight: 800, color: '#FF3B30', marginBottom: 32 },
  readyCancel: { padding: '12px 32px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, color: '#888', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' },
  quickActive: { minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: 20 },
  qaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  qaTitle: { fontSize: '1.1rem', fontWeight: 800, margin: 0 },
  qaDots: { display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 32 },
  qaDot: { width: 10, height: 10, borderRadius: '50%' },
  qaMain: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  qaCircle: { width: 200, height: 200, borderRadius: '50%', border: '6px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  qaTime: { fontSize: '4rem', fontWeight: 800 },
  qaLabel: { fontSize: '1rem', color: '#888', fontWeight: 700 },
  qaExName: { fontSize: '1.25rem', fontWeight: 800, textAlign: 'center', margin: 0 },
  
  obContainer: { minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, color: '#fff' },
  obDots: { display: 'flex', gap: 6, marginBottom: 32 },
  obDot: { width: 8, height: 8, borderRadius: '50%' },
  obStep: { textAlign: 'center', maxWidth: 340, width: '100%' },
  obIcon: { width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B47 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 30px rgba(255,59,48,0.3)' },
  obTitle: { fontSize: '2rem', fontWeight: 800, marginBottom: 12 },
  obStepTitle: { fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 },
  obText: { fontSize: '0.95rem', color: '#888', marginBottom: 24, lineHeight: 1.6 },
  obSubtext: { fontSize: '0.85rem', color: '#666', marginBottom: 16 },
  obBtn: { display: 'inline-block', padding: '14px 32px', background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B47 100%)', border: 'none', borderRadius: 14, color: '#fff', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', marginTop: 8, boxShadow: '0 4px 15px rgba(255,59,48,0.3)' },
  obInput: { width: '100%', padding: 14, background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#fff', fontSize: '1rem', textAlign: 'center', marginBottom: 16, outline: 'none' },
  obStats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 },
  obLabel: { fontSize: '0.65rem', color: '#888', display: 'block', marginBottom: 6, fontWeight: 700 },
  obInputSm: { width: '100%', padding: 12, background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: '1.1rem', textAlign: 'center', outline: 'none' },
  obOpts: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  obOpt: { padding: 16, background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.08)', borderRadius: 14, color: '#fff', cursor: 'pointer', textAlign: 'left' },
  obOptActive: { border: '2px solid #FF3B30', background: 'rgba(255,59,48,0.1)' },
  obOptText: { fontWeight: 700, display: 'block' },
  obOptSub: { fontSize: '0.75rem', color: '#888', marginTop: 4, display: 'block' },
  obOptRow: { display: 'flex', gap: 12, marginBottom: 16 },
  obOptSmall: { flex: 1, padding: 16, background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.08)', borderRadius: 14, color: '#fff', cursor: 'pointer', fontWeight: 700 },
  dayPicker: { display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 },
  dayBtn: { width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.5rem', fontWeight: 800, cursor: 'pointer' },
  dayBtnActive: { border: '2px solid #FF3B30', background: 'rgba(255,59,48,0.1)' },
  
  sumGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 },
  sumCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, textAlign: 'center' },
  sumLabel: { fontSize: '0.6rem', color: '#666', marginBottom: 4, fontWeight: 800, letterSpacing: '0.03em' },
  sumVal: { fontSize: '1.5rem', fontWeight: 800, color: '#FF3B30' },
  weekCard: { padding: 12, background: 'rgba(255,149,0,0.1)', border: '1px solid rgba(255,149,0,0.25)', borderRadius: 12, fontSize: '0.85rem', textAlign: 'center', marginBottom: 16, color: '#FF9500', fontWeight: 600 },
  weekWarning: { color: '#FF3B30' },
  chartBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, marginBottom: 16 },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartTitle: { fontSize: '0.85rem', fontWeight: 700, color: '#fff', margin: 0 },
  chartLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#666', marginTop: 8 },
  addMeasureBtn: { padding: '6px 12px', background: 'rgba(59,130,246,0.15)', border: 'none', borderRadius: 8, color: '#3B82F6', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' },
  emptyText: { fontSize: '0.85rem', color: '#666', textAlign: 'center', padding: '24px 0' },
  prGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginTop: 12 },
  prItem: { padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' },
  prName: { fontSize: '0.7rem', color: '#888', marginBottom: 4 },
  prWeight: { fontSize: '1.25rem', fontWeight: 800, color: '#FF3B30' },
  nutritionCards: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 12 },
  nutritionCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, cursor: 'pointer' },
  nutritionCardHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  nutritionCardTitle: { fontSize: '0.8rem', color: '#888' },
  nutritionCardValue: { fontSize: '1.75rem', fontWeight: 800 },
  nutritionCardUnit: { fontSize: '0.9rem', color: '#666', fontWeight: 400 },
  miniProgress: { height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, marginTop: 8, marginBottom: 12, overflow: 'hidden' },
  miniProgressFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
  nutritionCardBtn: { width: '100%', padding: 8, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#888', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' },
  recentList: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 },
  recentItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10 },
  recentDay: { fontSize: '0.9rem', fontWeight: 700 },
  recentDate: { fontSize: '0.75rem', color: '#888', marginTop: 2 },
  recentStats: { display: 'flex', gap: 16, fontSize: '0.85rem' },
  recentPct: { color: '#34C759', fontWeight: 700 },
  recentVol: { color: '#888' },
  profileBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16 },
  profileGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 12 },
  profileItem: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  profileLabel: { color: '#666' },
};

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  button { font-family: inherit; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  input { font-family: inherit; }
  input::placeholder { color: #555; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
`;
