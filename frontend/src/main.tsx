import React from 'react'

if (typeof React.useState !== 'function') {
  document.body.style.cssText = [
    'background:#080C14',
    'min-height:100vh',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'flex-direction:column',
    'gap:12px',
    'margin:0',
    'font-family:monospace'
  ].join(';')
  document.body.innerHTML = `
    <div style="font-size:36px">⚠️</div>
    <div style="color:#FF1744;font-size:16px">Multiple React copies detected</div>
    <div style="color:#8892A4;font-size:12px">Run: cd frontend && npm dedupe && npm install</div>
    <button onclick="location.reload()"
      style="background:#FF9933;color:#000;padding:12px 24px;border:none;
             border-radius:8px;cursor:pointer;font-size:14px;font-weight:700;margin-top:8px">
      Retry
    </button>
  `
  throw new Error('[ROADSoS] FATAL: Multiple React copies detected')
}

import * as ReactDOMClient from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { RootErrorBoundary } from './components/RootErrorBoundary';
import './index.css';
import './nexus.css';
import './i18n/config';

// Robust createRoot acquisition
const getCreateRoot = () => {
  if (typeof ReactDOMClient.createRoot === 'function') return ReactDOMClient.createRoot;
  
  // @ts-expect-error - React 19 / ESM build interop: ReactDOMClient might have a .default property containing the API in some environments
  if (ReactDOMClient.default && typeof ReactDOMClient.default.createRoot === 'function') {
    // @ts-expect-error - Property 'default' does not exist on type 'typeof import("react-dom/client")'
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
  // @ts-expect-error - window.deferredPrompt is a custom property for PWA install flow
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
    <RootErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RootErrorBoundary>
  );
  console.log('App mounted successfully.');
} catch (err) {
  console.error('Failed to mount App:', err);
}
