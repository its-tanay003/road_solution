import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSosStore, useUIStore, useUserStore } from '../store';
import { 
  Phone, 
  Map as MapIcon, 
  Heart, 
  Users, 
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  X as CloseIcon
} from 'lucide-react';
import { NearestTraumaCenter } from './NearestTraumaCenter';
import { logger } from '../lib/logger';

export const PanicModeOverlay: React.FC = () => {
  const { isActive, cancelSos, countdownTime, india112Alerted } = useSosStore();
  const { isCrackedScreen, isGloveMode, setUxMode } = useUIStore();
  const { activeCountry } = useUserStore();
  const [activeTab, setActiveTab] = useState<'CALL' | 'MAP' | 'HELP' | 'CONTACTS'>('HELP');

  // Prevent sleep
  useEffect(() => {
    let wakeLock: { release: () => unknown } | null = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<{ release: () => unknown }> } }).wakeLock.request('screen');
        }
      } catch (err) {
        logger.error('Wake Lock error:', err);
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLock) {
        const promise = wakeLock.release();
        if (promise instanceof Promise) {
          promise.catch((err) => logger.error('Wake Lock release error:', err));
        }
      }
    };
  }, []);

  // Theme constants based on Panic Mode principles
  const baseBg = isCrackedScreen ? 'bg-black' : 'bg-white';
  const baseText = isCrackedScreen ? 'text-white' : 'text-black';
  const targetSize = isGloveMode ? 'h-[112px]' : 'h-[80px]';
  const textSize = 'text-[20px]';

  return (
    <div className={`fixed inset-0 z-1000 ${baseBg} ${baseText} flex flex-col font-sans overflow-hidden select-none`}>
      
      {/* Top Status Area (Information Only) */}
      <div className="h-1/3 p-8 flex flex-col items-center justify-center text-center">
        {isActive ? (
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <CheckCircle2 size={48} className="text-emerald-500" />
              <h1 className="text-4xl font-black uppercase tracking-tighter text-emerald-500">
                Help is coming
              </h1>
            </div>
            <p className={`${textSize} font-black uppercase opacity-60`}>
              Responders dispatched
            </p>
            <div className="flex flex-col items-center gap-2 mt-4">
              {india112Alerted && (
                <div className="px-4 py-1 rounded-full bg-blue-600/20 border border-blue-500/50 text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} />
                  112 (India) Alerted
                </div>
              )}
              <div className="p-4 rounded-3xl bg-red-600 text-white inline-block shadow-lg shadow-red-600/20">
                <span className="text-2xl font-black">ETA: {Math.floor(countdownTime / 60)}:{(countdownTime % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
            
            <NearestTraumaCenter />
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AlertCircle size={64} className="text-red-600 mx-auto" />
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              Emergency Active
            </h1>
          </div>
        )}
      </div>

      {/* Main Action Area (Thumb Zone - Bottom 60%) */}
      <div className="flex-1 flex flex-col justify-end p-6 space-y-4 pb-32 overflow-y-auto">
        {activeTab === 'HELP' && (
          <>
            <button
              onClick={() => {}} // Open AI Triage
              className={`w-full ${targetSize} rounded-4xl bg-nx-blue-primary text-white flex items-center justify-between px-8 transition-transform active:scale-95 shadow-lg`}
            >
              <div className="flex items-center gap-4 text-left">
                <MessageCircle size={32} />
                <span className={`${textSize} font-black uppercase`}>Talk to AI</span>
              </div>
              <ChevronRight size={32} />
            </button>

            <a
              href={`tel:${activeCountry.emergencyNumbers.main}`}
              className={`w-full ${targetSize} rounded-4xl bg-red-600 text-white flex items-center justify-between px-8 transition-transform active:scale-95 shadow-lg`}
            >
              <div className="flex items-center gap-4 text-left">
                <Phone size={32} />
                <span className={`${textSize} font-black uppercase`}>Call {activeCountry.emergencyNumbers.main}</span>
              </div>
              <ChevronRight size={32} />
            </a>
          </>
        )}

        {activeTab === 'MAP' && (
          <div className="h-[300px] rounded-[2.5rem] overflow-hidden border-4 border-red-600">
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <MapIcon size={64} className="text-slate-300" />
            </div>
          </div>
        )}

        {activeTab === 'CALL' && (
          <div className="grid grid-cols-1 gap-4">
            <a href={`tel:${activeCountry.emergencyNumbers.ambulance || '108'}`} className={`w-full ${targetSize} rounded-4xl bg-red-600 text-white flex items-center gap-4 px-8 shadow-lg`}>
              <Phone size={32} />
              <span className={`${textSize} font-black uppercase`}>Ambulance</span>
            </a>
            <a href={`tel:${activeCountry.emergencyNumbers.police || '100'}`} className={`w-full ${targetSize} rounded-4xl bg-blue-600 text-white flex items-center gap-4 px-8 shadow-lg`}>
              <Users size={32} />
              <span className={`${textSize} font-black uppercase`}>Police</span>
            </a>
          </div>
        )}

        {activeTab === 'CONTACTS' && (
          <div className="space-y-4">
            <p className="text-xs font-black uppercase opacity-40 px-4">Emergency Contacts notified</p>
            <div className={`w-full ${targetSize} rounded-4xl bg-slate-100 text-black flex items-center justify-between px-8 border border-black/10`}>
              <span className={`${textSize} font-black`}>Family (Sarah)</span>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest">SENT</span>
            </div>
          </div>
        )}
      </div>

      {/* Panic Mode Bottom Navigation */}
      <div className={`h-28 border-t-4 ${isCrackedScreen ? 'border-white/20' : 'border-slate-100'} flex items-center justify-around px-2`}>
        {(
          [
            { id: 'CALL', icon: Phone, label: 'CALL' },
            { id: 'MAP', icon: MapIcon, label: 'MAP' },
            { id: 'HELP', icon: Heart, label: 'HELP' },
            { id: 'CONTACTS', icon: Users, label: 'CONTACTS' }
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex flex-col items-center justify-center w-24 h-20 rounded-2xl transition-colors
              ${activeTab === tab.id ? 'bg-red-600 text-white' : isCrackedScreen ? 'text-slate-500' : 'text-slate-400'}
            `}
          >
            <tab.icon size={32} />
            <span className="text-[10px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Adaptation Indicators */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {isCrackedScreen && (
          <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
            CRACKED SCREEN MODE
          </span>
        )}
        {isGloveMode && (
          <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
            GLOVE MODE ACTIVE
          </span>
        )}
      </div>

      {/* Emergency Exit (Top Right) */}
      <button 
        onDoubleClick={() => {
          cancelSos();
          setUxMode('DEFAULT');
        }}
        className="absolute top-4 right-4 p-4 text-[10px] font-black opacity-40 uppercase tracking-widest"
      >
        <div className="flex flex-col items-center">
          <CloseIcon size={16} />
          <span>Exit [x2]</span>
        </div>
      </button>
    </div>
  );
};
