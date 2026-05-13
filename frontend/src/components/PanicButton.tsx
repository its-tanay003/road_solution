import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { hapticError } from '../lib/accessibilityHelpers';

export function PanicButton() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleConfirm = () => {
    hapticError();
    navigate('/sos-active');
  };

  return (
    <div style={{
      position: 'fixed',
      right: 0, top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 50,
      display: 'flex', alignItems: 'center',
    }}>
      <AnimatePresence mode="wait">
        {expanded ? (
          /* Expanded confirm state */
          <motion.div
            key="expanded"
            initial={{ width: 48, opacity: 0 }}
            animate={{ width: 180, opacity: 1 }}
            exit={{ width: 48, opacity: 0 }}
            style={{
              display: 'flex', flexDirection: 'column', gap: 8,
              background: 'var(--bg-raised)', border: '1px solid var(--red)',
              borderRadius: '16px 0 0 16px',
              padding: 16, overflow: 'hidden',
              boxShadow: '0 0 40px rgba(255,23,68,0.2)',
            }}
          >
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Confirm emergency?
            </p>
            <button
              onClick={handleConfirm}
              style={{
                background: 'var(--red)', border: 'none', borderRadius: 8,
                padding: '8px 12px', fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: 13, color: '#fff', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Yes, SOS!
            </button>
            <button
              onClick={() => setExpanded(false)}
              style={{
                background: 'var(--bg-hover)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 12px',
                fontFamily: 'var(--font-body)', fontSize: 12,
                color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          /* Collapsed pill */
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ delay: 1.5, duration: 0.4 }}
            onClick={() => setExpanded(true)}
            aria-label="PANIC — quick SOS button"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: 'var(--red)',
              border: 'none',
              borderRadius: '12px 0 0 12px',
              padding: '12px 10px',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 0 20px rgba(255,23,68,0.35)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm.75 15.5h-1.5v-1.5h1.5v1.5zm0-3h-1.5V6.5h1.5V14.5z"/>
            </svg>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 9, color: '#fff', letterSpacing: '0.1em',
              writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)',
            }}>
              PANIC
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
