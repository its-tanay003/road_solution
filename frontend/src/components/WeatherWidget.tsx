import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudLightning, CloudSnow, Sun, Wind, Eye, Thermometer, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchWeather, type WeatherData, getRiskColor } from '../utils/weatherEngine';

export const WeatherWidget: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateWeather = async () => {
      const weather = await fetchWeather(lat, lng);
      setData(weather);
      setLoading(false);
    };

    updateWeather();
    const interval = setInterval(updateWeather, 300000); // 5 mins
    return () => clearInterval(interval);
  }, [lat, lng]);

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="text-amber-400" size={24} />;
    if (code <= 3) return <Cloud className="text-slate-400" size={24} />;
    if (code <= 48) return <Wind className="text-slate-300" size={24} />;
    if (code <= 67) return <CloudRain className="text-blue-400" size={24} />;
    if (code <= 77) return <CloudSnow className="text-blue-100" size={24} />;
    return <CloudLightning className="text-purple-400" size={24} />;
  };

  if (loading) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 h-48 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
    >
      {/* Background Decorative Blur */}
      <div className={`absolute -top-12 -right-12 w-24 h-24 blur-3xl opacity-20 transition-colors duration-1000 ${data.riskMultiplier > 2 ? 'bg-red-500' : 'bg-emerald-500'}`} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/5 p-2 rounded-xl">
            {getWeatherIcon(data.weatherCode)}
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atmosphere</div>
            <div className="text-lg font-black tracking-tighter uppercase italic">{data.temperature}°C</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Road Risk</div>
          <div className={`text-2xl font-black tracking-tighter ${getRiskColor(data.riskMultiplier)}`}>
            {data.riskMultiplier.toFixed(1)}x
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-2xl p-3 mb-4 flex items-center gap-3">
        <AlertTriangle size={16} className={getRiskColor(data.riskMultiplier)} />
        <div className="text-[10px] font-bold tracking-tight uppercase leading-tight">
          {data.condition}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center gap-1">
          <Wind size={14} className="text-slate-500" />
          <span className="text-[10px] font-mono font-bold text-slate-300">{data.windSpeed}km/h</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-x border-white/5">
          <Eye size={14} className="text-slate-500" />
          <span className="text-[10px] font-mono font-bold text-slate-300">{(data.visibility / 1000).toFixed(1)}km</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Thermometer size={14} className="text-slate-500" />
          <span className="text-[10px] font-mono font-bold text-slate-300">{data.precipitation}mm</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${data.riskMultiplier > 2 ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Live Satellite Data</span>
        </div>
        <span className="text-[8px] font-mono text-slate-600 uppercase">OM-V1-FORECAST</span>
      </div>
    </motion.div>
  );
};
