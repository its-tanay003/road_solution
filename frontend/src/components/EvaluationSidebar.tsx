import { NavLink } from 'react-router-dom';
import { 
  TrendingUp, 
  Search, 
  Cpu, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const EvaluationSidebar = () => {
  const evalLinks = [
    { name: 'Roadmap', path: '/roadmap', icon: TrendingUp },
    { name: 'Research', path: '/research', icon: Search },
    { name: 'Technical', path: '/technical', icon: Cpu },
    { name: 'Legal Guide', path: '/good-samaritan', icon: ShieldCheck },
  ];

  return (
    <div className="hidden lg:flex flex-col w-64 bg-night border-r border-white/5 h-full pt-28 pb-10 px-4 fixed left-0 top-0 z-40">
      <div className="mb-10 px-4">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">SIH 2026 Evaluation</h2>
        <div className="space-y-1">
          {evalLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `flex items-center justify-between p-3 rounded-xl transition-all group ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <link.icon size={18} />
                <span className="text-xs font-bold uppercase tracking-tight">{link.name}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-50" />
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mt-auto px-4">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-safe mb-2">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Pitch Ready</span>
          </div>
          <p className="text-[9px] text-slate-500 leading-relaxed uppercase">
            Platform verified for national road safety deployment challenges.
          </p>
        </div>
      </div>
    </div>
  );
};
