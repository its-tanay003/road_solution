import React, { useState } from 'react';
import { Printer, Loader2, FileText } from 'lucide-react';
import { generateJudgeHandout } from '../utils/generateJudgeHandout';
import { toast } from 'react-hot-toast';
import { logger } from '../lib/logger';

export const PrintHandoutButton: React.FC<{ className?: string }> = ({ className }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      const doc = await generateJudgeHandout();
      
      // Open in new tab and print
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        toast.success("Handout generated! Printing 5 copies for the judges...", {
          icon: '🖨️',
          duration: 5000
        });
        
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        // Fallback: Just download
        doc.save('ROADSoS_Judge_Handout_2026.pdf');
        toast.success("PDF Downloaded (Popup blocked)");
      }
    } catch (error) {
      logger.error(error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isGenerating}
      className={`flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group ${className}`}
      title="Print Judge Handout (5 copies)"
    >
      {isGenerating ? (
        <Loader2 size={18} className="animate-spin text-[#FF9933]" />
      ) : (
        <Printer size={18} className="group-hover:text-[#FF9933] transition-colors" />
      )}
      <div className="text-left">
        <p className="text-xs font-bold text-white/90">Judge Handout</p>
        <p className="text-[10px] text-white/40 font-mono uppercase tracking-tighter">Print 5 Copies</p>
      </div>
    </button>
  );
};
