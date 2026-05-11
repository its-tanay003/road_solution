import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  Globe,
  PhoneCall,
} from 'lucide-react';
import { RequestConsultationModal } from './RequestConsultationModal';

interface Expert {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  available: boolean;
  rating: number;
  responseTime: string;
  languages: string[];
  distance: string;
}

export const ExpertCard: React.FC<{ expert: Expert }> = ({ expert }) => {
  const [showModal, setShowModal] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <>
      <div className="group bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-blue-500/30 rounded-2xl p-4 transition-all duration-300">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-lg font-black shadow-lg">
              {getInitials(expert.name)}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#080C14] ${expert.available ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                {expert.name}
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-black text-amber-400">
                <Star size={10} fill="currentColor" />
                {expert.rating}
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{expert.specialty}</p>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mb-3">
              <MapPin size={10} />
              <span className="truncate">{expert.hospital}</span>
              <span className="text-slate-700">•</span>
              <span>{expert.distance}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/50 rounded-lg">
                <Clock size={10} className="text-blue-400" />
                <span className="text-[9px] font-bold">{expert.responseTime}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/50 rounded-lg">
                <Globe size={10} className="text-emerald-400" />
                <div className="flex gap-1">
                  {expert.languages.map(lang => (
                    <span key={lang} className="text-[8px] font-black uppercase">{lang}</span>
                  ))}
                </div>
              </div>
            </div>

            <button
              disabled={!expert.available}
              onClick={() => setShowModal(true)}
              className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                expert.available 
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-95' 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <PhoneCall size={12} />
              Request Consultation
            </button>
          </div>
        </div>
      </div>

      <RequestConsultationModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        expert={expert} 
      />
    </>
  );
};
