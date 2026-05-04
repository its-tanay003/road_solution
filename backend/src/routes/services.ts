import { Router } from 'express';
import { pool } from '../db/connection';

import axios from 'axios';

const router = Router();

// Get nearby services from Google Places API
router.get('/nearby-google', async (req, res) => {
  const { lat, lng, radius = '10000' } = req.query;
  const KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  if (!KEY || KEY === 'your_google_places_api_key_here') {
    return res.status(500).json({ error: 'Google Places API Key is not configured' });
  }

  const types = [
    { type: 'hospital', label: 'Hospital', icon: 'hospital' },
    { type: 'police', label: 'Police Station', icon: 'police' },
    { type: 'fire_station', label: 'Fire Station', icon: 'fire' },
    { type: 'pharmacy', label: 'Pharmacy', icon: 'pharmacy' }
  ];

  try {
    const results = await Promise.all(types.map(async t => {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${t.type}&key=${KEY}`;
      const r = await axios.get(url);
      
      const places = r.data.results || [];
      
      return await Promise.all(places.map(async (p: any) => {
        let details: any = {};
        
        // Fetch extra details for hospitals or if specifically requested
        if (t.type === 'hospital') {
          try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=formatted_phone_number,website,photos,formatted_address&key=${KEY}`;
            const dr = await axios.get(detailsUrl);
            details = dr.data.result || {};
          } catch (detailsErr) {
            console.error(`Failed to fetch details for ${p.place_id}:`, detailsErr);
          }
        }

        return {
          id: p.place_id,
          name: p.name,
          type: t.label,
          icon: t.icon,
          lat: p.geometry.location.lat,
          lng: p.geometry.location.lng,
          address: details.formatted_address || p.vicinity,
          rating: p.rating,
          user_ratings_total: p.user_ratings_total,
          isOpen: p.opening_hours?.open_now,
          phone: details.formatted_phone_number || null,
          website: details.website || null,
          photo: details.photos?.[0]?.photo_reference 
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${details.photos[0].photo_reference}&key=${KEY}`
            : null
        };
      }));
    }));

    res.json({ 
      services: results.flat(), 
      fetchedAt: new Date().toISOString(), 
      source: 'Google Places API' 
    });
  } catch (err) {
    console.error('Google Places API Error:', err);
    res.status(500).json({ error: 'Failed to fetch data from Google Places' });
  }
});

// Get nearby services
router.get('/nearby', async (req, res) => {
  const { lat, lng, radius, type } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const searchRadius = radius ? parseInt(radius as string) * 1000 : 50000; // default 50km
  
  try {
    let query = `
      SELECT id, name, type, phone_primary, phone_secondary, address, 
             capabilities, is_24x7,
             ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat,
             ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000 AS distance_km
      FROM emergency_services
      WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
        AND is_active = true
    `;
    const params: any[] = [lng, lat, searchRadius];

    if (type) {
      query += ` AND type = $4`;
      params.push(type);
    }

    query += ` ORDER BY distance_km ASC LIMIT 50`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch nearby services' });
  }
});

// District pack for offline caching
router.get('/district-pack/:district', async (req, res) => {
  const { district } = req.params;
  
  try {
    const { rows } = await pool.query(`
      SELECT id, name, type, phone_primary, address, capabilities,
             ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat
      FROM emergency_services
      WHERE (district ILIKE $1 OR address ILIKE $1) AND is_active = true
    `, [`%${district}%`]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch district pack' });
  }
});

// Get nearby vehicle services from Google Places API
router.get('/vehicle-services', async (req, res) => {
  const { lat, lng, radius = '10000' } = req.query;
  const KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  if (!KEY || KEY === 'your_google_places_api_key_here') {
    return res.status(500).json({ error: 'Google Places API Key is not configured' });
  }

  const categories = [
    { id: 'Towing', type: 'establishment', keyword: 'towing service car recovery', label: 'Towing Service', icon: 'truck' },
    { id: 'Puncture', keyword: 'tyre puncture repair shop', label: 'Puncture Shop', icon: 'wrench' },
    { id: 'Showroom', type: 'car_dealer', label: 'Car Showroom', icon: 'car' },
    { id: 'Fuel', type: 'gas_station', label: 'Petrol Pump', icon: 'fuel' },
    { id: 'Mechanic', keyword: 'car mechanic automobile repair', label: 'Mechanic', icon: 'tool' }
  ];

  try {
    const results = await Promise.all(categories.map(async cat => {
      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${KEY}`;
      if (cat.type) url += `&type=${cat.type}`;
      if (cat.keyword) url += `&keyword=${encodeURIComponent(cat.keyword)}`;

      const r = await axios.get(url);
      const places = r.data.results || [];
      
      return await Promise.all(places.map(async (p: any) => {
        let details: any = {};
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=formatted_phone_number,website,formatted_address&key=${KEY}`;
          const dr = await axios.get(detailsUrl);
          details = dr.data.result || {};
        } catch (detailsErr) {
          console.error(`Failed to fetch details for ${p.place_id}:`, detailsErr);
        }

        return {
          id: p.place_id,
          name: p.name,
          category: cat.id,
          type: cat.label,
          icon: cat.icon,
          lat: p.geometry.location.lat,
          lng: p.geometry.location.lng,
          address: details.formatted_address || p.vicinity,
          rating: p.rating,
          user_ratings_total: p.user_ratings_total,
          isOpen: p.opening_hours?.open_now,
          phone: details.formatted_phone_number || null,
          website: details.website || null
        };
      }));
    }));

    res.json({ 
      services: results.flat(), 
      fetchedAt: new Date().toISOString(), 
      source: 'Google Places API' 
    });
  } catch (err) {
    console.error('Google Places Vehicle Services Error:', err);
    res.status(500).json({ error: 'Failed to fetch vehicle services' });
  }
});

// Get nearby services from OpenStreetMap (Overpass API)
router.get('/nearby-osm', async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="police"](around:${radius},${lat},${lng});
      node["amenity"="fire_station"](around:${radius},${lat},${lng});
      node["amenity"="pharmacy"](around:${radius},${lat},${lng});
      node["shop"="tyres"](around:${radius},${lat},${lng});
      node["shop"="car_repair"](around:${radius},${lat},${lng});
      node["amenity"="fuel"](around:${radius},${lat},${lng});
      node["shop"="car"](around:${radius},${lat},${lng});
    );
    out body;
    >;
    out skel qt;
  `;
  
  try {
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      { headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ROADSoS-Emergency-App/1.0'
      } }
    );
    
    const elements = response.data.elements
      .filter((e: any) => e.tags && (e.tags.name || e.tags['name:en']))
      .map((e: any) => ({
        id: `osm-${e.id}`,
        name: e.tags.name || e.tags['name:en'] || 'Unnamed Service',
        type: mapAmenityType(e.tags.amenity || e.tags.shop),
        icon: mapAmenityIcon(e.tags.amenity || e.tags.shop),
        lat: e.lat || e.center?.lat,
        lng: e.lon || e.center?.lon,
        phone: e.tags.phone || e.tags['contact:phone'] || null,
        address: [
          e.tags['addr:house_number'],
          e.tags['addr:street'],
          e.tags['addr:suburb'],
          e.tags['addr:city']
        ].filter(Boolean).join(', ') || 'Address not listed',
        website: e.tags.website || null,
        source: 'OpenStreetMap',
        osmId: e.id,
        fetchedAt: new Date().toISOString()
      }));
    
    res.json({ 
      services: elements, 
      results: elements, // Alias for frontend compatibility
      source: 'OpenStreetMap via Overpass API', 
      fetchedAt: new Date().toISOString(),
      count: elements.length 
    });
  } catch (err) {
    console.error('OSM Overpass API Error:', err);
    res.status(500).json({ error: 'Failed to fetch data from OpenStreetMap' });
  }
});

function mapAmenityType(amenity: string) {
  const map: Record<string, string> = { 
    hospital: 'Hospital', 
    police: 'Police Station', 
    fire_station: 'Fire Station', 
    pharmacy: 'Pharmacy', 
    fuel: 'Petrol Pump', 
    tyres: 'Puncture Shop', 
    car_repair: 'Mechanic', 
    car: 'Car Showroom' 
  };
  return map[amenity] || amenity;
}

function mapAmenityIcon(amenity: string) {
  const map: Record<string, string> = { 
    hospital: 'hospital', 
    police: 'police', 
    fire_station: 'fire', 
    pharmacy: 'pharmacy', 
    fuel: 'fuel', 
    tyres: 'wrench', 
    car_repair: 'tool', 
    car: 'car' 
  };
  return map[amenity] || 'map-pin';
}

export default router;
