import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Line 
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Activity, Heart, AlertCircle } from 'lucide-react';
import { useEmergencyStore } from '../store';
import { useBiometricsContext } from '../hooks/useBiometricsContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const WearableBiometrics: React.FC = () => {
  const { crashTriggered } = useEmergencyStore();
  const [heartRate, setHeartRate] = useState(75);
  const [spo2, setSpo2] = useState(98);
  const [movement, setMovement] = useState(true);
  const [impactEnergy, setImpactEnergy] = useState(0);
  const [chartData, setChartData] = useState<number[]>(Array(20).fill(75));
  
  const biometricsContext = useBiometricsContext(heartRate, spo2, movement);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!crashTriggered) {
        // Normal baseline
        const newHR = 72 + Math.random() * 6;
        setHeartRate(Math.round(newHR));
        setSpo2(98 + Math.round(Math.random() * 1));
        setMovement(true);
        setImpactEnergy(0);
        setChartData(prev => [...prev.slice(1), newHR]);
      } else {
        // Post-crash erratic biometrics
        const newHR = 110 + Math.random() * 30;
        setHeartRate(Math.round(newHR));
        
        // Progressive drop in SpO2
        setSpo2(prev => Math.max(85, prev - 0.1));
        
        // Movement stops after 3s
        setTimeout(() => setMovement(false), 3000);
        
        setImpactEnergy(94);
        setChartData(prev => [...prev.slice(1), newHR]);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [crashTriggered]);

  const data = {
    labels: Array(20).fill(''),
    datasets: [
      {
        label: 'Heart Rate',
        data: chartData,
        borderColor: crashTriggered ? '#ef4444' : '#22c55e',
        backgroundColor: crashTriggered ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { 
        display: false,
        min: 40,
        max: 160
      },
    },
    animation: {
      duration: 0
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Activity className={`w-5 h-5 ${crashTriggered ? 'text-red-500' : 'text-emerald-500'} animate-pulse`} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Biometrics</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">Wearable v2.1 Linked</span>
            </div>
          </div>
        </div>
        <div className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-1 rounded">IOT_DEV_04</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Heart Rate Panel */}
        <div className="col-span-2 bg-white/5 rounded-2xl p-4 border border-white/5 h-[180px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className={`w-4 h-4 ${crashTriggered ? 'text-red-500 animate-[ping_1s_infinite]' : 'text-emerald-500'}`} />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Heart Rate</span>
            </div>
            <div className={`text-2xl font-bold font-mono ${crashTriggered ? 'text-red-500' : 'text-emerald-500'}`}>
              {heartRate} <span className="text-[10px] text-gray-500">BPM</span>
            </div>
          </div>
          <div className="flex-1">
            <Line data={data} options={options} />
          </div>
        </div>

        {/* SpO2 Gauge */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-3">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
              <motion.circle
                cx="40" cy="40" r="34"
                stroke={spo2 < 90 ? '#f59e0b' : '#0ea5e9'}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="213.6"
                animate={{ strokeDashoffset: 213.6 * (1 - spo2/100) }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-bold font-mono text-white">{Math.round(spo2)}%</span>
              <span className="text-[8px] text-gray-500 uppercase font-black">SpO2</span>
            </div>
          </div>
          <AnimatePresence>
            {spo2 < 90 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase animate-pulse"
              >
                <AlertCircle className="w-2.5 h-2.5" />
                Hypoxemia Alert
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Movement & Impact */}
        <div className="flex flex-col gap-3">
          <div className={`flex-1 flex flex-col justify-center p-3 rounded-2xl border transition-colors duration-500 ${movement ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="text-[8px] font-black text-gray-500 uppercase mb-1">Mobility Status</div>
            <div className={`text-[10px] font-bold uppercase tracking-tight ${movement ? 'text-green-500' : 'text-red-500'}`}>
              {movement ? 'Motion Detected' : 'No Movement'}
            </div>
          </div>

          <div className="flex-1 bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[8px] font-black text-gray-500 uppercase">Impact Energy</div>
              <div className="text-[10px] font-mono text-blue-400 font-bold">{impactEnergy}%</div>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${impactEnergy}%` }}
                className="h-full bg-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden context for AI API */}
      <div className="hidden">{biometricsContext}</div>
    </div>
  );
};
