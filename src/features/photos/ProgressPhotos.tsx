import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Icon } from '@/shared/components';
import { colors, spacing, radii, typography } from '@/shared/theme/tokens';
import {
  loadProgressPhotos, addProgressPhoto, deleteProgressPhoto,
  getProgressPhotosStorageInfo,
} from '@/shared/storage';
import type { ProgressPhoto } from '@/shared/storage';
import { processProgressPhoto, generateThumbnail, formatBytes } from '@/shared/utils/imageProcessing';

type PoseType = 'Front' | 'Side' | 'Back' | 'Custom';
const POSE_TYPES: PoseType[] = ['Front', 'Side', 'Back', 'Custom'];

interface ProgressPhotosProps {
  currentWeight: number;
}

export function ProgressPhotos({ currentWeight }: ProgressPhotosProps) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(() => loadProgressPhotos());
  const [filter, setFilter] = useState<PoseType | 'All'>('All');
  const [viewPhoto, setViewPhoto] = useState<ProgressPhoto | null>(null);
  const [viewIndex, setViewIndex] = useState(0);
  const [showAddFlow, setShowAddFlow] = useState(false);
  const [addPose, setAddPose] = useState<PoseType>('Front');
  const [processing, setProcessing] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<ProgressPhoto[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute when photos changes
  const storageInfo = useMemo(() => getProgressPhotosStorageInfo(), [photos.length]);

  const filteredPhotos = useMemo(() => {
    const sorted = [...photos].sort((a, b) => b.date.localeCompare(a.date));
    if (filter === 'All') return sorted;
    return sorted.filter(p => p.poseType === filter);
  }, [photos, filter]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const data = await processProgressPhoto(file);
      const thumbnail = await generateThumbnail(data);
      const photo: ProgressPhoto = {
        id: `pp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        date: new Date().toISOString().split('T')[0],
        poseType: addPose,
        bodyWeight: currentWeight,
        data,
        thumbnail,
      };
      const result = addProgressPhoto(photo);
      if (result.success) {
        setPhotos(loadProgressPhotos());
        setShowAddFlow(false);
      } else {
        setError(result.message || 'Failed to save photo');
      }
    } catch (err) {
      console.error('Failed to process progress photo:', err);
      setError('Failed to process photo. Please try again.');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [addPose, currentWeight]);

  const handleDelete = useCallback((id: string) => {
    deleteProgressPhoto(id);
    setPhotos(loadProgressPhotos());
    setViewPhoto(null);
  }, []);

  const handleViewNav = useCallback((direction: 1 | -1) => {
    const newIdx = viewIndex + direction;
    if (newIdx >= 0 && newIdx < filteredPhotos.length) {
      setViewIndex(newIdx);
      setViewPhoto(filteredPhotos[newIdx]);
    }
  }, [viewIndex, filteredPhotos]);

  const handleCompareToggle = useCallback((photo: ProgressPhoto) => {
    setCompareSelection(prev => {
      const exists = prev.find(p => p.id === photo.id);
      if (exists) return prev.filter(p => p.id !== photo.id);
      if (prev.length >= 2) return [prev[1], photo];
      return [...prev, photo];
    });
  }, []);

  const startCompare = useCallback(() => {
    if (compareSelection.length === 2) {
      setShowCompare(true);
    }
  }, [compareSelection]);

  return (
    <div>
      {/* Storage info */}
      <div style={ps.storageBar}>
        <span style={ps.storageText}>
          {storageInfo.count}/{storageInfo.maxCount} photos ({formatBytes(storageInfo.bytesUsed)} used)
        </span>
        {storageInfo.count >= 18 && (
          <span style={ps.storageWarn}>Approaching limit</span>
        )}
      </div>

      {/* Controls row */}
      <div style={ps.controls}>
        <button
          onClick={() => { setShowAddFlow(true); setError(null); }}
          style={ps.addBtn}
          disabled={storageInfo.count >= storageInfo.maxCount}
        >
          <Icon name="camera" size={16} /> Add Photo
        </button>
        <button
          onClick={() => {
            setCompareMode(!compareMode);
            setCompareSelection([]);
          }}
          style={{
            ...ps.compareBtn,
            ...(compareMode ? ps.compareBtnActive : {}),
          }}
        >
          <Icon name="columns" size={16} /> Compare
        </button>
      </div>

      {/* Pose type filter */}
      <div style={ps.filterRow}>
        {(['All', ...POSE_TYPES] as const).map(pose => (
          <button
            key={pose}
            onClick={() => setFilter(pose)}
            style={{
              ...ps.filterBtn,
              ...(filter === pose ? ps.filterBtnActive : {}),
            }}
          >
            {pose}
          </button>
        ))}
      </div>

      {/* Compare selection bar */}
      {compareMode && (
        <div style={ps.compareBar}>
          <span style={ps.compareBarText}>
            Select 2 photos ({compareSelection.length}/2)
          </span>
          {compareSelection.length === 2 && (
            <button onClick={startCompare} style={ps.compareGoBtn}>
              Compare
            </button>
          )}
        </div>
      )}

      {/* Photo grid */}
      {filteredPhotos.length > 0 ? (
        <div style={ps.grid}>
          {filteredPhotos.map((photo) => {
            const isSelected = compareSelection.some(p => p.id === photo.id);
            return (
              <div
                key={photo.id}
                style={{
                  ...ps.gridItem,
                  ...(isSelected ? ps.gridItemSelected : {}),
                }}
                onClick={() => {
                  if (compareMode) {
                    handleCompareToggle(photo);
                  } else {
                    const idx = filteredPhotos.indexOf(photo);
                    setViewIndex(idx);
                    setViewPhoto(photo);
                  }
                }}
              >
                <img src={photo.thumbnail} alt={photo.poseType} style={ps.gridImg} />
                <div style={ps.gridOverlay}>
                  <span style={ps.gridDate}>{photo.date}</span>
                  <span style={ps.gridPose}>{photo.poseType}</span>
                </div>
                {isSelected && (
                  <div style={ps.selectedBadge}>
                    <Icon name="check" size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={ps.empty}>
          <Icon name="image" size={36} />
          <p style={ps.emptyText}>No progress photos yet</p>
          <p style={ps.emptyHint}>Take photos to track your transformation</p>
        </div>
      )}

      {/* Add photo flow modal */}
      {showAddFlow && (
        <>
          <div style={ps.backdrop} onClick={() => setShowAddFlow(false)} />
          <div style={ps.modal} className="modal-sheet">
            <div style={ps.modalHandle} />
            <h3 style={ps.modalTitle}>Add Progress Photo</h3>

            <label style={ps.fieldLabel}>Pose Type</label>
            <div style={ps.poseGrid}>
              {POSE_TYPES.map(pose => (
                <button
                  key={pose}
                  onClick={() => setAddPose(pose)}
                  style={{
                    ...ps.poseBtn,
                    ...(addPose === pose ? ps.poseBtnActive : {}),
                  }}
                >
                  {pose}
                </button>
              ))}
            </div>

            <label style={ps.fieldLabel}>Weight</label>
            <div style={ps.weightDisplay}>{currentWeight} kg</div>

            {error && <div style={ps.errorMsg}>{error}</div>}

            <button
              onClick={() => fileInputRef.current?.click()}
              style={ps.captureBtn}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Take / Select Photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <button
              onClick={() => setShowAddFlow(false)}
              style={ps.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Full size photo viewer */}
      {viewPhoto && !showCompare && (
        <div style={ps.viewer} onClick={() => setViewPhoto(null)}>
          <div style={ps.viewerContent} onClick={e => e.stopPropagation()}>
            <div style={ps.viewerHeader}>
              <div>
                <div style={ps.viewerDate}>{viewPhoto.date}</div>
                <div style={ps.viewerMeta}>
                  {viewPhoto.poseType} &middot; {viewPhoto.bodyWeight}kg
                </div>
              </div>
              <div style={ps.viewerActions}>
                <button
                  onClick={() => handleDelete(viewPhoto.id)}
                  style={ps.viewerDeleteBtn}
                >
                  <Icon name="trash" size={18} />
                </button>
                <button onClick={() => setViewPhoto(null)} style={ps.viewerCloseBtn}>
                  <Icon name="x" size={20} />
                </button>
              </div>
            </div>
            <img src={viewPhoto.data} alt={viewPhoto.poseType} style={ps.viewerImg} />
            <div style={ps.viewerNav}>
              <button
                onClick={() => handleViewNav(-1)}
                style={{ ...ps.viewerNavBtn, opacity: viewIndex > 0 ? 1 : 0.3 }}
                disabled={viewIndex <= 0}
              >
                <Icon name="chevron-left" size={24} />
              </button>
              <span style={ps.viewerCount}>
                {viewIndex + 1} / {filteredPhotos.length}
              </span>
              <button
                onClick={() => handleViewNav(1)}
                style={{ ...ps.viewerNavBtn, opacity: viewIndex < filteredPhotos.length - 1 ? 1 : 0.3 }}
                disabled={viewIndex >= filteredPhotos.length - 1}
              >
                <Icon name="chevron-right" size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison view */}
      {showCompare && compareSelection.length === 2 && (
        <div style={ps.viewer} onClick={() => { setShowCompare(false); setCompareMode(false); setCompareSelection([]); }}>
          <div style={ps.compareContent} onClick={e => e.stopPropagation()}>
            <div style={ps.compareHeader}>
              <h3 style={ps.compareTitle}>Side by Side</h3>
              <button
                onClick={() => { setShowCompare(false); setCompareMode(false); setCompareSelection([]); }}
                style={ps.viewerCloseBtn}
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <div style={ps.compareImages}>
              {compareSelection.map((photo) => (
                <div key={photo.id} style={ps.comparePanel}>
                  <img src={photo.data} alt={photo.poseType} style={ps.compareImg} />
                  <div style={ps.compareLabel}>
                    <div style={ps.compareLabelDate}>{photo.date}</div>
                    <div style={ps.compareLabelWeight}>{photo.bodyWeight}kg</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ps: Record<string, React.CSSProperties> = {
  storageBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
    marginBottom: spacing.md,
  },
  storageText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  storageWarn: {
    fontSize: typography.sizes.sm,
    color: colors.warning,
    fontWeight: typography.weights.bold,
  },
  controls: {
    display: 'flex',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: `${spacing.md}px`,
    borderRadius: radii.lg,
    border: 'none',
    background: colors.primaryGradient,
    color: colors.text,
    fontWeight: typography.weights.black,
    fontSize: typography.sizes.lg,
    cursor: 'pointer',
  },
  compareBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: radii.lg,
    border: `1px solid ${colors.surfaceHover}`,
    background: colors.surface,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
    cursor: 'pointer',
  },
  compareBtnActive: {
    background: colors.infoSurface,
    border: `1px solid ${colors.infoBorder}`,
    color: colors.info,
  },
  filterRow: {
    display: 'flex',
    gap: 6,
    marginBottom: spacing.md,
    overflowX: 'auto',
    paddingBottom: 4,
  },
  filterBtn: {
    padding: `6px ${spacing.md}px`,
    borderRadius: radii.pill,
    border: `1px solid ${colors.surfaceHover}`,
    background: colors.surface,
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    whiteSpace: 'nowrap',
  },
  filterBtnActive: {
    background: colors.primarySurface,
    border: `1px solid ${colors.primaryBorder}`,
    color: colors.text,
  },
  compareBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    background: colors.infoSurface,
    border: `1px solid ${colors.infoBorder}`,
    marginBottom: spacing.md,
  },
  compareBarText: {
    fontSize: typography.sizes.md,
    color: colors.info,
    fontWeight: typography.weights.bold,
  },
  compareGoBtn: {
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: radii.md,
    border: 'none',
    background: colors.info,
    color: colors.text,
    fontWeight: typography.weights.black,
    fontSize: typography.sizes.md,
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacing.sm,
  },
  gridItem: {
    position: 'relative',
    aspectRatio: '3/4',
    borderRadius: radii.lg,
    overflow: 'hidden',
    cursor: 'pointer',
    border: '2px solid transparent',
  },
  gridItemSelected: {
    border: `2px solid ${colors.info}`,
  },
  gridImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: `${spacing.xs}px ${spacing.sm}px`,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  gridDate: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: typography.weights.bold,
  },
  gridPose: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: colors.info,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  empty: {
    textAlign: 'center',
    padding: `${spacing.xxxl}px 0`,
    color: colors.textTertiary,
  },
  emptyText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    margin: `${spacing.md}px 0 ${spacing.xs}px`,
  },
  emptyHint: {
    fontSize: typography.sizes.md,
    color: colors.textTertiary,
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 140,
  },
  modal: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
    borderRadius: '20px 20px 0 0',
    padding: `${spacing.xxl}px ${spacing.xl}px`,
    paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
    zIndex: 150,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.2)',
    margin: '0 auto 20px',
  },
  modalTitle: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.black,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text,
  },
  fieldLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    display: 'block',
    fontWeight: typography.weights.bold,
  },
  poseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  poseBtn: {
    padding: `${spacing.md}px ${spacing.sm}px`,
    borderRadius: radii.lg,
    border: '2px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.03)',
    color: colors.textSecondary,
    cursor: 'pointer',
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  poseBtnActive: {
    border: `2px solid ${colors.primary}`,
    background: 'rgba(255,59,48,0.1)',
    color: colors.text,
  },
  weightDisplay: {
    padding: spacing.md,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: radii.md,
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.lg,
  },
  errorMsg: {
    padding: spacing.md,
    borderRadius: radii.md,
    background: 'rgba(255,59,48,0.1)',
    border: `1px solid ${colors.primaryBorder}`,
    color: colors.primary,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  captureBtn: {
    width: '100%',
    padding: '16px',
    background: colors.primaryGradient,
    border: 'none',
    borderRadius: radii.xl,
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
    cursor: 'pointer',
    marginBottom: spacing.sm,
  },
  cancelBtn: {
    width: '100%',
    padding: spacing.md,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: radii.lg,
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    cursor: 'pointer',
  },
  viewer: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.95)',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  viewerContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },
  viewerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: `${spacing.md}px 0`,
  },
  viewerDate: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
    color: colors.text,
  },
  viewerMeta: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  viewerActions: {
    display: 'flex',
    gap: spacing.sm,
  },
  viewerDeleteBtn: {
    padding: spacing.sm,
    borderRadius: radii.md,
    border: `1px solid ${colors.primaryBorder}`,
    background: 'rgba(255,59,48,0.1)',
    color: colors.primary,
    cursor: 'pointer',
  },
  viewerCloseBtn: {
    padding: spacing.sm,
    borderRadius: radii.md,
    border: `1px solid rgba(255,255,255,0.15)`,
    background: 'rgba(255,255,255,0.05)',
    color: colors.text,
    cursor: 'pointer',
  },
  viewerImg: {
    width: '100%',
    maxHeight: '70vh',
    objectFit: 'contain',
    borderRadius: radii.lg,
  },
  viewerNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.md}px 0`,
  },
  viewerNavBtn: {
    padding: spacing.md,
    borderRadius: radii.md,
    border: 'none',
    background: 'rgba(255,255,255,0.05)',
    color: colors.text,
    cursor: 'pointer',
  },
  viewerCount: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  compareContent: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },
  compareHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.md}px 0`,
  },
  compareTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
    color: colors.text,
    margin: 0,
  },
  compareImages: {
    display: 'flex',
    gap: spacing.sm,
    flex: 1,
    minHeight: 0,
  },
  comparePanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  compareImg: {
    width: '100%',
    flex: 1,
    objectFit: 'contain',
    borderRadius: radii.lg,
    minHeight: 0,
  },
  compareLabel: {
    textAlign: 'center',
    padding: `${spacing.sm}px 0`,
  },
  compareLabelDate: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  compareLabelWeight: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
};
