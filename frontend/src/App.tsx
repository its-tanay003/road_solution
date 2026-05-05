import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Screens & Components
import HomeScreen from './screens/HomeScreen';
import { Dashboard } from './screens/Dashboard';
import { Dispatched } from './screens/Dispatched';
import { OnboardingFlow } from './components/OnboardingFlow';
import { AppLoadingScreen } from './components/AppLoadingScreen';
import { GovernancePortal } from './screens/GovernancePortal';
import { ImpactCalculator } from './screens/ImpactCalculator';
import DemoOrchestrator from './components/DemoOrchestrator';
import CrashPatternAnalytics from './screens/CrashPatternAnalytics';
import FamilyPortal from './screens/FamilyPortal';
import ResponderView from './screens/ResponderView';
import { ARNavigationView } from './components/ARNavigationView';
import { PitchDeckMode } from './components/PitchDeckMode';
import { KeyboardShortcutOverlay } from './components/KeyboardShortcutOverlay';

// Stores
import { useMedicalProfileStore } from './store/medicalProfileStore';
import { VolunteerAlertScreen } from './components/VolunteerAlertScreen';
import { VolunteerResponderNetwork } from './components/VolunteerResponderNetwork';
import { NHAISmartHighwayPanel } from './components/NHAISmartHighwayPanel';
import { useDemoStore } from './store';

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

const AppContent = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { onboardingComplete } = useMedicalProfileStore();
  const [isLoading, setIsLoading] = useState(true);

  // Check for demo mode in URL
  const isDemo = searchParams.get('demo') === 'true';
  const { isPresentationMode, togglePresentationMode, toggleShortcuts, triggerScenario } = useDemoStore();

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Toggle shortcuts with ?
      if (e.key === '?') {
        toggleShortcuts();
        return;
      }

      // Shift+P for Presentation Mode
      if (e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        togglePresentationMode();
        return;
      }

      // Quick triggers for scenarios if in demo mode
      if (isDemo && !isPresentationMode) {
        if (e.key === '1') triggerScenario(1);
        if (e.key === '2') triggerScenario(2);
        if (e.key === '3') triggerScenario(3);
        if (e.key === '0') triggerScenario(4); // Reset
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, [isDemo, isPresentationMode, togglePresentationMode, toggleShortcuts, triggerScenario]);

  if (isLoading) {
    return <AppLoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  if (!onboardingComplete && !isDemo) {
    return <OnboardingFlow />;
  }

  return (
    <div className="w-full min-h-screen bg-[#080C14] text-[#E8EDF5] selection:bg-[#2979FF]/30 overflow-hidden font-sans">
      {/* HUD Overlays */}
      <div className="scanline-overlay pointer-events-none opacity-20" />
      <div className="scanline-sweep pointer-events-none" />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><HomeScreen /></PageWrapper>} />
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/governance" element={<PageWrapper><GovernancePortal /></PageWrapper>} />
          <Route path="/impact" element={<PageWrapper><ImpactCalculator /></PageWrapper>} />
          <Route path="/volunteer" element={<PageWrapper><VolunteerResponderNetwork /></PageWrapper>} />
          <Route path="/dispatched/:id" element={<PageWrapper><Dispatched /></PageWrapper>} />
          <Route path="/analytics" element={<PageWrapper><CrashPatternAnalytics /></PageWrapper>} />
          <Route path="/family/:incidentId" element={<PageWrapper><FamilyPortal /></PageWrapper>} />
          <Route path="/responder/:unitId" element={<PageWrapper><ResponderView /></PageWrapper>} />
          <Route path="/responder/:incidentId/ar" element={<PageWrapper><ARNavigationView /></PageWrapper>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <VolunteerAlertScreen />
      <NHAISmartHighwayPanel />

      {/* Global Demo Tools */}
      {isDemo && <DemoOrchestrator />}
      
      {/* Presentation & Shortcut Layers */}
      <PitchDeckMode 
        isOpen={isPresentationMode} 
        onClose={togglePresentationMode} 
        onStartDemo={() => {
          togglePresentationMode();
          triggerScenario(1);
        }}
      />
      <KeyboardShortcutOverlay 
        isOpen={useDemoStore(state => state.showShortcuts)} 
        onClose={() => toggleShortcuts(false)}
        isPaused={useDemoStore(state => state.isPaused)}
      />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
