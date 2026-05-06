import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { useDebriefStore } from '../store';
import { X, FileText, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DebriefHistoryProps {
  onClose: () => void;
}

export const DebriefHistory: React.FC<DebriefHistoryProps> = ({ onClose }) => {
  const debriefs = useDebriefStore((state) => state.debriefs);
  const [selectedDebriefId, setSelectedDebriefId] = useState<string | null>(null);

  const selectedDebrief = debriefs.find((d) => d.id === selectedDebriefId);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl h-[85vh] flex gap-6"
      >
        {/* Left: List of Debriefs */}
        <Panel className="w-1/3 flex flex-col h-full bg-[var(--nx-bg-[var(--color-surface)])] border-[var(--nx-border)]">
          <div className="p-4 border-b border-[var(--nx-border)] flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--nx-cyan-primary)]" /> Debrief History
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {debriefs.length === 0 ? (
              <div className="text-center text-slate-500 py-10">
                No past debriefs found.
              </div>
            ) : (
              // Sort descending by timestamp
              [...debriefs]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((debrief) => (
                  <button
                    key={debrief.id}
                    onClick={() => setSelectedDebriefId(debrief.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedDebriefId === debrief.id
                        ? 'bg-[var(--nx-cyan-primary)]/10 border-[var(--nx-cyan-primary)]/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-white">{debrief.incidentId}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(debrief.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-2">
                      {debrief.content.substring(0, 100)}...
                    </div>
                  </button>
                ))
            )}
          </div>
        </Panel>

        {/* Right: Selected Debrief Content */}
        <Panel className="flex-1 flex flex-col h-full bg-[var(--nx-bg-[var(--color-surface)])] border-[var(--nx-border)]">
          {selectedDebrief ? (
            <>
              <div className="p-4 border-b border-[var(--nx-border)] flex justify-between items-center bg-black/20">
                <div>
                  <h3 className="text-lg font-bold text-white">Debrief Report</h3>
                  <div className="text-sm text-slate-400 mt-1">
                    Generated: {new Date(selectedDebrief.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => {
                     const printWin = window.open('', '_blank');
                     if(printWin) {
                       printWin.document.write(`
                         <html>
                           <head>
                             <title>Print Debrief</title>
                             <style>
                               body { font-family: sans-serif; padding: 2rem; color: black; }
                               .prose { max-width: 800px; margin: 0 auto; }
                             </style>
                           </head>
                           <body>
                             <h1>Debrief: ${selectedDebrief.incidentId}</h1>
                             <div class="prose">${selectedDebrief.content}</div>
                             <script>window.print(); window.close();</script>
                           </body>
                         </html>
                       `);
                     }
                  }}>Export PDF</Button>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto prose prose-invert max-w-none">
                <ReactMarkdown>{selectedDebrief.content}</ReactMarkdown>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
              <FileText className="w-16 h-16 opacity-20" />
              <p>Select a debrief to view the full report.</p>
            </div>
          )}
        </Panel>
      </motion.div>
    </div>
  );
};
