'use client';

import { Suspense } from 'react';
import { EmergencyMap } from '@/components/map/EmergencyMap';
import { MapPin, Layers } from 'lucide-react';
import { HeaderControls } from '@/components/nav/HeaderControls';
import { useTranslation } from 'react-i18next';

export default function MapPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-screen bg-gray-950 pb-16">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-14 pb-3 border-b border-gray-800 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <MapPin size={18} className="text-blue-400" />
        </div>
        <div className="flex-1">
          <h1 className="font-black text-white text-base">{t('map.title', 'Emergency Map')}</h1>
          <p className="text-gray-500 text-xs">{t('map.subtitle', 'Hospitals · Police · Fire · Pharmacies')}</p>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Layers size={13} />
            <span>{t('map.toggleLayers', 'Toggle layers')}</span>
          </div>
          <HeaderControls />
        </div>
      </header>

      {/* Map fills remaining space */}
      <div className="flex-1 p-3">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center bg-gray-950 rounded-2xl border border-gray-800">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 text-sm font-semibold">{t('map.loading', 'Loading Map Container...')}</p>
            </div>
          </div>
        }>
          <EmergencyMap />
        </Suspense>
      </div>
    </div>
  );
}
