'use client';

import { useState, useEffect } from 'react';
import {
  Settings, User, Bell, Shield, Globe, Palette,
  ChevronRight, Trash2, Phone, Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

// ── Types ──────────────────────────────────────────────────────
type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-' | 'Unknown';

interface EmergencyContact { name: string; phone: string; relation: string; }

interface UserPrefs {
  name: string;
  phone: string;
  bloodGroup: BloodGroup;
  shareLocation: boolean;
  shareMedical: boolean;
  shareCamera: boolean;
  sosHoldMs: number;
  shakeThreshold: number;
  language: string;
  theme: 'dark' | 'light' | 'auto';
  notifications: boolean;
  contacts: EmergencyContact[];
  conditions?: string;
  address?: string;
}

const DEFAULT_PREFS: UserPrefs = {
  name: '', phone: '', bloodGroup: 'Unknown',
  shareLocation: true, shareMedical: true, shareCamera: false,
  sosHoldMs: 3000, shakeThreshold: 4,
  language: 'en', theme: 'auto', notifications: true,
  contacts: [],
  conditions: '',
  address: '',
};

// ── Toggle component ───────────────────────────────────────────
function Toggle({ checked, onChange, id, label }: { checked: boolean; onChange: (v: boolean) => void; id: string; label: string }) {
  return (
    <button id={id} role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn('relative w-11 h-6 rounded-full transition-colors shrink-0',
        checked ? 'bg-red-600' : 'bg-gray-700'
      )}>
      <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
        checked ? 'left-6' : 'left-1'
      )} />
    </button>
  );
}

// ── Slider component ───────────────────────────────────────────
function Slider({ value, min, max, step, onChange, format, label }: {
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string; label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} step={step} value={value}
        aria-label={label}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-red-500 h-1.5"
      />
      <span className="text-white text-xs font-bold w-14 text-right shrink-0">
        {format ? format(value) : value}
      </span>
    </div>
  );
}

// ── Section wrapper ─────────────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={13} className="text-gray-500" />
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-800">
        {children}
      </div>
    </section>
  );
}

// ── Row helper ──────────────────────────────────────────────────
function Row({ label, desc, children, danger }: { label: string; desc?: string; children?: React.ReactNode; danger?: boolean }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', danger ? 'text-red-400' : 'text-white')}>{label}</p>
        {desc && <p className="text-gray-500 text-xs mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { i18n, t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newContact, setNewContact] = useState<EmergencyContact>({ name: '', phone: '', relation: '' });
  const [showAddContact, setShowAddContact] = useState(false);

  // Load active profile from /api/profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          const { profile, contacts } = data;
          
          if (profile) {
            setPrefs({
              name: profile.full_name || '',
              phone: profile.phone || '',
              bloodGroup: (profile.blood_group as BloodGroup) || 'Unknown',
              shareLocation: profile.share_location_in_sos ?? true,
              shareMedical: profile.share_medical_in_sos ?? true,
              shareCamera: profile.share_camera_in_sos ?? false,
              sosHoldMs: profile.sos_hold_duration ?? 3000,
              shakeThreshold: profile.sos_shake_threshold ?? 4,
              language: profile.language_preference || i18n.language || 'en',
              theme: (profile.theme_preference as UserPrefs['theme']) || (theme as UserPrefs['theme']) || 'auto',
              notifications: true,
              conditions: profile.medical_conditions?.join(', ') || '',
              address: profile.home_address || '',
              contacts: contacts.map((c: any) => ({
                name: c.name,
                phone: c.phone,
                relation: c.relationship || ''
              }))
            });

            if (profile.language_preference) {
              void i18n.changeLanguage(profile.language_preference);
            }
            if (profile.theme_preference) {
              setTheme(profile.theme_preference);
            }
          }
        }
      } catch (err) {
        console.error('[Settings] Error loading profile:', err);
        // Fallback to local storage
        const savedProfile = localStorage.getItem('roadsos-profile');
        if (savedProfile) {
          try {
            const parsed = JSON.parse(savedProfile);
            setPrefs(p => ({
              ...p,
              ...parsed,
              language: i18n.language || 'en',
              theme: (theme as UserPrefs['theme']) || 'auto',
            }));
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [i18n.language, theme, setTheme]);

  const update = <K extends keyof UserPrefs>(key: K, value: UserPrefs[K]) => {
    setPrefs(p => ({ ...p, [key]: value }));
    setSaved(false);

    // Apply immediately for locale and theme
    if (key === 'language') {
      void i18n.changeLanguage(value as string);
    } else if (key === 'theme') {
      setTheme(value as string);
    }
  };

  const handleSave = async () => {
    console.log('[Settings] Saving prefs:', prefs);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prefs.name,
          phone: prefs.phone,
          bloodGroup: prefs.bloodGroup,
          conditions: prefs.conditions || '',
          address: prefs.address || '',
          contacts: prefs.contacts
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save profile to database');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('roadsos-profile', JSON.stringify(prefs));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      window.dispatchEvent(new Event('roadsos-profile-updated'));
    } catch (err) {
      console.error('[Settings] Error saving profile:', err);
      alert('Failed to save profile. Please check your connection and try again.');
    }
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) return;
    update('contacts', [...prefs.contacts, newContact]);
    setNewContact({ name: '', phone: '', relation: '' });
    setShowAddContact(false);
  };

  const removeContact = (i: number) => {
    update('contacts', prefs.contacts.filter((_, idx) => idx !== i));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          <p className="text-sm font-black text-gray-400 tracking-tight animate-pulse">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-28">
      {/* Header */}
      <header className="px-5 pt-14 pb-5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-700 flex items-center justify-center">
            <Settings size={18} className="text-gray-300" />
          </div>
          <h1 className="font-black text-white text-xl">Settings</h1>
        </div>
        <button onClick={handleSave}
          aria-label="Save settings"
          className={cn('px-4 py-1.5 rounded-xl text-sm font-bold transition-all',
            saved ? 'bg-green-600 text-white' : 'bg-red-600 text-white hover:bg-red-500'
          )}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </header>

      <div className="px-5 pt-5 space-y-6">
        {/* Profile quick card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-700 flex items-center justify-center text-2xl shrink-0">
            <User size={24} className="text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white">{prefs.name || 'Set your name'}</p>
            <p className="text-gray-500 text-xs truncate">{prefs.phone || 'Add phone for SOS alerts'}</p>
          </div>
          <span className="text-xs bg-red-600/20 border border-red-600/40 text-red-300 rounded-xl px-2 py-1 font-semibold">{prefs.bloodGroup}</span>
        </div>

        {/* ── Profile ────────────────────────────────────────── */}
        <Section title="Profile" icon={User}>
          <Row label="Full Name" desc="Used in SOS alerts">
            <input
              value={prefs.name}
              onChange={e => update('name', e.target.value)}
              placeholder="Your name"
              aria-label="Full name"
              className="bg-transparent text-white text-sm text-right outline-none placeholder:text-gray-600 w-32"
            />
          </Row>
          <Row label="Phone" desc="For emergency callback">
            <input
              value={prefs.phone}
              onChange={e => update('phone', e.target.value)}
              placeholder="+91 …"
              type="tel"
              aria-label="Phone number"
              className="bg-transparent text-white text-sm text-right outline-none placeholder:text-gray-600 w-32"
            />
          </Row>
          <Row label="Blood Group">
            <select
              value={prefs.bloodGroup}
              onChange={e => update('bloodGroup', e.target.value as BloodGroup)}
              aria-label="Blood group"
              className="bg-gray-800 text-white text-sm rounded-xl px-2 py-1 border border-gray-700 outline-none"
            >
              {(['A+','A-','B+','B-','O+','O-','AB+','AB-','Unknown'] as BloodGroup[]).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Row>
          <Row label="Medical Conditions" desc="Allergies, chronic conditions">
            <input
              value={prefs.conditions || ''}
              onChange={e => update('conditions', e.target.value)}
              placeholder="e.g. Asthma, Penicillin"
              aria-label="Medical conditions"
              className="bg-transparent text-white text-sm text-right outline-none placeholder:text-gray-600 w-44 animate-pulse-subtle"
            />
          </Row>
          <Row label="Home Address" desc="For SOS reference">
            <input
              value={prefs.address || ''}
              onChange={e => update('address', e.target.value)}
              placeholder="123 Main St..."
              aria-label="Home address"
              className="bg-transparent text-white text-sm text-right outline-none placeholder:text-gray-600 w-44"
            />
          </Row>
        </Section>

        {/* ── Emergency Contacts ────────────────────────────── */}
        <Section title="Emergency Contacts" icon={Phone}>
          {prefs.contacts.length === 0 && (
            <Row label="No contacts added" desc="Add contacts to receive SOS alerts" />
          )}
          {prefs.contacts.map((c, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{c.name}</p>
                <p className="text-gray-500 text-xs">{c.phone} · {c.relation || 'Contact'}</p>
              </div>
              <button onClick={() => removeContact(i)} aria-label={`Remove ${c.name}`}
                className="w-7 h-7 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-red-900/40 transition-colors">
                <Trash2 size={12} className="text-gray-400" />
              </button>
            </div>
          ))}
          {showAddContact ? (
            <div className="px-4 py-3 space-y-2">
              <input value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))}
                placeholder="Name" aria-label="Contact name"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600" />
              <input value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 phone" type="tel" aria-label="Contact phone"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600" />
              <input value={newContact.relation} onChange={e => setNewContact(p => ({ ...p, relation: e.target.value }))}
                placeholder="Relationship (e.g. Sister)" aria-label="Contact relationship"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600" />
              <div className="flex gap-2">
                <button onClick={addContact} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold">Add</button>
                <button onClick={() => setShowAddContact(false)} className="flex-1 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddContact(true)}
              className="flex items-center gap-2 px-4 py-3 text-red-400 text-sm font-semibold hover:bg-gray-800 transition-colors w-full text-left">
              + Add Contact
            </button>
          )}
        </Section>

        {/* ── SOS Settings ──────────────────────────────────── */}
        <Section title="SOS Settings" icon={Shield}>
          <Row label="Hold Duration" desc={`${prefs.sosHoldMs / 1000}s to trigger`}>
            <div className="w-40">
              <Slider value={prefs.sosHoldMs} min={1000} max={5000} step={500}
                label="SOS hold duration in milliseconds"
                onChange={v => update('sosHoldMs', v)}
                format={v => `${v / 1000}s`} />
            </div>
          </Row>
          <Row label="Shake Sensitivity" desc="Shakes needed to trigger">
            <div className="w-40">
              <Slider value={prefs.shakeThreshold} min={2} max={8} step={1}
                label="Shake sensitivity threshold"
                onChange={v => update('shakeThreshold', v)} />
            </div>
          </Row>
        </Section>

        {/* ── Privacy ────────────────────────────────────────── */}
        <Section title="Privacy Controls" icon={Eye}>
          <Row label="Share Location" desc="GPS coordinates during SOS">
            <Toggle id="share-location" label="Share location during SOS" checked={prefs.shareLocation} onChange={v => update('shareLocation', v)} />
          </Row>
          <Row label="Share Medical Info" desc="Blood group, conditions">
            <Toggle id="share-medical" label="Share medical info during SOS" checked={prefs.shareMedical} onChange={v => update('shareMedical', v)} />
          </Row>
          <Row label="Share Camera" desc="Live video to responders">
            <Toggle id="share-camera" label="Share camera during SOS" checked={prefs.shareCamera} onChange={v => update('shareCamera', v)} />
          </Row>
        </Section>

        {/* ── Notifications ─────────────────────────────────── */}
        <Section title="Notifications" icon={Bell}>
          <Row label="Push Notifications" desc="SOS alerts, nearby incidents">
            <Toggle id="notifications" label="Enable push notifications" checked={prefs.notifications} onChange={v => update('notifications', v)} />
          </Row>
        </Section>

        {/* ── Preferences ───────────────────────────────────── */}
        <Section title="App Preferences" icon={Palette}>
          <Row label="Language">
            <select value={prefs.language} onChange={e => update('language', e.target.value)}
              aria-label="Language preference"
              className="bg-gray-800 text-white text-sm rounded-xl px-2 py-1 border border-gray-700 outline-none">
              {[
                ['en', 'English'],
                ['hi', 'हिंदी'],
                ['gu', 'ગુજરાતી'],
                ['es', 'Español'],
                ['fr', 'Français'],
                ['ar', 'العربية (RTL)'],
                ['pt', 'Português'],
                ['zh', '简体中文'],
                ['bn', 'বাংলা'],
                ['ru', 'Русский']
              ].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Row>
          <Row label="Theme">
            <select value={prefs.theme} onChange={e => update('theme', e.target.value as UserPrefs['theme'])}
              aria-label="Theme preference"
              className="bg-gray-800 text-white text-sm rounded-xl px-2 py-1 border border-gray-700 outline-none">
              <option value="auto">Auto</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </Row>
        </Section>

        {/* ── Danger Zone ───────────────────────────────────── */}
        <Section title="Data & Privacy" icon={Globe}>
          <a href="/settings/export"
            className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-800 transition-colors">
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Export My Data</p>
              <p className="text-gray-500 text-xs">Download all your data</p>
            </div>
            <ChevronRight size={14} className="text-gray-600" />
          </a>
          <button className="flex items-center gap-4 px-4 py-3.5 hover:bg-red-950/20 transition-colors w-full text-left"
            aria-label="Delete account">
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Delete Account</p>
              <p className="text-gray-500 text-xs">Permanently remove your account</p>
            </div>
            <Trash2 size={14} className="text-red-600" />
          </button>
        </Section>

        {/* App info */}
        <div className="text-center text-gray-600 text-xs space-y-1 pt-2">
          <p>ROADSoS v1.0.0 · Built for emergencies. Stay safe.</p>
          <p>© 2025 ROADSoS — All rights reserved</p>
        </div>
      </div>

      {/* Sticky save bar */}
      {!saved && prefs.name && (
        <motion.div
          initial={{ y: 80 }} animate={{ y: 0 }}
          className="fixed bottom-20 left-4 right-4 bg-gray-900 border border-gray-700 rounded-2xl p-3 flex items-center justify-between shadow-xl z-30">
          <p className="text-gray-300 text-sm">Unsaved changes</p>
          <button onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-sm font-bold">
            Save Now
          </button>
        </motion.div>
      )}
    </div>
  );
}
