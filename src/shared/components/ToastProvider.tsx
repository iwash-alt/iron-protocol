import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { colors, radii, spacing, typography } from '@/shared/theme/tokens';
import { TIMINGS } from '@/shared/constants/timings';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'warning' | 'info' | 'suggestion';

export interface ToastAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

export interface ToastOptions {
  type: ToastType;
  message: string;
  /** Auto-dismiss after ms. Defaults: success=3000, others=5000 */
  duration?: number;
  actions?: ToastAction[];
}

interface ToastItem extends ToastOptions {
  id: string;
  visible: boolean;
}

interface ToastContextValue {
  showToast: (opts: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

let _nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof window.setTimeout>>>({});

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  }, []);

  const dismissToast = useCallback((id: string) => {
    // Trigger exit animation, then remove
    setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
    window.setTimeout(() => removeToast(id), TIMINGS.ANIMATION_NORMAL);
  }, [removeToast]);

  const showToast = useCallback((opts: ToastOptions): string => {
    const id = String(++_nextId);
    const duration = opts.duration ?? (opts.type === 'success' ? 3000 : 5000);

    setToasts(prev => [...prev, { ...opts, id, visible: false }]);

    // Next tick: set visible to trigger slide-in animation
    window.setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: true } : t));
    }, 16);

    // Auto-dismiss
    timersRef.current[id] = window.setTimeout(() => dismissToast(id), duration);

    return id;
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

// ── Container ─────────────────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div style={containerStyle}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ── Individual Toast ──────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);

  const accentColor = {
    success: colors.success,
    warning: colors.primary,
    info: colors.info,
    suggestion: colors.warning,
  }[toast.type];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    if (delta > 0) setSwipeX(delta);
  };

  const handleTouchEnd = () => {
    if (swipeX > 80) {
      onDismiss(toast.id);
    } else {
      setSwipeX(0);
    }
    touchStartX.current = null;
  };

  const isExiting = swipeX > 80;

  return (
    <div
      style={{
        ...toastStyle,
        borderLeftColor: accentColor,
        transform: toast.visible && !isExiting
          ? `translateX(${swipeX}px)`
          : toast.visible
          ? 'translateX(100%)'
          : 'translateY(60px)',
        opacity: toast.visible && !isExiting ? Math.max(0, 1 - swipeX / 200) : 0,
        transition: swipeX > 0
          ? 'none'
          : `transform ${TIMINGS.ANIMATION_NORMAL}ms cubic-bezier(0.34, 1.2, 0.64, 1), opacity ${TIMINGS.ANIMATION_NORMAL}ms ease`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={headerRowStyle}>
        <span style={{ ...messageStyle }}>{toast.message}</span>
        <button
          onClick={() => onDismiss(toast.id)}
          style={closeButtonStyle}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      {toast.actions && toast.actions.length > 0 && (
        <div style={actionsRowStyle}>
          {toast.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                action.onClick();
                onDismiss(toast.id);
              }}
              style={{
                ...actionButtonBase,
                ...(action.primary
                  ? { color: accentColor, background: 'rgba(255,255,255,0.06)' }
                  : { color: colors.textTertiary, background: 'transparent' }),
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 'calc(80px + env(safe-area-inset-bottom, 0px) + 8px)',
  left: spacing.lg,
  right: spacing.lg,
  zIndex: 75,
  display: 'flex',
  flexDirection: 'column',
  gap: spacing.sm,
  pointerEvents: 'none',
};

const toastStyle: React.CSSProperties = {
  background: '#1a1a1a',
  borderLeft: `4px solid transparent`,
  borderRadius: radii.lg,
  padding: `${spacing.md}px ${spacing.lg}px`,
  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
  pointerEvents: 'auto',
  willChange: 'transform, opacity',
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: spacing.sm,
  justifyContent: 'space-between',
};

const messageStyle: React.CSSProperties = {
  fontSize: typography.sizes.md,
  color: colors.text,
  lineHeight: 1.4,
  flex: 1,
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: colors.textTertiary,
  fontSize: typography.sizes.sm,
  cursor: 'pointer',
  padding: `0 0 0 ${spacing.sm}px`,
  lineHeight: 1,
  flexShrink: 0,
};

const actionsRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: spacing.sm,
  justifyContent: 'flex-end',
  marginTop: spacing.sm,
};

const actionButtonBase: React.CSSProperties = {
  padding: `${spacing.xs + 2}px ${spacing.md}px`,
  borderRadius: radii.sm,
  border: 'none',
  fontSize: typography.sizes.sm,
  fontWeight: typography.weights.bold,
  cursor: 'pointer',
  letterSpacing: '0.03em',
};
