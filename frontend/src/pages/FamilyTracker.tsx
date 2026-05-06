import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Navigation, 
  Phone, 
  ShieldCheck, 
  RefreshCcw,
  Hospital
} from 'lucide-react';

export const FamilyTracker: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 2000);
          return 60;
        }
        return c - 1;
      });
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeLeft = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m remaining`;
  };

  const timeline = [
    { id: 1, label: 'SOS Received', time: '14:23:01', status: 'completed' },
    { id: 2, label: 'Location Found', time: '14:23:08', status: 'completed' },
    { id: 3, label: '108 Ambulance Dispatched', time: '14:23:47', status: 'completed', desc: 'ETA 4 min' },
    { id: 4, label: 'Ambulance En Route', status: 'active', desc: 'Updating position...' },
    { id: 5, label: 'On Scene', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">
      <header className="px-6 py-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight">ROADSoS</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Emergency Update</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Live Tracking</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 space-y-10">
        <section className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Navigation className="animate-bounce" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black leading-tight tracking-tight mb-2">
                Emergency services are with your loved one
              </h2>
              <p className="text-blue-100 text-sm font-medium leading-relaxed opacity-90">
                A high-priority medical response is currently active. Our dispatchers are coordinating with the nearest Level 1 Trauma center.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center py-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Estimated Ambulance Arrival</div>
          <div className="text-7xl font-black text-slate-900 tabular-nums tracking-tighter">
            03:42
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-blue-600 font-bold text-sm">
            <Hospital size={18} />
            <span>AIIMS Delhi, Trauma Level 1</span>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Incident Timeline</h3>
          <div className="space-y-4">
            {timeline.map((step) => (
              <div 
                key={step.id} 
                className={`p-5 rounded-3xl border transition-all ${
                  step.status === 'completed' ? 'bg-slate-50 border-slate-100 opacity-60' : 
                  step.status === 'active' ? 'bg-white border-blue-200 ring-4 ring-blue-50' : 
                  'bg-white border-slate-100 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {step.status === 'completed' ? (
                      <CheckCircle2 size={24} className="text-blue-600" />
                    ) : step.status === 'active' ? (
                      <div className="w-6 h-6 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    ) : (
                      <Clock size={24} className="text-slate-300" />
                    )}
                    <div>
                      <div className={`font-black ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                        {step.label}
                      </div>
                      {step.desc && (
                        <div className="text-xs font-bold text-blue-600 mt-0.5">{step.desc}</div>
                      )}
                    </div>
                  </div>
                  {step.time && (
                    <div className="text-xs font-mono text-slate-400">{step.time}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-center gap-4 py-6 border-y border-slate-50">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
            Updating in {countdown}s
          </div>
          <div className="w-1 h-1 bg-slate-200 rounded-full" />
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {formatTimeLeft(timeLeft)}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Contact Dispatch</p>
              <p className="text-sm font-black text-slate-900">Emergency Line: 112</p>
            </div>
          </div>
          <a 
            href="tel:112"
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-200 active:scale-95"
          >
            Call Now
          </a>
        </div>
      </footer>
    </div>
  );
};
