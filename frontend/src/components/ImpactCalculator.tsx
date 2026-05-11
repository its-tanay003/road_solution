import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Calculator, TrendingDown, Users, DollarSign, Share2, Info, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RegionData {
  name: string;
  ambulances: number;
  deaths: number;
  avgResponse: number;
}

const REGIONS: Record<string, RegionData> = {
  'Tamil Nadu': { name: 'Tamil Nadu', ambulances: 11800, deaths: 17000, avgResponse: 11 },
  'Maharashtra': { name: 'Maharashtra', ambulances: 9500, deaths: 15000, avgResponse: 13 },
  'Uttar Pradesh': { name: 'Uttar Pradesh', ambulances: 14000, deaths: 23000, avgResponse: 15 },
  'Karnataka': { name: 'Karnataka', ambulances: 7000, deaths: 11000, avgResponse: 12 },
  'All India': { name: 'All India', ambulances: 50000, deaths: 153972, avgResponse: 14 },
};

export const ImpactCalculator: React.FC = () => {
  const [region, setRegion] = useState('Tamil Nadu');
  const [equipped, setEquipped] = useState(1000);
  const [reduction, setReduction] = useState(45);
  const [adoption, setAdoption] = useState(8);

  const data = REGIONS[region];

  const results = useMemo(() => {
    const coveragePct = equipped / data.ambulances;
    const reductionFactor = reduction / 100;
    const adoptionBonus = 1 + (adoption / 100);
    
    const livesSaved = Math.round(data.deaths * coveragePct * reductionFactor * 0.35 * adoptionBonus);
    const injuriesPrevented = Math.round(livesSaved * 2.88);
    const newResponseTime = (data.avgResponse * (1 - (reductionFactor * coveragePct))).toFixed(1);
    const totalCost = equipped * 2400;
    const costPerLife = livesSaved > 0 ? Math.round(totalCost / livesSaved) : 0;

    return { livesSaved, injuriesPrevented, newResponseTime, costPerLife, totalCost };
  }, [equipped, reduction, adoption, data]);

  const chartData = {
    labels: ['Current', 'Projected'],
    datasets: [
      {
        label: 'Annual Deaths',
        data: [data.deaths, data.deaths - results.livesSaved],
        backgroundColor: ['rgba(255, 23, 68, 0.5)', 'rgba(0, 230, 118, 0.5)'],
        borderColor: ['#FF1744', '#00E676'],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0D1321',
        titleFont: { family: 'Space Grotesk' },
        bodyFont: { family: 'JetBrains Mono' },
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892A4', font: { family: 'JetBrains Mono', size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#8892A4', font: { family: 'Space Grotesk', size: 12 } } },
    },
  };

  const handleShare = () => {
    const text = `🚀 ROADSoS ROI Prediction for ${region}:\n- Lives saved: ${results.livesSaved}/year\n- Response reduced to ${results.newResponseTime} min\n- Cost/Life: ₹${results.costPerLife.toLocaleString()}\n\nFull impact analysis @ road-sos.gov.in`;
    navigator.clipboard.writeText(text);
    alert("Impact calculation copied to clipboard!");
  };

  const generatePDF = () => {
    const { jsPDF } = (window as any).jspdf || {};
    if (!jsPDF) {
      alert("PDF generation engine loading... please try again in a moment.");
      return;
    }

    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // Header
    doc.setFillColor(13, 19, 33);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("ROADSoS STRATEGIC ANALYSIS", 15, 25);
    doc.setFontSize(10);
    doc.text(`GENERATED ON: ${timestamp}`, 15, 33);

    // Summary Section
    doc.setTextColor(13, 19, 33);
    doc.setFontSize(14);
    doc.text(`Proposal for ${region} Administration`, 15, 55);
    
    const tableData = [
      ["Metric", "Value", "Status"],
      ["Target Region", region, "SELECTED"],
      ["Total Fleet Size", data.ambulances.toLocaleString(), "INVENTORY"],
      ["Annual Fatalities", data.deaths.toLocaleString(), "BASELINE"],
      ["Ambulances Equipped", equipped.toLocaleString(), "PROPOSED"],
      ["Est. Lives Saved / Yr", results.livesSaved.toString(), "IMPACT"],
      ["Response Time Delta", `${data.avgResponse}m -> ${results.newResponseTime}m`, "EFFICIENCY"],
      ["Cost Per Life Saved", `₹${results.costPerLife.toLocaleString()}`, "ROI"],
      ["Total Implementation", `₹${results.totalCost.toLocaleString()}`, "CAPEX"]
    ];

    (doc as any).autoTable({
      startY: 65,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [41, 121, 255] },
      styles: { font: "helvetica", fontSize: 10 }
    });

    // Disclaimer
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("CONFIDENTIAL: This report is a simulation based on MoRTH 2023 datasets.", 15, finalY + 20);
    doc.text("ROADSoS AI Engine v2.4 - Predictive Analysis Module.", 15, finalY + 25);

    doc.save(`ROADSoS_Impact_${region.replace(' ', '_')}.pdf`);
  };

  return (
    <div className="w-full bg-(--clr-surface) border border-(--clr-border) rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-(--clr-border) flex items-center justify-between bg-white/2">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Calculator className="text-(--clr-blue)" /> STRATEGIC IMPACT CALCULATOR
          </h2>
          <p className="text-[10px] font-mono text-(--clr-text-2) tracking-widest mt-1 uppercase">v2.4 ROI PROJECTION ENGINE</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-(--clr-blue)/10 border border-(--clr-blue)/20 text-(--clr-blue) text-[10px] font-bold">
          <TrendingDown size={14} /> ALIGNING WITH MoRTH 2030 GOALS
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Controls */}
        <div className="p-8 space-y-8 border-r border-(--clr-border)">
          <div className="space-y-3">
            <label className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-wider">Target Region</label>
            <select 
              value={region} onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-white/5 border border-(--clr-border) p-4 rounded-2xl outline-none focus:border-(--clr-blue) transition-all font-bold"
              aria-label="Select target region"
            >
              {Object.keys(REGIONS).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex justify-between text-[10px] font-mono text-(--clr-text-2)">
              <span>{data.ambulances.toLocaleString()} AMBULANCES</span>
              <span>{data.deaths.toLocaleString()} ANNUAL DEATHS</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-wider">Ambulances Equipped</label>
              <span className="text-(--clr-blue) font-mono font-bold">{equipped.toLocaleString()}</span>
            </div>
            <input 
              type="range" min="10" max={data.ambulances} step="50"
              value={equipped} onChange={(e) => setEquipped(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-(--clr-blue)"
              aria-label="Adjust ambulances equipped"
            />
            <p className="text-[10px] font-mono text-(--clr-text-2)">
              Equipping <span className="text-white">{( (equipped / data.ambulances) * 100 ).toFixed(1)}%</span> of fleet in {region}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-wider block">Response Imp.</label>
              <input 
                type="range" min="0" max="70" step="1"
                value={reduction} onChange={(e) => setReduction(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-(--clr-amber)"
                aria-label="Adjust response time improvement percentage"
              />
              <span className="text-(--clr-amber) font-mono font-bold block text-center">{reduction}%</span>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-wider block">Bystander Rate</label>
              <input 
                type="range" min="0" max="30" step="1"
                value={adoption} onChange={(e) => setAdoption(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-(--clr-green)"
                aria-label="Adjust bystander rate percentage"
              />
              <span className="text-(--clr-green) font-mono font-bold block text-center">{adoption}%</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-8 bg-black/20 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.div 
              key={results.livesSaved}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="p-6 rounded-2xl bg-(--clr-saffron)/5 border border-(--clr-saffron)/20 flex flex-col items-center text-center"
            >
              <Users className="text-(--clr-saffron) mb-2" size={24} />
              <p className="text-3xl font-bold text-(--clr-saffron)">{results.livesSaved}</p>
              <p className="text-[10px] font-mono text-(--clr-text-2) uppercase">Lives Saved / Yr</p>
            </motion.div>

            <motion.div 
              key={results.newResponseTime}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="p-6 rounded-2xl bg-(--clr-blue)/5 border border-(--clr-blue)/20 flex flex-col items-center text-center"
            >
              <TrendingDown className="text-(--clr-blue) mb-2" size={24} />
              <p className="text-3xl font-bold text-white">{results.newResponseTime}</p>
              <p className="text-[10px] font-mono text-(--clr-text-2) uppercase">Avg Min Response</p>
            </motion.div>

            <div className="p-6 rounded-2xl bg-white/5 border border-(--clr-border) flex flex-col items-center text-center">
              <DollarSign className="text-(--clr-green) mb-2" size={20} />
              <p className="text-xl font-bold text-white">₹{results.costPerLife.toLocaleString()}</p>
              <p className="text-[10px] font-mono text-(--clr-text-2) uppercase">Cost / Life Saved</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-(--clr-border) flex flex-col items-center text-center">
              <Activity className="text-(--clr-amber) mb-2" size={20} />
              <p className="text-xl font-bold text-white">{results.injuriesPrevented}</p>
              <p className="text-[10px] font-mono text-(--clr-text-2) uppercase">Injuries Prevented</p>
            </div>
          </div>

          <div className="h-48 mb-8">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleShare}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-(--clr-border) rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Share2 size={18} /> SHARE SUMMARY
            </button>
            <button 
              onClick={generatePDF}
              className="flex-1 py-4 bg-(--clr-blue) text-white rounded-xl font-bold hover:shadow-[0_0_20px_var(--clr-glow-blue)] transition-all"
            >
              EXPORT PDF REPORT
            </button>
          </div>
        </div>
      </div>


      <div className="p-4 bg-white/5 flex items-center gap-3 text-[9px] font-mono text-(--clr-text-2) uppercase tracking-widest">
        <Info size={12} className="text-(--clr-blue)" />
        Based on MoRTH Road Accidents in India 2023. ROI projection uses academic response-time/mortality correlation (Harminder et al., 2019).
      </div>
    </div>
  );
};
