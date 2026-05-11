import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCcw } from 'lucide-react';
import { useAccessibilityStore } from '../store/accessibilityStore';
import type { FontSize, FontWeight, LetterSpacing, Theme, Language } from '../store/accessibilityStore';
import { useSettingsPanel } from '../hooks/useSettingsPanel';
import { DeafModePanel } from './DeafModePanel';
import { buttonAria, switchAria } from '../utils/aria-utils';

export const SettingsPanel: React.FC = () => {
  const { isOpen, close } = useSettingsPanel();
  const store = useAccessibilityStore();

  const themes: { id: Theme; label: string; color: string }[] = [
    { id: 'dark', label: 'Default Dark', color: 'bg-[#080C14]' },
    { id: 'light', label: 'Light Mode', color: 'bg-[#FFFFFF]' },
    { id: 'high-contrast', label: 'High Contrast', color: 'bg-[#000000]' },
    { id: 'saffron', label: 'India Saffron', color: 'bg-[#FF9933]' },
  ];

  const fontSizes: FontSize[] = ['sm', 'md', 'lg', 'xl', 'xxl'];
  const languages: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिन्दी' },
    { id: 'ta', label: 'தமிழ்' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-2000 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ x: 380 }}
          animate={{ x: 0 }}
          exit={{ x: 380 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-[380px] h-full bg-(--clr-bg) border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-xl font-bold tracking-tight text-(--clr-text)">PREFERENCES</h2>
            <button 
              onClick={close}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Close Settings"
              aria-label="Close Settings"
            >
              <X size={24} className="text-(--clr-text)" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-10 pb-24">
            
            {/* Theme Section */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-(--clr-text-2) uppercase tracking-widest">Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => store.setTheme(t.id)}
                    className="group flex flex-col items-center gap-2"
                  >
                    <div 
                      className={`w-full aspect-square rounded-2xl border-2 flex items-center justify-center relative transition-all ${t.color} ${
                        store.theme === t.id 
                        ? 'border-(--clr-blue) shadow-[0_0_15px_rgba(var(--clr-blue-rgb),0.3)]' 
                        : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      {store.theme === t.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/10 rounded-2xl">
                          <Check size={24} className={t.id === 'light' ? 'text-black' : 'text-(--clr-blue)'} />
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${store.theme === t.id ? 'text-(--clr-blue)' : 'text-(--clr-text-2)'}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Font Size Section */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-(--clr-text-2) uppercase tracking-widest">Font Size</h3>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => store.setFontSize(size)}
                    className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${
                      store.fontSize === size 
                      ? 'bg-(--clr-blue) text-white shadow-lg' 
                      : 'text-(--clr-text-2) hover:text-(--clr-text) hover:bg-white/5'
                    }`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
              
              {/* Preview Paragraph */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-(--clr-text) transition-all text-(length:--app-font-size)">
                  Emergency alert sent. Ambulance ETA 6 minutes.
                </p>
              </div>
            </section>

            {/* Text Style Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-(--clr-text-2) uppercase tracking-widest">Weight</h3>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                  {(['normal', 'bold'] as FontWeight[]).map((w) => (
                    <button
                      key={w}
                      onClick={() => store.setFontWeight(w)}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                        store.fontWeight === w 
                        ? 'bg-(--clr-blue) text-white' 
                        : 'text-(--clr-text-2) hover:text-(--clr-text)'
                      }`}
                    >
                      {w.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-(--clr-text-2) uppercase tracking-widest">Spacing</h3>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                  {(['normal', 'spaced'] as LetterSpacing[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => store.setLetterSpacing(s)}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                        store.letterSpacing === s 
                        ? 'bg-(--clr-blue) text-white' 
                        : 'text-(--clr-text-2) hover:text-(--clr-text)'
                      }`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Language Section */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-(--clr-text-2) uppercase tracking-widest">Language</h3>
              <div className="grid grid-cols-3 gap-2">
                {languages.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => store.setLanguage(l.id)}
                    className={`py-3 rounded-xl border font-bold text-xs transition-all ${
                      store.language === l.id 
                      ? 'bg-(--clr-blue) border-(--clr-blue) text-white shadow-lg' 
                      : 'bg-white/5 border-white/10 text-(--clr-text-2) hover:border-white/30'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Accessibility Section */}
            <section className="space-y-6">
              <h3 className="text-xs font-bold text-(--clr-text-2) uppercase tracking-widest">Accessibility</h3>
              
              <DeafModePanel />

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-(--clr-text)">Voice Navigation</p>
                    <p className="text-[10px] text-(--clr-text-2)">Control app via "Go home", "Open map" etc.</p>
                  </div>
                  <button 
                    onClick={() => store.setVoiceNavEnabled(!store.voiceNavEnabled)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${store.voiceNavEnabled ? 'bg-(--clr-blue)' : 'bg-white/10'}`}
                    {...buttonAria("Toggle Voice Navigation", store.voiceNavEnabled)}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${store.voiceNavEnabled ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-(--clr-text)">Text-to-Speech</p>
                    <p className="text-[10px] text-(--clr-text-2)">Announce alerts and UI changes</p>
                  </div>
                  <button 
                    onClick={() => store.setTtsEnabled(!store.ttsEnabled)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${store.ttsEnabled ? 'bg-(--clr-blue)' : 'bg-white/10'}`}
                    {...buttonAria("Toggle Text-to-Speech", store.ttsEnabled)}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${store.ttsEnabled ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-(--clr-text)">Stress Auto-Mode</p>
                    <p className="text-[10px] text-(--clr-text-2)">Enable high-contrast mode during emergency</p>
                  </div>
                  <button 
                    onClick={() => store.setHighStressAutoActivate(!store.highStressAutoActivate)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${store.highStressAutoActivate ? 'bg-(--clr-blue)' : 'bg-white/10'}`}
                    {...buttonAria("Toggle High Stress Auto-Activation", store.highStressAutoActivate)}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${store.highStressAutoActivate ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Simplified Mode Section */}
            <section className="space-y-4">
              <button
                onClick={() => store.setSimplifiedMode(!store.simplifiedMode)}
                {...switchAria(store.simplifiedMode)}
                aria-label="Simple Mode"
                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  store.simplifiedMode 
                  ? 'bg-(--clr-blue)/10 border-(--clr-blue)' 
                  : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-left">
                  <p className={`text-sm font-bold ${store.simplifiedMode ? 'text-(--clr-blue)' : 'text-(--clr-text)'}`}>Simple Mode</p>
                  <p className="text-[10px] text-(--clr-text-2)">Shows only SOS, map, and hospitals</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${store.simplifiedMode ? 'bg-(--clr-blue)' : 'bg-white/20'}`}>
                  <motion.div
                    animate={{ x: store.simplifiedMode ? 26 : 2 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                  />
                </div>
              </button>
            </section>

            {/* Connections Section */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-(--clr-text-2) uppercase tracking-widest">Connections</h3>
              <div className="space-y-2">
                <button
                  onClick={() => { close(); window.location.href = '/settings/trusted-contacts'; }}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all"
                >
                  <p className="text-sm font-bold text-(--clr-text)">Trusted Contacts</p>
                  <p className="text-[10px] text-(--clr-text-2)">Family and emergency responders</p>
                </button>
                <button
                  onClick={() => { close(); window.location.href = '/settings/whatsapp'; }}
                  className="w-full p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-left hover:bg-green-500/10 transition-all"
                >
                  <p className="text-sm font-bold text-green-500">WhatsApp Alert</p>
                  <p className="text-[10px] text-green-500/60">Automated incident notification</p>
                </button>
              </div>
            </section>

            {/* Privacy & Safety Section */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-(--clr-text-2) uppercase tracking-widest">Privacy & Safety</h3>
              <div className="space-y-2">
                <button
                  onClick={() => { close(); window.location.href = '/settings/consent'; }}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all"
                >
                  <p className="text-sm font-bold text-(--clr-text)">Data Consent</p>
                  <p className="text-[10px] text-(--clr-text-2)">Manage granular permissions</p>
                </button>
                <button
                  onClick={() => { close(); window.location.href = '/privacy'; }}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all"
                >
                  <p className="text-sm font-bold text-(--clr-text)">Privacy Policy</p>
                  <p className="text-[10px] text-(--clr-text-2)">DPDP Act 2023 Compliance</p>
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure? This will permanently erase your medical profile and emergency contacts from our servers.')) {
                      try {
                        const res = await fetch('/api/user/data', { method: 'DELETE' });
                        if (res.ok) {
                          alert('All personal data erased.');
                          store.resetToDefaults();
                          window.location.reload();
                        } else {
                          alert('Error erasing data. Please try again later.');
                        }
                      } catch {
                        alert('Network error.');
                      }
                    }
                  }}
                  className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left hover:bg-red-500/20 transition-all group"
                >
                  <p className="text-sm font-bold text-red-500">Delete My Data</p>
                  <p className="text-[10px] text-red-400 opacity-60 group-hover:opacity-100">Permanent erasure of medical records</p>
                </button>
              </div>
            </section>

            {/* Reset Defaults */}
            <button
              onClick={() => store.resetToDefaults()}
              className="w-full py-4 rounded-xl border border-white/10 bg-white/5 text-(--clr-text-2) text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 hover:text-(--clr-text) transition-all mt-4"
            >
              <RotateCcw size={14} />
              RESET ALL PREFERENCES
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
