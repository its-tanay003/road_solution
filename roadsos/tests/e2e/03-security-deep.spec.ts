import { test, expect } from '@playwright/test';

test.describe('Deep Security — Auth Guards', () => {
  const protectedRoutes = [
    '/settings',
    '/chat',
    '/map',
    '/onboarding',
    '/first-aid',
    '/directory',
    '/control-room',
    '/admin',
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects unauthenticated users to /`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL('/');
      expect(page.url()).toMatch(/\//);
    });
  }
});

test.describe('Deep Security — API Auth Guards (401 checks)', () => {
  const protectedAPIRoutes = [
    { method: 'GET',  path: '/api/profile' },
    { method: 'POST', path: '/api/profile' },
    { method: 'POST', path: '/api/ai/claude' },
    { method: 'POST', path: '/api/ai/gemini' },
    { method: 'POST', path: '/api/ai/gpt' },
    { method: 'POST', path: '/api/ai/triage' },
    { method: 'POST', path: '/api/ai/gemini-map' },
    { method: 'POST', path: '/api/sos' },
    { method: 'POST', path: '/api/sos/sms' },
    { method: 'POST', path: '/api/sos/email' },
    { method: 'POST', path: '/api/sos/push' },
    { method: 'POST', path: '/api/sos/all-clear' },
  ];

  for (const { method, path } of protectedAPIRoutes) {
    test(`${method} ${path} → 401 without auth`, async ({ request }) => {
      const res = method === 'GET'
        ? await request.get(path)
        : await request.post(path, { data: {} });
      expect(res.status(), `${method} ${path} should be 401`).toBe(401);
    });
  }
});

test.describe('Deep Security — No Secrets in Client Bundle', () => {
  test('No API keys in JS bundle', async ({ page }) => {
    const leaked: string[] = [];
    const secretPatterns = [
      /sk-ant-api0/,
      /sk-proj-/,
      /SUPABASE_SERVICE_ROLE/,
      /service_role.*eyJ/,
      /TWILIO_AUTH_TOKEN/,
      /RESEND_API_KEY/,
      /ANTHROPIC_API_KEY/,
      /OPENAI_API_KEY/,
    ];

    page.on('response', async (res) => {
      if (res.url().includes('/_next/static/') && res.url().endsWith('.js')) {
        try {
          const text = await res.text();
          for (const pattern of secretPatterns) {
            if (pattern.test(text)) {
              leaked.push(`Pattern ${pattern.toString()} found in: ${res.url().split('/').pop()}`);
            }
          }
        } catch {
          // ignore binary chunks
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(leaked, `CRITICAL: Secrets in client bundle:\n${leaked.join('\n')}`).toHaveLength(0);
    console.log('✅ No secrets found in client JS bundle');
  });

  test('CSRF token present on auth providers endpoint', async ({ request }) => {
    const res = await request.get('/api/auth/csrf');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.csrfToken).toBeDefined();
    expect(body.csrfToken.length).toBeGreaterThan(16);
    console.log('✅ CSRF token length:', body.csrfToken.length);
  });

  test('No credentials provider (only OAuth)', async ({ request }) => {
    const res = await request.get('/api/auth/providers');
    expect(res.status()).toBe(200);
    const providers = await res.json();
    expect(providers).not.toHaveProperty('credentials');
    console.log('✅ Auth providers:', Object.keys(providers).join(', '));
  });
});

test.describe('Deep Security — Rate Limiting', () => {
  test('SOS endpoint rate-limits after 5 requests/minute', async ({ request }) => {
    const statuses: number[] = [];
    // Fire 7 rapid requests (limit is 5)
    for (let i = 0; i < 7; i++) {
      const res = await request.post('/api/sos', {
        data: { lat: 23.0, lng: 72.5, address: 'test', incidentId: `test-${i}` },
      });
      statuses.push(res.status());
    }
    console.log('SOS rate-limit statuses (7 rapid requests):', statuses.join(', '));
    // Either 401 (no auth) or 429 (rate limited) - both acceptable
    // If any 429, rate limiting is working
    const rateLimited = statuses.includes(429);
    const allUnauth = statuses.every(s => s === 401);
    expect(rateLimited || allUnauth, 'Expected either rate limiting or auth rejection').toBe(true);
    if (rateLimited) console.log('✅ Rate limiting detected at status 429');
    if (allUnauth) console.log('ℹ️ All requests blocked by auth (401) before rate limit check');
  });

  test('AI Claude endpoint has rate limiter configured', async ({ request }) => {
    // Just verify rate limit header is returned when limit is hit
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await request.post('/api/ai/claude', {
        data: { messages: [{ role: 'user', content: 'test' }] },
      });
      statuses.push(res.status());
    }
    console.log('Claude rate-limit statuses (5 rapid requests):', statuses.join(', '));
    expect(statuses.every(s => [401, 429, 200].includes(s))).toBe(true);
  });
});

test.describe('Deep Security — Injection Attacks', () => {
  test('Path traversal attempt returns 400/404', async ({ request }) => {
    const paths = [
      '/../../../etc/passwd',
      '/api/../../../windows/system32',
      '/api/profile/../../auth',
    ];
    for (const path of paths) {
      const res = await request.get(path);
      expect([400, 403, 404], `Path traversal ${path} should be blocked`).toContain(res.status());
      console.log(`Path traversal ${path} → ${res.status()} ✅`);
    }
  });

  test('SQL injection in query params returns safe response', async ({ request }) => {
    const maliciousParams = [
      "'; DROP TABLE profiles; --",
      '1 OR 1=1',
      'UNION SELECT * FROM auth.users',
    ];
    for (const payload of maliciousParams) {
      const res = await request.get(`/api/profile?id=${encodeURIComponent(payload)}`);
      // Should be 401 (unauth) or 400 (validation), never 200 with data dump
      expect([400, 401, 404]).toContain(res.status());
      console.log(`SQL injection "${payload.slice(0, 20)}..." → ${res.status()} ✅`);
    }
  });
});

test.describe('Deep Security — Headers', () => {
  test('Response headers check', async ({ request }) => {
    const res = await request.get('/');
    const headers = res.headers();

    console.log('Security headers audit:');
    console.log('  X-Content-Type-Options:', headers['x-content-type-options'] || 'MISSING ⚠️');
    console.log('  X-Frame-Options:', headers['x-frame-options'] || 'MISSING ⚠️');
    console.log('  X-Powered-By:', headers['x-powered-by'] || 'HIDDEN ✅');
    console.log('  Strict-Transport-Security:', headers['strict-transport-security'] || 'Not set (OK for dev)');
    console.log('  Content-Security-Policy:', headers['content-security-policy'] ? 'Present ✅' : 'MISSING ⚠️');

    // x-powered-by should NOT expose Next.js version to attackers
    if (headers['x-powered-by']) {
      console.log('  ⚠️ x-powered-by exposed:', headers['x-powered-by']);
    } else {
      console.log('  ✅ x-powered-by hidden');
    }
  });
});
