import { AlertTriangle, MapPin, X, Navigation } from 'lucide-react';
import { useAlertStore } from '../store';

export const ResponderAlertOverlay = () => {
  const { activeAlert, clearAlert } = useAlertStore();

  if (!activeAlert) return null;

  const handleAccept = () => {
    // In a real app, this would notify the backend that you are responding
    // and launch the map/navigation system to the target coordinates.
    alert(`Routing to ${activeAlert.user} at [${activeAlert.lat}, ${activeAlert.lng}]...`);
    clearAlert();
  };

  const handleDecline = () => {
    clearAlert();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-navy border-2 border-emergency/50 rounded-2xl shadow-[0_0_50px_rgba(230,57,70,0.3)] overflow-hidden">
        
        {/* Pulsing Header */}
        <div className="bg-emergency/20 border-b border-emergency/30 p-4 flex items-center justify-center space-x-3">
          <AlertTriangle className="text-emergency animate-pulse" size={24} />
          <h2 className="text-xl font-condensed font-bold text-white tracking-widest uppercase">
            Responder Alert
          </h2>
          <AlertTriangle className="text-emergency animate-pulse" size={24} />
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-mono text-muted mb-2">
              <MapPin size={12} className="mr-1" /> {activeAlert.distance}m Away
            </div>
            <h3 className="text-2xl font-bold text-white">{activeAlert.type}</h3>
            <p className="text-sm text-muted">User: {activeAlert.user}</p>
          </div>

          <div className="bg-black/50 border border-white/10 p-4 rounded-xl text-center text-sm text-muted">
            A nearby user has triggered a non-critical SOS. Can you assist?
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={handleDecline}
              title="Decline Request"
              className="py-3 px-4 rounded-xl font-bold flex items-center justify-center bg-transparent border border-white/20 text-white hover:bg-white/5 transition-colors"
            >
              <X size={18} className="mr-2" /> Decline
            </button>
            <button 
              onClick={handleAccept}
              title="Accept and Route"
              className="py-3 px-4 rounded-xl font-bold flex items-center justify-center bg-emergency text-white hover:bg-emergency/80 transition-colors shadow-lg"
            >
              <Navigation size={18} className="mr-2" /> Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
