import { motion } from 'framer-motion';
import { useSosStore } from '../store';
import { 
  ShieldAlert, 
  Ambulance, 
  Phone, 
  X,
  CheckCircle2
} from 'lucide-react';
import { AlertStatus } from '../components/AlertStatus';
import { useUserStore } from '../store';

export const SOSActive = () => {
  const { isActive, cancelSos } = useSosStore();
  const contacts = useUserStore(state => state.contacts.filter(c => c.alertOnSos));

  if (!isActive) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-2000 bg-rose-600 text-white p-6 flex flex-col items-center gap-8 overflow-y-auto"
    >
      <div className="w-full flex justify-end shrink-0">
        <button 
          onClick={cancelSos}
          title="Cancel SOS"
          className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20 active:scale-90 transition-all"
        >
          <X size={32} />
        </button>
      </div>

      <div className="flex flex-col items-center text-center space-y-6 shrink-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-white/30"
        >
          <ShieldAlert size={64} className="text-rose-600" />
        </motion.div>
        
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">SOS ACTIVE</h1>
          <p className="text-xl font-bold opacity-80 mt-2 uppercase tracking-widest">Help is on the way</p>
        </div>

        <div className="w-full max-w-sm bg-white/10 rounded-[2.5rem] p-6 border-2 border-white/20 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-4 text-emerald-400">
            <CheckCircle2 size={24} />
            <p className="text-lg font-black uppercase tracking-tight text-white">Location Sent</p>
          </div>
          <div className="flex items-center gap-4 mb-4 text-emerald-400">
            <CheckCircle2 size={24} />
            <p className="text-lg font-black uppercase tracking-tight text-white">Police Notified</p>
          </div>
          <div className="flex items-center gap-4 opacity-50">
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-lg font-black uppercase tracking-tight">Dispatching Ambulance...</p>
          </div>
        </div>
      </div>

      {contacts.length > 0 && (
        <AlertStatus contacts={contacts} />
      )}

      <div className="w-full max-w-sm space-y-4 pb-8">
        <button className="w-full h-20 bg-white text-[var(--color-emergency)] rounded-3xl flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all">
          <Phone size={32} fill="currentColor" />
          <span className="text-2xl font-black uppercase">Speak to Agent</span>
        </button>
        
        <div className="bg-navy p-6 rounded-3xl border-2 border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Ambulance size={24} />
            </div>
            <div>
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest">ETA 08:45 MINS</p>
              <p className="text-lg font-black uppercase">Ambulance #402</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
