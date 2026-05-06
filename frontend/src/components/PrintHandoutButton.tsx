import React, { useState } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import { generateJudgeHandout } from '../utils/generateJudgeHandout';
import { toast } from 'react-hot-toast';
import { logger } from '../lib/logger';

export const PrintHandoutButton: React.FC<{ className?: string }> = ({ className }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      await generateJudgeHandout();
      toast.success('Handout generated successfully');
    } catch (error) {
      logger.error('Failed to generate handout', { error });
      toast.error('Failed to generate handout');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      onClick={handlePrint}
      disabled={isGenerating}
      className={`nexus-btn flex items-center justify-center gap-2 px-6 py-3 bg-[#FF1744] text-white rounded-xl font-bold shadow-[0_0_20px_rgba(255,23,68,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 ${className}`}
      title="Download Evidence Handout"
    >
      {isGenerating ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Printer className="w-5 h-5" />
      )}
      <span>PRINT HANDOUT</span>
    </button>
  );
};
