'use client';

import { Phone, MapPin, ExternalLink } from 'lucide-react';
import { HeaderControls } from '@/components/nav/HeaderControls';
import { useTranslation } from 'react-i18next';

const EMERGENCY_SERVICES = [
  // National Helplines
  { category: 'National Helplines', categoryKey: 'directory.nationalHelplines', entries: [
    { name: 'Universal Emergency', number: '112', type: 'universal', note: 'All emergencies — pan-India' },
    { name: 'Ambulance', number: '108', type: 'medical', note: 'Medical emergencies' },
    { name: 'Police', number: '100', type: 'police', note: 'Law & order' },
    { name: 'Fire Brigade', number: '101', type: 'fire', note: 'Fire emergencies' },
    { name: 'Disaster Management', number: '1078', type: 'disaster', note: 'NDRF — natural disasters' },
    { name: 'Women Helpline', number: '181', type: 'helpline', note: 'Women in distress' },
    { name: 'Child Helpline', number: '1098', type: 'helpline', note: 'Children in need' },
    { name: 'Senior Citizen', number: '14567', type: 'helpline', note: 'Elder care helpline' },
    { name: 'Mental Health', number: 'iCall: 9152987821', type: 'mental', note: '24/7 psychological support' },
    { name: 'Suicide Prevention', number: 'Vandrevala: 1860-2662-345', type: 'mental', note: '24/7 crisis support' },
    { name: 'Coast Guard', number: '1554', type: 'rescue', note: 'Maritime emergencies' },
    { name: 'Road Accident', number: '1033', type: 'road', note: 'Highway patrol / NHAI' },
  ]},
  // International (for travellers)
  { category: 'International', categoryKey: 'directory.international', entries: [
    { name: 'USA Emergency', number: '911', type: 'universal', note: 'Police, fire, medical' },
    { name: 'UK Emergency', number: '999', type: 'universal', note: 'All emergencies' },
    { name: 'EU Emergency', number: '112', type: 'universal', note: 'All EU countries' },
    { name: 'Australia', number: '000', type: 'universal', note: 'Police, fire, ambulance' },
    { name: 'UAE', number: '999', type: 'universal', note: 'Police emergency' },
  ]},
];

const TYPE_COLORS: Record<string, string> = {
  universal: '#ef4444',
  medical: '#10b981',
  police: '#3b82f6',
  fire: '#f97316',
  disaster: '#f59e0b',
  helpline: '#8b5cf6',
  mental: '#6366f1',
  rescue: '#0ea5e9',
  road: '#6b7280',
};

const TYPE_EMOJI: Record<string, string> = {
  universal: '🆘',
  medical: '🏥',
  police: '👮',
  fire: '🚒',
  disaster: '⛑️',
  helpline: '☎️',
  mental: '🧠',
  rescue: '⚓',
  road: '🛣️',
};

export default function DirectoryPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-5 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Phone size={18} className="text-purple-400" />
            </div>
            <div>
              <h1 className="font-black text-white text-xl">{t('directory.title', 'Emergency Directory')}</h1>
              <p className="text-gray-500 text-xs">{t('directory.subtitle', 'Pan-India + International helplines')}</p>
            </div>
          </div>
          <HeaderControls />
        </div>
      </header>

      <div className="px-5 py-5 space-y-6">
        {EMERGENCY_SERVICES.map((section) => (
          <section key={section.category}>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              {t(section.categoryKey, section.category)}
            </h2>
            <div className="space-y-2">
              {section.entries.map((entry) => {
                const color = TYPE_COLORS[entry.type] ?? '#6b7280';
                const emoji = TYPE_EMOJI[entry.type] ?? '📞';
                const isDialable = /^\d+$/.test(entry.number);
                const entrySlug = entry.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

                return (
                  <div
                    key={entry.name}
                    className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3"
                  >
                    <span className="text-xl shrink-0">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">
                        {t(`directory.entry.${entrySlug}`, entry.name)}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {t(`directory.entryNote.${entrySlug}`, entry.note)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-sm text-(--entry-color)" style={{ '--entry-color': color } as React.CSSProperties}>{entry.number}</span>
                      {isDialable ? (
                        <a
                          href={`tel:${entry.number}`}
                          className="w-8 h-8 rounded-xl flex items-center justify-center [background:var(--entry-bg)]"
                          style={{ '--entry-bg': `${color}22`, '--entry-color': color } as React.CSSProperties}
                          aria-label={`Call ${entry.name}`}
                        >
                          <Phone size={14} className="text-(--entry-color)" />
                        </a>
                      ) : (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-800">
                          <ExternalLink size={12} className="text-gray-500" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Report / Suggest */}
        <div className="bg-blue-950/40 border border-blue-800/50 rounded-2xl p-4 text-center">
          <MapPin size={20} className="text-blue-400 mx-auto mb-2" />
          <p className="text-blue-200 text-sm font-medium">
            {t('directory.suggestTitle', "Know a local helpline we're missing?")}
          </p>
          <p className="text-blue-400 text-xs mt-1">
            {t('directory.suggestDesc', 'Crowd-sourced updates coming soon')}
          </p>
        </div>
      </div>
    </div>
  );
}
