export function SecurityDashboard() {
  const features = [
    {
      icon: '🔐',
      title: 'AES-GCM-256 encryption',
      desc: 'All medical data (blood group, allergies, emergency contact) encrypted client-side before any storage or transmission. Key is generated per-device and never leaves the browser.',
      status: 'active',
    },
    {
      icon: '🪙',
      title: 'JWT authentication',
      desc: '30-day tokens signed with HMAC-SHA256. Refresh rotation on every login. Stored in localStorage with httpOnly fallback. Tokens are validated server-side on every protected request.',
      status: 'active',
    },
    {
      icon: '🛡️',
      title: 'OWASP Top 10 mitigated',
      desc: 'Input sanitization on all endpoints. CSP headers block XSS. No SQL (no injection vector). SameSite cookie policy. Server-side schema validation via express-validator.',
      status: 'active',
    },
    {
      icon: '📋',
      title: 'DPDP Act 2023 compliance',
      desc: "India's Digital Personal Data Protection Act. Explicit granular consent before registration. Right to erasure: delete your account from Settings. Minimal data collection principle enforced.",
      status: 'active',
    },
    {
      icon: '🚫',
      title: 'Zero third-party tracking',
      desc: 'No Google Analytics, Facebook Pixel, or ad networks. Only functional APIs: OpenStreetMap (routing), Claude AI (triage), 108 dispatch. All external calls user-triggered.',
      status: 'active',
    },
    {
      icon: '🔒',
      title: 'HTTPS + HSTS',
      desc: 'TLS 1.3 enforced on all connections. HTTP Strict Transport Security header with 1-year max-age, includeSubDomains. Certificate managed by Vercel (auto-renewed).',
      status: 'active',
    },
    {
      icon: '⏱️',
      title: 'Rate limiting',
      desc: 'Auth endpoints: 10 req/15 min. OTP: 3 req/min per phone. SOS dispatch: 5 req/min per user. Prevents brute-force attacks and OTP farming.',
      status: 'active',
    },
    {
      icon: '🧹',
      title: 'Data minimisation',
      desc: 'Only GPS coordinates (on SOS trigger), blood group, allergies, and one emergency contact collected. No browsing history, device contacts, call logs, or media access.',
      status: 'active',
    },
  ];

  return (
    <div className="p-6 max-w-[800px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Security & Privacy</h1>
        <p className="text-sm opacity-60">
          Aligned with India's DPDP Act 2023 and CERT-In Information Security Guidelines.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-3 mb-6">
        {features.map(f => (
          <div
            key={f.title}
            className="bg-secondary border border-white/10 rounded-2xl p-4 px-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[22px]">{f.icon}</span>
              <span className="text-sm font-semibold">{f.title}</span>
              <span className="ml-auto text-[11px] py-0.5 px-2 rounded-full bg-safe/10 text-safe whitespace-nowrap">
                ● Active
              </span>
            </div>
            <p className="text-[12px] opacity-60 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Privacy commitment (DPDP Act 2023) */}
      <div className="p-5 rounded-2xl border border-warning/25 bg-warning/5 mb-5">
        <h3 className="text-[15px] font-semibold mb-3 text-warning">
          Privacy Commitment (DPDP Act 2023)
        </h3>
        <ul className="text-[13px] opacity-80 space-y-2 list-disc pl-5 m-0">
          <li>We collect only what is necessary to save your life in an emergency.</li>
          <li>You can delete your account and all associated data at any time from Settings → Account.</li>
          <li>Your medical profile data never leaves your device without your active SOS trigger.</li>
          <li>We do not sell, share, or monetize your personal data under any circumstances.</li>
          <li>Emergency data shared with 108/112 is deleted from our servers within 30 days per DPDP guidelines.</li>
          <li>Explicit granular consent is obtained for each data category before account creation.</li>
        </ul>
      </div>

      {/* Consent categories */}
      <div className="p-5 rounded-2xl border border-white/10 bg-white/5 mb-6">
        <h3 className="text-[15px] font-semibold mb-4">Consent Record</h3>
        <div className="space-y-4">
          {[
            { label: 'GPS location', desc: 'Used only when SOS is triggered. Not stored between sessions.', required: true },
            { label: 'Medical profile', desc: 'Blood group, allergies — encrypted on-device via AES-GCM-256.', required: true },
            { label: 'Emergency contact', desc: 'Notified via WhatsApp only when SOS is triggered.', required: true },
            { label: 'Anonymous crash analytics', desc: 'Helps improve response times for future users.', required: false },
          ].map(c => (
            <div key={c.label} className="flex items-start gap-3">
              <span className={`text-lg leading-6 shrink-0 ${c.required ? 'text-emergency' : 'text-safe'}`}>
                {c.required ? '🔴' : '🟢'}
              </span>
              <div>
                <div className="text-[13px] font-medium">
                  {c.label}
                  {!c.required && <span className="text-[11px] opacity-50 ml-2">(optional)</span>}
                </div>
                <div className="text-[12px] opacity-50 leading-snug">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Mitigation Matrix */}
      <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-[15px] font-semibold mb-4 italic uppercase">Security Mitigation Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Vulnerability</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Threat</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Mitigation Strategy</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-mono">
              {[
                { vulnerability: 'MITM Attacks', threat: 'High', mitigation: 'mTLS & End-to-End Encryption', status: 'Implemented' },
                { vulnerability: 'Identity Leak', threat: 'Critical', mitigation: 'ZKP Anonymization Layer', status: 'Implemented' },
                { vulnerability: 'DDoS / Traffic Spike', threat: 'High', mitigation: 'Edge Computing & Auto-Scaling', status: 'Hardened' },
                { vulnerability: 'Database Compromise', threat: 'High', mitigation: 'Field-level AES-256 Encryption', status: 'Audit Ready' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
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
                    <span className="text-safe font-black uppercase text-[9px]">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
