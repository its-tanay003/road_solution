import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Filter, PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export const RoadTypeBreakdown: React.FC = () => {
  const data = {
    labels: ['NH', 'SH', 'Urban', 'Two-wheeler', 'Car', 'Truck'],
    datasets: [
      {
        label: 'Road Type',
        data: [47, 31, 22],
        backgroundColor: [
          'rgba(41, 121, 255, 0.8)',
          'rgba(41, 121, 255, 0.5)',
          'rgba(41, 121, 255, 0.3)',
        ],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        weight: 1,
      },
      {
        label: 'Vehicle Type',
        data: [44, 38, 18],
        backgroundColor: [
          'rgba(245, 0, 87, 0.8)',
          'rgba(245, 0, 87, 0.5)',
          'rgba(245, 0, 87, 0.3)',
        ],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        weight: 0.6,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(10, 15, 26, 0.9)',
        padding: 12,
        titleFont: { size: 12, family: 'JetBrains Mono' },
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            const label = context.dataset.label || '';
            const value = context.parsed || 0;
            return ` ${label}: ${value}%`;
          }
        }
      }
    },
    cutout: '40%',
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-[#0A0F1A] border border-white/10 shadow-2xl overflow-hidden relative group h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
            <PieChart className="text-[#F50057]" size={20} />
            SEGMENT ANALYSIS
          </h3>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">
            Infrastructure & Vehicle Correlation
          </p>
        </div>
        <button 
          title="Filter Analysis"
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
        >
          <Filter size={18} />
        </button>
      </div>

      <div className="flex-1 relative min-h-[250px]">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <span className="text-[10px] font-mono text-white/20 uppercase">Total</span>
           <span className="text-2xl font-black text-white">1,402</span>
           <span className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">Incidents</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
         <div className="space-y-2">
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest border-b border-white/5 pb-1">Road Class</p>
            <div className="flex justify-between items-center text-xs">
               <span className="text-white/60">National Highway</span>
               <span className="font-bold text-[#2979FF]">47%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
               <span className="text-white/60">State Highway</span>
               <span className="font-bold text-[#2979FF]/70">31%</span>
            </div>
         </div>
         <div className="space-y-2">
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest border-b border-white/5 pb-1">Primary Unit</p>
            <div className="flex justify-between items-center text-xs">
               <span className="text-white/60">Two-Wheelers</span>
               <span className="font-bold text-[#F50057]">44%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
               <span className="text-white/60">Passenger Cars</span>
               <span className="font-bold text-[#F50057]/70">38%</span>
            </div>
         </div>
      </div>
    </div>
  );
};
