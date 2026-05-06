import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedicalProfileStore } from '../store/medicalProfileStore';
import { Bell, Camera, MapPin, Mic, CheckCircle2, ChevronRight } from 'lucide-react';

const DEATH_INTERVAL_SEC = 204;

export const OnboardingFlow: React.FC = () => {
  const { 
    setOnboardingComplete 
  } = useMedicalProfileStore();

  const [deathCount, setDeathCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDeathCount(prev => prev + 1);
    }, DEATH_INTERVAL_SEC * 1000);
    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const [[page, direction], setPage] = useState([1, 0]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleFinish = () => {
    setOnboardingComplete(true);
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-0 z-100 bg-(--clr-bg) flex items-center justify-center overflow-hidden">
      <div className="scanline-overlay opacity-30" />
      
      <div className="w-full max-w-lg px-6 relative h-[600px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 flex flex-col"
          >
            {page === 1 && <Step1 deathCount={deathCount} onNext={() => paginate(1)} />}
            {page === 2 && <Step2 onNext={() => paginate(1)} onBack={() => paginate(-1)} />}
            {page === 3 && <Step3 onNext={() => paginate(1)} onBack={() => paginate(-1)} />}
            {page === 4 && <Step4 onFinish={handleFinish} onBack={() => paginate(-1)} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      <div className="fixed bottom-12 flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-300 ${
              page === i ? 'w-8 bg-(--clr-blue)' : 'w-2 bg-(--clr-border)'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

const Step1 = ({ deathCount, onNext }: { deathCount: number, onNext: () => void }) => (
  <div className="flex flex-col items-center text-center">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mb-12 relative"
    >
      <div className="absolute inset-0 bg-(--clr-blue)/20 blur-3xl rounded-full -z-10 animate-pulse" />
      <h1 className="text-5xl font-bold hologram-text mb-2 tracking-tighter">ROADSoS</h1>
      <p className="text-(--clr-saffron) font-mono text-[10px] tracking-[0.4em] uppercase">Built for the Golden Hour</p>
    </motion.div>
    
    <div className="space-y-6 mb-12">
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl leading-tight text-(--clr-text) font-bold"
      >
        Your Intelligent <br/>
        <span className="text-(--clr-blue)">Road Companion</span>
      </motion.p>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-8 border border-(--clr-border) rounded-[2rem] bg-white/5 backdrop-blur-md relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-(--clr-red) to-transparent opacity-50" />
        <div className="text-5xl font-mono font-bold text-(--clr-red) mb-2 tracking-tighter">
          {deathCount.toLocaleString()}
        </div>
        <p className="text-[10px] font-mono text-(--clr-text-2) tracking-widest uppercase">Casualties in India since launch</p>
        <p className="mt-4 text-[11px] text-(--clr-text-2) leading-relaxed">
          We use AI mesh networking and bystander recruitment to slash emergency response times by <span className="text-(--clr-green) font-bold">80%</span>.
        </p>
      </motion.div>
    </div>

    <motion.button 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.7 }}
      onClick={onNext}
      className="w-full py-4 bg-(--clr-blue) text-white font-bold rounded-2xl shadow-[0_0_30px_var(--clr-glow-blue)] mb-4 hover:scale-[1.02] transition-transform"
    >
      INITIALIZE SAFETY PROFILE
    </motion.button>
    <button 
      onClick={onNext}
      className="text-[10px] font-mono text-(--clr-text-2) hover:text-white transition-colors tracking-widest uppercase"
    >
      Skip setup (Not Recommended)
    </button>
  </div>
);

const Step2 = ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => {
  const { 
    name, setName, age, setAge, bloodType, setBloodType, 
    contacts, setContacts
  } = useMedicalProfileStore();

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelationship, setContactRelationship] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const addContact = () => {
    if (contactName && contactPhone && contactRelationship) {
      if (contacts.length < 3) {
        setContacts([...contacts, { name: contactName, phone: contactPhone, relationship: contactRelationship }]);
        setContactName('');
        setContactPhone('');
        setContactRelationship('');
      } else {
        alert("Maximum 3 emergency contacts allowed.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-4 scrollbar-hide">
        <header>
          <h2 className="text-3xl font-bold mb-1 tracking-tighter text-left">Medical Profile</h2>
          <p className="text-(--clr-text-2) text-sm text-left">Stored locally with <span className="text-(--clr-green) font-bold">AES-GCM Encryption</span>.</p>
        </header>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-mono text-(--clr-text-2) uppercase">Full Name</label>
              <input 
                value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-white/5 border border-(--clr-border) p-4 rounded-2xl focus:border-(--clr-blue) outline-none transition-all"
                placeholder="Rajesh Kumar"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-mono text-(--clr-text-2) uppercase">Age</label>
              <input 
                type="tel" value={age} onChange={e => setAge(e.target.value)}
                className="w-full bg-white/5 border border-(--clr-border) p-4 rounded-2xl focus:border-(--clr-blue) outline-none transition-all"
                placeholder="28"
              />
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-mono text-(--clr-text-2) uppercase">Blood Type</label>
            <div className="grid grid-cols-4 gap-2">
              {bloodTypes.map(t => (
                <button 
                  key={t} onClick={() => setBloodType(t)}
                  className={`py-3 text-sm font-bold border rounded-xl transition-all ${
                    bloodType === t ? 'border-(--clr-blue) bg-(--clr-blue)/20 shadow-[0_0_15px_rgba(41,121,255,0.3)]' : 'border-(--clr-border) bg-white/5'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-mono text-(--clr-text-2) uppercase">Emergency Contacts ({contacts.length}/3)</label>
            <div className="space-y-2">
              {contacts.map((c, i) => (
                <div key={i} className="p-4 bg-white/5 border border-(--clr-border) rounded-2xl flex justify-between items-center group">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      {c.name}
                      <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/40 uppercase font-mono">{c.relationship}</span>
                    </span>
                    <span className="text-[10px] font-mono text-(--clr-text-2) mt-1">{c.phone}</span>
                  </div>
                  <button 
                    onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))}
                    className="text-white/10 hover:text-(--clr-red) transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {contacts.length < 3 && (
                <div className="flex flex-col gap-2 p-4 rounded-2xl border-2 border-dashed border-(--clr-border) bg-white/2">
                  <input 
                    placeholder="Contact Name" value={contactName} onChange={e => setContactName(e.target.value)}
                    className="bg-white/5 border border-(--clr-border) p-3 rounded-xl text-xs outline-none focus:border-(--clr-blue)"
                  />
                  <div className="flex gap-2">
                    <input 
                      placeholder="Phone (+91...)" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                      className="flex-1 bg-white/5 border border-(--clr-border) p-3 rounded-xl text-xs outline-none focus:border-(--clr-blue)"
                    />
                    <select 
                      value={contactRelationship} onChange={e => setContactRelationship(e.target.value)}
                      className="flex-1 bg-black border border-(--clr-border) p-3 rounded-xl text-xs outline-none focus:border-(--clr-blue) text-white"
                    >
                      <option value="">Relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <button 
                    onClick={addContact} 
                    className="w-full py-3 bg-(--clr-blue)/20 text-(--clr-blue) rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-(--clr-blue) hover:text-white transition-all mt-2"
                  >
                    + Add Emergency Contact
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 flex gap-4 bg-(--clr-bg)">
        <button onClick={onBack} className="flex-1 py-4 border border-(--clr-border) rounded-2xl font-bold uppercase text-[10px]">Back</button>
        <button onClick={onNext} className="flex-2 py-4 bg-(--clr-blue) text-white rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(41,121,255,0.4)] transition-all">CONTINUE</button>
      </div>
    </div>
  );
};

const Step3 = ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => {
  const [isListening, setIsListening] = useState(false);
  const [success, setSuccess] = useState(false);
  const { language, setLanguage } = useMedicalProfileStore();

  const triggers: Record<'en' | 'hi' | 'ta', { phrase: string, phonetic: string }> = {
    en: { phrase: "Help Me Now", phonetic: "HEHLP MEE NOW" },
    hi: { phrase: "मेरी मदद करो", phonetic: "ME-RI MA-DAD KA-RO" },
    ta: { phrase: "உதவி செய்யுங்கள்", phonetic: "U-DA-VI SEY-YUN-GAL" }
  };

  const handleTest = () => {
    setIsListening(true);
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    setTimeout(() => {
      setIsListening(false);
      setSuccess(true);
    }, 2500);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-3xl font-bold mb-1 tracking-tighter">Voice SOS</h2>
      <p className="text-(--clr-text-2) text-sm mb-8">Train the AI to recognize your distress signal.</p>

      <div className="w-full flex gap-2 mb-8">
        {(['en', 'hi', 'ta'] as const).map(l => (
          <button 
            key={l} onClick={() => { setLanguage(l); setSuccess(false); }}
            className={`flex-1 py-2 text-[10px] font-bold border rounded-[var(--radius-lg)] transition-all ${
              language === l ? 'border-(--clr-blue) bg-(--clr-blue)/20' : 'border-(--clr-border) bg-white/5'
            }`}
          >
            {l === 'en' ? 'ENGLISH' : l === 'hi' ? 'हिन्दी' : 'தமிழ்'}
          </button>
        ))}
      </div>

      <div className="w-full p-10 border border-(--clr-border) rounded-[2.5rem] bg-white/2 mb-10 relative overflow-hidden group">
        <p className="text-[10px] font-mono text-(--clr-text-2) tracking-[0.2em] mb-4 uppercase">Speak clearly</p>
        <p className="text-4xl font-bold text-white mb-2 leading-tight">"{triggers[language].phrase}"</p>
        <p className="text-[10px] font-mono text-(--clr-blue) tracking-widest">{triggers[language].phonetic}</p>
        
        {isListening && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-(--clr-red) flex items-end">
            {[...Array(12)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ height: [10, 40, 10] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                className="flex-1 bg-(--clr-red)/40"
              />
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={handleTest}
        disabled={success}
        className={`w-28 h-28 rounded-full flex flex-col items-center justify-center mb-10 transition-all ${
          success 
            ? 'bg-(--clr-green) shadow-[0_0_40px_rgba(0,230,118,0.4)]' 
            : isListening 
              ? 'bg-(--clr-red) animate-pulse shadow-[0_0_40px_rgba(255,23,68,0.4)]' 
              : 'bg-white/5 border-2 border-(--clr-blue) hover:bg-white/10'
        }`}
      >
        {success ? <CheckCircle2 size={48} /> : <Mic size={48} />}
        {!success && !isListening && <span className="text-[8px] font-bold mt-2 uppercase tracking-tighter">TAP TO TEST</span>}
      </button>

      <div className="w-full flex gap-4">
        <button onClick={onBack} className="flex-1 py-4 border border-(--clr-border) rounded-2xl font-bold uppercase text-[10px]">Back</button>
        <button 
          onClick={onNext} 
          className="flex-2 py-4 bg-(--clr-blue) text-white rounded-2xl font-bold transition-all disabled:opacity-30"
        >
          {success ? 'VOICE CALIBRATED' : 'PROCEED'}
        </button>
      </div>
    </div>
  );
};

const Step4 = ({ onFinish, onBack }: { onFinish: () => void, onBack: () => void }) => {
  const [perms, setPerms] = useState({ gps: false, notify: false, camera: false });
  const [requesting, setRequesting] = useState<string | null>(null);

  const requestPerm = async (key: keyof typeof perms) => {
    setRequesting(key);
    
    // Simulate real browser requests
    if (key === 'notify' && 'Notification' in window) {
      const status = await Notification.requestPermission();
      setPerms(prev => ({ ...prev, notify: status === 'granted' }));
    } else if (key === 'gps' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setPerms(prev => ({ ...prev, gps: true })),
        () => setPerms(prev => ({ ...prev, gps: false }))
      );
    } else {
      // Manual fallback for demo
      setTimeout(() => {
        setPerms(prev => ({ ...prev, [key]: true }));
      }, 800);
    }
    
    setTimeout(() => setRequesting(null), 1000);
  };

  const isReady = perms.gps;

  return (
    <div className="flex flex-col h-full">
      <header className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-1 tracking-tighter">Systems Check</h2>
        <p className="text-(--clr-text-2) text-sm">Grant required access for active protection.</p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
        {[
          { key: 'gps', icon: MapPin, label: 'Geo-Location', desc: 'Required for real-time dispatch mesh.' },
          { key: 'notify', icon: Bell, label: 'Push Alerts', desc: 'Critical alerts even when app is closed.' },
          { key: 'camera', icon: Camera, label: 'Visual AI', desc: 'Remote triage via bystander feed analysis.' }
        ].map(p => (
          <motion.div 
            key={p.key} 
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            className="p-5 border border-(--clr-border) rounded-3xl bg-white/2 flex items-center gap-5 relative overflow-hidden"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              perms[p.key as keyof typeof perms] ? 'bg-(--clr-green)/20 text-(--clr-green)' : 'bg-(--clr-blue)/10 text-(--clr-blue)'
            }`}>
              <p.icon size={24} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold tracking-tight">{p.label}</p>
              <p className="text-[10px] text-(--clr-text-2) leading-tight">{p.desc}</p>
            </div>
            
            {perms[p.key as keyof typeof perms] ? (
              <CheckCircle2 className="text-(--clr-green)" size={24} />
            ) : (
              <button 
                onClick={() => requestPerm(p.key as keyof typeof perms)}
                disabled={requesting === p.key}
                className="px-5 py-2.5 bg-(--clr-blue)/10 hover:bg-(--clr-blue)/20 text-(--clr-blue) rounded-xl text-[10px] font-bold transition-all disabled:opacity-50"
              >
                {requesting === p.key ? 'WAITING...' : 'AUTHORIZE'}
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <div className="pt-8 flex gap-4 bg-(--clr-bg)">
        <button onClick={onBack} className="flex-1 py-4 border border-(--clr-border) rounded-2xl font-bold uppercase text-[10px]">Back</button>
        <button 
          onClick={onFinish}
          disabled={!isReady}
          className="flex-2 py-4 bg-(--clr-green) text-white rounded-2xl font-bold shadow-[0_0_30px_rgba(0,230,118,0.3)] disabled:opacity-30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        >
          INITIALIZE ROADSOS <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
