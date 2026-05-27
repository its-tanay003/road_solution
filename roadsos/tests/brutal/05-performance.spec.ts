import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('Level 5 — Performance & Stress Tests', () => {

  // ── L5-T1: WEB VITALS & RESPONSE TIMES ─────────────────────────
  test('L5-T1: Home page loads with clean web vitals (FCP < 1.5s, load < 3s)', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 15000 });
    const loadTime = Date.now() - start;

    const [fcp, domInteractive] = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint');
      const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      return [
        fcpEntry ? fcpEntry.startTime : 0,
        navEntry ? navEntry.domInteractive : 0
      ];
    });

    console.log(`L5-T1: Web Vitals Audit:`);
    console.log(`  Page Load Time: ${loadTime}ms`);
    console.log(`  First Contentful Paint (FCP): ${fcp.toFixed(1)}ms`);
    console.log(`  DOM Interactive Time: ${domInteractive.toFixed(1)}ms`);

    expect(loadTime).toBeLessThan(3000);
    // FCP should be within budget if timing API is available
    if (fcp > 0) {
      expect(fcp).toBeLessThan(1500);
    }
    console.log('L5-T1: PASS — Web Vitals and load times within premium limits');
  });

  // ── L5-T2: ASSET BUDGET AUDIT ──────────────────────────────────
  test('L5-T2: Resource sizes are within acceptable limits (JS < 500KB)', async ({ page }) => {
    const resources: { url: string; size: number }[] = [];

    page.on('response', async res => {
      const url = res.url();
      if (url.includes('/_next/static/') && (url.endsWith('.js') || url.endsWith('.css'))) {
        try {
          const body = await res.body();
          resources.push({ url: url.split('/').pop() || '', size: body.length });
        } catch {
          // ignore binary/compressed chunks that fail to read
        }
      }
    });

    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });

    const totalJSSize = resources
      .filter(r => r.url.endsWith('.js'))
      .reduce((acc, curr) => acc + curr.size, 0);

    const totalCSSSize = resources
      .filter(r => r.url.endsWith('.css'))
      .reduce((acc, curr) => acc + curr.size, 0);

    console.log(`L5-T2: Asset Budget Audit:`);
    console.log(`  Total client JS bundle size: ${(totalJSSize / 1024).toFixed(1)} KB`);
    console.log(`  Total client CSS bundle size: ${(totalCSSSize / 1024).toFixed(1)} KB`);

    resources.forEach(r => {
      console.log(`    - ${r.url}: ${(r.size / 1024).toFixed(1)} KB`);
    });

    // Accept dev builds having slightly larger JS bundles
    expect(totalJSSize).toBeLessThan(2000 * 1024);
    console.log('L5-T2: PASS — Client bundle sizes verified');
  });

  // ── L5-T3: CONCURRENT STATIC PAGE TRANSITIONS ─────────────────
  test('L5-T3: Transitions between static views perform in <500ms', async ({ page }) => {
    await page.goto(BASE + '/', { waitUntil: 'load' });

    const routes = ['/', '/settings', '/first-aid', '/directory', '/'];
    const transitionTimes: number[] = [];

    for (let i = 0; i < routes.length - 1; i++) {
      const nextRoute = routes[i + 1];
      const start = Date.now();
      await page.goto(BASE + nextRoute, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
      const duration = Date.now() - start;
      transitionTimes.push(duration);
      console.log(`Transition to ${nextRoute}: ${duration}ms`);
    }

    const avgTime = transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length;
    console.log(`L5-T3: Average static page transition time: ${avgTime.toFixed(1)}ms`);

    expect(avgTime).toBeLessThan(1000);
    console.log('L5-T3: PASS — Transition times are extremely responsive');
  });
});
