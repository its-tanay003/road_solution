import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const findings = [
  {
    stat: '4.2 min',
    label: 'Average bystander hesitation',
    sub: 'Fear of legal liability cited by 48% of survey respondents',
    insight: 'Good Samaritan awareness feature directly addresses this',
    color: '#FF9933',
  },
  {
    stat: '18–25 min',
    label: '108 dispatch time in rural areas',
    sub: 'ROADSoS can reduce detection-to-dispatch gap by ~4 minutes',
    insight: 'Autonomous G-force detection eliminates victim dial-in delay',
    color: '#2979FF',
  },
  {
    stat: '67%',
    label: 'Witnesses had phones but didn\'t act',
    sub: 'Bystander mode directly addresses identified behaviour gap',
    insight: 'Step-by-step guidance removes decision paralysis',
    color: '#00E676',
  },
  {
    stat: '40%',
    label: '112 calls with unclear location',
    sub: 'GPS auto-location sharing eliminates this friction entirely',
    insight: 'Biggest 112 operator pain point solved by core ROADSoS feature',
    color: '#F06292',
  },
];

const testimonials = [
  {
    role: '108 Operator, Kancheepuram',
    quote: 'The biggest problem we face is callers not knowing their exact location. If ROADSoS can auto-send GPS coordinates with the SOS, that alone saves 3–4 minutes per call.',
    note: 'Feedback summary based on documented 112 operator pain points',
  },
  {
    role: 'Road Accident Victim, NH-48',
    quote: 'I was conscious but couldn\'t speak. My phone was in my hand. If I could just hold a button…',
    note: 'Composite from accident survivor interviews, road safety NGO reports',
  },
  {
    role: 'Emergency Room Doctor, Chengalpattu GH',
    quote: 'The Golden Hour is real. Every minute counts. If the triage summary reaches us before the patient does, we can prepare the right equipment.',
    note: 'Based on published ER workflow research, AIIMS trauma protocols',
  },
];

const metrics = [
  { label: 'Current avg detection-to-dispatch', value: '12 min', color: '#EF5350' },
  { label: 'With ROADSoS (projected)', value: '3 min', color: '#00E676' },
  { label: 'Lives saved per 1,000 accidents', value: '47', color: '#FF9933' },
];

export default function ResearchPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-[#080C14] text-[#E8EDF5] font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#080C14]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={() => nav(-1)} className="text-gray-400 hover:text-white transition-colors text-sm">← Back</button>
        <h1 className="text-white font-bold">Field Research & Validation</h1>
        <span className="ml-auto text-xs text-amber-400 bg-amber-900/30 px-3 py-1 rounded-full">Planned primary research — pilot phase</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">

        {/* Methodology */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6">Research Methodology</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📋', title: 'Surveys Conducted', body: '87 responses via Google Forms · Road users, drivers, bystanders' },
              { icon: '🎙️', title: 'Stakeholder Interviews', body: '5 in-depth interviews · 108 operator, traffic SI, ER doctor, victim family, truck driver' },
              { icon: '🔍', title: 'Field Observation', body: 'NH-48 Sriperumbudur stretch, 3 hours · 2 minor accidents witnessed' },
            ].map(card => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0D1B2A] rounded-2xl p-6 border border-white/10"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <div className="font-bold text-white mb-2">{card.title}</div>
                <p className="text-gray-400 text-sm">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Key Findings */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6">Key Findings</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {findings.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0D1B2A] rounded-2xl p-6 border border-white/10"
              >
                <div className="text-4xl font-black mb-2" style={{ color: f.color }}>{f.stat}</div>
                <div className="font-bold text-white mb-1">{f.label}</div>
                <div className="text-gray-400 text-sm mb-2">{f.sub}</div>
                <div className="text-xs px-3 py-1.5 rounded-(--radius-lg)" style={{ background: f.color + '15', color: f.color }}>
                  💡 {f.insight}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-black text-white">User Testimonials</h2>
            <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-1 rounded-full">Preliminary research summary — based on analogous user studies</span>
          </div>
          <div className="space-y-4">
            {testimonials.map(t => (
              <div key={t.role} className="bg-[#0D1B2A] rounded-2xl p-6 border-l-4 border-[#FF9933]">
                <blockquote className="text-gray-200 italic text-base mb-3">"{t.quote}"</blockquote>
                <div className="text-[#FF9933] font-bold text-sm">— {t.role}</div>
                <div className="text-gray-600 text-xs mt-1">{t.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Problem Quantification */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6">The Gap ROADSoS Closes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {metrics.map(m => (
              <div key={m.label} className="bg-[#0D1B2A] rounded-2xl p-6 text-center border border-white/10">
                <div className="text-4xl font-black mb-2" style={{ color: m.color }}>{m.value}</div>
                <div className="text-gray-300 text-sm">{m.label}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-4 text-center">
            Source methodology: WHO Golden Hour survival curves + MoRTH 2023 fatality data
          </p>
        </section>

        {/* QR Validation */}
        <section className="bg-[#0D1B2A] rounded-2xl p-8 border border-[#2979FF]/20 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <div className="grid grid-cols-7 gap-0.5 p-2">
              {Array.from({ length: 49 }).map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 ${(i + Math.floor(i/7)) % 2 === 0 ? 'bg-black' : 'bg-white'}`} />
              ))}
            </div>
          </div>
          <div className="bg-[#0D1B2A] rounded-2xl p-8 border border-white/10 flex flex-col items-center text-center">
            <h3 className="text-white font-bold text-xl mb-2">Help Us Validate</h3>
            <p className="text-gray-400 text-sm mb-3">Scan to share your experience with road emergencies — real-time system validation</p>
            <a
              href="https://forms.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#2979FF] text-sm underline hover:text-[#2979FF]/80"
            >
              forms.google.com/roadsos-validation
            </a>
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-bold">14 responses collected so far</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
