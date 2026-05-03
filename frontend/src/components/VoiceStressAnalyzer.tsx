import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '../store';

export const VoiceStressAnalyzer = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [panicScore, setPanicScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Stats for panic score calculation
  const rmsHistory = useRef<number[]>([]);
  const speechIntervals = useRef<number[]>([]);
  const lastSpeechTime = useRef<number>(0);
  const isSpeaking = useRef<boolean>(false);

  useEffect(() => {
    lastSpeechTime.current = Date.now();
  }, []);

  const { setPanicScore: setGlobalPanicScore } = useUIStore();

  const startAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      setIsRecording(true);
      setError(null);
      analyze();
    } catch (err) {
      console.error("Mic access error:", err);
      setError("Microphone access denied. Enable permissions to start stress analysis.");
    }
  };

  const stopAnalysis = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    
    setIsRecording(false);
    setPanicScore(0);
  };

  const analyze = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);
      
      // 1. Calculate RMS and Amplitude Variance
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const val = (timeData[i] - 128) / 128;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / bufferLength);
      
      rmsHistory.current.push(rms);
      if (rmsHistory.current.length > 100) rmsHistory.current.shift();
      
      const avgRms = rmsHistory.current.reduce((a, b) => a + b, 0) / rmsHistory.current.length;
      const variance = rmsHistory.current.reduce((a, b) => a + Math.pow(b - avgRms, 2), 0) / rmsHistory.current.length;
      
      // 2. Pitch Frequency Proxy (Peak frequency)
      let maxEnergy = 0;
      let peakBin = 0;
      for (let i = 0; i < bufferLength; i++) {
        if (freqData[i] > maxEnergy) {
          maxEnergy = freqData[i];
          peakBin = i;
        }
      }
      const sampleRate = audioContextRef.current?.sampleRate || 44100;
      const peakFreq = peakBin * (sampleRate / analyser.fftSize);
      
      // 3. Speech Rate & Rhythm
      const threshold = 0.05;
      const now = Date.now();
      if (rms > threshold && !isSpeaking.current) {
        isSpeaking.current = true;
        const interval = now - lastSpeechTime.current;
        speechIntervals.current.push(interval);
        if (speechIntervals.current.length > 20) speechIntervals.current.shift();
        lastSpeechTime.current = now;
      } else if (rms < threshold / 2) {
        isSpeaking.current = false;
      }
      
      // 4. Calculate Panic Score
      let score = 0;
      // High amplitude variance (>0.4 scale adjusted for normalized rms)
      if (variance * 100 > 0.4) score += 30;
      // Pitch > 300Hz (typical stressed voice is higher)
      if (peakFreq > 300 && maxEnergy > 50) score += 25;
      
      // Speech rate anomaly (very fast intervals < 200ms or large gaps > 2s)
      const recentIntervals = speechIntervals.current.slice(-5);
      const avgInterval = recentIntervals.length > 0 ? recentIntervals.reduce((a, b) => a + b, 0) / recentIntervals.length : 1000;
      if (avgInterval < 250 || (isSpeaking.current && (now - lastSpeechTime.current > 3000))) score += 25;
      
      // Rhythm Irregularity (Standard deviation of intervals)
      if (speechIntervals.current.length > 5) {
        const avg = speechIntervals.current.reduce((a, b) => a + b, 0) / speechIntervals.current.length;
        const stdDev = Math.sqrt(speechIntervals.current.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / speechIntervals.current.length);
        if (stdDev > 400) score += 20;
      }
      
      setPanicScore(Math.min(100, Math.floor(score)));
      setGlobalPanicScore(Math.min(100, Math.floor(score)));

      // Visual: Waveform Drawing
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      const stressLevel = score > 65 ? 'critical' : score > 30 ? 'stressed' : 'calm';
      const color = stressLevel === 'critical' ? '#ef4444' : stressLevel === 'stressed' ? '#f59e0b' : '#10b981';
      
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.beginPath();
      
      const sliceWidth = width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = (v * height) / 2;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        x += sliceWidth;
      }
      
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };
    
    draw();
  };

  useEffect(() => {
    return () => stopAnalysis();
  }, []);

  const getStatusInfo = () => {
    if (panicScore > 65) return { label: 'CRITICAL STRESS', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50' };
    if (panicScore > 30) return { label: 'STRESSED', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/50' };
    return { label: 'CALM', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50' };
  };

  const status = getStatusInfo();

  return (
    <div className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isRecording ? 'bg-red-500/20 text-red-500' : 'bg-slate-500/20 text-slate-400'}`}>
            <Mic size={20} className={isRecording ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Voice Stress <span className="text-cyan-500">Analyzer</span></h2>
            {isRecording && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                <span className="text-[9px] font-mono text-red-400 uppercase tracking-tighter">Live Analysis Active</span>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={isRecording ? stopAnalysis : startAnalysis}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
            isRecording 
              ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
              : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
          }`}
        >
          {isRecording ? 'Stop Analysis' : 'Start Analysis'}
        </button>
      </div>

      <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
        {/* Panic Score Gauge */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-800"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 80}
              initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - panicScore / 100) }}
              transition={{ type: 'spring', damping: 20 }}
              className={status.color.replace('text-', 'stroke-')}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              key={panicScore}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-5xl font-black ${status.color}`}
            >
              {panicScore}
            </motion.span>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Panic Score</span>
          </div>
        </div>

        {/* Waveform & Info */}
        <div className="flex-1 w-full space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/5 aspect-3/1">
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={200} 
              className="w-full h-full"
            />
            {!isRecording && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Waiting for Audio Input...</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Detected State</span>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={status.label}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className={`px-3 py-1 rounded-md border ${status.bg} ${status.border} ${status.color} text-[10px] font-black uppercase tracking-tighter flex items-center gap-2`}
                >
                  <Activity size={12} className={panicScore > 30 ? 'animate-pulse' : ''} />
                  {status.label}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {error ? (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={16} />
                <p className="text-[10px] text-red-400 font-medium leading-relaxed">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Pitch Proxy" value="Dynamic" active={isRecording} />
                <Metric label="Rhythm Sync" value="Analyzing" active={isRecording} />
              </div>
            )}
          </div>
        </div>
      </div>

      {isRecording && (
        <div className="p-4 bg-slate-950/50 border-t border-white/5 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[9px] uppercase tracking-[0.2em]">
            <CheckCircle2 size={12} />
            Context Synchronized with AI Triage
          </div>
        </div>
      )}
    </div>
  );
};

const Metric = ({ label, value, active }: { label: string; value: string; active: boolean }) => (
  <div className="bg-slate-950/30 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">{label}</span>
    <span className={`text-xs font-bold ${active ? 'text-slate-200' : 'text-slate-600'}`}>{active ? value : '---'}</span>
  </div>
);
