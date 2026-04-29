-- Delhi
INSERT INTO emergency_services (name, type, location, phone_primary, address, district, state, capabilities, is_24x7) VALUES
('AIIMS Delhi Trauma Centre', 'hospital', ST_SetSRID(ST_MakePoint(77.2100, 28.5672), 4326), '011-26588500', 'Ansari Nagar East, New Delhi', 'South Delhi', 'Delhi', '["trauma","icu","neurosurgery"]', true),
('Safdarjung Hospital', 'hospital', ST_SetSRID(ST_MakePoint(77.2028, 28.5688), 4326), '011-26707444', 'Ansari Nagar West, New Delhi', 'South Delhi', 'Delhi', '["trauma","burns","icu"]', true),
('Delhi Ambulance 102', 'ambulance', ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326), '102', 'Delhi NCR', 'New Delhi', 'Delhi', '["basic_life_support"]', true),
('Delhi Traffic Police Control', 'police', ST_SetSRID(ST_MakePoint(77.2177, 28.6304), 4326), '1095', 'Todarmal Road', 'New Delhi', 'Delhi', '["traffic_management"]', true),
('Highway Rescue Towing', 'towing', ST_SetSRID(ST_MakePoint(77.3910, 28.5355), 4326), '+91-9876543210', 'Noida Link Road', 'East Delhi', 'Delhi', '["heavy_towing"]', false);

-- Mumbai
INSERT INTO emergency_services (name, type, location, phone_primary, address, district, state, capabilities, is_24x7) VALUES
('LTMG Hospital (Sion Hospital)', 'hospital', ST_SetSRID(ST_MakePoint(72.8624, 19.0381), 4326), '022-24076381', 'Sion West, Mumbai', 'Mumbai City', 'Maharashtra', '["trauma","icu"]', true),
('KEM Hospital', 'hospital', ST_SetSRID(ST_MakePoint(72.8406, 19.0028), 4326), '022-24107000', 'Parel, Mumbai', 'Mumbai City', 'Maharashtra', '["cardiology","trauma"]', true),
('Mumbai Ambulance 108', 'ambulance', ST_SetSRID(ST_MakePoint(72.8258, 18.9750), 4326), '108', 'Mumbai Metropolitan Region', 'Mumbai City', 'Maharashtra', '["advanced_life_support"]', true),
('Mumbai Traffic Police', 'police', ST_SetSRID(ST_MakePoint(72.8184, 19.0163), 4326), '8454999999', 'Worli', 'Mumbai City', 'Maharashtra', '["traffic_management"]', true),
('Western Express Towing', 'towing', ST_SetSRID(ST_MakePoint(72.8533, 19.1202), 4326), '+91-9876543211', 'Andheri East', 'Mumbai Suburban', 'Maharashtra', '["flatbed_towing"]', false);

-- Bengaluru
INSERT INTO emergency_services (name, type, location, phone_primary, address, district, state, capabilities, is_24x7) VALUES
('Victoria Hospital', 'hospital', ST_SetSRID(ST_MakePoint(77.5739, 12.9634), 4326), '080-26701150', 'Fort Road, Bengaluru', 'Bengaluru Urban', 'Karnataka', '["burns","trauma"]', true),
('Bowring Hospital', 'hospital', ST_SetSRID(ST_MakePoint(77.6033, 12.9814), 4326), '080-25591362', 'Shivajinagar, Bengaluru', 'Bengaluru Urban', 'Karnataka', '["general","icu"]', true),
('Bengaluru Ambulance', 'ambulance', ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326), '108', 'Bengaluru City', 'Bengaluru Urban', 'Karnataka', '["advanced_life_support"]', true),
('Bengaluru Traffic Police', 'police', ST_SetSRID(ST_MakePoint(77.5913, 12.9791), 4326), '080-22942811', 'Infantry Road', 'Bengaluru Urban', 'Karnataka', '["traffic_management"]', true),
('Silk Board Rescue Towing', 'towing', ST_SetSRID(ST_MakePoint(77.6223, 12.9176), 4326), '+91-9876543212', 'Silk Board Junction', 'Bengaluru Urban', 'Karnataka', '["two_wheeler_towing"]', true);
