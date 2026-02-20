import type { CSSProperties } from 'react';
import { colors, spacing, radii, typography } from './tokens';

/** Shared inline style helpers. Components should migrate to CSS Modules over time. */
export const S: Record<string, CSSProperties> = {
  container: { minHeight: '100vh', background: colors.backgroundGradient, color: colors.text, fontFamily: typography.fontFamily, padding: `0 ${spacing.lg}px` },
  overlay: { position: 'fixed', inset: 0, background: colors.overlay, backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, zIndex: 100 },
  celebrate: { position: 'fixed', inset: 0, background: colors.overlayDense, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  celebContent: { textAlign: 'center' },
  celebTitle: { fontSize: typography.sizes['6xl'], fontWeight: typography.weights.black, color: colors.primary, marginTop: spacing.sm },

  // Header
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${spacing.lg}px 0` },
  headerLeft: { display: 'flex', alignItems: 'center', gap: spacing.md },
  logo: { width: 48, height: 48, borderRadius: radii.xl, background: `linear-gradient(135deg, ${colors.primarySurface} 0%, rgba(255,59,48,0.05) 100%)`, border: `1px solid ${colors.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary },
  title: { fontSize: typography.sizes['4xl'], fontWeight: typography.weights.black, letterSpacing: '0.05em', margin: 0 },
  welcome: { fontSize: typography.sizes.md, color: colors.textSecondary, margin: '2px 0 0' },
  streak: { display: 'flex', alignItems: 'center', gap: 6, padding: `${spacing.sm}px ${spacing.xl - 6}px`, borderRadius: radii.pill, background: colors.warningSurface, border: `1px solid ${colors.warningBorder}`, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.warning },

  // Week badge
  weekBadge: { margin: `0 0 ${spacing.md}px`, padding: `${spacing.sm + 2}px ${spacing.xl - 6}px`, borderRadius: radii.lg, background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, color: '#999', fontSize: typography.sizes.md, textAlign: 'center' },

  // Nav
  nav: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: spacing.sm, marginBottom: spacing.lg },
  navBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: `${spacing.md}px ${spacing.sm}px`, borderRadius: radii.lg, background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, color: colors.textSecondary, cursor: 'pointer', fontWeight: typography.weights.bold, fontSize: typography.sizes.base, transition: 'all 0.2s' },
  navActive: { background: colors.primarySurface, border: `1px solid ${colors.primaryBorder}`, color: colors.text },
  navQuick: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: `${spacing.md}px ${spacing.xl}px`, borderRadius: radii.lg, background: colors.primaryGradient, border: 'none', color: colors.text, cursor: 'pointer', fontWeight: typography.weights.black, fontSize: typography.sizes.base, boxShadow: `0 4px 15px ${colors.primaryGlow}` },

  // Main
  main: { paddingBottom: spacing.xxxl },

  // Nutrition bar
  nutritionBar: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: spacing.lg },
  nutritionItem: { display: 'flex', alignItems: 'center', gap: 10, padding: `${spacing.md}px ${spacing.xl - 6}px`, borderRadius: radii.xl, background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, cursor: 'pointer' },
  nutritionIcon: { fontSize: '1.2rem' },
  nutritionValue: { flex: 1, fontWeight: typography.weights.black, fontSize: typography.sizes.xl },
  addBtn: { width: 30, height: 30, borderRadius: radii.md, border: 'none', background: colors.surfaceHover, color: colors.text, cursor: 'pointer', fontWeight: typography.weights.black, fontSize: '1.1rem' },

  // Tabs
  tabs: { display: 'flex', gap: spacing.sm, marginBottom: spacing.lg, overflowX: 'auto', paddingBottom: 4 },
  tab: { padding: `${spacing.sm + 2}px ${spacing.lg}px`, borderRadius: radii.pill, border: `1px solid ${colors.surfaceHover}`, background: colors.surface, color: colors.textSecondary, cursor: 'pointer', fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, whiteSpace: 'nowrap', transition: 'all 0.2s' },
  tabActive: { background: colors.primarySurface, border: `1px solid ${colors.primaryBorder}`, color: colors.text },
  tabSettings: { width: 40, height: 40, borderRadius: radii.pill, border: `1px solid ${colors.surfaceHover}`, background: colors.surface, color: colors.textSecondary, cursor: 'pointer', fontSize: '1rem', flexShrink: 0 },

  // Progress bar
  progBar: { marginBottom: spacing.lg, padding: spacing.lg, borderRadius: radii.xxl, background: colors.surface, border: `1px solid ${colors.surfaceBorder}` },
  progHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progLabel: { fontSize: typography.sizes.sm, color: colors.textTertiary, fontWeight: typography.weights.black, letterSpacing: '0.05em' },
  progPct: { fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.text },
  progTrack: { height: 8, background: colors.surfaceHover, borderRadius: 4, overflow: 'hidden' },
  progFill: { height: '100%', background: colors.primaryGradient, borderRadius: 4, transition: 'width 0.3s ease' },

  // Rest timer
  restBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderRadius: radii.xxl, background: 'rgba(255,149,0,0.1)', border: `1px solid ${colors.warningBorder}`, marginBottom: spacing.lg },
  restLabel: { fontSize: typography.sizes.sm, color: colors.warning, fontWeight: typography.weights.black, letterSpacing: '0.05em' },
  restTime: { fontSize: typography.sizes['6xl'], fontWeight: typography.weights.black, color: colors.text },
  skipBtn: { padding: `${spacing.sm + 2}px ${spacing.lg}px`, borderRadius: radii.md, border: 'none', background: 'rgba(255,255,255,0.1)', color: colors.text, cursor: 'pointer', fontWeight: typography.weights.bold, fontSize: typography.sizes.base },

  // Exercise list
  exList: { display: 'flex', flexDirection: 'column', gap: spacing.md },
  exCard: { padding: spacing.lg, borderRadius: 18, background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, transition: 'all 0.2s' },
  exDone: { background: colors.successSurface, border: `1px solid ${colors.successBorder}` },
  exInProgress: { borderLeft: '3px solid rgba(52,199,89,0.5)' },
  setCountAnimate: { animation: 'setCountPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' },
  progressDots: { display: 'flex', gap: 4, justifyContent: 'center', marginTop: 4 },
  progressDot: { width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', transition: 'all 0.2s ease' },
  progressDotFilled: { background: colors.success, animation: 'dotFill 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both' },
  exFinalFlash: { animation: 'greenFlash 0.35s ease, cardCompleteSlide 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' },
  exHeader: { display: 'flex', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.md },
  exTags: { display: 'flex', gap: spacing.sm, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' },
  muscleTag: { fontSize: '0.6rem', fontWeight: typography.weights.black, padding: `4px 10px`, borderRadius: radii.sm, background: colors.surfaceBorder, color: colors.textSecondary, letterSpacing: '0.03em' },
  doneTag: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6rem', fontWeight: typography.weights.black, padding: `4px 10px`, borderRadius: radii.sm, background: `rgba(52,199,89,0.15)`, color: colors.success },
  exName: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, margin: 0 },
  exActions: { display: 'flex', gap: 6 },
  historyBtn: { padding: spacing.sm, borderRadius: radii.md, border: `1px solid ${colors.surfaceHover}`, background: colors.surface, color: colors.textSecondary, cursor: 'pointer' },
  warmupBtn: { padding: spacing.sm, borderRadius: radii.md, border: `1px solid ${colors.warningBorder}`, background: 'rgba(255,149,0,0.08)', color: colors.warning, cursor: 'pointer' },
  warmupBtnActive: { padding: spacing.sm, borderRadius: radii.md, border: '1px solid rgba(255,149,0,0.4)', background: colors.warningSurface, color: colors.warning, cursor: 'pointer' },
  editBtn: { padding: spacing.sm, borderRadius: radii.md, border: `1px solid ${colors.infoBorder}`, background: 'rgba(59,130,246,0.08)', color: colors.info, cursor: 'pointer' },
  swapBtn: { padding: spacing.sm, borderRadius: radii.md, border: `1px solid ${colors.surfaceHover}`, background: colors.surface, color: colors.textSecondary, cursor: 'pointer' },
  playBtn: { padding: spacing.sm, borderRadius: radii.md, border: `1px solid rgba(255,59,48,0.25)`, background: 'rgba(255,59,48,0.08)', color: colors.primary, cursor: 'pointer' },

  // Warmup
  warmupBox: { marginTop: spacing.md, padding: spacing.xl - 6, borderRadius: radii.lg, background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)' },
  warmupTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.black, color: colors.warning, marginBottom: 10, letterSpacing: '0.05em' },
  warmupGrid: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  warmupRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: typography.sizes.md, color: '#ddd' },
  warmupLabel: { color: colors.warning, fontWeight: typography.weights.bold },
  warmupVal: { fontWeight: typography.weights.bold },

  // Stats grid
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.xl - 6 },
  stat: { padding: `${spacing.sm + 2}px ${spacing.sm}px`, borderRadius: radii.lg, background: colors.surface, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' },
  statLabel: { fontSize: typography.sizes.xs, color: colors.textTertiary, fontWeight: typography.weights.black, marginBottom: 4, letterSpacing: '0.03em' },
  statVal: { fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.text },
  statValRed: { fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.primary },
  statValGreen: { fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.success },

  // Buttons
  completeBtn: { width: '100%', padding: '14px', borderRadius: radii.xl, border: 'none', background: colors.primaryGradient, color: colors.text, cursor: 'pointer', fontWeight: typography.weights.black, fontSize: typography.sizes.lg, boxShadow: `0 4px 15px ${colors.primaryGlow}` },
  completeBtnOff: { background: 'rgba(255,255,255,0.05)', color: colors.textTertiary, cursor: 'not-allowed', boxShadow: 'none' },
  addExerciseBtn: { width: '100%', padding: '14px', borderRadius: radii.xl, border: '1px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)', color: colors.textSecondary, cursor: 'pointer', fontWeight: typography.weights.bold, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, fontSize: typography.sizes.lg },
  finishBtn: { width: '100%', padding: '16px', borderRadius: radii.xxl, border: 'none', background: colors.successGradient, color: colors.text, cursor: 'pointer', fontWeight: typography.weights.black, fontSize: typography.sizes.xl, marginTop: spacing.lg, boxShadow: `0 4px 15px ${colors.successGlow}` },

  // Modals
  modal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: radii.pill, width: '100%', maxWidth: 420, padding: spacing.xl, border: `1px solid ${colors.surfaceHover}` },
  modalTitle: { fontSize: typography.sizes['4xl'], fontWeight: typography.weights.black, margin: '0 0 4px', textAlign: 'center' },
  modalSub: { fontSize: typography.sizes.md, color: colors.textSecondary, margin: '0 0 16px', textAlign: 'center' },

  // Quick workout list
  quickList: { display: 'flex', flexDirection: 'column', gap: 10 },
  quickCard: { display: 'flex', flexDirection: 'column', padding: spacing.xl - 6, background: colors.surface, border: `1px solid ${colors.surfaceHover}`, borderRadius: radii.xl, cursor: 'pointer', color: colors.text, textAlign: 'left', transition: 'all 0.2s' },
  quickCardExpanded: { background: 'rgba(255,255,255,0.05)', border: `1px solid ${colors.primaryBorder}` },
  quickCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  quickName: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  quickMeta: { fontSize: typography.sizes.base, color: colors.textSecondary, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  quickDiffBadge: { padding: `2px ${spacing.sm}px`, borderRadius: radii.sm, fontSize: typography.sizes.xs, fontWeight: typography.weights.black, letterSpacing: '0.05em', textTransform: 'uppercase' },
  quickCustomBadge: { fontSize: typography.sizes.xs, color: colors.info, fontWeight: typography.weights.bold },
  quickChevron: { transition: 'transform 0.2s ease', color: colors.textSecondary, flexShrink: 0 },
  quickExpandedBody: { marginTop: spacing.md, paddingTop: spacing.md, borderTop: `1px solid ${colors.surfaceHover}` },
  quickExRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${spacing.sm}px 0`, gap: spacing.sm },
  quickExName: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, flex: 1, minWidth: 0 },
  quickExDetail: { fontSize: typography.sizes.sm, color: colors.textSecondary, whiteSpace: 'nowrap' },
  quickExControls: { display: 'flex', alignItems: 'center', gap: 4 },
  quickAdjustBtn: { width: 28, height: 28, borderRadius: radii.sm, border: 'none', background: colors.surfaceHover, color: colors.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  quickRemoveBtn: { width: 28, height: 28, borderRadius: radii.sm, border: 'none', background: 'rgba(255,59,48,0.15)', color: colors.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  quickStartBtn: { width: '100%', padding: `${spacing.md}px`, borderRadius: radii.lg, border: 'none', background: colors.primaryGradient, color: colors.text, cursor: 'pointer', fontWeight: typography.weights.black, fontSize: typography.sizes.xl, marginTop: spacing.md, boxShadow: `0 4px 15px ${colors.primaryGlow}` },
  quickResetBtn: { width: '100%', padding: spacing.sm, background: 'transparent', border: 'none', color: colors.textTertiary, fontSize: typography.sizes.sm, cursor: 'pointer', marginTop: spacing.sm, textDecoration: 'underline' },
  quickAddExBtn: { width: '100%', padding: `${spacing.md}px`, borderRadius: radii.xl, border: '1px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)', color: colors.textSecondary, cursor: 'pointer', fontWeight: typography.weights.bold, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, fontSize: typography.sizes.base, marginTop: spacing.sm },

  // Deload
  deloadBox: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: radii.pill, padding: spacing.xxl, textAlign: 'center', maxWidth: 340, border: `1px solid ${colors.surfaceHover}` },
  deloadTitle: { fontSize: typography.sizes['4xl'], fontWeight: typography.weights.black, margin: '12px 0 8px' },
  deloadText: { fontSize: typography.sizes.lg, color: colors.textSecondary, marginBottom: spacing.md },
  deloadList: { textAlign: 'left', color: '#aaa', fontSize: typography.sizes.md, margin: '0 0 16px 16px', lineHeight: 1.6 },
  deloadBtn: { width: '100%', padding: spacing.xl - 6, background: 'linear-gradient(135deg, #FF9500 0%, #FFAA33 100%)', border: 'none', borderRadius: radii.lg, color: '#000', fontSize: typography.sizes.xl, fontWeight: typography.weights.black, cursor: 'pointer', marginBottom: spacing.sm },
  deloadSkip: { width: '100%', padding: spacing.md, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: radii.lg, color: colors.textSecondary, fontSize: typography.sizes.md, cursor: 'pointer' },

  // Edit modal
  editModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: radii.pill, width: '100%', maxWidth: 340, padding: spacing.xl, border: `1px solid ${colors.surfaceHover}` },
  editTitle: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.bold, margin: '0 0 16px', textAlign: 'center' },
  editField: { marginBottom: spacing.lg },
  editLabel: { fontSize: typography.sizes.base, color: colors.textSecondary, marginBottom: spacing.sm, display: 'block' },
  editControls: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  editBtn2: { width: 44, height: 44, borderRadius: radii.lg, border: 'none', background: colors.surfaceHover, color: colors.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  editValue: { fontSize: typography.sizes['6xl'], fontWeight: typography.weights.black, minWidth: 60, textAlign: 'center' },
  editDone: { width: '100%', padding: spacing.xl - 6, background: colors.primaryGradient, border: 'none', borderRadius: radii.lg, color: colors.text, fontSize: typography.sizes.xl, fontWeight: typography.weights.black, cursor: 'pointer', marginTop: spacing.sm },
  editRemove: { width: '100%', padding: spacing.md, background: 'transparent', border: '1px solid rgba(255,59,48,0.4)', borderRadius: radii.lg, color: colors.primary, fontSize: typography.sizes.md, fontWeight: typography.weights.medium, cursor: 'pointer', marginTop: 10 },

  // Nutrition modal
  nutritionModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: radii.pill, width: '100%', maxWidth: 400, padding: spacing.xl, maxHeight: '85vh', overflowY: 'auto', border: `1px solid ${colors.surfaceHover}` },
  nutritionTitle: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.black, margin: '0 0 16px', textAlign: 'center' },
  nutritionSection: { marginBottom: spacing.xl },
  nutritionSectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  nutritionProgress: { fontSize: typography.sizes.md, color: colors.textSecondary },
  waterTrack: { display: 'flex', gap: 6, marginBottom: spacing.md },
  waterGlass: { flex: 1, height: 36, borderRadius: spacing.sm, cursor: 'pointer', transition: 'all 0.2s' },
  addWaterBtn: { width: '100%', padding: spacing.md, background: colors.infoSurface, border: `1px solid ${colors.infoBorder}`, borderRadius: radii.md, color: colors.info, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, cursor: 'pointer' },
  proteinBar: { height: 10, background: colors.surfaceHover, borderRadius: 5, marginBottom: spacing.lg, overflow: 'hidden' },
  proteinFill: { height: '100%', background: colors.successGradient, borderRadius: 5, transition: 'width 0.3s' },
  proteinGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 },
  proteinBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: spacing.md, background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: radii.lg, cursor: 'pointer', color: colors.text },
  proteinBtnIcon: { fontSize: '1.5rem', marginBottom: 4 },
  proteinBtnName: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  proteinBtnVal: { fontSize: typography.sizes.lg, fontWeight: typography.weights.black, color: colors.success, marginTop: 4 },
  nutritionClose: { width: '100%', padding: spacing.xl - 6, background: colors.primaryGradient, border: 'none', borderRadius: radii.lg, color: colors.text, fontSize: typography.sizes.xl, fontWeight: typography.weights.black, cursor: 'pointer', marginTop: spacing.sm },

  // History modal
  historyModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: radii.pill, width: '100%', maxWidth: 400, padding: spacing.xl, border: `1px solid ${colors.surfaceHover}` },
  historyTitle: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.black, margin: '0 0 4px', textAlign: 'center' },
  historySub: { fontSize: typography.sizes.md, color: colors.textSecondary, margin: '0 0 16px', textAlign: 'center' },
  historyList: { marginTop: spacing.lg },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: typography.sizes.md },
  historyWeight: { fontWeight: typography.weights.black, color: colors.primary },
  historyE1rm: { color: colors.textTertiary, fontSize: typography.sizes.base },
  historyClose: { width: '100%', padding: spacing.xl - 6, background: colors.primaryGradient, border: 'none', borderRadius: radii.lg, color: colors.text, fontSize: typography.sizes.xl, fontWeight: typography.weights.black, cursor: 'pointer', marginTop: spacing.lg },

  // Measurements modal
  measureModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: radii.pill, width: '100%', maxWidth: 400, padding: spacing.xl, border: `1px solid ${colors.surfaceHover}` },
  measureTitle: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.black, margin: '0 0 4px', textAlign: 'center' },
  measureSub: { fontSize: typography.sizes.md, color: colors.textSecondary, margin: '0 0 16px', textAlign: 'center' },
  measureGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: spacing.md, marginBottom: spacing.lg },
  measureField: { display: 'flex', flexDirection: 'column', gap: 6 },
  measureLabel: { fontSize: typography.sizes.base, color: colors.textSecondary },
  measureInput: { padding: spacing.md, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: radii.md, color: colors.text, fontSize: typography.sizes.xl },
  measureSave: { width: '100%', padding: spacing.xl - 6, background: colors.successGradient, border: 'none', borderRadius: radii.lg, color: colors.text, fontSize: typography.sizes.xl, fontWeight: typography.weights.black, cursor: 'pointer', marginBottom: spacing.sm },
  measureCancel: { width: '100%', padding: spacing.md, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: radii.lg, color: colors.textSecondary, fontSize: typography.sizes.md, cursor: 'pointer' },
  measureSummary: { display: 'flex', justifyContent: 'space-between', fontSize: typography.sizes.md, color: colors.textSecondary, marginTop: spacing.sm },

  // Confirm dialog
  confirmBox: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: radii.pill, padding: spacing.xxl, textAlign: 'center', maxWidth: 320, border: `1px solid ${colors.surfaceHover}` },
  confirmTitle: { fontSize: typography.sizes['4xl'], fontWeight: typography.weights.black, margin: '12px 0 8px' },
  confirmText: { fontSize: typography.sizes.lg, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 1.5 },
  confirmBtns: { display: 'flex', gap: 10 },
  keepBtn: { flex: 1, padding: spacing.xl - 6, background: colors.surfaceHover, border: 'none', borderRadius: radii.lg, color: colors.text, fontWeight: typography.weights.bold, cursor: 'pointer' },
  endBtn: { flex: 1, padding: spacing.xl - 6, background: colors.primaryGradient, border: 'none', borderRadius: radii.lg, color: colors.text, fontWeight: typography.weights.bold, cursor: 'pointer' },

  // Video modal
  videoBox: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: radii.pill, padding: spacing.xl, textAlign: 'center', maxWidth: 360, border: `1px solid ${colors.surfaceHover}` },
  thumb: { width: '100%', borderRadius: radii.lg, marginBottom: spacing.lg },
  videoTitle: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.bold, margin: '0 0 16px' },
  ytBtn: { display: 'inline-block', padding: `${spacing.xl - 6}px ${spacing.xxl}px`, background: colors.youtube, borderRadius: radii.lg, color: colors.text, textDecoration: 'none', fontWeight: typography.weights.bold },

  // Swap modal
  swapBox: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: radii.pill, padding: spacing.xl, width: '100%', maxWidth: 400, maxHeight: '70vh', overflow: 'auto', border: `1px solid ${colors.surfaceHover}` },
  swapTitle: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.black, margin: '0 0 4px' },
  swapSub: { fontSize: typography.sizes.md, color: colors.textSecondary, margin: '0 0 16px' },
  swapList: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  swapItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl - 6, background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: radii.lg, color: colors.text, cursor: 'pointer', textAlign: 'left' },
  swapItemName: { fontWeight: typography.weights.bold, fontSize: typography.sizes.xl },
  swapItemMeta: { fontSize: typography.sizes.base, color: colors.textSecondary, marginTop: 2 },

  // RPE modal
  rpeModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: radii.pill, width: '100%', maxWidth: 360, padding: spacing.xxl, textAlign: 'center', border: `1px solid ${colors.surfaceHover}` },
  rpeTitle: { fontSize: typography.sizes['4xl'], fontWeight: typography.weights.black, margin: '0 0 4px', color: colors.success },
  rpeSubtitle: { fontSize: typography.sizes.lg, color: colors.textSecondary, margin: '0 0 12px' },
  rpeQuestion: { fontSize: typography.sizes['3xl'], margin: '0 0 16px', fontWeight: typography.weights.medium },
  rpeGrid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: spacing.sm, marginBottom: spacing.lg },
  rpeBtn: { padding: '12px 4px', border: 'none', borderRadius: radii.lg, cursor: 'pointer', color: colors.text },
  rpeNum: { fontSize: typography.sizes['6xl'], fontWeight: typography.weights.black },
  rpeLabel: { fontSize: '0.5rem', marginTop: 4, opacity: 0.9 },
  rpeHint: { fontSize: typography.sizes.base, color: colors.textTertiary, margin: '0 0 16px' },
  rpeCancel: { padding: `${spacing.sm + 2}px ${spacing.xxl}px`, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: radii.md, color: colors.textSecondary, fontSize: typography.sizes.md, cursor: 'pointer' },

  // Add exercise modal
  addExModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: radii.pill, width: '100%', maxWidth: 420, padding: spacing.xl, maxHeight: '80vh', overflowY: 'auto', border: `1px solid ${colors.surfaceHover}` },
  addExTitle: { fontSize: typography.sizes['4xl'], fontWeight: typography.weights.black, margin: '0 0 4px', textAlign: 'center' },
  addExSub: { fontSize: typography.sizes.md, color: colors.textSecondary, margin: '0 0 16px', textAlign: 'center' },
  addExList: { display: 'flex', flexDirection: 'column', gap: spacing.sm, maxHeight: '50vh', overflowY: 'auto' },
  addExItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl - 6, background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: radii.lg, cursor: 'pointer', textAlign: 'left', color: colors.text },
  addExName: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  addExMeta: { fontSize: typography.sizes.base, color: colors.textSecondary, marginTop: 2 },
  addExArrow: { fontSize: '1.25rem', color: colors.success, fontWeight: typography.weights.black },
  addExCancel: { width: '100%', marginTop: spacing.lg, padding: spacing.xl - 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: radii.lg, color: colors.textSecondary, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, cursor: 'pointer' },

  // Templates modal
  templatesModal: { background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 100%)', borderRadius: radii.pill, width: '100%', maxWidth: 420, padding: spacing.xl, maxHeight: '85vh', overflowY: 'auto', border: `1px solid ${colors.surfaceHover}` },
  templatesTitle: { fontSize: typography.sizes['4xl'], fontWeight: typography.weights.black, margin: '0 0 4px', textAlign: 'center' },
  templatesSub: { fontSize: typography.sizes.md, color: colors.textSecondary, margin: '0 0 16px', textAlign: 'center' },
  templatesList: { display: 'flex', flexDirection: 'column', gap: 10 },
  templateCard: { display: 'flex', alignItems: 'center', padding: spacing.lg, background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: radii.xl, cursor: 'pointer', textAlign: 'left', color: colors.text },
  templateInfo: { flex: 1 },
  templateName: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.black, marginBottom: 4 },
  templateDesc: { fontSize: typography.sizes.md, color: colors.textSecondary, marginBottom: 4 },
  templateDays: { fontSize: typography.sizes.base, color: colors.primary, fontWeight: typography.weights.bold },
  templateArrow: { fontSize: '1.25rem', color: colors.primary, marginLeft: spacing.md },
  templatesCancel: { width: '100%', marginTop: spacing.lg, padding: spacing.xl - 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: radii.lg, color: colors.textSecondary, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, cursor: 'pointer' },

  // Quick workout screens
  iconBtn: { padding: 10, background: colors.surfaceHover, border: 'none', borderRadius: radii.md, color: colors.text, cursor: 'pointer' },
  readyScreen: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl },
  readyTitle: { fontSize: typography.sizes['5xl'], fontWeight: typography.weights.black, marginBottom: spacing.xxxl },
  readyCircle: { width: 180, height: 180, borderRadius: '50%', border: `6px solid ${colors.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl, animation: 'pulse 1s infinite' },
  readyCount: { fontSize: '5rem', fontWeight: typography.weights.black, color: colors.primary },
  readyText: { fontSize: typography.sizes['6xl'], fontWeight: typography.weights.black, color: colors.primary, marginBottom: spacing.xxxl },
  readyCancel: { padding: `${spacing.md}px ${spacing.xxxl}px`, background: colors.surfaceHover, border: 'none', borderRadius: radii.md, color: colors.textSecondary, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, cursor: 'pointer' },
  quickActive: { minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: spacing.xl },
  qaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  qaTitle: { fontSize: typography.sizes['4xl'], fontWeight: typography.weights.black, margin: 0 },
  qaDots: { display: 'flex', justifyContent: 'center', gap: 6, marginBottom: spacing.xxxl },
  qaDot: { width: 10, height: 10, borderRadius: '50%' },
  qaMain: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  qaCircle: { width: 200, height: 200, borderRadius: '50%', border: '6px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },
  qaTime: { fontSize: '4rem', fontWeight: typography.weights.black },
  qaLabel: { fontSize: typography.sizes['3xl'], color: colors.textSecondary, fontWeight: typography.weights.bold },
  qaExName: { fontSize: typography.sizes['5xl'], fontWeight: typography.weights.black, textAlign: 'center', margin: 0 },

  // Onboarding
  obContainer: { minHeight: '100vh', background: colors.backgroundGradient, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl, color: colors.text },
  obDots: { display: 'flex', gap: 6, marginBottom: spacing.xxxl },
  obDot: { width: 8, height: 8, borderRadius: '50%' },
  obStep: { textAlign: 'center', maxWidth: 340, width: '100%' },
  obIcon: { width: 80, height: 80, borderRadius: '50%', background: colors.primaryGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 8px 30px ${colors.primaryGlow}` },
  obTitle: { fontSize: typography.sizes.hero, fontWeight: typography.weights.black, marginBottom: spacing.md },
  obStepTitle: { fontSize: typography.sizes['5xl'], fontWeight: typography.weights.black, marginBottom: spacing.sm },
  obText: { fontSize: typography.sizes.xl, color: colors.textSecondary, marginBottom: spacing.xxl, lineHeight: 1.6 },
  obSubtext: { fontSize: typography.sizes.lg, color: colors.textTertiary, marginBottom: spacing.lg },
  obBtn: { display: 'inline-block', padding: `${spacing.xl - 6}px ${spacing.xxxl}px`, background: colors.primaryGradient, border: 'none', borderRadius: radii.xl, color: colors.text, fontSize: typography.sizes.xl, fontWeight: typography.weights.black, cursor: 'pointer', marginTop: spacing.sm, boxShadow: `0 4px 15px ${colors.primaryGlow}` },
  obInput: { width: '100%', padding: spacing.xl - 6, background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: radii.xl, color: colors.text, fontSize: typography.sizes['3xl'], textAlign: 'center', marginBottom: spacing.lg, outline: 'none' },
  obStats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: spacing.md, marginBottom: spacing.xl },
  obLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary, display: 'block', marginBottom: 6, fontWeight: typography.weights.bold },
  obInputSm: { width: '100%', padding: spacing.md, background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: radii.lg, color: colors.text, fontSize: typography.sizes['4xl'], textAlign: 'center', outline: 'none' },
  obOpts: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: spacing.lg },
  obOpt: { padding: spacing.lg, background: colors.surface, border: `2px solid ${colors.surfaceHover}`, borderRadius: radii.xl, color: colors.text, cursor: 'pointer', textAlign: 'left' },
  obOptActive: { border: `2px solid ${colors.primary}`, background: 'rgba(255,59,48,0.1)' },
  obOptText: { fontWeight: typography.weights.bold, display: 'block' },
  obOptSub: { fontSize: typography.sizes.base, color: colors.textSecondary, marginTop: 4, display: 'block' },
  obOptRow: { display: 'flex', gap: spacing.md, marginBottom: spacing.lg },
  obOptSmall: { flex: 1, padding: spacing.lg, background: colors.surface, border: `2px solid ${colors.surfaceHover}`, borderRadius: radii.xl, color: colors.text, cursor: 'pointer', fontWeight: typography.weights.bold },
  dayPicker: { display: 'flex', justifyContent: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  dayBtn: { width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', color: colors.text, fontSize: typography.sizes['6xl'], fontWeight: typography.weights.black, cursor: 'pointer' },
  dayBtnActive: { border: `2px solid ${colors.primary}`, background: 'rgba(255,59,48,0.1)' },

  // Dashboard
  sumGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: spacing.lg },
  sumCard: { background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: radii.xl, padding: spacing.xl - 6, textAlign: 'center' },
  sumLabel: { fontSize: '0.6rem', color: colors.textTertiary, marginBottom: 4, fontWeight: typography.weights.black, letterSpacing: '0.03em' },
  sumVal: { fontSize: typography.sizes['6xl'], fontWeight: typography.weights.black, color: colors.primary },
  weekCard: { padding: spacing.md, background: 'rgba(255,149,0,0.1)', border: `1px solid rgba(255,149,0,0.25)`, borderRadius: radii.lg, fontSize: typography.sizes.lg, textAlign: 'center', marginBottom: spacing.lg, color: colors.warning, fontWeight: typography.weights.medium },
  weekWarning: { color: colors.primary },
  chartBox: { background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.lg },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  chartTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text, margin: 0 },
  chartLabels: { display: 'flex', justifyContent: 'space-between', fontSize: typography.sizes.sm, color: colors.textTertiary, marginTop: spacing.sm },
  addMeasureBtn: { padding: `6px ${spacing.md}px`, background: colors.infoSurface, border: 'none', borderRadius: spacing.sm, color: colors.info, fontSize: typography.sizes.base, fontWeight: typography.weights.bold, cursor: 'pointer' },
  emptyText: { fontSize: typography.sizes.lg, color: colors.textTertiary, textAlign: 'center', padding: '24px 0' },
  prGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginTop: spacing.md },
  prItem: { padding: spacing.md, background: colors.surface, borderRadius: radii.md, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' },
  prName: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: 4 },
  prWeight: { fontSize: typography.sizes['5xl'], fontWeight: typography.weights.black, color: colors.primary },
  nutritionCards: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: spacing.md, marginTop: spacing.md },
  nutritionCard: { background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: radii.xl, padding: spacing.xl - 6, cursor: 'pointer' },
  nutritionCardHeader: { display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  nutritionCardTitle: { fontSize: typography.sizes.md, color: colors.textSecondary },
  nutritionCardValue: { fontSize: typography.sizes['7xl'], fontWeight: typography.weights.black },
  nutritionCardUnit: { fontSize: typography.sizes.xl, color: colors.textTertiary, fontWeight: typography.weights.normal },
  miniProgress: { height: 6, background: colors.surfaceHover, borderRadius: 3, marginTop: spacing.sm, marginBottom: spacing.md, overflow: 'hidden' },
  miniProgressFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
  nutritionCardBtn: { width: '100%', padding: spacing.sm, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.base, fontWeight: typography.weights.bold, cursor: 'pointer' },
  recentList: { display: 'flex', flexDirection: 'column', gap: spacing.sm, marginTop: spacing.md },
  recentItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, background: colors.surface, borderRadius: radii.md },
  recentDay: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  recentDate: { fontSize: typography.sizes.base, color: colors.textSecondary, marginTop: 2 },
  recentStats: { display: 'flex', gap: spacing.lg, fontSize: typography.sizes.lg },
  recentPct: { color: colors.success, fontWeight: typography.weights.bold },
  recentVol: { color: colors.textSecondary },
  profileBox: { background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: radii.xl, padding: spacing.lg },
  profileGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: spacing.md, marginTop: spacing.md },
  profileItem: { display: 'flex', justifyContent: 'space-between', fontSize: typography.sizes.lg, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  profileLabel: { color: colors.textTertiary },
  demoRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginTop: spacing.lg, paddingTop: spacing.md, borderTop: `1px solid ${colors.surfaceBorder}` },
  demoLabel: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  demoHint: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 4 },
  demoToggle: { width: 56, height: 30, borderRadius: 999, border: `1px solid ${colors.surfaceBorder}`, background: colors.surfaceHover, padding: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', transition: 'all 0.2s ease' },
  demoToggleOn: { background: colors.primary, border: `1px solid ${colors.primary}` },
  demoKnob: { width: 24, height: 24, borderRadius: '50%', background: colors.text, transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' },
  demoKnobOn: { background: '#fff', transform: 'translateX(26px)' },

  // ─── Bottom Navigation ────────────────────────────────────────────────────
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    background: 'rgba(10,10,10,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: 8,
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    zIndex: 50,
  },
  bottomNavTab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: '6px 16px',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    fontSize: '0.6rem',
    fontWeight: typography.weights.bold,
    letterSpacing: '0.02em',
    minWidth: 64,
    minHeight: 44,
    transition: 'color 0.2s ease, transform 0.2s ease',
    WebkitTapHighlightColor: 'transparent',
  },
  bottomNavTabActive: {
    color: colors.primary,
  },
  bottomNavLabel: {
    marginTop: 2,
    fontSize: '0.6rem',
    fontWeight: typography.weights.bold,
    letterSpacing: '0.03em',
  },
  bottomNavSpacer: {
    height: 'calc(68px + env(safe-area-inset-bottom, 0px))',
  },

  // ─── PR Celebration ───────────────────────────────────────────────────────
  prCelebrate: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.95)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  prCelebrateContent: {
    textAlign: 'center',
    animation: 'prBurst 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
  prCelebrateEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  prCelebrateTitle: {
    fontSize: '2rem',
    fontWeight: typography.weights.black,
    color: colors.primary,
    marginBottom: 8,
    animation: 'prGlow 1.5s ease-in-out infinite',
    letterSpacing: '0.1em',
  },
  prParticleContainer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },

  // ─── Set Complete Animation ───────────────────────────────────────────────
  setCompleteTick: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: colors.successGradient,
    color: '#fff',
    animation: 'setComplete 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both, greenFlash 0.6s ease both',
  },

  // ─── Rest Timer Ring ──────────────────────────────────────────────────────
  restRing: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'restRingPulse 2s ease-in-out infinite',
  },

  // ─── Pull-to-Refresh ─────────────────────────────────────────────────────
  pullRefresh: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    transition: 'height 0.2s ease',
  },
  pullRefreshSpinner: {
    animation: 'pullRefreshSpin 0.8s linear infinite',
    color: colors.primary,
  },

  // ─── Swipe Indicator ──────────────────────────────────────────────────────
  swipeIndicator: {
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
    padding: '8px 0',
    marginBottom: 8,
  },
  swipeDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },

  // ─── Profile Screen ──────────────────────────────────────────────────────
  profileScreen: {
    paddingTop: spacing.lg,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: colors.primaryGradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: `0 8px 30px ${colors.primaryGlow}`,
  },
  profileName: {
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  profileSub: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    textTransform: 'capitalize',
  },
  profileSection: {
    marginBottom: spacing.lg,
  },
  profileSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.black,
    color: colors.textTertiary,
    letterSpacing: '0.1em',
    marginBottom: spacing.sm,
    paddingLeft: 4,
  },
  profileCard: {
    background: colors.surface,
    border: `1px solid ${colors.surfaceBorder}`,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  profileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.lg}px ${spacing.lg}px`,
    minHeight: 52,
    borderBottom: `1px solid ${colors.surfaceBorder}`,
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  profileRowLast: {
    borderBottom: 'none',
  },
  profileRowLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.medium,
  },
  profileRowValue: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.sizes.lg,
  },
  profileRowDanger: {
    color: colors.primary,
  },

  // ─── Upgrade Card ─────────────────────────────────────────────────────────
  upgradeCard: {
    background: `linear-gradient(135deg, rgba(255,59,48,0.12) 0%, rgba(255,107,71,0.08) 100%)`,
    border: `1px solid ${colors.primaryBorder}`,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  upgradeTitle: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.black,
    color: colors.text,
    marginBottom: 4,
  },
  upgradeSub: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  upgradeFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    padding: '6px 0',
  },
  upgradeFeatureIcon: {
    color: colors.primary,
    flexShrink: 0,
  },
  upgradeBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: radii.xl,
    border: 'none',
    background: colors.primaryGradient,
    color: colors.text,
    cursor: 'pointer',
    fontWeight: typography.weights.black,
    fontSize: typography.sizes.xl,
    marginTop: spacing.lg,
    boxShadow: `0 4px 15px ${colors.primaryGlow}`,
    minHeight: 48,
  },

  // ─── Profile Edit Modal ───────────────────────────────────────────────────
  profileEditModal: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
    borderRadius: '20px 20px 0 0',
    padding: `${spacing.xxl}px ${spacing.xl}px`,
    paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
    zIndex: 150,
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  profileEditHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.2)',
    margin: '0 auto 20px',
  },
  profileEditTitle: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.black,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  profileEditField: {
    marginBottom: spacing.lg,
  },
  profileEditLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    display: 'block',
    fontWeight: typography.weights.bold,
  },
  profileEditInput: {
    width: '100%',
    padding: spacing.lg,
    background: 'rgba(255,255,255,0.05)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: radii.xl,
    color: colors.text,
    fontSize: typography.sizes['3xl'],
    outline: 'none',
    minHeight: 48,
  },
  profileEditSave: {
    width: '100%',
    padding: '16px',
    background: colors.primaryGradient,
    border: 'none',
    borderRadius: radii.xl,
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
    cursor: 'pointer',
    marginTop: spacing.sm,
    minHeight: 52,
  },

  // ─── Confirm Dialog (Profile reset) ───────────────────────────────────────
  confirmOverlay: {
    position: 'fixed',
    inset: 0,
    background: colors.overlay,
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    zIndex: 200,
  },

  // ─── App version ──────────────────────────────────────────────────────────
  appVersion: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: typography.sizes.sm,
    padding: `${spacing.xxl}px 0`,
  },
};

export const globalCss = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  button { font-family: inherit; -webkit-tap-highlight-color: transparent; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  input { font-family: inherit; }
  input::placeholder { color: #555; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

  /* Remove hover-only states on mobile */
  @media (hover: none) {
    button:hover { transform: none !important; box-shadow: inherit !important; }
  }

  /* Active press state for all interactive elements */
  button:active, [role="button"]:active {
    transform: scale(0.97) !important;
    opacity: 0.9;
    transition: transform 0.1s ease, opacity 0.1s ease !important;
  }

  /* Animations */
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

  @keyframes setComplete {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.3); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes greenFlash {
    0% { box-shadow: 0 0 0 0 rgba(52,199,89,0.6); }
    50% { box-shadow: 0 0 20px 10px rgba(52,199,89,0.3); }
    100% { box-shadow: 0 0 0 0 rgba(52,199,89,0); }
  }

  @keyframes prBurst {
    0% { transform: scale(0.3); opacity: 0; }
    20% { transform: scale(1.1); opacity: 1; }
    40% { transform: scale(0.95); }
    60% { transform: scale(1.05); }
    80% { transform: scale(0.98); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes prParticle {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-120px) scale(0); opacity: 0; }
  }

  @keyframes prGlow {
    0%, 100% { box-shadow: 0 0 30px rgba(255,59,48,0.3); }
    50% { box-shadow: 0 0 60px rgba(255,59,48,0.6), 0 0 100px rgba(255,59,48,0.2); }
  }

  @keyframes restPulse {
    0%, 100% { stroke-dashoffset: 0; opacity: 1; }
    50% { opacity: 0.7; }
  }

  @keyframes restRingPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.04); }
    100% { transform: scale(1); }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @keyframes slideDown {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
  }

  @keyframes tabSlideLeft {
    from { transform: translateX(30px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes tabSlideRight {
    from { transform: translateX(-30px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes navBounce {
    0% { transform: scale(1); }
    40% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  @keyframes pullRefreshSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes confettiBurst {
    0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
    100% { opacity: 0; transform: translateY(-200px) rotate(720deg) scale(0); }
  }

  /* Card stagger entry animation */
  .ex-card-enter {
    animation: fadeInUp 0.35s ease both;
  }

  /* Modal sheet pattern */
  .modal-sheet {
    animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) both;
  }

  .modal-sheet-exit {
    animation: slideDown 0.25s ease-in both;
  }

  /* Tab transition classes */
  .tab-enter-right { animation: tabSlideLeft 0.25s ease both; }
  .tab-enter-left { animation: tabSlideRight 0.25s ease both; }

  /* Set completion micro-interactions */
  @keyframes setCountPop {
    0% { transform: scale(1); }
    40% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  @keyframes dotFill {
    0% { transform: scale(0.3); opacity: 0.3; }
    60% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes cardCompleteSlide {
    0% { transform: translateX(0); }
    30% { transform: translateX(-10px); }
    100% { transform: translateX(0); }
  }
`;
