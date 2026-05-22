import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'tests/playwright-report' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
    env: {
      AUTH_SECRET: 'ci-playwright-auth-secret-change-in-real-envs',
      NEXTAUTH_SECRET: 'ci-playwright-auth-secret-change-in-real-envs',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'ci-supabase-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'ci-supabase-service-role-key',
      GOOGLE_CLIENT_ID: 'ci-google-client-id',
      GOOGLE_CLIENT_SECRET: 'ci-google-client-secret',
      APPLE_ID: 'ci-apple-client-id',
      APPLE_SECRET: 'ci-apple-client-secret',
    },
  },
});
