import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Eye, Type, Activity, Bell, Phone, Check } from 'lucide-react';
import { useAccessibilityStore, useUserStore } from '../store';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { 
    theme, setTheme, 
    textSize, setTextSize, 
    isReducedMotion, setReducedMotion,
    sosTriggerMode, setSosTriggerMode 
  } = useAccessibilityStore();

  const { primaryEmergencyContact, setPrimaryEmergencyContact } = useUserStore();

  const themes = [
    { id: 'light', label: 'LIGHT', icon: Sun },
    { id: 'dark', label: 'DARK', icon: Moon },
    { id: 'high-contrast', label: 'CONTRAST', icon: Eye },
  ];

  const sizes = [
    { id: 'small', label: 'A', className: 'text-sm' },
    { id: 'medium', label: 'A', className: 'text-base' },
    { id: 'large', label: 'A', className: 'text-xl' },
    { id: 'xl', label: 'A', className: 'text-3xl' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy/80 backdrop-blur-md z-2000"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-(--app-bg) z-2001 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 bg-(--app-surface) border-b-4 border-(--app-border) flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black text-(--app-text) tracking-tighter uppercase italic">Settings</h2>
                <p className="text-xs font-black text-[var(--color-emergency)] tracking-widest uppercase mt-1">Accessibility Controls</p>
              </div>
              <button 
                onClick={onClose}
                aria-label="Close Settings"
                title="Close Settings"
                className="w-16 h-16 flex items-center justify-center rounded-2xl bg-navy text-white shadow-lg active:scale-90 transition-transform"
              >
                <X size={32} strokeWidth={4} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-12 pb-40">
              
              {/* Theme Selection */}
              <section className="space-y-6">
                <h3 className="text-xl font-black flex items-center gap-3 text-(--app-text) uppercase tracking-tight">
                  <div className="p-2 bg-amber/20 rounded-[var(--radius-lg)] text-amber">
                    <Sun size={24} strokeWidth={3} />
                  </div>
                  Visual Theme
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as 'light' | 'dark' | 'high-contrast')}
                      className={`h-24 flex items-center justify-between px-8 rounded-3xl border-4 transition-all active:scale-[0.98] ${
                        theme === t.id 
                        ? 'border-navy bg-navy text-white shadow-xl' 
                        : 'border-(--app-border) bg-(--app-surface) text-(--app-text)'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <t.icon size={32} strokeWidth={3} />
                        <span className="text-2xl font-black tracking-tighter italic">{t.label}</span>
                      </div>
                      {theme === t.id && <Check size={32} strokeWidth={4} />}
                    </button>
                  ))}
                </div>
              </section>

              {/* Text Size */}
              <section className="space-y-6">
                <h3 className="text-xl font-black flex items-center gap-3 text-(--app-text) uppercase tracking-tight">
                  <div className="p-2 bg-blue-500/20 rounded-[var(--radius-lg)] text-blue-500">
                    <Type size={24} strokeWidth={3} />
                  </div>
                  Text Size
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {sizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setTextSize(s.id as 'small' | 'medium' | 'large' | 'xl')}
                      className={`h-20 flex items-center justify-center rounded-2xl border-4 transition-all active:scale-90 ${
                        textSize === s.id 
                        ? 'border-navy bg-navy text-white' 
                        : 'border-(--app-border) bg-(--app-surface) text-(--app-text)'
                      }`}
                    >
                      <span className={`${s.className} font-black`}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* SOS Trigger */}
              <section className="space-y-6">
                <h3 className="text-xl font-black flex items-center gap-3 text-(--app-text) uppercase tracking-tight">
                  <div className="p-2 bg-[rgba(255,59,59,0.20)] rounded-[var(--radius-lg)] text-[var(--color-emergency)]">
                    <Bell size={24} strokeWidth={3} />
                  </div>
                  SOS Trigger Mode
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {['hold', 'tap'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSosTriggerMode(mode as 'hold' | 'tap' | 'voice')}
                      className={`h-24 flex items-center justify-between px-8 rounded-3xl border-4 transition-all active:scale-[0.98] ${
                        sosTriggerMode === mode 
                        ? 'border-[var(--color-emergency)] bg-[var(--color-emergency)] text-white shadow-xl' 
                        : 'border-(--app-border) bg-(--app-surface) text-(--app-text)'
                      }`}
                    >
                      <div className="text-left">
                        <span className="text-2xl font-black tracking-tighter italic uppercase">{mode}</span>
                        <p className="text-xs font-bold opacity-80">
                          {mode === 'hold' ? '3s Long Press (Safe)' : 'Single Tap (Instant)'}
                        </p>
                      </div>
                      {sosTriggerMode === mode && <Check size={32} strokeWidth={4} />}
                    </button>
                  ))}
                </div>
              </section>

              {/* Reduced Motion */}
              <button
                onClick={() => setReducedMotion(!isReducedMotion)}
                className={`w-full p-6 rounded-3xl border-4 flex items-center justify-between transition-all active:scale-[0.98] ${
                  isReducedMotion 
                  ? 'border-[var(--color-safe)] bg-[var(--color-safe)] text-white' 
                  : 'border-(--app-border) bg-(--app-surface) text-(--app-text)'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${isReducedMotion ? 'bg-white/20' : 'bg-safe/20 text-[var(--color-safe)]'}`}>
                    <Activity size={24} strokeWidth={3} />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-black italic uppercase tracking-tighter">Reduced Motion</p>
                    <p className="text-xs font-bold opacity-80">Minimal animations for safety</p>
                  </div>
                </div>
                <div className={`w-16 h-8 rounded-full relative transition-colors ${isReducedMotion ? 'bg-white/30' : 'bg-gray-300'}`}>
                  <motion.div
                    animate={{ x: isReducedMotion ? 36 : 4 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </div>
              </button>

              {/* Emergency Contact */}
              <section className="space-y-6">
                <h3 className="text-xl font-black flex items-center gap-3 text-(--app-text) uppercase tracking-tight">
                  <div className="p-2 bg-navy/20 rounded-[var(--radius-lg)] text-navy">
                    <Phone size={24} strokeWidth={3} />
                  </div>
                  Auto-Call Contact
                </h3>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="ENTER PHONE NUMBER"
                    aria-label="Emergency auto-call phone number"
                    title="Emergency auto-call phone number"
                    value={primaryEmergencyContact || ''}
                    onChange={(e) => setPrimaryEmergencyContact(e.target.value)}
                    className="w-full h-20 px-8 rounded-3xl border-4 border-(--app-border) bg-(--app-surface) text-2xl font-black text-navy focus:border-navy outline-none placeholder:text-navy/20 uppercase italic tracking-tighter"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-navy/40 pointer-events-none">
                    <Phone size={24} strokeWidth={3} />
                  </div>
                </div>
                <p className="text-xs font-black text-[var(--color-emergency)] uppercase tracking-widest px-4">
                  * This number is called automatically when SOS is triggered.
                </p>
              </section>
            </div>
            
            {/* Footer */}
            <div className="p-8 bg-(--app-surface) border-t-4 border-(--app-border) flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 h-20 bg-navy text-white rounded-2xl font-black text-2xl shadow-xl active:scale-95 transition-transform uppercase italic tracking-tighter"
              >
                SAVE & CLOSE
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
