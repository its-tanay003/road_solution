// Predictive Risk Engine (Simulated)

export const calculateRiskScore = (lat: number, lng: number): number => {
  // In a real system, this would query a PostGIS database of past incidents,
  // cross-reference with live traffic APIs (e.g., Google Maps Traffic),
  // and check weather APIs (e.g., OpenWeather).
  
  // Simulation: Generate a deterministic pseudo-random risk score based on coordinates
  const baseRisk = Math.abs(Math.sin(lat * 100) * Math.cos(lng * 100)) * 100;
  
  // Add time-of-day factor (e.g., 2 AM is riskier than 2 PM)
  const hour = new Date().getHours();
  let timeMultiplier = 1.0;
  if (hour >= 22 || hour <= 4) {
    timeMultiplier = 1.5; // High risk at night
  } else if (hour >= 7 && hour <= 9) {
    timeMultiplier = 1.3; // Rush hour
  }

  // Cap at 100
  const finalScore = Math.min(Math.round(baseRisk * timeMultiplier), 100);
  
  return finalScore;
};

// Generate heat map points for a given viewport bounding box
export const getRiskHeatmap = (minLat: number, maxLat: number, minLng: number, maxLng: number) => {
  // Simulate 20 high-risk points within the bounds
  const points = [];
  for (let i = 0; i < 20; i++) {
    const lat = minLat + Math.random() * (maxLat - minLat);
    const lng = minLng + Math.random() * (maxLng - minLng);
    const intensity = calculateRiskScore(lat, lng) / 100;
    
    if (intensity > 0.5) {
      points.push({ lat, lng, intensity });
    }
  }
  return points;
};
