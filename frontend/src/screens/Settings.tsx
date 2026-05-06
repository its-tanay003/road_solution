import React from 'react';
import { useSettingsStore } from '../store/settingsStore';
import type { Theme, TextSize, FontStyle, Language, SosMode } from '../store/settingsStore';
import { Check, Heart, Eye, Move, Smartphone, Globe, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { PushNotificationSetup } from '../components/PushNotificationSetup';
import { DriverBehaviorScore } from '../components/DriverBehaviorScore';
import { SettingsPreview } from '../components/SettingsPreview';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const Settings: React.FC = () => {
  const { 
    theme, setTheme,
    textSize, setTextSize,
    fontStyle, setFontStyle,
    language, setLanguage,
    sosMode, setSosMode,
    reducedMotion, setReducedMotion,
    hapticFeedback, setHapticFeedback,
    emergencyContact, setEmergencyContact
  } = useSettingsStore();
  const { installable, handleInstallClick } = usePWAInstall();

  const themes: { id: Theme; label: string; color: string }[] = [
    { id: 'dark-hud', label: 'Mission Control', color: '#050A14' },
    { id: 'dark-soft', label: 'Night Mode', color: '#0D1B2A' },
    { id: 'high-contrast', label: 'High Contrast', color: '#000000' },
    { id: 'light-clean', label: 'Day Mode', color: '#F8FAFC' },
  ];

  const languages: { id: Language; label: string; native: string }[] = [
    { id: 'en', label: 'English', native: 'English' },
    { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { id: 'te', label: 'Telugu', native: 'తెలుగు' },
    { id: 'bn', label: 'Bengali', native: 'বাংলা' },
  ];

  const sosModes: { id: SosMode; label: string; desc: string }[] = [
    { id: 'hold3s', label: 'Hold 3 Seconds', desc: 'Recommended security' },
    { id: 'tap3x', label: 'Triple Tap', desc: 'Fast discreet alert' },
    { id: 'voice', label: 'Voice Command', desc: '"Hey ROADSoS"' },
    { id: 'shake', label: 'Shake Phone', desc: 'Panic movement' },
  ];

  return (
    <div className="flex-1 bg-night overflow-y-auto px-6 pb-32">
      <div className="pt-12 mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Make ROADSoS yours</h1>
        <p className="text-text-muted font-medium">Everything adjusts instantly. No reloading needed.</p>
      </div>

      {/* Live Preview Strip */}
      <div className="sticky top-0 z-20 bg-night/80 backdrop-blur-md py-4 mb-8">
        <SettingsPreview />
      </div>

      <div className="space-y-10">
        {/* SECTION: APPEARANCE */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-cyan font-black uppercase tracking-[0.2em] text-xs">
            <Eye size={16} /> Appearance
          </div>

          {/* Themes */}
          <div className="grid grid-cols-2 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative h-24 rounded-3xl overflow-hidden border-2 transition-all ${
                  theme === t.id ? 'border-cyan' : 'border-white/10'
                } ${
                  t.id === 'dark-hud' ? 'bg-[#050A14]' : 
                  t.id === 'dark-soft' ? 'bg-[#0D1B2A]' : 
                  t.id === 'high-contrast' ? 'bg-black' : 'bg-[#F8FAFC]'
                }`}
              >
                {theme === t.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-cyan rounded-full flex items-center justify-center">
                    <Check size={14} className="text-night" />
                  </div>
                )}
                <span className={`absolute bottom-3 left-4 font-bold text-sm ${t.id === 'light-clean' ? 'text-night' : 'text-white'}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          {/* Text Size */}
          <div className="space-y-3">
            <label className="text-text-secondary font-bold text-sm">Text Size</label>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {(['small', 'medium', 'large', 'xl', 'xxl'] as TextSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-bold transition-all ${
                    textSize === size 
                    ? 'bg-cyan text-night' 
                    : 'bg-night-2 border border-white/10 text-white'
                  }`}
                >
                  <span className={size === 'small' ? 'text-xs' : size === 'xxl' ? 'text-2xl' : 'text-lg'}>A</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Style */}
          <div className="space-y-3">
            <label className="text-text-secondary font-bold text-sm">Font Style</label>
            <div className="space-y-2">
              {(['inter', 'rajdhani', 'atkinson'] as FontStyle[]).map((font) => (
                <button
                  key={font}
                  onClick={() => setFontStyle(font)}
                  className={`w-full h-14 rounded-2xl px-6 flex items-center justify-between border-2 transition-all ${
                    fontStyle === font ? 'border-cyan bg-cyan/5' : 'border-white/10 bg-night-2'
                  }`}
                >
                  <span className={`text-white font-bold ${
                    font === 'inter' ? 'font-inter' : font === 'rajdhani' ? 'font-rajdhani' : 'font-atkinson'
                  }`}>
                    ROADSoS Help
                  </span>
                  <span className="text-text-muted text-xs uppercase tracking-widest">{font}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: LANGUAGE */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-cyan font-black uppercase tracking-[0.2em] text-xs">
            <Globe size={16} /> Language
          </div>
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`h-20 rounded-3xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                  language === lang.id ? 'border-cyan bg-cyan/5' : 'border-white/10 bg-night-2'
                }`}
              >
                <span className="text-white font-bold">{lang.native}</span>
                <span className="text-text-muted text-[10px] uppercase tracking-widest">{lang.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* SECTION: EMERGENCY SETTINGS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-[var(--color-emergency)] font-black uppercase tracking-[0.2em] text-xs">
            <Heart size={16} /> Emergency Control
          </div>
          
          <div className="space-y-3">
            <label className="text-text-secondary font-bold text-sm">SOS Trigger Gesture</label>
            <div className="space-y-3">
              {sosModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSosMode(mode.id)}
                  className={`w-full h-20 rounded-3xl px-6 flex items-center gap-4 border-2 transition-all ${
                    sosMode === mode.id ? 'border-[var(--color-emergency)] bg-sos-red/5' : 'border-white/10 bg-night-2'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sosMode === mode.id ? 'bg-[var(--color-emergency)]' : 'bg-white/10'}`}>
                    <Smartphone size={20} className={sosMode === mode.id ? 'text-white' : 'text-text-muted'} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-white font-bold">{mode.label}</span>
                    <span className="text-text-muted text-xs">{mode.desc}</span>
                  </div>
                  {mode.id === 'hold3s' && (
                    <span className="ml-auto text-[10px] font-black bg-[var(--color-safe)] text-night px-2 py-0.5 rounded-full">BEST</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-text-secondary font-bold text-sm">Emergency Contact</label>
            <input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="w-full h-16 bg-night-2 border-2 border-white/10 rounded-3xl px-6 text-white font-bold focus:border-cyan outline-none transition-all"
            />
            <p className="text-text-muted text-xs px-2 italic">This person gets an SMS when you trigger SOS.</p>
          </div>
        </section>

        {/* SECTION: RESPONDER NETWORK */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-(--clr-blue) font-black uppercase tracking-[0.2em] text-xs">
            <Smartphone size={16} /> Responder Network
          </div>
          <PushNotificationSetup />
        </section>

        {/* SECTION: SAFETY ANALYTICS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-(--clr-saffron) font-black uppercase tracking-[0.2em] text-xs">
            <Shield size={16} /> Driver Safety Insights
          </div>
          <DriverBehaviorScore />
        </section>

        {/* SECTION: ACCESSIBILITY */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-cyan font-black uppercase tracking-[0.2em] text-xs">
            <Move size={16} /> Advanced Accessibility
          </div>
          <div className="bg-night-2 rounded-4xl border border-white/10 p-2">
            <div className="flex items-center justify-between p-4 px-6 border-b border-white/5">
              <span className="text-white font-bold">Reduce Motion</span>
              <button 
                onClick={() => setReducedMotion(!reducedMotion)}
                aria-label={`Toggle reduced motion ${reducedMotion ? 'off' : 'on'}`}
                className={`w-14 h-8 rounded-full transition-all relative ${reducedMotion ? 'bg-cyan' : 'bg-white/10'}`}
              >
                <motion.div 
                  animate={{ x: reducedMotion ? 26 : 4 }}
                  className="w-6 h-6 bg-white rounded-full absolute top-1"
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 px-6">
              <span className="text-white font-bold">Haptic Feedback</span>
              <button 
                onClick={() => setHapticFeedback(!hapticFeedback)}
                aria-label={`Toggle haptic feedback ${hapticFeedback ? 'off' : 'on'}`}
                className={`w-14 h-8 rounded-full transition-all relative ${hapticFeedback ? 'bg-cyan' : 'bg-white/10'}`}
              >
                <motion.div 
                  animate={{ x: hapticFeedback ? 26 : 4 }}
                  className="w-6 h-6 bg-white rounded-full absolute top-1"
                />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION: PWA INSTALLATION */}
        {installable && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-[var(--color-safe)] font-black uppercase tracking-[0.2em] text-xs">
              <Smartphone size={16} /> App Experience
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full p-6 bg-night-2 border-2 border-[var(--color-safe)] rounded-4xl flex items-center gap-6 group hover:bg-[var(--color-safe)]/5 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-safe)] flex items-center justify-center shadow-lg shadow-safe/20">
                <Smartphone size={28} className="text-night" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white font-bold text-lg">Install ROADSoS App</span>
                <span className="text-text-muted text-sm">Add to home screen for faster access & offline mode</span>
              </div>
            </button>
          </section>
        )}

        {/* FOOTER */}
        <footer className="pt-8 space-y-4 text-center">
          <div className="flex justify-center items-center gap-3">
            <span className="bg-[var(--color-warning)]/10 text-[var(--color-warning)] text-[10px] font-black px-3 py-1 rounded-full border border-[var(--color-warning)]/20">
              NATIONAL ROAD SAFETY NETWORK
            </span>
          </div>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
            Powered by Claude AI • Made in India 🇮🇳
          </p>
          <p className="text-text-muted text-xs">Version 2.5.0 (Extreme Accessibility)</p>
        </footer>
      </div>
    </div>
  );
};
