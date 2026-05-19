import type { Metadata } from 'next';
import { EmergencyMap } from '@/components/map/EmergencyMap';
import { MapPin, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Emergency Map — ROADSoS',
  description: 'Real-time map of hospitals, police, fire stations, and accident hotspots.',
};

export default function MapPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-950 pb-16">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-14 pb-3 border-b border-gray-800 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <MapPin size={18} className="text-blue-400" />
        </div>
        <div className="flex-1">
          <h1 className="font-black text-white text-base">Emergency Map</h1>
          <p className="text-gray-500 text-xs">Hospitals · Police · Fire · Pharmacies</p>
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <Layers size={13} />
          <span>Toggle layers</span>
        </div>
      </header>

      {/* Map fills remaining space */}
      <div className="flex-1 p-3">
        <EmergencyMap />
      </div>
    </div>
  );
}
