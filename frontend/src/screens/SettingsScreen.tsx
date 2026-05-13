import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ExternalLink, AlertTriangle, Info, Siren,
  MapPin, Bell, Mic, Eye, Shield, Trash2, LogOut, Moon,
  User, Phone, Languages, HelpCircle, Github, Star
} from 'lucide-react';
import { useUserStore } from '../store/userStore';

/* ── Row ─────────────────────────────────────────────────────── */
function Row({
  icon: Icon, label, value, color = 'text-blue-400', onClick, danger, right
}: {
  icon: React.ElementType; label: string; value?: string; color?: string;
  onClick?: () => void; danger?: boolean; right?: React.ReactNode;
}) {
  return (
    <motion.button whileTap={{ scale: 0.985 }} onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/4 active:bg-white/6 transition-colors text-left ${danger ? 'text-red-400' : ''}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-500/15' : 'bg-white/6'}`}>
        <Icon size={16} className={danger ? 'text-red-400' : color} />
      </div>
      <span className={`flex-1 text-[15px] font-medium ${danger ? 'text-red-400' : 'text-white'}`}>{label}</span>
      {value && <span className="text-[13px] text-white/35 mr-1">{value}</span>}
      {right ?? <ChevronRight size={14} className="text-white/20" />}
    </motion.button>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <motion.button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-amber-400' : 'bg-white/15'}`}
      whileTap={{ scale: 0.93 }}>
      <motion.div animate={{ x: value ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
    </motion.button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] px-4 mb-1">{title}</p>
      <div className="bg-white/[0.04] rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
        {children}
      </div>
    </div>
  );
}

/* ── Theme Picker ───────────────────────────────────────────── */
const THEMES = [
  { id: 'nexus-dark', label: 'Nexus Dark', colors: ['#080C14', '#2979FF', '#FF1744', '#FFB300'] },
  { id: 'midnight', label: 'Midnight', colors: ['#050508', '#5C6BC0', '#E91E63', '#FFF176'] },
  { id: 'forest', label: 'Forest', colors: ['#071409', '#2E7D32', '#FF6F00', '#A5D6A7'] },
  { id: 'ocean', label: 'Ocean', colors: ['#00050A', '#0288D1', '#00BFA5', '#B3E5FC'] },
];

function ThemePicker() {
  const [active, setActive] = useState('nexus-dark');
  return (
    <div className="px-4 py-3 flex gap-3">
      {THEMES.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)}
          className={`flex-1 h-14 rounded-2xl overflow-hidden border-2 transition-all ${active === t.id ? 'border-amber-400 scale-105' : 'border-transparent'}`}
          title={t.label}>
          <div className="h-full grid grid-cols-2 grid-rows-2">
            {t.colors.map((c, i) => <div key={i} style={{ background: c }} />)}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ── MAIN ───────────────────────────────────────────────────── */
export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { name, medicalInfo } = useUserStore();

  const completion = Math.round(
    ([name, medicalInfo.bloodGroup, medicalInfo.allergies, medicalInfo.conditions, medicalInfo.age].filter(Boolean).length / 5) * 100
  );

  const [toggles, setToggles] = useState({
    alertSounds: true, locationShare: true, offlineMode: false,
    voiceNav: false, deafMode: false, highStress: false, haptic: true,
  });
  const tog = (k: keyof typeof toggles) => setToggles(t => ({ ...t, [k]: !t[k] }));

  return (
    <div className="min-h-screen bg-[#080C14] pb-32 overflow-y-auto">
      {/* header */}
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
      </div>

      {/* profile card */}
      <div className="mx-4 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white font-black text-2xl shrink-0">
            {(name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-[18px] font-black text-white">{name || 'Guest User'}</h2>
            <p className="text-[12px] text-white/40 mt-0.5">Emergency Intelligence OS</p>
            <button onClick={() => navigate('/profile')}
              className="mt-2 px-3 py-1 rounded-xl border border-white/15 text-[12px] text-white/60 font-bold hover:bg-white/5 transition-all">
              Edit Profile
            </button>
          </div>
        </div>
        {/* completion bar */}
        <div>
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-white/40">Profile Completeness</span>
            <span className="text-amber-400 font-bold">{completion}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${completion}%` }} transition={{ duration: 1 }}
              className="h-full rounded-full bg-amber-400" />
          </div>
        </div>
      </div>

      {/* ACCOUNT */}
      <Section title="Account">
        <Row icon={Phone} label="Phone Number" value="+91 98765 43210" color="text-green-400" onClick={() => {}} />
        <Row icon={User} label="Medical Profile" color="text-red-400" onClick={() => navigate('/medical-profile')} />
        <Row icon={Shield} label="Trusted Contacts" color="text-amber-400" onClick={() => navigate('/emergency-contacts')} />
        <Row icon={Languages} label="WhatsApp Notifications" color="text-emerald-400" onClick={() => navigate('/whatsapp-connect')} />
      </Section>

      {/* APPEARANCE */}
      <Section title="Appearance">
        <div className="py-1">
          <p className="text-[12px] text-white/40 px-4 pt-2 pb-1">Theme</p>
          <ThemePicker />
        </div>
        <div className="flex items-center px-4 py-3 gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center shrink-0">
            <Languages size={16} className="text-purple-400" />
          </div>
          <span className="flex-1 text-[15px] text-white">Language</span>
          <div className="flex gap-2">
            {['EN', 'हि', 'த'].map(l => (
              <button key={l} className="px-3 py-1.5 rounded-xl bg-white/8 text-white/60 text-[13px] font-bold hover:bg-amber-400/20 hover:text-amber-400 transition-all">
                {l}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* SAFETY */}
      <Section title="Safety">
        <Row icon={Bell} label="Emergency Alert Sounds" color="text-red-400"
          right={<Toggle value={toggles.alertSounds} onChange={() => tog('alertSounds')} />} />
        <Row icon={MapPin} label="Location Sharing" color="text-blue-400"
          right={<Toggle value={toggles.locationShare} onChange={() => tog('locationShare')} />} />
        <Row icon={Moon} label="Offline Mode" color="text-purple-400"
          right={<Toggle value={toggles.offlineMode} onChange={() => tog('offlineMode')} />} />
        <Row icon={Bell} label="Notification Settings" color="text-orange-400" onClick={() => navigate('/notification-settings')} />
      </Section>

      {/* ACCESSIBILITY */}
      <Section title="Accessibility">
        <Row icon={Mic} label="Voice Navigation" color="text-amber-400"
          right={<Toggle value={toggles.voiceNav} onChange={() => tog('voiceNav')} />} />
        <Row icon={Eye} label="Deaf Mode" color="text-blue-400"
          right={<Toggle value={toggles.deafMode} onChange={() => tog('deafMode')} />} />
        <Row icon={AlertTriangle} label="High Stress Auto-Mode" color="text-orange-400"
          right={<Toggle value={toggles.highStress} onChange={() => tog('highStress')} />} />
        <Row icon={Shield} label="Haptic Feedback" color="text-green-400"
          right={<Toggle value={toggles.haptic} onChange={() => tog('haptic')} />} />
      </Section>

      {/* HELP */}
      <Section title="Help">
        <Row icon={HelpCircle} label="How to Use ROADSoS" color="text-blue-400" onClick={() => {}} />
        <Row icon={Info} label="FAQ" color="text-purple-400" onClick={() => {}} />
        <Row icon={AlertTriangle} label="Report a Bug" color="text-amber-400" onClick={() => {}} />
        <Row icon={Phone} label="Contact Support" color="text-green-400" onClick={() => {}} />
      </Section>

      {/* LEGAL */}
      <Section title="Legal">
        <Row icon={Shield} label="Privacy Policy" color="text-blue-400" onClick={() => navigate('/privacy')} />
        <Row icon={ExternalLink} label="Terms of Service" color="text-white/50" onClick={() => {}} />
        <Row icon={ExternalLink} label="Data Export" color="text-white/50" onClick={() => {}} />
        <Row icon={Trash2} label="Delete Account" danger onClick={() => {}} />
      </Section>

      {/* ABOUT */}
      <Section title="About">
        <Row icon={Info} label="Version" value="1.0.0-beta" color="text-white/40" onClick={() => {}} />
        <Row icon={Star} label="ROADSoS Team" color="text-amber-400" onClick={() => {}} />
        <Row icon={Github} label="GitHub" color="text-white/60" onClick={() => window.open('https://github.com', '_blank')} />
      </Section>

      {/* LOGOUT */}
      <div className="px-4 mt-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/login')}
          className="w-full py-4 rounded-2xl bg-red-600/15 border border-red-500/25 text-red-400 font-black text-[15px] flex items-center justify-center gap-2">
          <LogOut size={18} /> Sign Out
        </motion.button>
      </div>
    </div>
  );
};

export default SettingsScreen;
