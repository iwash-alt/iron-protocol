import React, { useState, useEffect, useCallback, useRef } from 'react';
import { colors } from '@/shared/theme/tokens';
import { TIMINGS } from '@/shared/constants/timings';

// ─── localStorage keys ──────────────────────────────────────────────────────
const INSTALL_DISMISSED_KEY = 'ironInstallDismissed';
const INSTALL_STATE_KEY = 'ironInstallState';

// ─── Types ──────────────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function isDismissedRecently(): boolean {
  const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
  if (!dismissed) return false;
  const dismissedAt = parseInt(dismissed, 10);
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - dismissedAt < sevenDays;
}

function isAlreadyInstalled(): boolean {
  // Check display-mode media query
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  // iOS standalone mode
  if ((navigator as unknown as { standalone?: boolean }).standalone === true) return true;
  // Previously recorded install
  if (localStorage.getItem(INSTALL_STATE_KEY) === 'installed') return true;
  return false;
}

function getWorkoutCount(): number {
  try {
    const raw = localStorage.getItem('ironWorkoutHistory');
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────
export function InstallBanner() {
  const [show, setShow] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show if already installed or recently dismissed
    if (isAlreadyInstalled() || isDismissedRecently()) return;

    // Must have completed at least 2 workouts
    if (getWorkoutCount() < 2) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setShow(true);
      // Animate in after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
    };

    window.addEventListener('beforeinstallprompt', handler);

    const onInstalled = () => {
      localStorage.setItem(INSTALL_STATE_KEY, 'installed');
      setShow(false);
      deferredPrompt.current = null;
    };

    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Re-check workout count periodically (after a workout ends)
  useEffect(() => {
    if (show || isAlreadyInstalled() || isDismissedRecently()) return;

    const checkInterval = setInterval(() => {
      if (getWorkoutCount() >= 2 && deferredPrompt.current) {
        setShow(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimateIn(true));
        });
      }
    }, TIMINGS.SUGGESTION_TOAST_DURATION);

    return () => clearInterval(checkInterval);
  }, [show]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt.current) return;

    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;

    if (outcome === 'accepted') {
      localStorage.setItem(INSTALL_STATE_KEY, 'installed');
    }

    deferredPrompt.current = null;
    setAnimateIn(false);
    setTimeout(() => setShow(false), TIMINGS.ANIMATION_NORMAL);
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
    setAnimateIn(false);
    setTimeout(() => setShow(false), TIMINGS.ANIMATION_NORMAL);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(80px + env(safe-area-inset-bottom, 0px) + 8px)',
      left: 12,
      right: 12,
      zIndex: 10000,
      transform: animateIn ? 'translateY(0)' : 'translateY(120%)',
      opacity: animateIn ? 1 : 0,
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(30,30,30,0.98) 0%, rgba(20,20,20,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${colors.primaryBorder}`,
        borderRadius: 16,
        padding: '16px 16px 16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,59,48,0.1)',
      }}>
        {/* Icon */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: colors.primarySurface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
            <g transform="translate(32,32)">
              <rect x="-24" y="-14" width="6" height="28" rx="2" fill="#FF3B30"/>
              <rect x="18" y="-14" width="6" height="28" rx="2" fill="#FF3B30"/>
              <rect x="-18" y="-10" width="5" height="20" rx="2" fill="#FF3B30" opacity="0.75"/>
              <rect x="13" y="-10" width="5" height="20" rx="2" fill="#FF3B30" opacity="0.75"/>
              <rect x="-13" y="-2" width="26" height="4" rx="2" fill="#fff" opacity="0.9"/>
            </g>
          </svg>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: 2,
          }}>
            Add Iron Protocol to Home Screen
          </div>
          <div style={{
            color: '#888',
            fontSize: '0.65rem',
          }}>
            Train offline with the full app experience
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '0.65rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 4px',
              letterSpacing: 0.5,
            }}
          >
            LATER
          </button>
          <button
            onClick={handleInstall}
            style={{
              background: colors.primary,
              border: 'none',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: 8,
              letterSpacing: 0.5,
            }}
          >
            INSTALL
          </button>
        </div>
      </div>
    </div>
  );
}
