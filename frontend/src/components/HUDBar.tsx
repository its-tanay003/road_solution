import React from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { Settings, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface HUDBarProps {
  onSettingsClick: () => void;
}

export const HUDBar: React.FC<HUDBarProps> = ({ onSettingsClick }) => {
  const { language } = useSettingsStore();

  const langMap: Record<string, { label: string; flag: string }> = {
    en: { label: 'EN', flag: '🇺🇸' },
    hi: { label: 'HI', flag: '🇮🇳' },
    ta: { label: 'TA', flag: '🇮🇳' },
    bn: { label: 'BN', flag: '🇮🇳' },
  };

  return (
    <header className="h-[60px] glass fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-sos-red rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,23,68,0.4)]">
          <Shield size={20} className="text-white fill-current" />
        </div>
        <span className="text-xl font-rajdhani font-bold text-white tracking-tighter">
          ROAD<span className="text-sos-red">S</span>oS
        </span>
      </div>

      {/* Center: Live Status */}
      <div className="hidden md:flex items-center gap-3 bg-night-3/50 px-4 py-1.5 rounded-full border border-white/5">
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 bg-safe-green rounded-full shadow-[0_0_8px_rgba(0,230,118,0.6)]" 
        />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-safe-green">System Active</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-night-2 px-3 py-1.5 rounded-xl border border-white/10">
          <span className="text-lg">{langMap[language]?.flag || '🌐'}</span>
          <span className="text-xs font-bold text-white">{langMap[language]?.label || 'EN'}</span>
        </div>
        
        <button 
          onClick={onSettingsClick}
          className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-cyan transition-colors active:scale-90"
          aria-label="Open Settings"
        >
          <Settings size={24} />
        </button>
      </div>
    </header>
  );
};
