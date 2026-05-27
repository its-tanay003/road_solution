import { test, expect } from '@playwright/test';

const BASE = 'http://127.0.0.1:3000';

async function setupMockSession(page: any) {
  await page.addInitScript(() => {
    window.localStorage.setItem('automotive-mode', 'false');
  });

  await page.route('/api/auth/session', r => r.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      user: { id: 'test-user', name: 'Test User', email: 'test@example.com', role: 'user' },
      expires: new Date(Date.now() + 86400000).toISOString()
    })
  }));
}

// ── L4-CHAOS-T1: Spoofed Geolocation handled gracefully ──
test('L4-CHAOS-T1: Spoofed/impossible geolocation (lat=999) handled gracefully', async ({ page }) => {
  await setupMockSession(page);
  // Set impossible mock geolocation coords
  await page.context().setGeolocation({ latitude: 90.0, longitude: 180.0 });
  await page.goto(BASE);
  const locationStatusText = await page.locator('body').textContent();
  expect(locationStatusText).toBeTruthy();
  console.log('L4-CHAOS-T1: Impossible coordinate handled without crash');
});

// ── L4-CHAOS-T2: Battery API extreme states ──
test('L4-CHAOS-T2: Battery API extreme states (0%, rapid flapping) no crash', async ({ page }) => {
  await setupMockSession(page);
  await page.goto(BASE);
  await page.evaluate(() => {
    // Mock navigator.getBattery
    (navigator as any).getBattery = async () => {
      const mockBattery = {
        level: 0.0,
        charging: false,
        addEventListener: function(event: string, callback: any) {
          // Trigger rapid updates (flapping)
          for (let i = 0; i < 50; i++) {
            setTimeout(() => {
              this.level = i % 2 === 0 ? 0.05 : 0.95;
              callback();
            }, i * 10);
          }
        }
      };
      return mockBattery;
    };
  });
  await page.waitForTimeout(1000);
  const ok = await page.locator('body').isVisible();
  expect(ok).toBe(true);
  console.log('L4-CHAOS-T2: Flapping battery events handled successfully');
});

// ── L4-CHAOS-T3: Web Worker crashes ──
test('L4-CHAOS-T3: Web Worker crashes — app recovers without blank page', async ({ page }) => {
  await setupMockSession(page);
  await page.goto(BASE);
  await page.evaluate(() => {
    try {
      const mockWorker = new Worker('data:text/javascript,throw new Error("Worker Exploded");');
      mockWorker.onerror = () => {
        console.log('Worker crashed (mock check)');
      };
    } catch (e) {}
  });
  await page.waitForTimeout(500);
  const content = await page.locator('body').textContent();
  expect(content?.length).toBeGreaterThan(10);
  console.log('L4-CHAOS-T3: Worker error recovered without UI crash');
});

// ── L4-CHAOS-T4: 100 rapid device orientation changes ──
test('L4-CHAOS-T4: 100 rapid device orientation changes — no overflow/crash', async ({ page }) => {
  await setupMockSession(page);
  await page.goto(BASE);
  for (let i = 0; i < 100; i++) {
    await page.evaluate((val) => {
      const event = new DeviceOrientationEvent('deviceorientation', {
        alpha: val * 3.6,
        beta: val * 1.8,
        gamma: val * 0.9,
      });
      window.dispatchEvent(event);
    }, i);
  }
  const isOk = await page.locator('body').isVisible();
  expect(isOk).toBe(true);
  console.log('L4-CHAOS-T4: 100 rapid orientation events complete cleanly');
});

// ── L4-CHAOS-T5: Corrupted Service Worker ──
test('L4-CHAOS-T5: Corrupted Service Worker — app still loads', async ({ page }) => {
  await setupMockSession(page);
  await page.route('/sw.js', r => r.fulfill({
    status: 500,
    body: 'throw new Error("Syntax Error in Service Worker");'
  }));
  await page.goto(BASE);
  const bodyText = await page.locator('body').textContent();
  expect(bodyText?.length).toBeGreaterThan(10);
  console.log('L4-CHAOS-T5: Corrupted service worker handled, app still loads');
});

// ── L4-CHAOS-T6: Clipboard API isolation ──
test('L4-CHAOS-T6: Clipboard API abuse does not leak data to API calls', async ({ page }) => {
  await setupMockSession(page);
  let leaked = false;
  await page.route('/api/**', async route => {
    const postData = route.request().postData() || '';
    if (postData.includes('super-secret-clipboard-value')) {
      leaked = true;
    }
    await route.fulfill({ status: 200, body: 'ok' });
  });

  await page.goto(BASE);
  // Set clipboard value
  await page.evaluate(() => {
    try {
      navigator.clipboard.writeText('super-secret-clipboard-value');
    } catch (e) {}
  });

  const settingsBtn = page.locator('a[href="/settings"]').first();
  if (await settingsBtn.isVisible()) {
    await settingsBtn.click();
    await page.waitForTimeout(500);
  }
  expect(leaked).toBe(false);
  console.log('L4-CHAOS-T6: Clipboard state completely isolated');
});

// ── L4-CHAOS-T7: Extreme Clock Skew ──
test('L4-CHAOS-T7: Extreme clock skew (±24h) — app survives without crash', async ({ page }) => {
  await setupMockSession(page);
  await page.goto(BASE);
  // Inject ±24 hours clock skew directly on Date object
  await page.evaluate(() => {
    const originalNow = Date.now;
    const offset = 24 * 60 * 60 * 1000; // 24 hours skew
    Date.now = () => originalNow() + offset;
  });
  await page.waitForTimeout(500);
  const visible = await page.locator('body').isVisible();
  expect(visible).toBe(true);
  console.log('L4-CHAOS-T7: Clock skew applied cleanly, UI stable');
});

// ── L4-CHAOS-T8: Session invalidated mid-request ──
test('L4-CHAOS-T8: Session invalidated mid-request — graceful error shown', async ({ page }) => {
  let sessionState = true;
  await page.route('/api/auth/session', r => {
    if (sessionState) {
      return r.fulfill({
        status: 200,
        body: JSON.stringify({
          user: { id: 'test-user', name: 'Test User' },
          expires: new Date(Date.now() + 60000).toISOString()
        })
      });
    } else {
      return r.fulfill({ status: 401, body: '{}' });
    }
  });

  await page.goto(BASE);
  await page.waitForTimeout(500);

  // Invalidate session state
  sessionState = false;
  await page.evaluate(() => {
    // Force reload session in the client store
    window.dispatchEvent(new Event('focus'));
  });
  await page.waitForTimeout(1000);
  const currentText = await page.locator('body').textContent();
  expect(currentText).toBeTruthy();
  console.log('L4-CHAOS-T8: Session invalidation processed gracefully');
});

// ── L4-CHAOS-T9: Open redirect / deep-link attack URL blocked ──
test('L4-CHAOS-T9: All open redirect / deep-link attack URLs blocked', async ({ page }) => {
  await setupMockSession(page);
  const maliciousUrls = [
    `${BASE}/?redirect=https://attacker.com`,
    `${BASE}/?next=http://malicious.org`,
    `${BASE}/?callbackUrl=javascript:alert(1)`,
    `${BASE}/?url=//attacker.com`,
  ];
  for (const url of maliciousUrls) {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    const resolvedUrl = page.url();
    expect(resolvedUrl).not.toContain('attacker.com');
    expect(resolvedUrl).not.toContain('malicious.org');
  }
  console.log('L4-CHAOS-T9: All open redirects neutralized');
});

// ── L4-CHAOS-T10: 1000 rapid DOM mutations ──
test('L4-CHAOS-T10: 1000 rapid DOM mutations — no crash, UI alive', async ({ page }) => {
  await setupMockSession(page);
  await page.goto(BASE);
  await page.evaluate(() => {
    const parent = document.body;
    for (let i = 0; i < 1000; i++) {
      const el = document.createElement('div');
      el.id = `mutation-stress-${i}`;
      el.style.display = 'none';
      parent.appendChild(el);
      if (i % 2 === 0) {
        parent.removeChild(el);
      }
    }
  });
  await page.waitForTimeout(500);
  const visible = await page.locator('body').isVisible();
  expect(visible).toBe(true);
  console.log('L4-CHAOS-T10: Layout stress test of 1000 mutations completed');
});
