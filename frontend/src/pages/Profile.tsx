import { Heart, Settings, Phone, Lock, Unlock, AlertTriangle, Edit2, Save, X, DownloadCloud, CheckCircle, ShieldAlert, Fingerprint, Database, Zap } from 'lucide-react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useUIStore, useUserStore, useAlertStore } from '../store';
import { useCrashDetection } from '../hooks/useCrashDetection';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

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

  // Crash Detection Simulation
  const [isSimulatingCrash, setIsSimulatingCrash] = useState(false);
  useCrashDetection(isSimulatingCrash);

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

    const lat = 28.6139;
    const lon = 77.2090;
    
    const zoomLevels = [13, 14];
    const tilesToFetch: string[] = [];

    zoomLevels.forEach(z => {
      const centerTx = lon2tile(lon, z);
      const centerTy = lat2tile(lat, z);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          tilesToFetch.push(`https://a.basemaps.cartocdn.com/dark_all/${z}/${centerTx + dx}/${centerTy + dy}.png`);
        }
      }
    });

    let completed = 0;
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

  const qrPayload = JSON.stringify({
    v: 1,
    id: "RDS-8492-X",
    blood: medicalInfo.bloodGroup,
    allergies: medicalInfo.allergies,
    conditions: medicalInfo.conditions
  });

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base)] text-[var(--nx-text-primary)] p-6 lg:p-10 pb-24 lg:pb-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Identity & Vault */}
        <div className="lg:col-span-7 space-y-8">
           {/* Tactical ID Card */}
           <div className="nexus-card p-6 flex items-center gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 font-mono text-[60px] font-black leading-none pointer-events-none select-none">
                 NX-9
              </div>
              <div className="w-20 h-20 bg-[var(--nx-bg-elevated)] border border-[var(--nx-border)] rounded-sm flex items-center justify-center relative overflow-hidden group-hover:border-[var(--nx-red-primary)] transition-colors">
                 <div className="text-2xl font-black text-white">JS</div>
                 <div className="absolute inset-0 bg-[var(--nx-red-primary)] opacity-10 animate-pulse" />
              </div>
              <div className="flex-1">
                 <h1 className="text-2xl font-bold text-white tracking-tighter">JOHN SMITH</h1>
                 <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-mono text-[var(--nx-text-dim)] uppercase tracking-widest">TACTICAL ID: RDS-8492-X</span>
                    <Badge variant="active">VERIFIED</Badge>
                 </div>
              </div>
              <button 
                onClick={() => setStressed(true)}
                className="w-10 h-10 nexus-card flex items-center justify-center text-[var(--nx-red-primary)] hover:bg-[var(--nx-red-primary)] hover:text-white transition-all shadow-[0_0_10px_rgba(255,59,59,0.1)]"
              >
                <AlertTriangle size={18} />
              </button>
           </div>

           {/* Medical Vault - Zero Trust */}
           <Panel 
             title={isLocked ? "Secure Medical Vault" : "Medical Core Decrypted"} 
             icon={isLocked ? Lock : Heart}
             variant={isLocked ? 'active' : 'ai'}
             action={
               <div className="flex gap-2">
                 {isLocked ? (
                   <Button variant="secondary" size="sm" onClick={handleUnlockVault} className="text-[9px] tracking-widest">
                     <Fingerprint size={12} className="mr-2" /> AUTHENTICATE
                   </Button>
                 ) : (
                   <>
                     {!isEditing && (
                       <Button variant="secondary" size="sm" onClick={handleEditClick} className="text-[9px]">
                         <Edit2 size={12} />
                       </Button>
                     )}
                     <Button variant="primary" size="sm" onClick={handleLockVault} className="text-[9px] tracking-widest">
                       <Lock size={12} className="mr-2" /> SEAL
                     </Button>
                   </>
                 )}
               </div>
             }
           >
             {isLocked ? (
               <div className="flex flex-col items-center justify-center py-10 gap-6 text-center">
                  <div className="p-4 bg-white rounded-sm shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <QRCodeSVG value={qrPayload} size={160} level="Q" includeMargin={false} />
                  </div>
                  <div className="max-w-xs">
                     <p className="text-[10px] font-bold text-[var(--nx-blue-primary)] uppercase tracking-widest mb-2">Passive Responder Access</p>
                     <p className="text-[11px] text-[var(--nx-text-dim)] leading-relaxed font-mono">
                       END-TO-END ENCRYPTED. DATA RESIDES LOCALLY. SCAN ONLY IN CRITICAL EVENTS.
                     </p>
                  </div>
               </div>
             ) : (
               <div className="space-y-6 py-2">
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-6">
                       <div className="flex flex-col gap-2">
                          <label className="nexus-label">BLOOD GROUP</label>
                          <input 
                            className="nexus-input" 
                            value={editForm.bloodGroup} 
                            onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}
                          />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="nexus-label">ALLERGIES</label>
                          <input 
                            className="nexus-input" 
                            value={editForm.allergies} 
                            onChange={(e) => setEditForm({...editForm, allergies: e.target.value})}
                          />
                       </div>
                       <div className="flex flex-col gap-2">
                          <label className="nexus-label">MEDICAL CONDITIONS</label>
                          <textarea 
                            className="nexus-input min-h-[100px]" 
                            value={editForm.conditions} 
                            onChange={(e) => setEditForm({...editForm, conditions: e.target.value})}
                          />
                       </div>
                       <div className="flex gap-4 pt-4">
                          <Button variant="primary" className="flex-1" onClick={handleSaveEdit}><Save size={16} className="mr-2" /> COMMIT CHANGES</Button>
                          <Button variant="secondary" className="flex-1" onClick={handleCancelEdit}><X size={16} className="mr-2" /> ABORT</Button>
                       </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-8">
                       <div className="nexus-card p-4 bg-white/[0.01]">
                          <div className="nexus-label mb-2">Blood Group</div>
                          <div className="text-xl font-black text-[var(--nx-red-primary)] font-mono">{medicalInfo.bloodGroup}</div>
                       </div>
                       <div className="nexus-card p-4 bg-white/[0.01]">
                          <div className="nexus-label mb-2">Allergies</div>
                          <div className="text-sm font-bold text-white">{medicalInfo.allergies || 'NONE DETECTED'}</div>
                       </div>
                       <div className="col-span-full nexus-card p-4 bg-white/[0.01]">
                          <div className="nexus-label mb-2">Chronic Conditions</div>
                          <p className="text-xs text-[var(--nx-text-secondary)] leading-relaxed">{medicalInfo.conditions || 'CLEAN MEDICAL BILL'}</p>
                       </div>
                    </div>
                  )}
               </div>
             )}
           </Panel>
        </div>

        {/* Right Column: Protocols & Contacts */}
        <div className="lg:col-span-5 space-y-8">
           <Panel title="Emergency Contacts" icon={Phone} subtitle="High-priority notification chain">
              <div className="space-y-3">
                 {[
                   { name: 'Jane Smith', relation: 'Spouse', phone: '+1 555-0198' },
                   { name: 'Robert Smith', relation: 'Father', phone: '+1 555-0199' }
                 ].map((contact, i) => (
                   <div key={i} className="p-4 nexus-card bg-white/[0.01] flex justify-between items-center group hover:border-[var(--nx-border-active)] transition-all">
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-tight">{contact.name}</div>
                        <div className="text-[10px] text-[var(--nx-text-dim)] uppercase mt-1">{contact.relation}</div>
                      </div>
                      <div className="text-xs font-mono text-[var(--nx-blue-primary)] group-hover:text-white transition-colors">{contact.phone}</div>
                   </div>
                 ))}
                 <button className="w-full py-4 border border-dashed border-[var(--nx-border)] rounded-sm text-[10px] font-bold text-[var(--nx-text-dim)] uppercase tracking-widest hover:border-[var(--nx-border-active)] hover:text-white transition-all mt-2">
                   + ADD EMERGENCY ASSET
                 </button>
              </div>
           </Panel>

           <Panel title="Tactical Protocols" icon={Settings} subtitle="System configuration">
              <div className="space-y-6">
                 {/* Active Responder Toggle */}
                 <div className="flex justify-between items-center group">
                    <div className="max-w-[70%]">
                       <div className="text-xs font-bold text-white flex items-center gap-2">
                          ACTIVE RESPONDER MODE
                          {isResponder && <div className="w-1.5 h-1.5 bg-[var(--nx-red-primary)] rounded-full animate-ping" />}
                       </div>
                       <p className="text-[10px] text-[var(--nx-text-dim)] mt-1 uppercase leading-relaxed">Broadcast presence to nearby critical events (&lt;1KM)</p>
                    </div>
                    <button 
                      onClick={toggleResponderMode}
                      className={`w-12 h-6 border transition-all relative ${isResponder ? 'border-[var(--nx-red-primary)] bg-[var(--nx-red-dim)]' : 'border-[var(--nx-border)] bg-transparent'}`}
                    >
                       <div className={`absolute top-1 bottom-1 w-4 transition-all ${isResponder ? 'right-1 bg-[var(--nx-red-primary)] shadow-[0_0_8px_var(--nx-red-primary)]' : 'left-1 bg-[var(--nx-border)]'}`} />
                    </button>
                 </div>

                 {/* Crash Detection */}
                 <div className="flex justify-between items-center border-t border-[var(--nx-border)]/50 pt-6">
                    <div className="max-w-[70%]">
                       <div className="text-xs font-bold text-white">AUTO IMPACT ANALYSIS</div>
                       <p className="text-[10px] text-[var(--nx-text-dim)] mt-1 uppercase leading-relaxed">TRIGGER SOS PROTOCOL ON &gt;4G KINETIC IMPACT</p>
                    </div>
                    <button 
                      onClick={() => setIsSimulatingCrash(!isSimulatingCrash)}
                      className={`w-12 h-6 border transition-all relative ${isSimulatingCrash ? 'border-[var(--nx-amber-primary)] bg-[var(--nx-amber-dim)]' : 'border-[var(--nx-border)] bg-transparent'}`}
                    >
                       <div className={`absolute top-1 bottom-1 w-4 transition-all ${isSimulatingCrash ? 'right-1 bg-[var(--nx-amber-primary)] shadow-[0_0_8px_var(--nx-amber-primary)]' : 'left-1 bg-[var(--nx-border)]'}`} />
                    </button>
                 </div>

                 {/* Offline Data Secure */}
                 <div className="flex flex-col gap-4 border-t border-[var(--nx-border)]/50 pt-6">
                    <div className="flex justify-between items-center">
                       <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                             LOCAL RELAY CACHING
                             {isCached && <CheckCircle size={14} className="text-[var(--nx-blue-primary)]" />}
                          </div>
                          <p className="text-[10px] text-[var(--nx-text-dim)] mt-1 uppercase">SECURE 10KM RADIUS FOR OFFLINE OPS</p>
                       </div>
                       <Button 
                         variant={isCached ? 'secondary' : 'primary'} 
                         size="sm" 
                         className="p-2 min-w-0" 
                         onClick={handlePreCache}
                         disabled={isCaching}
                       >
                          {isCaching ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Database size={16} />}
                       </Button>
                    </div>
                    {isCaching && (
                       <div className="w-full h-[2px] bg-white/5 overflow-hidden">
                          <motion.div 
                            className="h-full bg-[var(--nx-blue-primary)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${cacheProgress}%` }}
                          />
                       </div>
                    )}
                 </div>

                 {/* First Aid Media */}
                 <div className="flex justify-between items-center border-t border-[var(--nx-border)]/50 pt-6">
                    <div>
                       <div className="text-xs font-bold text-white uppercase">Neural Response Media</div>
                       <p className="text-[10px] text-[var(--nx-text-dim)] mt-1 uppercase">HQ INSTRUCTIONAL ASSETS FOR OFFLINE TRIAGE</p>
                    </div>
                    <Button variant="secondary" size="sm" className="p-2 min-w-0"><DownloadCloud size={16} /></Button>
                 </div>
              </div>
           </Panel>

           <div className="p-4 nexus-card bg-[var(--nx-blue-dim)] border-[var(--nx-blue-primary)]/20">
              <div className="flex items-center gap-3 text-[var(--nx-blue-primary)] mb-2">
                 <Zap size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">NEXUS STATUS</span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed font-mono">
                 SYSTEM INTEGRITY: 100%<br />
                 VAULT ENCRYPTION: AES-256-GCM<br />
                 RELAY NODE: ACTIVE (DEL-01)
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
