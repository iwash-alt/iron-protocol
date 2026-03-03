import React from 'react';
import type { UserProfile } from '@/shared/types';
import { S } from '@/shared/theme/styles';

interface ProfileSummaryProps {
  profile: UserProfile;
  demoMode: boolean;
  onToggleDemo: (enabled: boolean) => void;
}

export function ProfileSummary({ profile, demoMode, onToggleDemo }: ProfileSummaryProps) {
  return (
    <div style={S.profileBox}>
      <h3 style={S.chartTitle}>{'\u{1F464}'} Profile</h3>
      <div style={S.profileGrid}>
        <div style={S.profileItem}><span style={S.profileLabel}>Height</span><span>{profile.height}cm</span></div>
        <div style={S.profileItem}><span style={S.profileLabel}>Weight</span><span>{profile.weight}kg</span></div>
        <div style={S.profileItem}><span style={S.profileLabel}>Level</span><span style={{ textTransform: 'capitalize' }}>{profile.level}</span></div>
        <div style={S.profileItem}><span style={S.profileLabel}>Schedule</span><span>{profile.days}x/week</span></div>
      </div>
      <div style={S.demoRow}>
        <div>
          <div style={S.demoLabel}>Demo Mode</div>
          <div style={S.demoHint}>Load 6 months of serious lifter data</div>
        </div>
        <button
          type="button"
          onClick={() => onToggleDemo(!demoMode)}
          style={{ ...S.demoToggle, ...(demoMode ? S.demoToggleOn : {}) }}
          aria-pressed={demoMode}
        >
          <span style={{ ...S.demoKnob, ...(demoMode ? S.demoKnobOn : {}) }} />
        </button>
      </div>
    </div>
  );
}
