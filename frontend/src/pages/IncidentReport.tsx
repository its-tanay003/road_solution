import { FileText, Camera, Send, EyeOff, Bot, Sparkles, Loader2, CheckCircle2, MapPin, Clock, Plus, Minus } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const IncidentReport = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  // Form State
  const [typology, setTypology] = useState('Vehicle Collision (Multi)');
  const [vehicles, setVehicles] = useState(0);
  const [injuries, setInjuries] = useState(0);
  const [description, setDescription] = useState('');
  const [aiAnalyzed, setAiAnalyzed] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setIsAnalyzing(true);
    setAiAnalyzed(false);

    // Mock AI Vision Processing Delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiAnalyzed(true);
      
      setTypology('Vehicle Collision (Multi)');
      setVehicles(2);
      setInjuries(1);
      setDescription('NEXUS-AI VISION REPORT:\n- 2x CLASS-B VEHICLES DETECTED\n- KINETIC IMPACT: MODERATE\n- STRUCTURAL INTEGRITY: DEGRADED\n- THERMAL HAZARD: NONE DETECTED\n- BIOLOGICAL ASSETS: 1x POTENTIAL INJURY (LIMB TRAUMA)');
    }, 2500);
  };

  const increment = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    setter(value + 1);
  };

  const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    if (value > 0) setter(value - 1);
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base)] text-[var(--nx-text-primary)] p-6 pb-24 lg:pb-10 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex flex-col items-center text-center gap-2">
           <div className="w-12 h-12 bg-[var(--nx-bg-elevated)] border border-[var(--nx-border)] rounded-sm flex items-center justify-center text-[var(--nx-red-primary)] shadow-[0_0_15px_rgba(255,59,59,0.1)]">
              <FileText size={24} />
           </div>
           <h1 className="text-2xl font-black tracking-tighter text-white uppercase mt-2">TACTICAL INCIDENT LOG</h1>
           <p className="text-[10px] text-[var(--nx-text-dim)] font-mono uppercase tracking-[0.2em]">Formal Evidence Acquisition & Archive</p>
        </div>

        <Panel 
          title="Evidence Submission" 
          icon={Camera} 
          subtitle="AI-Enhanced Data Extraction"
          action={aiAnalyzed && <Badge variant="ai">NEXUS-VISION ACTIVE</Badge>}
        >
          <div className="space-y-6 relative overflow-hidden">
             {/* AI Analysis Overlay */}
             <AnimatePresence>
               {isAnalyzing && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-[var(--nx-bg-surface)]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-8 border border-[var(--nx-blue-primary)]/30 rounded-sm"
                 >
                   <div className="relative mb-6">
                      <div className="w-16 h-16 border-2 border-[var(--nx-blue-primary)]/20 border-t-[var(--nx-blue-primary)] rounded-full animate-spin" />
                      <Bot className="absolute inset-0 m-auto text-[var(--nx-blue-primary)]" size={24} />
                   </div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Neural Analysis in Progress</h3>
                   <p className="text-[10px] text-[var(--nx-text-dim)] font-mono max-w-[240px]">SCANNING KINETIC VECTORS, ASSET COUNTS, AND ENVIRONMENTAL HAZARDS...</p>
                 </motion.div>
               )}
             </AnimatePresence>

             <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef}
               onChange={handlePhotoUpload}
             />

             {!photoUrl ? (
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="nexus-card border-dashed border-2 border-[var(--nx-blue-primary)]/30 bg-[var(--nx-blue-dim)] p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--nx-blue-dim)]/80 transition-all group"
               >
                 <div className="w-16 h-16 rounded-full bg-[var(--nx-blue-primary)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera size={32} className="text-[var(--nx-blue-primary)]" />
                 </div>
                 <span className="text-xs font-black text-white uppercase tracking-widest">Deploy Vision Sensor</span>
                 <span className="text-[10px] text-[var(--nx-text-dim)] mt-2 font-mono uppercase">UPLOAD PHOTO FOR AUTOMATIC FIELD TRIAGE</span>
               </div>
             ) : (
               <div className="relative rounded-sm overflow-hidden border border-[var(--nx-border)] group">
                 <img src={photoUrl} alt="Evidence" className="w-full h-64 object-cover opacity-60 contrast-125" />
                 <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--nx-bg-base)_0%,transparent_100%)]" />
                 <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="flex items-center gap-2">
                       <CheckCircle2 size={16} className="text-[var(--nx-green-primary)]" />
                       <span className="text-[10px] font-bold text-white uppercase">Neural Scan Success</span>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => { setPhotoUrl(null); setAiAnalyzed(false); }}>RE-ACQUIRE</Button>
                 </div>
                 {/* Visual Scanline Effect */}
                 <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,184,212,0.05)_2px,rgba(0,184,212,0.05)_3px)] animate-scan" />
               </div>
             )}
          </div>
        </Panel>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Panel title="Contextual Data" icon={MapPin} variant={aiAnalyzed ? 'ai' : 'active'}>
              <div className="space-y-4">
                 <div className="flex flex-col gap-2">
                    <label className="nexus-label">DEPLOYMENT COORDINATES</label>
                    <div className="nexus-input bg-white/[0.02] text-[var(--nx-text-dim)] flex items-center justify-between">
                       <span className="font-mono">28.6139° N, 77.2090° E</span>
                       <Lock size={12} className="opacity-30" />
                    </div>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="nexus-label">INCIDENT TIMESTAMP</label>
                    <div className="relative">
                       <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nx-text-dim)]" size={14} />
                       <input type="datetime-local" className="nexus-input pl-10" />
                    </div>
                 </div>
              </div>
           </Panel>

           <Panel title="Asset Triage" icon={Plus} variant={aiAnalyzed ? 'ai' : 'active'}>
              <div className="grid grid-cols-1 gap-4">
                 <div className="flex justify-between items-center p-3 nexus-card bg-white/[0.01]">
                    <span className="nexus-label">VEHICLES DETECTED</span>
                    <div className="flex items-center gap-4">
                       <button onClick={() => decrement(setVehicles, vehicles)} className="w-8 h-8 rounded-sm bg-white/5 border border-[var(--nx-border)] flex items-center justify-center hover:bg-white/10 transition-colors"><Minus size={14} /></button>
                       <span className="text-lg font-black text-white font-mono w-4 text-center">{vehicles}</span>
                       <button onClick={() => increment(setVehicles, vehicles)} className="w-8 h-8 rounded-sm bg-white/5 border border-[var(--nx-border)] flex items-center justify-center hover:bg-white/10 transition-colors"><Plus size={14} /></button>
                    </div>
                 </div>
                 <div className="flex justify-between items-center p-3 nexus-card bg-white/[0.01]">
                    <span className="nexus-label">BIOLOGICAL TRAUMA</span>
                    <div className="flex items-center gap-4">
                       <button onClick={() => decrement(setInjuries, injuries)} className="w-8 h-8 rounded-sm bg-white/5 border border-[var(--nx-border)] flex items-center justify-center hover:bg-white/10 transition-colors"><Minus size={14} /></button>
                       <span className={`text-lg font-black font-mono w-4 text-center ${injuries > 0 ? 'text-[var(--nx-red-primary)] animate-pulse' : 'text-white'}`}>{injuries}</span>
                       <button onClick={() => increment(setInjuries, injuries)} className="w-8 h-8 rounded-sm bg-white/5 border border-[var(--nx-border)] flex items-center justify-center hover:bg-white/10 transition-colors"><Plus size={14} /></button>
                    </div>
                 </div>
              </div>
           </Panel>
        </div>

        <Panel title="Field Observations" icon={Sparkles} variant={aiAnalyzed ? 'ai' : 'active'}>
           <div className="flex flex-col gap-2">
              <label className="nexus-label">TACTICAL DESCRIPTION</label>
              <textarea 
                rows={5} 
                className={`nexus-input resize-none font-mono text-[11px] leading-relaxed transition-all ${aiAnalyzed ? 'border-[var(--nx-blue-primary)]/40 bg-[var(--nx-blue-dim)]' : ''}`}
                placeholder="INPUT FIELD OBSERVATIONS..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {aiAnalyzed && <p className="text-[9px] text-[var(--nx-blue-primary)] font-bold uppercase tracking-widest mt-1">NEXUS-AI SUGGESTIONS INTEGRATED</p>}
           </div>
        </Panel>

        <div className="flex flex-col gap-6">
           <div className="flex justify-between items-center p-4 nexus-card bg-white/[0.02]">
              <div className="flex items-center gap-4">
                 <div className={`p-2 rounded-sm ${isAnonymous ? 'bg-[var(--nx-blue-dim)] text-[var(--nx-blue-primary)]' : 'bg-white/5 text-[var(--nx-text-dim)]'}`}>
                    <EyeOff size={18} />
                 </div>
                 <div>
                    <div className="text-xs font-black text-white uppercase tracking-tight">GHOST PROTOCOL</div>
                    <p className="text-[10px] text-[var(--nx-text-dim)] uppercase">STRIP PERSONAL METADATA BEFORE ARCHIVING</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-12 h-6 border transition-all relative ${isAnonymous ? 'border-[var(--nx-blue-primary)] bg-[var(--nx-blue-dim)]' : 'border-[var(--nx-border)] bg-transparent'}`}
              >
                 <div className={`absolute top-1 bottom-1 w-4 transition-all ${isAnonymous ? 'right-1 bg-[var(--nx-blue-primary)]' : 'left-1 bg-[var(--nx-border)]'}`} />
              </button>
           </div>

           <button className="w-full h-16 bg-[var(--nx-red-primary)] text-white font-black text-lg uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:brightness-110 transition-all shadow-[0_0_30px_rgba(255,59,59,0.3)] group overflow-hidden relative">
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
              <Send size={20} />
              COMMIT TO BLOCKCHAIN
           </button>
        </div>
      </div>
    </div>
  );
};
