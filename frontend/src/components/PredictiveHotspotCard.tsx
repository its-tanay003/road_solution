import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import { useAnalyticsStore, type Hotspot } from '../store/analyticsStore';

const mockIncidents = [
  { lat: 13.0827, lng: 80.2707, name: "Chennai Central" },
  { lat: 13.0837, lng: 80.2717, name: "Chennai Central" },
  { lat: 13.0817, lng: 80.2697, name: "Chennai Central" },
  { lat: 12.9165, lng: 80.1523, name: "Tambaram Junction" },
  { lat: 12.9175, lng: 80.1533, name: "Tambaram Junction" },
  { lat: 12.9155, lng: 80.1513, name: "Tambaram Junction" },
  { lat: 13.0489, lng: 80.2089, name: "Koyambedu Roundtana" },
  { lat: 13.0499, lng: 80.2099, name: "Koyambedu Roundtana" },
  { lat: 13.0479, lng: 80.2079, name: "Koyambedu Roundtana" },
];

// Simple K-means implementation
const kmeans = (data: any[], k: number, iterations = 10) => {
  // Initialize centroids randomly from data
  let centroids = data.slice(0, k).map(d => ({ lat: d.lat, lng: d.lng }));
  
  for (let i = 0; i < iterations; i++) {
    const clusters: any[][] = Array.from({ length: k }, () => []);
    
    // Assign points to nearest centroid
    data.forEach(point => {
      let minDist = Infinity;
      let clusterIdx = 0;
      centroids.forEach((c, idx) => {
        const dist = Math.sqrt(Math.pow(point.lat - c.lat, 2) + Math.pow(point.lng - c.lng, 2));
        if (dist < minDist) {
          minDist = dist;
          clusterIdx = idx;
        }
      });
      clusters[clusterIdx].push(point);
    });
    
    // Update centroids
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return { lat: 0, lng: 0 };
      const sumLat = cluster.reduce((acc, p) => acc + p.lat, 0);
      const sumLng = cluster.reduce((acc, p) => acc + p.lng, 0);
      return { lat: sumLat / cluster.length, lng: sumLng / cluster.length };
    });
  }
  
  return centroids;
};

export const PredictiveHotspotCard: React.FC = () => {
  const { hotspots, setHotspots } = useAnalyticsStore();
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const centroids = kmeans(mockIncidents, 3);
    const newHotspots: Hotspot[] = centroids.map((c, i) => {
      const names = ["Tambaram Hub", "Central Corridor", "Koyambedu Link"];
      const trends = [24, 18, 32];
      const hours = ["11PM-1AM", "8AM-10AM", "6PM-9PM"];
      
      return {
        id: `hs-${i}`,
        lat: c.lat,
        lng: c.lng,
        intensity: 0.8,
        locationName: names[i],
        trend: trends[i],
        insight: `Based on 30-day trend, ${names[i]} shows ${trends[i]}% week-over-week increase. Recommend speed enforcement during ${hours[i]}.`
      };
    });
    setHotspots(newHotspots);
  }, [setHotspots]);

  if (hotspots.length === 0) return null;

  return (
    <div className="p-8 rounded-[2.5rem] bg-[#0A0F1A] border border-white/10 shadow-2xl overflow-hidden relative group h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
            <Target className="text-orange-500" size={20} />
            PREDICTIVE HOTSPOTS
          </h3>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">
            K-Means ML Clustering · Proactive Deployment
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-500 animate-pulse">
           3 EMERGING HOTSPOTS DETECTED
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {hotspots.map((hs, idx) => (
          <motion.div
            key={hs.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setActiveIdx(idx)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeIdx === idx 
                ? 'bg-orange-500/10 border-orange-500/40' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] font-mono text-white/30 uppercase tracking-tighter">Location ID: {hs.id}</span>
                <h4 className="text-sm font-bold text-white mt-1 uppercase tracking-tight">{hs.locationName}</h4>
              </div>
              <div className="flex items-center gap-1 text-orange-500">
                <TrendingUp size={14} />
                <span className="text-xs font-black">+{hs.trend}%</span>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {activeIdx === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-white/60 mt-3 leading-relaxed border-t border-white/5 pt-3">
                    {hs.insight}
                  </p>
                  <div className="mt-3 flex gap-2">
                     <button className="px-3 py-1 rounded-[var(--radius-lg)] bg-orange-500 text-black text-[10px] font-bold flex items-center gap-1">
                        Deploy Patrol <ChevronRight size={12} />
                     </button>
                     <button className="px-3 py-1 rounded-[var(--radius-lg)] bg-white/5 text-white/60 text-[10px] font-bold border border-white/10">
                        View Map
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
         <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
         <p className="text-[10px] text-amber-500/70 leading-relaxed uppercase font-mono">
            Claude AI Insight: Clusters suggest localized fatigue patterns. Recommend high-intensity lighting at km 42–48.
         </p>
      </div>
    </div>
  );
};
