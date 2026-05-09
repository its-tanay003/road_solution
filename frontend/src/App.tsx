import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuthStore } from './store/authStore';

// Screens & Components
import HomeScreen from './screens/HomeScreen';
import { Dashboard } from './pages/Admin/Dashboard';
import { Dispatched } from './screens/Dispatched';
import { SOSActiveScreen } from './screens/SOSActiveScreen';
import { BystanderReport } from './screens/BystanderReport';
import { MedicalProfilePage } from './pages/MedicalProfilePage';
import { GovernancePortal } from './screens/GovernancePortal';
import { ImpactCalculator } from './screens/ImpactCalculator';
import CrashPatternAnalytics from './screens/CrashPatternAnalytics';
import FamilyPortal from './screens/FamilyPortal';
import ResponderView from './screens/ResponderView';
import { ARNavigationView } from './components/ARNavigationView';
import { Roadmap } from './pages/Roadmap';
import { Research } from './pages/Research';
import { Technical } from './pages/Technical';
import { GoodSamaritanGuide } from './pages/GoodSamaritanGuide';
import { LiveMap } from './pages/LiveMap';
import { HospitalFinder } from './screens/HospitalFinder';
import { EvaluationLayout } from './components/EvaluationLayout';
import { IncidentTimeline } from './components/IncidentTimeline';
import { PrivacyPage } from './pages/PrivacyPage';
import { SettingsPage } from './pages/SettingsPage';
import { TrustedContactsPage } from './pages/TrustedContactsPage';
import { WhatsAppConnectPage } from './pages/WhatsAppConnectPage';
import { ConsentManagementPage } from './pages/ConsentManagementPage';
import { PrivacyConsentBanner } from './components/PrivacyConsentBanner';

// Stores
import { VolunteerAlertScreen } from './components/VolunteerAlertScreen';
import { VolunteerResponderNetwork } from './components/VolunteerResponderNetwork';
import { NHAISmartHighwayPanel } from './components/NHAISmartHighwayPanel';
import { LoginPage } from './pages/LoginPage';
import { SecurityDashboard } from './pages/SecurityDashboard';
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
