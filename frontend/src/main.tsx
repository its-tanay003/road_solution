import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './nexus.css'
import './i18n/config'

// Progressive Web App Setup
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}

// Global Error Handler for Tactical Stability
window.addEventListener('error', (e) => {
  console.error('[RUNTIME CRITICAL]', e.error);
});

// Capture install prompt for custom HUD button
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e as BeforeInstallPromptEvent;
});


console.log('Mounting App...');
try {
  const container = document.getElementById('root');
  if (!container) throw new Error('Root element not found');
  
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log('App mounted successfully.');
} catch (err) {
  console.error('Failed to mount App:', err);
}
