import { Map as MapIcon, Download, Navigation } from 'lucide-react';

export const RoutePlanner = () => {
  return (
    <div className="min-h-screen bg-background text-card flex flex-col">
      {/* Header */}
      <div className="p-4 bg-navy/80 backdrop-blur-md border-b border-white/10 z-10">
        <h1 className="text-2xl font-condensed font-bold mb-4 flex items-center"><MapIcon className="mr-2" /> Route Safety Planner</h1>
        
        <div className="space-y-3 relative">
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-600"></div>
          <input type="text" placeholder="Source (e.g. Home)" className="w-full bg-black/50 border border-white/10 rounded-xl px-10 py-3 text-sm focus:ring-1 focus:ring-safe" />
          <input type="text" placeholder="Destination (e.g. Office)" className="w-full bg-black/50 border border-white/10 rounded-xl px-10 py-3 text-sm focus:ring-1 focus:ring-safe" />
          <div className="absolute left-3 top-3 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
          <div className="absolute left-3 bottom-3 w-2.5 h-2.5 rounded-full bg-emergency"></div>
        </div>
      </div>

      {/* Map Preview Area */}
      <div className="flex-1 relative bg-gray-900 border-b border-white/10 flex items-center justify-center">
        <div className="absolute inset-0 opacity-50 bg-[url('https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/13/5799/3394.png')] bg-cover bg-center"></div>
        
        {/* Fake Polyline SVG */}
        <svg className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="none">
          <path d="M50,50 Q150,150 300,50 T400,200" fill="transparent" stroke="#2EC4B6" strokeWidth="4" strokeDasharray="8 8" className="animate-[dash_20s_linear_infinite]" />
        </svg>
        
        <div className="z-20 bg-navy/90 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-xl flex items-center">
          <Navigation size={16} className="text-safe mr-2" />
          <span className="font-mono text-sm font-bold">14.2 km (28 mins)</span>
        </div>
      </div>

      {/* Timeline & Actions */}
      <div className="p-4 bg-background z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <h3 className="text-xs text-muted font-mono uppercase tracking-widest mb-4">Emergency Corridor Scan</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-start">
            <div className="w-12 text-right mr-3 mt-1 text-xs font-mono text-muted">2.1 km</div>
            <div className="w-1 h-full bg-white/10 relative mr-3 flex-shrink-0">
              <div className="w-3 h-3 bg-emergency rounded-full absolute -left-1"></div>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex-1">
              <h4 className="font-bold text-sm text-white">City Hospital</h4>
              <p className="text-xs text-muted">Within 2 mins detour</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-12 text-right mr-3 mt-1 text-xs font-mono text-muted">8.5 km</div>
            <div className="w-1 h-full bg-white/10 relative mr-3 flex-shrink-0">
              <div className="w-3 h-3 bg-blue-500 rounded-full absolute -left-1"></div>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex-1">
              <h4 className="font-bold text-sm text-white">Highway Patrol Post</h4>
              <p className="text-xs text-muted">Directly on route</p>
            </div>
          </div>
        </div>

        <button className="w-full bg-safe text-navy py-4 rounded-2xl flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(46,196,182,0.3)] hover:bg-teal-400 transition-colors">
          <Download size={20} className="mr-2" /> Download Offline Pack
        </button>
      </div>
    </div>
  );
};
