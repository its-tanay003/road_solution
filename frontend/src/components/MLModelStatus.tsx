import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  History, 
  Database,
  Activity,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useMLStore } from '../store/mlStore';

export const MLModelStatus: React.FC = () => {
  const { 
    modelAccuracy, 
    trainingData, 
    lastRetrained, 
    isTraining,
    examplesSinceLastRetrain 
  } = useMLStore();

  const getStatusColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-emerald-500';
    if (accuracy >= 80) return 'text-blue-500';
    if (accuracy >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 overflow-hidden relative">
      {/* Background Brain Icon */}
      <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
        <Brain size={120} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">Local ML Model</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">On-Device Triage Optimizer</p>
          </div>
        </div>
        {isTraining && (
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">Training</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Target size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Accuracy</span>
          </div>
          <div className={`text-2xl font-black ${getStatusColor(modelAccuracy)}`}>
            {modelAccuracy}%
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${modelAccuracy}%` }}
              className={`h-full ${modelAccuracy >= 90 ? 'bg-emerald-500' : 'bg-blue-500'}`}
            />
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Database size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Dataset</span>
          </div>
          <div className="text-2xl font-black text-white">
            {trainingData.length}
          </div>
          <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Real Incident Samples</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter border-b border-slate-700/30 pb-2">
          <div className="flex items-center gap-2 text-slate-400">
            <History size={12} />
            Last Retrained
          </div>
          <span className="text-white">
            {lastRetrained ? new Date(lastRetrained).toLocaleTimeString() : 'Initial'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter border-b border-slate-700/30 pb-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Zap size={12} />
            Pending Retrain
          </div>
          <span className="text-white">{examplesSinceLastRetrain} / 5 Examples</span>
        </div>

        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity size={12} />
            Neural Layers
          </div>
          <span className="text-white">3 Dense Layers</span>
        </div>
      </div>

      <div className="mt-6 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={12} className="text-blue-400" />
          <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-400">Continuous Learning</h4>
        </div>
        <p className="text-[8px] text-slate-400 leading-tight">
          Model accuracy improves by cross-referencing AI triage predictions with real responder feedback loops in this specific geographic region.
        </p>
      </div>
    </div>
  );
};
