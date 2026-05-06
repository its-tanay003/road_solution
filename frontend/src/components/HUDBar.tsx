import { useSocket } from '../hooks/useSocket';
import { useSettingsStore } from '../store/settingsStore';
import { Settings, Shield } from 'lucide-react';



function ConnectionDot() {
  const { connected, reconnectCount } = useSocket();
  const color = connected ? '#32D74B' : reconnectCount > 0 ? '#FF9F0A' : '#FF3B3B';
  const title = connected ? 'Live' : reconnectCount > 0 ? `Reconnecting (${reconnectCount})` : 'Disconnected';
  return (
    <div
      title={title}
      style={{
        width: 7, height: 7, borderRadius: '50%', background: color,
        boxShadow: connected ? `0 0 10px ${color}80` : 'none',
        animation: connected ? 'none' : 'pulse 1s ease-in-out infinite',
        flexShrink: 0,
        transition: 'background 0.3s ease'
      }}
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
        <div className="w-8 h-8 bg-sos-red rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,23,68,0.4)]">
          <Shield size={20} className="text-white fill-current" />
        </div>
        <span className="text-xl font-rajdhani font-bold text-white tracking-tighter">
          ROAD<span className="text-sos-red">S</span>oS
        </span>
      </div>

      {/* Center: Live Status */}
      <div className="hidden md:flex items-center gap-3 bg-night-3/50 px-4 py-1.5 rounded-full border border-white/5">
        <ConnectionDot />
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${connected ? 'text-safe-green' : reconnectCount > 0 ? 'text-amber-500' : 'text-sos-red'}`}>
          {connected ? 'System Active' : reconnectCount > 0 ? `Reconnecting (${reconnectCount})` : 'Offline Mode'}
        </span>
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
