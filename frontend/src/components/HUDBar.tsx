import { useSocket } from '../hooks/useSocket';
import { useSettingsStore } from '../store/settingsStore';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { Settings, Shield, Mic } from 'lucide-react';

function SoundMonitorDot() {
  const { soundMonitorActive } = useAccessibilityStore();
  if (!soundMonitorActive) return null;
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 animate-pulse">
      <Mic size={10} className="text-cyan-400" />
      <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-tighter">Mic Active</span>
    </div>
  );
}



function ConnectionDot() {
  const { connected, reconnectCount } = useSocket();
  const title = connected ? 'Live' : reconnectCount > 0 ? `Reconnecting (${reconnectCount})` : 'Disconnected';
  return (
    <div
      title={title}
      className={`shrink-0 w-[7px] h-[7px] rounded-full transition-colors duration-300 ${
        connected ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 
        reconnectCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-red-500 animate-pulse'
      }`}
    />
  );
}

interface HUDBarProps {
  onSettingsClick: () => void;
}

export const HUDBar: React.FC<HUDBarProps> = ({ onSettingsClick }) => {
  const { language } = useSettingsStore();
  const { connected, reconnectCount } = useSocket();


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
        <div className="w-8 h-8 bg-(--color-emergency) rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,23,68,0.4)]">
          <Shield size={20} className="text-white fill-current" />
        </div>
        <span className="text-xl font-rajdhani font-bold text-white tracking-tighter">
          ROAD<span className="text-(--color-emergency)">S</span>oS
        </span>
      </div>

      {/* Center: Live Status */}
      <div className="hidden md:flex items-center gap-3 bg-night-3/50 px-4 py-1.5 rounded-full border border-white/5">
        <ConnectionDot />
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${connected ? 'text-(--color-safe)-green' : reconnectCount > 0 ? 'text-amber-500' : 'text-(--color-emergency)'}`}>
          {connected ? 'System Active' : reconnectCount > 0 ? `Reconnecting (${reconnectCount})` : 'Offline Mode'}
        </span>
      </div>


      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-night-2 px-3 py-1.5 rounded-xl border border-white/10">
          <SoundMonitorDot />
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
