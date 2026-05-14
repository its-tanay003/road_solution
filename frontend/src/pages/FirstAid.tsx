import { AlertTriangle, PlayCircle, Volume2, ShieldCheck, Info, Video, Search, LifeBuoy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Panel } from '../components/ui/Panel';

export const FirstAid = () => {
  const { t, i18n } = useTranslation();
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const stepsText = t('first_aid.steps_tts', "Step 1. Apply Direct Pressure. Press hard and continuously with a clean cloth. Step 2. Elevate the Injury. Raise the injured area above the level of the heart if possible. Step 3. Lay the Person Down. Help them lie down to prevent fainting.");

  const handleReadAloud = () => {
    if (!("speechSynthesis" in window)) return;
    
    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(stepsText);
    const langMap: Record<string, string> = {
      en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', 
      ml: 'ml-IN', kn: 'kn-IN', mr: 'mr-IN', pa: 'pa-IN', bn: 'bn-IN'
    };
    
    utterance.lang = langMap[i18n.language] || 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlayingTTS(false);
    
    window.speechSynthesis.speak(utterance);
    setIsPlayingTTS(true);
  };

  return (
    <div className="min-h-screen bg-nx-bg-base text-nx-text-primary p-6 pb-24 lg:pb-10 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-nx-bg-elevated border border-nx-border flex items-center justify-center text-nx-red-primary">
              <LifeBuoy size={24} />
           </div>
           <div>
              <h1 className="text-xl font-bold text-white tracking-tighter uppercase">FIRST AID PROTOCOLS</h1>
              <p className="text-[10px] text-nx-text-dim uppercase tracking-widest mt-1">EMERGENCY FIELD MANUAL & GUIDANCE</p>
           </div>
        </div>

        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-nx-text-dim group-focus-within:text-nx-blue-primary transition-colors" size={18} />
           <input 
              className="nexus-input w-full pl-12 py-4 bg-nx-bg-surface border border-nx-border/50 focus:border-nx-blue-primary/50 text-sm"
              placeholder="SEARCH PROTOCOLS (E.G. BLEEDING, CPR, CHOKING)..."
              title="SEARCH PROTOCOLS"
              aria-label="SEARCH PROTOCOLS"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>

        {/* AI Confidence Status */}
        <div className="nexus-card p-3 bg-nx-blue-dim border-nx-blue-primary/20 flex items-center justify-center gap-3">
          <ShieldCheck className="text-nx-blue-primary" size={18} />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">NEXUS-AI TRIAGE CONFIDENCE: 98% MATCH</span>
        </div>

        {/* Tactical Instructions Panel */}
        <div className="nexus-card bg-nx-bg-surface border-nx-border overflow-hidden shadow-2xl">
           <div className="bg-nx-red-primary p-5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <AlertTriangle className="text-white" size={24} />
                 <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">SEVERE HEMORRHAGE PROTOCOL</h1>
              </div>
              <button 
                onClick={handleReadAloud}
                aria-label={isPlayingTTS ? "Stop Audio" : "Read Protocol Aloud"}
                title={isPlayingTTS ? "Stop Audio" : "Read Protocol Aloud"}
                className={`w-10 h-10 rounded-sm flex items-center justify-center border transition-all ${isPlayingTTS ? 'bg-white text-nx-red-primary animate-pulse' : 'bg-black/20 text-white border-white/10 hover:bg-black/40'}`}
              >
                <Volume2 size={20} />
              </button>
           </div>
           
           <div className="p-6 space-y-8">
              {/* Critical Warnings */}
              <div className="p-4 bg-nx-red-dim border-l-4 border-nx-red-primary rounded-r-sm">
                 <div className="flex items-center gap-2 text-nx-red-primary mb-2">
                    <Info size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">CRITICAL NEGATIVES</span>
                 </div>
                 <ul className="text-xs text-white/90 space-y-2 list-none pl-1">
                   <li className="flex gap-2 items-start opacity-90"><span className="text-nx-red-primary">•</span> DO NOT REMOVE EMBEDDED OBJECTS</li>
                   <li className="flex gap-2 items-start opacity-90"><span className="text-nx-red-primary">•</span> DO NOT REPLACE SATURATED DRESSINGS - STACK ONLY</li>
                 </ul>
              </div>

              {/* Step Sequence */}
              <div className="space-y-6">
                <StepItem num="01" title="DIRECT PRESSURE" text="APPLY CONTINUOUS HIGH-PRESSURE FORCE USING STERILE ASSETS OR CLEAN CLOTHING." active />
                <StepItem num="02" title="ELEVATION" text="POSITION INJURY VECTOR ABOVE CARDIAC LEVEL TO REDUCE HYDROSTATIC PRESSURE." />
                <StepItem num="03" title="STABILIZE POSITION" text="PLACE ASSET IN SUPINE POSITION TO MAINTAIN CEREBRAL BLOOD FLOW." />
              </div>
           </div>
        </div>

        {/* Visual Support Panel */}
        <Panel title="Tactical Video Guide" icon={Video} subtitle="Local encrypted cache active">
           <div className="relative rounded-sm overflow-hidden border border-(--nx-border) aspect-video group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=1000" alt="Video Placeholder" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                 <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center bg-black/20 backdrop-blur-sm group-hover:border-(--nx-blue-primary) group-hover:text-(--nx-blue-primary) transition-all">
                    <PlayCircle size={40} className="ml-1" />
                 </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/80 px-2 py-1 rounded-sm text-[9px] font-mono text-white border border-white/10 uppercase">
                 Local • 1:45
              </div>
              {/* Tactical scanline */}
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_2px,white_3px)]" />
           </div>
        </Panel>
      </div>
    </div>
  );
};

interface StepItemProps {
  num: string;
  title: string;
  text: string;
  active?: boolean;
}

const StepItem = ({ num, title, text, active }: StepItemProps) => (
  <div className="flex gap-6 group">
     <div className={`w-10 h-10 shrink-0 border rounded-sm flex items-center justify-center font-mono font-black text-sm transition-all ${active ? 'bg-(--nx-red-primary) border-(--nx-red-primary) text-white shadow-[0_0_15px_rgba(255,59,59,0.3)]' : 'bg-white/2 border-(--nx-border) text-(--nx-text-tertiary)'}`}>
        {num}
     </div>
     <div className="pt-1 flex-1">
        <h4 className={`text-sm font-black uppercase tracking-tight mb-1.5 transition-colors ${active ? 'text-white' : 'text-(--nx-text-secondary)'}`}>{title}</h4>
        <p className="text-xs text-(--nx-text-dim) leading-relaxed font-mono uppercase">{text}</p>
     </div>
  </div>
);
