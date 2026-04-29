import { FileText, Camera, Send, EyeOff, Bot, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useRef } from 'react';

export const IncidentReport = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  // Form State
  const [typology, setTypology] = useState('Vehicle Collision (Multi)');
  const [vehicles, setVehicles] = useState(0);
  const [injuries, setInjuries] = useState(0);
  const [description, setDescription] = useState('');
  const [aiAnalyzed, setAiAnalyzed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local object URL for thumbnail
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setIsAnalyzing(true);
    setAiAnalyzed(false);

    // Mock AI Vision Processing Delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiAnalyzed(true);
      
      // Simulated AI Results Payload
      setTypology('Vehicle Collision (Multi)');
      setVehicles(2);
      setInjuries(1); // Detected potential minor injury
      setDescription('AI Assessment: 2-vehicle rear-end collision detected. Moderate structural damage to the primary vehicle. No severe hazards (fire/spills) visible. One passenger appears to require minor medical attention.');
    }, 2500);
  };

  const increment = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    setter(value + 1);
  };

  const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    if (value > 0) setter(value - 1);
  };

  return (
    <div className="min-h-screen bg-background text-card p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        
        <div className="text-center py-4">
          <h1 className="text-2xl font-condensed font-bold flex items-center justify-center"><FileText className="mr-2 text-emergency" /> Incident Report</h1>
          <p className="text-sm text-muted mt-2">Log details for insurance or formal records</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-5 relative overflow-hidden">
          
          {/* AI Analysis Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-navy/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
              <Loader2 className="animate-spin text-safe mb-4" size={48} />
              <h3 className="text-lg font-bold font-condensed text-white flex items-center">
                <Bot className="mr-2 text-safe" /> AI Vision Active
              </h3>
              <p className="text-sm text-muted mt-2">Analyzing scene for vehicles, hazards, and potential injuries...</p>
            </div>
          )}

          {/* Evidence Photos (Moved to top for AI flow) */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-xs text-muted font-mono uppercase tracking-widest block">Evidence Photos</label>
              {aiAnalyzed && (
                <span className="text-xs font-bold text-safe flex items-center bg-safe/10 px-2 py-0.5 rounded border border-safe/30">
                  <Sparkles size={12} className="mr-1" /> AI Auto-filled
                </span>
              )}
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              title="Upload evidence photo"
              placeholder="Select photo"
              className="hidden" 
              ref={fileInputRef}
              onChange={handlePhotoUpload}
            />

            {!photoUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-safe/40 bg-safe/5 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-safe/10 transition-colors shadow-[0_0_15px_rgba(46,196,182,0.1)]"
              >
                <Camera size={32} className="text-safe mb-2" />
                <span className="text-sm font-bold text-safe">Upload for AI Triage</span>
                <span className="text-xs text-muted mt-1 text-center">AI will auto-fill report details</span>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 group">
                <img src={photoUrl} alt="Uploaded evidence" className="w-full h-40 object-cover opacity-80" />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex items-end p-3">
                  <div className="flex items-center text-safe text-xs font-bold">
                    <CheckCircle2 size={14} className="mr-1" /> AI Scanning Complete
                  </div>
                </div>
                <button 
                  onClick={() => { setPhotoUrl(null); setAiAnalyzed(false); }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-lg backdrop-blur-sm text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Retake
                </button>
              </div>
            )}
          </div>

          {/* Location & Time */}
          <div>
            <label className="text-xs text-muted font-mono uppercase tracking-widest block mb-2">Location & Time</label>
            <div className="space-y-3">
              <input title="Location coordinates" placeholder="Location coordinates" type="text" value="28.6139° N, 77.2090° E" disabled className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-400 font-mono" />
              <input title="Incident time" placeholder="Incident time" type="datetime-local" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-safe" />
            </div>
          </div>

          {/* Typology */}
          <div className={`transition-all duration-500 ${aiAnalyzed ? 'ring-1 ring-safe/50 rounded-xl bg-safe/5' : ''}`}>
            <label className="text-xs text-muted font-mono uppercase tracking-widest block mb-2 px-1">Accident Typology</label>
            <select 
              title="Accident Typology"
              value={typology}
              onChange={(e) => setTypology(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-safe appearance-none"
            >
              <option>Vehicle Collision (Multi)</option>
              <option>Vehicle vs Pedestrian</option>
              <option>Single Vehicle Loss of Control</option>
              <option>Hazard / Debris on Road</option>
            </select>
          </div>

          {/* Steppers */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`transition-all duration-500 bg-black/40 border border-white/10 rounded-xl p-3 text-center ${aiAnalyzed ? 'ring-1 ring-safe/50 bg-safe/5' : ''}`}>
              <label className="text-xs text-muted font-mono block mb-2">Vehicles Involved</label>
              <div className="flex items-center justify-center space-x-4">
                <button onClick={() => decrement(setVehicles, vehicles)} className="w-8 h-8 rounded-full bg-white/10 font-bold hover:bg-white/20">-</button>
                <span className="font-bold text-xl w-6">{vehicles}</span>
                <button onClick={() => increment(setVehicles, vehicles)} className="w-8 h-8 rounded-full bg-white/10 font-bold hover:bg-white/20">+</button>
              </div>
            </div>
            <div className={`transition-all duration-500 bg-black/40 border border-white/10 rounded-xl p-3 text-center ${aiAnalyzed ? 'ring-1 ring-safe/50 bg-safe/5' : ''}`}>
              <label className="text-xs text-muted font-mono block mb-2">Injuries</label>
              <div className="flex items-center justify-center space-x-4">
                <button onClick={() => decrement(setInjuries, injuries)} className="w-8 h-8 rounded-full bg-white/10 font-bold hover:bg-white/20">-</button>
                <span className={`font-bold text-xl w-6 ${injuries > 0 ? 'text-amber-500' : 'text-white'}`}>{injuries}</span>
                <button onClick={() => increment(setInjuries, injuries)} className="w-8 h-8 rounded-full bg-white/10 font-bold hover:bg-white/20">+</button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={`transition-all duration-500 ${aiAnalyzed ? 'ring-1 ring-safe/50 rounded-xl bg-safe/5' : ''}`}>
            <label className="text-xs text-muted font-mono uppercase tracking-widest block mb-2 px-1">Description</label>
            <textarea 
              rows={4} 
              placeholder="Optional details..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-safe resize-none"
            ></textarea>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex justify-between items-center bg-navy/50 p-4 rounded-xl border border-white/5">
            <div className="flex items-center">
              <EyeOff size={18} className="text-muted mr-2" />
              <span className="text-sm font-bold">Submit Anonymously</span>
            </div>
            <div className="w-12 h-6 bg-safe/20 rounded-full relative cursor-pointer border border-safe/50">
              <div className="w-5 h-5 bg-safe rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
            </div>
          </div>

        </div>

        {/* Submit */}
        <button className="w-full bg-emergency text-white py-4 rounded-2xl flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(215,38,56,0.4)] hover:bg-red-600 transition-colors">
          <Send size={20} className="mr-2" /> SUBMIT REPORT
        </button>

      </div>
    </div>
  );
};
