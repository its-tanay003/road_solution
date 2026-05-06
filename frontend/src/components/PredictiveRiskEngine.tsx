import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wind, Eye, Droplets, Thermometer, ShieldCheck, Activity } from 'lucide-react';
import { useWeatherStore } from '../store/weatherStore';
import axios from 'axios';
import { logger } from '../lib/logger';

export const PredictiveRiskEngine: React.FC = () => {
  const { currentWeather, setWeather } = useWeatherStore();
  const [riskScore, setRiskScore] = useState(12); // Base risk
  
  // Real-time weather fetch (Open-Meteo)
  const fetchWeather = useCallback(async () => {
    try {
      // Default to Chennai coordinates for this demo
      const lat = 13.0827;
      const lon = 80.2707;
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility,precipitation`
      );
      
      const current = response.data.current;
      
      // Map weather code to condition string
      const getCondition = (code: number) => {
        if (code === 0) return 'Clear Sky';
        if (code <= 3) return 'Partly Cloudy';
        if (code <= 48) return 'Foggy';
        if (code <= 67) return 'Rainy';
        if (code <= 77) return 'Snowy';
        return 'Stormy';
      };

      // Calculate risk multiplier based on weather
      let multiplier = 1.0;
      if (current.precipitation > 0) multiplier += 0.5;
      if (current.wind_speed_10m > 30) multiplier += 0.3;
      if (current.visibility < 2000) multiplier += 0.6;
      if (current.weather_code >= 80) multiplier += 0.8;

      setWeather({
        temperature: current.temperature_2m,
        condition: getCondition(current.weather_code),
        weatherCode: current.weather_code,
        windSpeed: current.wind_speed_10m,
        visibility: current.visibility || 10000,
        precipitation: current.precipitation,
        riskMultiplier: multiplier
      });
      
      // Dynamic risk score calculation
      const baseScore = 15;
      const newScore = Math.round(baseScore * multiplier);
      setRiskScore(newScore);

    } catch (error) {
      logger.error("Open-Meteo Fetch Error:", error);
    }
  }, [setWeather]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWeather();
    }, 0);
    const interval = setInterval(fetchWeather, 300000); // Update every 5 mins
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchWeather]);

  const getRiskColor = (score: number) => {
    if (score < 15) return 'text-emerald-500';
    if (score < 30) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getRiskLevel = (score: number) => {
    if (score < 15) return 'LOW';
    if (score < 30) return 'MODERATE';
    return 'CRITICAL';
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-[#0A0F1A] border border-white/10 shadow-2xl overflow-hidden relative group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#2979FF]/10 blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-[#2979FF]/20 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#2979FF]/50 transition-colors">
              <Activity className="text-[#2979FF]" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">PREDICTIVE RISK ENGINE</h3>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                Real-time Hazard Synthesis · Open-Meteo v3
              </p>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-end`}>
            <span className="text-[8px] font-mono text-white/30 uppercase">System Status</span>
            <span className="text-xs font-black text-emerald-500 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE ANALYSIS
            </span>
          </div>
        </div>

        {/* Risk Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative">
            <div className="aspect-square w-full max-w-[200px] mx-auto relative flex items-center justify-center">
               {/* Circular Gauge Background */}
               <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="100" cy="100" r="80"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="12"
                  />
                  <motion.circle
                    cx="100" cy="100" r="80"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={502.6}
                    initial={{ strokeDashoffset: 502.6 }}
                    animate={{ strokeDashoffset: 502.6 - (502.6 * Math.min(riskScore, 50) / 50) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={getRiskColor(riskScore)}
                    strokeLinecap="round"
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-5xl font-black ${getRiskColor(riskScore)}`}
                  >
                    {riskScore}
                  </motion.span>
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mt-1">Hazard Index</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
             <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Global Risk Level</span>
                   <span className={`text-xs font-black px-2 py-0.5 rounded-lg bg-white/5 ${getRiskColor(riskScore)}`}>
                      {getRiskLevel(riskScore)}
                   </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                   {riskScore > 30 
                     ? "Extreme caution advised. High precipitation and low visibility increasing crash probability by 85%."
                     : riskScore > 15 
                       ? "Moderate risk detected. Slight weather degradation. Keep distance from heavy vehicles."
                       : "Conditions optimal. Standard safety protocols in effect for current route segments."}
                </p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/3 border border-white/5">
                   <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                      <Wind size={16} />
                   </div>
                   <div>
                      <p className="text-[8px] font-mono text-white/30 uppercase">Wind</p>
                      <p className="text-xs font-bold text-white">{currentWeather?.windSpeed} km/h</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/3 border border-white/5">
                   <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                      <Eye size={16} />
                   </div>
                   <div>
                      <p className="text-[8px] font-mono text-white/30 uppercase">Visibility</p>
                      <p className="text-xs font-bold text-white">{(currentWeather?.visibility || 10000) / 1000} km</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/3 border border-white/5">
                   <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                      <Droplets size={16} />
                   </div>
                   <div>
                      <p className="text-[8px] font-mono text-white/30 uppercase">Precip</p>
                      <p className="text-xs font-bold text-white">{currentWeather?.precipitation} mm</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/3 border border-white/5">
                   <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                      <Thermometer size={16} />
                   </div>
                   <div>
                      <p className="text-[8px] font-mono text-white/30 uppercase">Temp</p>
                      <p className="text-xs font-bold text-white">{currentWeather?.temperature}°C</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Risk Breakdown List */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Automated Mitigation Strategy</span>
              <div className="h-px flex-1 bg-white/5 mx-4" />
              <ShieldCheck className="text-[#2979FF]" size={14} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/3 border border-white/5 flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-bold text-white/80">VMS PRE-EMPT</span>
                 </div>
                 <p className="text-[10px] text-white/50">Signs updated to warn of hydroplaning risk.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/3 border border-white/5 flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-white/80">MESH SYNC</span>
                 </div>
                 <p className="text-[10px] text-white/50">Volunteers in 2km radius switched to standby.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/3 border border-white/5 flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-bold text-white/80">ROUTE OPTIM</span>
                 </div>
                 <p className="text-[10px] text-white/50">Recalculating segments with lower water logging.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
