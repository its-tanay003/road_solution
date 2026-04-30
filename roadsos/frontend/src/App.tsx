import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-screen bg-background">
    <div className="w-12 h-12 border-4 border-emergency border-t-transparent rounded-full animate-spin"></div>
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
          </Route>
          {/* Admin and B2B don't use the standard mobile bottom nav */}
          <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
          <Route path="/b2b" element={<PageWrapper><B2BDashboard /></PageWrapper>} />
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

function App() {
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
