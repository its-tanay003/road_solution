import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuthStore } from './store/authStore';
import PageLoadingFallback from './components/PageLoadingFallback';

// Critical Path - Eagerly Loaded
import HomeScreen from './screens/HomeScreen';
import { SOSActiveScreen } from './screens/SOSActiveScreen';
import { Dispatched } from './screens/Dispatched';

// Lazy Loaded Pages & Screens
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const Dashboard = lazy(() => import('./pages/Admin/Dashboard').then(m => ({ default: m.Dashboard })));
const BystanderReport = lazy(() => import('./screens/BystanderReport').then(m => ({ default: m.BystanderReport })));
const MedicalProfilePage = lazy(() => import('./pages/MedicalProfilePage').then(m => ({ default: m.MedicalProfilePage })));
const GovernancePortal = lazy(() => import('./screens/GovernancePortal').then(m => ({ default: m.GovernancePortal })));
const ImpactCalculator = lazy(() => import('./screens/ImpactCalculator').then(m => ({ default: m.ImpactCalculator })));
const CrashPatternAnalytics = lazy(() => import('./screens/CrashPatternAnalytics'));
const FamilyPortal = lazy(() => import('./screens/FamilyPortal'));
const ResponderView = lazy(() => import('./screens/ResponderView'));
const ARNavigationView = lazy(() => import('./components/ARNavigationView').then(m => ({ default: m.ARNavigationView })));
const Roadmap = lazy(() => import('./pages/Roadmap').then(m => ({ default: m.Roadmap })));
const Research = lazy(() => import('./pages/Research').then(m => ({ default: m.Research })));
const Technical = lazy(() => import('./pages/Technical').then(m => ({ default: m.Technical })));
const GoodSamaritanGuide = lazy(() => import('./pages/GoodSamaritanGuide').then(m => ({ default: m.GoodSamaritanGuide })));
const LiveMap = lazy(() => import('./pages/LiveMap').then(m => ({ default: m.LiveMap })));
const HospitalFinder = lazy(() => import('./screens/HospitalFinder').then(m => ({ default: m.HospitalFinder })));
const IncidentTimeline = lazy(() => import('./components/IncidentTimeline').then(m => ({ default: m.IncidentTimeline })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const TrustedContactsPage = lazy(() => import('./pages/TrustedContactsPage').then(m => ({ default: m.TrustedContactsPage })));
const WhatsAppConnectPage = lazy(() => import('./pages/WhatsAppConnectPage').then(m => ({ default: m.WhatsAppConnectPage })));
const ConsentManagementPage = lazy(() => import('./pages/ConsentManagementPage').then(m => ({ default: m.ConsentManagementPage })));
const SecurityDashboard = lazy(() => import('./pages/SecurityDashboard').then(m => ({ default: m.SecurityDashboard })));

const AssistantPage = lazy(() => import('./pages/AssistantPage').then(m => ({ default: m.AssistantPage })));

// Layouts & UI Components (Keep Eager if small or used globally)
import { EvaluationLayout } from './components/EvaluationLayout';
import { PrivacyConsentBanner } from './components/PrivacyConsentBanner';
import { VolunteerAlertScreen } from './components/VolunteerAlertScreen';
const VolunteerResponderNetwork = lazy(() => import('./components/VolunteerResponderNetwork').then(m => ({ default: m.VolunteerResponderNetwork })));
import { NHAISmartHighwayPanel } from './components/NHAISmartHighwayPanel';
import { SettingsButton } from './components/SettingsButton';
import { SettingsPanel } from './components/SettingsPanel';




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
  
  return (
    <div className="w-full min-h-screen bg-[#080C14] text-[#E8EDF5] selection:bg-[#2979FF]/30 overflow-hidden font-sans">
      <Suspense fallback={<PageLoadingFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
            <Route path="/settings/trusted-contacts" element={<PageWrapper><TrustedContactsPage /></PageWrapper>} />
            <Route path="/settings/whatsapp" element={<PageWrapper><WhatsAppConnectPage /></PageWrapper>} />
            <Route path="/settings/consent" element={<PageWrapper><ConsentManagementPage /></PageWrapper>} />
            <Route path="/" element={<ProtectedRoute><PageWrapper><HomeScreen /></PageWrapper></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageWrapper><MedicalProfilePage /></PageWrapper></ProtectedRoute>} />
            <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="/governance" element={<PageWrapper><GovernancePortal /></PageWrapper>} />
            <Route path="/impact" element={<PageWrapper><ImpactCalculator /></PageWrapper>} />
            <Route path="/volunteer" element={<PageWrapper><VolunteerResponderNetwork /></PageWrapper>} />
            <Route path="/sos-active" element={<PageWrapper><SOSActiveScreen /></PageWrapper>} />
            <Route path="/assistant" element={<ProtectedRoute><PageWrapper><AssistantPage /></PageWrapper></ProtectedRoute>} />
            <Route path="/report/:incidentId" element={<PageWrapper><BystanderReport /></PageWrapper>} />
            <Route path="/dispatched/:id" element={<PageWrapper><Dispatched /></PageWrapper>} />
            <Route path="/analytics" element={<PageWrapper><CrashPatternAnalytics /></PageWrapper>} />
            <Route path="/family/:incidentId" element={<PageWrapper><FamilyPortal /></PageWrapper>} />
            <Route path="/responder/:unitId" element={<PageWrapper><ResponderView /></PageWrapper>} />
            <Route path="/responder/:incidentId/ar" element={<PageWrapper><ARNavigationView /></PageWrapper>} />
            <Route path="/map" element={<PageWrapper><LiveMap /></PageWrapper>} />
            <Route path="/hospitals" element={<PageWrapper><HospitalFinder /></PageWrapper>} />
            <Route path="/roadmap" element={<PageWrapper><EvaluationLayout><Roadmap /></EvaluationLayout></PageWrapper>} />
            <Route path="/good-samaritan" element={<PageWrapper><EvaluationLayout><GoodSamaritanGuide /></EvaluationLayout></PageWrapper>} />
            <Route path="/research" element={<PageWrapper><EvaluationLayout><Research /></EvaluationLayout></PageWrapper>} />
            <Route path="/technical" element={<PageWrapper><EvaluationLayout><Technical /></EvaluationLayout></PageWrapper>} />
            <Route path="/incident-report" element={<PageWrapper><IncidentTimeline /></PageWrapper>} />
            <Route path="/security" element={<PageWrapper><EvaluationLayout><SecurityDashboard /></EvaluationLayout></PageWrapper>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>


      <PrivacyConsentBanner />
      <VolunteerAlertScreen />
      <NHAISmartHighwayPanel />
      
      <SettingsButton />
      <SettingsPanel />
    </div>
  );
};

const App = () => {
  console.log('[DEBUG] Rendering App, React Version:', React.version);
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
