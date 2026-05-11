import React, { useRef, useState, useEffect } from 'react';
import { Camera, Activity, User, QrCode, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { useIdentityRecognition } from '../hooks/useIdentityRecognition';
import axios from 'axios';

interface MedicalVisionPanelProps {
  onAnalysisComplete?: (result: any) => void;
}

export const MedicalVisionPanel: React.FC<MedicalVisionPanelProps> = ({ onAnalysisComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionResult, setVisionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { pose, isReady: isPoseReady } = usePoseDetection(videoRef);
  const { identity, qrData, isModelsLoaded } = useIdentityRecognition(videoRef);

  // Drawing overlay
  useEffect(() => {
    if (!canvasRef.current || !pose || !videoRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw landmarks if present
    if (pose.poseLandmarks) {
      ctx.fillStyle = '#00FF00';
      pose.poseLandmarks.forEach((landmark: any) => {
        ctx.beginPath();
        ctx.arc(landmark.x * canvasRef.current!.width, landmark.y * canvasRef.current!.height, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, [pose]);

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;
    setIsAnalyzing(true);
    setError(null);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg');

      try {
        const response = await axios.post('/api/ai/vision-analyze', {
          imageBase64: base64Image,
          patientProfile: identity || (qrData ? { qrId: qrData } : null)
        });
        setVisionResult(response.data);
        if (onAnalysisComplete) onAnalysisComplete(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Analysis failed');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-white leading-none">Medical Vision AI</h3>
            <p className="text-xs text-slate-400 mt-1">Real-time Triage & Identity System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${isPoseReady ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
            <Activity className="w-3 h-3" />
            {isPoseReady ? 'POSE READY' : 'LOADING POSE...'}
          </div>
          <div className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${isModelsLoaded ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
            <User className="w-3 h-3" />
            {isModelsLoaded ? 'FACE READY' : 'LOADING FACE...'}
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        
        {/* Indicators */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {identity && (
            <div className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <CheckCircle2 className="w-4 h-4" />
              MATCH: {identity.name} ({Math.round(identity.confidence * 100)}%)
            </div>
          )}
          {qrData && (
            <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <QrCode className="w-4 h-4" />
              EMERGENCY QR SCANNED
            </div>
          )}
        </div>

        {/* Action Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={captureAndAnalyze}
            disabled={isAnalyzing}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-xl ${
              isAnalyzing 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-white scale-100 hover:scale-105 active:scale-95'
            }`}
          >
            {isAnalyzing ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
            {isAnalyzing ? 'Analyzing Image...' : 'Run Vision Triage'}
          </button>
        </div>
      </div>

      {/* Results Panel */}
      {(visionResult || error) && (
        <div className="p-6 bg-slate-950 border-t border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold">Analysis Failed</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Observed Conditions</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    visionResult.estimatedSeverity === 'CRITICAL' ? 'bg-red-500 text-white' :
                    visionResult.estimatedSeverity === 'SERIOUS' ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-black'
                  }`}>
                    {visionResult.estimatedSeverity}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {visionResult.observedConditions?.map((cond: string, i: number) => (
                    <span key={i} className="bg-slate-800 text-slate-300 px-3 py-1 rounded-lg text-sm border border-slate-700">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Urgency Indicators</h4>
                <ul className="space-y-2">
                  {visionResult.urgencyIndicators?.map((ind: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                      {ind}
                    </li>
                  ))}
                </ul>
              </div>

              {visionResult.additionalObservations && (
                <div className="col-span-full bg-slate-900/50 p-4 rounded-xl border border-slate-800 mt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detailed Observations</h4>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "{visionResult.additionalObservations}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
