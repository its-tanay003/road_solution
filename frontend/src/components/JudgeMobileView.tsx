import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  Wifi,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { logger } from '../lib/logger';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const JudgeMobileView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session') || 'UNKNOWN';
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [name, setName] = useState('');
  const [isTriggered, setIsTriggered] = useState(false);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Acquire GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => {
          logger.error(err);
          setError('GPS Access Denied. Using mock location.');
          setLocation([28.6139, 77.2090]); // Fallback Delhi
        }
      );
    }

    const s = io(SOCKET_URL);
    s.on('connect', () => {
      logger.log('Mobile socket connected');
      setSocket(s);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const handleSOS = () => {
    if (!socket || !location) return;

    setIsTriggered(true);
    socket.emit('judge:sos', {
      name: name || 'Anonymous Judge',
      location,
      sessionId,
      timestamp: new Date()
    });

    // Reset after 5 seconds to allow re-triggering
    setTimeout(() => {
      setIsTriggered(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-6 font-sans">
      <div className="w-full max-w-md flex flex-col h-full space-y-12 pt-12">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-red-500/20 p-4 rounded-3xl">
            <ShieldAlert className="text-red-500 w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight uppercase">Judge Terminal</h1>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest justify-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Connected to {sessionId}
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Your Name (Optional)
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Judge Smith"
              className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-slate-700 shadow-xl"
            />
          </div>

          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <MapPin size={18} className="text-blue-400" />
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">GPS Telemetry</div>
                <div className="text-xs font-mono text-slate-300 mt-1">
                  {location ? `${location[0].toFixed(4)}, ${location[1].toFixed(4)}` : 'Acquiring...'}
                </div>
              </div>
            </div>
            {location ? <CheckCircle2 size={16} className="text-emerald-500" /> : <div className="w-4 h-4 border-2 border-slate-700 border-t-blue-400 rounded-full animate-spin" />}
          </div>
        </div>

        {/* SOS Button Area */}
        <div className="flex-1 flex flex-col items-center justify-center py-10">
          <AnimatePresence mode="wait">
            {!isTriggered ? (
              <motion.button
                key="sos-button"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSOS}
                disabled={!location || !socket}
                className="w-56 h-56 bg-red-600 rounded-full flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(220,38,38,0.4)] border-8 border-red-500/50 relative overflow-hidden disabled:grayscale disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-linear-to-tr from-black/20 to-transparent pointer-events-none" />
                <span className="text-4xl font-black tracking-tighter uppercase italic text-white drop-shadow-lg">SOS</span>
                <span className="text-[10px] font-bold text-red-200 uppercase tracking-widest mt-1">Trigger Alert</span>
              </motion.button>
            ) : (
              <motion.div
                key="success-message"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 size={48} className="text-white" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tight italic">Alert Propagated</h2>
                  <p className="text-slate-500 text-sm font-medium">Telemetry received by command center.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Technical Footer */}
        <div className="pb-8 space-y-4">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400">
              <AlertCircle size={18} />
              <p className="text-xs font-bold leading-tight">{error}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Wifi size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WSS Uplink Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone size={14} className="text-slate-500" />
              <span className="text-[10px] font-mono text-slate-700">UA: {window.navigator.userAgent.split(' ')[0]}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
