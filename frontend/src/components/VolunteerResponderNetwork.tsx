import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { 
  Heart, 
  MapPin, 
  Shield, 
  Zap, 
  Trophy, 
  Clock, 
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { useVolunteerStore } from '../store/volunteerStore';

export const VolunteerResponderNetwork: React.FC = () => {
  const { isRegistered, isActive, nearbyIncidents, stats, register, toggleStatus } = useVolunteerStore();
  const [showReg, setShowReg] = useState(!isRegistered);
  const [name, setName] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const skillsList = ['First Aid', 'CPR', 'Mechanical', 'Traffic Control', 'Legal'];

  const handleRegister = () => {
    if (name.trim()) {
      register(name, selectedSkills);
      setShowReg(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  if (showReg) {
    return (
      <div className="fixed inset-0 z-1100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Panel className="p-8 border-(--nx-blue-primary)/30 bg-linear-to-b from-(--nx-bg-[var(--color-surface)]) to-(--nx-bg-elevated)">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-(--nx-blue-primary)/20 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-(--nx-blue-primary) animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Become a Hero</h2>
              <p className="text-(--nx-text-tertiary) text-sm">
                Join our network of citizen responders. Get alerted when someone nearby needs immediate assistance.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-(--nx-text-tertiary) uppercase tracking-wider mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Responder John"
                  className="w-full bg-(--nx-bg-base) border border-(--nx-border) rounded-xl px-4 py-3 text-white focus:outline-none focus:border-(--nx-blue-primary) transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-(--nx-text-tertiary) uppercase tracking-wider mb-2">Your Skills</label>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedSkills.includes(skill)
                          ? 'bg-(--nx-blue-primary) text-white shadow-lg shadow-(--nx-blue-primary)/20'
                          : 'bg-(--nx-bg-base) text-(--nx-text-tertiary) border border-(--nx-border) hover:border-(--nx-text-tertiary)/50'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                variant="primary" 
                className="w-full py-4 rounded-xl font-bold text-lg mt-4 shadow-xl shadow-(--nx-blue-primary)/20"
                onClick={handleRegister}
                disabled={!name.trim()}
              >
                Join Network
              </Button>
            </div>
          </Panel>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-(--nx-blue-primary)" />
            Volunteer Network
          </h2>
          <p className="text-xs text-(--nx-text-tertiary)">You are currently {isActive ? 'Active' : 'Inactive'} in the network</p>
        </div>
        <Button 
          variant={isActive ? 'danger-outline' : 'primary'}
          size="sm"
          onClick={toggleStatus}
        >
          {isActive ? 'Go Offline' : 'Go Online'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Panel className="p-4 bg-(--nx-bg-elevated) border-(--nx-border) text-center">
          <Heart className="w-4 h-4 text-red-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{stats.helped}</div>
          <div className="text-[10px] text-(--nx-text-tertiary) uppercase tracking-tighter">Helped</div>
        </Panel>
        <Panel className="p-4 bg-(--nx-bg-elevated) border-(--nx-border) text-center">
          <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{stats.points}</div>
          <div className="text-[10px] text-(--nx-text-tertiary) uppercase tracking-tighter">Impact</div>
        </Panel>
        <Panel className="p-4 bg-(--nx-bg-elevated) border-(--nx-border) text-center">
          <Trophy className="w-4 h-4 text-orange-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">#42</div>
          <div className="text-[10px] text-(--nx-text-tertiary) uppercase tracking-tighter">Rank</div>
        </Panel>
      </div>

      {/* Active Incidents */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Nearby Incidents (1km)
        </h3>
        
        <AnimatePresence mode="popLayout">
          {nearbyIncidents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center bg-(--nx-bg-elevated)/30 border border-dashed border-(--nx-border) rounded-2xl"
            >
              <div className="w-10 h-10 rounded-full bg-(--nx-border)/30 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-(--nx-text-tertiary) opacity-30" />
              </div>
              <p className="text-sm text-(--nx-text-tertiary)">All quiet in your area.</p>
              <p className="text-[10px] text-(--nx-text-tertiary) opacity-50 mt-1">We'll alert you if something happens.</p>
            </motion.div>
          ) : (
            nearbyIncidents.map(incident => (
              <motion.div
                key={incident.incidentId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Panel className="p-4 border-l-4 border-l-orange-500 bg-orange-500/5 hover:bg-orange-500/10 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">{incident.type}</span>
                        <span className="w-1 h-1 rounded-full bg-(--nx-text-tertiary)/30" />
                        <span className="text-[10px] text-(--nx-text-tertiary)">{incident.distance}km away</span>
                      </div>
                      <h4 className="text-white font-medium">NH-48 near exit 14</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-[10px] text-(--nx-text-tertiary)">
                          <Clock className="w-3 h-3" />
                          2m ago
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-(--nx-text-tertiary)">
                          <MapPin className="w-3 h-3" />
                          Geofenced
                        </div>
                      </div>
                    </div>
                    <Button variant="primary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Respond
                    </Button>
                  </div>
                </Panel>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Network Health */}
      <Panel className="p-4 bg-blue-500/5 border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-(--nx-bg-[var(--color-surface)])" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Network Healthy</div>
            <div className="text-[10px] text-(--nx-text-tertiary)">48 volunteers active in your district</div>
          </div>
        </div>
      </Panel>
    </div>
  );
};
