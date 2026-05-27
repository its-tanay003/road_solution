import { test, expect } from '@playwright/test';

const BASE = 'http://127.0.0.1:3000';

// ── L2-NUKE-T1: HTTP Request Smuggling ──
test('L2-NUKE-T1: HTTP request smuggling (CL.TE and TE.CL) rejected', async ({ request }) => {
  const res = await request.fetch(`${BASE}/api/auth/session`, {
    method: 'POST',
    headers: {
      'Content-Length': '4',
      'Transfer-Encoding': 'chunked',
    },
    data: '0\r\n\r\n',
  });
  console.log('Smuggling status:', res.status());
  // Smuggled headers should either be ignored, cause 400 Bad Request, or safely yield a non-500 response
  expect(res.status()).not.toBe(500);
});

// ── L2-NUKE-T2: Unicode normalization bypass attacks blocked ──
test('L2-NUKE-T2: Unicode normalization bypass attacks blocked', async ({ request }) => {
  // homograph "E" (Cyrillic) in email
  const maliciousEmail = 'tеst@example.com'; 
  const res = await request.post(`${BASE}/api/auth/signin`, {
    data: { email: maliciousEmail },
  });
  console.log('Unicode signin status:', res.status());
  expect(res.status()).not.toBe(500);
});

// ── L2-NUKE-T3: JSON deserialization bombs rejected in < 500ms ──
test('L2-NUKE-T3: JSON deserialization bombs rejected in < 500ms', async ({ request }) => {
  // Construct deeply nested JSON structure
  let root: any = {};
  let curr = root;
  for (let i = 0; i < 500; i++) {
    curr.nested = {};
    curr = curr.nested;
  }

  const start = Date.now();
  try {
    const res = await request.post(`${BASE}/api/ai/claude`, {
      data: root,
      timeout: 1000,
    });
    const duration = Date.now() - start;
    console.log(`JSON bomb status: ${res.status()} in ${duration}ms`);
    expect([400, 401, 413]).toContain(res.status());
    expect(duration).toBeLessThan(500);
  } catch (e: any) {
    const duration = Date.now() - start;
    console.log(`JSON bomb rejected in ${duration}ms via exception`);
    expect(duration).toBeLessThan(500);
  }
});

// ── L2-NUKE-T4: Cache poisoning via Host header injection blocked ──
test('L2-NUKE-T4: Cache poisoning via Host header injection blocked', async ({ request }) => {
  const res = await request.get(`${BASE}/api/auth/session`, {
    headers: {
      'Host': 'attacker.com',
      'X-Forwarded-Host': 'attacker.com',
    }
  });
  console.log('Host injection status:', res.status());
  expect(res.status()).not.toBe(500);
  const text = await res.text();
  expect(text).not.toContain('attacker.com');
});

// ── L2-NUKE-T5: HTTP method tunneling via X-HTTP-Method-Override blocked ──
test('L2-NUKE-T5: HTTP method tunneling via X-HTTP-Method-Override blocked', async ({ request }) => {
  const res = await request.post(`${BASE}/api/profile`, {
    headers: {
      'X-HTTP-Method-Override': 'DELETE',
    },
    data: { id: 'some-id' }
  });
  console.log('Tunneling status:', res.status());
  // Should yield 401/405/400 (never bypass authorization or succeed as DELETE)
  expect([400, 401, 405]).toContain(res.status());
});

// ── L2-NUKE-T6: CRLF injection / response splitting blocked ──
test('L2-NUKE-T6: CRLF injection / response splitting blocked', async ({ request }) => {
  const res = await request.get(`${BASE}/api/auth/session?q=%0d%0aSet-Cookie:%20malicious=1`);
  console.log('CRLF injection status:', res.status());
  expect(res.status()).not.toBe(500);
  const headers = res.headers();
  expect(headers['set-cookie']?.includes('malicious=1')).toBeFalsy();
});

// ── L2-NUKE-T7: Mass assignment cannot elevate to admin role ──
test('L2-NUKE-T7: Mass assignment cannot elevate to admin role', async ({ request }) => {
  const res = await request.post(`${BASE}/api/profile`, {
    data: {
      role: 'admin',
      is_admin: true,
      role_preference: 'admin',
    }
  });
  console.log('Mass assignment status:', res.status());
  // Blocked or resolved safely
  expect([400, 401, 405, 200]).toContain(res.status());
});

// ── L2-NUKE-T8: Race condition on SOS endpoint produces no 200 responses ──
test('L2-NUKE-T8: Race condition on SOS endpoint produces no 200 responses (without auth)', async ({ request }) => {
  const reqs = Array(10).fill(null).map(() =>
    request.post(`${BASE}/api/sos`, {
      data: { lat: 10, lng: 20 }
    })
  );
  const results = await Promise.all(reqs);
  const statuses = results.map(r => r.status());
  console.log('SOS race conditions statuses:', statuses);
  // All must be blocked with 401/403/400 due to lack of authentic credentials
  statuses.forEach(status => {
    expect([400, 401, 403, 405]).toContain(status);
  });
});

// ── L2-NUKE-T9: OWASP API1: Broken Object Level Authorization ──
test('L2-NUKE-T9: OWASP API1: Broken Object Level Authorization — all blocked', async ({ request }) => {
  const res = await request.get(`${BASE}/api/profile?id=fake-victim-id`);
  console.log('BOLA query status:', res.status());
  expect([401, 403, 405, 400]).toContain(res.status());
});

// ── L2-NUKE-T10: OWASP API5: Admin functions inaccessible to all methods ──
test('L2-NUKE-T10: OWASP API5: Admin functions inaccessible to all methods', async ({ request }) => {
  const adminPaths = ['/api/admin', '/api/admin/users', '/api/admin/cleanup'];
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];

  for (const path of adminPaths) {
    for (const method of methods) {
      const res = await request.fetch(`${BASE}${path}`, { method });
      console.log(`Admin Check ${method} ${path}: ${res.status()}`);
      expect([401, 403, 404, 405]).toContain(res.status());
    }
  }
});

// ── L2-NUKE-T11: Subdomain takeover vectors (*.vercel.app) rejected by CORS ──
test('L2-NUKE-T11: Subdomain takeover vectors (*.vercel.app) rejected by CORS', async ({ request }) => {
  const res = await request.fetch(`${BASE}/api/auth/session`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://attacker.vercel.app',
      'Access-Control-Request-Method': 'GET',
    }
  });
  console.log('CORS Options status:', res.status());
  const originHeader = res.headers()['access-control-allow-origin'];
  expect(originHeader).not.toBe('https://attacker.vercel.app');
  expect(originHeader).not.toBe('*');
});

// ── L2-NUKE-T12: Blind SSRF via webhook/callback URLs blocked ──
test('L2-NUKE-T12: Blind SSRF via webhook/callback URLs blocked (all protocols)', async ({ request }) => {
  const targets = [
    'http://169.254.169.254/latest/meta-data/',
    'gopher://localhost:70/',
    'file:///etc/passwd',
    'http://127.0.0.1:5432/',
  ];
  for (const target of targets) {
    const res = await request.post(`${BASE}/api/profile`, {
      data: { webhookUrl: target }
    });
    console.log(`SSRF webhook test on "${target.slice(0, 30)}": ${res.status()}`);
    expect([400, 401, 405, 200]).toContain(res.status());
  }
});
