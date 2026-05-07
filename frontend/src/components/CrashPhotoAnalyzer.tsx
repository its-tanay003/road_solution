import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Camera, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Activity,
  Scan,
  X
} from 'lucide-react';
import axios from 'axios';
import { logger } from '../lib/logger';

interface AnalysisResult {
  deformation_severity: number;
  ejection_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fire_hazard: boolean;
  trapped_victim_probability: number;
  rollover_detected: boolean;
  recommended_units: string[];
  triage_notes: string;
  confidence_score: number;
}

interface CrashPhotoAnalyzerProps {
  onClose?: () => void;
}

export const CrashPhotoAnalyzer = ({ onClose }: CrashPhotoAnalyzerProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        analyzePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhoto = async (base64Data: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    
    // Extract base64 without prefix
    const base64Image = base64Data.split(',')[1];

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/triage/analyze-photo`, {
        image: base64Image
      });
      setResult(data);
    } catch (err) {
      logger.error("Analysis Error:", err);
      setError("AI analysis failed. Please check network connectivity.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
            <Camera size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Vision Triage <span className="text-cyan-500">Analyzer</span></h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Model: Claude-3.5-Sonnet-Vision</p>
          </div>
        </div>
        
        {image ? (
          <button onClick={reset} title="Reset Scan" className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        ) : onClose && (
          <button onClick={onClose} title="Close Vision Triage" className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="p-8">
        {!image ? (
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 bg-slate-950/20 cursor-pointer hover:bg-slate-950/40 transition-colors group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold">Upload Crash Scene Photo</h3>
              <p className="text-xs text-slate-500 mt-1">Drag and drop or click to scan impact vectors</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
              title="Upload Image"
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Viewport */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 group">
              <img src={image} alt="Crash scene" className="w-full h-full object-cover rounded-lg" />
              
              {/* Scan Line Animation */}
              {isAnalyzing && (
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-20"
                />
              )}

              {/* Analysis Overlays */}
              <AnimatePresence>
                {result && (
                  <>
                    {/* Ejection Risk Zone (Red) */}
                    {result.ejection_risk !== 'LOW' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        className="absolute top-[20%] left-[30%] w-40 h-40 bg-red-600 rounded-full blur-3xl mix-blend-overlay border-4 border-red-500/50"
                      />
                    )}
                    {/* Fire Hazard Zone (Yellow) */}
                    {result.fire_hazard && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        className="absolute bottom-[10%] right-[20%] w-32 h-32 bg-amber-500 rounded-full blur-3xl mix-blend-overlay border-4 border-amber-400/50"
                      />
                    )}
                    
                    {/* Floating Labels */}
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="absolute top-4 left-4 flex flex-col gap-2"
                    >
                      <div className="bg-red-600/80 backdrop-blur-md text-white text-[10px] font-black uppercase px-3 py-1 rounded-full border border-red-500/50 shadow-lg flex items-center gap-2">
                        <Activity size={12} /> Ejection Risk: {result.ejection_risk}
                      </div>
                      {result.fire_hazard && (
                        <div className="bg-amber-600/80 backdrop-blur-md text-white text-[10px] font-black uppercase px-3 py-1 rounded-full border border-amber-500/50 shadow-lg flex items-center gap-2">
                          <Flame size={12} /> Fire Hazard Detected
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                  <div className="flex flex-col items-center gap-4">
                    <Scan className="w-12 h-12 text-cyan-400 animate-pulse" />
                    <p className="text-cyan-400 font-mono text-xs font-black tracking-widest animate-pulse">AI SCANNING CRASH VECTORS...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Results Panel */}
            <div className="flex flex-col gap-6">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">AI Analysis Confidence</span>
                        <div className="flex items-center gap-2 text-emerald-400 font-black">
                          <CheckCircle2 size={16} />
                          <span className="text-2xl">{result.confidence_score}%</span>
                        </div>
                      </div>
                      <RadialSeverityGauge severity={result.deformation_severity} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <MetricCard 
                        label="Trapped Victim Prob." 
                        value={`${result.trapped_victim_probability}%`} 
                        icon={ShieldAlert}
                        color={result.trapped_victim_probability > 50 ? "text-red-400" : "text-amber-400"}
                      />
                      <MetricCard 
                        label="Rollover Detected" 
                        value={result.rollover_detected ? "YES" : "NO"} 
                        icon={AlertTriangle}
                        color={result.rollover_detected ? "text-red-400" : "text-slate-400"}
                      />
                    </div>

                    <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4">
                      <h4 className="text-[10px] font-mono text-slate-500 uppercase mb-2">Triage Notes</h4>
                      <p className="text-xs text-slate-300 leading-relaxed italic">"{result.triage_notes}"</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono text-slate-500 uppercase">Recommended Units</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.recommended_units.map((unit, i) => (
                          <span key={i} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] text-cyan-400 font-bold uppercase tracking-tighter">
                            {unit}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={reset}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 uppercase tracking-widest transition-all"
                    >
                      Scan New Image
                    </button>
                  </motion.div>
                ) : isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 py-12">
                    <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-slate-500 font-mono text-xs">Waiting for vision response...</p>
                  </div>
                ) : error ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 py-12">
                    <AlertTriangle className="text-red-500 w-12 h-12" />
                    <p className="text-red-400 font-mono text-xs">{error}</p>
                    <button onClick={() => analyzePhoto(image!)} className="text-cyan-400 text-xs font-bold uppercase border-b border-cyan-400">Retry Analysis</button>
                  </div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) => (
  <div className="bg-slate-950/30 border border-white/5 p-4 rounded-2xl">
    <div className="flex items-center gap-2 text-slate-500 mb-1">
      {/* @ts-ignore */}
      <Icon size={12} />
      <span className="text-[9px] font-mono uppercase">{label}</span>
    </div>
    <div className={`text-xl font-black ${color}`}>{value}</div>
  </div>
);

const RadialSeverityGauge = ({ severity }: { severity: number }) => {
  const percentage = (severity / 10) * 100;
  const strokeDasharray = `${percentage}, 100`;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
        <path
          className="stroke-white/5 fill-none"
          strokeWidth="3"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <motion.path
          initial={{ strokeDasharray: "0, 100" }}
          animate={{ strokeDasharray }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`fill-none ${severity > 7 ? 'stroke-red-500' : severity > 4 ? 'stroke-amber-500' : 'stroke-cyan-500'}`}
          strokeWidth="3"
          strokeLinecap="round"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white">{severity}</span>
        <span className="text-[8px] font-mono text-slate-500 uppercase">Severity</span>
      </div>
    </div>
  );
};
