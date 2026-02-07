import React from 'react';
import { S } from '../styles';
import Icon from '../components/Icon';
import ProgressBar from '../components/ProgressBar';
import RestBanner from '../components/RestBanner';
import { getWarmupSets } from '../../training/engine';
import { formatTime } from '../../analytics/stats';

export default function WorkoutView({
  days, dayIdx, dayExercises, completed, progress,
  restTime, restFor, proteinGoal, waterGoal,
  todayWater, todayProtein, exerciseHistory, showWarmup,
  onSwitchDay, onCompleteSet, onEditExercise, onShowSwap,
  onShowVideo, onShowWarmup, onShowExerciseHistory,
  onShowAddExercise, onShowTemplates, onShowNutrition,
  onAddWater, onEndWorkout, onSkipRest,
}) {
  return (
    <>
      <div style={S.nutritionBar}>
        <div style={S.nutritionItem} onClick={onShowNutrition}>
          <span style={S.nutritionIcon}>&#x1F4A7;</span>
          <span style={S.nutritionValue}>{todayWater}/{waterGoal}</span>
          <button onClick={e => { e.stopPropagation(); onAddWater(); }} style={S.addBtn}>+</button>
        </div>
        <div style={S.nutritionItem} onClick={onShowNutrition}>
          <span style={S.nutritionIcon}>&#x1F969;</span>
          <span style={S.nutritionValue}>{todayProtein}/{proteinGoal}g</span>
          <button onClick={e => { e.stopPropagation(); onShowNutrition(); }} style={S.addBtn}>+</button>
        </div>
      </div>

      <div style={S.tabs}>
        {days.map((d, i) => (
          <button key={d.id} onClick={() => onSwitchDay(i)}
            style={{ ...S.tab, ...(dayIdx === i ? S.tabActive : {}) }}>
            {d.name.toUpperCase()}
          </button>
        ))}
        <button onClick={onShowTemplates} style={S.tabSettings}>&#x2699;&#xFE0F;</button>
      </div>

      <ProgressBar progress={progress} />
      <RestBanner restTime={restTime} onSkip={onSkipRest} />

      <div style={S.exList}>
        {dayExercises.map(pe => {
          const done = completed[pe.id] || 0;
          const isDone = done >= pe.sets;
          const isWarmupOpen = showWarmup === pe.id;
          const warmups = getWarmupSets(pe.weight);
          const hasHistory = exerciseHistory[pe.exercise.name]?.length > 0;
          const hasRange = typeof pe.repsMin === 'number' && typeof pe.repsMax === 'number';
          return (
            <div key={pe.id} style={{ ...S.exCard, ...(isDone ? S.exDone : {}) }}>
              <div style={S.exHeader}>
                <div>
                  <div style={S.exTags}>
                    <span style={S.muscleTag}>{pe.exercise.muscle}</span>
                    {isDone && <span style={S.doneTag}><Icon name="check" size={12} /> Done</span>}
                  </div>
                  <h3 style={{ ...S.exName, color: isDone ? '#34C759' : '#fff' }}>{pe.exercise.name}</h3>
                </div>
                <div style={S.exActions}>
                  {hasHistory && <button onClick={() => onShowExerciseHistory(pe.exercise.name)} style={S.historyBtn}><Icon name="history" size={16} /></button>}
                  {!pe.exercise.bodyweight && <button onClick={() => onShowWarmup(isWarmupOpen ? null : pe.id)} style={isWarmupOpen ? S.warmupBtnActive : S.warmupBtn}><Icon name="fire" size={16} /></button>}
                  <button onClick={() => onEditExercise(pe)} style={S.editBtn}><Icon name="edit" size={16} /></button>
                  <button onClick={() => onShowSwap(pe)} style={S.swapBtn}><Icon name="swap" size={16} /></button>
                  <button onClick={() => onShowVideo(pe.exercise)} style={S.playBtn}><Icon name="play" size={16} /></button>
                </div>
              </div>
              {isWarmupOpen && (
                <div style={S.warmupBox}>
                  <div style={S.warmupTitle}>WARM-UP SETS</div>
                  <div style={S.warmupGrid}>
                    {warmups.map((w, i) => (
                      <div key={i} style={S.warmupRow}>
                        <span style={S.warmupLabel}>{w.label}</span>
                        <span style={S.warmupVal}>{w.weight}kg &times; {w.reps}</span>
                        <input type="checkbox" style={{ accentColor: '#FF9500', width: 18, height: 18 }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={S.stats}>
                <div style={S.stat}><div style={S.statLabel}>SETS</div><div style={S.statVal}>{done}/{pe.sets}</div></div>
                <div style={S.stat}><div style={S.statLabel}>REPS</div><div style={S.statVal}>{pe.reps}{hasRange && <span style={{ color: '#666', fontSize: '0.65rem' }}> ({pe.repsMin}-{pe.repsMax})</span>}</div></div>
                <div style={S.stat}><div style={S.statLabel}>WEIGHT</div><div style={S.statValRed}>{pe.weight}kg</div></div>
                <div style={S.stat}><div style={S.statLabel}>NEXT</div><div style={S.statValGreen}>+{pe.progression}</div></div>
              </div>
              {!isDone && (
                <button onClick={() => onCompleteSet(pe)}
                  disabled={restTime > 0 && restFor === pe.id}
                  style={{ ...S.completeBtn, ...(restTime > 0 && restFor === pe.id ? S.completeBtnOff : {}) }}>
                  {restTime > 0 && restFor === pe.id ? `RESTING... ${formatTime(restTime)}` : `COMPLETE SET ${done + 1}`}
                </button>
              )}
            </div>
          );
        })}
        <button onClick={onShowAddExercise} style={S.addExerciseBtn}>
          <Icon name="plus" size={18} /> ADD EXERCISE
        </button>
      </div>
      {Object.keys(completed).length > 0 && (
        <button onClick={onEndWorkout} style={S.finishBtn}>
          {progress >= 100 ? 'FINISH WORKOUT \uD83C\uDF89' : 'END WORKOUT EARLY'}
        </button>
      )}
    </>
  );
}
