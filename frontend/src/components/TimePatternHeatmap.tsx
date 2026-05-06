import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Zap, Clock } from 'lucide-react';

// Register without annotationPlugin — not needed, avoids external dep
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const TimePatternHeatmap: React.FC = () => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const weekdayData = [5, 3, 2, 8, 12, 15, 25, 45, 52, 30, 22, 18, 20, 25, 28, 35, 42, 58, 65, 40, 25, 20, 15, 10];
  const weekendData = [15, 12, 18, 25, 30, 22, 15, 12, 10, 15, 20, 25, 28, 35, 40, 45, 50, 55, 60, 75, 82, 65, 45, 30];

  // 19:00 = index 19 out of 24 → ~79% from left
  const riskLineLeft = `${(19 / 24) * 100}%`;

  const data = {
    labels: hours,
    datasets: [
      {
        label: 'Weekdays (Mon-Thu)',
        data: weekdayData,
        backgroundColor: 'rgba(41, 121, 255, 0.6)',
        borderColor: '#2979FF',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Weekends (Fri-Sun)',
        data: weekendData,
        backgroundColor: 'rgba(245, 0, 87, 0.6)',
        borderColor: '#F50057',
        borderWidth: 1,
        borderRadius: 4,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 10, family: 'JetBrains Mono' } }
      },
      tooltip: {
        backgroundColor: 'rgba(10, 15, 26, 0.9)',
        titleColor: '#fff',
        bodyColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 9 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 9 } }
      }
    }
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-[#0A0F1A] border border-white/10 shadow-2xl overflow-hidden relative group h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
            <Clock className="text-[#2979FF]" size={20} />
            TEMPORAL CRASH DISTRIBUTION
          </h3>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">
            24-Hour Cycle Analysis · 30-Day Moving Average
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-end">
            <span className="text-[8px] font-mono text-amber-500/50 uppercase">Next High-Risk Window</span>
            <span className="text-xs font-black text-amber-500 flex items-center gap-2">
              Tonight 11PM–1AM
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            </span>
          </div>
        </div>
      </div>

      {/* Chart wrapper — CSS annotation line replaces chartjs-plugin-annotation */}
      <div className="flex-1 min-h-[300px] relative">
        <Bar data={data} options={options} />

        {/* Peak risk marker at 19:00 (index 19/24) */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: riskLineLeft }}
        >
          <div className="w-px h-full bg-amber-400/60" style={{ borderLeft: '2px dashed rgba(255,191,0,0.7)' }} />
          <div className="absolute top-2 left-1 text-[8px] font-mono text-amber-400 bg-[#0A0F1A]/80 px-1.5 py-0.5 rounded whitespace-nowrap border border-amber-400/20">
            HIGHEST RISK · Fri 7PM · 340% above baseline
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#2979FF]/10 flex items-center justify-center border border-[#2979FF]/20">
          <Zap className="text-[#2979FF]" size={18} />
        </div>
        <div>
          <p className="text-[10px] font-mono text-white/40 uppercase">AI Predictive Insight</p>
          <p className="text-xs text-white/80 mt-0.5">
            Shift in peak clusters detected toward <span className="text-rose-500 font-bold">11PM-2AM</span> on weekends. Recommending increased patrol density in Zone 4.
          </p>
        </div>
      </div>
    </div>
  );
};
