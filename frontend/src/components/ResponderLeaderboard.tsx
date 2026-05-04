import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Shield, 
  Download, 
  Activity,
  Heart
} from 'lucide-react';
import { useLeaderboardStore, type Responder } from '../store';
import { useTrainingStore } from '../store/trainingStore';

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Trophy className="text-yellow-400 fill-yellow-400/20" size={24} />;
  if (rank === 2) return <Medal className="text-slate-300 fill-slate-300/20" size={22} />;
  if (rank === 3) return <Medal className="text-orange-500 fill-orange-500/20" size={20} />;
  return <span className="text-slate-500 font-mono font-bold w-6 text-center">{rank}</span>;
};

const ScoreGauge = ({ score }: { score: number }) => {
  const color = score > 85 ? '#10b981' : score > 65 ? '#f59e0b' : '#ef4444';
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="3"
          fill="transparent"
        />
        <motion.circle
          cx="20"
          cy="20"
          r={radius}
          stroke={color}
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[9px] font-black">{Math.round(score)}</span>
    </div>
  );
};

export const ResponderLeaderboard: React.FC = () => {
  const { records, currentStreak, getAverageScore } = useTrainingStore();
  const { responders, shuffleMetrics } = useLeaderboardStore();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<keyof Responder>('incidentsHandled');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const handleSort = (key: keyof Responder) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortKey(key);
      setSortOrder('DESC');
    }
  };
  const [myUnitId] = useState('A47');

  useEffect(() => {
    const interval = setInterval(shuffleMetrics, 10000);
    return () => clearInterval(interval);
  }, [shuffleMetrics]);

  const sortedResponders = useMemo(() => {
    return [...responders]
      .filter(r => filterType === 'ALL' || filterType === 'TRAINING' || r.unitType === filterType)
      .sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'ASC' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'ASC' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [responders, filterType, sortKey, sortOrder]);

  const topHero = responders.sort((a, b) => b.livesImpacted - a.livesImpacted)[0];

  const exportCSV = () => {
    const headers = "Rank,UnitID,Name,Type,Incidents,ResponseTime,AIScore,LivesImpacted,Status\n";
    const rows = sortedResponders.map((r, i) => 
      `${i+1},${r.unitId},${r.responderName},${r.unitType},${r.incidentsHandled},${r.avgResponseTime},${r.aiCollaborationScore},${r.livesImpacted},${r.currentStatus}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadsos_leaderboard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Shield className="text-blue-500" size={32} />
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">Responder Command</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest italic text-blue-500">Live Telemetry Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex">
              {['ALL', 'ALS', 'BLS', 'Police', 'Fire', 'TRAINING'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button 
              onClick={exportCSV}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-95"
              aria-label="Export Leaderboard as CSV"
              title="Export as CSV"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-linear-to-br from-slate-900 to-slate-950 border border-white/10 rounded-[3rem] p-10 overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Trophy size={200} />
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="px-4 py-1.5 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full italic">
                  This Week's Hero
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Flame size={14} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{topHero.streak} Incident Streak</span>
                </div>
              </div>
              <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                {topHero.unitId} <br/>
                <span className="text-3xl text-slate-500">{topHero.responderName}</span>
              </h2>
              <div className="flex gap-8">
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lives Impacted</div>
                  <div className="text-3xl font-black tabular-nums text-emerald-400">{topHero.livesImpacted}</div>
                </div>
                <div className="w-px h-10 bg-white/10 self-center" />
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Efficiency</div>
                  <div className="text-3xl font-black tabular-nums text-blue-400">{Math.round(topHero.aiCollaborationScore)}%</div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="w-48 h-48 rounded-full border-8 border-yellow-400/20 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping opacity-20" />
                <Trophy size={80} className="text-yellow-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              {filterType === 'TRAINING' ? (
                <tr className="border-b border-white/5 text-slate-500">
                  <th className="p-6 pl-10 text-[10px] font-black uppercase tracking-[0.2em]">Scenario Type</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Score</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Time to Triage</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Correct Unit</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">AI Compliance</th>
                  <th className="p-6 pr-10 text-[10px] font-black uppercase tracking-[0.2em]">Date</th>
                </tr>
              ) : (
                <tr className="border-b border-white/5 text-slate-500">
                  <th className="p-6 pl-10 text-[10px] font-black uppercase tracking-[0.2em]">Rank</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Unit</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-white" onClick={() => handleSort('incidentsHandled')}>Incidents</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-white" onClick={() => handleSort('avgResponseTime')}>Response</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-white" onClick={() => handleSort('aiCollaborationScore')}>AI Score</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-white" onClick={() => handleSort('livesImpacted')}>Impact</th>
                  <th className="p-6 pr-10 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                </tr>
              )}
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filterType === 'TRAINING' ? (
                  records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500 font-mono text-sm">No training records found.</td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <motion.tr 
                        key={r.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="group hover:bg-white/2 transition-colors"
                      >
                        <td className="p-6 pl-10 font-bold text-sm text-blue-400">{r.scenarioType}</td>
                        <td className="p-6 font-black tabular-nums">{r.score}</td>
                        <td className="p-6 font-mono text-sm text-slate-300">{r.timeToTriage}s</td>
                        <td className="p-6">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${r.correctUnitDispatched ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {r.correctUnitDispatched ? 'YES' : 'NO'}
                          </span>
                        </td>
                        <td className="p-6">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${r.aiCompliance ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                            {r.aiCompliance ? 'YES' : 'NO'}
                          </span>
                        </td>
                        <td className="p-6 pr-10 text-slate-500 font-mono text-xs">{new Date(r.timestamp).toLocaleString()}</td>
                      </motion.tr>
                    ))
                  )
                ) : (
                sortedResponders.map((r, index) => {
                  const isTop = index === 0 && filterType === 'ALL';
                  const isMyUnit = r.unitId === myUnitId;

                  return (
                    <motion.tr 
                      key={r.unitId}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        backgroundColor: isMyUnit ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                      }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`group hover:bg-white/2 transition-colors ${isTop ? 'relative' : ''}`}
                    >
                      <td className="p-6 pl-10">
                        <div className="flex items-center gap-4">
                          <RankIcon rank={index + 1} />
                          {isTop && <div className="absolute left-0 w-1 h-full bg-yellow-400" />}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black italic text-xs shadow-lg ${
                            r.unitType === 'ALS' ? 'bg-red-500/20 text-red-500' :
                            r.unitType === 'BLS' ? 'bg-emerald-500/20 text-emerald-500' :
                            r.unitType === 'Police' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-orange-500/20 text-orange-500'
                          }`}>
                            {r.unitId}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm flex items-center gap-2">
                              {r.responderName}
                              {isMyUnit && <span className="px-2 py-0.5 bg-blue-500 text-[8px] rounded-full">YOU</span>}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{r.unitType} • {r.city}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold tabular-nums">{r.incidentsHandled}</span>
                          {r.streak > 3 && (
                            <div className="flex items-center gap-1 text-orange-500">
                              <Flame size={12} fill="currentColor" />
                              <span className="text-[10px] font-black">{r.streak}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-slate-300 font-mono text-sm">
                          <Activity size={14} className="text-slate-500" />
                          {r.avgResponseTime}
                        </div>
                      </td>
                      <td className="p-6">
                        <ScoreGauge score={r.aiCollaborationScore} />
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-emerald-400 font-black">
                          <Heart size={14} fill="currentColor" className="opacity-50" />
                          {r.livesImpacted}
                        </div>
                      </td>
                      <td className="p-6 pr-10 text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          r.currentStatus === 'AVAILABLE' ? 'text-emerald-500 bg-emerald-500/10' :
                          r.currentStatus === 'ON SCENE' ? 'text-red-500 bg-red-500/10' :
                          'text-blue-500 bg-blue-500/10'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            r.currentStatus === 'AVAILABLE' ? 'bg-emerald-500' :
                            r.currentStatus === 'ON SCENE' ? 'bg-red-500 animate-pulse' :
                            'bg-blue-500'
                          }`} />
                          {r.currentStatus}
                        </div>
                      </td>
                    </motion.tr>
                  );
                }))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer Stats */}
        {filterType === 'TRAINING' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12">
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Simulations</div>
              <div className="text-3xl font-black italic tracking-tighter text-blue-500">{records.length}</div>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average Score</div>
              <div className="text-3xl font-black italic tracking-tighter text-emerald-500">{getAverageScore()}</div>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Training Streak</div>
              <div className="text-3xl font-black italic tracking-tighter text-yellow-400">{currentStreak} <span className="text-sm">Days</span></div>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Highest Score</div>
              <div className="text-3xl font-black italic tracking-tighter text-purple-400">
                {records.length > 0 ? Math.max(...records.map(r => r.score)) : 0}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12">
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Resolved</div>
              <div className="text-3xl font-black italic tracking-tighter">1,242</div>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Golden Hour Success</div>
              <div className="text-3xl font-black italic tracking-tighter text-emerald-500">92%</div>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Efficiency</div>
              <div className="text-3xl font-black italic tracking-tighter text-blue-500">+34%</div>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Units</div>
              <div className="text-3xl font-black italic tracking-tighter">84</div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        th { user-select: none; }
        .glow-gold { box-shadow: 0 0 40px rgba(234, 179, 8, 0.15); }
      `}</style>
    </div>
  );
};
