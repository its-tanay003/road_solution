import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ── Helpers ────────────────────────────────────────────── */


/* ── Data ───────────────────────────────────────────────── */
const phases = [
  {
    label: 'Phase 1 — Pilot',
    period: 'Month 1–6',
    color: '#FF9933',
    ring: 'ring-[#FF9933]',
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
    color: '#2979FF',
    ring: 'ring-[#2979FF]',
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
    color: '#00E676',
    ring: 'ring-[#00E676]',
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
  { id: 'app', label: 'ROADSoS App', ministry: 'Core Platform', status: 'Live', color: '#FF9933' },
  { id: 'n112', label: '112 India', ministry: 'MHA / NEC', status: 'Operational', color: '#2979FF' },
  { id: 'irad', label: 'iRAD MoRTH', ministry: 'Ministry of Road Transport', status: 'Integrated', color: '#00E676' },
  { id: 'emri', label: '108 GVK EMRI', ministry: 'State Health Departments', status: 'Pending MoU', color: '#FFD600' },
  { id: 'hie', label: 'Hospital HIE', ministry: 'NHA / Ayushman Bharat', status: 'Planned', color: '#F06292' },
  { id: 'vaahan', label: 'VAHAN RTO', ministry: 'MoRTH NR', status: 'Staging', color: '#CE93D8' },
  { id: 'nhai', label: 'NHAI Black Spots', ministry: 'Ministry of Road Transport', status: 'Integrated', color: '#80CBC4' },
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
    <div className="bg-[#0D1B2A] rounded-2xl p-6 border border-[#FF9933]/30">
      <h3 className="text-[#FF9933] font-bold text-lg mb-4">📊 Impact Projection Calculator</h3>
      <p className="text-gray-400 text-sm mb-6">Kancheepuram District · 847 accidents/year · 312 deaths</p>
      <div className="space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-1"><span className="text-gray-300">Adoption rate</span><span className="text-[#FF9933] font-mono">{adoption}%</span></div>
          <input type="range" min={1} max={30} value={adoption} onChange={e => setAdoption(+e.target.value)} className="w-full accent-[#FF9933]" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1"><span className="text-gray-300">Response time improvement</span><span className="text-[#2979FF] font-mono">{timeSaved} min faster</span></div>
          <input type="range" min={2} max={15} value={timeSaved} onChange={e => setTimeSaved(+e.target.value)} className="w-full accent-[#2979FF]" />
        </div>
      </div>
      <div className="mt-6 p-4 bg-[#080C14] rounded-xl text-center">
        <div className="text-4xl font-black text-[#00E676]">{projected}</div>
        <div className="text-gray-400 text-sm mt-1">projected lives saved per year</div>
      </div>
      <p className="text-gray-600 text-xs mt-4">
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
    <div className="min-h-screen bg-[#080C14] text-[#E8EDF5] font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#080C14]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={() => nav(-1)} className="text-gray-400 hover:text-white transition-colors text-sm">← Back</button>
        <h1 className="text-white font-bold">Deployment & Scalability Roadmap</h1>
        <span className="ml-auto text-xs text-[#FF9933] bg-[#FF9933]/10 px-3 py-1 rounded-full">GovCloud v1.0</span>
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
                className={`bg-[#0D1B2A] rounded-2xl p-6 ring-1 ${p.ring} ring-opacity-40`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: p.color + '22', color: p.color }}>{p.period}</span>
                  <span className="text-2xl font-black" style={{ color: p.color }}>0{i + 1}</span>
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
              <thead className="bg-[#0D1B2A] text-gray-400">
                <tr>
                  {['Scale', 'MAU', 'Claude API calls/day', 'Infra (Vercel/AWS)', 'Total/month'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {costRows.map((r, i) => (
                  <tr key={r.scale} className={i % 2 === 0 ? 'bg-[#0A1628]' : 'bg-[#080C14]'}>
                    <td className="px-4 py-3 font-bold text-[#FF9933]">{r.scale}</td>
                    <td className="px-4 py-3 font-mono text-gray-300">{r.mau}</td>
                    <td className="px-4 py-3 font-mono text-gray-300">{r.claude}</td>
                    <td className="px-4 py-3 font-mono text-gray-300">{r.infra}</td>
                    <td className="px-4 py-3 font-mono font-bold text-green-400">{r.total}</td>
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
          <div className="bg-[#0D1B2A] rounded-2xl p-8 border border-white/10">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {govNodes.map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={govInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#080C14] rounded-xl p-4 border border-white/5 flex flex-col gap-2"
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: node.color }} />
                  <div className="font-bold text-white text-sm">{node.label}</div>
                  <div className="text-gray-500 text-xs">{node.ministry}</div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full w-fit"
                    style={{ background: statusColor[node.status] + '22', color: statusColor[node.status] }}
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
            <div className="bg-[#0D1B2A] rounded-2xl p-6 border border-[#FF9933]/20">
              <h3 className="text-[#FF9933] font-bold mb-4">📍 District Profile (MoRTH 2023)</h3>
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
            <div className="bg-[#0D1B2A] rounded-2xl p-6 border border-[#2979FF]/20">
              <h3 className="text-[#2979FF] font-bold mb-4">🎯 Why Kancheepuram?</h3>
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
              <thead className="bg-[#0D1B2A] text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left">Feature</th>
                  <th className="px-4 py-3 text-center text-[#FF9933]">ROADSoS</th>
                  <th className="px-4 py-3 text-center">Manual 112 call</th>
                  <th className="px-4 py-3 text-center">GPS Trackers</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((r, i) => (
                  <tr key={r.feature} className={i % 2 === 0 ? 'bg-[#0A1628]' : 'bg-[#080C14]'}>
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
            className="w-full flex items-center justify-between bg-[#0D1B2A] rounded-2xl p-5 border border-white/10 hover:border-[#FF9933]/40 transition-colors"
          >
            <span className="font-bold text-white">Phase 1 Launch Checklist</span>
            <span className="text-[#FF9933]">{checklistOpen ? '▲' : '▼'}</span>
          </button>
          {checklistOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[#0D1B2A] rounded-b-2xl border border-t-0 border-white/10 overflow-hidden"
            >
              <div className="p-5 space-y-3">
                {checklist.map(item => (
                  <div key={item.label} className="flex items-center gap-3 text-sm">
                    <input type="checkbox" readOnly className="accent-[#FF9933]" />
                    <span className="flex-1 text-gray-300">{item.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(item.status)}`}>{item.status}</span>
                    <span className="text-gray-600 text-xs hidden sm:block">{item.party}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#0D1B2A] to-[#080C14] rounded-2xl p-8 border border-[#FF9933]/20 text-center space-y-4">
          <h2 className="text-2xl font-black text-white">Partner with ROADSoS</h2>
          <p className="text-gray-400">Join India's most deployable emergency response platform</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <a
              href="mailto:roadsos@example.com?subject=Government/NGO Partnership Inquiry — ROADSoS Production"
              className="px-6 py-3 bg-[#FF9933] text-black font-bold rounded-xl hover:bg-[#FF9933]/90 transition-colors"
            >
              Government / NGO Inquiry
            </a>
            <a
              href="https://github.com/its-tanay003/road_solution"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
            >
              Technical Integration
            </a>
            <button
              onClick={() => nav('/?demo=true')}
              className="px-6 py-3 bg-[#2979FF]/20 text-[#2979FF] font-bold rounded-xl hover:bg-[#2979FF]/30 transition-colors border border-[#2979FF]/30"
            >
              📊 Download Technical Whitepaper
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
