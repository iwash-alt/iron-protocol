import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── HOMEPAGE STYLES ────────────────────────────────────────────────────────
const HS = {
  // Layout
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#fff',
    fontFamily: '"Space Grotesk", sans-serif',
    overflowX: 'hidden',
  },
  section: {
    padding: '80px 20px',
    maxWidth: 1100,
    margin: '0 auto',
  },
  sectionNarrow: {
    padding: '80px 20px',
    maxWidth: 800,
    margin: '0 auto',
  },

  // ─── HERO ──────────────────────────────
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    overflow: 'hidden',
  },
  heroCanvas: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 700,
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 18px',
    borderRadius: 40,
    background: 'rgba(204,0,0,0.12)',
    border: '1px solid rgba(204,0,0,0.3)',
    color: '#CC0000',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    marginBottom: 28,
  },
  heroHeadline: {
    fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
    fontWeight: 800,
    lineHeight: 1.08,
    margin: '0 0 20px',
    letterSpacing: '-0.02em',
  },
  heroAccent: {
    color: '#CC0000',
  },
  heroSub: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    color: '#888',
    lineHeight: 1.5,
    margin: '0 auto 36px',
    maxWidth: 520,
    fontWeight: 400,
  },
  heroCta: {
    display: 'inline-block',
    padding: '18px 44px',
    background: '#CC0000',
    border: 'none',
    borderRadius: 14,
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: 800,
    cursor: 'pointer',
    letterSpacing: '0.02em',
    boxShadow: '0 8px 32px rgba(204,0,0,0.4), 0 0 60px rgba(204,0,0,0.15)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    textDecoration: 'none',
  },
  heroScrollHint: {
    position: 'absolute',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    color: '#555',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
  },

  // ─── PRICE DISRUPTION ─────────────────
  priceSection: {
    padding: '80px 20px',
    maxWidth: 1100,
    margin: '0 auto',
    textAlign: 'center',
  },
  sectionTag: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.15em',
    color: '#CC0000',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
    fontWeight: 800,
    margin: '0 0 16px',
    letterSpacing: '-0.02em',
  },
  sectionSub: {
    fontSize: '1rem',
    color: '#666',
    margin: '0 auto 48px',
    maxWidth: 500,
    lineHeight: 1.5,
  },
  priceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    maxWidth: 900,
    margin: '0 auto',
  },
  priceCard: {
    padding: '32px 24px',
    borderRadius: 20,
    background: '#111',
    border: '1px solid rgba(255,255,255,0.06)',
    textAlign: 'center',
    transition: 'transform 0.3s, border-color 0.3s',
    position: 'relative',
  },
  priceCardHighlight: {
    background: 'linear-gradient(180deg, #1a0000 0%, #111 100%)',
    border: '1px solid rgba(204,0,0,0.4)',
    transform: 'scale(1.04)',
    boxShadow: '0 8px 40px rgba(204,0,0,0.15)',
  },
  priceCardBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px 18px',
    borderRadius: 20,
    background: '#CC0000',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    whiteSpace: 'nowrap',
  },
  priceAppName: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#888',
    marginBottom: 8,
  },
  priceAppNameHighlight: {
    color: '#fff',
  },
  priceAmount: {
    fontSize: '2.5rem',
    fontWeight: 800,
    marginBottom: 4,
  },
  priceAmountStrike: {
    color: '#444',
    textDecoration: 'line-through',
  },
  priceAmountHighlight: {
    color: '#CC0000',
  },
  pricePeriod: {
    fontSize: '0.8rem',
    color: '#555',
    marginBottom: 16,
  },
  priceFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    textAlign: 'left',
  },
  priceFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0',
    fontSize: '0.85rem',
    color: '#888',
    borderTop: '1px solid rgba(255,255,255,0.04)',
  },
  priceFeatureHighlight: {
    color: '#ccc',
  },
  checkIcon: {
    flexShrink: 0,
    width: 18,
    height: 18,
  },

  // ─── FEATURE CARDS ─────────────────────
  featuresSection: {
    padding: '80px 20px',
    maxWidth: 1100,
    margin: '0 auto',
    textAlign: 'center',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    marginTop: 48,
  },
  featureCard: {
    padding: '40px 28px',
    borderRadius: 20,
    background: '#111',
    border: '1px solid rgba(255,255,255,0.06)',
    textAlign: 'left',
    transition: 'transform 0.3s, border-color 0.3s',
  },
  featureIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: 'rgba(204,0,0,0.1)',
    border: '1px solid rgba(204,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: '1.15rem',
    fontWeight: 800,
    marginBottom: 4,
  },
  featureTagline: {
    fontSize: '0.85rem',
    color: '#CC0000',
    fontWeight: 600,
    marginBottom: 12,
  },
  featureDesc: {
    fontSize: '0.9rem',
    color: '#888',
    lineHeight: 1.6,
  },

  // ─── LIVE DEMO ─────────────────────────
  demoSection: {
    padding: '80px 20px',
    maxWidth: 700,
    margin: '0 auto',
    textAlign: 'center',
  },
  demoPhone: {
    maxWidth: 380,
    margin: '0 auto',
    borderRadius: 28,
    background: '#111',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '24px 20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  demoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  demoLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'rgba(204,0,0,0.15)',
    border: '1px solid rgba(204,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoAppTitle: {
    fontWeight: 800,
    fontSize: '0.85rem',
    letterSpacing: '0.04em',
  },
  demoCard: {
    padding: 16,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: 12,
  },
  demoCardDone: {
    background: 'rgba(52,199,89,0.06)',
    border: '1px solid rgba(52,199,89,0.2)',
  },
  demoExName: {
    fontSize: '1rem',
    fontWeight: 700,
    marginBottom: 2,
  },
  demoExMuscle: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#666',
    letterSpacing: '0.04em',
    marginBottom: 12,
  },
  demoStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 6,
    marginBottom: 14,
  },
  demoStat: {
    padding: '8px 4px',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.04)',
    textAlign: 'center',
  },
  demoStatLabel: {
    fontSize: '0.55rem',
    color: '#555',
    fontWeight: 700,
    letterSpacing: '0.04em',
    marginBottom: 2,
  },
  demoStatVal: {
    fontSize: '0.95rem',
    fontWeight: 800,
  },
  demoCompleteBtn: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    border: 'none',
    background: '#CC0000',
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.85rem',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(204,0,0,0.3)',
    fontFamily: '"Space Grotesk", sans-serif',
    transition: 'transform 0.15s',
  },
  demoCompleteBtnDone: {
    background: 'rgba(255,255,255,0.05)',
    color: '#555',
    cursor: 'default',
    boxShadow: 'none',
  },
  demoProgress: {
    marginTop: 16,
  },
  demoProgHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.65rem',
    color: '#555',
    fontWeight: 700,
    marginBottom: 6,
  },
  demoProgTrack: {
    height: 6,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  demoProgFill: {
    height: '100%',
    background: '#CC0000',
    borderRadius: 3,
    transition: 'width 0.4s ease',
  },
  // RPE overlay for demo
  demoOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    zIndex: 10,
  },
  demoRpeBox: {
    background: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 320,
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  demoRpeTitle: {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#34C759',
    marginBottom: 4,
  },
  demoRpeSub: {
    fontSize: '0.8rem',
    color: '#888',
    marginBottom: 12,
  },
  demoRpeQ: {
    fontSize: '0.95rem',
    fontWeight: 600,
    marginBottom: 14,
  },
  demoRpeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 6,
    marginBottom: 12,
  },
  demoRpeBtn: {
    padding: '10px 2px',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    color: '#fff',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  demoRpeNum: {
    fontSize: '1.25rem',
    fontWeight: 800,
  },
  demoRpeLabel: {
    fontSize: '0.45rem',
    marginTop: 2,
    opacity: 0.9,
  },
  demoWeightBump: {
    padding: '14px 20px',
    borderRadius: 14,
    background: 'rgba(52,199,89,0.08)',
    border: '1px solid rgba(52,199,89,0.2)',
    textAlign: 'center',
    marginTop: 12,
  },
  demoWeightBumpText: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#34C759',
  },
  demoWeightBumpSub: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: 4,
  },

  // ─── HOW IT WORKS ──────────────────────
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
    marginTop: 48,
  },
  stepCard: {
    textAlign: 'center',
    position: 'relative',
  },
  stepNum: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'rgba(204,0,0,0.1)',
    border: '1px solid rgba(204,0,0,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#CC0000',
  },
  stepTitle: {
    fontSize: '1.05rem',
    fontWeight: 800,
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: '0.85rem',
    color: '#888',
    lineHeight: 1.5,
  },
  stepConnector: {
    position: 'absolute',
    top: 24,
    right: -16,
    width: 32,
    height: 1,
    background: 'rgba(255,255,255,0.08)',
  },

  // ─── SOCIAL PROOF ─────────────────────
  testimonialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    marginTop: 48,
  },
  testimonialCard: {
    padding: '28px 24px',
    borderRadius: 20,
    background: '#111',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  testimonialStars: {
    marginBottom: 14,
    display: 'flex',
    gap: 3,
  },
  testimonialText: {
    fontSize: '0.9rem',
    color: '#ccc',
    lineHeight: 1.6,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  testimonialAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #CC0000, #ff4444)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '0.8rem',
  },
  testimonialName: {
    fontWeight: 700,
    fontSize: '0.85rem',
  },
  testimonialMeta: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: 2,
  },

  // ─── FINAL CTA ────────────────────────
  finalCta: {
    padding: '100px 20px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  finalHeadline: {
    fontSize: 'clamp(1.8rem, 5vw, 3rem)',
    fontWeight: 800,
    marginBottom: 16,
    letterSpacing: '-0.02em',
  },
  finalSub: {
    fontSize: '1.1rem',
    color: '#888',
    marginBottom: 36,
    maxWidth: 460,
    margin: '0 auto 36px',
    lineHeight: 1.5,
  },
  finalBtn: {
    display: 'inline-block',
    padding: '18px 48px',
    background: '#CC0000',
    border: 'none',
    borderRadius: 14,
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(204,0,0,0.4)',
    textDecoration: 'none',
    fontFamily: '"Space Grotesk", sans-serif',
    transition: 'transform 0.2s',
  },
  finalGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(204,0,0,0.08) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },

  // ─── FOOTER ───────────────────────────
  footer: {
    padding: '40px 20px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    textAlign: 'center',
    maxWidth: 1100,
    margin: '0 auto',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 16,
  },
  footerLink: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'color 0.2s',
  },
  footerCopy: {
    fontSize: '0.75rem',
    color: '#444',
  },

  // ─── ANIMATION HELPERS ────────────────
  fadeUp: {
    opacity: 0,
    transform: 'translateY(30px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
  },
  fadeUpVisible: {
    opacity: 1,
    transform: 'translateY(0)',
  },
};

// ─── HOMEPAGE CSS KEYFRAMES ─────────────────────────────────────────────────
const homepageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

  @keyframes hp-float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(3deg); }
  }
  @keyframes hp-float-slow {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(-2deg); }
  }
  @keyframes hp-pulse-glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  @keyframes hp-scroll-hint {
    0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.5; }
    50% { transform: translateX(-50%) translateY(8px); opacity: 1; }
  }
  @keyframes hp-gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes hp-weight-bump {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }

  .hp-hero-cta:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 40px rgba(204,0,0,0.5), 0 0 80px rgba(204,0,0,0.2) !important;
  }
  .hp-feature-card:hover {
    transform: translateY(-4px) !important;
    border-color: rgba(204,0,0,0.2) !important;
  }
  .hp-price-card:hover {
    transform: translateY(-4px);
  }
  .hp-demo-btn:hover {
    transform: scale(1.02) !important;
  }
  .hp-demo-btn:active {
    transform: scale(0.98) !important;
  }
  .hp-footer-link:hover {
    color: #CC0000 !important;
  }

  @media (max-width: 768px) {
    .hp-price-grid {
      grid-template-columns: 1fr !important;
      max-width: 400px !important;
    }
    .hp-feature-grid {
      grid-template-columns: 1fr !important;
    }
    .hp-steps-grid {
      grid-template-columns: 1fr !important;
      gap: 24px !important;
    }
    .hp-testimonial-grid {
      grid-template-columns: 1fr !important;
    }
    .hp-step-connector {
      display: none !important;
    }
  }
`;

// ─── SVG ICONS ──────────────────────────────────────────────────────────────
function SvgIcon({ name, size = 24, color = '#CC0000' }) {
  const icons = {
    bolt: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    brain: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 0 1 5 5c0 .9-.2 1.7-.7 2.4A5 5 0 0 1 19 14a5 5 0 0 1-3 4.6V22h-2v-3.4A5 5 0 0 1 11 14a5 5 0 0 1-3-4.6A5 5 0 0 1 5 7a5 5 0 0 1 5-5h2z" />
        <path d="M12 2v4" />
        <path d="M8 7h8" />
        <path d="M9 14h6" />
      </svg>
    ),
    ghost: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C7 2 3 6 3 11v9l3-3 3 3 3-3 3 3 3-3 3 3v-9c0-5-4-9-9-9z" />
        <circle cx="9" cy="10" r="1.5" fill={color} />
        <circle cx="15" cy="10" r="1.5" fill={color} />
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    dumbbell: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11M6.5 17.5h11" />
        <rect x="2" y="6" width="4.5" height="12" rx="1" />
        <rect x="17.5" y="6" width="4.5" height="12" rx="1" />
        <rect x="6.5" y="9" width="11" height="6" rx="1" />
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    user: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    target: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    trending: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    chevronDown: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ),
    github: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  };
  return icons[name] || null;
}

// ─── HERO BACKGROUND ────────────────────────────────────────────────────────
function HeroBackground() {
  return (
    <div style={HS.heroCanvas}>
      {/* Gradient mesh glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(204,0,0,0.07) 0%, transparent 60%)',
        animation: 'hp-pulse-glow 4s ease-in-out infinite',
      }} />
      {/* Floating geometric shapes */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '10%',
        width: 80,
        height: 80,
        border: '1px solid rgba(204,0,0,0.12)',
        borderRadius: 16,
        transform: 'rotate(45deg)',
        animation: 'hp-float 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '12%',
        width: 60,
        height: 60,
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '50%',
        animation: 'hp-float-slow 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '18%',
        width: 40,
        height: 40,
        border: '1px solid rgba(204,0,0,0.08)',
        animation: 'hp-float 7s ease-in-out infinite 1s',
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '20%',
        width: 100,
        height: 100,
        border: '1px solid rgba(255,255,255,0.03)',
        borderRadius: 20,
        transform: 'rotate(15deg)',
        animation: 'hp-float-slow 9s ease-in-out infinite 0.5s',
      }} />
      {/* Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
      }} />
    </div>
  );
}

// ─── SCROLL ANIMATION HOOK ──────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, style: visible ? { ...HS.fadeUp, ...HS.fadeUpVisible } : HS.fadeUp };
}

function RevealDiv({ children, style = {}, delay = 0, ...props }) {
  const { ref, style: revealStyle } = useScrollReveal();
  return (
    <div ref={ref} style={{ ...revealStyle, transitionDelay: `${delay}ms`, ...style }} {...props}>
      {children}
    </div>
  );
}

// ─── LIVE DEMO COMPONENT ────────────────────────────────────────────────────
function LiveDemo() {
  const [sets, setSets] = useState([false, false, false]);
  const [showRpe, setShowRpe] = useState(false);
  const [currentSet, setCurrentSet] = useState(0);
  const [weight, setWeight] = useState(80);
  const [showBump, setShowBump] = useState(false);
  const [rpeChosen, setRpeChosen] = useState(null);

  const completedCount = sets.filter(Boolean).length;
  const allDone = completedCount === 3;
  const progress = Math.round((completedCount / 3) * 100);

  const handleComplete = useCallback(() => {
    if (allDone) return;
    setCurrentSet(completedCount);
    setShowRpe(true);
  }, [allDone, completedCount]);

  const handleRpe = useCallback((rpe) => {
    setRpeChosen(rpe);
    const next = [...sets];
    next[currentSet] = true;
    setSets(next);
    setShowRpe(false);

    if (currentSet === 2 && rpe <= 7) {
      setShowBump(true);
      setTimeout(() => {
        setWeight(w => w + 2.5);
        setTimeout(() => setShowBump(false), 2000);
      }, 300);
    }
  }, [sets, currentSet]);

  const handleReset = useCallback(() => {
    setSets([false, false, false]);
    setShowBump(false);
    setCurrentSet(0);
    setWeight(80);
    setRpeChosen(null);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div style={HS.demoPhone}>
        {/* Phone header */}
        <div style={HS.demoHeader}>
          <div style={HS.demoLogo}>
            <SvgIcon name="dumbbell" size={18} />
          </div>
          <span style={HS.demoAppTitle}>IRON PROTOCOL</span>
        </div>

        {/* Exercise card */}
        <div style={{ ...HS.demoCard, ...(allDone ? HS.demoCardDone : {}) }}>
          <div style={HS.demoExName}>Bench Press</div>
          <div style={HS.demoExMuscle}>CHEST</div>
          <div style={HS.demoStats}>
            <div style={HS.demoStat}>
              <div style={HS.demoStatLabel}>WEIGHT</div>
              <div style={{
                ...HS.demoStatVal,
                color: showBump ? '#34C759' : '#fff',
                animation: showBump ? 'hp-weight-bump 0.4s ease' : 'none',
              }}>{weight}kg</div>
            </div>
            <div style={HS.demoStat}>
              <div style={HS.demoStatLabel}>REPS</div>
              <div style={HS.demoStatVal}>8</div>
            </div>
            <div style={HS.demoStat}>
              <div style={HS.demoStatLabel}>SETS</div>
              <div style={HS.demoStatVal}>{completedCount}/3</div>
            </div>
            <div style={HS.demoStat}>
              <div style={HS.demoStatLabel}>RPE</div>
              <div style={{ ...HS.demoStatVal, color: rpeChosen ? (rpeChosen <= 7 ? '#34C759' : rpeChosen === 8 ? '#FF9500' : '#CC0000') : '#555' }}>
                {rpeChosen || '-'}
              </div>
            </div>
          </div>

          {/* Set indicators */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {sets.map((done, i) => (
              <div key={i} style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: done ? '#34C759' : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          <button
            className="hp-demo-btn"
            onClick={allDone ? handleReset : handleComplete}
            style={{
              ...HS.demoCompleteBtn,
              ...(allDone ? { background: 'rgba(52,199,89,0.15)', color: '#34C759', boxShadow: 'none' } : {}),
            }}
          >
            {allDone ? 'RESET DEMO' : `COMPLETE SET ${completedCount + 1}`}
          </button>
        </div>

        {/* Progress */}
        <div style={HS.demoProgress}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#555', fontWeight: 700, marginBottom: 6 }}>
            <span>WORKOUT PROGRESS</span>
            <span>{progress}%</span>
          </div>
          <div style={HS.demoProgTrack}>
            <div style={{ ...HS.demoProgFill, width: `${progress}%` }} />
          </div>
        </div>

        {/* Weight bump notification */}
        {showBump && (
          <div style={HS.demoWeightBump}>
            <div style={HS.demoWeightBumpText}>Weight increased to {weight}kg</div>
            <div style={HS.demoWeightBumpSub}>RPE was low -- auto-progressing</div>
          </div>
        )}
      </div>

      {/* RPE Modal overlay */}
      {showRpe && (
        <div style={HS.demoOverlay}>
          <div style={HS.demoRpeBox}>
            <div style={HS.demoRpeTitle}>Set {currentSet + 1} Complete!</div>
            <div style={HS.demoRpeSub}>Bench Press</div>
            <div style={HS.demoRpeQ}>How hard was that?</div>
            <div style={HS.demoRpeGrid}>
              {[6, 7, 8, 9, 10].map(rpe => (
                <button
                  key={rpe}
                  onClick={() => handleRpe(rpe)}
                  style={{
                    ...HS.demoRpeBtn,
                    background: rpe <= 7 ? '#34C759' : rpe === 8 ? '#FF9500' : '#CC0000',
                  }}
                >
                  <div style={HS.demoRpeNum}>{rpe}</div>
                  <div style={HS.demoRpeLabel}>
                    {rpe === 6 ? 'Easy' : rpe === 7 ? 'Mod' : rpe === 8 ? 'Hard' : rpe === 9 ? 'V.Hard' : 'Fail'}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#666' }}>
              RPE 6-7 = weight goes up next time
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN HOMEPAGE COMPONENT ────────────────────────────────────────────────
export default function Homepage() {
  // Check for existing profile to show "Continue Training" vs "Start Training"
  const [hasProfile, setHasProfile] = useState(false);
  useEffect(() => {
    try {
      const p = localStorage.getItem('iron-profile') || localStorage.getItem('ironProtocolProfile');
      if (p) setHasProfile(true);
    } catch { /* noop */ }
  }, []);

  const ctaText = hasProfile ? 'Continue Training' : 'Start Training -- Free';
  const ctaHref = '#/app';

  return (
    <div style={HS.page}>
      <style>{homepageCss}</style>

      {/* ━━━ SECTION 1: HERO ━━━ */}
      <section style={HS.hero}>
        <HeroBackground />
        <div style={HS.heroContent}>
          <div style={HS.heroBadge}>
            <SvgIcon name="bolt" size={14} />
            RPE-Based Auto-Regulation
          </div>
          <h1 style={HS.heroHeadline}>
            Train Smarter.<br />
            Not Harder.<br />
            <span style={HS.heroAccent}>$2/month.</span>
          </h1>
          <p style={HS.heroSub}>
            Your app counts reps. Iron Protocol reads your effort, adjusts your
            weights, and builds your program in real time.
          </p>
          <a href={ctaHref} className="hp-hero-cta" style={HS.heroCta}>
            {ctaText}
          </a>
        </div>
        <div style={{ ...HS.heroScrollHint, animation: 'hp-scroll-hint 2s ease-in-out infinite' }}>
          <SvgIcon name="chevronDown" size={20} color="#555" />
          SCROLL
        </div>
      </section>

      {/* ━━━ SECTION 2: PRICE DISRUPTION ━━━ */}
      <section style={HS.priceSection}>
        <RevealDiv>
          <div style={HS.sectionTag}>PRICING</div>
          <h2 style={HS.sectionTitle}>More Features. Less Cost.</h2>
          <p style={HS.sectionSub}>
            Premium fitness coaching shouldn't require a premium budget.
          </p>
        </RevealDiv>

        <div className="hp-price-grid" style={HS.priceGrid}>
          {/* Fitbod */}
          <RevealDiv delay={0}>
            <div className="hp-price-card" style={HS.priceCard}>
              <div style={{ ...HS.priceAppName }}>Fitbod</div>
              <div style={{ ...HS.priceAmount, ...HS.priceAmountStrike }}>$80</div>
              <div style={HS.pricePeriod}>per year</div>
              <ul style={HS.priceFeatures}>
                <li style={HS.priceFeature}><SvgIcon name="check" size={16} color="#34C759" /> Auto-generated workouts</li>
                <li style={HS.priceFeature}><SvgIcon name="x" size={16} color="#444" /><span style={{ color: '#555' }}>No RPE tracking</span></li>
                <li style={HS.priceFeature}><SvgIcon name="x" size={16} color="#444" /><span style={{ color: '#555' }}>No ghost rival</span></li>
                <li style={HS.priceFeature}><SvgIcon name="x" size={16} color="#444" /><span style={{ color: '#555' }}>No fatigue detection</span></li>
              </ul>
            </div>
          </RevealDiv>

          {/* Iron Protocol */}
          <RevealDiv delay={150}>
            <div className="hp-price-card" style={{ ...HS.priceCard, ...HS.priceCardHighlight }}>
              <div style={HS.priceCardBadge}>BEST VALUE</div>
              <div style={{ ...HS.priceAppName, ...HS.priceAppNameHighlight }}>Iron Protocol</div>
              <div style={{ ...HS.priceAmount, ...HS.priceAmountHighlight }}>$24</div>
              <div style={HS.pricePeriod}>per year</div>
              <ul style={HS.priceFeatures}>
                <li style={{ ...HS.priceFeature, ...HS.priceFeatureHighlight }}><SvgIcon name="check" size={16} color="#34C759" /> Smart auto-progression</li>
                <li style={{ ...HS.priceFeature, ...HS.priceFeatureHighlight }}><SvgIcon name="check" size={16} color="#34C759" /> RPE-based programming</li>
                <li style={{ ...HS.priceFeature, ...HS.priceFeatureHighlight }}><SvgIcon name="check" size={16} color="#34C759" /> Ghost rival system</li>
                <li style={{ ...HS.priceFeature, ...HS.priceFeatureHighlight }}><SvgIcon name="check" size={16} color="#34C759" /> Fatigue detection</li>
              </ul>
            </div>
          </RevealDiv>

          {/* Strong */}
          <RevealDiv delay={300}>
            <div className="hp-price-card" style={HS.priceCard}>
              <div style={HS.priceAppName}>Strong</div>
              <div style={{ ...HS.priceAmount, ...HS.priceAmountStrike }}>$30</div>
              <div style={HS.pricePeriod}>per year</div>
              <ul style={HS.priceFeatures}>
                <li style={HS.priceFeature}><SvgIcon name="check" size={16} color="#34C759" /> Exercise logging</li>
                <li style={HS.priceFeature}><SvgIcon name="x" size={16} color="#444" /><span style={{ color: '#555' }}>No auto-progression</span></li>
                <li style={HS.priceFeature}><SvgIcon name="x" size={16} color="#444" /><span style={{ color: '#555' }}>No ghost rival</span></li>
                <li style={HS.priceFeature}><SvgIcon name="x" size={16} color="#444" /><span style={{ color: '#555' }}>No fatigue detection</span></li>
              </ul>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* ━━━ SECTION 3: FEATURE CARDS ━━━ */}
      <section style={HS.featuresSection}>
        <RevealDiv>
          <div style={HS.sectionTag}>INTELLIGENCE</div>
          <h2 style={HS.sectionTitle}>Your App Tracks. Ours Thinks.</h2>
          <p style={HS.sectionSub}>
            Three features that make Iron Protocol fundamentally different.
          </p>
        </RevealDiv>

        <div className="hp-feature-grid" style={HS.featureGrid}>
          <RevealDiv delay={0}>
            <div className="hp-feature-card" style={HS.featureCard}>
              <div style={HS.featureIconWrap}>
                <SvgIcon name="brain" size={28} />
              </div>
              <div style={HS.featureTitle}>RPE Auto-Progression</div>
              <div style={HS.featureTagline}>Rate your effort. We handle the rest.</div>
              <div style={HS.featureDesc}>
                After every set, rate how hard it felt on a 6-10 scale. Iron Protocol
                uses that data to automatically adjust your weights for next session --
                heavier when you're strong, lighter when you're not.
              </div>
            </div>
          </RevealDiv>

          <RevealDiv delay={150}>
            <div className="hp-feature-card" style={HS.featureCard}>
              <div style={HS.featureIconWrap}>
                <SvgIcon name="ghost" size={28} />
              </div>
              <div style={HS.featureTitle}>Ghost Rival System</div>
              <div style={HS.featureTagline}>Race your ghost every session.</div>
              <div style={HS.featureDesc}>
                Your past performance becomes your rival. Every workout, you're
                competing against the version of you from last week. Beat your ghost,
                and you're getting stronger. Simple.
              </div>
            </div>
          </RevealDiv>

          <RevealDiv delay={300}>
            <div className="hp-feature-card" style={HS.featureCard}>
              <div style={HS.featureIconWrap}>
                <SvgIcon name="shield" size={28} />
              </div>
              <div style={HS.featureTitle}>Fatigue Detection</div>
              <div style={HS.featureTagline}>We'll tell you when to back off.</div>
              <div style={HS.featureDesc}>
                Iron Protocol monitors your RPE trends across weeks. When fatigue
                accumulates and performance drops, it recommends a deload before
                you burn out or get hurt.
              </div>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* ━━━ SECTION 4: LIVE DEMO ━━━ */}
      <section style={HS.demoSection}>
        <RevealDiv>
          <div style={HS.sectionTag}>TRY IT NOW</div>
          <h2 style={HS.sectionTitle}>See It In Action</h2>
          <p style={HS.sectionSub}>
            Tap "Complete Set", rate your effort, and watch the weight auto-adjust.
          </p>
        </RevealDiv>
        <RevealDiv delay={200}>
          <LiveDemo />
        </RevealDiv>
      </section>

      {/* ━━━ SECTION 5: HOW IT WORKS ━━━ */}
      <section style={{ ...HS.section, textAlign: 'center' }}>
        <RevealDiv>
          <div style={HS.sectionTag}>GET STARTED</div>
          <h2 style={HS.sectionTitle}>Three Steps to Stronger</h2>
        </RevealDiv>

        <div className="hp-steps-grid" style={HS.stepsGrid}>
          <RevealDiv delay={0}>
            <div style={HS.stepCard}>
              <div style={HS.stepNum}>1</div>
              <div style={HS.stepTitle}>Set Up Your Profile</div>
              <div style={HS.stepDesc}>
                Tell us your experience level, preferred split, and training days.
                Takes under a minute.
              </div>
              <div className="hp-step-connector" style={HS.stepConnector} />
            </div>
          </RevealDiv>

          <RevealDiv delay={150}>
            <div style={HS.stepCard}>
              <div style={HS.stepNum}>2</div>
              <div style={HS.stepTitle}>Follow the Smart Program</div>
              <div style={HS.stepDesc}>
                Your program adapts every session based on your RPE ratings. No
                guessing, no spreadsheets.
              </div>
              <div className="hp-step-connector" style={HS.stepConnector} />
            </div>
          </RevealDiv>

          <RevealDiv delay={300}>
            <div style={HS.stepCard}>
              <div style={HS.stepNum}>3</div>
              <div style={HS.stepTitle}>Get Stronger</div>
              <div style={HS.stepDesc}>
                Track PRs, beat your ghost, and watch the weights climb. The
                protocol handles the science.
              </div>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* ━━━ SECTION 6: SOCIAL PROOF ━━━ */}
      <section style={{ ...HS.section, textAlign: 'center' }}>
        <RevealDiv>
          <div style={HS.sectionTag}>ATHLETES</div>
          <h2 style={HS.sectionTitle}>What Lifters Are Saying</h2>
        </RevealDiv>

        <div className="hp-testimonial-grid" style={HS.testimonialGrid}>
          {[
            {
              text: "I've tried every app out there. This is the first one that actually adjusts my weights intelligently. My bench went up 15kg in 3 months.",
              name: 'Marcus R.',
              meta: 'Powerlifter, 2 years',
              initials: 'MR',
            },
            {
              text: "The ghost rival feature is addictive. I find myself pushing harder every session just to beat last week's numbers. Game changer.",
              name: 'Sarah K.',
              meta: 'CrossFit athlete',
              initials: 'SK',
            },
            {
              text: "Finally an app that told me to deload before I got injured. The fatigue detection is worth the subscription alone. And at $2/mo, it's a no-brainer.",
              name: 'James T.',
              meta: 'Bodybuilder, 5 years',
              initials: 'JT',
            },
          ].map((t, i) => (
            <RevealDiv key={i} delay={i * 150}>
              <div style={HS.testimonialCard}>
                <div style={HS.testimonialStars}>
                  {[1,2,3,4,5].map(s => <SvgIcon key={s} name="star" size={14} color="#CC0000" />)}
                </div>
                <div style={HS.testimonialText}>"{t.text}"</div>
                <div style={HS.testimonialAuthor}>
                  <div style={HS.testimonialAvatar}>{t.initials}</div>
                  <div>
                    <div style={HS.testimonialName}>{t.name}</div>
                    <div style={HS.testimonialMeta}>{t.meta}</div>
                  </div>
                </div>
              </div>
            </RevealDiv>
          ))}
        </div>
      </section>

      {/* ━━━ SECTION 7: FINAL CTA ━━━ */}
      <section style={HS.finalCta}>
        <div style={HS.finalGlow} />
        <RevealDiv>
          <h2 style={HS.finalHeadline}>
            Your Ghost Is Waiting.
          </h2>
          <p style={HS.finalSub}>
            Start for free. Go Pro for the price of a coffee.
          </p>
          <a href={ctaHref} style={HS.finalBtn}>
            {ctaText}
          </a>
        </RevealDiv>
      </section>

      {/* ━━━ SECTION 8: FOOTER ━━━ */}
      <footer style={HS.footer}>
        <div style={HS.footerLinks}>
          <a href="https://github.com/iwash-alt/iron-protocol" className="hp-footer-link" style={HS.footerLink} target="_blank" rel="noopener noreferrer">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <SvgIcon name="github" size={16} color="#666" /> GitHub
            </span>
          </a>
          <a href="#/privacy" className="hp-footer-link" style={HS.footerLink}>Privacy</a>
          <a href="#/about" className="hp-footer-link" style={HS.footerLink}>About</a>
        </div>
        <div style={HS.footerCopy}>
          Iron Protocol {new Date().getFullYear()}. Train smarter.
        </div>
      </footer>
    </div>
  );
}
