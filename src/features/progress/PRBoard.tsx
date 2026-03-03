import React, { useMemo, useState } from 'react';
import type { ExercisePR, PersonalRecords, GlobalPRs } from '@/shared/types';
import { EmptyState } from '@/shared/components';
import { formatVolume } from '@/shared/utils';
import { findExerciseByName } from '@/data/exercises';
import { colors, radii, typography, spacing } from '@/shared/theme/tokens';
import { S } from '@/shared/theme/styles';

/** Muscle group filter categories */
const PR_FILTER_GROUPS: Record<string, string[]> = {
  All: [],
  Chest: ['Chest'],
  Back: ['Back', 'Lats', 'Rear Delts'],
  Legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Shoulders: ['Shoulders'],
  Arms: ['Biceps', 'Triceps'],
  Core: ['Core'],
};

function isNewPR(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const prDate = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - prDate.getTime()) / 86400000;
  return diff <= 7;
}

const TrophyIllustration = (
  <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <path d="M20 10 h24 v18 a12 12 0 0 1-24 0 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M20 16 h-6 a6 6 0 0 0 0 12 h6" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M44 16 h6 a6 6 0 0 1 0 12 h-6" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
    <line x1="32" y1="40" x2="32" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="22" y1="50" x2="42" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

interface PRBoardProps {
  personalRecords: PersonalRecords;
  globalPRs: GlobalPRs;
  onShowExerciseHistory: (name: string) => void;
}

export function PRBoard({ personalRecords, globalPRs, onShowExerciseHistory }: PRBoardProps) {
  const [prFilter, setPrFilter] = useState('All');

  const filteredPRs = useMemo(() => {
    const entries = Object.entries(personalRecords);
    if (prFilter === 'All') return entries;
    const allowedMuscles = PR_FILTER_GROUPS[prFilter] || [];
    return entries.filter(([name]) => {
      const ex = findExerciseByName(name);
      return ex && allowedMuscles.includes(ex.muscle);
    });
  }, [personalRecords, prFilter]);

  return (
    <div style={S.chartBox}>
      <h3 style={S.chartTitle}>{'\u{1F3C6}'} Personal Records</h3>

      {Object.keys(personalRecords).length > 0 ? (
        <>
          <div style={prStyles.filterRow}>
            {Object.keys(PR_FILTER_GROUPS).map(group => (
              <button
                key={group}
                onClick={() => setPrFilter(group)}
                style={{
                  ...prStyles.filterBtn,
                  ...(prFilter === group ? prStyles.filterBtnActive : {}),
                }}
              >
                {group}
              </button>
            ))}
          </div>

          {prFilter === 'All' && globalPRs && (
            <div style={prStyles.globalSection}>
              <div style={prStyles.globalTitle}>GLOBAL RECORDS</div>
              <div style={prStyles.globalGrid}>
                {globalPRs.highestSessionVolume && (
                  <div style={prStyles.globalItem}>
                    <div style={prStyles.globalLabel}>Session Volume</div>
                    <div style={prStyles.globalValue}>{formatVolume(globalPRs.highestSessionVolume.value)}</div>
                    <div style={prStyles.globalDate}>{globalPRs.highestSessionVolume.date}</div>
                  </div>
                )}
                {globalPRs.longestStreak && (
                  <div style={prStyles.globalItem}>
                    <div style={prStyles.globalLabel}>Longest Streak</div>
                    <div style={prStyles.globalValue}>{globalPRs.longestStreak.days}d</div>
                    <div style={prStyles.globalDate}>ended {globalPRs.longestStreak.endDate}</div>
                  </div>
                )}
                {globalPRs.mostSetsInWorkout && (
                  <div style={prStyles.globalItem}>
                    <div style={prStyles.globalLabel}>Most Sets</div>
                    <div style={prStyles.globalValue}>{globalPRs.mostSetsInWorkout.count}</div>
                    <div style={prStyles.globalDate}>{globalPRs.mostSetsInWorkout.date}</div>
                  </div>
                )}
                {globalPRs.highestAvgRPE && (
                  <div style={prStyles.globalItem}>
                    <div style={prStyles.globalLabel}>Toughest Avg RPE</div>
                    <div style={prStyles.globalValue}>{globalPRs.highestAvgRPE.value}</div>
                    <div style={prStyles.globalDate}>{globalPRs.highestAvgRPE.date}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={prStyles.exerciseList}>
            {filteredPRs.map(([name, pr]) => (
              <PRExerciseCard
                key={name}
                name={name}
                pr={pr}
                onClick={() => onShowExerciseHistory(name)}
              />
            ))}
            {filteredPRs.length === 0 && (
              <p style={{ color: colors.textTertiary, textAlign: 'center', padding: '16px 0', fontSize: typography.sizes.md }}>
                No PRs for this muscle group yet
              </p>
            )}
          </div>
        </>
      ) : (
        <EmptyState
          illustration={TrophyIllustration}
          title="Your records board is empty"
          subtitle="Complete your first workout to set your baseline"
          style={{ padding: `${spacing.xl}px ${spacing.md}px` }}
        />
      )}
    </div>
  );
}

function PRExerciseCard({ name, pr, onClick }: { name: string; pr: ExercisePR; onClick: () => void }) {
  const hasAnyNew = [
    pr.heaviestWeight?.date,
    pr.bestEstimated1RM?.date,
    pr.bestSetVolume?.date,
    pr.bestSessionVolume?.date,
  ].some(d => isNewPR(d));

  return (
    <div style={prStyles.exerciseCard} onClick={onClick}>
      <div style={prStyles.exerciseHeader}>
        <div style={prStyles.exerciseName}>{name}</div>
        {hasAnyNew && <span style={prStyles.newBadge}>NEW</span>}
      </div>
      <div style={prStyles.prEntries}>
        {pr.heaviestWeight && (
          <PREntryRow icon={'\u{1F4AA}'} label="Heavy" value={`${pr.heaviestWeight.weightKg}kg x ${pr.heaviestWeight.reps}`} date={pr.heaviestWeight.date} />
        )}
        {pr.bestEstimated1RM && (
          <PREntryRow icon={'\u{1F3AF}'} label="Est 1RM" value={`${pr.bestEstimated1RM.value}kg`} date={pr.bestEstimated1RM.date} />
        )}
        {pr.bestSetVolume && (
          <PREntryRow icon={'\u26A1'} label="Best Set" value={`${pr.bestSetVolume.weightKg}kg x ${pr.bestSetVolume.reps} = ${formatVolume(pr.bestSetVolume.value)}`} date={pr.bestSetVolume.date} />
        )}
        {pr.bestSessionVolume && (
          <PREntryRow icon={'\u{1F4C8}'} label="Session Vol" value={formatVolume(pr.bestSessionVolume.value)} date={pr.bestSessionVolume.date} />
        )}
      </div>
    </div>
  );
}

function PREntryRow({ icon, label, value, date }: { icon: string; label: string; value: string; date: string }) {
  const isNew = isNewPR(date);
  return (
    <div style={prStyles.prRow}>
      <span style={prStyles.prRowIcon}>{icon}</span>
      <span style={prStyles.prRowLabel}>{label}:</span>
      <span style={{ ...prStyles.prRowValue, color: isNew ? colors.primary : colors.text }}>{value}</span>
      <span style={prStyles.prRowDate}>({date})</span>
      {isNew && <span style={prStyles.prRowNew}>NEW</span>}
    </div>
  );
}

const prStyles: Record<string, React.CSSProperties> = {
  filterRow: { display: 'flex', gap: 6, marginTop: spacing.md, marginBottom: spacing.md, overflowX: 'auto', paddingBottom: 4 },
  filterBtn: { padding: `6px ${spacing.md}px`, borderRadius: radii.pill, border: `1px solid ${colors.surfaceHover}`, background: colors.surface, color: colors.textSecondary, cursor: 'pointer', fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, whiteSpace: 'nowrap' },
  filterBtnActive: { background: colors.primarySurface, border: `1px solid ${colors.primaryBorder}`, color: colors.text },
  globalSection: { marginBottom: spacing.md, padding: spacing.md, borderRadius: radii.lg, background: 'rgba(255,149,0,0.06)', border: '1px solid rgba(255,149,0,0.15)' },
  globalTitle: { fontSize: typography.sizes.xs, fontWeight: typography.weights.black, color: colors.warning, letterSpacing: '0.08em', marginBottom: spacing.sm },
  globalGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing.sm },
  globalItem: { textAlign: 'center' as const, padding: spacing.sm },
  globalLabel: { fontSize: typography.sizes.xs, color: colors.textTertiary, fontWeight: typography.weights.bold, marginBottom: 2 },
  globalValue: { fontSize: typography.sizes['5xl'], fontWeight: typography.weights.black, color: colors.warning },
  globalDate: { fontSize: typography.sizes.xs, color: colors.textTertiary, marginTop: 2 },
  exerciseList: { display: 'flex', flexDirection: 'column' as const, gap: spacing.sm },
  exerciseCard: { padding: spacing.md, background: colors.surface, border: '1px solid rgba(255,255,255,0.05)', borderRadius: radii.lg, cursor: 'pointer' },
  exerciseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  exerciseName: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.text },
  newBadge: { fontSize: typography.sizes.xs, fontWeight: typography.weights.black, color: colors.primary, padding: '2px 8px', borderRadius: radii.sm, background: colors.primarySurface, border: `1px solid ${colors.primaryBorder}`, letterSpacing: '0.05em' },
  prEntries: { display: 'flex', flexDirection: 'column' as const, gap: 4 },
  prRow: { display: 'flex', alignItems: 'center', gap: 6, fontSize: typography.sizes.md, lineHeight: 1.5 },
  prRowIcon: { fontSize: typography.sizes.base, width: 16, flexShrink: 0 },
  prRowLabel: { color: colors.textSecondary, fontWeight: typography.weights.medium, flexShrink: 0 },
  prRowValue: { fontWeight: typography.weights.black, color: colors.text },
  prRowDate: { color: colors.textTertiary, fontSize: typography.sizes.sm, marginLeft: 'auto', flexShrink: 0 },
  prRowNew: { fontSize: '0.5rem', fontWeight: typography.weights.black, color: colors.primary, padding: '1px 4px', borderRadius: 3, background: colors.primarySurface, marginLeft: 4, flexShrink: 0 },
};
