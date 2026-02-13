import React, { useState, useCallback, useRef } from 'react';
import type { UserProfile } from '@/shared/types';
import { useWorkout } from '@/features/workout/WorkoutContext';
import { useProfilePhoto } from '@/features/photos/ProfilePhotoContext';
import { Icon } from '@/shared/components';
import { S } from '@/shared/theme/styles';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import {
  loadProfile, saveProfile,
  loadWorkoutHistory, loadExerciseHistory, loadPersonalRecords,
  loadBodyMeasurements, loadNutritionHistory,
  StorageKeys,
} from '@/shared/storage';
import { processProfilePhoto } from '@/shared/utils/imageProcessing';

interface ProfileProps {
  profile: UserProfile;
  onProfileUpdate: (p: UserProfile) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Profile({ profile, onProfileUpdate }: ProfileProps) {
  const workout = useWorkout();
  const { photo: profilePhoto, setPhoto, clearPhoto } = useProfilePhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ ...profile });
  const [showReset, setShowReset] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [photoProcessing, setPhotoProcessing] = useState(false);

  const handleSave = useCallback(() => {
    const updated = { ...profile, ...editData };
    saveProfile(updated);
    onProfileUpdate(updated);
    setEditing(false);
  }, [editData, profile, onProfileUpdate]);

  const handleExport = useCallback(() => {
    const data = {
      profile: loadProfile(),
      workoutHistory: loadWorkoutHistory(),
      exerciseHistory: loadExerciseHistory(),
      personalRecords: loadPersonalRecords(),
      bodyMeasurements: loadBodyMeasurements(),
      nutritionHistory: loadNutritionHistory(),
      exportDate: new Date().toISOString(),
      version: '2.0.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iron-protocol-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleReset = useCallback(() => {
    Object.values(StorageKeys).forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('ironStorageVersion');
    window.location.reload();
  }, []);

  const handlePhotoSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoProcessing(true);
    try {
      const base64 = await processProfilePhoto(file);
      setPhoto(base64);
    } catch (err) {
      console.error('Failed to process photo:', err);
    } finally {
      setPhotoProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [setPhoto]);

  const totalWorkouts = workout.workoutHistory.length;
  const totalVolume = workout.workoutHistory.reduce((a, w) => a + (w.totalVolumeKg || 0), 0);
  const prCount = Object.keys(workout.personalRecords).length;

  return (
    <div style={S.profileScreen}>
      {/* Avatar & Name */}
      <div
        style={{
          ...avatarStyles.container,
          cursor: 'pointer',
          position: 'relative' as const,
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt="Profile"
            style={avatarStyles.image}
          />
        ) : (
          <div style={avatarStyles.initials}>
            {getInitials(profile.name)}
          </div>
        )}
        <div style={avatarStyles.cameraBadge}>
          {photoProcessing ? (
            <span style={avatarStyles.spinner} />
          ) : (
            <Icon name="camera" size={14} />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handlePhotoSelect}
          style={{ display: 'none' }}
        />
      </div>
      {profilePhoto && (
        <button
          onClick={(e) => { e.stopPropagation(); clearPhoto(); }}
          style={avatarStyles.removeBtn}
        >
          Remove Photo
        </button>
      )}
      <div style={S.profileName as React.CSSProperties}>{profile.name}</div>
      <div style={S.profileSub as React.CSSProperties}>{profile.level} lifter</div>

      {/* Stats Summary */}
      <div style={{ ...S.sumGrid, gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>WORKOUTS</div>
          <div style={S.sumVal}>{totalWorkouts}</div>
        </div>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>VOLUME</div>
          <div style={S.sumVal}>{(totalVolume / 1000).toFixed(0)}t</div>
        </div>
        <div style={S.sumCard}>
          <div style={S.sumLabel}>PRs</div>
          <div style={S.sumVal}>{prCount}</div>
        </div>
      </div>

      {/* Personal Info */}
      <div style={S.profileSection}>
        <div style={S.profileSectionTitle}>PERSONAL INFO</div>
        <div style={S.profileCard}>
          <div style={S.profileRow} onClick={() => { setEditData({ ...profile }); setEditing(true); }}>
            <span style={S.profileRowLabel}><Icon name="user" size={18} /> Name</span>
            <span style={S.profileRowValue}>{profile.name} <Icon name="chevron-right" size={14} /></span>
          </div>
          <div style={S.profileRow} onClick={() => { setEditData({ ...profile }); setEditing(true); }}>
            <span style={S.profileRowLabel}><Icon name="ruler" size={18} /> Height</span>
            <span style={S.profileRowValue}>{profile.height} cm <Icon name="chevron-right" size={14} /></span>
          </div>
          <div style={S.profileRow} onClick={() => { setEditData({ ...profile }); setEditing(true); }}>
            <span style={S.profileRowLabel}>Weight</span>
            <span style={S.profileRowValue}>{profile.weight} kg <Icon name="chevron-right" size={14} /></span>
          </div>
          <div style={{ ...S.profileRow, ...S.profileRowLast }} onClick={() => { setEditData({ ...profile }); setEditing(true); }}>
            <span style={S.profileRowLabel}>Age</span>
            <span style={S.profileRowValue}>{profile.age} <Icon name="chevron-right" size={14} /></span>
          </div>
        </div>
      </div>

      {/* Training Preferences */}
      <div style={S.profileSection}>
        <div style={S.profileSectionTitle}>TRAINING</div>
        <div style={S.profileCard}>
          <div style={S.profileRow} onClick={() => setShowPrefs(true)}>
            <span style={S.profileRowLabel}><Icon name="dumbbell" size={18} /> Experience</span>
            <span style={{ ...S.profileRowValue, textTransform: 'capitalize' } as React.CSSProperties}>{profile.level} <Icon name="chevron-right" size={14} /></span>
          </div>
          <div style={{ ...S.profileRow, ...S.profileRowLast }} onClick={() => setShowPrefs(true)}>
            <span style={S.profileRowLabel}><Icon name="flame" size={18} /> Training Days</span>
            <span style={S.profileRowValue}>{profile.days}x / week <Icon name="chevron-right" size={14} /></span>
          </div>
        </div>
      </div>

      {/* Upgrade to Pro */}
      <div style={S.upgradeCard}>
        <div style={S.upgradeTitle}>Upgrade to Pro</div>
        <div style={S.upgradeSub}>Unlock the full Iron Protocol experience</div>
        {['Advanced periodization', 'AI form analysis', 'Custom templates', 'Priority support'].map(f => (
          <div key={f} style={S.upgradeFeature}>
            <span style={S.upgradeFeatureIcon}><Icon name="star-filled" size={14} /></span>
            {f}
          </div>
        ))}
        <button style={S.upgradeBtn}>COMING SOON</button>
      </div>

      {/* Data Management */}
      <div style={S.profileSection}>
        <div style={S.profileSectionTitle}>DATA</div>
        <div style={S.profileCard}>
          <div style={S.profileRow} onClick={handleExport}>
            <span style={S.profileRowLabel}><Icon name="download" size={18} /> Export Data</span>
            <span style={S.profileRowValue}>JSON <Icon name="chevron-right" size={14} /></span>
          </div>
          <div style={{ ...S.profileRow, ...S.profileRowLast }} onClick={() => setShowReset(true)}>
            <span style={{ ...S.profileRowLabel, ...S.profileRowDanger }}><Icon name="trash" size={18} /> Reset All Data</span>
            <span style={S.profileRowValue}><Icon name="chevron-right" size={14} /></span>
          </div>
        </div>
      </div>

      {/* App Version */}
      <div style={S.appVersion}>Iron Protocol v2.0.0</div>

      {/* Edit Profile Sheet */}
      {editing && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 140 }} onClick={() => setEditing(false)} />
          <div style={S.profileEditModal} className="modal-sheet">
            <div style={S.profileEditHandle} />
            <div style={S.profileEditTitle as React.CSSProperties}>Edit Profile</div>

            <div style={S.profileEditField}>
              <label style={S.profileEditLabel}>Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                style={S.profileEditInput}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={S.profileEditField}>
                <label style={S.profileEditLabel}>Height (cm)</label>
                <input
                  type="number"
                  value={editData.height}
                  onChange={e => setEditData(d => ({ ...d, height: +e.target.value }))}
                  style={S.profileEditInput}
                />
              </div>
              <div style={S.profileEditField}>
                <label style={S.profileEditLabel}>Weight (kg)</label>
                <input
                  type="number"
                  value={editData.weight}
                  onChange={e => setEditData(d => ({ ...d, weight: +e.target.value }))}
                  style={S.profileEditInput}
                />
              </div>
              <div style={S.profileEditField}>
                <label style={S.profileEditLabel}>Age</label>
                <input
                  type="number"
                  value={editData.age}
                  onChange={e => setEditData(d => ({ ...d, age: +e.target.value }))}
                  style={S.profileEditInput}
                />
              </div>
            </div>

            <div style={S.profileEditField}>
              <label style={S.profileEditLabel}>Experience Level</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setEditData(d => ({ ...d, level: lvl }))}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      borderRadius: 12,
                      border: editData.level === lvl ? `2px solid ${colors.primary}` : '2px solid rgba(255,255,255,0.1)',
                      background: editData.level === lvl ? 'rgba(255,59,48,0.1)' : 'rgba(255,255,255,0.03)',
                      color: editData.level === lvl ? colors.text : colors.textSecondary,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      minHeight: 48,
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.profileEditField}>
              <label style={S.profileEditLabel}>Training Days</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {([3, 4] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setEditData(prev => ({ ...prev, days: d }))}
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 12,
                      border: editData.days === d ? `2px solid ${colors.primary}` : '2px solid rgba(255,255,255,0.1)',
                      background: editData.days === d ? 'rgba(255,59,48,0.1)' : 'rgba(255,255,255,0.03)',
                      color: editData.days === d ? colors.text : colors.textSecondary,
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      minHeight: 52,
                    }}
                  >
                    {d}x / week
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSave} style={S.profileEditSave}>SAVE CHANGES</button>
          </div>
        </>
      )}

      {/* Training Preferences Sheet */}
      {showPrefs && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 140 }} onClick={() => setShowPrefs(false)} />
          <div style={S.profileEditModal} className="modal-sheet">
            <div style={S.profileEditHandle} />
            <div style={S.profileEditTitle as React.CSSProperties}>Training Preferences</div>

            <div style={S.profileEditField}>
              <label style={S.profileEditLabel}>Experience Level</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setEditData(d => ({ ...d, level: lvl }))}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      borderRadius: 12,
                      border: editData.level === lvl ? `2px solid ${colors.primary}` : '2px solid rgba(255,255,255,0.1)',
                      background: editData.level === lvl ? 'rgba(255,59,48,0.1)' : 'rgba(255,255,255,0.03)',
                      color: editData.level === lvl ? colors.text : colors.textSecondary,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      minHeight: 48,
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.profileEditField}>
              <label style={S.profileEditLabel}>Training Days</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {([3, 4] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setEditData(prev => ({ ...prev, days: d }))}
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 12,
                      border: editData.days === d ? `2px solid ${colors.primary}` : '2px solid rgba(255,255,255,0.1)',
                      background: editData.days === d ? 'rgba(255,59,48,0.1)' : 'rgba(255,255,255,0.03)',
                      color: editData.days === d ? colors.text : colors.textSecondary,
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      minHeight: 52,
                    }}
                  >
                    {d}x / week
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const updated = { ...profile, level: editData.level, days: editData.days };
                saveProfile(updated);
                onProfileUpdate(updated);
                setShowPrefs(false);
              }}
              style={S.profileEditSave}
            >
              SAVE PREFERENCES
            </button>
          </div>
        </>
      )}

      {/* Reset Confirmation */}
      {showReset && (
        <div style={S.confirmOverlay} onClick={() => setShowReset(false)}>
          <div style={S.confirmBox} onClick={e => e.stopPropagation()}>
            <Icon name="alert" size={32} />
            <h3 style={S.confirmTitle}>Reset All Data?</h3>
            <p style={S.confirmText}>
              This will permanently delete all your workouts, PRs, measurements, and profile. This cannot be undone.
            </p>
            <div style={S.confirmBtns}>
              <button onClick={() => setShowReset(false)} style={S.keepBtn}>CANCEL</button>
              <button onClick={handleReset} style={S.endBtn}>RESET</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const avatarStyles: Record<string, React.CSSProperties> = {
  container: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    margin: '0 auto 8px',
    position: 'relative',
    overflow: 'visible',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block',
    border: `3px solid ${colors.primaryBorder}`,
  },
  initials: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: colors.primaryGradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.sizes['6xl'],
    fontWeight: typography.weights.black,
    color: colors.text,
    boxShadow: `0 8px 30px ${colors.primaryGlow}`,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: colors.surface,
    border: `2px solid ${colors.background}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text,
  },
  spinner: {
    width: 12,
    height: 12,
    border: `2px solid ${colors.textTertiary}`,
    borderTopColor: colors.primary,
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'pullRefreshSpin 0.6s linear infinite',
  },
  removeBtn: {
    display: 'block',
    margin: '0 auto 8px',
    padding: `${spacing.xs}px ${spacing.md}px`,
    background: 'none',
    border: 'none',
    color: colors.textTertiary,
    fontSize: typography.sizes.sm,
    cursor: 'pointer',
  },
};
