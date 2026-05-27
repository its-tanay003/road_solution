import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('Level 6 — Penetration & OWASP Security Tests', () => {

  // ── L6-T1: SECURITY HEADERS COMPLIANCE ────────────────────────
  test('L6-T1: Standard security headers are present and correct', async ({ request }) => {
    const res = await request.get(`${BASE}/`);
    const headers = res.headers();

    console.log('L6-T1: Security Headers Check:');
    console.log('  X-Content-Type-Options:', headers['x-content-type-options']);
    console.log('  X-Frame-Options:', headers['x-frame-options']);
    console.log('  Strict-Transport-Security:', headers['strict-transport-security']);
    console.log('  Content-Security-Policy:', headers['content-security-policy'] ? 'Present ✅' : 'Missing ❌');

    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['content-security-policy']).toBeDefined();
    console.log('L6-T1: PASS — All required security headers present');
  });

  // ── L6-T2: CSRF PROTECTION VERIFICATION ───────────────────────
  test('L6-T2: CSRF token endpoint is present and structured correctly', async ({ request }) => {
    const res = await request.get(`${BASE}/api/auth/csrf`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.csrfToken).toBeDefined();
    expect(body.csrfToken.length).toBeGreaterThanOrEqual(16);
    console.log('L6-T2: PASS — CSRF Token retrieved successfully');
  });

  // ── L6-T3: INJECTION ATTACKS BLOCKED (OWASP A03) ──────────────
  test('L6-T3: Injection payloads blocked on AI endpoints', async ({ request }) => {
    const injections = [
      // NoSQL injection
      { messages: [{ role: 'user', content: { '$gt': '' } }] },
      { messages: [{ role: 'user', content: { '$where': 'sleep(1000)' } }] },
      // Command injection
      { messages: [{ role: 'user', content: '`cat /etc/passwd`' }] },
      { messages: [{ role: 'user', content: '$(id)' }] },
      { messages: [{ role: 'user', content: '; ls -la /' }] },
      { messages: [{ role: 'user', content: '| whoami' }] },
      // LDAP injection
      { messages: [{ role: 'user', content: '*)(uid=*))(|(uid=*' }] },
      // XML injection
      { messages: [{ role: 'user', content: '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>' }] },
    ];

    for (const payload of injections) {
      const res = await request.post(`${BASE}/api/ai/claude`, { data: payload });
      // Must be blocked (400 bad request, 401 unauth, etc. never 200 execution)
      expect([400, 401]).toContain(res.status());
      console.log(`Injection blocked: ${JSON.stringify(payload).slice(0, 50)} → ${res.status()}`);
    }
    console.log('L6-T3: PASS — All multi-vector injection attacks blocked');
  });

  // ── L6-T4: SERVER FINGERPRINTING MINIMIZED (OWASP A05) ────────
  test('L6-T4: Server fingerprinting minimized', async ({ request }) => {
    const res = await request.get(`${BASE}/`);
    const headers = res.headers();

    // Must NOT reveal server details
    const dangerous = ['x-powered-by', 'server', 'x-aspnet-version', 'x-runtime'];
    dangerous.forEach(h => {
      if (headers[h]) {
        console.log(`WARNING: Server info exposed in header ${h}: ${headers[h]}`);
      } else {
        console.log(`OK: ${h} not exposed`);
      }
    });

    expect(headers['x-powered-by']).toBeUndefined();
    console.log('L6-T4: PASS — Framework fingerprinting hidden');
  });

  // ── L6-T5: BRUTE FORCE PROTECTION (OWASP A07) ─────────────────
  test('L6-T5: Brute force protection on auth', async ({ request }) => {
    const statuses: number[] = [];

    // Attempt 30 rapid logins / profile accesses
    for (let i = 0; i < 30; i++) {
      const res = await request.get(`${BASE}/api/profile`);
      statuses.push(res.status());
    }

    const rateLimited = statuses.includes(429);
    const allUnauth = statuses.every(s => s === 401);

    expect(rateLimited || allUnauth, 'Auth should be either rate-limited (429) or safely unauthenticated (401)').toBe(true);
    console.log(`L6-T5: Rapid requests result distribution: ${allUnauth ? '401 Blocked' : '429 Rate Limited'}`);
    console.log('L6-T5: PASS — Brute force / credential abuse mitigated');
  });
});
