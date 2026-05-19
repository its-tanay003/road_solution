import type { Metadata } from 'next';
import { Settings, User, Bell, Shield, Globe, Palette, Smartphone, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Settings — ROADSoS',
  description: 'Manage your profile, emergency contacts, and app preferences.',
};

const SETTINGS_SECTIONS = [
  {
    title: 'Profile',
    icon: User,
    items: [
      { label: 'Personal Information', desc: 'Name, phone, address', href: '/settings/profile' },
      { label: 'Medical Profile', desc: 'Blood group, conditions, allergies', href: '/settings/medical' },
      { label: 'Emergency Contacts', desc: 'Add or edit emergency contacts', href: '/settings/contacts' },
    ],
  },
  {
    title: 'SOS Settings',
    icon: Shield,
    items: [
      { label: 'SOS Sensitivity', desc: 'Hold duration, shake threshold', href: '/settings/sos' },
      { label: 'Privacy Controls', desc: 'What to share during SOS', href: '/settings/privacy' },
      { label: 'Connected Devices', desc: 'CarPlay, Android Auto, wearables', href: '/settings/devices' },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      { label: 'Push Notifications', desc: 'SOS alerts, nearby incidents', href: '/settings/notifications' },
      { label: 'Alert Sounds', desc: 'Alarm volume and ringtone', href: '/settings/sounds' },
    ],
  },
  {
    title: 'App Preferences',
    icon: Palette,
    items: [
      { label: 'Language', desc: 'English, Hindi, Gujarati, and 7 more', href: '/settings/language' },
      { label: 'Theme', desc: 'Light, Dark, or Auto', href: '/settings/theme' },
      { label: 'Voice Commands', desc: 'Wake word and language', href: '/settings/voice' },
    ],
  },
  {
    title: 'Data & Privacy',
    icon: Globe,
    items: [
      { label: 'Export My Data', desc: 'Download all your data', href: '/settings/export' },
      { label: 'Delete Account', desc: 'Permanently remove your account', href: '/settings/delete', danger: true },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-700 flex items-center justify-center">
            <Settings size={18} className="text-gray-300" />
          </div>
          <h1 className="font-black text-white text-xl">Settings</h1>
        </div>
      </header>

      {/* Profile quick card */}
      <div className="px-5 pt-5">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gray-700 flex items-center justify-center text-2xl">
            <User size={24} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white">Guest User</p>
            <p className="text-gray-500 text-xs">Complete your profile to enable SOS features</p>
          </div>
          <button className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold">Edit</button>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.title}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={13} className="text-gray-500" />
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{section.title}</h2>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  {section.items.map((item, idx) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-4 px-4 py-4 hover:bg-gray-800 transition-colors ${
                        idx < section.items.length - 1 ? 'border-b border-gray-800' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${(item as { danger?: boolean }).danger ? 'text-red-400' : 'text-white'}`}>
                          {item.label}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                      </div>
                      <Smartphone size={14} className="text-gray-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* App info */}
        <div className="text-center mt-8 text-gray-600 text-xs space-y-1">
          <p>ROADSoS v1.0.0</p>
          <p>Built for emergencies. Stay safe.</p>
        </div>
      </div>
    </div>
  );
}
