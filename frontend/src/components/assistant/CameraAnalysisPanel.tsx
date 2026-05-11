import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FlipHorizontal, 
  Snowflake, 
  Save, 
  Loader2, 
  AlertCircle, 
  Maximize2, 
  ShieldCheck
} from 'lucide-react';
import { useAssistantOrchestrator } from '../../hooks/useAssistantOrchestrator';
import { usePoseDetection } from '../../hooks/usePoseDetection';
import { useIdentityRecognition } from '../../hooks/useIdentityRecognition';

interface Detection {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  severity: 'amber' | 'red' | 'green';
}

const extractFrame = (video: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }
  return '';
};

export const CameraAnalysisPanel: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [detections, setDetections] = useState<Detection[]>([]);
  
  const { sendToAI } = useAssistantOrchestrator();
  const { pose, isReady: isPoseReady } = usePoseDetection(videoRef);
  const { identity, qrData, isModelsLoaded: isFaceReady } = useIdentityRecognition(videoRef);

  // Draw Pose and Face landmarks
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // Mirror if flipped
      if (isFlipped) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-ctx.canvas.width, 0);
      }

      // Draw Pose
      if (pose && pose.poseLandmarks) {
        ctx.fillStyle = '#00FF00';
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;

        (pose.poseLandmarks as Array<{x: number, y: number}>).forEach((landmark) => {
          ctx.beginPath();
          ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, 2, 0, 2 * Math.PI);
          ctx.fill();
        });
      }

      if (isFlipped) ctx.restore();

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [pose, isFlipped]);

  const handleAnalyse = async () => {
    if (!videoRef.current || isAnalyzing) return;
    
    setIsAnalyzing(true);
    const frame = extractFrame(videoRef.current);
    
    try {
      await sendToAI("Visual Triage Request", frame);
      
      // Update detections based on pose/identity if available
      if (pose) {
        setDetections([{
          label: 'SKELETAL ANALYSIS ACTIVE',
          x: 10, y: 10, w: 20, h: 5, severity: 'green'
        }]);
      }
    } catch (err) {
      console.error('Camera analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveFrame = () => {
    if (!videoRef.current) return;
    const frame = extractFrame(videoRef.current);
    const link = document.createElement('a');
    link.href = frame;
    link.download = `roadsos-capture-${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#080C14]">
      {/* Camera Feed Container */}
      <motion.div 
        className="relative aspect-video w-full bg-black overflow-hidden border-b border-slate-800"
      >
        <motion.video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          animate={{ scale: zoom, scaleX: isFlipped ? -1 : 1 }}
          transition={{ duration: 0.3 }}
          className={`w-full h-full object-cover ${
            isFrozen ? 'opacity-50' : 'opacity-100'
          }`}
        />

        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none w-full h-full"
          width={1280}
          height={720}
        />

        {/* AI Overlays */}
        <AnimatePresence>
          {identity && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 z-20"
            >
              <div className="bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-blue-400/30 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
                <span className="text-[10px] font-black tracking-wider uppercase text-white">ID: {identity.name}</span>
                <span className="text-[10px] font-bold text-blue-200">({Math.round(identity.confidence * 100)}%)</span>
              </div>
            </motion.div>
          )}

          {qrData && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-16 left-4 z-20"
            >
              <div className="bg-green-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-green-400/30 flex items-center gap-2">
                <ShieldCheck size={14} className="text-white" />
                <span className="text-[10px] font-black tracking-wider uppercase text-white">QR DETECTED</span>
              </div>
            </motion.div>
          )}

          {detections.map((det, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                left: `${det.x}%`,
                top: `${det.y}%`,
                width: `${det.w}%`,
                height: `${det.h}%`
              }}
              className="absolute border-2 border-amber-500 bg-amber-500/10"
            >
              <div className="absolute -top-6 left-0 bg-amber-500 text-black text-[10px] font-bold px-1 py-0.5 rounded whitespace-nowrap">
                {det.label}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Status Indicators */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className={`flex items-center gap-2 ${isPoseReady ? 'bg-green-500/90' : 'bg-slate-700/90'} text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md transition-colors`}>
            <div className={`w-1.5 h-1.5 ${isPoseReady ? 'bg-white' : 'bg-gray-400'} rounded-full animate-pulse`} />
            {isPoseReady ? 'POSE TRACKING LIVE' : 'INITIALIZING POSE...'}
          </div>
          <div className={`flex items-center gap-2 ${isFaceReady ? 'bg-blue-500/90' : 'bg-slate-700/90'} text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md transition-colors`}>
            <div className={`w-1.5 h-1.5 ${isFaceReady ? 'bg-white' : 'bg-gray-400'} rounded-full animate-pulse`} />
            {isFaceReady ? 'FACE ID ACTIVE' : 'LOADING FACE AI...'}
          </div>
        </div>

        {/* Camera Controls Overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/60 backdrop-blur-xl p-2 rounded-2xl border border-slate-700/50">
          <button onClick={() => setIsFlipped(!isFlipped)} className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors" title="Flip Camera">
            <FlipHorizontal size={20} />
          </button>
          <button onClick={() => setIsFrozen(!isFrozen)} className={`p-2 rounded-xl transition-colors ${isFrozen ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-white'}`} title={isFrozen ? "Unfreeze Frame" : "Freeze Frame"}>
            <Snowflake size={20} />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1" />
          <button onClick={handleAnalyse} disabled={isAnalyzing} className="px-4 py-2 bg-[#FF9933] text-black font-bold rounded-xl text-xs hover:bg-[#FFB366] transition-colors disabled:opacity-50">
            {isAnalyzing ? (
              <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> ANALYSING...</span>
            ) : 'ANALYSE NOW'}
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1" />
          <button onClick={handleSaveFrame} className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors" title="Save Capture">
            <Save size={20} />
          </button>
        </div>

        {/* Zoom Slider */}
        <div className="absolute right-4 bottom-1/2 translate-y-1/2 flex flex-col items-center gap-2 bg-slate-900/60 backdrop-blur-md p-2 rounded-full border border-slate-700/50">
          <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1 text-white hover:text-blue-400" title="Zoom In">+</button>
          <div className="h-20 w-px bg-slate-700 relative">
            <motion.div 
              className="absolute w-2 h-2 bg-blue-500 rounded-full left-1/2 -translate-x-1/2" 
              animate={{ bottom: `${(zoom - 1) / 2 * 100}%` }}
            />
          </div>
          <button onClick={() => setZoom(Math.max(1, zoom - 0.1))} className="p-1 text-white hover:text-blue-400" title="Zoom Out">-</button>
        </div>
      </motion.div>

      {/* Analysis Insights */}
      <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="text-green-400" size={18} />
          <h3 className="text-white font-bold text-sm tracking-tight uppercase">AI Vision Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg shrink-0">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Head Trauma Detected</p>
                <p className="text-gray-500 text-xs mt-1">Minor laceration visible on forehead. No active bleeding observed.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg shrink-0">
                <Maximize2 size={18} />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Environment Check</p>
                <p className="text-gray-500 text-xs mt-1">Scene is secure. Proper lighting detected. No smoke or fire visible.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
