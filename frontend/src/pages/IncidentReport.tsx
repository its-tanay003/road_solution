import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Camera, 
  Bot, 
  Lock, 
  Plus, 
  Minus, 
  EyeOff,
  AlertOctagon,
  Shield,
  Search
} from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { VaahanLookup } from '../components/VaahanLookup';
import { supabase } from '../lib/supabaseClient';
import { uploadCrashPhoto } from '../services/storageService';

export const IncidentReport = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
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
    setPhotoFile(file);
    setIsAnalyzing(true);
    setAiAnalyzed(false);

    // Mock AI Vision Processing Delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiAnalyzed(true);
      
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
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. Create SOS Event
      const { data: event, error: eventError } = await supabase
        .from('sos_events')
        .insert({
          user_id: isAnonymous ? null : session?.user?.id,
          device_id: 'WEB_CLIENT_' + Math.random().toString(36).slice(2, 7),
          location: `POINT(77.2090 28.6139)`, // Mocked location for now
          severity: injuries > 0 ? 'CRITICAL' : 'MODERATE',
          confidence_score: 0.95
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // 2. Upload Photo if exists
      let publicPhotoUrl = '';
      if (photoFile && event) {
        publicPhotoUrl = await uploadCrashPhoto(photoFile, event.id);
      }

      // 3. Add Incident Log
      await supabase.from('incident_logs').insert({
        sos_event_id: event.id,
        action_type: 'REPORT_SUBMITTED',
        description: description,
        metadata: {
          vehicles,
          injuries,
          photo_url: publicPhotoUrl,
          is_anonymous: isAnonymous
        }
      });

      alert("Report committed to decentralized cloud infrastructure.");
      // Reset form or redirect
    } catch (err) {
      console.error('Failed to submit incident:', err);
      alert('Failed to submit report. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-nx-bg-base text-nx-text-primary p-6 pb-24 lg:pb-10 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-nx-bg-elevated border border-nx-border flex items-center justify-center text-nx-red-primary">
              <AlertOctagon size={24} />
           </div>
           <div>
              <h1 className="text-xl font-bold text-white tracking-tighter">REPORT INCIDENT</h1>
              <p className="text-[10px] text-nx-text-dim uppercase tracking-widest mt-1">DIRECT NEURAL RELAY TO EMERGENCY SERVICES</p>
           </div>
        </div>

        <Panel 
          title="Evidence Submission" 
          icon={Camera} 
          subtitle="AI-Enhanced Data Extraction"
          action={aiAnalyzed && <Badge variant="ai">NEXUS-VISION ACTIVE</Badge>}
        >
          <div className="space-y-6 relative overflow-hidden">
             <AnimatePresence>
               {isAnalyzing && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-nx-bg-(--color-surface)/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-8 border border-nx-blue-primary/30 rounded-sm"
                 >
                   <div className="relative mb-6">
                      <div className="w-16 h-16 border-2 border-nx-blue-primary/20 border-t-nx-blue-primary rounded-full animate-spin" />
                      <Bot className="absolute inset-0 m-auto text-nx-blue-primary" size={24} />
                   </div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Neural Analysis in Progress</h3>
                   <p className="text-[10px] text-nx-text-dim font-mono max-w-[240px]">SCANNING KINETIC VECTORS, ASSET COUNTS, AND ENVIRONMENTAL HAZARDS...</p>
                 </motion.div>
               )}
             </AnimatePresence>

             <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef}
               onChange={handlePhotoUpload}
               title="UPLOAD PHOTO"
               placeholder="SELECT IMAGE"
             />

             {!photoUrl ? (
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="nexus-card border-dashed border-2 border-nx-blue-primary/30 bg-nx-blue-dim p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-nx-blue-dim/80 transition-all group"
               >
                 <div className="w-16 h-16 rounded-full bg-nx-blue-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera size={32} className="text-nx-blue-primary" />
                 </div>
                 <span className="text-xs font-black text-white uppercase tracking-widest">Deploy Vision Sensor</span>
                 <span className="text-[10px] text-nx-text-dim mt-2 font-mono uppercase">UPLOAD PHOTO FOR AUTOMATIC FIELD TRIAGE</span>
               </div>
             ) : (
               <div className="nexus-card p-6 bg-white/2 border-white/5 mb-8">
                  <div className="flex items-center gap-3 text-nx-green-primary mb-4">
                     <Shield size={16} />
                     <span className="text-xs font-bold uppercase tracking-widest">REAL-TIME DATA HARVESTING</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 text-nx-text-dim">
                        <MapPin size={14} className="text-nx-blue-primary" />
                        <span className="text-[10px] font-mono">LAT: 28.6139 | LNG: 77.2090</span>
                     </div>
                     <div className="flex items-center gap-3 text-nx-text-dim">
                        <Clock size={14} className="text-nx-blue-primary" />
                        <span className="text-[10px] font-mono">STAMP: {new Date().toLocaleTimeString()}</span>
                     </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button variant="secondary" size="sm" onClick={() => { setPhotoUrl(null); setAiAnalyzed(false); }}>RE-ACQUIRE</Button>
                  </div>
               </div>
             )}
          </div>
        </Panel>

        {/* Vaahan Vehicle Verification Tool */}
        <div className="nexus-card p-6 mb-8 bg-nx-bg-(--color-surface)/95 border-nx-blue-primary/30">
           <div className="flex items-center gap-3 mb-6">
              <Search size={18} className="text-nx-blue-primary" />
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">VAAHAN VERIFICATION</h3>
           </div>
           <VaahanLookup />
        </div>

        <div className="nexus-card p-6 mb-8 bg-nx-bg-(--color-surface)/95 border-nx-blue-primary/30">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-4 bg-nx-blue-primary" />
              <div className="flex-1 border-t border-nx-blue-primary/20" />
              <span className="text-[10px] font-bold text-nx-blue-primary uppercase tracking-[0.2em]">IDENTIFY TYPOLOGY</span>
              <div className="flex-1 border-t border-nx-blue-primary/20" />
           </div>
           <p className="text-[11px] text-nx-text-dim mb-6 uppercase leading-relaxed font-mono">
              Describe the event briefly. AI will classify and dispatch appropriate response units.
           </p>
           <input 
              className="nexus-input w-full text-lg py-4"
              placeholder="e.g. MULTI-VEHICLE COLLISION, SMOKE VISIBLE"
              title="INCIDENT DESCRIPTION"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Panel title="Contextual Data" icon={MapPin} variant={aiAnalyzed ? 'ai' : 'active'}>
              <div className="space-y-4">
                 <div className="flex flex-col gap-2">
                    <label className="nexus-label">DEPLOYMENT COORDINATES</label>
                    <div className="nexus-input bg-white/2 text-nx-text-dim flex items-center justify-between">
                       <span className="font-mono">28.6139° N, 77.2090° E</span>
                       <Lock size={12} className="opacity-30" />
                    </div>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="nexus-label">INCIDENT TIMESTAMP</label>
                    <div className="relative">
                       <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-nx-text-dim" size={14} />
                       <input 
                          type="datetime-local" 
                          className="nexus-input pl-10" 
                          title="INCIDENT TIMESTAMP"
                          placeholder="SELECT DATE AND TIME"
                        />
                    </div>
                 </div>
              </div>
           </Panel>

           <Panel title="Asset Triage" icon={Plus} variant={aiAnalyzed ? 'ai' : 'active'}>
              <div className="grid grid-cols-1 gap-4">
                 <div className="flex justify-between items-center p-3 nexus-card bg-white/1">
                    <span className="nexus-label">VEHICLES DETECTED</span>
                    <div className="flex items-center gap-4">
                       <button aria-label="Decrease vehicle count" onClick={() => decrement(setVehicles, vehicles)} className="w-8 h-8 rounded-sm bg-white/5 border border-nx-border flex items-center justify-center hover:bg-white/10 transition-colors"><Minus size={14} /></button>
                       <span className="text-lg font-black text-white font-mono w-4 text-center">{vehicles}</span>
                       <button aria-label="Increase vehicle count" onClick={() => increment(setVehicles, vehicles)} className="w-8 h-8 rounded-sm bg-white/5 border border-nx-border flex items-center justify-center hover:bg-white/10 transition-colors"><Plus size={14} /></button>
                    </div>
                 </div>
                 <div className="flex justify-between items-center p-3 nexus-card bg-white/1">
                    <span className="nexus-label">BIOLOGICAL TRAUMA</span>
                    <div className="flex items-center gap-4">
                       <button aria-label="Decrease trauma count" onClick={() => decrement(setInjuries, injuries)} className="w-8 h-8 rounded-sm bg-white/5 border border-nx-border flex items-center justify-center hover:bg-white/10 transition-colors"><Minus size={14} /></button>
                       <span className={`text-lg font-black font-mono w-4 text-center ${injuries > 0 ? 'text-nx-red-primary animate-pulse' : 'text-white'}`}>{injuries}</span>
                       <button aria-label="Increase trauma count" onClick={() => increment(setInjuries, injuries)} className="w-8 h-8 rounded-sm bg-white/5 border border-nx-border flex items-center justify-center hover:bg-white/10 transition-colors"><Plus size={14} /></button>
                    </div>
                 </div>
              </div>
           </Panel>
        </div>

        <div className="flex flex-col gap-6">
           <div className="flex justify-between items-center p-4 nexus-card bg-white/2">
              <div className="flex items-center gap-4">
                 <div className={`p-2 rounded-sm ${isAnonymous ? 'bg-nx-blue-dim text-nx-blue-primary' : 'bg-white/5 text-nx-text-dim'}`}>
                    <EyeOff size={18} />
                 </div>
                 <div>
                    <div className="text-xs font-black text-white uppercase tracking-tight">GHOST PROTOCOL</div>
                    <p className="text-[10px] text-nx-text-dim uppercase">STRIP PERSONAL METADATA BEFORE ARCHIVING</p>
                 </div>
              </div>
              <button 
                aria-label="Toggle Ghost Protocol"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-12 h-6 border transition-all relative ${isAnonymous ? 'border-nx-blue-primary bg-nx-blue-dim' : 'border-nx-border bg-transparent'}`}
              >
                 <div className={`absolute top-1 bottom-1 w-4 transition-all ${isAnonymous ? 'right-1 bg-nx-blue-primary' : 'left-1 bg-nx-border'}`} />
              </button>
           </div>
           <button 
              onClick={handleSubmit}
              className="w-full h-16 bg-nx-red-primary text-white font-black text-lg uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:brightness-110 transition-all shadow-[0_0_30px_rgba(255,59,59,0.3)] group overflow-hidden relative"
           >
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
              COMMIT TO BLOCKCHAIN
           </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentReport;
