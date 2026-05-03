import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { AnimatePresence, motion } from 'framer-motion';
import './i18n/config';

// Lazy load pages
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard').then(module => ({ default: module.Dashboard })));
const TriageChat = lazy(() => import('./pages/TriageChat').then(module => ({ default: module.TriageChat })));
const LiveMap = lazy(() => import('./pages/LiveMap').then(module => ({ default: module.LiveMap })));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail').then(module => ({ default: module.ServiceDetail })));
const FirstAid = lazy(() => import('./pages/FirstAid').then(module => ({ default: module.FirstAid })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const RoutePlanner = lazy(() => import('./pages/RoutePlanner').then(module => ({ default: module.RoutePlanner })));
const IncidentReport = lazy(() => import('./pages/IncidentReport').then(module => ({ default: module.IncidentReport })));
const B2BDashboard = lazy(() => import('./pages/B2B/Dashboard').then(module => ({ default: module.B2BDashboard })));
const SafetyFeed = lazy(() => import('./pages/Community/SafetyFeed').then(module => ({ default: module.SafetyFeed })));
const DemoCommandCenter = lazy(() => import('./components/DemoCommandCenter').then(module => ({ default: module.DemoCommandCenter })));
const IncidentTimeline = lazy(() => import('./components/IncidentTimeline').then(module => ({ default: module.IncidentTimeline })));
const MeshStatus = lazy(() => import('./components/MeshStatus').then(module => ({ default: module.MeshStatus })));
const MetricsDashboard = lazy(() => import('./components/MetricsDashboard').then(module => ({ default: module.MetricsDashboard })));
const MedicalVaultDemo = lazy(() => import('./components/MedicalVaultDemo').then(module => ({ default: module.MedicalVaultDemo })));
const ImpactDashboard = lazy(() => import('./components/ImpactDashboard').then(module => ({ default: module.ImpactDashboard })));
const ArchitectureDiagram = lazy(() => import('./components/ArchitectureDiagram').then(module => ({ default: module.ArchitectureDiagram })));
const IntegrationsPanel = lazy(() => import('./components/IntegrationsPanel').then(module => ({ default: module.IntegrationsPanel })));
const SoundControlPanel = lazy(() => import('./components/SoundControlPanel').then(module => ({ default: module.SoundControlPanel })));
const JudgeInteractiveDemo = lazy(() => import('./components/JudgeInteractiveDemo').then(module => ({ default: module.JudgeInteractiveDemo })));
const JudgeMobileView = lazy(() => import('./components/JudgeMobileView').then(module => ({ default: module.JudgeMobileView })));
const ManifestoGenerator = lazy(() => import('./components/ManifestoGenerator').then(module => ({ default: module.ManifestoGenerator })));
const ChaosEngineeringPanel = lazy(() => import('./components/ChaosEngineeringPanel').then(module => ({ default: module.ChaosEngineeringPanel })));
const MultiLingualTriage = lazy(() => import('./components/MultiLingualTriage').then(module => ({ default: module.MultiLingualTriage })));
const SystemStatus = lazy(() => import('./components/SystemStatus').then(module => ({ default: module.SystemStatus })));
const PresentationOpeningScreen = lazy(() => import('./components/PresentationOpeningScreen').then(module => ({ default: module.PresentationOpeningScreen })));
const ResponderLeaderboard = lazy(() => import('./components/ResponderLeaderboard').then(module => ({ default: module.ResponderLeaderboard })));
const CrashPredictionEngine = lazy(() => import('./components/CrashPredictionEngine').then(module => ({ default: module.CrashPredictionEngine })));
const AccessibilityPanel = lazy(() => import('./components/AccessibilityPanel').then(module => ({ default: module.AccessibilityPanel })));
const BootScreen = lazy(() => import('./pages/BootScreen').then(module => ({ default: module.BootScreen })));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-screen bg-[var(--nx-bg-base)]">
    <div className="w-12 h-12 border-4 border-[var(--nx-red-primary)] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/chat" element={<PageWrapper><TriageChat /></PageWrapper>} />
            <Route path="/map" element={<PageWrapper><LiveMap /></PageWrapper>} />
            <Route path="/service/:id" element={<PageWrapper><ServiceDetail /></PageWrapper>} />
            <Route path="/first-aid" element={<PageWrapper><FirstAid /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
            <Route path="/route" element={<PageWrapper><RoutePlanner /></PageWrapper>} />
            <Route path="/report" element={<PageWrapper><IncidentReport /></PageWrapper>} />
            <Route path="/feed" element={<PageWrapper><SafetyFeed /></PageWrapper>} />
            <Route path="/demo" element={<DemoCommandCenter />} />
            <Route path="/timeline" element={<PageWrapper><IncidentTimeline /></PageWrapper>} />
            <Route path="/mesh" element={<PageWrapper><MeshStatus /></PageWrapper>} />
            <Route path="/metrics" element={<PageWrapper><MetricsDashboard /></PageWrapper>} />
            <Route path="/vault" element={<PageWrapper><MedicalVaultDemo /></PageWrapper>} />
            <Route path="/impact" element={<PageWrapper><ImpactDashboard /></PageWrapper>} />
            <Route path="/architecture" element={<PageWrapper><ArchitectureDiagram /></PageWrapper>} />
            <Route path="/integrations" element={<PageWrapper><IntegrationsPanel /></PageWrapper>} />
            <Route path="/sound" element={<PageWrapper><SoundControlPanel /></PageWrapper>} />
            <Route path="/judge-presentation" element={<PageWrapper><JudgeInteractiveDemo /></PageWrapper>} />
            <Route path="/judge-demo" element={<PageWrapper><JudgeMobileView /></PageWrapper>} />
            <Route path="/manifesto" element={<PageWrapper><ManifestoGenerator /></PageWrapper>} />
            <Route path="/multi-lingual" element={<PageWrapper><MultiLingualTriage /></PageWrapper>} />
            <Route path="/status" element={<PageWrapper><SystemStatus /></PageWrapper>} />
            <Route path="/present" element={<PageWrapper><PresentationOpeningScreen /></PageWrapper>} />
            <Route path="/leaderboard" element={<PageWrapper><ResponderLeaderboard /></PageWrapper>} />
            <Route path="/prediction" element={<PageWrapper><CrashPredictionEngine /></PageWrapper>} />
            <Route path="/accessibility" element={<PageWrapper><AccessibilityPanel /></PageWrapper>} />
          </Route>
          {/* Chaos Panel is a global utility, we can render it outside routes or as a global child */}
          <Route element={<><Outlet /><ChaosEngineeringPanel /></>}>
            <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
            <Route path="/b2b" element={<PageWrapper><B2BDashboard /></PageWrapper>} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
    className="w-full h-full min-h-screen"
  >
    {children}
  </motion.div>
);

import { AmbientUIProvider } from './components/AmbientUIProvider';
import { ResponderAlertOverlay } from './components/ResponderAlertOverlay';
import CrashCountdownOverlay from './components/CrashCountdownOverlay';

import { useState } from 'react';

function App() {
  const [showBoot, setShowBoot] = useState(true);

  if (showBoot) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <BootScreen onComplete={() => setShowBoot(false)} />
      </Suspense>
    );
  }

  return (
    <AmbientUIProvider>
      <Router>
        <CrashCountdownOverlay />
        <ResponderAlertOverlay />
        <AnimatedRoutes />
      </Router>
    </AmbientUIProvider>
  );
}

export default App;
