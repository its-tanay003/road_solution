import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ShieldAlert, 
  Database, 
  Key, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Fingerprint,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  generateEncryptionKey, 
  encryptData, 
  decryptData, 
  exportKeyToHex,
  type EncryptedPackage 
} from '../utils/cryptoUtils';

export const MedicalVaultDemo: React.FC = () => {
  // Form State
  const [medicalInfo, setMedicalInfo] = useState({
    bloodType: 'O+',
    allergies: 'Penicillin, Peanuts',
    medications: 'Lisinopril 10mg',
    emergencyContact: '+1 (555) 0199',
    conditions: 'Hypertension'
  });

  // Crypto State
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [keyHex, setKeyHex] = useState('');
  const [encryptedPackage, setEncryptedPackage] = useState<EncryptedPackage | null>(null);
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initKey = async () => {
      const key = await generateEncryptionKey();
      setEncryptionKey(key);
      const hex = await exportKeyToHex(key);
      setKeyHex(hex);
    };
    initKey();
  }, []);

  const handleEncrypt = async () => {
    if (!encryptionKey) return;
    setIsEncrypting(true);
    setError(null);
    
    // Artificial delay for animation
    setTimeout(async () => {
      const dataStr = JSON.stringify(medicalInfo);
      const pkg = await encryptData(dataStr, encryptionKey);
      setEncryptedPackage(pkg);
      setIsEncrypting(false);
      setDecryptedData(null);
    }, 1000);
  };

  const handleDecrypt = async () => {
    if (!encryptionKey || !encryptedPackage) return;
    setIsDecrypting(true);
    setError(null);

    try {
      // Artificial delay for animation
      setTimeout(async () => {
        try {
          const decrypted = await decryptData(encryptedPackage, encryptionKey);
          setDecryptedData(decrypted);
        } catch (e) {
          setError('DATA INTEGRITY VIOLATION — AES-GCM Auth Tag Mismatch');
        } finally {
          setIsDecrypting(false);
        }
      }, 1000);
    } catch (e) {
      setError('Decryption failed');
      setIsDecrypting(false);
    }
  };

  const handleTamper = () => {
    if (!encryptedPackage) return;
    const tampered = { ...encryptedPackage };
    // Change a single character in the ciphertext
    const chars = tampered.cipherText.split('');
    chars[0] = chars[0] === 'A' ? 'B' : 'A';
    tampered.cipherText = chars.join('');
    setEncryptedPackage(tampered);
    setDecryptedData(null);
    setError('Ciphertext tampered. Integrity check will fail.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-600/20 p-2 rounded-[var(--radius-lg)] border border-blue-500/30 text-blue-500">
                <Fingerprint size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">ZK Medical Vault</h1>
              <div className="bg-blue-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black tracking-widest mt-1">
                ZERO KNOWLEDGE ARCHITECTURE
              </div>
            </div>
            <p className="text-slate-500 text-xs font-mono uppercase">End-to-End Encryption Demonstration (AES-256-GCM)</p>
          </div>
          
          <div className="hidden md:flex items-center gap-4 bg-slate-900/50 p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-amber-500" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-600 uppercase">Your Local Key (Not stored on server)</span>
                <span className="text-[10px] font-mono text-amber-500 truncate w-48">{keyHex || 'Generating...'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel 1: Patient Inputs */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-8">
              <FileText size={20} className="text-blue-500" />
              <h3 className="font-black text-sm uppercase tracking-widest">1. Patient Inputs</h3>
            </div>

            <div className="space-y-4 flex-1">
              {Object.entries(medicalInfo).map(([key, value]) => (
                <div key={key} className="space-y-1.5">
                  <label 
                    htmlFor={`vault-${key}`}
                    className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"
                  >
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input 
                    id={`vault-${key}`}
                    type="text" 
                    value={value}
                    onChange={(e) => setMedicalInfo({...medicalInfo, [key]: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={handleEncrypt}
              disabled={isEncrypting}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-xl shadow-blue-900/20"
            >
              <AnimatePresence mode="wait">
                {isEncrypting ? (
                  <motion.div 
                    key="encrypting"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCcw size={20} />
                  </motion.div>
                ) : (
                  <motion.div key="ready" className="flex items-center gap-2">
                    <Lock size={20} className="group-hover:scale-110 transition-transform" />
                    <span>ENCRYPT & STORE</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>

          {/* Panel 2: Encrypted Vault */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-8">
              <Database size={20} className="text-red-500" />
              <h3 className="font-black text-sm uppercase tracking-widest">2. Encrypted Vault</h3>
            </div>

            {!encryptedPackage ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-2xl">
                <Lock size={48} className="mb-4 opacity-10" />
                <p className="text-xs uppercase font-black tracking-widest">Waiting for data...</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-6">
                <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Server Side Storage (Ciphertext)</span>
                    <ShieldAlert size={14} className="text-red-500/50" />
                  </div>
                  <div className="h-48 overflow-y-auto custom-scrollbar font-mono text-[10px] text-red-400 break-all leading-relaxed bg-black/40 p-3 rounded-xl border border-red-500/10">
                    {encryptedPackage.cipherText}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                    <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Initialization Vector (IV)</span>
                    <span className="text-[10px] font-mono text-slate-400 break-all">{encryptedPackage.iv}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                    <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Authentication Tag</span>
                    <span className="text-[10px] font-mono text-slate-400 break-all">{encryptedPackage.authTag}</span>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-500/80 leading-relaxed font-medium">
                    This data is mathematically meaningless to the server. Without your private device key, this blob cannot be decrypted.
                  </p>
                </div>

                <button 
                  onClick={handleTamper}
                  className="w-full py-3 border border-red-500/30 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-500/10 transition-all uppercase tracking-widest"
                >
                  Simulate Server Data Tampering
                </button>
              </div>
            )}

            {isEncrypting && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Lock size={48} className="text-blue-500" />
                </motion.div>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-blue-500">Encrypting with AES-GCM...</p>
              </motion.div>
            )}
          </motion.div>

          {/* Panel 3: AI Triage View */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-8">
              <Eye size={20} className="text-emerald-500" />
              <h3 className="font-black text-sm uppercase tracking-widest">3. AI Triage View</h3>
            </div>

            <div className="flex-1 flex flex-col space-y-6">
              <AnimatePresence mode="wait">
                {error ? (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 bg-red-950/30 border border-red-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="bg-red-500 p-3 rounded-full shadow-lg shadow-red-500/20">
                      <ShieldAlert size={32} className="text-white" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-red-500 font-black uppercase text-sm">Decryption Failed</h4>
                      <p className="text-[10px] text-red-400 font-mono leading-relaxed px-4">
                        {error}
                      </p>
                    </div>
                  </motion.div>
                ) : decryptedData ? (
                  <motion.div 
                    key="decrypted"
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    className="flex-1 space-y-6"
                  >
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3">
                      <ShieldCheck size={20} className="text-emerald-500" />
                      <div className="flex-1">
                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Authorized Access</div>
                        <div className="text-[9px] text-emerald-500/60 font-medium">Decrypted with patient consent key</div>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-emerald-500/10 rounded-2xl p-6 space-y-4 shadow-2xl shadow-emerald-950/20">
                      {JSON.parse(decryptedData) && Object.entries(JSON.parse(decryptedData)).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-xs font-bold text-slate-200">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-2xl">
                    <EyeOff size={48} className="mb-4 opacity-10" />
                    <p className="text-xs uppercase font-black tracking-widest text-center px-8">AI analysis requires secure key authorization</p>
                  </div>
                )}
              </AnimatePresence>

              <button 
                onClick={handleDecrypt}
                disabled={!encryptedPackage || isDecrypting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-xl shadow-emerald-900/20"
              >
                {isDecrypting ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCcw size={20} />
                  </motion.div>
                ) : (
                  <>
                    <Unlock size={20} />
                    <span>AUTHORIZE & DECRYPT</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

const RefreshCcw: React.FC<{ size: number, className?: string }> = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);
