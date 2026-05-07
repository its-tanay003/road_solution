import { Bell, Camera, MapPin, Mic, CheckCircle2, ChevronRight, User, Heart, Phone } from 'lucide-react';
import { sanitizeInput } from '../utils/inputSanitizer';

const DEATH_INTERVAL_SEC = 204;

export const OnboardingFlow: React.FC = () => {
  const { 
    setProfile 
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
    setProfile({ profileComplete: true });
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#080C14] text-white overflow-hidden p-4">
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
      <div className="fixed bottom-6 right-6 z-100 flex flex-col items-end gap-3">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-300 ${
              page === i ? 'w-8 bg-[#2979FF]' : 'w-2 bg-white/10'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

const Step1 = ({ deathCount, onNext }: { deathCount: number, onNext: () => void }) => (
  <div className="flex-2 flex flex-col justify-center space-y-6">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mb-12 relative"
    >
      <div className="absolute inset-0 bg-[#2979FF]/20 blur-3xl rounded-full -z-10 animate-pulse" />
      <h1 className="text-5xl font-bold text-white mb-2 tracking-tighter uppercase italic">ROAD<span className="text-[#FF9933]">SoS</span></h1>
      <p className="text-[#FF9933] font-mono text-[10px] tracking-[0.4em] uppercase">Built for the Golden Hour</p>
    </motion.div>
    
    <div className="space-y-6 mb-12">
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl leading-tight text-white font-bold"
      >
        Your Intelligent <br/>
        <span className="text-[#2979FF]">Road Companion</span>
      </motion.p>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-8 border border-white/10 rounded-4xl bg-white/5 backdrop-blur-md relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#FF1744] to-transparent opacity-50" />
        <div className="text-5xl font-mono font-bold text-[#FF1744] mb-2 tracking-tighter">
          {deathCount.toLocaleString()}
        </div>
        <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Casualties in India since launch</p>
        <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">
          We use AI mesh networking and bystander recruitment to slash emergency response times by <span className="text-[#00C853] font-bold">80%</span>.
        </p>
      </motion.div>
    </div>

    <motion.button 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.7 }}
      onClick={onNext}
      className="w-full py-4 bg-[#2979FF] text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(41,121,255,0.3)] mb-4 hover:scale-[1.02] transition-transform"
    >
      INITIALIZE SAFETY PROFILE
    </motion.button>
    <button 
      onClick={onNext}
      className="text-[10px] font-mono text-gray-500 hover:text-white transition-colors tracking-widest uppercase"
    >
      Skip setup (Not Recommended)
    </button>
  </div>
);

const Step2 = ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => {
  const { 
    name, age, bloodType, setProfile, 
    emergencyContact1Name, emergencyContact1Phone 
  } = useMedicalProfileStore();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-4 scrollbar-hide">
        <header className="text-left">
          <div className="flex items-center gap-2 text-[#FF9933] mb-2">
            <Heart size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Biometric Core</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter">Medical Profile</h2>
          <p className="text-gray-500 text-sm">Stored locally for instant responder access.</p>
        </header>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-mono text-gray-500 uppercase">Full Name</label>
              <input 
                value={name} onChange={e => setProfile({ name: sanitizeInput(e.target.value, 100) })}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#2979FF] outline-none transition-all"
                placeholder="Rajesh Kumar"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-mono text-gray-500 uppercase">Age</label>
              <input 
                type="tel" value={age} onChange={e => setProfile({ age: e.target.value })}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#2979FF] outline-none transition-all"
                placeholder="28"
              />
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-mono text-gray-500 uppercase">Blood Type</label>
            <div className="grid grid-cols-4 gap-2">
              {bloodTypes.map(t => (
                <button 
                  key={t} onClick={() => setProfile({ bloodType: t })}
                  className={`py-3 text-sm font-bold border rounded-xl transition-all ${
                    bloodType === t ? 'border-[#2979FF] bg-[#2979FF]/20 shadow-[0_0_15px_rgba(41,121,255,0.3)]' : 'border-white/10 bg-white/5'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-2">
              <Phone size={10} /> Emergency Contact
            </label>
            <div className="space-y-4">
              <input 
                placeholder="Contact Name" 
                value={emergencyContact1Name} 
                onChange={e => setProfile({ emergencyContact1Name: sanitizeInput(e.target.value, 100) })}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#2979FF] outline-none transition-all text-sm"
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">+91</span>
                <input 
                  type="tel"
                  placeholder="Phone Number" 
                  value={emergencyContact1Phone} 
                  onChange={e => setProfile({ emergencyContact1Phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 pl-14 pr-4 py-4 rounded-2xl focus:border-[#2979FF] outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 flex gap-4 bg-[#080C14]">
        <button onClick={onBack} className="flex-1 py-4 border border-white/10 rounded-2xl font-bold uppercase text-[10px] text-gray-500">Back</button>
        <button onClick={onNext} className="flex-2 py-4 bg-[#2979FF] text-white rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(41,121,255,0.4)] transition-all">CONTINUE</button>
      </div>
    </div>
  );
};

const Step3 = ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => {
  const [isListening, setIsListening] = useState(false);
  const [success, setSuccess] = useState(false);
  const { language, setProfile } = useMedicalProfileStore();

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
      <p className="text-gray-500 text-sm mb-8">Train the AI to recognize your distress signal.</p>

      <div className="w-full flex gap-2 mb-8">
        {(['en', 'hi', 'ta'] as const).map(l => (
          <button 
            key={l} onClick={() => { setProfile({ language: l }); setSuccess(false); }}
            className={`flex-1 py-2 text-[10px] font-bold border rounded-lg transition-all ${
              language === l ? 'border-[#2979FF] bg-[#2979FF]/20' : 'border-white/10 bg-white/5'
            }`}
          >
            {l === 'en' ? 'ENGLISH' : l === 'hi' ? 'हिन्दी' : 'தமிழ்'}
          </button>
        ))}
      </div>

      <div className="w-full p-10 border border-white/10 rounded-[2.5rem] bg-white/5 mb-10 relative overflow-hidden group">
        <p className="text-[10px] font-mono text-gray-500 tracking-[0.2em] mb-4 uppercase">Speak clearly</p>
        <p className="text-4xl font-bold text-white mb-2 leading-tight">"{triggers[language].phrase}"</p>
        <p className="text-[10px] font-mono text-[#2979FF] tracking-widest">{triggers[language].phonetic}</p>
        
        {isListening && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#FF1744] flex items-end">
            {[...Array(12)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ height: [10, 40, 10] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                className="flex-1 bg-[#FF1744]/40"
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
            ? 'bg-[#00C853] shadow-[0_0_40px_rgba(0,200,83,0.4)]' 
            : isListening 
              ? 'bg-[#FF1744] animate-pulse shadow-[0_0_40px_rgba(255,23,68,0.4)]' 
              : 'bg-white/5 border-2 border-[#2979FF] hover:bg-white/10'
        }`}
      >
        {success ? <CheckCircle2 size={48} /> : <Mic size={48} />}
        {!success && !isListening && <span className="text-[8px] font-bold mt-2 uppercase tracking-tighter">TAP TO TEST</span>}
      </button>

      <div className="w-full flex gap-4">
        <button onClick={onBack} className="flex-1 py-4 border border-white/10 rounded-2xl font-bold uppercase text-[10px] text-gray-500">Back</button>
        <button 
          onClick={onNext} 
          className="flex-2 py-4 bg-[#2979FF] text-white rounded-2xl font-bold transition-all disabled:opacity-30"
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
    
    if (key === 'notify' && 'Notification' in window) {
      const status = await Notification.requestPermission();
      setPerms(prev => ({ ...prev, notify: status === 'granted' }));
    } else if (key === 'gps' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setPerms(prev => ({ ...prev, gps: true })),
        () => setPerms(prev => ({ ...prev, gps: false }))
      );
    } else {
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
        <p className="text-gray-500 text-sm">Grant required access for active protection.</p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide text-left">
        {[
          { key: 'gps', icon: MapPin, label: 'Geo-Location', desc: 'Required for real-time dispatch mesh.' },
          { key: 'notify', icon: Bell, label: 'Push Alerts', desc: 'Critical alerts even when app is closed.' },
          { key: 'camera', icon: Camera, label: 'Visual AI', desc: 'Remote triage via bystander feed analysis.' }
        ].map(p => (
          <motion.div 
            key={p.key} 
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            className="p-5 border border-white/10 rounded-3xl bg-white/5 flex items-center gap-5 relative overflow-hidden"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              perms[p.key as keyof typeof perms] ? 'bg-[#00C853]/20 text-[#00C853]' : 'bg-[#2979FF]/10 text-[#2979FF]'
            }`}>
              <p.icon size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold tracking-tight text-white">{p.label}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{p.desc}</p>
            </div>
            
            {perms[p.key as keyof typeof perms] ? (
              <CheckCircle2 className="text-[#00C853]" size={24} />
            ) : (
              <button 
                onClick={() => requestPerm(p.key as keyof typeof perms)}
                disabled={requesting === p.key}
                className="px-5 py-2.5 bg-[#2979FF]/10 hover:bg-[#2979FF]/20 text-[#2979FF] rounded-xl text-[10px] font-bold transition-all disabled:opacity-50"
              >
                {requesting === p.key ? 'WAITING...' : 'AUTHORIZE'}
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <div className="pt-8 flex gap-4 bg-[#080C14]">
        <button onClick={onBack} className="flex-1 py-4 border border-white/10 rounded-2xl font-bold uppercase text-[10px] text-gray-500">Back</button>
        <button 
          onClick={onFinish}
          disabled={!isReady}
          className="flex-2 py-4 bg-[#00C853] text-black rounded-2xl font-black shadow-[0_0_30px_rgba(0,200,83,0.3)] disabled:opacity-30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        >
          INITIALIZE ROADSOS <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
