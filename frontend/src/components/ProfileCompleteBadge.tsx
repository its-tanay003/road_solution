import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMedicalProfileStore } from '../store';

export const ProfileCompleteBadge: React.FC = () => {
  const navigate = useNavigate();
  const { profileComplete } = useMedicalProfileStore();

  if (profileComplete) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#00C853]/10 border border-[#00C853]/20 rounded-full"
      >
        <ShieldCheck size={14} className="text-[#00C853]" />
        <span className="text-[10px] font-black text-[#00C853] uppercase tracking-widest">Profile Complete</span>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/profile')}
      className="flex items-center gap-2 px-4 py-2 bg-[#FFB300]/10 border border-[#FFB300]/20 rounded-xl hover:bg-[#FFB300]/20 transition-all group"
    >
      <AlertCircle size={14} className="text-[#FFB300] animate-pulse" />
      <span className="text-[10px] font-black text-[#FFB300] uppercase tracking-widest">Set Up Profile</span>
      <ArrowRight size={12} className="text-[#FFB300] group-hover:translate-x-1 transition-transform" />
    </motion.button>
  );
};
