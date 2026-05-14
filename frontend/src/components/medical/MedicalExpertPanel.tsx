import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, 
  Search, 
  ArrowRight
} from 'lucide-react';
import { ExpertCard } from './ExpertCard';

const EXPERT_NETWORK = [
  { 
    id: 1, 
    name: "Dr. Priya Sharma", 
    specialty: "Emergency Medicine", 
    hospital: "Apollo Chennai", 
    available: true, 
    rating: 4.9, 
    responseTime: "< 2 min", 
    languages: ["en", "ta", "hi"],
    distance: "1.2 km"
  },
  { 
    id: 2, 
    name: "Dr. Rajan Krishnamurthy", 
    specialty: "Trauma Surgery", 
    hospital: "MIOT Chennai", 
    available: true, 
    rating: 4.8, 
    responseTime: "< 5 min", 
    languages: ["en", "ta"],
    distance: "4.5 km"
  },
  { 
    id: 3, 
    name: "Dr. Amit Patel", 
    specialty: "Cardiology", 
    hospital: "Fortis Chennai", 
    available: false, 
    rating: 4.7, 
    responseTime: "< 10 min", 
    languages: ["en", "hi", "gu"],
    distance: "8.2 km"
  },
  { 
    id: 4, 
    name: "Dr. Sarah Johnson", 
    specialty: "Emergency Medicine", 
    hospital: "Global Health City", 
    available: true, 
    rating: 4.9, 
    responseTime: "< 3 min", 
    languages: ["en"],
    distance: "3.1 km"
  }
];

export const MedicalExpertPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('All');
  
  const specialties = ['All', ...new Set(EXPERT_NETWORK.map(e => e.specialty))];
  
  const filteredExperts = EXPERT_NETWORK.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          expert.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'All' || expert.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-xl border-l border-slate-800 w-80">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
            <Stethoscope size={18} />
          </div>
          <h2 className="font-black uppercase tracking-tighter text-sm">Medical Experts</h2>
        </div>
        
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="text" 
            placeholder="Search doctors or hospitals..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {specialties.map(s => (
            <button
              key={s}
              onClick={() => setFilterSpecialty(s)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                filterSpecialty === s 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredExperts.map((expert, idx) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ExpertCard expert={expert} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredExperts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-slate-500 text-xs italic">No matching experts found in your area.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-800/30 border-t border-slate-800">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Telemedicine Integration</h4>
          <p className="text-[9px] text-slate-400 leading-tight mb-2">
            Connects to NABH-certified providers via Government of India's eSanjeevani platform.
          </p>
          <a 
            href="https://esanjeevaniopd.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between text-[9px] font-bold text-white bg-blue-600 px-2 py-1 rounded hover:bg-blue-500 transition-colors"
          >
            eSanjeevani Portal
            <ArrowRight size={10} />
          </a>
        </div>
      </div>
    </div>
  );
};
