import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, X, ChevronRight, Camera } from 'lucide-react';
import { useRoadReportStore } from '../store/roadReportStore';

const CATEGORIES = [
  { id: 'pothole',     label: 'Pothole',     icon: '🕳️', color: 'bg-orange-500' },
  { id: 'accident',    label: 'Accident',    icon: '💥', color: 'bg-red-500' },
  { id: 'flood',       label: 'Water Logs',  icon: '🌊', color: 'bg-blue-500' },
  { id: 'construction',label: 'Work Zone',   icon: '🚧', color: 'bg-yellow-500' },
  { id: 'blockage',    label: 'Road Block',  icon: '⛔', color: 'bg-gray-500' },
];

export const RoadReportSheet: React.FC = () => {
  const { isReporting, setReporting, addReport } = useRoadReportStore();
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState('');

  const submit = (severity: 'low' | 'medium' | 'high') => {
    // Mock location
    addReport({
      type: selectedCat as any,
      severity,
      lat: 28.6139,
      lng: 77.2090,
      userId: 'user123'
    });
    setStep(1);
    setSelectedCat('');
  };

  return (
    <AnimatePresence>
      {isReporting && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setReporting(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />

          {/* Sheet */}
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[101] bg-[#121826] rounded-t-[32px] px-6 pb-12 pt-4 border-t border-white/10 max-h-[85vh] overflow-y-auto">
            
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white">Report Hazard</h2>
              <button onClick={() => setReporting(false)} className="p-2 rounded-full bg-white/5">
                <X size={20} className="text-white/40" />
              </button>
            </div>

            {step === 1 ? (
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <motion.button key={cat.id} whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedCat(cat.id); setStep(2); }}
                    className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/4 border border-white/8 hover:border-amber-400/30 transition-all">
                    <span className="text-4xl">{cat.icon}</span>
                    <span className="font-bold text-white/80">{cat.label}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <button onClick={() => setStep(1)} className="text-amber-400 text-[13px] font-bold mb-4 flex items-center gap-1">
                  ← Back to categories
                </button>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-amber-400/20 flex items-center justify-center text-3xl">
                    {CATEGORIES.find(c => c.id === selectedCat)?.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">How severe is this?</h3>
                    <p className="text-white/40 text-[12px]">This helps other drivers prepare</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {['low', 'medium', 'high'].map(sev => (
                    <button key={sev} onClick={() => submit(sev as any)}
                      className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 group hover:border-amber-400/40 transition-all">
                      <div className="flex flex-col text-left">
                        <span className="capitalize font-black text-white text-lg">{sev}</span>
                        <span className="text-white/30 text-[11px]">
                          {sev === 'low' ? 'Mildly affects traffic' : sev === 'medium' ? 'Slows down traffic significantly' : 'Avoid this route if possible'}
                        </span>
                      </div>
                      <ChevronRight size={20} className="text-white/20 group-hover:text-amber-400" />
                    </button>
                  ))}
                </div>

                <button className="w-full mt-6 py-4 rounded-2xl border border-dashed border-white/20 flex items-center justify-center gap-2 text-white/40 font-bold text-[14px]">
                  <Camera size={18} /> Add Photo (Optional)
                </button>
              </motion.div>
            )}

            <p className="text-center text-white/20 text-[10px] mt-8 uppercase tracking-widest font-bold">
              Helping 2,400+ nearby drivers stay safe
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
