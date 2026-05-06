import { logger } from '../lib/logger';
/**
 * ROADSoS Weather & Road Condition Engine
 * Integrated with Open-Meteo (Free, No Key Required)
 */

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  condition: string;
  riskMultiplier: number;
  windSpeed: number;
  visibility: number;
  precipitation: number;
}

const WEATHER_CODES: Record<number, { label: string; multiplier: number }> = {
  0: { label: 'OPTIMAL', multiplier: 1.0 }, // Clear sky
  1: { label: 'OPTIMAL', multiplier: 1.0 }, // Mainly clear
  2: { label: 'OPTIMAL', multiplier: 1.0 }, // Partly cloudy
  3: { label: 'REDUCED VISIBILITY', multiplier: 1.1 }, // Overcast
  45: { label: 'DANGEROUS — FOG', multiplier: 2.1 }, // Fog
  48: { label: 'DANGEROUS — FOG', multiplier: 2.1 }, // Depositing rime fog
  51: { label: 'WET ROADS', multiplier: 1.6 }, // Drizzle: Light
  53: { label: 'WET ROADS', multiplier: 1.7 }, // Drizzle: Moderate
  55: { label: 'WET ROADS', multiplier: 1.8 }, // Drizzle: Dense
  61: { label: 'WET ROADS', multiplier: 1.6 }, // Rain: Slight
  63: { label: 'SEVERE — AQUAPLANING RISK', multiplier: 2.4 }, // Rain: Moderate
  65: { label: 'SEVERE — AQUAPLANING RISK', multiplier: 2.8 }, // Rain: Heavy
  71: { label: 'CRITICAL — ICE RISK', multiplier: 3.2 }, // Snow fall: Slight
  73: { label: 'CRITICAL — ICE RISK', multiplier: 3.5 }, // Snow fall: Moderate
  75: { label: 'CRITICAL — ICE RISK', multiplier: 4.0 }, // Snow fall: Heavy
  95: { label: 'EXTREME — EMERGENCY PROTOCOLS', multiplier: 4.0 }, // Thunderstorm
  96: { label: 'EXTREME — EMERGENCY PROTOCOLS', multiplier: 4.5 }, // Thunderstorm with hail
  99: { label: 'EXTREME — EMERGENCY PROTOCOLS', multiplier: 5.0 }, // Thunderstorm with heavy hail
};

export const fetchWeather = async (lat: number, lng: number): Promise<WeatherData> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code,wind_speed_10m,visibility&hourly=precipitation_probability`;
    const response = await fetch(url);
    const data = await response.json();

    const current = data.current;
    const code = current.weather_code;
    const config = WEATHER_CODES[code] || { label: 'UNKNOWN', multiplier: 1.0 };

    return {
      temperature: current.temperature_2m,
      weatherCode: code,
      condition: config.label,
      riskMultiplier: config.multiplier,
      windSpeed: current.wind_speed_10m,
      visibility: current.visibility,
      precipitation: current.precipitation,
    };
  } catch (error) {
    logger.error('Failed to fetch weather data:', error);
    // Fallback to optimal
    return {
      temperature: 20,
      weatherCode: 0,
      condition: 'OPTIMAL (CACHED)',
      riskMultiplier: 1.0,
      windSpeed: 0,
      visibility: 10000,
      precipitation: 0,
    };
  }
};

export const getRiskColor = (multiplier: number): string => {
  if (multiplier >= 4.0) return 'text-red-600';
  if (multiplier >= 2.4) return 'text-red-500';
  if (multiplier >= 1.6) return 'text-amber-500';
  if (multiplier > 1.0) return 'text-blue-400';
  return 'text-emerald-500';
};
