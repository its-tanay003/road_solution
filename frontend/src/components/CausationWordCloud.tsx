import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Hash } from 'lucide-react';

declare global {
  interface Window {
    d3: any;
  }
}

const words = [
  { text: "SPEEDING", size: 98, category: "human error" },
  { text: "NIGHT DRIVING", size: 72, category: "human error" },
  { text: "DRUNK DRIVING", size: 61, category: "human error" },
  { text: "DISTRACTION", size: 54, category: "human error" },
  { text: "WEATHER", size: 43, category: "environmental" },
  { text: "WRONG SIDE", size: 38, category: "human error" },
  { text: "ANIMAL CROSSING", size: 31, category: "environmental" },
  { text: "ROAD CONDITION", size: 28, category: "infrastructure" },
  { text: "FATIGUE", size: 22, category: "human error" },
  { text: "MECHANICAL FAILURE", size: 15, category: "infrastructure" }
];

export const CausationWordCloud: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Dynamically load D3 from CDN as requested
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js";
    script.async = true;
    script.onload = () => initCloud();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initCloud = () => {
    const d3 = window.d3;
    if (!d3 || !svgRef.current) return;

    const width = 500;
    const height = 300;
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height);

    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const fontScale = d3.scaleSqrt()
      .domain([10, 100])
      .range([12, 42]);

    const getColor = (category: string) => {
      switch (category) {
        case 'human error': return '#FF7F50'; // coral
        case 'environmental': return '#008080'; // teal
        case 'infrastructure': return '#2979FF'; // blue
        default: return '#ffffff';
      }
    };

    // A simple circular distribution as we don't have d3-cloud lib
    words.forEach((d, i) => {
      const angle = (i / words.length) * Math.PI * 2;
      const radius = 80 + Math.random() * 40;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${x},${y})`)
        .style("font-size", `${fontScale(d.size)}px`)
        .style("font-family", "JetBrains Mono, monospace")
        .style("font-weight", "900")
        .style("fill", getColor(d.category))
        .style("opacity", 0)
        .text(d.text)
        .transition()
        .duration(800)
        .delay(i * 100)
        .style("opacity", 0.8);
    });

    // Central Label
    g.append("text")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-family", "JetBrains Mono")
      .style("font-weight", "bold")
      .style("fill", "#ffffff")
      .style("opacity", 0.2)
      .text("ROOT CAUSES");
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-[#0A0F1A] border border-white/10 shadow-2xl overflow-hidden relative group h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
            <Hash className="text-amber-500" size={20} />
            CAUSATION SEMANTICS
          </h3>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">
            D3 WordCloud · NLP Incident Processing
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-black/20 rounded-3xl border border-white/5 relative overflow-hidden">
        <svg ref={svgRef} />
        
        {/* Category Legend */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF7F50]" />
              <span className="text-[8px] font-mono text-white/40 uppercase">Human Error</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#008080]" />
              <span className="text-[8px] font-mono text-white/40 uppercase">Environmental</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2979FF]" />
              <span className="text-[8px] font-mono text-white/40 uppercase">Infrastructure</span>
           </div>
        </div>
      </div>
    </div>
  );
};
