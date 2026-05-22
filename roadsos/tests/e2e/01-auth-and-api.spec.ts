import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('unauthenticated user sees login screen with correct elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should see login page, not home page
    await expect(page.locator('text=ROADSoS')).toBeVisible();
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
    await expect(page.locator('button:has-text("Continue with Apple")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toHaveCount(0);
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test('protected route /control-room redirects to login', async ({ page }) => {
    await page.goto('/control-room');
    await page.waitForURL('/');
    await expect(page.locator('text=ROADSoS')).toBeVisible();
  });

  test('protected route /settings redirects to login', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForURL('/');
  });

  test('protected route /map redirects to login', async ({ page }) => {
    await page.goto('/map');
    await page.waitForURL('/');
  });

  test('protected route /chat redirects to login', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForURL('/');
  });

  test('no critical console errors on login page', async ({ page }) => {
    const criticalErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known harmless errors (favicon 404, etc.)
        if (!text.includes('favicon') && !text.includes('sw.js')) {
          criticalErrors.push(text);
        }
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // No JS exceptions should occur on the login page
    const jsErrors = criticalErrors.filter(e =>
      e.includes('TypeError') ||
      e.includes('ReferenceError') ||
      e.includes('Cannot read') ||
      e.includes('is not defined')
    );
    expect(jsErrors, `JS Errors found: ${jsErrors.join('\n')}`).toHaveLength(0);
  });

  test('login page is accessible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const googleBtn = page.locator('button:has-text("Continue with Google")');
    await expect(googleBtn).toBeVisible();
    // Button should be tappable (min 44px height)
    const box = await googleBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('API Routes', () => {
  test('GET /api/profile returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/profile');
    expect(response.status()).toBe(401);
  });

  test('POST /api/sos returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/sos', {
      data: { lat: 28.6, lng: 77.2, address: 'Test' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/sos/sms returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/sos/sms', {
      data: { to: ['+919999999999'], message: 'test' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/sos/email returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/sos/email', {
      data: { name: 'Test', lat: 0, lng: 0, address: 'test' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/sos/push returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/sos/push', {
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('POST /api/ai/claude returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/ai/claude', {
      data: { messages: [] },
    });
    expect(response.status()).toBe(401);
  });

  test('GET /api/nhtsa returns data (proxy works)', async ({ request }) => {
    const response = await request.get('/api/nhtsa');
    // Should not get a CORS error or 404; may get 200 or 502 if NHTSA is down
    expect(response.status()).not.toBe(404);
    expect(response.status()).not.toBe(0);
  });
});

test.describe('Pages Load Without Crash', () => {
  test('/ loads without unhandled JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });
});
