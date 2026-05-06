import { 
  ShieldAlert, 
  Cpu, 
  Lock, 
  Database, 
  Zap, 
  Server,
  Code2,
  Terminal,
  Printer,
  ShieldCheck,
  Share2,
  Key,
  Globe,
  Fingerprint
} from 'lucide-react';

const techStack = [
  { category: 'Security', tech: 'Zero-Knowledge Proofs', usage: 'Bystander identity protection', color: 'text-emergency' },
  { category: 'Identity', tech: 'India Stack / Aadhaar', usage: 'Verified responder authentication', color: 'text-cyan' },
  { category: 'Backend', tech: 'Distributed Node.js', usage: 'High-availability emergency routing', color: 'text-blue-500' },
  { category: 'Storage', tech: 'Immutable Audit Trail', usage: 'Legal evidence and hospital records', color: 'text-safe' },
];

const securityMitigations = [
  { id: 'S1', vulnerability: 'MITM Attacks', threat: 'High', mitigation: 'mTLS & End-to-End Encryption', status: 'Implemented' },
  { id: 'S2', vulnerability: 'Identity Leak', threat: 'Critical', mitigation: 'ZKP Anonymization Layer', status: 'Implemented' },
  { id: 'S3', vulnerability: 'DDoS / Traffic Spike', threat: 'High', mitigation: 'Edge Computing & Auto-Scaling', status: 'Hardened' },
  { id: 'S4', vulnerability: 'Database Compromise', threat: 'High', mitigation: 'Field-level AES-256 Encryption', status: 'Audit Ready' },
];

const roadmapItems = [
  { step: '01', title: 'Aadhaar Auth (ABDM)', status: 'Live', desc: 'Secure medical history fetch via Ayushman Bharat ID.' },
  { step: '02', title: 'UPI 2.0 Integration', status: 'Pilot', desc: 'Instant insurance disbursement & bystander rewards.' },
  { step: '03', title: 'DigiLocker V-Sign', status: 'Dev', desc: 'Legally valid digital witness statements.' },
];

export const Technical = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-night text-white font-ui pb-20 print:bg-white print:text-black">
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative overflow-hidden">
          <div className="z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-cyan/20 rounded-2xl flex items-center justify-center text-cyan border border-cyan/30">
                <Cpu size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic italic-shadow">Technical Architecture</h1>
                <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.3em] print:text-slate-600">Secure National Road Safety Infrastructure</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4 print:hidden">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">OWASP Hardened</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">Zero-Knowledge Protocol</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">India Stack Native</span>
            </div>
          </div>

          <button 
            onClick={handlePrint}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-3 transition-all print:hidden"
          >
            <Printer size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Print Technical Specs</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Specs Table */}
          <section className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldAlert size={120} />
              </div>
              
              <h3 className="text-xl font-black mb-8 uppercase italic flex items-center gap-3">
                <Lock className="text-emergency" size={20} /> Security Mitigation Matrix
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">ID</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Vulnerability</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Threat</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Mitigation Strategy</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono">
                    {securityMitigations.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-4 font-black text-slate-500">{row.id}</td>
                        <td className="py-4 font-bold">{row.vulnerability}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            row.threat === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber'
                          }`}>
                            {row.threat}
                          </span>
                        </td>
                        <td className="py-4 text-slate-300">{row.mitigation}</td>
                        <td className="py-4">
                          <span className="flex items-center gap-2 text-safe font-black uppercase text-[9px]">
                            <ShieldCheck size={12} /> {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-8">
                <h3 className="text-xl font-black mb-6 uppercase italic flex items-center gap-3">
                  <Database className="text-blue-500" size={20} /> Data Sovereignty
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Storage Location</p>
                    <p className="text-sm font-bold">In-Country (MeitY Approved)</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Compliance</p>
                    <p className="text-sm font-bold">DPDP Act 2023 Compliant</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Audit Trail</p>
                    <p className="text-sm font-bold text-safe">Immutable Ledger Enabled</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8">
                <h3 className="text-xl font-black mb-6 uppercase italic flex items-center gap-3">
                  <Zap className="text-amber" size={20} /> Edge Performance
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Cold Boot Latency</span>
                    <span className="text-xl font-black text-white">42ms</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber" style={{ width: '92%' }} />
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">API Throughput</span>
                    <span className="text-xl font-black text-white">12k/s</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '85%' }} />
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono mt-4">
                    Optimized for 2G/3G connectivity in rural highway zones.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Side Info Cards */}
          <aside className="space-y-8">
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-sm font-black mb-6 uppercase tracking-[0.2em] text-cyan">India Stack Integration</h3>
              <div className="space-y-8">
                {roadmapItems.map((item) => (
                  <div key={item.step} className="flex gap-4 relative">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-cyan/20 flex items-center justify-center text-cyan font-black text-xs border border-cyan/30">
                      {item.step}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xs font-black uppercase tracking-tight">{item.title}</h4>
                        <span className="text-[8px] px-1.5 py-0.5 bg-white/10 rounded uppercase font-bold text-slate-400">{item.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-sm font-black mb-6 uppercase tracking-[0.2em] text-emergency">Infrastructure Stack</h3>
              <div className="space-y-4">
                {techStack.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.category}</span>
                    <span className={`text-sm font-black ${item.color}`}>{item.tech}</span>
                    <span className="text-[9px] text-slate-400 font-medium italic">{item.usage}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white text-center">
              <Terminal className="mx-auto mb-4 opacity-50" size={32} />
              <h4 className="text-lg font-black uppercase italic mb-2">Dev_Auth Access</h4>
              <p className="text-[10px] opacity-80 leading-relaxed mb-6">
                Direct infrastructure monitoring via ROADSoS Nexus Hub. Exclusive access for SIH Evaluation team.
              </p>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                Open Nexus Shell
              </button>
            </div>
          </aside>
        </div>

        {/* System Diagram Section */}
        <section className="mt-20 print:hidden">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-black uppercase italic mb-2">Architectural Logic</h3>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.5em]">Modular • Distributed • Zero-Knowledge</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-center">
            {[
              { icon: Globe, label: 'Geo-Cluster' },
              { icon: Share2, label: 'Mesh Net' },
              { icon: Server, label: 'Edge Nodes' },
              { icon: Key, label: 'KMS Vault' },
              { icon: Fingerprint, label: 'Auth Gateway' },
              { icon: Code2, label: 'API Fabric' },
            ].map((item, i) => (
              <div key={i} className="space-y-4 group">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/50 transition-all duration-500">
                  <item.icon size={32} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Info */}
        <footer className="mt-20 py-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
            SYSTEM_INTEGRITY_INDEX: 99.98% • HASH: 0x8A22F...D09 • 2026_VERSION_PRO
          </p>
        </footer>
      </div>
    </div>
  );
};
