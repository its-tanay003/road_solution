import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, Map, MessageSquare, User, Settings, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNetworkStore } from '../store';

export const MainLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { isLowBandwidth } = useNetworkStore();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { path: '/', icon: ShieldAlert, label: t('nav.home', 'SOS') },
    { path: '/feed', icon: Map, label: t('nav.feed', 'Safety Feed') },
    { path: '/chat', icon: MessageSquare, label: t('nav.triage', 'Triage') },
    { path: '/profile', icon: User, label: t('nav.profile', 'Profile') },
    { path: '/b2b', icon: Settings, label: t('nav.b2b', 'B2B Hub') },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-navy via-background to-black text-card flex flex-col font-sans overflow-x-hidden">
      
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-amber-600 text-white p-2 text-center text-sm font-mono flex items-center justify-center space-x-2 z-50 sticky top-0"
          >
            <WifiOff size={16} />
            <span>Working Offline - Using Cached Data</span>
          </motion.div>
        )}
        
        {isLowBandwidth && !isOffline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-blue-600/90 backdrop-blur-sm text-white p-2 text-center text-sm font-mono flex items-center justify-center space-x-2 z-50 sticky top-0"
          >
            <span>Low Network - Animations Disabled</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 lg:pb-0 relative">
        <Outlet />
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 w-full bg-navy/80 backdrop-blur-xl p-3 flex justify-around items-center lg:hidden border-t border-white/10 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'text-emergency scale-110' : 'text-muted hover:text-white hover:scale-105'}`}
            >
              <Icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_rgba(215,38,56,0.8)]' : ''} />
              <span className={`text-[10px] mt-1 font-mono tracking-wider uppercase ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar for Desktop (Optional extension later) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-20 bg-navy/80 backdrop-blur-xl border-r border-white/10 flex-col items-center py-8 space-y-8 z-50">
        <ShieldAlert className="text-emergency drop-shadow-[0_0_10px_rgba(215,38,56,0.8)]" size={32} />
        <div className="flex flex-col space-y-6 flex-1 w-full mt-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)}
                aria-label={item.label}
                className={`w-full flex justify-center py-3 border-r-2 transition-all ${isActive ? 'text-emergency border-emergency bg-white/5' : 'text-muted border-transparent hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_rgba(215,38,56,0.8)]' : ''} />
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
};
