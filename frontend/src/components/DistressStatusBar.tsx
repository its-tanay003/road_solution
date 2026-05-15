import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSosStore } from '../store';

export const DistressStatusBar: React.FC = () => {
  const { distressScore: score, isDistressEngineActive: isActive } = useSosStore();

  const isVisible = isActive && score > 30;

  let colorClass = 'bg-(--nx-green-primary)';
  if (score > 60) colorClass = 'bg-(--nx-red-primary)';
  else if (score > 30) colorClass = 'bg-(--nx-amber-primary)';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 4 }}
          exit={{ opacity: 0, height: 0 }}
          className="fixed top-0 left-0 w-full z-9999 bg-black/50"
        >
          <motion.div
            className={`h-full ${colorClass} transition-colors duration-500`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            style={{
              boxShadow: score > 60 ? '0 0 10px var(--nx-red-primary)' : 'none'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
