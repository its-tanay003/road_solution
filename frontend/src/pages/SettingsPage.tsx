import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Phone, Mail, Globe, 
  MessageCircle, Users, Bell, MapPin, Shield, Palette, 
  HelpCircle, Info, LogOut, ChevronRight, CheckCircle2, AlertTriangle,
  Volume2, Vibrate as Vibration, Download, Trash2, Camera, Mic, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAccessibilityStore } from '../store/accessibilityStore';
import type { FontSize, Theme, Language } from '../store/accessibilityStore';
import { PhoneOTPModal } from '../components/PhoneOTPModal';
import { EmailAuthModal } from '../components/EmailAuthModal';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-8">
    <h3 className="px-6 mb-2 text-[10px] font-bold tracking-[0.2em] text-(--clr-text-2) uppercase">
      {title}
    </h3>
    <div className="bg-white/5 border-y border-white/10 overflow-hidden">
      {children}
    </div>
  </div>
);

const Row = ({ 
  icon: Icon, 
  label, 
  value, 
  right, 
  onClick, 
  danger 
}: { 
  icon: React.ElementType, 
  label: string, 
  value?: string, 
  right?: React.ReactNode, 
  onClick?: () => void,
  danger?: boolean
}) => {
  const baseClass = `w-full flex items-center gap-4 px-6 py-4 transition-colors border-b border-white/5 last:border-0 text-left`;
  const content = (
    <>
      <div className={`p-2 rounded-lg ${danger ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-(--clr-text-2)'}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${danger ? 'text-red-500' : 'text-(--clr-text)'}`}>{label}</p>
        {value && <p className="text-xs text-(--clr-text-2) mt-0.5">{value}</p>}
      </div>
      {right || <ChevronRight size={18} className="text-(--clr-text-2) opacity-50" />}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`${baseClass} hover:bg-white/5 cursor-pointer`}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClass}>{content}</div>;
};

const Toggle = ({ active, onToggle, label }: { active: boolean, onToggle: () => void, label: string }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    aria-label={label}
    aria-pressed={active}
    className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-(--clr-blue)' : 'bg-white/10'}`}
  >
    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
);

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, googleConnected, instagramConnected, whatsappNumber, trustedContacts, logout } = useAuthStore();
  const { 
    fontSize, setFontSize, theme, setTheme, 
    language, setLanguage, simplifiedMode, setSimplifiedMode 
  } = useAccessibilityStore();

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';


  return (
    <div className="min-h-screen bg-(--clr-bg) text-(--clr-text) pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-(--clr-bg)/80 backdrop-blur-md border-b border-(--clr-border) px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            aria-label="Go back to home"
            title="Go back to home"
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold tracking-tight font-space">SETTINGS</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-(--clr-saffron) flex items-center justify-center text-white font-bold">
          {initials}
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-8">
        {/* Section 1: Account */}
        <Section title="Account">
          <div className="px-6 py-6 flex items-center gap-4 border-b border-white/5">
            <div className="w-16 h-16 rounded-full bg-(--clr-saffron) flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold">{user?.name}</h4>
              <p className="text-sm text-(--clr-text-2)">{user?.email || user?.phone || 'Emergency Profile'}</p>
            </div>
            <button 
              type="button"
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors"
            >
              Edit Profile
            </button>
          </div>

          <Row 
            icon={Phone} 
            label="Phone Number" 
            value={user?.phone || 'Not connected'}
            right={user?.phone ? <div className="flex items-center gap-1.5 text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full"><CheckCircle2 size={12} /> Verified</div> : <button type="button" onClick={() => setIsPhoneModalOpen(true)} className="text-(--clr-blue) text-xs font-bold hover:underline">Connect</button>}
            onClick={() => !user?.phone && setIsPhoneModalOpen(true)}
          />
          <Row 
            icon={Mail} 
            label="Email Address" 
            value={user?.email || 'Not connected'}
            right={user?.email ? <div className="flex items-center gap-1.5 text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full"><CheckCircle2 size={12} /> Verified</div> : <button type="button" onClick={() => setIsEmailModalOpen(true)} className="text-(--clr-blue) text-xs font-bold hover:underline">Connect</button>}
            onClick={() => !user?.email && setIsEmailModalOpen(true)}
          />
          <Row 
            icon={Globe} 
            label="Google Account" 
            value={googleConnected ? 'Connected' : 'Not connected'}
            onClick={() => !googleConnected && window.alert('Google Auth integration coming soon in production.')}
          />
          <Row 
            icon={Globe} 
            label="Instagram" 
            value={instagramConnected ? 'Connected' : 'For emergency photo sharing'}
            onClick={() => !instagramConnected && window.alert('Instagram integration coming soon.')}
          />
          <Row 
            icon={MessageCircle} 
            label="WhatsApp" 
            value={whatsappNumber || 'Connect for emergency alerts'}
            onClick={() => navigate('/settings/whatsapp')}
          />
          <Row 
            icon={Users} 
            label="Trusted Contacts" 
            value={`${trustedContacts.length} trusted contacts`}
            onClick={() => navigate('/settings/trusted-contacts')}
          />
        </Section>

        {/* Section 2: Notifications */}
        <Section title="Notifications">
          <Row 
            icon={Bell} 
            label="Emergency SOS Alerts" 
            right={<div className="flex items-center gap-2"><Toggle label="Toggle SOS Alerts" active={true} onToggle={() => {}} /><Info size={14} className="text-(--clr-text-2)" /></div>}
          />
          <Row 
            icon={MapPin} 
            label="Nearby Crash Alerts" 
            right={<Toggle label="Toggle Nearby Crash Alerts" active={true} onToggle={() => {}} />}
          />
          <Row 
            icon={Activity} 
            label="Volunteer Dispatch Alerts" 
            right={<Toggle label="Toggle Volunteer Dispatch Alerts" active={false} onToggle={() => {}} />}
          />
          <Row 
            icon={Volume2} 
            label="Notification Sound" 
            value="Default"
          />
          <Row 
            icon={Vibration} 
            label="Notification Vibration" 
            right={<Toggle label="Toggle Notification Vibration" active={true} onToggle={() => {}} />}
          />
        </Section>

        {/* Section 3: Location & Privacy */}
        <Section title="Location & Privacy">
          <Row 
            icon={MapPin} 
            label="Location Sharing" 
            value="Always"
            right={<ChevronRight size={18} className="text-(--clr-text-2) opacity-50" />}
          />
          <div className="px-6 py-3 bg-amber-500/10 border-y border-amber-500/20 flex gap-3 items-start">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-500 leading-tight">
              Location is set to "Always". This is required for real-time crash detection. 
              Changing this may significantly increase response times during incidents.
            </p>
          </div>
          <Row 
            icon={Shield} 
            label="Consent Management" 
            onClick={() => navigate('/settings/consent')}
          />
          <Row 
            icon={Download} 
            label="Download My Data" 
            onClick={() => {
              const data = JSON.stringify({ user, trustedContacts, accessibility: { fontSize, theme, language } }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'roadsos-data-export.json';
              a.click();
            }}
          />
          <Row 
            icon={Trash2} 
            label="Delete My Account" 
            danger
            onClick={() => navigate('/settings/delete-account')}
          />
        </Section>

        {/* Section 4: Appearance */}
        <Section title="Appearance">
          <div className="px-6 py-4 border-b border-white/5">
            <p className="text-xs font-bold text-(--clr-text-2) mb-3 uppercase tracking-wider">Theme</p>
            <div className="flex gap-3">
              {(['dark', 'light', 'high-contrast', 'saffron'] as Theme[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all capitalize text-xs font-bold ${
                    theme === t ? 'border-(--clr-blue) bg-(--clr-blue)/10' : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {t.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="px-6 py-4 border-b border-white/5">
            <p className="text-xs font-bold text-(--clr-text-2) mb-3 uppercase tracking-wider">Text Size</p>
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
              {(['sm', 'md', 'lg', 'xl', 'xxl'] as FontSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFontSize(s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    fontSize === s ? 'bg-(--clr-blue) text-white shadow-lg' : 'hover:bg-white/5 text-(--clr-text-2)'
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <Row 
            icon={Palette} 
            label="Simplified Mode" 
            right={<Toggle label="Toggle Simplified Mode" active={simplifiedMode} onToggle={() => setSimplifiedMode(!simplifiedMode)} />}
          />
          <div className="px-6 py-4">
            <p className="text-xs font-bold text-(--clr-text-2) mb-3 uppercase tracking-wider">Language</p>
            <div className="grid grid-cols-3 gap-2">
              {(['en', 'hi', 'ta', 'te', 'bn'] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`py-2.5 rounded-xl border transition-all text-sm font-bold ${
                    language === l ? 'border-(--clr-blue) bg-(--clr-blue)/10 text-(--clr-text)' : 'border-white/5 bg-white/5 text-(--clr-text-2)'
                  }`}
                >
                  {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : l === 'ta' ? 'தமிழ்' : l === 'te' ? 'తెలుగు' : 'বাংলা'}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Section 5: Permissions */}
        <Section title="App Permissions">
          <Row icon={MapPin} label="Location" value="Always allowed" right={<button type="button" className="text-xs font-bold text-(--clr-blue)">Manage</button>} />
          <Row icon={Camera} label="Camera" value="Allowed" />
          <Row icon={Mic} label="Microphone" value="Allowed" />
          <Row icon={Bell} label="Notifications" value="Allowed" />
          <Row icon={Activity} label="Motion & Fitness" value="Allowed" />
        </Section>

        {/* Section 6: Help & Support */}
        <Section title="Help & Support">
          <Row icon={HelpCircle} label="How to Use ROADSoS" onClick={() => navigate('/settings/help')} />
          <Row icon={Info} label="FAQ" onClick={() => navigate('/settings/faq')} />
          <Row icon={AlertTriangle} label="Report a Bug" onClick={() => window.open('mailto:support@roadsos.in?subject=Bug Report')} />
          <Row icon={Shield} label="Good Samaritan Law Guide" onClick={() => navigate('/good-samaritan')} />
          <Row icon={Lock} label="Privacy Policy" onClick={() => navigate('/privacy')} />
        </Section>

        {/* Section 7: About */}
        <Section title="About">
          <div className="px-6 py-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-(--clr-text-2)">App Version</span>
              <span className="text-sm font-mono text-(--clr-blue)">2.0.0 (SIH 2026)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-(--clr-text-2)">Build Status</span>
              <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">STABLE</span>
            </div>
            <div className="pt-2">
              <p className="text-[10px] text-(--clr-text-2) leading-relaxed">
                ROADSoS is an Open Source project developed for the Smart India Hackathon 2026. 
                Acknowledging support from MoRTH, 108 GVK EMRI, and IIT Madras.
              </p>
            </div>
          </div>
        </Section>

        <button 
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-3 py-6 text-red-500 font-bold hover:bg-red-500/5 transition-colors"
        >
          <LogOut size={20} />
          LOG OUT
        </button>
      </main>

      {/* Modals */}
      <PhoneOTPModal isOpen={isPhoneModalOpen} onClose={() => setIsPhoneModalOpen(false)} />
      <EmailAuthModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />

      {/* Logout Confirmation */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-1000 flex items-end justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm bg-(--clr-bg) border border-(--clr-border) rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-2">Log Out?</h3>
              <p className="text-sm text-(--clr-text-2) mb-6">
                Your emergency profile will remain saved on this device, but you will not receive real-time cloud alerts.
              </p>
              <div className="space-y-3">
                <button 
                  type="button"
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all"
                >
                  LOG OUT
                </button>
                <button 
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-(--clr-text) font-bold rounded-xl transition-all"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Lock = Shield; // Alias for lucide-react if needed or just use Shield
