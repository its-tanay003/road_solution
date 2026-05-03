import { 
  Accessibility, 
  Eye, 
  Keyboard, 
  Move, 
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Type
} from 'lucide-react';
import { useAccessibilityStore } from '../store';

export const AccessibilityPanel = () => {
  const { 
    isDyslexic, isReducedMotion, isHighContrast, isSimpleLanguage,
    setDyslexic, setReducedMotion, setHighContrast, setSimpleLanguage 
  } = useAccessibilityStore();

  const complianceItems = [
    { id: 'visual', label: 'Visual Accessibility', status: 'compliant', icon: <Eye size={18} /> },
    { id: 'motor', label: 'Motor Accessibility', status: 'compliant', icon: <Keyboard size={18} /> },
    { id: 'cognitive', label: 'Cognitive Accessibility', status: 'partial', icon: <Accessibility size={18} /> },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8" role="region" aria-labelledby="accessibility-settings-heading">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-2xl">
            <Accessibility className="text-blue-500" size={32} aria-hidden="true" />
          </div>
          <div>
            <h1 id="accessibility-settings-heading" className="text-3xl font-black uppercase tracking-tighter text-white">Accessibility Settings</h1>
            <p className="text-slate-400 font-mono text-sm tracking-wider uppercase">WCAG 2.2 AA Compliance Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <CheckCircle2 size={16} className="text-emerald-500" aria-hidden="true" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">AA Compliant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list">
        {complianceItems.map(item => (
          <div key={item.id} role="listitem" className="bg-navy/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-blue-400" aria-hidden="true">{item.icon}</div>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${item.status === 'compliant' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                {item.status}
              </span>
            </div>
            <h3 className="font-black text-white text-sm uppercase tracking-wide">{item.label}</h3>
          </div>
        ))}
      </div>

      <div className="bg-navy/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 space-y-8">
          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
              <Type size={14} aria-hidden="true" /> Reading & Visual Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleCard 
                active={isDyslexic} 
                onClick={() => setDyslexic(!isDyslexic)}
                title="Dyslexia Friendly Mode"
                description="Switches all text to OpenDyslexic font for improved readability."
              />
              <ToggleCard 
                active={isHighContrast} 
                onClick={() => setHighContrast(!isHighContrast)}
                title="High Contrast Mode"
                description="Forces maximum color contrast (4.5:1+) across all interfaces."
              />
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
              <Move size={14} aria-hidden="true" /> Motion & Interaction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleCard 
                active={isReducedMotion} 
                onClick={() => setReducedMotion(!isReducedMotion)}
                title="Reduced Motion"
                description="Disables all non-essential animations and transitions."
              />
              <ToggleCard 
                active={true} 
                onClick={() => {}}
                title="Keyboard Nav Mode"
                description="Enables enhanced focus rings and F1 help overlay."
                disabled
              />
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
              <MessageSquare size={14} aria-hidden="true" /> Cognitive Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleCard 
                active={isSimpleLanguage} 
                onClick={() => setSimpleLanguage(!isSimpleLanguage)}
                title="Simple Language Mode"
                description="Simplifies AI triage advice and dispatcher instructions."
              />
            </div>
          </section>
        </div>

        <div className="bg-blue-500/5 p-8 border-t border-white/5 flex items-start gap-4">
          <AlertCircle className="text-blue-400 shrink-0" size={20} aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-xs font-black text-white uppercase tracking-wider italic">Life-Safety Notice</p>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              Accessibility is not a feature; it is a fundamental requirement of emergency response. ROADSoS utilizes ARIA Live regions to ensure that screen readers announce critical updates instantly, even in high-stress environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleCard = ({ active, onClick, title, description, disabled = false }: { active: boolean, onClick: () => void, title: string, description: string, disabled?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left p-6 rounded-3xl border transition-all ${active ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    aria-pressed={active}
  >
    <div className="flex justify-between items-start mb-2">
      <span className="font-black text-white text-sm uppercase tracking-wide">{title}</span>
      <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-blue-500' : 'bg-slate-700'}`} aria-hidden="true">
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-6' : 'left-1'}`} />
      </div>
    </div>
    <p className="text-[11px] text-slate-400 leading-snug">{description}</p>
  </button>
);
