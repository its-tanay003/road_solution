import { Router } from 'express';
import { pool } from '../db/connection';

const router = Router();

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

export default router;
