import React, { lazy, Suspense, useEffect, useState, useRef } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// ── Stores ─────────────────────────────────────────────────────────
import { useAuthStore } from './store/authStore';
import { useVolunteerStore } from './store/volunteerStore';

// ── Shell components (eager — critical path) ───────────────────────
import { TopBar }                  from './components/TopBar';
import { BottomNav }               from './components/BottomNav';
import { SOSFloatButton }           from './components/SOSFloatButton';
import { VoiceNavigationListener }  from './components/VoiceNavigationListener';
import { ToastContainer }           from './components/ToastContainer';
import { AppLoadingScreen }         from './components/AppLoadingScreen';
import { HighStressModeOverlay }    from './components/HighStressModeOverlay';
import { PrivacyConsentBanner }     from './components/PrivacyConsentBanner';
import { VolunteerAlertScreen }     from './components/VolunteerAlertScreen';
import { DriveModeListener }      from './components/DriveModeListener';

// ── Page loading fallback ──────────────────────────────────────────
import PageLoadingFallback from './components/PageLoadingFallback';

// ── Shared page transition ─────────────────────────────────────────
import { pageVariants } from './lib/pageTransition';
import { focusPageHeading } from './lib/accessibilityHelpers';
import { SafetyTimerStrip } from './components/SafetyTimerStrip';
import { SafetyGuardian } from './components/SafetyGuardian';

// ── Critical screens (eager — needed on first paint or SOS) ────────
import HomeScreen           from './screens/HomeScreen';
import { SOSActiveScreen }  from './screens/SOSActiveScreen';


// ── Lazy pages ─────────────────────────────────────────────────────
const LoginPage            = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const LiveMap              = lazy(() => import('./pages/LiveMap').then(m => ({ default: m.LiveMap })));
const Profile              = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const MedicalProfilePage   = lazy(() => import('./pages/MedicalProfilePage').then(m => ({ default: m.MedicalProfilePage })));

const TrustedContactsPage  = lazy(() => import('./pages/TrustedContactsPage').then(m => ({ default: m.TrustedContactsPage })));
const WhatsAppConnectPage  = lazy(() => import('./pages/WhatsAppConnectPage').then(m => ({ default: m.WhatsAppConnectPage })));
const ConsentManagementPage = lazy(() => import('./pages/ConsentManagementPage').then(m => ({ default: m.ConsentManagementPage })));
const PrivacyPage          = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const SecurityDashboard    = lazy(() => import('./pages/SecurityDashboard').then(m => ({ default: m.SecurityDashboard })));
const GoodSamaritanGuide   = lazy(() => import('./pages/GoodSamaritanGuide').then(m => ({ default: m.GoodSamaritanGuide })));
const Roadmap              = lazy(() => import('./pages/Roadmap').then(m => ({ default: m.Roadmap })));
const Research             = lazy(() => import('./pages/Research').then(m => ({ default: m.Research })));
const NotificationCenter   = lazy(() => import('./pages/NotificationCenter').then(m => ({ default: m.NotificationCenter })));
const FamilyTracker        = lazy(() => import('./pages/FamilyTracker').then(m => ({ default: m.FamilyTracker })));

// ── Lazy screens ───────────────────────────────────────────────────
const BystanderReport      = lazy(() => import('./screens/BystanderReport').then(m => ({ default: m.BystanderReport })));
const BystanderScreen      = lazy(() => import('./screens/BystanderScreen'));
const GovernancePortal     = lazy(() => import('./screens/GovernancePortal').then(m => ({ default: m.GovernancePortal })));
const ImpactCalculator     = lazy(() => import('./screens/ImpactCalculator').then(m => ({ default: m.ImpactCalculator })));
const CrashPatternAnalytics = lazy(() => import('./screens/CrashPatternAnalytics'));
const FamilyPortal         = lazy(() => import('./screens/FamilyPortal'));
const ResponderView        = lazy(() => import('./screens/ResponderView'));
const HospitalFinder       = lazy(() => import('./screens/HospitalFinder').then(m => ({ default: m.HospitalFinder })));
const ARNavigationView     = lazy(() => import('./components/ARNavigationView').then(m => ({ default: m.ARNavigationView })));
const VolunteerResponderNetwork = lazy(() => import('./components/VolunteerResponderNetwork').then(m => ({ default: m.VolunteerResponderNetwork })));
// ── NEW screens (Prompt 5) ───────────────────────────────────────────
const DispatchedScreen         = lazy(() => import('./screens/DispatchedScreen'));
const FirstAidScreen           = lazy(() => import('./screens/FirstAidScreen'));
const EmergencyContactsScreen  = lazy(() => import('./screens/EmergencyContactsScreen'));
const SettingsScreen           = lazy(() => import('./screens/SettingsScreen'));
const AIAssistantScreen        = lazy(() => import('./screens/AIAssistantScreen'));
const SafetyTimerPage          = lazy(() => import('./pages/SafetyTimerPage'));
const SafetyScoreScreen        = lazy(() => import('./screens/SafetyScoreScreen'));
const OnboardingPage           = lazy(() => import('./pages/OnboardingPage'));

// ── Admin ──────────────────────────────────────────────────────────
const Dashboard = lazy(() => import('./pages/Admin/Dashboard').then(m => ({ default: m.Dashboard })));

// ══════════════════════════════════════════════════════════════════
// Auth guard
// ══════════════════════════════════════════════════════════════════
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// ══════════════════════════════════════════════════════════════════
// Page wrapper — applies shared Framer Motion transition to every page
// ══════════════════════════════════════════════════════════════════
function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-h-full"
    >
      {children}
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Shell pages that hide the bottom nav / SOS button
// ══════════════════════════════════════════════════════════════════
const FULLSCREEN_PATHS = ['/sos-active', '/login', '/dispatched'];

// ══════════════════════════════════════════════════════════════════
// AppInitializer — handles core app initialization logic
// ══════════════════════════════════════════════════════════════════
function AppInitializer() {
  const { init, isRegistered } = useVolunteerStore();

  // Initialise volunteer socket when already registered
  useEffect(() => {
    if (isRegistered) init();
  }, [isRegistered, init]);

  return null;
}

// ══════════════════════════════════════════════════════════════════
// AppContent — renders inside BrowserRouter
// ══════════════════════════════════════════════════════════════════
function AppContent() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  // Focus management on route change
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      focusPageHeading();
    }
  }, [location.pathname]);

  const isFullscreen = FULLSCREEN_PATHS.some(p => location.pathname.startsWith(p));

  return (
    <>
      {/* ── Accessibility regions ─────────────────────────────── */}
      <a
        href="#main-content"
        className="fixed -top-24 left-4 z-9999 bg-amber-500 text-black px-4 py-2 rounded-lg font-semibold text-sm no-underline transition-all focus:top-4"
      >
        Skip to main content
      </a>

      <div id="announcer-assertive" aria-live="assertive" aria-atomic="true" className="sr-only" />
      <div id="announcer-polite" aria-live="polite" aria-atomic="true" className="sr-only" />

      {/* ── App shell ─────────────────────────────────────────── */}
      <div className="w-full min-h-dvh bg-void text-white flex flex-col overflow-x-hidden">
        {/* Safety Timer Strip */}
        <SafetyTimerStrip />

        {/* Top bar */}
        {!isFullscreen && <TopBar />}

        {/* Page content */}
        <main
          id="main-content"
          tabIndex={-1}
          className={`flex-1 outline-none overflow-y-auto overflow-x-hidden relative ${
            isFullscreen ? 'pt-0 pb-0' : 'pt-14 pb-[calc(72px+env(safe-area-inset-bottom,0)+24px)]'
          }`}
          aria-label="Main Content Area"
        >
          <Suspense fallback={<PageLoadingFallback />}>
            <AnimatePresence mode="wait" initial={false}>
              <Routes location={location} key={location.pathname}>

                {/* ── Public ──────────────────────────────────── */}
                <Route path="/login"   element={<Page><LoginPage /></Page>} />
                <Route path="/privacy" element={<Page><PrivacyPage /></Page>} />

                {/* ── Core tabs (Protected) ───────────────────── */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Page><HomeScreen /></Page>
                  </ProtectedRoute>
                } />

                <Route path="/map" element={
                  <ProtectedRoute>
                    <Page><LiveMap /></Page>
                  </ProtectedRoute>
                } />

                <Route path="/assistant" element={
                  <ProtectedRoute>
                    <Page><AIAssistantScreen /></Page>
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Page><Profile /></Page>
                  </ProtectedRoute>
                } />

                {/* ── Emergency flows ──────────────────────────── */}
                <Route path="/sos-active"     element={<Page><SOSActiveScreen /></Page>} />
                <Route path="/dispatched"     element={<Page><DispatchedScreen /></Page>} />
                <Route path="/dispatched/:id" element={<Page><DispatchedScreen /></Page>} />
                <Route path="/bystander"      element={<Page><BystanderScreen /></Page>} />
                <Route path="/report/:incidentId" element={<Page><BystanderReport /></Page>} />

                {/* ── Settings & Account ───────────────────────── */}
                <Route path="/settings"                  element={<Page><SettingsScreen /></Page>} />
                <Route path="/settings/trusted-contacts" element={<Page><TrustedContactsPage /></Page>} />
                <Route path="/settings/whatsapp"         element={<Page><WhatsAppConnectPage /></Page>} />
                <Route path="/settings/consent"          element={<Page><ConsentManagementPage /></Page>} />
                <Route path="/security"                  element={<Page><SecurityDashboard /></Page>} />

                {/* ── Medical ──────────────────────────────────── */}
                <Route path="/medical-profile" element={
                  <ProtectedRoute>
                    <Page><MedicalProfilePage /></Page>
                  </ProtectedRoute>
                } />
                <Route path="/medical" element={<Navigate to="/medical-profile" replace />} />

                {/* ── Info / Resources ─────────────────────────── */}
                <Route path="/first-aid"      element={<Page><FirstAidScreen /></Page>} />
                <Route path="/good-samaritan" element={<Page><GoodSamaritanGuide /></Page>} />
                <Route path="/emergency-contacts" element={
                  <ProtectedRoute>
                    <Page><EmergencyContactsScreen /></Page>
                  </ProtectedRoute>
                } />
                <Route path="/safety-timer" element={
                  <ProtectedRoute>
                    <Page><SafetyTimerPage /></Page>
                  </ProtectedRoute>
                } />
                <Route path="/safety-score" element={
                  <ProtectedRoute>
                    <Page><SafetyScoreScreen /></Page>
                  </ProtectedRoute>
                } />
                <Route path="/onboarding" element={<Page><OnboardingPage /></Page>} />


                {/* ── Map variants ─────────────────────────────── */}
                <Route path="/map/full"   element={<Page><LiveMap /></Page>} />
                <Route path="/hospitals"  element={<Page><HospitalFinder /></Page>} />

                {/* ── Notifications ────────────────────────────── */}
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Page><NotificationCenter /></Page>
                  </ProtectedRoute>
                } />

                {/* ── Community / Family ───────────────────────── */}
                <Route path="/family/:incidentId" element={<Page><FamilyPortal /></Page>} />
                <Route path="/family-tracker"     element={<Page><FamilyTracker /></Page>} />
                <Route path="/volunteer"          element={<Page><VolunteerResponderNetwork /></Page>} />

                {/* ── Responder ────────────────────────────────── */}
                <Route path="/responder/:unitId"         element={<Page><ResponderView /></Page>} />
                <Route path="/responder/:incidentId/ar"  element={<Page><ARNavigationView /></Page>} />

                {/* ── Analytics & Impact ───────────────────────── */}
                <Route path="/analytics"   element={<Page><CrashPatternAnalytics /></Page>} />
                <Route path="/impact"      element={<Page><ImpactCalculator /></Page>} />
                <Route path="/impact-data" element={<Page><Research /></Page>} />
                <Route path="/governance"  element={<Page><GovernancePortal /></Page>} />

                {/* ── Admin ────────────────────────────────────── */}
                <Route path="/dashboard" element={<Page><Dashboard /></Page>} />

                {/* ── Static / docs ────────────────────────────── */}
                <Route path="/vision"   element={<Page><Roadmap /></Page>} />

                {/* ── Legacy redirects ─────────────────────────── */}
                <Route path="/roadmap"   element={<Navigate to="/vision" replace />} />
                <Route path="/research"  element={<Navigate to="/impact-data" replace />} />
                <Route path="/technical" element={<Navigate to="/security" replace />} />

                {/* ── Catch all ────────────────────────────────── */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>

        {/* ── Bottom chrome (hidden on fullscreen pages) ──────── */}
        {!isFullscreen && (
          <>
            <BottomNav />
            <SOSFloatButton />
          </>
        )}

        {/* ── Always-on listeners & banners ───────────────────── */}
        <VoiceNavigationListener />
        <HighStressModeOverlay>
          <></>
        </HighStressModeOverlay>
        <PrivacyConsentBanner />
        <VolunteerAlertScreen />
        <DriveModeListener />
        <SafetyGuardian />
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
// Root App
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <BrowserRouter>
      <AppInitializer />
      <ToastContainer>
        {/* Boot screen — fades out after assets are ready */}
        {loading && (
          <AppLoadingScreen onComplete={() => setLoading(false)} />
        )}

        {/* Main app — always mounted so routes preload */}
        <div className={loading ? 'invisible' : 'visible'}>
          <AppContent />
        </div>
      </ToastContainer>
    </BrowserRouter>
  );
}
