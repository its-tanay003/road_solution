import { useSosStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EmergencyButton } from '../components/EmergencyButton';
import { 
  Eye, 
  Hospital, 
  Activity, 
  Phone,
  ShieldAlert,
  ChevronRight,
  Heart
} from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isActive } = useSosStore();

  const quickActions = [
    { 
      id: 'hospitals', 
      label: 'Find Hospitals', 
      icon: Hospital, 
      color: 'bg-safe', 
      path: '/hospitals',
      desc: 'Nearest emergency care'
    },
    { 
      id: 'bystander', 
      label: 'Bystander Mode', 
      icon: Eye, 
      color: 'bg-amber', 
      path: '/bystander',
      desc: 'I saw an accident'
    },
    { 
      id: 'stats', 
      label: 'Live Stats', 
      icon: Activity, 
      color: 'bg-navy', 
      path: '/india-stats',
      desc: 'Road safety updates'
    },
    { 
      id: 'volunteer', 
      label: 'Responder Network', 
      icon: Heart, 
      color: 'bg-indigo-600', 
      path: '/volunteer',
      desc: 'Join citizen responders'
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      {/* Header Area */}
      <header className="flex flex-col gap-2 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emergency rounded-2xl flex items-center justify-center shadow-lg shadow-emergency/20">
              <ShieldAlert size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight leading-none text-(--app-text)">ROADSoS</h1>
              <p className="text-sm font-bold opacity-60 uppercase tracking-widest">Emergency Assistance</p>
            </div>
          </div>
          
          <div className="flex bg-(--app-bg) rounded-2xl p-1 border-2 border-(--app-border)">
            {['en', 'hi', 'ta'].map((lang) => (
              <button
                key={lang}
                onClick={() => i18n.changeLanguage(lang)}
                className={`w-[50px] h-[40px] flex items-center justify-center text-sm font-black rounded-xl transition-all uppercase ${
                  i18n.language === lang 
                  ? 'bg-emergency text-white shadow-md' 
                  : 'text-(--app-text) opacity-50 hover:opacity-100'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Primary SOS Action */}
      <section className="bg-(--app-surface) rounded-[3rem] p-8 border-4 border-(--app-border) shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emergency/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center">
          <EmergencyButton />
          <div className="text-center mt-4">
            <p className="text-xl font-black text-emergency uppercase animate-pulse">
              {isActive ? 'Emergency Mode Active' : t('sos.trigger')}
            </p>
            <p className="text-sm font-bold opacity-40 uppercase tracking-widest mt-1">
              Press and hold for 3 seconds
            </p>
          </div>
        </div>
      </section>

      {/* Secondary Quick Actions */}
      <section className="grid grid-cols-1 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => navigate(action.path)}
            className="flex items-center gap-6 p-6 bg-(--app-surface) rounded-3xl border-4 border-(--app-border) active:scale-95 transition-all text-left group"
          >
            <div className={`w-[80px] h-[80px] rounded-2xl ${action.color} flex items-center justify-center shadow-lg`}>
              <action.icon size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-(--app-text) leading-tight">{action.label}</h3>
              <p className="text-sm font-bold opacity-60 uppercase tracking-widest">{action.desc}</p>
            </div>
            <ChevronRight size={32} className="text-(--app-text) opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
          </button>
        ))}
      </section>

      {/* Emergency Contact Bar */}
      <section className="bg-navy p-6 rounded-3xl flex items-center justify-between text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Phone size={24} />
          </div>
          <div>
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Call Primary Contact</p>
            <p className="text-xl font-black">+91 98765 43210</p>
          </div>
        </div>
        <button 
          title="Call Primary Contact"
          className="w-16 h-16 bg-safe rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
        >
          <Phone size={32} fill="white" />
        </button>
      </section>

      {/* Footer Meta */}
      <footer className="text-center py-8">
        <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">
          Nexus System v2.0 • Secured Data Hub • IITM 2026
        </p>
      </footer>
    </div>
  );
};
