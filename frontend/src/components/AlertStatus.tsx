import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ContactStatus {
  id: string;
  name: string;
  phone: string;
  method: 'WhatsApp' | 'SMS';
  status: 'sending' | 'sent';
}

interface AlertStatusProps {
  contacts: { id: string; name: string; phone: string; alertViaWhatsApp: boolean }[];
  onComplete?: () => void;
}

export const AlertStatus: React.FC<AlertStatusProps> = ({ contacts, onComplete }) => {
  const [statuses, setStatuses] = useState<ContactStatus[]>([]);
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const processContacts = async () => {
      const newStatuses: ContactStatus[] = contacts.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        method: c.alertViaWhatsApp ? 'WhatsApp' : 'SMS',
        status: 'sending'
      }));
      setStatuses(newStatuses);

      for (let i = 0; i < newStatuses.length; i++) {
        // Simulate sending delay
        await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
        setStatuses(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'sent' } : s));
      }

      if (onComplete) {
        setTimeout(onComplete, 1000);
      }
    };

    processContacts();
    return () => clearInterval(timer);
  }, [contacts, onComplete, startTime]);

  const allSent = statuses.length > 0 && statuses.every(s => s.status === 'sent');

  return (
    <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black uppercase tracking-tight text-white">Alerting emergency contacts...</h2>
        <div className="text-xs font-mono text-white/50">{elapsed}s</div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {statuses.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${s.method === 'WhatsApp' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {s.method === 'WhatsApp' ? <MessageCircle size={20} /> : <MessageSquare size={20} />}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{s.name}</div>
                  <div className="text-[10px] font-mono text-white/40">****{s.phone.slice(-4)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {s.status === 'sending' ? (
                  <>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sending {s.method}</span>
                    <Loader2 size={16} className="text-white/40 animate-spin" />
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Sent via {s.method}</span>
                    <CheckCircle2 size={16} className="text-green-400" />
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {allSent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 pt-6 border-t border-white/10 text-center"
        >
          <p className="text-sm font-bold text-green-400 uppercase tracking-widest">
            All contacts notified in {elapsed} seconds
          </p>
        </motion.div>
      )}
    </div>
  );
};
