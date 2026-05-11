import React from 'react';
import { motion } from 'framer-motion';

export const VoiceWaveform: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  return (
    <div className="flex items-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={active ? {
            height: [8, 24, 12, 32, 16][i % 5],
          } : { height: 8 }}
          transition={active ? {
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.1
          } : {}}
          className="w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
};
