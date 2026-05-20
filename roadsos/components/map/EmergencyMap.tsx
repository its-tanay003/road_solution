'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, HeatmapLayer, Circle } from '@react-google-maps/api';
import { useSOSStore } from '@/lib/store/sosStore';
import { useSearchParams } from 'next/navigation';
import { Shield, Flame, Cross, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';


const LIBRARIES: ('places' | 'visualization' | 'geometry')[] = ['places', 'visualization', 'geometry'];

type LayerType = 'hospitals' | 'police' | 'fire' | 'pharmacy' | 'accidents';

interface PlaceResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: LayerType;
  phone?: string;
  address?: string;
  open?: boolean;
  rating?: number;
}

const LAYER_CONFIG: Record<LayerType, { label: string; icon: React.ElementType; color: string; placeType: string }> = {
  hospitals: { label: 'Hospitals', icon: Cross, color: '#ef4444', placeType: 'hospital' },
  police: { label: 'Police', icon: Shield, color: '#3b82f6', placeType: 'police' },
  fire: { label: 'Fire', icon: Flame, color: '#f97316', placeType: 'fire_station' },
  pharmacy: { label: 'Pharmacy', icon: Cross, color: '#10b981', placeType: 'pharmacy' },
  accidents: { label: 'Accidents', icon: AlertTriangle, color: '#f59e0b', placeType: '' },
};

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f0f0f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c1c1c' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#222' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#001f3f' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

// Mock accident heatmap data (clearly labelled as simulated)
const MOCK_ACCIDENT_POINTS = [
  { lat: 28.6139, lng: 77.2090, weight: 10 }, // Delhi
  { lat: 19.0760, lng: 72.8777, weight: 8 },  // Mumbai
  { lat: 12.9716, lng: 77.5946, weight: 7 },  // Bangalore
  { lat: 22.5726, lng: 88.3639, weight: 9 },  // Kolkata
  { lat: 17.3850, lng: 78.4867, weight: 6 },  // Hyderabad
];

// Helper to fetch OpenStreetMap features as a fallback when Google Places fails/is offline
async function fetchOSMPlaces(lat: number, lng: number, layers: Set<LayerType>): Promise<PlaceResult[]> {
  const overpassTypes: string[] = [];
  if (layers.has('hospitals')) overpassTypes.push('hospital');
  if (layers.has('police')) overpassTypes.push('police');
  if (layers.has('fire')) overpassTypes.push('fire_station');
  if (layers.has('pharmacy')) overpassTypes.push('pharmacy');

  if (overpassTypes.length === 0) return [];

  const aroundRadius = 5000;
  const queries = overpassTypes.map(type => `
    node["amenity"="${type}"](around:${aroundRadius}, ${lat}, ${lng});
    way["amenity"="${type}"](around:${aroundRadius}, ${lat}, ${lng});
  `).join('\n');

  const query = `[out:json][timeout:15];
(
${queries}
);
out center;`;

  try {
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Overpass API returned non-200');
    const data = await response.json();
    
    return (data.elements || []).map((el: any) => {
      let type: LayerType = 'hospitals';
      if (el.tags?.amenity === 'police') type = 'police';
      if (el.tags?.amenity === 'fire_station') type = 'fire';
      if (el.tags?.amenity === 'pharmacy') type = 'pharmacy';

      const elementLat = el.lat ?? el.center?.lat ?? lat;
      const elementLng = el.lon ?? el.center?.lon ?? lng;

      return {
        id: `osm-${el.type}-${el.id}`,
        name: el.tags?.name || el.tags?.operator || `${LAYER_CONFIG[type].label} (OSM)`,
        lat: elementLat,
        lng: elementLng,
        type: type,
        address: el.tags?.['addr:street'] 
          ? `${el.tags?.['addr:housenumber'] || ''} ${el.tags?.['addr:street']}, ${el.tags?.['addr:city'] || ''}`
          : 'OpenStreetMap Data',
        phone: el.tags?.phone || el.tags?.['contact:phone'],
        rating: undefined,
      };
    });
  } catch (error) {
    console.error('[OSM Fallback] Error querying Overpass:', error);
    return [];
  }
}

export function EmergencyMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries: LIBRARIES,
  });

  const [, setMap] = useState<google.maps.Map | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const [activeLayers, setActiveLayers] = useState<Set<LayerType>>(new Set(['hospitals', 'police']));
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [sharedPin, setSharedPin] = useState<{ lat: number; lng: number; label: string } | null>(null);
  
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null);
  const { location: sosLocation } = useSOSStore();
  const searchParams = useSearchParams();

  // Handle ?find= query param from voice commands (e.g. "Find nearest hospital")
  useEffect(() => {
    if (!searchParams) return;
    const find = searchParams.get('find');
    if (!find) return;
    const layerMap: Record<string, LayerType> = {
      hospital: 'hospitals',
      hospitals: 'hospitals',
      police: 'police',
      fire: 'fire',
      pharmacy: 'pharmacy',
    };
    const layer = layerMap[find.toLowerCase()];
    if (layer) {
      setActiveLayers(new Set([layer]));
    }
  }, [searchParams]);

  // Parse share target parameters
  useEffect(() => {
    if (searchParams) {
      const title = searchParams.get('title');
      const text = searchParams.get('text');
      const url = searchParams.get('url');
      const queryLat = searchParams.get('lat');
      const queryLng = searchParams.get('lng');

      if (queryLat && queryLng) {
        const lat = parseFloat(queryLat);
        const lng = parseFloat(queryLng);
        if (!isNaN(lat) && !isNaN(lng)) {
          setSharedPin({ lat, lng, label: 'Shared Pin' });
          return;
        }
      }

      const combined = `${title || ''} ${text || ''} ${url || ''}`;
      const coordMatch = combined.match(/(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          setSharedPin({ lat, lng, label: title || 'Shared Emergency Location' });
        }
      }
    }
  }, [searchParams]);

  // Watch user location
  useEffect(() => {
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracy(pos.coords.accuracy);
      },
      () => setUserPos({ lat: 28.6139, lng: 77.2090 }), // fallback: Delhi
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  const onMapLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
    serviceRef.current = new google.maps.places.PlacesService(m);
  }, []);

  // Search nearby places for active layers (Google Places with OSM Fallback)
  useEffect(() => {
    const centerPos = userPos || (sharedPin ? { lat: sharedPin.lat, lng: sharedPin.lng } : null);
    if (!centerPos) return;

    const layersToFetch = Array.from(activeLayers).filter((l) => l !== 'accidents');
    if (layersToFetch.length === 0) {
      setPlaces([]);
      return;
    }

    if (!serviceRef.current) {
      // If Google Places service is not loaded yet (or fails/offline), immediately query OSM fallback!
      fetchOSMPlaces(centerPos.lat, centerPos.lng, activeLayers).then((osmResults) => {
        if (osmResults.length > 0) setPlaces(osmResults);
      });
      return;
    }

    const newPlaces: PlaceResult[] = [];
    let completedRequests = 0;

    layersToFetch.forEach((layerType) => {
      const cfg = LAYER_CONFIG[layerType];
      serviceRef.current!.nearbySearch(
        { location: centerPos, radius: 5000, type: cfg.placeType },
        async (results, status) => {
          completedRequests++;
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.slice(0, 8).forEach((r) => {
              newPlaces.push({
                id: r.place_id ?? crypto.randomUUID(),
                name: r.name ?? 'Unknown',
                lat: r.geometry?.location?.lat() ?? 0,
                lng: r.geometry?.location?.lng() ?? 0,
                type: layerType,
                address: r.vicinity,
                open: r.opening_hours?.isOpen?.(),
                rating: r.rating,
              });
            });
          }

          // Once all requests return, check if empty. If so, query OSM Overpass fallback.
          if (completedRequests === layersToFetch.length) {
            if (newPlaces.length === 0) {
              console.log('[Map] Google Places returned empty. Requesting OSM Overpass fallback...');
              const osmResults = await fetchOSMPlaces(centerPos.lat, centerPos.lng, activeLayers);
              setPlaces(osmResults);
            } else {
              setPlaces(newPlaces);
            }
          }
        }
      );
    });
  }, [activeLayers, userPos, sharedPin]);

  const toggleLayer = (layer: LayerType) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  };

  const heatmapData = activeLayers.has('accidents') && isLoaded
    ? MOCK_ACCIDENT_POINTS.map((p) => ({ location: new google.maps.LatLng(p.lat, p.lng), weight: p.weight }))
    : [];

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950 rounded-2xl">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading Map…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col rounded-2xl overflow-hidden border border-gray-800">
      {/* Layer toggles */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
        {(Object.entries(LAYER_CONFIG) as [LayerType, typeof LAYER_CONFIG[LayerType]][]).map(([type, cfg]) => {
          const Icon = cfg.icon;
            const active = activeLayers.has(type);
            const activeClass = {
              hospitals: 'text-white border-red-500 bg-red-500/80',
              police: 'text-white border-blue-500 bg-blue-500/80',
              fire: 'text-white border-orange-500 bg-orange-500/80',
              pharmacy: 'text-white border-emerald-500 bg-emerald-500/80',
              accidents: 'text-white border-amber-500 bg-amber-500/80',
            }[type];
            return (
              <button
                key={type}
                onClick={() => toggleLayer(type)}
                aria-label={`${active ? 'Hide' : 'Show'} ${cfg.label}`}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all border',
                  active
                    ? activeClass
                    : 'bg-gray-900/80 text-gray-400 border-gray-700 hover:border-gray-500'
                )}
              >
                <Icon size={11} />
                {cfg.label}
              </button>
            );
        })}
      </div>

      {/* Accident disclaimer */}
      {activeLayers.has('accidents') && (
        <div className="absolute top-16 left-3 z-10 bg-yellow-900/80 text-yellow-200 text-[10px] px-2 py-1 rounded-lg border border-yellow-700 backdrop-blur-sm">
          ⚠ Simulated accident data
        </div>
      )}

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={
          sosLocation
            ? { lat: sosLocation.lat, lng: sosLocation.lng }
            : sharedPin
            ? { lat: sharedPin.lat, lng: sharedPin.lng }
            : userPos ?? { lat: 28.6139, lng: 77.2090 }
        }
        zoom={14}
        onLoad={onMapLoad}
        options={{
          styles: DARK_MAP_STYLE,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        }}
      >
        {/* User location */}
        {userPos && (
          <>
            <Marker
              position={userPos}
              icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }}
            />
            <Circle
              center={userPos}
              radius={accuracy}
              options={{ fillColor: '#3b82f6', fillOpacity: 0.08, strokeColor: '#3b82f6', strokeOpacity: 0.3, strokeWeight: 1 }}
            />
          </>
        )}

        {/* Shared Pin from PWA Share Target / Custom Coords */}
        {sharedPin && (
          <Marker
            position={{ lat: sharedPin.lat, lng: sharedPin.lng }}
            onClick={() => setSelectedPlace({
              id: 'shared-pin',
              name: sharedPin.label,
              lat: sharedPin.lat,
              lng: sharedPin.lng,
              type: 'hospitals',
              address: 'Shared location pin'
            })}
            icon={{
              url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="%23a855f7" stroke="white" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
              scaledSize: new google.maps.Size(36, 36),
            }}
          />
        )}

        {/* SOS Location pin */}
        {sosLocation && (
          <Marker
            position={{ lat: sosLocation.lat, lng: sosLocation.lng }}
            icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 14, fillColor: '#ef4444', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 }}
            animation={google.maps.Animation.BOUNCE}
          />
        )}

        {/* Place markers */}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            onClick={() => setSelectedPlace(place)}
            icon={{
              url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${LAYER_CONFIG[place.type].color.replace('#', '%23')}" stroke="white" stroke-width="2"/></svg>`,
              scaledSize: new google.maps.Size(28, 28),
            }}
          />
        ))}

        {/* Info window */}
        {selectedPlace && (
          <InfoWindow
            position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div className="p-2 min-w-[160px]">
              <p className="font-bold text-gray-900 text-sm">{selectedPlace.name}</p>
              {selectedPlace.address && <p className="text-gray-600 text-xs mt-0.5">{selectedPlace.address}</p>}
              {selectedPlace.rating && <p className="text-yellow-600 text-xs">★ {selectedPlace.rating}</p>}
              <div className="mt-2 flex gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Navigate
                </a>
                {selectedPlace.phone && (
                  <a href={`tel:${selectedPlace.phone}`} className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                    Call
                  </a>
                )}
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Accident heatmap */}
        {heatmapData.length > 0 && (
          <HeatmapLayer
            data={heatmapData}
            options={{ radius: 40, opacity: 0.7, gradient: ['rgba(0,0,0,0)', 'rgba(255,165,0,0.8)', 'rgba(255,0,0,1)'] }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
