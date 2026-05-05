import { create } from 'zustand';

export interface WeatherData {
  temperature: number;
  condition: string;
  weatherCode: number;
  windSpeed: number;
  visibility: number;
  precipitation: number;
  riskMultiplier: number;
}

interface WeatherState {
  currentWeather: WeatherData | null;
  setWeather: (data: WeatherData) => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  currentWeather: {
    temperature: 28,
    condition: 'Clear Sky',
    weatherCode: 0,
    windSpeed: 12,
    visibility: 10000,
    precipitation: 0,
    riskMultiplier: 1.0
  },
  setWeather: (data) => set({ currentWeather: data }),
}));
