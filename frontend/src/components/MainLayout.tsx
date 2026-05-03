import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, Map, MessageSquare, User, Settings, WifiOff, LayoutDashboard, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNetworkStore, useSosStore } from '../store';
import { DemoController } from './Demo/DemoController';

export const MainLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { isLowBandwidth } = useNetworkStore();
  const { isActive } = useSosStore();

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
    { path: '/', icon: ShieldAlert, label: 'CORE' },
    { path: '/map', icon: Map, label: 'ASSETS' },
    { path: '/chat', icon: MessageSquare, label: 'TRIAGE' },
    { path: '/profile', icon: User, label: 'VAULT' },
    { path: '/b2b', icon: Database, label: 'RELAY' },
  ];

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base)] text-[var(--nx-text-primary)] flex flex-col font-sans overflow-x-hidden">
      {/* Tactical Header Overlay for System Banners */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            className="bg-[var(--nx-amber-primary)] text-black px-4 py-1 text-center text-[10px] font-black uppercase tracking-[0.2em] z-[600] flex items-center justify-center gap-2"
          >
            <WifiOff size={12} />
            WORKING OFFLINE — PROTOCOL L-2 ACTIVE
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Desktop Sidebar - NEXUS Style */}
        <aside className="hidden lg:flex flex-col w-16 border-r border-[var(--nx-border)] bg-[var(--nx-bg-surface)] z-[500] items-center py-6 gap-8">
           <div className="w-10 h-10 bg-[var(--nx-red-primary)] rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(255,59,59,0.3)] mb-4">
              <ShieldAlert size={24} className="text-white" />
           </div>

           <div className="flex flex-col gap-4">
              {navItems.map((item) => {
                const isItemActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <button 
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-10 h-10 flex items-center justify-center rounded-sm transition-all group relative ${isItemActive ? 'bg-white/5 text-[var(--nx-red-primary)]' : 'text-[var(--nx-text-tertiary)] hover:text-white hover:bg-white/[0.03]'}`}
                  >
                    <Icon size={20} />
                    {isItemActive && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--nx-red-primary)] shadow-[0_0_8px_var(--nx-red-primary)]"
                      />
                    )}
                    {/* Tooltip */}
                    <div className="absolute left-14 px-2 py-1 bg-[var(--nx-bg-elevated)] border border-[var(--nx-border)] text-[9px] font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                       {item.label}
                    </div>
                  </button>
                );
              })}
           </div>

           <div className="mt-auto flex flex-col gap-4">
              <button onClick={() => navigate('/status')} className="w-10 h-10 flex items-center justify-center text-[var(--nx-text-tertiary)] hover:text-white transition-colors">
                <LayoutDashboard size={20} />
              </button>
           </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto relative pb-20 lg:pb-0">
          <Outlet />
          
          {/* Tactical Frame Decorations */}
          <div className="fixed top-0 right-0 p-4 pointer-events-none z-40 opacity-20 hidden lg:block">
             <div className="text-[10px] font-mono text-right">
                <div>COORD: {location.pathname.toUpperCase()}</div>
                <div>SEC: ALPHA-9</div>
             </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - NEXUS Style */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-[var(--nx-bg-surface)]/95 backdrop-blur-3xl border-t border-[var(--nx-border)] z-[500] px-6 h-20 flex justify-around items-center pb-safe shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isItemActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-all ${isItemActive ? 'text-[var(--nx-red-primary)]' : 'text-[var(--nx-text-tertiary)]'}`}
            >
              <div className={`p-2 rounded-sm ${isItemActive ? 'bg-[var(--nx-red-dim)]' : ''}`}>
                <Icon size={20} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <DemoController />

      {/* Active SOS Critical Overlay Overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.2, 0.1, 0.2, 0.1],
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="fixed inset-0 pointer-events-none z-[1000] border-[20px] border-[var(--nx-red-primary)]/10 shadow-[inset_0_0_150px_rgba(255,59,59,0.2)]"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
