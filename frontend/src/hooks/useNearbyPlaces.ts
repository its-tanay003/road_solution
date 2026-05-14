import { useState, useEffect, useRef } from 'react';
import { useMapDataStore } from '../store/mapDataStore';
import type { MapPlace, ServiceLayerType } from '../store/mapDataStore';

const LAYER_CONFIGS: Record<ServiceLayerType, { gmapTypes: string[], overpassQuery: string }> = {
  hospitals: { gmapTypes: ['hospital'], overpassQuery: 'node["amenity"="hospital"]' },
  clinics: { gmapTypes: ['doctor', 'health'], overpassQuery: 'node["amenity"~"clinic|doctors"]' },
  pharmacies: { gmapTypes: ['pharmacy'], overpassQuery: 'node["amenity"="pharmacy"]' },
  police: { gmapTypes: ['police'], overpassQuery: 'node["amenity"="police"]' },
  fire: { gmapTypes: ['fire_station'], overpassQuery: 'node["amenity"="fire_station"]' },
  fuel: { gmapTypes: ['gas_station'], overpassQuery: 'node["amenity"="fuel"]' },
  atms: { gmapTypes: ['atm'], overpassQuery: 'node["amenity"="atm"]' },
  // These require custom/mock handling or specific overpass
  bloodBanks: { gmapTypes: [], overpassQuery: 'node["amenity"="blood_bank"]' },
  ambulances: { gmapTypes: [], overpassQuery: '' }, // Simulated
  tolls: { gmapTypes: [], overpassQuery: 'node["barrier"="toll_booth"]' },
  blackSpots: { gmapTypes: [], overpassQuery: '' }, // Static data
  hazards: { gmapTypes: [], overpassQuery: '' }, // Real-time sockets
};

interface OverpassElement {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export const useNearbyPlaces = (lat: number | null, lng: number | null, mapInstance: google.maps.Map | null) => {
  const { activeLayers, searchRadius, cachePlaces, getCachedPlaces } = useMapDataStore();
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchCounter = useRef(0);

  useEffect(() => {
    if (!lat || !lng) return;

    const fetchPlaces = async () => {
      setIsLoading(true);
      const currentSearchId = ++searchCounter.current;
      let allResults: MapPlace[] = [];

      for (const layer of Array.from(activeLayers)) {
        // Skip layers that don't use standard Places/Overpass search
        if (['ambulances', 'blackSpots', 'hazards'].includes(layer)) continue;

        const cacheKey = `${layer}-${lat.toFixed(3)}-${lng.toFixed(3)}-${searchRadius}`;
        const cached = getCachedPlaces(cacheKey);

        if (cached) {
          allResults = [...allResults, ...cached];
          continue;
        }

        const config = LAYER_CONFIGS[layer];
        let layerResults: MapPlace[] = [];

        // Check if Google Maps is available and API key is present
        // `mapInstance` implies Google Maps loaded properly
        if (mapInstance && window.google && window.google.maps && window.google.maps.places && config.gmapTypes.length > 0) {
          try {
            const service = new window.google.maps.places.PlacesService(mapInstance);
            
            // Note: nearbySearch allows multiple types using keyword, but 'type' only accepts one.
            // For simplicity in this demo, we'll search the first type.
            const request: google.maps.places.PlaceSearchRequest = {
              location: new window.google.maps.LatLng(lat, lng),
              radius: searchRadius,
              type: config.gmapTypes[0],
            };

            const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
              service.nearbySearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                  resolve(results);
                } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                  resolve([]);
                } else {
                  reject(status);
                }
              });
            });

            layerResults = results.map(p => ({
              id: p.place_id || Math.random().toString(),
              name: p.name || 'Unknown',
              lat: p.geometry?.location?.lat() || 0,
              lng: p.geometry?.location?.lng() || 0,
              type: layer,
              address: p.vicinity,
              rating: p.rating,
              isOpen: p.opening_hours?.isOpen(),
            }));
          } catch (err) {
            console.error(`GMap Places API error for ${layer}`, err);
          }
        } 
        
        // Fallback to Overpass API if Google Maps failed or wasn't available
        if (layerResults.length === 0 && config.overpassQuery) {
          try {
            const query = `[out:json];${config.overpassQuery}(around:${searchRadius},${lat},${lng});out 15;`;
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data && data.elements) {
              layerResults = data.elements.map((el: OverpassElement) => ({
                id: el.id.toString(),
                name: el.tags?.name || `Unknown ${layer}`,
                lat: el.lat,
                lng: el.lon,
                type: layer,
                address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || '',
                phone: el.tags?.phone || el.tags?.['contact:phone'],
              }));
            }
          } catch (err) {
            console.error(`Overpass API error for ${layer}`, err);
          }
        }

        if (layerResults.length > 0) {
          cachePlaces(cacheKey, layerResults);
          allResults = [...allResults, ...layerResults];
        }
      }

      // Add simulated Ambulances if active
      if (activeLayers.has('ambulances')) {
        const simulatedAmbulances: MapPlace[] = Array.from({ length: 5 }).map((_, i) => ({
          id: `amb-${i}`,
          name: `108 EMRI Unit ${i + 1}`,
          lat: lat + (Math.random() - 0.5) * (searchRadius / 111000),
          lng: lng + (Math.random() - 0.5) * (searchRadius / 111000),
          type: 'ambulances',
          mockData: { status: Math.random() > 0.5 ? 'Available' : 'Dispatched' }
        }));
        allResults = [...allResults, ...simulatedAmbulances];
      }

      // Avoid setting state if a newer search has already started
      if (searchCounter.current === currentSearchId) {
        setPlaces(allResults);
        setIsLoading(false);
      }
    };

    // Debounce the search slightly
    const timer = setTimeout(() => {
      fetchPlaces();
    }, 500);

    return () => clearTimeout(timer);
  }, [lat, lng, activeLayers, searchRadius, mapInstance, cachePlaces, getCachedPlaces]);

  return { places, isLoading };
};

