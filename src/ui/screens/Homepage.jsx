import React, { useState, useEffect, useRef } from 'react';

// ─── ROTATING PHRASES (module-level for stable reference) ───────────────────
const ROTATING_PHRASES = [
  'Less than a coffee.',
  'Less than a protein shake.',
  'Less than 7 minutes of parking.',
];

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
  heroHeadline: {
    fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
    fontWeight: 800,
    lineHeight: 1.08,
    margin: '0 0 20px',
    letterSpacing: '0.04em',
  },
  heroAccent: {
    color: '#CC0000',
  },
  heroSub: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    color: '#888',
    lineHeight: 1.5,
    margin: '0 auto 12px',
    maxWidth: 560,
    fontWeight: 400,
  },
  heroPricing: {
    fontSize: '1rem',
    color: '#ccc',
    fontWeight: 700,
    marginBottom: 28,
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
  heroNoCard: {
    marginTop: 16,
    fontSize: '0.8rem',
    color: '#666',
    fontWeight: 500,
    letterSpacing: '0.02em',
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

  // ─── PRICE TABLE ───────────────────────
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
  priceTableWrap: {
    overflowX: 'auto',
    maxWidth: 800,
    margin: '0 auto',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  priceTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  priceTableHead: {
    background: 'rgba(255,255,255,0.03)',
  },
  priceTableTh: {
    padding: '14px 16px',
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: '#888',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  priceTableThFirst: {
    textAlign: 'left',
  },
  priceTableRow: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.2s',
  },
  priceTableRowHighlight: {
    background: 'rgba(204,0,0,0.12)',
    borderBottom: '1px solid rgba(204,0,0,0.3)',
  },
  priceTableTd: {
    padding: '14px 16px',
    fontSize: '0.9rem',
    textAlign: 'center',
    color: '#ccc',
  },
  priceTableTdFirst: {
    textAlign: 'left',
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

  // ─── STATS BAR ─────────────────────────
  statsBar: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: '24px 0',
  },
  statsItem: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#ccc',
    letterSpacing: '0.02em',
  },
  statsDivider: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: '1rem',
  },
  rotatingSubtitle: {
    marginTop: 20,
    fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
    fontWeight: 700,
    color: '#CC0000',
    minHeight: '2em',
    transition: 'opacity 0.4s ease',
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
    letterSpacing: '0.04em',
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
    marginTop: 16,
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

  .hp-hero-cta:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 40px rgba(204,0,0,0.5), 0 0 80px rgba(204,0,0,0.2) !important;
  }
  .hp-feature-card:hover {
    transform: translateY(-4px) !important;
    border-color: rgba(204,0,0,0.2) !important;
  }
  .hp-footer-link:hover {
    color: #CC0000 !important;
  }

  @media (max-width: 768px) {
    .hp-feature-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

// ─── SVG ICONS ──────────────────────────────────────────────────────────────
function SvgIcon({ name, size = 24, color = '#CC0000' }) {
  const icons = {
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
    chevronDown: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
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

// ─── COMPARISON TABLE DATA ──────────────────────────────────────────────────
const COMPETITORS = [
  { app: 'Fitbod', price: '$96/yr', autoReg: false, ghost: false, fatigue: 'Partial' },
  { app: 'Dr. Muscle', price: '$120/yr', autoReg: true, ghost: false, fatigue: true },
  { app: 'Hevy Pro', price: '$24/yr', autoReg: false, ghost: false, fatigue: false },
  { app: 'Strong Pro', price: '$30/yr', autoReg: false, ghost: false, fatigue: false },
  { app: 'RP Hypertrophy', price: '$420/yr', autoReg: true, ghost: false, fatigue: true },
  { app: 'Iron Protocol', price: '$20/yr', autoReg: true, ghost: true, fatigue: true, highlight: true },
];

const STATS_ITEMS = ['250+ exercises', 'RPE auto-regulation', 'Ghost rival system', 'Fatigue detection', '$2/month'];

// ─── MAIN HOMEPAGE COMPONENT ────────────────────────────────────────────────
export default function Homepage() {
  const [hasProfile, setHasProfile] = useState(false);
  useEffect(() => {
    try {
      const p = localStorage.getItem('iron-profile') || localStorage.getItem('ironProtocolProfile');
      if (p) setHasProfile(true);
    } catch { /* noop */ }
  }, []);

  // Rotating subtitle
  const [rotatingIdx, setRotatingIdx] = useState(0);
  const [rotatingVisible, setRotatingVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingVisible(false);
      setTimeout(() => {
        setRotatingIdx(prev => (prev + 1) % ROTATING_PHRASES.length);
        setRotatingVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const ctaText = hasProfile ? 'CONTINUE TRAINING' : 'START YOUR FREE TRIAL';
  const ctaHref = '#/app';

  return (
    <div style={HS.page}>
      <style>{homepageCss}</style>

      {/* ━━━ SECTION 1: HERO ━━━ */}
      <section style={HS.hero}>
        <HeroBackground />
        <div style={HS.heroContent}>
          <h1 style={HS.heroHeadline}>
            TRAIN HARDER.<br />
            <span style={HS.heroAccent}>PROGRESS FASTER.</span>
          </h1>
          <p style={HS.heroSub}>
            The only app that adjusts your training based on how you actually perform.
          </p>
          <div style={HS.heroPricing}>$2/month. 7 days free.</div>
          <a href={ctaHref} className="hp-hero-cta" style={HS.heroCta}>
            {ctaText}
          </a>
          <div style={HS.heroNoCard}>No credit card required</div>
        </div>
        <div style={{ ...HS.heroScrollHint, animation: 'hp-scroll-hint 2s ease-in-out infinite' }}>
          <SvgIcon name="chevronDown" size={20} color="#555" />
          SCROLL
        </div>
      </section>

      {/* ━━━ SECTION 2: PRICE COMPARISON ━━━ */}
      <section style={HS.priceSection}>
        <RevealDiv>
          <div style={HS.sectionTag}>PRICING</div>
          <h2 style={HS.sectionTitle}>Why pay more for less?</h2>
        </RevealDiv>

        <RevealDiv delay={200}>
          <div style={HS.priceTableWrap}>
            <table style={HS.priceTable}>
              <thead>
                <tr style={HS.priceTableHead}>
                  <th style={{ ...HS.priceTableTh, ...HS.priceTableThFirst }}>APP</th>
                  <th style={HS.priceTableTh}>PRICE</th>
                  <th style={HS.priceTableTh}>AUTO-REG</th>
                  <th style={HS.priceTableTh}>GHOST</th>
                  <th style={HS.priceTableTh}>FATIGUE</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((row, i) => (
                  <tr key={i} style={row.highlight ? HS.priceTableRowHighlight : HS.priceTableRow}>
                    <td style={{
                      ...HS.priceTableTd,
                      ...HS.priceTableTdFirst,
                      fontWeight: row.highlight ? 800 : 600,
                      color: row.highlight ? '#fff' : '#ccc',
                    }}>
                      {row.app}
                    </td>
                    <td style={{
                      ...HS.priceTableTd,
                      textDecoration: row.highlight ? 'none' : 'line-through',
                      color: row.highlight ? '#fff' : '#555',
                      fontWeight: row.highlight ? 800 : 400,
                    }}>
                      {row.price}
                    </td>
                    <td style={HS.priceTableTd}>
                      {row.autoReg
                        ? <SvgIcon name="check" size={16} color="#34C759" />
                        : <SvgIcon name="x" size={16} color="#444" />}
                    </td>
                    <td style={{
                      ...HS.priceTableTd,
                      fontWeight: row.highlight && row.ghost ? 800 : 400,
                      color: row.highlight && row.ghost ? '#34C759' : undefined,
                    }}>
                      {row.ghost
                        ? (row.highlight ? 'YES' : <SvgIcon name="check" size={16} color="#34C759" />)
                        : <SvgIcon name="x" size={16} color="#444" />}
                    </td>
                    <td style={HS.priceTableTd}>
                      {row.fatigue === 'Partial'
                        ? <span style={{ color: '#FF9500', fontSize: '0.8rem', fontWeight: 600 }}>Partial</span>
                        : row.fatigue
                          ? <SvgIcon name="check" size={16} color="#34C759" />
                          : <SvgIcon name="x" size={16} color="#444" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RevealDiv>
      </section>

      {/* ━━━ SECTION 3: FEATURE CARDS ━━━ */}
      <section style={HS.featuresSection}>
        <RevealDiv>
          <div style={HS.sectionTag}>FEATURES</div>
          <h2 style={HS.sectionTitle}>Three Features. Zero Guesswork.</h2>
        </RevealDiv>

        <div className="hp-feature-grid" style={HS.featureGrid}>
          <RevealDiv delay={0}>
            <div className="hp-feature-card" style={HS.featureCard}>
              <div style={HS.featureIconWrap}>
                <SvgIcon name="brain" size={28} />
              </div>
              <div style={HS.featureTitle}>RATE YOUR EFFORT. WE HANDLE THE REST.</div>
              <div style={HS.featureTagline}>Intelligent RPE-based progression</div>
              <div style={HS.featureDesc}>
                After each set, rate how hard you worked. We calculate your
                next session automatically.
              </div>
            </div>
          </RevealDiv>

          <RevealDiv delay={150}>
            <div className="hp-feature-card" style={HS.featureCard}>
              <div style={HS.featureIconWrap}>
                <SvgIcon name="ghost" size={28} />
              </div>
              <div style={HS.featureTitle}>RACE YOUR GHOST.</div>
              <div style={HS.featureTagline}>Ghost rival system</div>
              <div style={HS.featureDesc}>
                Every workout, you compete against your last session.
                Real-time volume comparison. Win/loss streaks.
              </div>
            </div>
          </RevealDiv>

          <RevealDiv delay={300}>
            <div className="hp-feature-card" style={HS.featureCard}>
              <div style={HS.featureIconWrap}>
                <SvgIcon name="shield" size={28} />
              </div>
              <div style={HS.featureTitle}>FATIGUE DETECTION. NO WEARABLE REQUIRED.</div>
              <div style={HS.featureTagline}>Built-in fatigue monitoring</div>
              <div style={HS.featureDesc}>
                No Oura ring. No Whoop band. We track your patterns to tell
                you when to push and when to rest.
              </div>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* ━━━ SECTION 4: SOCIAL PROOF ━━━ */}
      <section style={{ ...HS.section, textAlign: 'center' }}>
        <RevealDiv>
          <div style={HS.statsBar}>
            {STATS_ITEMS.map((stat, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={HS.statsDivider}>|</span>}
                <span style={HS.statsItem}>{stat}</span>
              </React.Fragment>
            ))}
          </div>
          <div style={{ ...HS.rotatingSubtitle, opacity: rotatingVisible ? 1 : 0 }}>
            {ROTATING_PHRASES[rotatingIdx]}
          </div>
        </RevealDiv>
      </section>

      {/* ━━━ SECTION 5: FINAL CTA ━━━ */}
      <section style={HS.finalCta}>
        <div style={HS.finalGlow} />
        <RevealDiv>
          <h2 style={HS.finalHeadline}>
            YOUR GHOST IS WAITING.
          </h2>
          <p style={HS.finalSub}>
            7 days free. Then $2/month. Cancel anytime.
          </p>
          <a href={ctaHref} style={HS.finalBtn}>
            START TRAINING
          </a>
        </RevealDiv>
      </section>

      {/* ━━━ SECTION 6: FOOTER ━━━ */}
      <footer style={HS.footer}>
        <div style={HS.footerCopy}>
          Iron Protocol | Built by lifters, for lifters.
        </div>
        <div style={HS.footerLinks}>
          <a href="#/terms" className="hp-footer-link" style={HS.footerLink}>Terms</a>
          <a href="#/privacy" className="hp-footer-link" style={HS.footerLink}>Privacy</a>
          <a href="#/contact" className="hp-footer-link" style={HS.footerLink}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
