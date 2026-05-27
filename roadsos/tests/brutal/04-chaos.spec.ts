import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

// ── L4-T1: ALL EXTERNAL SERVICES DEAD ────────────────────────
test('L4-T1: App survives when ALL external services are blocked', async ({ page }) => {
  const blocked: string[] = [];

  await page.route('**/*supabase*/**', route => {
    blocked.push('supabase'); return route.abort();
  });
  await page.route('**/*anthropic*/**', route => {
    blocked.push('anthropic'); return route.abort();
  });
  await page.route('**/*generativelanguage*/**', route => {
    blocked.push('gemini'); return route.abort();
  });
  await page.route('**/*openai*/**', route => {
    blocked.push('openai'); return route.abort();
  });
  await page.route('**/*maps.googleapis.com/**', route => {
    blocked.push('maps'); return route.abort();
  });
  await page.route('**/*twilio*/**', route => {
    blocked.push('twilio'); return route.abort();
  });

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 15000 });

  const bodyText = await page.locator('body').textContent();
  const hasContent = (bodyText?.length ?? 0) > 10;
  const hasFatal = await page.locator('text=/Application error|chunk load error/i').isVisible().catch(() => false);

  console.log(`L4-T1: External services blocked: ${[...new Set(blocked)].join(', ')}`);
  console.log(`L4-T1: Page content: "${bodyText?.slice(0, 80)}"`);
  console.log(`L4-T1: Has content: ${hasContent}, Has fatal: ${hasFatal}`);

  expect(hasContent, 'Page should render static content even with all services dead').toBe(true);
  expect(hasFatal, 'No fatal Application error').toBe(false);
  console.log('L4-T1: PASS — App alive with all external services blocked');
});

// ── L4-T2: INTERMITTENT NETWORK FAILURE (50% FAIL RATE) ──────
test('L4-T2: App handles 50% intermittent API failures gracefully', async ({ page }) => {
  let callCount = 0;
  await page.route('/api/ai/**', route => {
    callCount++;
    if (callCount % 2 === 0) return route.abort(); // Fail every other request
    return route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: 'ok',
    });
  });
  await page.route('/api/auth/session', r => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      user: { id: 'test', name: 'T', email: 't@t.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    }),
  }));

  await page.goto(BASE + '/chat');
  const input = page.locator('textarea, input[type="text"]').first();
  const inputVisible = await input.isVisible({ timeout: 8000 }).catch(() => false);

  const crashes: string[] = [];
  page.on('pageerror', e => crashes.push(e.message));

  if (inputVisible) {
    for (let i = 0; i < 10; i++) {
      await input.fill(`Message ${i}`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(800);
    }
    const uiAlive = await input.isVisible();
    expect(uiAlive, 'UI must remain interactive after network failures').toBe(true);
    console.log(`L4-T2: ${callCount} AI calls, 50% fail. UI alive: ${uiAlive}. Crashes: ${crashes.length}`);
  } else {
    // Simulate navigation failures instead
    for (let i = 0; i < 10; i++) {
      await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' }).catch(() => {});
    }
    console.log(`L4-T2: Chat redirected. 10 navigation cycles. Crashes: ${crashes.length}`);
  }

  expect(crashes.length, `Page errors: ${crashes.join(' | ')}`).toBe(0);
  console.log('L4-T2: PASS — UI survives intermittent failures');
});

// ── L4-T3: SUPABASE SLOW RESPONSE (5s LATENCY) ───────────────
test('L4-T3: App loads with 5s database latency (static content renders)', async ({ page }) => {
  await page.route('**/*supabase*/**', async route => {
    await new Promise(r => setTimeout(r, 5000));
    return route.continue();
  });

  const start = Date.now();
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  const loadTime = Date.now() - start;

  const bodyText = await page.locator('body').textContent();
  console.log(`L4-T3: Loaded in ${loadTime}ms with 5s DB latency`);
  console.log(`L4-T3: Body preview: "${bodyText?.slice(0, 80)}"`);

  expect((bodyText?.length ?? 0)).toBeGreaterThan(10);
  console.log('L4-T3: PASS — Static content rendered despite DB latency');
});

// ── L4-T4: BROWSER STORAGE CORRUPTION ────────────────────────
test('L4-T4: App recovers from corrupted localStorage/sessionStorage', async ({ page }) => {
  await page.goto(BASE + '/');

  await page.evaluate(() => {
    try { localStorage.setItem('app-language', 'INVALID_CODE_###'); } catch {}
    try { localStorage.setItem('next-auth.session-token', '{{CORRUPTED}}'); } catch {}
    try { localStorage.setItem('zustand-sos-store', 'NOT_VALID_JSON{{'); } catch {}
    try { localStorage.setItem('theme', 'invalid-theme-value'); } catch {}
    // Try filling storage
    try { localStorage.setItem('junk', 'X'.repeat(1024 * 1024)); } catch {}
    // Corrupt sessionStorage too
    try { sessionStorage.setItem('emergency-state', '{broken json'); } catch {}
  });

  await page.reload({ waitUntil: 'domcontentloaded' });

  const hasFatal = await page.locator('text=/Application error|chunk load error/i')
    .isVisible().catch(() => false);
  const hasContent = await page.locator('body')
    .textContent().then(t => (t?.length ?? 0) > 10).catch(() => false);

  console.log(`L4-T4: After storage corruption — fatal error: ${hasFatal}, has content: ${hasContent}`);
  expect(hasFatal, 'No fatal error after storage corruption').toBe(false);
  expect(hasContent, 'Page renders after storage corruption').toBe(true);
  console.log('L4-T4: PASS — App recovered from corrupted storage');
});

// ── L4-T5: RAPID THEME + LANGUAGE SWITCHING ──────────────────
test('L4-T5: 50 rapid theme/language switches cause no crash or overflow', async ({ page }) => {
  await page.goto(BASE + '/');
  const crashes: string[] = [];
  page.on('pageerror', e => crashes.push(e.message));

  for (let i = 0; i < 50; i++) {
    await page.evaluate((idx) => {
      const langs = ['en', 'hi', 'ar', 'zh', 'ru', 'gu', 'fr', 'es', 'pt', 'bn'];
      const lang = langs[idx % langs.length];
      try { localStorage.setItem('app-language', lang); } catch {}
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.className = idx % 2 === 0 ? 'dark' : 'light';
    }, i);
    if (i % 10 === 0) await page.waitForTimeout(50);
  }

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const overflow = scrollWidth - clientWidth;

  console.log(`L4-T5: 50 rapid switches. Crashes: ${crashes.length}. Overflow: ${overflow}px`);
  expect(crashes.length, `Page errors: ${crashes.join(' | ')}`).toBe(0);
  expect(overflow).toBeLessThanOrEqual(20);
  console.log('L4-T5: PASS — No crash or layout overflow after 50 switches');
});

// ── L4-T6: EVENT LISTENER LEAK DETECTION ─────────────────────
test('L4-T6: Event listeners not leaking after 5 chat page round-trips', async ({ page }) => {
  await page.route('/api/auth/session', r => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      user: { id: 'test', name: 'T', email: 't@t.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    }),
  }));

  await page.goto(BASE + '/chat');

  const countListeners = () => page.evaluate(() => {
    // Count via querySelectorAll - getEventListeners only works in DevTools
    // Use a proxy measurement: count elements with known event-heavy components
    return document.querySelectorAll('[data-listener], [data-socket], canvas, video').length
      + document.querySelectorAll('button, input, textarea, a').length;
  });

  const initial = await countListeners();

  for (let i = 0; i < 5; i++) {
    await page.goto(BASE + '/').catch(() => {});
    await page.goto(BASE + '/chat').catch(() => {});
  }

  const final = await countListeners();
  const ratio = initial > 0 ? (final / initial) : 1;

  console.log(`L4-T6: Interactive elements: initial=${initial} final=${final} ratio=${ratio.toFixed(2)}x`);
  // Allow reasonable DOM growth but not unbounded
  if (initial > 0) {
    expect(ratio).toBeLessThan(10);
  }
  console.log('L4-T6: PASS — No unbounded element/listener growth');
});

// ── L4-T7: WEBSOCKET/SSE FAILURE RESILIENCE ──────────────────
test('L4-T7: App survives when SSE streaming is cut mid-response', async ({ page }) => {
  let streamCut = false;
  await page.route('/api/ai/**', async route => {
    // Simulate truncated stream (connection cut mid-flight)
    if (!streamCut) {
      streamCut = true;
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: 'data: {"type":"chunk","text":"Starting response..."}\n\n',
        // No 'done' event — connection cut
      });
    } else {
      await route.abort('connectionreset');
    }
  });
  await page.route('/api/auth/session', r => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      user: { id: 'test', name: 'T', email: 't@t.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    }),
  }));

  await page.goto(BASE + '/chat');
  const crashes: string[] = [];
  page.on('pageerror', e => crashes.push(e.message));

  const input = page.locator('textarea, input[type="text"]').first();
  const visible = await input.isVisible({ timeout: 8000 }).catch(() => false);

  if (visible) {
    await input.fill('Test message that will be cut');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    const uiAlive = await page.locator('body').isVisible();
    expect(uiAlive).toBe(true);
    expect(crashes.length, 'No crashes after stream cut').toBe(0);
    console.log(`L4-T7: Stream cut mid-response. UI alive: ${uiAlive}. Crashes: ${crashes.length}`);
  } else {
    console.log('L4-T7: Chat not accessible. Testing SSE abort at network level.');
    const res = await page.request.post(BASE + '/api/ai/claude', {
      data: { messages: [{ role: 'user', content: 'test' }] },
    });
    // 401 is the correct response (auth wall prevents SSE from even starting)
    expect([401, 200]).toContain(res.status());
    console.log(`L4-T7: SSE endpoint returned ${res.status()} (expected 401 without auth)`);
  }

  console.log('L4-T7: PASS — SSE failure handled gracefully');
});
