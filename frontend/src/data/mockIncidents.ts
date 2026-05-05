export interface RoadIncident {
  id: string;
  timestamp: string;
  lat: number;
  lng: number;
  severity: 'minor' | 'major' | 'critical';
  gForce: number;
  type: string;
}

const CHENNAI_COORDS = { lat: 13.0827, lng: 80.2707 };

export const mockIncidents: RoadIncident[] = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(i / 5));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  
  return {
    id: `INC-${1000 + i}`,
    timestamp: date.toISOString(),
    lat: CHENNAI_COORDS.lat + (Math.random() - 0.5) * 0.1,
    lng: CHENNAI_COORDS.lng + (Math.random() - 0.5) * 0.1,
    severity: i % 10 === 0 ? 'critical' : i % 3 === 0 ? 'major' : 'minor',
    gForce: 5 + Math.random() * 15,
    type: i % 4 === 0 ? 'Rear-end' : i % 3 === 0 ? 'Head-on' : 'Skid'
  };
});
