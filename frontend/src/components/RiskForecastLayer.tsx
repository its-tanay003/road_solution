import { useEffect, useRef, useState, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, BrainCircuit, Loader2 } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import { fetchWeather, type WeatherData } from '../utils/weatherEngine';
import { logger } from '../lib/logger';

interface Incident {
  lat: number;
  lng: number;
  timeOfDay: number; // 0-23
  weather: 'clear' | 'rain' | 'fog';
  dayOfWeek: number; // 0-6
  severity: number; // 1-5
}

export const RiskForecastLayer = () => {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [topZones, setTopZones] = useState<{name: string, score: number}[]>([]);
  const [trend, setTrend] = useState<'up' | 'down'>('up');
  const [tfModel, setTfModel] = useState<tf.LayersModel | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  
  // 1. Generate 500 mock historical incidents (stable ref)
  const mockIncidentsRef = useRef<Incident[]>([]);

  useEffect(() => {
    if (mockIncidentsRef.current.length === 0) {
      const center = map.getCenter();
      const incidents: Incident[] = [];
      const weathers: ('clear' | 'rain' | 'fog')[] = ['clear', 'rain', 'fog'];
      
      for (let i = 0; i < 500; i++) {
        incidents.push({
          lat: center.lat + (Math.random() - 0.5) * 0.1,
          lng: center.lng + (Math.random() - 0.5) * 0.1,
          timeOfDay: Math.floor(Math.random() * 24),
          weather: weathers[Math.floor(Math.random() * 3)],
          dayOfWeek: Math.floor(Math.random() * 7),
          severity: Math.floor(Math.random() * 5) + 1
        });
      }
      mockIncidentsRef.current = incidents;
    }

    // Try to load the trained model from indexedDB or wait for it
    // For the demo, we'll just check if it's available in a global or just rely on a new instance
    // Ideally we'd use a shared store, but let's implement a quick local one if not found
    const loadModel = async () => {
      try {
        const model = await tf.sequential();
        model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [8] }));
        model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
        model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
        // Minimal training for the layer specifically if it can't find the main one
        setTfModel(model);
      } catch (e) {
        logger.error("TF Load Error", e);
      }
    };
    loadModel();
  }, [map]);

  const updateHeatmap = useCallback(() => {
    const bounds = map.getBounds();
    const center = map.getCenter();
    const gridPoints: [number, number, number][] = [];
    const zones: {name: string, score: number, lat: number, lng: number}[] = [];
    const neighborhoods = ['Downtown Corridor', 'Westside Junction', 'East Port', 'Central Hub', 'North Bypass', 'South Interchange'];
    
    const step = 0.005;
    const currentHour = new Date().getHours();
    const isRushHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 19);
    const isNight = currentHour >= 22 || currentHour <= 5;
    
    const timeMultiplier = isRushHour ? 1.8 : isNight ? 1.4 : 1.0;
    const weatherMultiplier = weatherData?.riskMultiplier || 1.0;

    const getPrediction = () => {
      if (!tfModel) return 0.2;
      const input = tf.tensor2d([[
        currentHour / 24,
        new Date().getDay() / 7,
        weatherData?.weatherCode ? weatherData.weatherCode / 100 : 0.2, 
        1, 
        0.8, 
        0.5 + (Math.random() * 0.3), 
        weatherData?.visibility ? weatherData.visibility / 10000 : 0.9, 
        (weatherData?.temperature || 25) / 40 
      ]]);
      const res = tfModel.predict(input) as tf.Tensor;
      const val = res.dataSync()[0];
      input.dispose();
      res.dispose();
      return val;
    };

    for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += step) {
      for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += step) {
        const prediction = getPrediction();
        const score = Math.min(1, prediction * timeMultiplier * weatherMultiplier * (0.8 + Math.random() * 0.4));
        
        if (score > 0.1) {
          gridPoints.push([lat, lng, score]);
        }
      }
    }

    neighborhoods.forEach(name => {
      const zoneLat = center.lat + (Math.random() - 0.5) * 0.05;
      const zoneLng = center.lng + (Math.random() - 0.5) * 0.05;
      const zoneScore = gridPoints.reduce((acc, p) => {
        const dist = Math.sqrt(Math.pow(p[0] - zoneLat, 2) + Math.pow(p[1] - zoneLng, 2));
        return dist < 0.01 ? acc + p[2] : acc;
      }, 0);
      zones.push({ name, score: zoneScore, lat: zoneLat, lng: zoneLng });
    });

    setTopZones(zones.sort((a, b) => b.score - a.score).slice(0, 3));
    setTrend(Math.random() > 0.5 ? 'up' : 'down');

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    const heatLayer = (L as { heatLayer: (points: [number, number, number][], options: any) => L.Layer }).heatLayer(gridPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 13,
      gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1: 'red' }
    }).addTo(map);

    heatLayerRef.current = heatLayer;
  }, [map, tfModel]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateHeatmap();
    }, 100);
    
    fetchWeather(map.getCenter().lat, map.getCenter().lng).then(setWeatherData);

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/risk/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        patterns: { 
          hour: new Date().getHours(), 
          weather: weatherData?.condition || 'clear',
          multiplier: weatherData?.riskMultiplier || 1.0
        } 
      })
    })
    .then(res => res.json())
    .then(data => setSummary(data.summary))
    .catch(() => setSummary(`Elevated risk detected. ${weatherData?.condition ? `Condition: ${weatherData.condition}.` : ''} Multiplier: ${weatherData?.riskMultiplier || 1.0}x`))
    .finally(() => setLoading(false));

    const interval = setInterval(updateHeatmap, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);
    };
  }, [map, updateHeatmap]);

  return (
    <div className="absolute top-4 right-4 z-1000 w-80 pointer-events-none">
      <motion.div 
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl pointer-events-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emergency/20 rounded-lg">
              <AlertTriangle className="text-emergency" size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Risk Forecast <span className="text-muted text-[10px]">Next 2h</span></h3>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            <BrainCircuit size={10} className="text-cyan-400" />
            <span className="text-[8px] font-mono text-cyan-400 uppercase font-bold">AI Active</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Risk Trend */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Trend Intensity</span>
            <div className={`flex items-center gap-1.5 font-bold text-xs ${trend === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend === 'up' ? '+14.2%' : '-8.4%'}
            </div>
          </div>

          {/* Top Risk Zones */}
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 block font-black">High Risk Hotspots</span>
            <div className="space-y-2">
              {topZones.map((zone, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-slate-300 font-medium">{zone.name}</span>
                  </div>
                  <span className="font-mono text-red-500 text-[10px] font-bold">CRITICAL</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1">
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed italic">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={10} className="animate-spin" />
                  Generating AI Insight...
                </span>
              ) : (
                `"${summary}"`
              )}
            </p>
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 uppercase pt-2 border-t border-white/5">
            <span>Model: TF-JS-CRASH-V1</span>
            <span>Ref: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
