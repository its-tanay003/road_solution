import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Database, 
  Clock, 
  Hash, 
  User, 
  FileText, 
  AlertTriangle,
  ArrowRight,
  Download,
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useBlockchainStore, type Block } from '../store/blockchainStore';
import { MainLayout } from './MainLayout';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';

export const BlockchainAuditTrail = () => {
  const { chain, isChainValid, validateChain, tamperBlock, resetChain, addBlock } = useBlockchainStore();
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [searchParams] = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const highlightId = searchParams.get('highlight');

  // Auto-validate on mount and chain changes
  useEffect(() => {
    validateChain();
  }, [chain, validateChain]);

  // Handle highlighting from URL
  useEffect(() => {
    if (highlightId && chain.length > 0) {
      const block = chain.find(b => b.hash.startsWith(highlightId) || b.index.toString() === highlightId);
      if (block) {
        setSelectedBlock(block);
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById(`block-${block.index}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }, 100);
      }
    }
  }, [highlightId, chain]);

  const handleTamper = (index: number) => {
    tamperBlock(index, { ...chain[index].data, tampered: true, maliciousPayload: "REDACTED_INCIDENT_DATA" });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(chain, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ROADSoS_Audit_Trail_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const runValidation = async () => {
    setIsValidating(true);
    await validateChain();
    setTimeout(() => setIsValidating(false), 800);
  };

  // Simulation: Add random blocks if empty
  const seedDemo = async () => {
    if (chain.length > 0) return;
    const incidentId = "INC-8829-X";
    await addBlock(incidentId, "SOS_TRIGGERED", "USER_771", { location: "28.6139° N, 77.2090° E", method: "APPLE_WATCH_FALL" });
    await addBlock(incidentId, "AI_TRIAGE_INITIATED", "CLAUDE_3.5_SONNET", { focus: "Chest Trauma", initialScore: 8.4 });
    await addBlock(incidentId, "MEDICAL_PROFILE_ACCESSED", "DISPATCHER_92", { profileId: "MED-0041", clearance: "EMERGENCY" });
    await addBlock(incidentId, "UNIT_DISPATCHED", "SYSTEM_AUTO", { unitId: "AMB-12", eta: "4m 20s" });
    await addBlock(incidentId, "HOSPITAL_PRE_ALERTED", "SYSTEM_AUTO", { hospital: "AIIMS Trauma Centre", traumaLevel: 1 });
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="text-nx-blue-primary" size={18} />
              <h2 className="text-[10px] font-black tracking-[0.3em] text-nx-text-tertiary uppercase">Immutable Ledger</h2>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              Blockchain Audit Trail
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {isChainValid ? (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-sm bg-nx-blue-primary/10 border border-nx-blue-primary/30"
                >
                  <CheckCircle2 size={16} className="text-nx-blue-primary" />
                  <span className="text-xs font-black text-nx-blue-primary uppercase tracking-widest">Chain Integrity: Valid</span>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-sm bg-nx-red-primary/20 border border-nx-red-primary/50 shadow-[0_0_15px_rgba(255,59,59,0.3)]"
                >
                  <AlertTriangle size={16} className="text-nx-red-primary animate-pulse" />
                  <span className="text-xs font-black text-nx-red-primary uppercase tracking-widest">Chain Integrity: Compromised</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={runValidation} disabled={isValidating}>
                {isValidating ? <RefreshCcw className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                <span className="ml-2">Verify</span>
              </Button>
              <Button variant="primary" size="sm" onClick={handleExport}>
                <Download size={14} />
                <span className="ml-2">Export</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Chain Visualization */}
        <Panel className="p-0 border-nx-border/40 overflow-hidden bg-nx-bg-(--color-surface)">
          <div className="p-4 border-b border-nx-border/30 flex items-center justify-between bg-white/2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-nx-text-tertiary" />
                <span className="text-[10px] font-bold text-nx-text-tertiary uppercase">Blocks: {chain.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-nx-text-tertiary" />
                <span className="text-[10px] font-bold text-nx-text-tertiary uppercase">Last Update: {chain.length > 0 ? format(chain[chain.length-1].timestamp, 'HH:mm:ss') : 'N/A'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={seedDemo} className="text-[9px] h-7">SEED DEMO</Button>
              <Button variant="ghost" size="sm" onClick={resetChain} className="text-[9px] h-7 hover:text-nx-red-primary">
                <Trash2 size={12} className="mr-1" /> PURGE
              </Button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="p-8 flex items-start gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-nx-border custom-scrollbar pb-12"
          >
            {chain.length > 0 ? (
              chain.map((block, i) => (
                <BlockCard 
                  key={block.hash} 
                  block={block} 
                  isLast={i === chain.length - 1}
                  onSelect={() => setSelectedBlock(block)}
                  onTamper={() => handleTamper(i)}
                  status={isChainValid ? 'valid' : (i >= chain.findIndex((b, idx) => {
                    // Find first broken block
                    if (idx === 0) return b.previousHash !== 'GENESIS_BLOCK';
                    return b.previousHash !== chain[idx-1].hash;
                  }) ? 'broken' : 'valid')}
                />
              ))
            ) : (
              <div className="w-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-nx-border/30 rounded-(--radius-lg)">
                <FileText size={48} className="text-nx-text-tertiary/20 mb-4" />
                <p className="text-nx-text-tertiary font-mono text-sm uppercase tracking-widest italic">No records in the current session ledger</p>
                <Button variant="secondary" size="sm" className="mt-6" onClick={seedDemo}>Initialize Genesis Incident</Button>
              </div>
            )}
          </div>
        </Panel>

        {/* Selected Block Details */}
        <AnimatePresence>
          {selectedBlock && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-12 gap-6"
            >
              <Panel className="col-span-12 lg:col-span-8 p-6 border-nx-border/40">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-nx-blue-primary/10">
                      <FileText size={20} className="text-nx-blue-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Block #{selectedBlock.index} Payload</h3>
                      <p className="text-[10px] font-bold text-nx-text-tertiary uppercase tracking-widest">{selectedBlock.action}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedBlock(null)}>CLOSE</Button>
                </div>

                <div className="space-y-4">
                  <div className="nexus-card p-4 bg-black/40 border-nx-border/30">
                    <pre className="text-xs font-mono text-nx-blue-primary overflow-x-auto">
                      {JSON.stringify(selectedBlock.data, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-nx-text-tertiary uppercase tracking-widest">Previous Hash</span>
                      <p className="text-[10px] font-mono text-white truncate bg-white/5 p-2 rounded border border-nx-border/30">
                        {selectedBlock.previousHash}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-nx-text-tertiary uppercase tracking-widest">Block Hash</span>
                      <p className="text-[10px] font-mono text-nx-blue-primary truncate bg-nx-blue-primary/5 p-2 rounded border border-nx-blue-primary/30">
                        {selectedBlock.hash}
                      </p>
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel className="col-span-12 lg:col-span-4 p-6 border-nx-blue-primary/20 bg-nx-blue-primary/2">
                <h3 className="text-xs font-black text-nx-blue-primary uppercase tracking-widest mb-6">Security Verification</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={20} className="text-nx-blue-primary mt-1" />
                    <div>
                      <p className="text-xs font-bold text-white mb-1">Cryptographic Seal</p>
                      <p className="text-[10px] text-nx-text-tertiary leading-relaxed uppercase tracking-tight italic">
                        This record is immutable and cryptographically linked to the preceding state of the incident. Any unauthorized modification will invalidate the subsequent chain.
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-nx-border" />
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-nx-text-tertiary uppercase tracking-widest italic">Legal Framing</p>
                    <div className="p-3 rounded bg-white/5 border border-nx-border/50">
                      <p className="text-[10px] text-nx-text-secondary leading-relaxed uppercase tracking-tight">
                        "This incident record is cryptographically sealed and admissible in court as a tamper-evident record of emergency response actions."
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full justify-between group">
                      <span>VERIFY HASH AUTHENTICITY</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

const BlockCard = ({ block, isLast, onSelect, onTamper, status }: { 
  block: Block, 
  isLast: boolean, 
  onSelect: () => void,
  onTamper: () => void,
  status: 'valid' | 'broken'
}) => (
  <div id={`block-${block.index}`} className="flex items-center shrink-0">
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onSelect}
      className={`relative w-64 nexus-card p-4 cursor-pointer transition-all border-t-2 ${
        status === 'valid' ? 'border-nx-blue-primary/50' : 'border-nx-red-primary bg-nx-red-primary/5 shadow-[0_0_20px_rgba(255,59,59,0.2)]'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-nx-text-tertiary uppercase tracking-widest">Block #{block.index}</span>
        {status === 'valid' ? (
          <CheckCircle2 size={14} className="text-nx-blue-primary" />
        ) : (
          <XCircle size={14} className="text-nx-red-primary" />
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-black text-white italic uppercase truncate tracking-tight">{block.action.replace(/_/g, ' ')}</h4>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={10} className="text-nx-text-tertiary" />
            <span className="text-[9px] font-bold text-nx-text-tertiary uppercase">{format(block.timestamp, 'HH:mm:ss.SS')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 py-2 border-y border-nx-border/20">
          <User size={12} className="text-nx-text-tertiary" />
          <span className="text-[9px] font-mono text-nx-text-secondary uppercase truncate">{block.actorId}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Hash size={10} className="text-nx-text-tertiary" />
            <span className="text-[10px] font-mono text-nx-text-tertiary">{block.hash.substring(0, 8)}...</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onTamper(); }}
            className="text-[8px] font-black text-nx-text-tertiary/40 hover:text-nx-red-primary uppercase tracking-[0.2em] transition-colors"
          >
            TAMPER
          </button>
        </div>
      </div>

      {status === 'broken' && (
        <div className="absolute -bottom-6 left-0 right-0 text-center">
          <span className="text-[8px] font-black text-nx-red-primary uppercase tracking-widest animate-pulse">Signature Mismatch</span>
        </div>
      )}
    </motion.div>

    {!isLast && (
      <div className="px-3 flex flex-col items-center gap-1">
        <ArrowRight size={20} className={status === 'valid' ? 'text-nx-blue-primary/40' : 'text-nx-red-primary/40'} />
        <Link size={14} className={status === 'valid' ? 'text-nx-blue-primary/20' : 'text-nx-red-primary/20'} />
      </div>
    )}
  </div>
);

const RefreshCcw = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21v-5h5" />
  </svg>
);

const Link = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
