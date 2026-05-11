import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  ShieldCheck, 
  Droplets, 
  History, 
  ExternalLink,
  Search,
  Database
} from 'lucide-react';

interface IdentityResultCardProps {
  data: {
    status: 'CONFIRMED' | 'UNCONFIRMED' | 'SIMULATED';
    name?: string;
    age?: string;
    bloodGroup?: string;
    medicalHistory?: string[];
    source?: string;
    confidence?: number;
    photoUrl?: string;
  };
  onLinkReport?: () => void;
}

export const IdentityResultCard: React.FC<IdentityResultCardProps> = ({ data, onLinkReport }) => {
  const isConfirmed = data.status === 'CONFIRMED' || data.status === 'SIMULATED';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#101624] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl max-w-sm"
    >
      {/* Header Status */}
      <div className={`${isConfirmed ? 'bg-blue-600' : 'bg-slate-700'} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          {isConfirmed ? <ShieldCheck size={16} className="text-white" /> : <Search size={16} className="text-white" />}
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            {data.status === 'SIMULATED' ? 'SIMULATED IDENTITY FOUND' : isConfirmed ? 'IDENTITY CONFIRMED' : 'SEARCHING RECORDS...'}
          </span>
        </div>
        {data.confidence && (
          <span className="text-[10px] font-bold text-blue-100">{Math.round(data.confidence * 100)}% Match</span>
        )}
      </div>

      <div className="p-4">
        <div className="flex gap-4">
          {/* Photo Placeholder */}
          <div className="w-20 h-20 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0 overflow-hidden relative">
            {data.photoUrl ? (
              <img src={data.photoUrl} alt="Identity" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-slate-600" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-white font-black text-lg leading-tight truncate">
              {data.name || 'UNKNOWN PATIENT'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500 text-xs">{data.age || 'Age Unknown'}</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full" />
              <div className="flex items-center gap-1 text-red-400 font-bold text-xs uppercase">
                <Droplets size={12} />
                {data.bloodGroup || 'Blood Type N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="mt-4 space-y-3">
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-gray-500 uppercase text-[9px] font-black tracking-tighter">
              <History size={12} />
              <span>Medical History</span>
            </div>
            {data.medicalHistory && data.medicalHistory.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {data.medicalHistory.map((item, idx) => (
                  <span key={idx} className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-[10px]">No critical conditions found in emergency profile.</p>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Database size={12} />
              <span>Source: <span className="text-gray-300 font-bold">{data.source || 'Public Records (Simulated)'}</span></span>
            </div>
            {onLinkReport && (
              <button 
                onClick={onLinkReport}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold transition-colors"
              >
                LINK TO REPORT <ExternalLink size={10} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
