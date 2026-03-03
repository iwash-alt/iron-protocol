import React, { useState } from 'react';
import type { UserProfile, BodyMeasurement } from '@/shared/types';
import { MiniChart, Icon, EmptyState } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import { ProgressPhotos } from '@/features/photos/ProgressPhotos';

const RulerIllustration = (
  <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <rect x="8" y="24" width="48" height="16" rx="2" stroke="currentColor" strokeWidth="2.5"/>
    <line x1="16" y1="24" x2="16" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="24" y1="24" x2="24" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="32" y1="24" x2="32" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="40" y1="24" x2="40" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="48" y1="24" x2="48" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

interface BodyTrackingProps {
  profile: UserProfile;
  bodyMeasurements: BodyMeasurement[];
  onOpenMeasurements: () => void;
}

export function BodyTracking({ profile, bodyMeasurements, onOpenMeasurements }: BodyTrackingProps) {
  const [measureTab, setMeasureTab] = useState<'measurements' | 'photos'>('measurements');
  const weightData = bodyMeasurements.slice(-10).map(m => parseFloat(String(m.weight)) || 0);

  return (
    <div style={S.chartBox}>
      <div style={S.chartHeader}>
        <h3 style={S.chartTitle}>{'\u{1F4CF}'} Body Tracking</h3>
        {measureTab === 'measurements' && (
          <button onClick={onOpenMeasurements} style={S.addMeasureBtn}>+ LOG</button>
        )}
      </div>
      <div style={tabStyles.tabRow}>
        <button
          onClick={() => setMeasureTab('measurements')}
          style={{
            ...tabStyles.tab,
            ...(measureTab === 'measurements' ? tabStyles.tabActive : {}),
          }}
        >
          <Icon name="ruler" size={14} /> Measurements
        </button>
        <button
          onClick={() => setMeasureTab('photos')}
          style={{
            ...tabStyles.tab,
            ...(measureTab === 'photos' ? tabStyles.tabActive : {}),
          }}
        >
          <Icon name="camera" size={14} /> Progress Photos
        </button>
      </div>
      {measureTab === 'measurements' ? (
        weightData.length > 1 ? (
          <>
            <MiniChart data={weightData} color="#3B82F6" height={60} />
            <div style={S.measureSummary}>
              <span>Current: {bodyMeasurements[bodyMeasurements.length - 1]?.weight}kg</span>
              <span>Start: {bodyMeasurements[0]?.weight}kg</span>
            </div>
          </>
        ) : (
          <EmptyState
            illustration={RulerIllustration}
            title="Log measurements to track progress"
            subtitle="Track weight and body measurements over time"
            actions={[{ label: 'Log Now', onClick: onOpenMeasurements }]}
            style={{ padding: `${spacing.lg}px ${spacing.md}px` }}
          />
        )
      ) : (
        <ProgressPhotos currentWeight={profile.weight} />
      )}
    </div>
  );
}

const tabStyles: Record<string, React.CSSProperties> = {
  tabRow: { display: 'flex', gap: spacing.sm, marginBottom: spacing.md },
  tab: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: `${spacing.sm + 2}px ${spacing.md}px`, borderRadius: radii.pill,
    border: `1px solid ${colors.surfaceHover}`, background: colors.surface,
    color: colors.textSecondary, cursor: 'pointer', fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold, whiteSpace: 'nowrap' as const,
  },
  tabActive: {
    background: colors.primarySurface, border: `1px solid ${colors.primaryBorder}`, color: colors.text,
  },
};
