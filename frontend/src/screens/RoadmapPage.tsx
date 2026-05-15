import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Code, Star, ExternalLink 
} from 'lucide-react';

/* ── Helpers ────────────────────────────────────────────── */


/* ── Data ───────────────────────────────────────────────── */
const phases = [
  {
    label: 'Phase 1 — Pilot',
    period: 'Month 1–6',
    color: 'var(--saffron)',
    ring: 'ring-saffron',
    items: [
      { k: 'Target', v: 'Kancheepuram district, Tamil Nadu (NH-48 corridor)' },
      { k: 'Users', v: '50,000 downloads' },
      { k: 'Partners', v: 'TN SDMA · GVK EMRI (108 TN operator)' },
      { k: 'Budget', v: '₹8.2 lakh (infra + AI API + ops)' },
      { k: 'KPI', v: 'Response time 18 min → 10 min' },
    ],
  },
  {
    label: 'Phase 2 — State Scale',
    period: 'Month 7–18',
    color: 'var(--blue)',
    ring: 'ring-blue',
    items: [
      { k: 'Target', v: 'Tamil Nadu + Karnataka + Maharashtra' },
      { k: 'Users', v: '5 million downloads' },
      { k: 'Partners', v: 'NHAI · MoRTH iRAD team · State 108 centers' },
      { k: 'Budget', v: '₹47 lakh/year' },
      { k: 'KPI', v: '15% reduction in Golden Hour fatalities' },
    ],
  },
  {
    label: 'Phase 3 — National',
    period: 'Month 19–36',
    color: 'var(--green)',
    ring: 'ring-green',
    items: [
      { k: 'Target', v: 'All 28 states · 100M+ potential users' },
      { k: 'Roadmap', v: 'Drone + AR HUD hardware integration · PM Gati Shakti corridors' },
      { k: 'Partners', v: 'MoRTH · DGCA · CERT-In · NHA' },
      { k: 'Budget', v: '₹2.4 crore/year (govt-subsidised infra)' },
      { k: 'KPI', v: 'iRAD automated coverage >40% of NH accidents' },
    ],
  },
];

const costRows = [
  { scale: 'Pilot', mau: '10,000', claude: '500', infra: '₹4,200', total: '₹12,800' },
  { scale: 'State', mau: '500,000', claude: '8,000', infra: '₹28,000', total: '₹68,000' },
  { scale: 'National', mau: '50,00,000', claude: '65,000', infra: '₹1,85,000', total: '₹4,20,000' },
];

const govNodes = [
  { id: 'app', label: 'ROADSoS App', ministry: 'Core Platform', status: 'Live', color: 'var(--saffron)' },
  { id: 'n112', label: '112 India', ministry: 'MHA / NEC', status: 'Operational', color: 'var(--blue)' },
  { id: 'irad', label: 'iRAD MoRTH', ministry: 'Ministry of Road Transport', status: 'Integrated', color: 'var(--green)' },
  { id: 'emri', label: '108 GVK EMRI', ministry: 'State Health Departments', status: 'Pending MoU', color: 'var(--amber)' },
  { id: 'hie', label: 'Hospital HIE', ministry: 'NHA / Ayushman Bharat', status: 'Planned', color: 'var(--purple)' },
  { id: 'vaahan', label: 'VAHAN RTO', ministry: 'MoRTH NR', status: 'Staging', color: 'var(--purple)' },
  { id: 'nhai', label: 'NHAI Black Spots', ministry: 'Ministry of Road Transport', status: 'Integrated', color: 'var(--blue)' },
];

const statusColor: Record<string, string> = {
  Live: '#00E676', Staging: '#FFD600', 'Pending MoU': '#FF9933', Planned: '#90A4AE', Integrated: '#00E676',

};

const checklist = [
  { label: 'MoRTH iRAD API partnership letter', status: 'Ready', party: 'Project Lead' },
  { label: 'GVK EMRI 108 data-sharing MoU', status: 'In Progress', party: 'Legal / SDMA' },
  { label: 'CERT-In security audit clearance', status: 'In Progress', party: 'DevSecOps team' },
  { label: 'Tamil Nadu SDMA integration', status: 'Pending', party: 'State IT dept.' },
  { label: 'Google Play + App Store submission', status: 'Ready', party: 'Dev Team' },
  { label: 'WhatsApp Business API approval', status: 'Pending', party: 'Meta / Partner' },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = { Ready: 'bg-green-900 text-green-300', 'In Progress': 'bg-yellow-900 text-yellow-300', Pending: 'bg-gray-800 text-gray-400' };
  return map[s] ?? 'bg-gray-800 text-gray-400';
};

const comparison = [
  { feature: 'Hands-free SOS', roadsos: true, n112: false, gps: 'Some' },
  { feature: 'AI triage', roadsos: true, n112: false, gps: false },
  { feature: '108 integration', roadsos: true, n112: true, gps: false },
  { feature: 'Offline mode', roadsos: true, n112: 'Limited', gps: false },
  { feature: 'Bystander guidance', roadsos: true, n112: false, gps: false },
  { feature: 'iRAD auto-report', roadsos: true, n112: false, gps: false },
  { feature: 'Cost per event', roadsos: '₹0.08', n112: '₹0 (BSNL)', gps: '₹12–45/mo' },
];

const cell = (v: boolean | string) => {
  if (v === true) return <span className="text-green-400 font-bold">✓ Yes</span>;
  if (v === false) return <span className="text-red-400">✗ No</span>;
  return <span className="text-yellow-400">{v}</span>;
};

/* ── Impact Calculator ───────────────────────────────────── */
const ImpactCalc = () => {
  const [adoption, setAdoption] = useState(5);
  const [timeSaved, setTimeSaved] = useState(6);
  const annualAccidents = 847;
  const fatalityRate = 0.368; // 312/847
  const goldenHourImprovement = timeSaved / 18; // % of golden hour reclaimed
  const projected = Math.round(adoption / 100 * annualAccidents * fatalityRate * goldenHourImprovement * 0.35);
  return (
    <div className="bg-raised rounded-2xl p-6 border border-saffron/30">
      <h3 className="text-saffron font-bold text-lg mb-4">📊 Impact Projection Calculator</h3>
      <p className="text-text-secondary text-sm mb-6">Kancheepuram District · 847 accidents/year · 312 deaths</p>
      <div className="space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-1"><span className="text-text-secondary">Adoption rate</span><span className="text-saffron font-mono">{adoption}%</span></div>
          <input type="range" min={1} max={30} value={adoption} onChange={e => setAdoption(+e.target.value)} aria-label="Adoption Rate" className="w-full accent-saffron" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1"><span className="text-text-secondary">Response time improvement</span><span className="text-blue font-mono">{timeSaved} min faster</span></div>
          <input type="range" min={2} max={15} value={timeSaved} onChange={e => setTimeSaved(+e.target.value)} aria-label="Response Time Improvement" className="w-full accent-blue" />
        </div>
      </div>
      <div className="mt-6 p-4 bg-base rounded-xl text-center">
        <div className="text-4xl font-black text-green">{projected}</div>
        <div className="text-text-secondary text-sm mt-1">projected lives saved per year</div>
      </div>
      <p className="text-text-hint text-xs mt-4">
        Formula: adoption_rate × annual_accidents × fatality_rate × (time_saved/18) × 0.35<br/>
        Source: WHO Golden Hour survival curves + MoRTH 2023 fatality data
      </p>
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────── */
export default function RoadmapPage() {
  const nav = useNavigate();
  const [checklistOpen, setChecklistOpen] = useState(false);
  const govRef = useRef<HTMLDivElement>(null);
  const govInView = useInView(govRef, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-base text-text font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-base/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={() => nav(-1)} aria-label="Go back" className="text-text-secondary hover:text-white transition-colors text-sm"><ArrowLeft size={16} /></button>
        <h1 className="text-white font-bold">Deployment & Scalability Roadmap</h1>
        <span className="ml-auto text-xs text-saffron bg-saffron/10 px-3 py-1 rounded-full">GovCloud v1.0</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">

        {/* SECTION A — Timeline */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white">Three-Phase Rollout</h2>
            <p className="text-gray-400 mt-2">From district pilot to national infrastructure</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {phases.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`bg-raised rounded-2xl p-6 ring-1 ring-(--saffron)/40`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span 
                    className="text-xs font-mono px-2 py-1 rounded" 
                    style={{ background: `color-mix(in srgb, ${p.color}, transparent 85%)`, color: p.color } as React.CSSProperties}
                  >
                    {p.period}
                  </span>
                  <span className="text-2xl font-black" style={{ color: p.color } as React.CSSProperties}>0{i + 1}</span>
                </div>
                <h3 className="font-bold text-white mb-4">{p.label}</h3>
                <div className="space-y-2">
                  {p.items.map(item => (
                    <div key={item.k} className="text-sm">
                      <span className="text-gray-500">{item.k}: </span>
                      <span className="text-gray-200">{item.v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION B — Cost Model */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6">API Cost Model at Scale</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-raised text-text-secondary">
                <tr>
                  {['Scale', 'MAU', 'Claude API calls/day', 'Infra (Vercel/AWS)', 'Total/month'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {costRows.map((r, i) => (
                  <tr key={r.scale} className={i % 2 === 0 ? 'bg-raised/50' : 'bg-base'}>
                    <td className="px-4 py-3 font-bold text-saffron">{r.scale}</td>
                    <td className="px-4 py-3 font-mono text-text-secondary">{r.mau}</td>
                    <td className="px-4 py-3 font-mono text-text-secondary">{r.claude}</td>
                    <td className="px-4 py-3 font-mono text-text-secondary">{r.infra}</td>
                    <td className="px-4 py-3 font-mono font-bold text-green">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-sm mt-3 italic">
            At national scale, Claude API costs represent <span className="text-[#FF9933]">₹0.08 per emergency event</span> — less than an SMS.
            Government CERT-In cloud deployment reduces infra cost by 60%.
          </p>
        </section>

        {/* SECTION C — Gov Integration Diagram */}
        <section ref={govRef}>
          <h2 className="text-2xl font-black text-white mb-8">Government Integration Stack</h2>
          <div className="bg-raised rounded-2xl p-8 border border-white/10">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {govNodes.map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={govInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: i * 0.1 }}
                  className="bg-base rounded-xl p-4 border border-white/5 flex flex-col gap-2"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color } as React.CSSProperties} />
                  <div className="font-bold text-white text-sm">{node.label}</div>
                  <div className="text-gray-500 text-xs">{node.ministry}</div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full w-fit"
                    style={{ 
                      backgroundColor: `color-mix(in srgb, ${statusColor[node.status]}, transparent 85%)`, 
                      color: statusColor[node.status] 
                    } as React.CSSProperties}
                  >
                    {node.status}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 text-center text-gray-600 text-xs">
              Data flows: ROADSoS App → 112 India → iRAD MoRTH | 108 GVK EMRI → Hospital HIE | VAHAN RTO → NHAI
            </div>
          </div>
        </section>

        {/* SECTION D — Pilot District Deep-Dive */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6">Pilot District: Kancheepuram, Tamil Nadu</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-raised rounded-2xl p-6 border border-saffron/20">
              <h3 className="text-saffron font-bold mb-4">📍 District Profile (MoRTH 2023)</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Annual accidents', '847'],
                  ['Annual deaths', '312'],
                  ['NH-48 black spots', '4 identified stretches'],
                  ['Nearest trauma centres', 'SSKM Chennai (34km) · Chengalpattu GH (12km)'],
                  ['108 EMRI vehicles', '11 in district'],
                  ['DigiLocker penetration', '67%'],
                  ['Aarogya Setu registered', '1.2 lakh users'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-gray-500 min-w-fit">{k}:</span>
                    <span className="text-gray-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-raised rounded-2xl p-6 border border-blue/20">
              <h3 className="text-blue font-bold mb-4">🎯 Why Kancheepuram?</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Geographic diversity — urban NH + rural SH coverage</li>
                <li>• High accident corridor on NH-48 (Sriperumbudur belt)</li>
                <li>• Existing GVK EMRI 108 partnership potential</li>
                <li>• IIT Madras proximity for ongoing tech support</li>
                <li>• Strong DigiLocker + Aarogya Setu penetration</li>
                <li>• TN SDMA already active in the region</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Impact Calculator */}
        <section>
          <ImpactCalc />
        </section>

        {/* Comparison Table */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6">ROADSoS vs Alternatives</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-raised text-text-secondary">
                <tr>
                  <th className="px-4 py-3 text-left">Feature</th>
                  <th className="px-4 py-3 text-center text-saffron">ROADSoS</th>
                  <th className="px-4 py-3 text-center">Manual 112 call</th>
                  <th className="px-4 py-3 text-center">GPS Trackers</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((r, i) => (
                  <tr key={r.feature} className={i % 2 === 0 ? 'bg-raised/50' : 'bg-base'}>
                    <td className="px-4 py-3 text-gray-300">{r.feature}</td>
                    <td className="px-4 py-3 text-center">{cell(r.roadsos)}</td>
                    <td className="px-4 py-3 text-center">{cell(r.n112)}</td>
                    <td className="px-4 py-3 text-center">{cell(r.gps)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Launch Checklist */}
        <section>
          <button
            onClick={() => setChecklistOpen(o => !o)}
            aria-expanded={checklistOpen ? "true" : "false"}
            aria-label="Toggle Phase 1 Launch Checklist"
            className="w-full flex items-center justify-between bg-raised rounded-2xl p-5 border border-white/10 hover:border-saffron/40 transition-colors"
          >
            <span className="font-bold text-white">Phase 1 Launch Checklist</span>
            <span className="text-saffron">{checklistOpen ? '▲' : '▼'}</span>
          </button>
          {checklistOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-raised rounded-b-2xl border border-t-0 border-white/10 overflow-hidden"
            >
              <div className="p-5 space-y-3">
                {checklist.map(item => (
                  <label key={item.label} className="flex items-center gap-3 text-sm cursor-pointer">
                    <input type="checkbox" readOnly checked className="accent-(--saffron)" aria-label={item.label} />
                    <span className="flex-1 text-gray-300">{item.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(item.status)}`}>{item.status}</span>
                    <span className="text-gray-600 text-xs hidden sm:block">{item.party}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </section>

        {/* Final CTA - Premium Bento Style */}
        <section className="bg-linear-to-br from-raised to-base rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-(--saffron)/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-(--saffron)/15 flex items-center justify-center shadow-[0_0_20px_rgba(255,179,0,0.2)]">
                <Star className="text-(--saffron)" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Join the Mission</h2>
                <p className="text-gray-400 font-medium">Building India's safest road intelligence network.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="https://github.com/its-tanay003/road_solution" target="_blank" rel="noopener noreferrer"
                aria-label="Contribute on GitHub"
                className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 transition-all font-black text-white group/btn">
                <Code size={20} className="group-hover/btn:scale-110 transition-transform" /> 
                GitHub Source
              </a>
              <a href="mailto:roadsos@example.com?subject=Partnership Inquiry"
                className="flex items-center justify-center gap-3 bg-(--saffron) hover:bg-(--saffron)/90 p-4 rounded-2xl transition-all font-black text-black shadow-[0_4px_15px_rgba(255,179,0,0.3)]">
                Government / NGO Inquiry
              </a>
              <button onClick={() => nav('/assistant')}
                className="flex items-center justify-center gap-3 bg-(--blue)/10 hover:bg-(--blue)/20 p-4 rounded-2xl border border-(--blue)/30 transition-all font-black text-(--blue)">
                📊 Technical Whitepaper
              </button>
              <button onClick={() => nav('/assistant')}
                className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 transition-all font-black text-white">
                <ExternalLink size={18} /> Documentation
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
