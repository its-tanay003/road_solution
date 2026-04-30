import { test, expect } from '@playwright/test';

test.describe('ROADSoS Auto-Crash & AI Triage Flows', () => {

  test.beforeEach(async ({ page }) => {
    // Go to the main page
    await page.goto('/');
  });

  test('should trigger auto-crash countdown and allow cancellation', async ({ page }) => {
    // Wait for the app to be ready
    await expect(page.locator('text=ROADSoS')).toBeVisible();

    // Trigger crash simulation by evaluating a custom event or a specific debug button
    // We assume there's a way to trigger the crash externally for testing, or we inject state
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('dev:simulate-crash'));
    });

    // Check if the crash overlay appears
    const overlay = page.locator('text=CRASH DETECTED');
    await expect(overlay).toBeVisible();

    // Wait for countdown to be visible
    await expect(page.locator('text=10')).toBeVisible();

    // Click "I am safe" button
    await page.click('button:has-text("I AM SAFE")');

    // Overlay should disappear
    await expect(overlay).not.toBeVisible();
  });

  test('should submit AI triage payload correctly', async ({ page, request }) => {
    // Navigate to triage chat
    await page.goto('/chat');
    
    // Fill the text input
    await page.fill('input[placeholder="Type your emergency..."]', 'I had a car accident and my arm hurts');
    await page.press('input[placeholder="Type your emergency..."]', 'Enter');

    // Check if the message is in the chat
    await expect(page.locator('text=I had a car accident and my arm hurts')).toBeVisible();
    
    // We expect the AI to respond, which means it should show typing indicator or response
    // Waiting for any bot response element
    await expect(page.locator('.bg-navy\\/50')).toBeVisible({ timeout: 10000 });
  });
});
