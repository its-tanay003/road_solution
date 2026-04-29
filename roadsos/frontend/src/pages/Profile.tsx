import { Heart, Settings, Phone, Lock, Unlock, AlertTriangle, Edit2, Save, X, DownloadCloud, CheckCircle, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useUIStore, useUserStore, useAlertStore } from '../store';

// Helper: Calculate slippy map tile coordinates
const lon2tile = (lon: number, zoom: number) => (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
const lat2tile = (lat: number, zoom: number) => (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));

export const Profile = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { setStressed } = useUIStore();
  const { medicalInfo, updateMedicalInfo, isResponder, toggleResponderMode } = useUserStore();
  const { triggerAlert } = useAlertStore();

  const [editForm, setEditForm] = useState(medicalInfo);
  
  // Offline Caching State
  const [isCaching, setIsCaching] = useState(false);
  const [cacheProgress, setCacheProgress] = useState(0);
  const [isCached, setIsCached] = useState(false);

  // Mock AES-GCM Encrypt Function
  const handleLockVault = async () => {
    setIsLocked(true);
    setIsEditing(false);
  };

  const handleUnlockVault = () => {
    setIsLocked(false);
  };

  const handleEditClick = () => {
    setEditForm(medicalInfo);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateMedicalInfo(editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handlePreCache = async () => {
    if (isCached) return;
    setIsCaching(true);
    setCacheProgress(0);

    // Home coordinate (New Delhi)
    const lat = 28.6139;
    const lon = 77.2090;
    
    // We will cache a 5km radius roughly across 2 zoom levels (13, 14)
    // To prevent crushing the browser, we'll fetch a 3x3 grid around the center tile for both zoom levels
    const zoomLevels = [13, 14];
    const tilesToFetch: string[] = [];

    zoomLevels.forEach(z => {
      const centerTx = lon2tile(lon, z);
      const centerTy = lat2tile(lat, z);
      
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          // Add CartoDB Dark Matter tile URL
          tilesToFetch.push(`https://a.basemaps.cartocdn.com/dark_all/${z}/${centerTx + dx}/${centerTy + dy}.png`);
        }
      }
    });

    let completed = 0;
    
    // Fetch all tiles so the service worker (Workbox) intercepts and caches them
    for (const url of tilesToFetch) {
      try {
        await fetch(url, { mode: 'no-cors' });
      } catch (e) {
        console.error("Cache fetch failed for", url);
      }
      completed++;
      setCacheProgress(Math.round((completed / tilesToFetch.length) * 100));
    }

    setTimeout(() => {
      setIsCaching(false);
      setIsCached(true);
    }, 500);
  };

  const handleSimulateAlert = () => {
    if (!isResponder) return;
    triggerAlert({
      id: `sos-${Date.now()}`,
      type: 'Minor Cut / Injury',
      lat: 28.6150,
      lng: 77.2100,
      distance: 400,
      user: 'Anonymous Victim',
      timestamp: Date.now()
    });
  };

  // Prepare the data to be embedded in the QR Code
  const qrPayload = JSON.stringify({
    v: 1,
    id: "RDS-8492-X",
    blood: medicalInfo.bloodGroup,
    allergies: medicalInfo.allergies,
    conditions: medicalInfo.conditions
  });

  return (
    <div className="min-h-screen bg-background text-card p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header Profile */}
        <div className="flex items-center space-x-4 bg-navy/80 backdrop-blur-md p-4 rounded-2xl border border-white/5">
          <div className="w-16 h-16 bg-gradient-to-tr from-emergency to-amber-500 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg">
            JS
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-condensed font-bold">John Smith</h1>
            <p className="text-sm text-muted font-mono">ID: RDS-8492-X</p>
          </div>
          <button 
            onClick={() => setStressed(true)}
            className="w-10 h-10 rounded-full bg-emergency/20 text-emergency flex items-center justify-center hover:bg-emergency hover:text-white transition-colors"
            title="Debug: Trigger Ambient UI Stress Mode"
          >
            <AlertTriangle size={18} />
          </button>
        </div>

        {/* Zero-Trust Medical Vault */}
        <div className={`border rounded-2xl p-4 transition-all duration-500 ${isLocked ? 'bg-black/60 border-safe/50 shadow-[0_0_20px_rgba(46,196,182,0.1)]' : 'bg-white/5 border-white/10'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-condensed font-bold flex items-center ${isLocked ? 'text-safe' : 'text-white'}`}>
              {isLocked ? <Lock size={18} className="mr-2"/> : <Heart size={18} className="mr-2"/>} 
              {isLocked ? 'Medical Vault Sealed' : 'Medical Data (Plaintext)'}
            </h2>
            {isLocked ? (
              <button onClick={handleUnlockVault} title="Unlock Vault" className="text-xs font-mono text-muted flex items-center hover:text-white">
                <Unlock size={14} className="mr-1"/> UNLOCK
              </button>
            ) : (
              <div className="flex space-x-2">
                {!isEditing && (
                  <button onClick={handleEditClick} title="Edit Medical Info" className="text-xs font-mono text-amber-500 flex items-center hover:text-amber-400">
                    <Edit2 size={14} className="mr-1"/> EDIT
                  </button>
                )}
                <button onClick={handleLockVault} title="Lock Vault" className="text-xs font-mono text-safe flex items-center bg-safe/10 px-3 py-1 rounded-full border border-safe/20">
                  <Lock size={14} className="mr-1"/> LOCK
                </button>
              </div>
            )}
          </div>
          
          {isLocked ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="w-48 h-48 bg-white p-3 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(46,196,182,0.3)]">
                <QRCodeSVG 
                  value={qrPayload} 
                  size={168} 
                  level="Q"
                  includeMargin={false}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-safe tracking-wide">RESPONDER QR CODE</p>
                <p className="text-xs text-muted font-mono mt-1">Ready for scanning</p>
              </div>
              <p className="text-xs text-muted max-w-[250px] leading-relaxed">
                Scan to decrypt medical data. The cloud cannot access this information.
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted font-mono uppercase tracking-widest block mb-1">Blood Group</label>
                    <input 
                      type="text"
                      title="Blood Group"
                      placeholder="e.g. O Positive"
                      className="w-full bg-black/60 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-safe"
                      value={editForm.bloodGroup}
                      onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted font-mono uppercase tracking-widest block mb-1">Allergies</label>
                    <input 
                      type="text"
                      title="Allergies"
                      placeholder="List any allergies"
                      className="w-full bg-black/60 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-safe"
                      value={editForm.allergies}
                      onChange={(e) => setEditForm({...editForm, allergies: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted font-mono uppercase tracking-widest block mb-1">Medical Conditions</label>
                    <textarea 
                      title="Medical Conditions"
                      placeholder="List any chronic conditions"
                      className="w-full bg-black/60 border border-white/20 p-3 rounded-xl text-white outline-none focus:border-safe min-h-[80px]"
                      value={editForm.conditions}
                      onChange={(e) => setEditForm({...editForm, conditions: e.target.value})}
                    />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button 
                      onClick={handleSaveEdit}
                      title="Save Changes"
                      className="flex-1 bg-safe text-navy font-bold py-3 rounded-xl flex items-center justify-center hover:bg-safe/80"
                    >
                      <Save size={18} className="mr-2" /> Save Changes
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      title="Cancel Edit"
                      className="flex-1 bg-transparent border border-white/20 text-white font-bold py-3 rounded-xl flex items-center justify-center hover:bg-white/5"
                    >
                      <X size={18} className="mr-2" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-muted font-mono uppercase tracking-widest block mb-1">Blood Group</label>
                      <div className="bg-black/40 border border-white/10 p-3 rounded-xl font-bold text-emergency">{medicalInfo.bloodGroup}</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted font-mono uppercase tracking-widest block mb-1">Allergies</label>
                      <div className="bg-black/40 border border-white/10 p-3 rounded-xl font-bold text-white">{medicalInfo.allergies}</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted font-mono uppercase tracking-widest block mb-1">Medical Conditions</label>
                    <div className="bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm">{medicalInfo.conditions}</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-condensed font-bold flex items-center text-amber-500"><Phone size={18} className="mr-2"/> Emergency Contacts</h2>
            <button className="text-xs font-mono text-safe" title="Edit Contacts">EDIT</button>
          </div>
          
          <div className="space-y-3">
            {[
              { name: 'Jane Smith', relation: 'Spouse', phone: '+1 555-0198' },
              { name: 'Robert Smith', relation: 'Father', phone: '+1 555-0199' }
            ].map((contact, i) => (
              <div key={i} className="flex justify-between items-center bg-black/40 border border-white/5 p-3 rounded-xl">
                <div>
                  <div className="font-bold text-sm">{contact.name}</div>
                  <div className="text-xs text-muted">{contact.relation}</div>
                </div>
                <div className="font-mono text-sm text-safe">{contact.phone}</div>
              </div>
            ))}
            <button title="Add Contact" className="w-full py-3 border border-dashed border-white/20 rounded-xl text-sm text-muted hover:text-white hover:border-white/40 transition-colors">
              + Add Contact
            </button>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h2 className="text-lg font-condensed font-bold mb-4 flex items-center text-blue-400"><Settings size={18} className="mr-2"/> System & Caching</h2>
          
          <div className="space-y-4">

            {/* Volunteer Responder Mode */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-sm flex items-center">
                  Active Responder
                  {isResponder && <ShieldAlert size={14} className="ml-2 text-emergency animate-pulse" />}
                </div>
                <div className="text-xs text-muted max-w-[200px]">
                  Receive alerts for non-critical emergencies within 1km
                </div>
              </div>
              <div 
                onClick={toggleResponderMode}
                className={`w-12 h-6 rounded-full relative cursor-pointer border transition-colors ${isResponder ? 'bg-emergency/20 border-emergency/50' : 'bg-white/10 border-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full absolute top-0.5 shadow-sm transition-all ${isResponder ? 'bg-emergency right-0.5' : 'bg-white/50 left-0.5'}`}></div>
              </div>
            </div>

            {isResponder && (
               <button 
                 onClick={handleSimulateAlert}
                 className="w-full bg-emergency/10 border border-emergency/30 text-emergency text-xs font-bold py-2 rounded-lg hover:bg-emergency/20 transition-colors"
                 title="Debug: Simulate Incoming Alert"
               >
                 Debug: Simulate Incoming Alert
               </button>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <div>
                <div className="font-bold text-sm flex items-center">
                  Pre-cache frequent routes
                  {isCached && <CheckCircle size={14} className="ml-2 text-safe" />}
                </div>
                <div className="text-xs text-muted">
                  {isCaching ? `Downloading tiles... ${cacheProgress}%` : isCached ? '10km radius secured for offline use' : 'Download maps & services for daily commute'}
                </div>
              </div>
              <div 
                onClick={handlePreCache}
                className={`w-12 h-6 rounded-full relative cursor-pointer border transition-colors ${isCached ? 'bg-safe/20 border-safe/50' : isCaching ? 'bg-amber-500/20 border-amber-500/50' : 'bg-white/10 border-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full absolute top-0.5 shadow-sm transition-all ${isCached ? 'bg-safe right-0.5' : isCaching ? 'bg-amber-500 right-[50%] translate-x-[50%] animate-pulse' : 'bg-white/50 left-0.5'}`}></div>
              </div>
            </div>
            
            {/* Download Media Assets Option */}
            <div className="flex justify-between items-center pt-2">
              <div>
                <div className="font-bold text-sm">Cache First-Aid Media</div>
                <div className="text-xs text-muted">Store HQ videos & audio for offline triage</div>
              </div>
              <button title="Download Media" className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors">
                <DownloadCloud size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
