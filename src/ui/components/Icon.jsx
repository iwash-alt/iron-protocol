import React from 'react';

const icons = {
  dumbbell: <path d="M6.5 6.5L17.5 17.5M6 12L12 6M12 18L18 12M3 9L9 3M15 21L21 15" strokeWidth="2" stroke="currentColor" fill="none"/>,
  check: <polyline points="20 6 9 17 4 12" strokeWidth="3" stroke="currentColor" fill="none"/>,
  play: <path d="M8 5v14l11-7z" fill="currentColor"/>,
  close: <><line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" stroke="currentColor"/><line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" stroke="currentColor"/></>,
  swap: <><polyline points="17 1 21 5 17 9" strokeWidth="2" stroke="currentColor" fill="none"/><path d="M3 11V9a4 4 0 0 1 4-4h14" strokeWidth="2" stroke="currentColor" fill="none"/><polyline points="7 23 3 19 7 15" strokeWidth="2" stroke="currentColor" fill="none"/><path d="M21 13v2a4 4 0 0 1-4 4H3" strokeWidth="2" stroke="currentColor" fill="none"/></>,
  chart: <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeWidth="2" stroke="currentColor" fill="none"/>,
  lightning: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/>,
  flame: <path d="M12 23c-3.65 0-7-2.76-7-7.5 0-3.75 2.94-7.57 5.25-10.06C5.86 4.76 12 2 12 2s6.14 2.76 6.75 3.44C21.06 7.93 19 11.25 19 15.5c0 4.74-3.35 7.5-7 7.5z" fill="currentColor"/>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" stroke="currentColor" fill="none"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" stroke="currentColor" fill="none"/></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" stroke="currentColor"/><line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" stroke="currentColor"/></>,
  minus: <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" stroke="currentColor"/>,
  arrow: <><line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" stroke="currentColor"/><polyline points="12 5 19 12 12 19" strokeWidth="2" stroke="currentColor" fill="none"/></>,
  alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2" stroke="currentColor" fill="none"/><line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" stroke="currentColor"/></>,
  fire: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.3.3.5.6.7.9z" strokeWidth="2" stroke="currentColor" fill="none"/>,
  history: <><circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none"/><polyline points="12 6 12 12 16 14" strokeWidth="2" stroke="currentColor" fill="none"/></>,
  ruler: <><path d="M21 3H3v18h18V3z" strokeWidth="2" stroke="currentColor" fill="none"/><path d="M21 9H15M21 15H15M9 21V15M15 21V15" strokeWidth="2" stroke="currentColor"/></>,
};

export default function Icon({ name, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24">{icons[name]}</svg>;
}
