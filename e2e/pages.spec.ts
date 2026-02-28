import { test, expect } from '@playwright/test';

test.describe('Static Pages', () => {
  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading').first()).toBeVisible();
    const content = await page.textContent('body');
    expect(content).toContain('конфиденциальност');
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading').first()).toBeVisible();
    const content = await page.textContent('body');
    expect(content).toContain('оглашени');
  });

  test('offer page loads', async ({ page }) => {
    await page.goto('/offer');
    await expect(page.getByRole('heading').first()).toBeVisible();
    const content = await page.textContent('body');
    expect(content).toContain('оферт');
  });

  test('returns page loads', async ({ page }) => {
    await page.goto('/returns');
    await expect(page.getByRole('heading').first()).toBeVisible();
    const content = await page.textContent('body');
    expect(content).toContain('озврат');
  });

  test('about page shows test accounts and modules', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('text=Покупатель').first()).toBeVisible();
    await expect(page.locator('text=Менеджер').first()).toBeVisible();
    await expect(page.locator('text=Администратор').first()).toBeVisible();
    await expect(page.locator('text=admin@altech-store.ru').first()).toBeVisible();
    await expect(page.locator('text=techdab.net').first()).toBeVisible();
  });
});

test.describe('API Endpoints', () => {
  test('promo validate API works', async ({ request }) => {
    const response = await request.post('/api/promo/validate', {
      data: { code: 'WELCOME10', total: 5000 },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.value).toBe(10);
    expect(data.type).toBe('percent');
  });

  test('promo validate returns error for invalid code', async ({ request }) => {
    const response = await request.post('/api/promo/validate', {
      data: { code: 'INVALID999', total: 5000 },
    });
    // Invalid code returns 4xx or response with null/error
    const data = await response.json();
    expect(data.discount ?? data.value ?? null).toBeNull();
  });
});
