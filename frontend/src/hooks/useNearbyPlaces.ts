import { useState, useCallback } from 'react'

export interface Place {
  id: string
  name: string
  lat: number
  lng: number
  type: 'hospital' | 'police' | 'fire_station' | 'pharmacy'
  distance?: number
  address?: string
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    amenity?: string;
    'addr:street'?: string;
    'addr:city'?: string;
  };
}

export const useNearbyPlaces = () => {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNearby = useCallback(async (lat: number, lng: number, radius = 5000) => {
    setLoading(true)
    setError(null)
    
    // Overpass QL query for hospitals, police stations, fire stations, and pharmacies
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="police"](around:${radius},${lat},${lng});
        node["amenity"="fire_station"](around:${radius},${lat},${lng});
        node["amenity"="pharmacy"](around:${radius},${lat},${lng});
        way["amenity"="hospital"](around:${radius},${lat},${lng});
        way["amenity"="police"](around:${radius},${lat},${lng});
        way["amenity"="fire_station"](around:${radius},${lat},${lng});
        way["amenity"="pharmacy"](around:${radius},${lat},${lng});
      );
      out body center;
    `

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      })

      if (!response.ok) throw new Error('Failed to fetch nearby places')

      const data = await response.json()
      
      const mappedPlaces: Place[] = data.elements.map((el: OverpassElement) => {
        const name = el.tags?.name || el.tags?.amenity?.replace('_', ' ') || 'Unknown'
        const type = el.tags?.amenity as Place['type']
        
        return {
          id: el.id.toString(),
          name: name.charAt(0).toUpperCase() + name.slice(1),
          lat: (el.lat || el.center?.lat) as number,
          lng: (el.lon || el.center?.lon) as number,
          type,
          address: el.tags?.['addr:street'] ? `${el.tags?.['addr:street']}, ${el.tags?.['addr:city'] || ''}` : undefined
        }
      })

      setPlaces(mappedPlaces)
    } catch (err) {
      console.error('Overpass error:', err)
      setError('Could not load nearby emergency services')
    } finally {
      setLoading(false)
    }
  }, [])

  return { places, loading, error, fetchNearby }
}
