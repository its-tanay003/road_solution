import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, X, Heart, Shield, Zap } from 'lucide-react';

interface ShareCardProps {
  data: {
    incidentId: string;
    livesSaved: number;
    responseTime: string;
    carbonOffset: string;
    location: string;
  };
  onClose: () => void;
}

export const ShareCardGenerator: React.FC<ShareCardProps> = ({ data, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);

  const generateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution
    const scale = 2;
    canvas.width = 600 * scale;
    canvas.height = 400 * scale;
    ctx.scale(scale, scale);

    // 1. Background
    ctx.fillStyle = '#080C14';
    ctx.fillRect(0, 0, 600, 400);

    // 2. Gradient Accent
    const grad = ctx.createLinearGradient(0, 0, 600, 400);
    grad.addColorStop(0, 'rgba(41, 121, 255, 0.1)');
    grad.addColorStop(1, 'rgba(255, 23, 68, 0.05)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 400);

    // 3. Glass Card Effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, 560, 360);

    // 4. Branding
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Space Grotesk';
    ctx.fillText('ROAD', 40, 60);
    ctx.fillStyle = '#FF1744';
    ctx.fillText('SoS', 105, 60);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('EMERGENCY CASE REPORT #' + data.incidentId, 40, 80);

    // 5. Main Impact Stat
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px Space Grotesk';
    ctx.fillText(data.livesSaved.toString(), 40, 160);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '20px Space Grotesk';
    ctx.fillText('LIVES PROTECTED', 100, 160);

    // 6. Metrics Grid
    const drawMetric = (label: string, value: string, x: number, y: number) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(label.toUpperCase(), x, y);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Space Grotesk';
      ctx.fillText(value, x, y + 25);
    };

    drawMetric('Response Time', data.responseTime, 40, 220);
    drawMetric('Carbon Offset', data.carbonOffset, 200, 220);
    drawMetric('Location', data.location, 360, 220);

    // 7. Verification Seal (Watermark)
    ctx.save();
    ctx.translate(500, 100);
    ctx.rotate(-Math.PI / 6);
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-50, -20, 100, 40);
    ctx.fillStyle = 'rgba(0, 230, 118, 0.2)';
    ctx.font = 'bold 12px Space Grotesk';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED CASE', 0, 5);
    ctx.restore();

    // 8. Footer QR Placeholder
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(500, 300, 60, 60);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(500, 300, 60, 60);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '8px JetBrains Mono';
    ctx.fillText('SCAN TO VERIFY', 500, 375);

    setIsGenerated(true);
  }, [data, setIsGenerated, canvasRef]);

  useEffect(() => {
    generateCanvas();
  }, [generateCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `ROADSoS-Impact-${data.incidentId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShareX = () => {
    const text = `Just saw #ROADSoS in action at @IITMadras — saving ${data.livesSaved} lives in the Golden Hour! 🚑💨 #RoadSafety #Hackathon2026`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#0D1321] border border-white/10 rounded-[2rem] p-8 max-w-2xl w-full relative overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#2979FF]/20 flex items-center justify-center text-[#2979FF]">
            <Share2 size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Generate Impact Report</h2>
            <p className="text-[10px] font-mono text-[#8892A4] uppercase tracking-widest">Viral Social Proof Mode</p>
          </div>
        </div>

        {/* Canvas Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-white/5 mb-8 aspect-[3/2] bg-[#080C14]">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-contain"
          />
          {!isGenerated && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#2979FF] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleDownload}
            className="flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all"
          >
            <Download size={20} /> DOWNLOAD PNG
          </button>
          <button 
            onClick={handleShareX}
            className="flex items-center justify-center gap-3 py-4 bg-[#2979FF] text-white rounded-2xl font-bold shadow-[0_0_30px_rgba(41,121,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Share2 size={20} /> SHARE ON X
          </button>
        </div>

        {/* Subtle Decoration */}
        <div className="mt-8 flex justify-center gap-8 opacity-20">
          <Heart size={16} />
          <Shield size={16} />
          <Zap size={16} />
        </div>
      </motion.div>
    </motion.div>
  );
};
