import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Analytics } from '@vercel/analytics/react';
import { useSettingsStore, applySettingsToDOM } from './store/settingsStore';
import { useAuthStore } from './store/authStore';

// Screens & Components
import HomeScreen from './screens/HomeScreen';
import { Dashboard } from './screens/Dashboard';
import { Dispatched } from './screens/Dispatched';
import { OnboardingFlow } from './components/OnboardingFlow';
import { AppLoadingScreen } from './components/AppLoadingScreen';
import { GovernancePortal } from './screens/GovernancePortal';
import { ImpactCalculator } from './screens/ImpactCalculator';
import { SystemOrchestrator } from './components/SystemOrchestrator';
import CrashPatternAnalytics from './screens/CrashPatternAnalytics';
import FamilyPortal from './screens/FamilyPortal';
import ResponderView from './screens/ResponderView';
import { ARNavigationView } from './components/ARNavigationView';
import { PitchDeckMode } from './components/PitchDeckMode';
import { KeyboardShortcutOverlay } from './components/KeyboardShortcutOverlay';
import { Roadmap } from './pages/Roadmap';
import { Research } from './pages/Research';
import { Technical } from './pages/Technical';
import { GoodSamaritanGuide } from './pages/GoodSamaritanGuide';
import { LiveMap } from './pages/LiveMap';
import { HospitalFinder } from './screens/HospitalFinder';
import { EvaluationLayout } from './components/EvaluationLayout';
import { IncidentTimeline } from './components/IncidentTimeline';

// Stores
import { useMedicalProfileStore } from './store/medicalProfileStore';
import { VolunteerAlertScreen } from './components/VolunteerAlertScreen';
import { VolunteerResponderNetwork } from './components/VolunteerResponderNetwork';
import { NHAISmartHighwayPanel } from './components/NHAISmartHighwayPanel';
import { useDemoStore } from './store';
import { LoginPage } from './pages/LoginPage';
import { SecurityDashboard } from './pages/SecurityDashboard';

// Re-apply persisted settings to DOM on every page load
function AppInitializer() {
  const settings = useSettingsStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    applySettingsToDOM({
      theme: settings.theme,
      textSize: settings.textSize,
      fontStyle: settings.fontStyle,
      reducedMotion: settings.reducedMotion,
      colorScheme: settings.colorScheme,
    });
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

// Protect routes behind auth
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

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
  const { onboardingComplete } = useMedicalProfileStore();
  const [isLoading, setIsLoading] = useState(true);

  const { 
    isPresentationMode, 
    togglePresentationMode, 
    toggleShortcuts, 
    triggerScenario, 
    showShortcuts, 
    isPaused,
    isDemoControlOpen,
    setDemoControlOpen
  } = useDemoStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Shift+D to toggle demo controls
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDemoControlOpen(!isDemoControlOpen);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isDemoControlOpen, setDemoControlOpen]);

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
      if (isDemoControlOpen && !isPresentationMode) {
        if (e.key === '1') triggerScenario(1);
        if (e.key === '2') triggerScenario(2);
        if (e.key === '3') triggerScenario(3);
        if (e.key === '0') triggerScenario(4); // Reset
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, [isDemoControlOpen, isPresentationMode, togglePresentationMode, toggleShortcuts, triggerScenario]);

  if (isLoading) {
    return <AppLoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  if (!onboardingComplete && !isDemoControlOpen) {
    return <OnboardingFlow />;
  }

  return (
    <div className="w-full min-h-screen bg-[#080C14] text-[#E8EDF5] selection:bg-[#2979FF]/30 overflow-hidden font-sans">
      {/* HUD Overlays */}
      <div className="scanline-overlay pointer-events-none opacity-20" />
      <div className="scanline-sweep pointer-events-none" />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><PageWrapper><HomeScreen /></PageWrapper></ProtectedRoute>} />
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/governance" element={<PageWrapper><GovernancePortal /></PageWrapper>} />
          <Route path="/impact" element={<PageWrapper><ImpactCalculator /></PageWrapper>} />
          <Route path="/volunteer" element={<PageWrapper><VolunteerResponderNetwork /></PageWrapper>} />
          <Route path="/dispatched/:id" element={<PageWrapper><Dispatched /></PageWrapper>} />
          <Route path="/analytics" element={<PageWrapper><CrashPatternAnalytics /></PageWrapper>} />
          <Route path="/family/:incidentId" element={<PageWrapper><FamilyPortal /></PageWrapper>} />
          <Route path="/responder/:unitId" element={<PageWrapper><ResponderView /></PageWrapper>} />
          <Route path="/responder/:incidentId/ar" element={<PageWrapper><ARNavigationView /></PageWrapper>} />
          <Route path="/map" element={<PageWrapper><LiveMap /></PageWrapper>} />
          <Route path="/hospitals" element={<PageWrapper><HospitalFinder /></PageWrapper>} />
          <Route path="/roadmap" element={<PageWrapper><EvaluationLayout><Roadmap /></EvaluationLayout></PageWrapper>} />
          <Route path="/research" element={<PageWrapper><EvaluationLayout><Research /></EvaluationLayout></PageWrapper>} />
          <Route path="/technical" element={<PageWrapper><EvaluationLayout><Technical /></EvaluationLayout></PageWrapper>} />
          <Route path="/good-samaritan" element={<PageWrapper><EvaluationLayout><GoodSamaritanGuide /></EvaluationLayout></PageWrapper>} />
          <Route path="/incident-report" element={<PageWrapper><IncidentTimeline /></PageWrapper>} />
          <Route path="/security" element={<PageWrapper><EvaluationLayout><SecurityDashboard /></EvaluationLayout></PageWrapper>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <VolunteerAlertScreen />
      <NHAISmartHighwayPanel />

      {/* Global Demo Tools */}
      {isDemoControlOpen && <SystemOrchestrator />}
      
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
        isOpen={showShortcuts} 
        onClose={() => toggleShortcuts(false)}
        isPaused={isPaused}
      />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppInitializer />
      <AppContent />
      <Analytics />
    </BrowserRouter>
  );
};

export default App;
