import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard as AdminDashboard } from './pages/Admin/Dashboard';
import { MainLayout } from './components/MainLayout';
import { TriageChat } from './pages/TriageChat';
import { LiveMap } from './pages/LiveMap';
import { ServiceDetail } from './pages/ServiceDetail';
import { FirstAid } from './pages/FirstAid';
import { Profile } from './pages/Profile';
import { RoutePlanner } from './pages/RoutePlanner';
import { IncidentReport } from './pages/IncidentReport';
import { AnimatePresence, motion } from 'framer-motion';
import './i18n/config';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
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
        </Route>
        {/* Admin doesn't use the standard mobile bottom nav */}
        <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
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

function App() {
  return (
    <AmbientUIProvider>
      <Router>
        <ResponderAlertOverlay />
        <AnimatedRoutes />
      </Router>
    </AmbientUIProvider>
  );
}

export default App;
