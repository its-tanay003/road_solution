import * as ReactDOMClient from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './nexus.css';
import './i18n/config';

// Robust createRoot acquisition
const getCreateRoot = () => {
  if (typeof ReactDOMClient.createRoot === 'function') return ReactDOMClient.createRoot;
  // @ts-expect-error - Handle various build interop issues
  if (ReactDOMClient.default && typeof ReactDOMClient.default.createRoot === 'function') {
    // @ts-expect-error
    return ReactDOMClient.default.createRoot;
  }
  return null;
};

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
  // @ts-ignore
  window.deferredPrompt = e;
});

console.log('Mounting App with BrowserRouter...');
try {
  const container = document.getElementById('root');
  if (!container) throw new Error('Root element not found');
  
  const createRootFn = getCreateRoot();
  if (!createRootFn) throw new Error('createRoot function not found in react-dom/client');

  const root = createRootFn(container);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  console.log('App mounted successfully.');
} catch (err) {
  console.error('Failed to mount App:', err);
}
