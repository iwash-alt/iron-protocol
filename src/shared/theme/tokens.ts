export const colors = {
  background: '#0a0a0a',
  backgroundGradient: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
  surface: 'rgba(255,255,255,0.03)',
  surfaceBorder: 'rgba(255,255,255,0.06)',
  surfaceHover: 'rgba(255,255,255,0.08)',

  text: '#fff',
  textSecondary: '#888',
  textTertiary: '#666',
  textMuted: '#555',

  primary: '#FF3B30',
  primaryGradient: 'linear-gradient(135deg, #FF3B30 0%, #FF6B47 100%)',
  primaryGlow: 'rgba(255,59,48,0.3)',
  primarySurface: 'rgba(255,59,48,0.15)',
  primaryBorder: 'rgba(255,59,48,0.3)',

  success: '#34C759',
  successGradient: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
  successGlow: 'rgba(52,199,89,0.3)',
  successSurface: 'rgba(52,199,89,0.08)',
  successBorder: 'rgba(52,199,89,0.25)',

  warning: '#FF9500',
  warningSurface: 'rgba(255,149,0,0.15)',
  warningBorder: 'rgba(255,149,0,0.3)',

  info: '#3B82F6',
  infoSurface: 'rgba(59,130,246,0.15)',
  infoBorder: 'rgba(59,130,246,0.3)',

  youtube: '#FF0000',

  overlay: 'rgba(0,0,0,0.85)',
  overlayDense: 'rgba(0,0,0,0.9)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  pill: 20,
  circle: '50%',
} as const;

export const typography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  sizes: {
    xs: '0.55rem',
    sm: '0.65rem',
    base: '0.75rem',
    md: '0.8rem',
    lg: '0.85rem',
    xl: '0.9rem',
    '2xl': '0.95rem',
    '3xl': '1rem',
    '4xl': '1.1rem',
    '5xl': '1.25rem',
    '6xl': '1.5rem',
    '7xl': '1.75rem',
    hero: '2rem',
  },
  weights: {
    normal: 400,
    medium: 600,
    bold: 700,
    black: 800,
  },
} as const;
