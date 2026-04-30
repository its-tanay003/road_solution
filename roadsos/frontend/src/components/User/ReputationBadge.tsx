import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Award } from 'lucide-react';

interface Props {
  level: 'BASIC' | 'TRAINED' | 'VERIFIED';
  points: number;
}

export const ReputationBadge = ({ level, points }: Props) => {
  const config = {
    BASIC: { icon: CheckCircle2, color: 'text-slate-400', bg: 'bg-slate-400/10', label: 'Registered' },
    TRAINED: { icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Responder' },
    VERIFIED: { icon: ShieldCheck, color: 'text-cyan-400', bg: 'bg-cyan-400/10', label: 'Pro Elite' },
  };

  const { icon: Icon, color, bg, label } = config[level];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/5 ${bg} ${color}`}
    >
      <Icon size={12} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      <span className="w-px h-2 bg-current opacity-20" />
      <span className="text-[10px] font-mono font-bold">{points} RP</span>
    </motion.div>
  );
};
