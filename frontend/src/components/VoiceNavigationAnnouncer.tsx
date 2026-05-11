import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibilityAnnouncer } from '../hooks/useAccessibilityAnnouncer';

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Home Screen. SOS button available — say Send SOS or hold the red button.',
  '/map': 'Live Map Screen. Tracking nearby emergencies.',
  '/settings': 'Settings Screen. Adjust voice, theme, and language.',
  '/profile': 'Personal Profile Screen. Your medical ID and emergency contacts.',
  '/assistant': 'AI Emergency Assistant. Ask for first aid help.',
  '/incident-report': 'Incident Reporting Screen.',
  '/dispatched': 'Emergency Dispatched Screen. A unit is on the way.',
};

export const VoiceNavigationAnnouncer: React.FC = () => {
  const location = useLocation();
  const { announce } = useAccessibilityAnnouncer();

  useEffect(() => {
    const label = ROUTE_LABELS[location.pathname] || `Navigated to ${location.pathname}`;
    announce(label, 'polite');

    // Update document title for screen readers
    const pageTitle = ROUTE_LABELS[location.pathname]?.split('.')[0] || 'ROADSoS';
    document.title = `${pageTitle} | ROADSoS`;
  }, [location.pathname, announce]);

  return (
    <>
      {/* ARIA Live Regions */}
      <div 
        id="aria-live-region" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only" 
      />
      <div 
        id="aria-live-region-assertive" 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only" 
      />
      
      {/* Skip to Content Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only fixed top-4 left-4 z-9999 px-4 py-2 bg-(--clr-blue) text-white rounded-lg font-bold shadow-lg focus:ring-4 focus:ring-blue-500/50"
      >
        Skip to main content
      </a>
    </>
  );
};
