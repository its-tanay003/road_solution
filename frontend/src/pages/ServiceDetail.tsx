import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, Navigation, Share2, Star, CheckCircle, AlertTriangle, Shield, Zap, Globe, Clock, MapPin } from 'lucide-react';
import { useServicesStore } from '../store';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Panel } from '../components/ui/Panel';

export const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { services } = useServicesStore();
  const service = services[Number(id)] || {
    name: "AIIMS Delhi Trauma Centre",
    type: "hospital",
    phone_primary: "011-26588500",
    address: "Ansari Nagar East, New Delhi, 110029",
    distance: "2.4 km",
    eta: "8 min"
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--nx-bg-base)] text-[var(--nx-text-primary)]">
      {/* Tactical Hero Header */}
      <div className="h-64 bg-[var(--nx-bg-surface)] relative border-b border-[var(--nx-border)] overflow-hidden">
        <div className="absolute top-6 left-6 z-30">
          <Button variant="secondary" size="sm" className="min-w-0 p-2 bg-black/40 backdrop-blur-md" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
          </Button>
        </div>

        {/* Ambient Map Decoration */}
        <div className="absolute inset-0 opacity-20 grayscale contrast-125">
           <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" alt="Tactical Background" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-[var(--nx-bg-surface)] to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-32 h-32 bg-[var(--nx-red-primary)]/10 rounded-full blur-[60px]" />
           <div className="text-7xl opacity-50 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              {service.type === 'hospital' ? '🏥' : '🚑'}
           </div>
        </div>
        
        {/* Radar Sweep Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[repeating-conic-gradient(from_0deg,transparent_0deg,transparent_30deg,white_31deg,transparent_32deg)] animate-spin-slow" />
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 lg:p-10 -mt-10 bg-[var(--nx-bg-base)] rounded-t-[40px] relative z-20 border-t border-[var(--nx-border)] shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant={service.type === 'hospital' ? 'critical' : 'active'}>{service.type}</Badge>
                <Badge variant="info">VERIFIED ASSET</Badge>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{service.name}</h1>
              <div className="flex items-center gap-2 mt-4 text-[var(--nx-text-dim)] uppercase font-mono text-xs">
                <MapPin size={14} className="text-[var(--nx-blue-primary)]" />
                {service.address}
              </div>
            </div>
            
            <div className="flex items-center gap-6 bg-white/[0.02] border border-[var(--nx-border)] p-4 rounded-sm">
               <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[var(--nx-amber-primary)] mb-1">
                     <Star size={16} className="fill-current" />
                     <span className="text-sm font-black">4.8</span>
                  </div>
                  <span className="text-[9px] font-bold text-[var(--nx-text-dim)] uppercase">System Rating</span>
               </div>
               <div className="w-[1px] h-10 bg-[var(--nx-border)]" />
               <div className="flex flex-col items-center">
                  <CheckCircle size={16} className="text-[var(--nx-green-primary)] mb-1" />
                  <span className="text-[9px] font-bold text-[var(--nx-text-dim)] uppercase tracking-tighter">Status: Active</span>
               </div>
            </div>
          </div>

          {/* Tactical Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <MetricBox label="KINETIC RADIUS" value={service.distance || '2.4 KM'} icon={<Globe size={18} />} />
             <MetricBox label="INTERCEPT TIME" value={service.eta || '8 MIN'} icon={<Clock size={18} />} accent />
             <MetricBox label="RESOURCE LOAD" value="LOW (12%)" icon={<Zap size={18} />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             {/* Left: Capabilities */}
             <div className="lg:col-span-7 space-y-8">
                <Panel title="Operational Capabilities" icon={Shield} subtitle="Verified infrastructure & specialties">
                   <div className="grid grid-cols-2 gap-4">
                      {['Level 1 Trauma', '24/7 ICU', 'Blood Bank', 'Burn Unit', 'Neurology', 'Air-Evac Ready'].map((cap, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.01] border border-[var(--nx-border)] rounded-sm group hover:border-[var(--nx-border-active)] transition-all">
                           <div className="w-1.5 h-1.5 bg-[var(--nx-blue-primary)] rounded-full group-hover:scale-150 transition-transform shadow-[0_0_8px_var(--nx-blue-primary)]" />
                           <span className="text-xs font-bold text-white tracking-tight uppercase">{cap}</span>
                        </div>
                      ))}
                   </div>
                </Panel>
             </div>

             {/* Right: Actions */}
             <div className="lg:col-span-5 space-y-6">
                <div className="flex flex-col gap-4">
                   <button 
                     onClick={() => window.open(`tel:${service.phone_primary}`)}
                     className="w-full h-16 bg-[var(--nx-green-primary)] text-navy font-black text-lg uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:brightness-110 transition-all shadow-[0_0_30px_rgba(46,196,182,0.3)] group relative overflow-hidden"
                   >
                      <Phone size={24} />
                      INITIATE COMS
                      <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
                   </button>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <Button variant="secondary" className="h-14 font-bold tracking-widest gap-2">
                        <Navigation size={18} /> NAVIGATE
                      </Button>
                      <Button variant="secondary" className="h-14 font-bold tracking-widest gap-2">
                        <Share2 size={18} /> RELAY
                      </Button>
                   </div>
                </div>

                <div className="p-4 nexus-card bg-[var(--nx-red-dim)] border-[var(--nx-red-primary)]/20 flex gap-4">
                   <AlertTriangle className="text-[var(--nx-red-primary)] shrink-0" size={20} />
                   <div>
                      <div className="text-[10px] font-bold text-[var(--nx-red-primary)] uppercase mb-1">INTEL INTEGRITY</div>
                      <p className="text-[11px] text-white/70 leading-relaxed uppercase">Notify command if asset data is non-conforming to current field state.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricBox = ({ label, value, icon, accent }: any) => (
  <div className={`p-6 nexus-card flex flex-col gap-4 ${accent ? 'border-[var(--nx-red-primary)]/20 bg-[var(--nx-red-dim)]/30' : 'bg-white/[0.02]'}`}>
     <div className="flex items-center justify-between opacity-50">
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        {icon}
     </div>
     <div className={`text-3xl font-black font-mono tracking-tighter ${accent ? 'text-[var(--nx-red-primary)] shadow-[0_0_20px_rgba(255,59,59,0.1)]' : 'text-white'}`}>{value}</div>
  </div>
);
