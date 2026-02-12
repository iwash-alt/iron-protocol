import { exercises, isLowerBody } from '../domain/exercises';
import { workoutTemplates } from '../domain/templates';

export function calculate1RM(weight, reps) {
  return reps === 1 ? weight : Math.round(weight * (1 + reps / 30));
}

export function getWarmupSets(w) {
  if (w < 20) return [];
  const half = Math.round(w * 0.5 / 2.5) * 2.5;
  const seventy = Math.round(w * 0.7 / 2.5) * 2.5;
  const ninety = Math.round(w * 0.9 / 2.5) * 2.5;
  return [
    { label: 'Bar', weight: 20, reps: 10 },
    ...(half > 20 ? [{ label: '50%', weight: half, reps: 5 }] : []),
    ...(seventy > half ? [{ label: '70%', weight: seventy, reps: 3 }] : []),
    ...(ninety > seventy ? [{ label: '90%', weight: ninety, reps: 1 }] : []),
  ];
}

export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

export function getWeekNum() {
  return Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 604800000);
}

export function playRestComplete() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200]);
  try {
    if (typeof window !== 'undefined') {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch { /* audio not supported */ }
}

export function buildPlan(profile, templateKey = null) {
  const mult = profile.level === 'beginner' ? 0.6 : profile.level === 'intermediate' ? 0.8 : 1;
  const template = templateKey && workoutTemplates[templateKey]
    ? workoutTemplates[templateKey]
    : profile.days === 4 ? workoutTemplates.upperLower : workoutTemplates.ppl;

  const days = template.days.map((d, i) => ({ id: `d${i}`, name: d.name }));
  const planExercises = [];

  template.days.forEach((day, di) => {
    day.exercises.forEach((name, ei) => {
      const ex = exercises.find(e => e.name === name);
      if (ex) {
        const lower = isLowerBody(ex.muscle);
        planExercises.push({
          id: `d${di}-${ei}`,
          dayId: `d${di}`,
          exercise: ex,
          sets: 4,
          repsMin: lower ? 6 : 8,
          repsMax: lower ? 10 : 12,
          reps: lower ? 8 : 10,
          weight: Math.round((name.includes('Squat') || name.includes('Deadlift') ? 100 : 60) * mult),
          rest: 90,
          progression: 2.5,
        });
      }
    });
  });

  return { days, planExercises };
}

export function calculateSetProgression(rpe, exercise) {
  if (exercise.exercise.bodyweight) return null;
  const repsMin = exercise.repsMin ?? exercise.reps;
  const repsMax = exercise.repsMax ?? exercise.reps;

  if (rpe <= 8) {
    if (exercise.reps < repsMax) return { reps: exercise.reps + 1 };
    return { weight: exercise.weight + exercise.progression, reps: repsMin };
  }
  if (rpe === 10) {
    return { weight: Math.max(0, exercise.weight - exercise.progression), reps: repsMin };
  }
  return null;
}

export function calculateIncompleteSetPenalty(exercise) {
  if (exercise.exercise.bodyweight) return null;
  const repsMin = exercise.repsMin ?? exercise.reps;
  return { weight: Math.max(0, exercise.weight - exercise.progression), reps: repsMin };
}

export function createExerciseEntry(currentDay, exercise) {
  const lower = isLowerBody(exercise.muscle);
  return {
    id: `${currentDay.id}-${Date.now()}`,
    dayId: currentDay.id,
    exercise,
    sets: 3,
    repsMin: lower ? 6 : 8,
    repsMax: lower ? 10 : 12,
    reps: lower ? 8 : 10,
    weight: 20,
    rest: 90,
    progression: 2.5,
  };
}
