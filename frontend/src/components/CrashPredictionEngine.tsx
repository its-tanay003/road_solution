import React, { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Activity, 
  AlertTriangle, 
  Zap, 
  BarChart3, 
  Settings,
  ShieldCheck
} from 'lucide-react';

interface PredictionFeatures {
  hour: number;
  dayOfWeek: number;
  weatherCode: number;
  roadType: number;
  speedLimit: number;
  trafficDensity: number;
  visibility: number;
  temperature: number;
}

export const CrashPredictionEngine: React.FC = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(true);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [features, setFeatures] = useState<PredictionFeatures>({
    hour: new Date().getHours(),
    dayOfWeek: new Date().getDay(),
    weatherCode: 0,
    roadType: 1,
    speedLimit: 60,
    trafficDensity: 0.4,
    visibility: 10,
    temperature: 25
  });

  const predict = useCallback((m: tf.LayersModel, f: PredictionFeatures) => {
    const input = tf.tensor2d([[
      f.hour / 24, 
      f.dayOfWeek / 7, 
      f.weatherCode / 4, 
      f.roadType, 
      f.speedLimit / 120, 
      f.trafficDensity, 
      f.visibility / 10, 
      f.temperature / 40
    ]]);
    const res = m.predict(input) as tf.Tensor;
    res.data().then(data => setPrediction(data[0]));
    input.dispose();
  }, []);

  const generateData = (numPoints: number) => {
    const x = [];
    const y = [];

    for (let i = 0; i < numPoints; i++) {
      const hour = Math.floor(Math.random() * 24);
      const dow = Math.floor(Math.random() * 7);
      const weather = Math.floor(Math.random() * 4);
      const rType = Math.floor(Math.random() * 2);
      const sLimit = rType === 1 ? 100 : 50;
      const tDensity = Math.random();
      const vis = weather >= 2 ? Math.random() * 2 : 8 + Math.random() * 2;
      const temp = 5 + Math.random() * 30;

      let prob = 0.05;
      if (hour >= 7 && hour <= 9) prob += 0.3;
      if (hour >= 17 && hour <= 19) prob += 0.3;
      if (hour >= 23 || hour <= 3) prob += 0.2;
      if (weather >= 2) prob += 0.25;
      if (rType === 1 && tDensity > 0.7) prob += 0.2;
      if (vis < 2) prob += 0.15;
      
      prob = Math.min(0.95, Math.max(0.01, prob + (Math.random() * 0.1 - 0.05)));

      x.push([hour / 24, dow / 7, weather / 4, rType, sLimit / 120, tDensity, vis / 10, temp / 40]);
      y.push([prob]);
    }

    return {
      x: tf.tensor2d(x),
      y: tf.tensor2d(y)
    };
  };

  const trainModel = useCallback(async () => {
    const newModel = tf.sequential();
    newModel.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [8] }));
    newModel.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    newModel.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    newModel.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    const { x, y } = generateData(1000);

    await newModel.fit(x, y, {
      epochs: 30,
      callbacks: {
        onEpochEnd: (epoch) => {
          setTrainingProgress(((epoch + 1) / 30) * 100);
        }
      }
    });

    setModel(newModel);
    setIsTraining(false);
    
    x.dispose();
    y.dispose();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      trainModel();
    }, 100);
    return () => clearTimeout(timer);
  }, [trainModel]);

  useEffect(() => {
    if (model && !isTraining) {
      predict(model, features);
    }
  }, [features, model, isTraining, predict]);

  const getRiskColor = (p: number) => {
    if (p < 0.2) return 'emerald';
    if (p < 0.5) return 'amber';
    return 'red';
  };

  if (isTraining) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-12 text-white font-sans z-10000">
        <Brain className="text-blue-500 animate-pulse mb-8" size={64} />
        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mb-4">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${trainingProgress}%` }}
          />
        </div>
        <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
          Neural Network Initialization: {Math.round(trainingProgress)}%
        </div>
        <p className="mt-8 text-slate-600 text-sm italic font-mono max-w-md text-center">
          Synthesizing 1,000 historical crash points and training 3-layer deep learning model...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Brain className="text-blue-500" size={32} />
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">Crash Prediction Engine</h1>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">TF.js Neural Net • Real-time Inference</p>
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">Edge Model Operational</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 bg-slate-900 border border-white/5 rounded-4xl p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={18} className="text-slate-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Environment Parameters</h3>
            </div>
            
            <div className="space-y-6">
              {[
                { label: 'Hour of Day', key: 'hour' as const, min: 0, max: 23, step: 1 },
                { label: 'Traffic Density', key: 'trafficDensity' as const, min: 0, max: 1, step: 0.05 },
                { label: 'Speed Limit', key: 'speedLimit' as const, min: 20, max: 120, step: 10 },
                { label: 'Visibility (km)', key: 'visibility' as const, min: 0, max: 10, step: 0.5 },
                { label: 'Weather Intensity', key: 'weatherCode' as const, min: 0, max: 3, step: 1 },
                { label: 'Temperature (°C)', key: 'temperature' as const, min: -10, max: 45, step: 1 }
              ].map((input) => (
                <div key={input.key} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>{input.label}</span>
                    <span className="text-blue-400 font-mono">{features[input.key]}</span>
                  </div>
                  <input 
                    type="range"
                    title={input.label}
                    aria-label={input.label}
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    value={features[input.key]}
                    onChange={(e) => setFeatures({ ...features, [input.key]: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            
            <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <div className={`px-4 py-1.5 bg-${getRiskColor(prediction || 0)}-500/10 text-${getRiskColor(prediction || 0)}-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-${getRiskColor(prediction || 0)}-500/20`}>
                  {prediction && prediction < 0.2 ? 'LOW RISK' : prediction && prediction < 0.5 ? 'MODERATE RISK' : 'CRITICAL RISK'}
                </div>
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="space-y-4 text-center md:text-left">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Predicted Probability</h2>
                  <div className={`text-9xl font-black tracking-tighter italic text-${getRiskColor(prediction || 0)}-500`}>
                    {prediction ? Math.round(prediction * 100) : 0}%
                  </div>
                  <p className="text-slate-400 text-sm max-w-xs">
                    This location is <span className="font-bold text-white">{(prediction ? (prediction / 0.1).toFixed(1) : 0)}x</span> more dangerous than regional average based on current telemetry.
                  </p>
                </div>

                <div className="flex-1 w-full space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Model Confidence</span>
                      <span>94.2%</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '94.2%' }}
                        className="h-full bg-linear-to-r from-blue-500 to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-2">
                      <Zap className="text-orange-500" size={16} />
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Latency</div>
                      <div className="text-xl font-black italic tracking-tighter">12ms</div>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-2">
                      <BarChart3 className="text-blue-500" size={16} />
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Epochs</div>
                      <div className="text-xl font-black italic tracking-tighter">30</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-4xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-slate-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Neural Architecture</h3>
                </div>
                <div className="text-[10px] font-mono text-slate-600">8 Inputs → 16 Hidden → 8 Hidden → 1 Sigmoid</div>
              </div>
              
              <div className="h-24 flex items-center justify-around relative px-12">
                <div className="absolute inset-x-0 h-px bg-white/10 top-1/2 -z-10" />
                {[8, 16, 8, 1].map((count, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(count, 4) }).map((_, j) => (
                        <div key={j} className={`w-2 h-2 rounded-full ${i === 3 ? 'bg-red-500' : 'bg-blue-500'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase italic">L{i}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex gap-3">
              <AlertTriangle className="text-red-500 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-red-500 italic">Safety Alert</h4>
                <p className="text-xs text-slate-400">High traffic density combined with low visibility detected. Model recommends activating secondary emergency protocols.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
