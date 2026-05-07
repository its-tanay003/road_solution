import React from 'react';
import { Shield } from 'lucide-react';

export const SettingsPreview: React.FC = () => {

  return (
    <div className="w-full h-48 bg-black rounded-[2rem] overflow-hidden border border-white/10 relative">
      <div className="absolute inset-0 hud-grid opacity-20" />
      
      {/* Mini HUD Bar */}
      <div className="h-8 glass flex items-center justify-between px-4 relative z-10">
        <div className="flex items-center gap-1">
          <Shield size={12} className="text-(--color-emergency)" />
          <span className="text-[10px] font-bold text-white uppercase tracking-tighter">ROADSoS</span>
        </div>
        <div className="w-2 h-2 bg-(--color-safe) rounded-full" />
      </div>

      {/* Mini SOS Button */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-20 h-20 bg-(--color-emergency) rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,23,68,0.3)]">
          <span className="text-white text-xl font-black font-rajdhani">SOS</span>
        </div>
        
        {/* Sample Text */}
        <p className="mt-4 text-center font-medium transition-all" style={{ fontSize: 'var(--app-font-size)', color: 'var(--app-text)' }}>
          Emergency Help
        </p>
      </div>

      {/* Status Indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        <div className="w-1 h-1 bg-cyan rounded-full" />
        <div className="w-1 h-1 bg-white/20 rounded-full" />
        <div className="w-1 h-1 bg-white/20 rounded-full" />
      </div>
    </div>
  );
};
