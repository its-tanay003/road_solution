import { defineConfig, devices } from '@playwright/test';

// If a server is already on 3000 (dev mode), Playwright reuses it.
// Otherwise it starts the production server via `npm run start`.
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'tests/playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Use dev server if running, otherwise start production
    command: 'npm run start',
    url: 'http://127.0.0.1:3000',
    // CRITICAL: reuse existing server (dev or prod) instead of crashing
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      NODE_ENV: 'production',
      AUTH_SECRET: 'ci-playwright-auth-secret-change-in-real-envs',
      NEXTAUTH_SECRET: 'ci-playwright-auth-secret-change-in-real-envs',
      NEXTAUTH_URL: 'http://127.0.0.1:3000',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'ci-supabase-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'ci-supabase-service-role-key',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? 'ci-google-client-id',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? 'ci-google-client-secret',
      APPLE_ID: process.env.APPLE_ID ?? 'ci-apple-client-id',
      APPLE_SECRET: process.env.APPLE_SECRET ?? 'ci-apple-client-secret',
      ADMIN_EMAILS: process.env.ADMIN_EMAILS ?? 'test@example.com',
    },
  },
});
