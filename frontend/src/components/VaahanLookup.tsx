import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, User, Shield, CheckCircle2, Search, Database, Mic, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Badge } from './ui/Badge';

interface VaahanData {
  registrationNumber: string;
  ownerName: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  fuelType: string;
  vehicleCategory: string;
  engineCC: number;
  seatingCapacity: number;
  color: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceValidity: string;
  insuranceValid: boolean;
  pucValidity: string;
  pucValid: boolean;
  fitnessValidity: string;
  hypothecatedTo: string | null;
  stateRTO: string;
  blacklisted: boolean;
  source: string;
  queriedAt: string;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
  onerror: (event: unknown) => void;
  onend: (event: unknown) => void;
  start: () => void;
  stop: () => void;
}

export const VaahanLookup: React.FC = () => {
  const [regNumber, setRegNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VaahanData | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toUpperCase().replace(/[\s-]/g, '');
        setRegNumber(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        setIsListening(true);
        recognitionRef.current.start();
      }
    } else {
      alert('Speech recognition not supported in this browser.');
    }
  };

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!regNumber) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vaahan/${regNumber}`);
      setResult(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setError('Please enter in format: XX00XX0000');
        } else if (err.response?.status === 404) {
          setError('Vehicle not found in Vaahan registry.');
        } else {
          setError('Vaahan service temporarily unavailable.');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-white/2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-blue-400" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">MoRTH VAAHAN REGISTRY</span>
        </div>
        {result && (
          <Badge variant="active" className="text-[8px] animate-pulse">
            LIVE SYNC
          </Badge>
        )}
      </div>

      <div className="p-6">
        <form onSubmit={handleLookup} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
              placeholder="e.g. KA01MF1234"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              title={isListening ? "Stop Listening" : "Voice Input"}
              aria-label={isListening ? "Stop Listening" : "Voice Input"}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic size={18} />
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || !regNumber}
            title="Lookup Vehicle Details"
            aria-label="Lookup Vehicle Details"
            className="px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            LOOKUP
          </button>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400"
            >
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter font-mono">
                    {result.registrationNumber}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    {result.stateRTO}
                  </p>
                </div>
                <Badge variant={result.blacklisted ? 'critical' : 'active'}>
                  {result.blacklisted ? 'BLACKLISTED' : 'CLEAN STATUS'}
                </Badge>
              </div>

              {/* Vehicle Details */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Car size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">
                      {result.vehicleMake} {result.vehicleModel}
                    </p>
                    <span className="text-[10px] font-mono text-slate-500">{result.vehicleYear}</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="info" className="text-[8px] py-0">{result.fuelType}</Badge>
                    <Badge variant="info" className="text-[8px] py-0">{result.vehicleCategory}</Badge>
                    <span className="text-[10px] text-slate-500">{result.color}</span>
                  </div>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Shield size={10} /> Insurance
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-white truncate max-w-[80px]">{result.insuranceProvider}</p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${result.insuranceValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {result.insuranceValid ? 'VALID' : 'EXPIRED'}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1 font-mono">{result.insuranceValidity}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <CheckCircle2 size={10} /> PUC Status
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-white">EMISSIONS</p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${result.pucValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {result.pucValid ? 'VALID' : 'EXPIRED'}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1 font-mono">{result.pucValidity}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <User size={10} /> Ownership
                  </p>
                  <p className="text-[10px] font-bold text-white">{result.ownerName.split(' ')[0]}***</p>
                  <p className="text-[9px] text-slate-500 mt-1">{result.hypothecatedTo ? `FINANCE: ${result.hypothecatedTo}` : 'NO HYPOTHECATION'}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Database size={10} /> Fitness
                  </p>
                  <p className="text-[10px] font-bold text-white">UP TO {result.fitnessValidity.split('-')[0]}</p>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase">Reg: {result.registrationNumber}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-[8px] font-mono text-slate-600 uppercase">
                <span>{result.source}</span>
                <span>SYNC: {result.queriedAt.split('T')[1].split('.')[0]}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
