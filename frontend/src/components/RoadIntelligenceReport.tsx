import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Brain, Download, MapPin, TrendingUp, TrendingDown, Lightbulb, RefreshCw } from 'lucide-react';
import { mockIncidents } from '../data/mockIncidents';
import { jsPDF } from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

interface IntelligenceReport {
  topDangerZones: { name: string; incidents: number; trend: 'up' | 'down' | 'stable' }[];
  peakHours: { hour: number; risk: number }[];
  insights: string[];
  recommendedPatrols: string[];
  weekOverWeek: { change: number; direction: 'up' | 'down' };
}

export const RoadIntelligenceReport: React.FC = () => {
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    // Simulate AI Processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Logic based on mock incidents
    const hours = Array.from({ length: 24 }).map((_, h) => ({
      hour: h,
      risk: mockIncidents.filter(i => new Date(i.timestamp).getHours() === h).length * 10
    }));

    const mockReport: IntelligenceReport = {
      topDangerZones: [
        { name: 'Chennai Bypass (Tambaram)', incidents: 12, trend: 'up' },
        { name: 'NH-44 (Hosur Road)', incidents: 8, trend: 'stable' },
        { name: 'Anna Salai (Teynampet)', incidents: 5, trend: 'down' },
      ],
      peakHours: hours,
      insights: [
        "Risk spikes significantly between 18:00 and 21:00 due to high-speed merging at commuters exit points.",
        "G-Force analysis indicates a 15% increase in high-impact skidding near wet surface zones this week.",
        "Response time optimization possible by pre-positioning units at the NH-48 junction."
      ],
      recommendedPatrols: ["NH-48 Junction", "Mount Road Exit", "Koyambedu Flyover"],
      weekOverWeek: { change: 12, direction: 'up' }
    };

    setReport(mockReport);
    setLoading(false);
  };

  useEffect(() => {
    generateReport();
  }, []);

  const downloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ROADSoS Intelligence Report", 20, 30);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 40);
    
    doc.text("Top Danger Zones:", 20, 60);
    report.topDangerZones.forEach((z, i) => {
      doc.text(`${i+1}. ${z.name} - ${z.incidents} incidents (${z.trend})`, 30, 70 + (i * 10));
    });

    doc.text("AI Insights:", 20, 110);
    report.insights.forEach((ins, i) => {
      const splitText = doc.splitTextToSize(ins, 160);
      doc.text(splitText, 30, 120 + (i * 20));
    });

    doc.save(`ROADSoS_Intelligence_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const chartData = {
    labels: report?.peakHours.map(h => `${h.hour}:00`) || [],
    datasets: [
      {
        label: 'Risk Level',
        data: report?.peakHours.map(h => h.risk) || [],
        backgroundColor: 'rgba(41, 121, 255, 0.4)',
        borderColor: '#2979FF',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="w-full bg-(--clr-surface) border border-(--clr-border) rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="p-6 border-b border-(--clr-border) bg-white/2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-(--clr-blue)/10 flex items-center justify-center text-(--clr-blue)">
            <Brain size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono">ROAD INTELLIGENCE</h2>
            <p className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest">Week of {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <button 
          onClick={generateReport}
          disabled={loading}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-(--clr-text-2) transition-all disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {!report && loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-(--clr-text-2)">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
              <RefreshCw size={40} />
            </motion.div>
            <p className="text-[10px] font-mono tracking-widest animate-pulse">ANALYZING INCIDENT TELEMETRY...</p>
          </div>
        ) : (
          report && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Top Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-(--clr-border)">
                  <p className="text-[10px] font-mono text-(--clr-text-2) mb-2 uppercase">W-O-W Change</p>
                  <div className={`text-2xl font-bold flex items-center gap-2 ${report.weekOverWeek.direction === 'up' ? 'text-(--clr-red)' : 'text-(--clr-green)'}`}>
                    {report.weekOverWeek.direction === 'up' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    {report.weekOverWeek.change}%
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-(--clr-border)">
                  <p className="text-[10px] font-mono text-(--clr-text-2) mb-2 uppercase">Risk Level</p>
                  <div className="text-2xl font-bold text-(--clr-amber)">ELEVATED</div>
                </div>
              </div>

              {/* Danger Zones */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} className="text-(--clr-red)" /> Top Danger Zones
                </h3>
                <div className="space-y-2">
                  {report.topDangerZones.map((zone, i) => (
                    <div key={zone.name} className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-(--clr-text-2)">0{i+1}</span>
                        <span className="text-sm font-bold">{zone.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono">{zone.incidents} INC</span>
                        {zone.trend === 'up' ? <TrendingUp className="text-(--clr-red)" size={14} /> : zone.trend === 'down' ? <TrendingDown className="text-(--clr-green)" size={14} /> : <div className="w-3.5 h-0.5 bg-gray-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Risk Chart */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest">Risk Distribution (24H)</h3>
                <div className="h-40">
                  <Bar 
                    data={chartData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false, 
                      plugins: { legend: { display: false } },
                      scales: { x: { display: false }, y: { display: false } }
                    }} 
                  />
                </div>
              </section>

              {/* AI Insights */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest flex items-center gap-2">
                  <Lightbulb size={12} className="text-(--clr-amber)" /> AI Analysis
                </h3>
                <div className="space-y-3">
                  {report.insights.map((insight, i) => (
                    <div key={i} className="flex gap-3 text-sm leading-relaxed text-(--clr-text-2)">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-(--clr-amber) shrink-0" />
                      <p>{insight}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Patrol Recommendations */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest">Patrol Deployment</h3>
                <div className="flex flex-wrap gap-2">
                  {report.recommendedPatrols.map(p => (
                    <div key={p} className="px-3 py-1.5 rounded-full bg-(--clr-blue)/10 border border-(--clr-blue)/20 text-[10px] font-bold text-(--clr-blue) flex items-center gap-2">
                      <MapPin size={10} /> {p}
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )
        )}
      </div>

      <div className="p-6 border-t border-(--clr-border) bg-white/2">
        <button 
          onClick={downloadPDF}
          className="w-full py-4 bg-white/5 border border-(--clr-border) hover:bg-white/10 rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
        >
          <Download size={18} /> DOWNLOAD AS PDF
        </button>
      </div>
    </div>
  );
};
