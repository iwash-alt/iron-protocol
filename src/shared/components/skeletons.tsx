import React from 'react';
import { radii, spacing } from '@/shared/theme/tokens';

function skBlock(w: string | number, h: number, br?: number): React.CSSProperties {
  return {
    width: w,
    height: h,
    borderRadius: br ?? radii.lg,
    background: '#1a1a1a',
    animation: 'skeletonPulse 1.6s ease-in-out infinite',
    flexShrink: 0,
  };
}

const wrap: React.CSSProperties = {
  padding: spacing.lg,
  display: 'flex',
  flexDirection: 'column',
  gap: spacing.md,
};

export function WorkoutSkeleton() {
  return (
    <div style={wrap}>
      {/* Day pills row */}
      <div style={{ display: 'flex', gap: spacing.sm }}>
        {[60, 56, 64, 52].map((w, i) => (
          <div key={i} style={skBlock(w, 32, radii.pill)} />
        ))}
      </div>
      {/* Progress bar card */}
      <div style={skBlock('100%', 48, radii.xl)} />
      {/* Exercise cards */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ ...skBlock('100%', 80, radii.lg), padding: spacing.md, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          <div style={skBlock('60%', 16, radii.sm)} />
          {[0, 1, 2].map((j) => <div key={j} style={skBlock('100%', 12, radii.sm)} />)}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={wrap}>
      {/* 2×2 stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
        {[0, 1, 2, 3].map((i) => <div key={i} style={skBlock('100%', 70, radii.xl)} />)}
      </div>
      {/* Chart area */}
      <div style={skBlock('100%', 120, radii.xl)} />
      {/* Insight cards */}
      <div style={skBlock('100%', 60, radii.lg)} />
      <div style={skBlock('100%', 60, radii.lg)} />
    </div>
  );
}

export function QuickWorkoutSkeleton() {
  return (
    <div style={wrap}>
      <div style={skBlock(180, 20, radii.md)} />
      <div style={skBlock(100, 14, radii.sm)} />
      {[0, 1, 2, 3].map((i) => <div key={i} style={skBlock('100%', 64, radii.lg)} />)}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div style={wrap}>
      {/* Calendar strip */}
      <div style={skBlock('100%', 56, radii.md)} />
      {/* Greeting */}
      <div style={skBlock('50%', 20, radii.sm)} />
      <div style={skBlock('40%', 14, radii.sm)} />
      {/* Today's workout card */}
      <div style={skBlock('100%', 110, radii.xl)} />
      {/* 3-stat row */}
      <div style={{ display: 'flex', gap: spacing.md }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ ...skBlock('100%', 70, radii.xl), flex: 1 }} />)}
      </div>
      {/* Recent activity label */}
      <div style={skBlock(80, 14, radii.sm)} />
      {/* Recent activity items */}
      {[0, 1, 2].map((i) => <div key={i} style={skBlock('100%', 52, radii.md)} />)}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div style={{ ...wrap, alignItems: 'center' }}>
      {/* Avatar */}
      <div style={{ ...skBlock(80, 80), borderRadius: '50%', alignSelf: 'center' }} />
      {/* Name */}
      <div style={skBlock(120, 20, radii.sm)} />
      {/* Subtitle */}
      <div style={skBlock(80, 14, radii.sm)} />
      {/* Section 1 */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <div style={skBlock(60, 12, radii.sm)} />
        <div style={skBlock('100%', 130, radii.xxl)} />
      </div>
      {/* Section 2 */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <div style={skBlock(60, 12, radii.sm)} />
        <div style={skBlock('100%', 130, radii.xxl)} />
      </div>
    </div>
  );
}
