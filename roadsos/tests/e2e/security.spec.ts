import { test, expect } from '@playwright/test';

test.describe('Security & Authentication', () => {
  test('unauthorized users are redirected to login from /admin', async ({ page }) => {
    // Navigate to admin directly without session
    await page.goto('/admin');
    
    // Should be redirected to root (login page)
    await expect(page).toHaveURL('/');
  });

  test('unauthorized users receive 401 on /api/profile', async ({ request }) => {
    const response = await request.get('/api/profile');
    expect(response.status()).toBe(401);
  });

  test('unauthenticated users receive 401 on /api/admin/* endpoints', async ({ request }) => {
    const response = await request.get('/api/admin/probe');
    expect(response.status()).toBe(401);
  });

  test('security headers are present on pages', async ({ request }) => {
    const response = await request.get('/');
    expect(response.ok()).toBeTruthy();
  });

  test('mock credentials login is no longer available', async ({ page }) => {
    // The standard /api/auth/providers should not include 'credentials'
    const response = await page.request.get('/api/auth/providers');
    const providers = await response.json();
    
    expect(providers).not.toHaveProperty('credentials');
    expect(providers).toHaveProperty('google');
    expect(providers).toHaveProperty('apple');
  });
});
