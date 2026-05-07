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
  ChevronLeft
} from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type Step = 1 | 2 | 3;
type VictimStatus = 'CONSCIOUS' | 'UNCONSCIOUS' | 'CRITICAL';

export const BystanderReport: React.FC = () => {
  const { incidentId } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>(1);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [victimStatus, setVictimStatus] = useState<VictimStatus | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
        setTimeout(() => setStep(2), 800);
      },
      (err) => {
        console.error('Location error:', err);
        setLocationStatus('denied');
        setError('Location access denied. Please enable GPS to report.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!coords || !victimStatus) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${SOCKET_URL}/api/bystander-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          location: coords,
          victimStatus,
          photo: photo ? 'BASE64_ATTACHED' : null,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to submit report');

      setSubmitted(true);
      
      // Emit socket event for real-time dashboard update (though server also does this)
      const socket = io(SOCKET_URL);
      socket.emit('bystander:report', {
        id: incidentId || `BYST-${Date.now()}`,
        location: coords,
        victimStatus,
        timestamp: new Date().toISOString()
      });

      setTimeout(() => navigate('/'), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Submission failed';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-(--clr-bg) flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-(--clr-green)/20 text-(--clr-green) rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-3xl font-black hologram-text mb-4 uppercase">REPORT RECEIVED</h1>
        <p className="text-(--clr-text-2) mb-8 max-w-xs">
          Your information has been shared with emergency responders. Stay safe.
        </p>
        <div className="w-16 h-1 bg-(--clr-green)/30 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--clr-bg) text-(--clr-text) font-ui flex flex-col p-6">
      <header className="flex items-center justify-between mb-12">
        <button onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-(--clr-border)">
          <ChevronLeft size={24} />
        </button>
        <div className="text-right">
          <div className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest">Reporting Incident</div>
          <div className="font-bold font-mono text-sm">#{incidentId || 'BYSTANDER'}</div>
        </div>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-(--clr-blue)' : 'bg-white/10'}`} />
            ))}
          </div>
          <div className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-[0.2em]">Step 0{step} of 03</div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl font-black mb-4 uppercase leading-none">Share Your<br/><span className="text-(--clr-blue)">Location</span></h2>
                <p className="text-(--clr-text-2) text-sm leading-relaxed">
                  We need your precise GPS coordinates to route the nearest responder units to the scene.
                </p>
              </div>

              <div className="aspect-square w-full bg-white/2 border-2 border-dashed border-(--clr-border) rounded-3xl flex flex-col items-center justify-center p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-b from-(--clr-blue)/5 to-transparent" />
                <Navigation size={64} className={`text-(--clr-blue) mb-6 ${locationStatus === 'requesting' ? 'animate-pulse' : ''}`} />
                
                {locationStatus === 'granted' ? (
                  <div className="text-center z-10">
                    <p className="text-(--clr-green) font-bold flex items-center gap-2 justify-center">
                      <CheckCircle2 size={16} /> GPS LOCKED
                    </p>
                    <p className="text-[10px] font-mono text-(--clr-text-2) mt-1 uppercase tracking-widest">
                      {coords?.lat.toFixed(6)}, {coords?.lng.toFixed(6)}
                    </p>
                  </div>
                ) : (
                  <button 
                    onClick={requestLocation}
                    disabled={locationStatus === 'requesting'}
                    className="z-10 px-8 py-4 bg-(--clr-blue) text-white rounded-2xl font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(41,121,255,0.3)] active:scale-95 transition-all flex items-center gap-3"
                  >
                    {locationStatus === 'requesting' ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
                    Allow Access
                  </button>
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
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl font-black mb-4 uppercase leading-none">Victim<br/><span className="text-(--clr-red)">Status</span></h2>
                <p className="text-(--clr-text-2) text-sm">
                  Quickly assess the person's condition. This determines the level of medical resources dispatched.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'CONSCIOUS', label: 'Conscious', sub: 'Responsive & breathing', icon: <Heart className="text-emerald-400" /> },
                  { id: 'UNCONSCIOUS', label: 'Unconscious', sub: 'Non-responsive but breathing', icon: <Activity className="text-amber-400" /> },
                  { id: 'CRITICAL', label: 'Critical', sub: 'Severe bleeding or not breathing', icon: <AlertCircle className="text-red-500" /> },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setVictimStatus(s.id as VictimStatus);
                      setTimeout(() => setStep(3), 400);
                    }}
                    className={`p-6 rounded-3xl border-2 text-left transition-all ${victimStatus === s.id ? 'bg-(--clr-blue)/10 border-(--clr-blue)' : 'bg-white/2 border-(--clr-border) hover:bg-white/5'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-3 bg-white/5 rounded-xl">{s.icon}</div>
                      {victimStatus === s.id && <CheckCircle2 className="text-(--clr-blue)" size={20} />}
                    </div>
                    <div className="font-black text-xl uppercase tracking-tight">{s.label}</div>
                    <div className="text-xs text-(--clr-text-2) mt-1">{s.sub}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl font-black mb-4 uppercase leading-none">Add<br/><span className="text-(--clr-blue)">Evidence</span></h2>
                <p className="text-(--clr-text-2) text-sm">
                  Optionally add a photo of the scene to help AI analyze impact severity.
                </p>
              </div>

              <div className="space-y-6">
                <div className="relative aspect-video w-full bg-white/2 border-2 border-dashed border-(--clr-border) rounded-3xl overflow-hidden flex flex-col items-center justify-center group">
                  {photo ? (
                    <>
                      <img src={photo} alt="Crash" className="w-full h-full object-cover" />
                      <button onClick={() => setPhoto(null)} className="absolute top-4 right-4 p-2 bg-black/60 rounded-xl text-white backdrop-blur-md">
                        Reset
                      </button>
                    </>
                  ) : (
                    <>
                      <Camera size={48} className="text-(--clr-text-2) mb-4 group-hover:text-(--clr-blue) transition-colors" />
                      <p className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest">Tap to capture or upload</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-tight">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full h-20 bg-(--clr-blue) text-white rounded-3xl font-black text-xl uppercase tracking-widest shadow-[0_20px_40px_rgba(41,121,255,0.4)] flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : (
                    <>
                      Submit Report
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
