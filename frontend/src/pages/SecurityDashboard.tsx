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
    <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>Security & Privacy</h1>
        <p style={{ fontSize: 14, opacity: 0.6 }}>
          Aligned with India's DPDP Act 2023 and CERT-In Information Security Guidelines.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 12, marginBottom: 24 }}>
        {features.map(f => (
          <div
            key={f.title}
            style={{
              background: 'var(--bg-secondary, #0A1628)',
              border: '0.5px solid rgba(0,229,255,0.12)',
              borderRadius: 16, padding: '1rem 1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{f.title}</span>
              <span style={{
                marginLeft: 'auto', fontSize: 11, padding: '2px 8px', borderRadius: 20,
                background: 'rgba(29,158,117,0.15)', color: '#1D9E75', whiteSpace: 'nowrap',
              }}>
                ● Active
              </span>
            </div>
            <p style={{ fontSize: 12, opacity: 0.62, lineHeight: 1.65 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Privacy commitment (DPDP Act 2023) */}
      <div style={{
        padding: '1.25rem', borderRadius: 16,
        border: '1px solid rgba(255,152,0,0.25)',
        background: 'rgba(255,152,0,0.06)',
        marginBottom: 20,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#FFB300' }}>
          Privacy Commitment (DPDP Act 2023)
        </h3>
        <ul style={{ fontSize: 13, opacity: 0.82, lineHeight: 2.1, paddingLeft: 20, margin: 0 }}>
          <li>We collect only what is necessary to save your life in an emergency.</li>
          <li>You can delete your account and all associated data at any time from Settings → Account.</li>
          <li>Your medical profile data never leaves your device without your active SOS trigger.</li>
          <li>We do not sell, share, or monetize your personal data under any circumstances.</li>
          <li>Emergency data shared with 108/112 is deleted from our servers within 30 days per DPDP guidelines.</li>
          <li>Explicit granular consent is obtained for each data category before account creation.</li>
        </ul>
      </div>

      {/* Consent categories */}
      <div style={{ padding: '1.25rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Consent Record</h3>
        {[
          { label: 'GPS location', desc: 'Used only when SOS is triggered. Not stored between sessions.', required: true },
          { label: 'Medical profile', desc: 'Blood group, allergies — encrypted on-device via AES-GCM-256.', required: true },
          { label: 'Emergency contact', desc: 'Notified via WhatsApp only when SOS is triggered.', required: true },
          { label: 'Anonymous crash analytics', desc: 'Helps improve response times for future users.', required: false },
        ].map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <span style={{ color: c.required ? '#FF1744' : '#00E676', fontSize: 18, lineHeight: '22px', flexShrink: 0 }}>
              {c.required ? '🔴' : '🟢'}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                {c.label}
                {!c.required && <span style={{ fontSize: 11, opacity: 0.5, marginLeft: 8 }}>(optional)</span>}
              </div>
              <div style={{ fontSize: 12, opacity: 0.55, lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
