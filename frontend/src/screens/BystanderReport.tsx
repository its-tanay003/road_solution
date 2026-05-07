import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  AlertCircle, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  Loader2,
  Navigation,
  Activity,
  Heart,
  Shield
} from 'lucide-react';
import { sanitizeInput } from '../utils/inputSanitizer';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type Step = 1 | 2 | 3;
type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied';
type VictimStatus = 'CONSCIOUS' | 'UNCONSCIOUS' | 'CRITICAL';

export const BystanderReport: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const incidentId = params.incidentId || 'demo-001';

  const [step, setStep] = useState<Step>(1);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
        setTimeout(() => setStep(2), 1000);
      },
      (err) => {
        console.error('Location error:', err);
        setLocationStatus('denied');
        setError('Location access denied. Please enable GPS.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = { 
      incidentId, 
      coords, 
      victimStatus, 
      description: sanitizeInput(description),
      image: photoBase64, 
      timestamp: Date.now() 
    };

    try {
      // 1. Try fetch first
      await fetch(`${SOCKET_URL}/api/bystander-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Fetch failed, falling back to socket only', err);
    } finally {
      // 2. Emit socket regardless (never block user)
      const socket = io(SOCKET_URL);
      socket.emit('bystander:report', payload);
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#080C14] flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
        >
          <CheckCircle2 size={56} className="text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Report Sent</h1>
        <p className="text-gray-400 mb-6">Your report has been sent to emergency responders</p>
        
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-8 w-full max-w-xs">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Reference ID</div>
          <div className="font-mono text-white text-sm font-bold">{incidentId}</div>
        </div>

        <p className="text-sm font-bold text-white mb-4">Stay with the victim if it is safe to do so</p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl text-left w-full max-w-sm"
        >
          <div className="flex items-center gap-3 mb-3">
             <Shield className="text-blue-400" size={20} />
             <h3 className="font-bold text-blue-400 uppercase text-xs tracking-wider">Good Samaritan Law</h3>
          </div>
          <p className="text-[11px] text-blue-200/70 leading-relaxed">
            You are protected from legal liability for providing reasonable assistance in good faith during an emergency.
          </p>
        </motion.div>

        <button 
          onClick={() => navigate('/')}
          className="mt-8 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex flex-col p-6 font-sans">
      {/* Step Indicator */}
      <div className="flex justify-center gap-4 mb-10 mt-4">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              step >= s ? 'bg-[#FF9933] text-white shadow-[0_0_15px_rgba(255,153,51,0.4)]' : 'bg-white/5 text-gray-600 border border-white/10'
            }`}
          >
            {step > s ? <CheckCircle2 size={16} /> : s}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center gap-8"
            >
              <div className="text-center">
                <h2 className="text-4xl font-black mb-3 uppercase leading-tight">Emergency<br/>Location</h2>
                <p className="text-gray-400 text-sm">We need your coordinates to route rescue units.</p>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center gap-6">
                {locationStatus === 'requesting' ? (
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-24 h-24 bg-[#FF9933]/20 rounded-full flex items-center justify-center">
                       <Navigation size={48} className="text-[#FF9933]" />
                    </div>
                    <p className="text-xs font-mono tracking-widest text-[#FF9933]">Getting your location...</p>
                  </motion.div>
                ) : (
                  <div className="w-full space-y-6">
                    <button 
                      onClick={requestLocation}
                      className="w-full py-8 bg-blue-600 hover:bg-blue-500 rounded-3xl flex flex-col items-center gap-3 transition-all active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.3)]"
                    >
                      <MapPin size={32} />
                      <span className="font-black uppercase tracking-widest text-lg">Allow Location Access</span>
                    </button>
                    
                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                        <p className="text-red-400 text-xs font-bold mb-3">{error}</p>
                        <button 
                          onClick={() => { setError(null); setLocationStatus('idle'); }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="mb-4">
                <h2 className="text-3xl font-black uppercase mb-2">Assess Victim</h2>
                <p className="text-gray-400 text-sm">Select the status of the primary victim.</p>
              </div>

              <div className="flex flex-col gap-4">
                <StatusCard 
                  color="#00C853"
                  icon={<Heart size={32} />}
                  label="CONSCIOUS"
                  onClick={() => { setVictimStatus('CONSCIOUS'); setStep(3); }}
                />
                <StatusCard 
                  color="#FFB300"
                  icon={<Activity size={32} />}
                  label="UNCONSCIOUS"
                  onClick={() => { setVictimStatus('UNCONSCIOUS'); setStep(3); }}
                />
                <StatusCard 
                  color="#FF1744"
                  icon={<AlertCircle size={32} />}
                  label="NOT BREATHING / CRITICAL"
                  onClick={() => { setVictimStatus('CRITICAL'); setStep(3); }}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col gap-8"
            >
              <div>
                <h2 className="text-3xl font-black uppercase mb-2">Evidence</h2>
                <p className="text-gray-400 text-sm">Upload a photo to help responders prepare.</p>
              </div>

              <div className="flex-1 flex flex-col gap-6">
                <label className="flex-1 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-colors relative overflow-hidden group">
                  {photoBase64 ? (
                    <img src={photoBase64} alt="Incident Scene Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all">
                        <Camera size={32} />
                      </div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Capture Scene (Optional)</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    onChange={handlePhotoSelect}
                    className="hidden" 
                    id="incident-photo"
                    aria-label="Upload incident photo"
                  />
                </label>

                <div className="space-y-2">
                  <label htmlFor="incident-desc" className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Additional Details</label>
                  <textarea 
                    id="incident-desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe injuries or specific location details..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#FF9933] outline-none min-h-[100px] transition-all"
                  />
                </div>

                {photoBase64 && (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                       <img src={photoBase64} alt="Attached Evidence" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Image Attached</span>
                    <button onClick={() => setPhotoBase64(null)} className="ml-auto text-gray-500 hover:text-white" aria-label="Remove photo">
                      <AlertCircle size={14} />
                    </button>
                  </div>
                )}

                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full h-20 bg-[#FF9933] text-white rounded-3xl font-black text-xl uppercase tracking-widest shadow-[0_20px_40px_rgba(255,153,51,0.3)] flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={24} className="animate-spin" /> : (
                    <>
                      Send Emergency Report
                      <ArrowRight size={24} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface StatusCardProps {
  color: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const StatusCard = ({ color, icon, label, onClick }: StatusCardProps) => (
  <button 
    onClick={onClick}
    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    role="button"
    tabIndex={0}
    aria-label={`Select victim status: ${label}`}
    className="w-full h-[110px] rounded-3xl p-6 flex items-center gap-6 transition-all active:scale-[0.98] hover:brightness-110"
    style={{ backgroundColor: color }}
  >
    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white">
      {icon}
    </div>
    <span className="text-2xl font-black text-white text-left leading-tight uppercase tracking-tighter">
      {label}
    </span>
    <ArrowRight size={24} className="ml-auto text-white/50" />
  </button>
);
