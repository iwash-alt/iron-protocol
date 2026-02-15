import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App';
import { recoverPendingTransaction } from '@/shared/storage';

recoverPendingTransaction();

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ─── Service Worker Registration ────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/iron-protocol/sw.js')
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.error('SW failed:', err));

    // Listen for background sync messages from SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        // Background sync complete - could trigger UI refresh
      }
    });
  });
}

// ─── Queue background sync when going offline ───────────────────────────────
window.addEventListener('online', () => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'QUEUE_SYNC' });
  }
});
