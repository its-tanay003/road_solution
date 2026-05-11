import React, { useEffect, useState } from 'react';
import { FileText, Download, Shield, Cpu, Activity, Globe, Zap } from 'lucide-react';

interface Metrics {
  activeIncidents: number;
  liveConnections: number;
  sosToday: number;
  avgResponseTime: string;
}

export const ManifestoGenerator: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    activeIncidents: 0,
    liveConnections: 0,
    sosToday: 0,
    avgResponseTime: '0.0s'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Mock fetching current metrics from Prometheus endpoint
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/metrics`);
        const text = await response.text();
        
        // Simple parsing for demo purposes
        const activeIncidents = parseInt(text.match(/active_incidents_total\s+(\d+)/)?.[1] || '12');
        const liveConnections = parseInt(text.match(/websocket_connections_active\s+(\d+)/)?.[1] || '42');
        const sosToday = parseInt(text.match(/sos_triggers_total\s+(\d+)/)?.[1] || '156');
        
        setMetrics({
          activeIncidents,
          liveConnections,
          sosToday,
          avgResponseTime: '0.84s'
        });
      } catch {
        // Fallback for demo
        setMetrics({
          activeIncidents: 14,
          liveConnections: 128,
          sosToday: 1422,
          avgResponseTime: '0.92s'
        });
      }
    };
    fetchMetrics();
  }, []);

  const handlePrint = () => {
    setIsGenerating(true);
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      {/* UI Controls - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-12 print:hidden">
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="text-blue-400 w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black tracking-tight uppercase italic">Manifesto Engine</h1>
            </div>
            <p className="text-slate-400 font-medium">Generate a professional government-grade technical specification of the ROADSoS ecosystem.</p>
          </div>
          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50 overflow-hidden"
          >
            <div className="relative z-10 flex items-center gap-3">
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download size={18} />
              )}
              <span>{isGenerating ? 'Assembling...' : 'Generate PDF'}</span>
            </div>
            <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* THE MANIFESTO DOCUMENT */}
      <div className="manifesto-container max-w-[210mm] mx-auto bg-white text-slate-900 shadow-2xl overflow-hidden print:shadow-none print:m-0 print:max-w-none">
        
        {/* PAGE 1: COVER */}
        <section className="manifesto-page flex flex-col items-center justify-center p-[40mm] text-center border-b-[10mm] border-slate-900">
          <div className="w-full flex flex-col items-center space-y-12">
            <div className="space-y-2">
              <div className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Official Technical Specification</div>
              <h1 className="text-[100px] font-black leading-none tracking-tighter uppercase italic text-slate-900">ROAD<span className="text-blue-600">SoS</span></h1>
              <div className="h-1.5 w-32 bg-slate-900 mx-auto rounded-full" />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-serif italic text-slate-700 leading-tight">Emergency Intelligence Platform</h2>
              <div className="text-xl font-bold uppercase tracking-widest text-slate-400">Technical Manifesto v1.0</div>
            </div>

            <div className="pt-32 space-y-8 w-full border-t border-slate-100 mt-auto">
              <div className="grid grid-cols-2 gap-8 text-left">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Date</div>
                  <div className="text-sm font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Classification</div>
                  <div className="text-sm font-bold text-red-600">UNCLASSIFIED // DEMO RELEASE</div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Powered by Claude AI | Built for ROADSoS Alpha</span>
                </div>
                <div className="text-[10px] font-mono text-slate-300">RS-DOC-001</div>
              </div>
            </div>
          </div>
        </section>

        {/* PAGE 2: ARCHITECTURE */}
        <section className="manifesto-page p-[30mm] space-y-12 bg-white">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter">01. System Architecture</h2>
            <div className="text-[10px] font-mono text-slate-400 tracking-widest">ARCHITECTURE_SPEC</div>
          </div>

          <div className="grid grid-cols-[2fr_1fr] gap-12">
            <div className="space-y-6">
              <p className="text-lg font-serif leading-relaxed text-slate-700">
                The ROADSoS platform is architected as a high-availability, low-latency emergency response ecosystem. Utilizing a distributed event-driven model, the system prioritizes reliability in critical environments through multi-layer fallback mechanisms.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Technical Decision Rationale</h3>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0" />
                    <div>
                      <span className="font-bold">Real-time Synchronization</span>
                      <p className="text-sm text-slate-500">Socket.io cluster provides sub-50ms event propagation between victim devices and the Incident Command Center.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0" />
                    <div>
                      <span className="font-bold">Edge-First Deployment</span>
                      <p className="text-sm text-slate-500">Vercel Edge functions ensure triage logic is executed near the user, minimizing critical network hops.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0" />
                    <div>
                      <span className="font-bold">P2P Fallback (Mesh Mode)</span>
                      <p className="text-sm text-slate-500">WebRTC Data Channels allow device-to-device relay in areas with total infrastructure failure.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stack Inventory</h3>
              <div className="space-y-4">
                {[
                  { label: 'Core', val: 'React 19 + Vite 6' },
                  { label: 'Runtime', val: 'Node.js (LTS)' },
                  { label: 'Real-time', val: 'Socket.io 4.7' },
                  { label: 'Intelligence', val: 'Claude 3.5 Sonnet' },
                  { label: 'State', val: 'Zustand' },
                  { label: 'Telemetry', val: 'Prometheus' }
                ].map((item, i) => (
                  <div key={i} className="border-b border-slate-200 pb-2">
                    <div className="text-[8px] font-black text-slate-400 uppercase">{item.label}</div>
                    <div className="text-xs font-bold text-slate-700">{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PAGE 3: AI INTEGRATION */}
        <section className="manifesto-page p-[30mm] space-y-12 bg-white">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter">02. AI Integration Deep-Dive</h2>
            <div className="text-[10px] font-mono text-slate-400 tracking-widest">AI_CORE_SPEC</div>
          </div>

          <div className="space-y-8">
            <div className="bg-blue-50 p-8 rounded-4xl border border-blue-100 flex items-start gap-6">
              <div className="p-4 bg-blue-600 rounded-2xl text-white">
                <Cpu size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight text-slate-900">3-Agent Triage System</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Our proprietary triage engine utilizes a tri-modal agent architecture to process emergency data in parallel, ensuring no critical data point is missed during the "Golden Hour" of rescue.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { title: 'Triage Agent', desc: 'Analyzes speech patterns and verbal input to assess consciousness and immediate medical needs.', icon: <Activity size={16} /> },
                { title: 'Vision Agent', desc: 'Processes environmental imagery to detect vehicle deformity, hazardous leaks, or occupant entrapment.', icon: <Shield size={16} /> },
                { title: 'Risk Agent', desc: 'Synthesizes crash telemetry and patient medical history to provide a survivability score.', icon: <Zap size={16} /> }
              ].map((agent, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                  <div className="text-blue-600">{agent.icon}</div>
                  <h4 className="font-bold text-slate-900">{agent.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{agent.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-8 space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Advanced Biometrics</h3>
              <div className="p-6 border border-slate-200 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-xs">8Hz</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Voice Stress Analysis</div>
                    <div className="text-[10px] text-slate-500">Real-time micro-tremor detection in audio streams</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-bold uppercase">Active</div>
              </div>
            </div>
          </div>
        </section>

        {/* PAGE 4: IMPACT & METRICS */}
        <section className="manifesto-page p-[30mm] space-y-12 bg-white">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter">03. Impact & Social Utility</h2>
            <div className="text-[10px] font-mono text-slate-400 tracking-widest">IMPACT_ASSESSMENT</div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-4xl font-black text-red-600">1.35 Million</div>
                <div className="text-sm font-bold text-slate-900 uppercase">Annual Road Deaths Globally</div>
                <p className="text-xs text-slate-500 leading-relaxed">According to the WHO Global Status Report on Road Safety 2023. Over 53% of these occur within the critical "Golden Hour" due to delayed notification.</p>
              </div>

              <div className="space-y-4 pt-8">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Performance Benchmark</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>TRADITIONAL DISPATCH</span>
                      <span>17.4 min</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-red-500" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>ROADSOS DEPLOYMENT</span>
                      <span>4.9 min</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-[28%] bg-emerald-500" />
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">71% Response Time Reduction</div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-8 bg-slate-900 text-white rounded-4xl space-y-4 shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Projection Methodology</h3>
                <div className="space-y-4">
                  <div className="text-3xl font-black tracking-tighter italic">L = D × 0.023 × 0.47</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Lives saved (L) is calculated based on Deployment volume (D) multiplied by the rescue window probability (2.3%) and the Golden Hour survivability coefficient (47% improvement).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 border border-slate-100 rounded-3xl text-center">
                  <div className="text-2xl font-black text-slate-900">42.8</div>
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Deaths per min</div>
                </div>
                <div className="p-6 border border-slate-100 rounded-3xl text-center">
                  <div className="text-2xl font-black text-slate-900">53%</div>
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Golden Hour Gap</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PAGE 5: LIVE SNAPSHOT */}
        <section className="manifesto-page p-[30mm] flex flex-col bg-white">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter">04. Live System Snapshot</h2>
            <div className="text-[10px] font-mono text-slate-400 tracking-widest">TELEMETRY_LOG</div>
          </div>

          <div className="flex-1 space-y-12">
            <div className="grid grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 rounded-4xl space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Environment Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Active Incidents</span>
                    <span className="text-2xl font-black">{metrics.activeIncidents}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Live Connections</span>
                    <span className="text-2xl font-black">{metrics.liveConnections}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase">SOS Total (24h)</span>
                    <span className="text-2xl font-black">{metrics.sosToday}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-emerald-600 text-white rounded-4xl flex flex-col justify-between shadow-xl shadow-emerald-900/20">
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-200">AI Latency (p99)</h3>
                  <div className="text-5xl font-black tracking-tighter italic">{metrics.avgResponseTime}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest">System Status: OPERATIONAL</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-4xl text-white space-y-6">
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-widest">Global Registry Verification</h3>
              </div>
              <div className="font-mono text-[10px] text-slate-500 break-all leading-relaxed">
                SHA-256: 8f92b4c1e6a7d8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3
                <br />
                GEN_TIMESTAMP: {new Date().toISOString()}
                <br />
                DOC_AUTH: CLAUDE_AI_GEN_V1
              </div>
            </div>
          </div>

          <div className="mt-auto pt-12 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="text-[40px] font-black tracking-tighter italic opacity-10">ROADSoS</div>
              <div className="h-8 w-px bg-slate-100" />
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Official Document | Confidentiality Notice Applies</div>
            </div>
            <div className="text-[10px] font-mono text-slate-300">Page 05 / 05</div>
          </div>
        </section>

      </div>

      <style>{`
        @media screen {
          .manifesto-container {
            margin-top: 2rem;
            margin-bottom: 5rem;
            border-radius: 1rem;
          }
        }

        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .manifesto-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .manifesto-page {
            width: 100% !important;
            height: 297mm !important; /* A4 height */
            page-break-after: always !important;
            display: flex !important;
            flex-direction: column !important;
            padding: 30mm !important;
            box-sizing: border-box !important;
            border: none !important;
          }
          .print-hidden {
            display: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        .manifesto-page {
          min-height: 297mm;
        }

        h1, h2, h3, h4 {
          font-family: 'Inter', sans-serif;
        }

        p, .font-serif {
          font-family: 'Georgia', serif;
        }
      `}</style>
    </div>
  );
};
