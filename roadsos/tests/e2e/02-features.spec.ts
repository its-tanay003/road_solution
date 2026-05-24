import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test.describe('ROADSoS Feature & Browse Testing', () => {
  
  test.beforeEach(async ({ context }) => {
    // Disable CarPlay/Automotive mode during tests to force standard layout rendering
    await context.addInitScript(() => {
      window.localStorage.setItem('automotive-mode', 'false');
    });

    // Inject mock session cookies so user is authenticated
    await context.addCookies([
      {
        name: 'authjs.session-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      },
      {
        name: 'next-auth.session-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/',
      }
    ]);

    // Grant location and notifications permissions to browser context
    await context.grantPermissions(['geolocation', 'notifications'], { origin: 'http://localhost:3000' });
    await context.setGeolocation({ latitude: 31.248054, longitude: 75.703378 });

    // Mock external Overpass (OSM) map requests to avoid network dependencies
    await context.route('**/overpass-api.de/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ elements: [] })
      });
    });

    // Mock WHO healthcare facility data endpoint
    await context.route('**/ghoapi.azureedge.net/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ value: [] })
      });
    });
  });

  test('1. User completes Onboarding flow successfully', async ({ page }) => {
    let profileSaved = false;

    // Intercept profile calls to simulate a new user with no profile
    await page.route('**/api/profile', async (route) => {
      if (route.request().method() === 'GET') {
        if (!profileSaved) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ profile: null, contacts: [] })
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              profile: {
                id: 'mock-user-id',
                full_name: 'Mock Test User',
                phone: '+91 99999 88888',
                blood_group: 'O+',
                medical_conditions: ['Asthma'],
                allergies: ['Penicillin'],
                date_of_birth: '1995-05-15',
                share_location_in_sos: true,
                share_medical_in_sos: true,
                share_camera_in_sos: false,
                sos_hold_duration: 3000,
                sos_shake_threshold: 4,
                language_preference: 'en',
                theme_preference: 'system',
              },
              contacts: [
                { name: 'Contact One', phone: '+91 88888 77777', relationship: 'Spouse' },
                { name: 'Contact Two', phone: '+91 77777 66666', relationship: 'Friend' }
              ]
            })
          });
        }
      } else if (route.request().method() === 'POST') {
        profileSaved = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });

    // Navigate to onboarding
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    // Step 1: Personal Details
    await page.fill('input[placeholder="e.g. Tanay Sharma"]', 'Mock Test User');
    await page.fill('input[placeholder="e.g. +91 98765 43210"]', '+91 99999 88888');
    await page.fill('input[type="date"]', '1995-05-15');
    await page.click('button:has-text("Continue")');

    // Step 2: Medical Info
    await page.selectOption('select', 'O+');
    await page.fill('textarea[placeholder*="Asthma"]', 'Asthma');
    await page.fill('textarea[placeholder*="Penicillin"]', 'Penicillin');
    await page.click('button:has-text("Continue")');

    // Step 3: Emergency Contacts
    // Select first contact fields
    await page.locator('input[placeholder="Contact Name"]').first().fill('Contact One');
    await page.locator('input[placeholder*="e.g. +91 99999"]').first().fill('+91 88888 77777');
    await page.locator('input[placeholder*="e.g. Mother"]').first().fill('Spouse');

    // Select second contact fields
    await page.locator('input[placeholder="Contact Name"]').nth(1).fill('Contact Two');
    await page.locator('input[placeholder*="e.g. +91 77777"]').nth(1).fill('+91 77777 66666');
    await page.locator('input[placeholder*="e.g. Father"]').nth(1).fill('Friend');

    await page.click('button:has-text("Continue")');

    // Step 4: System Permissions
    await expect(page.locator('text=System Integrations')).toBeVisible();
    await page.click('button:has-text("Allow access")');
    await page.click('button:has-text("Allow notifications")');
    
    // Complete Setup
    await page.click('button:has-text("Complete Setup")');

    // Should redirect to dashboard
    await page.waitForURL('**/');
    await expect(page.locator('text=ROADSoS')).toBeVisible();
  });

  test('2. Dashboard displays status widgets and triggers SOS', async ({ page }) => {
    // Intercept profile calls returning complete profile
    await page.route('**/api/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            full_name: 'Mock Test User',
            phone: '+91 99999 88888',
            blood_group: 'O+',
            medical_conditions: ['Asthma'],
            allergies: ['Penicillin'],
            share_location_in_sos: true,
            share_medical_in_sos: true,
          },
          contacts: [
            { name: 'Contact One', phone: '+91 88888 77777', relationship: 'Spouse' },
            { name: 'Contact Two', phone: '+91 77777 66666', relationship: 'Friend' }
          ]
        })
      });
    });

    // Intercept SOS endpoints
    await page.route('**/api/sos', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          responder: { name: 'Ambulance 108', lat: 31.248, lng: 75.703, etaMinutes: 5 }
        })
      });
    });

    await page.route('**/api/sos/all-clear', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Confirm that general dashboard widgets are visible
    await expect(page.locator('text=GPS')).toBeVisible();
    await expect(page.locator('text=Battery')).toBeVisible();
    await expect(page.locator('text=Network')).toBeVisible();

    // Trigger SOS via triple-clicking
    const sosButton = page.locator('button[aria-label*="SOS"]');
    await sosButton.click();
    await sosButton.click();
    await sosButton.click();

    // Verify SOS active/countdown is visible
    await expect(page.locator('text=SOS ACTIVATING')).toBeVisible();

    // Wait a brief moment to check transitions
    await page.waitForTimeout(1000);

    // Cancel SOS by clicking "CANCEL"
    const cancelBtn = page.locator('button:has-text("CANCEL")');
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
    }
    
    // Verify it returned to idle/hold state
    await expect(page.locator('text=Hold 3s')).toBeVisible();
  });

  test('3. AI Chat Assistant streams mock response and clears history', async ({ page }) => {
    // Mock the streaming chat endpoint
    await page.route('**/api/ai/claude', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        headers: {
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: 'data: {"text": "I am Claude, your AI emergency responder."}\ndata: [DONE]\n'
      });
    });

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    // Select ChatGPT tab
    await page.click('button[aria-label="Switch to ChatGPT"]');
    
    // Mock for GPT as well
    await page.route('**/api/ai/gpt', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        headers: {
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: 'data: {"text": "I am ChatGPT, how can I help you?"}\ndata: [DONE]\n'
      });
    });

    // Fill chat input
    const textarea = page.locator('textarea[placeholder*="Ask about"]');
    await textarea.fill('Help with fractured leg');
    await page.click('button[aria-label="Send message"]');

    // Confirm that user prompt and mock reply are visible
    await expect(page.locator('text=Help with fractured leg')).toBeVisible();
    await expect(page.locator('text=I am ChatGPT, how can I help you?')).toBeVisible();

    // Clear history
    await page.click('button[aria-label="Clear history"]');

    // Confirm suggestions or placeholder returns
    await expect(page.locator('text=I am ChatGPT, how can I help you?')).toHaveCount(0);
  });

  test('4. First Aid Guide lists cards and triage chat works', async ({ page }) => {
    // Mock triage chat endpoint
    await page.route('**/api/ai/triage', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: 'This is a mock triage response recommending immediate hospital care.'
      });
    });

    await page.goto('/first-aid');
    await page.waitForLoadState('networkidle');

    // Expand CPR guide card
    const cprHeader = page.locator('summary:has-text("CPR")');
    await cprHeader.click();
    await expect(page.locator('text=Call 112 immediately')).toBeVisible();

    // Test Triage Chat input
    const triageInput = page.locator('input[placeholder*="Describe the emergency"]');
    await triageInput.fill('Chest pain and sweating');
    await page.click('form button[type="submit"]');

    // Verify response
    await expect(page.locator('text=This is a mock triage response recommending')).toBeVisible();
  });

  test('5. Settings page displays profile details, updates contact, and saves', async ({ page }) => {
    // Mock GET/POST for settings profile
    let contacts = [
      { name: 'Contact One', phone: '+91 88888 77777', relationship: 'Spouse' },
      { name: 'Contact Two', phone: '+91 77777 66666', relationship: 'Friend' }
    ];

    await page.route('**/api/profile', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              full_name: 'Mock Settings User',
              phone: '+91 99999 88888',
              blood_group: 'AB-',
              medical_conditions: ['Asthma'],
              allergies: ['Penicillin'],
              share_location_in_sos: true,
              share_medical_in_sos: true,
            },
            contacts
          })
        });
      } else if (route.request().method() === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        if (body.contacts) contacts = body.contacts;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Check pre-loaded values
    await expect(page.locator('input[aria-label="Full name"]')).toHaveValue('Mock Settings User');
    await expect(page.locator('input[aria-label="Phone number"]')).toHaveValue('+91 99999 88888');

    // Add a new contact
    await page.click('button:has-text("Add Contact")');
    await page.fill('input[aria-label="Contact name"]', 'Contact Three');
    await page.fill('input[aria-label="Contact phone"]', '+91 66666 55555');
    await page.fill('input[aria-label="Contact relationship"]', 'Brother');
    await page.click('button:has-text("Add")');

    // Click Save Now on the sticky save bar
    await page.click('button:has-text("Save Now")');

    // Verify contact displays in listing
    await expect(page.locator('text=Contact Three')).toBeVisible();
    await expect(page.locator('text=Brother')).toBeVisible();
  });

  test('6. Control Room dashboard loads for Admin role', async ({ page }) => {
    // Navigate directly to protected control-room
    await page.goto('/control-room');
    await page.waitForLoadState('networkidle');

    // Since test@example.com is in ADMIN_EMAILS, it should load successfully instead of redirecting
    await expect(page).toHaveURL('**/control-room');
    await expect(page.locator('text=Control Room')).toBeVisible();
  });

});
