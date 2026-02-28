import { test, expect } from '@playwright/test';

test.describe('SMS Auth', () => {
  test('login page shows phone input', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Вход').first()).toBeVisible();
    await expect(page.locator('input[type="tel"], input[placeholder*="900"]').first()).toBeVisible();
  });

  test('send OTP API returns code in dev mode', async ({ request }) => {
    const response = await request.post('/api/auth/send-otp', {
      data: { phone: '79241716100' },
    });
    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.devCode).toBeTruthy();
  });

  test('verify OTP API works with correct code', async ({ request }) => {
    const sendRes = await request.post('/api/auth/send-otp', {
      data: { phone: '79998887766' },
    });
    const { devCode } = await sendRes.json();

    const verifyRes = await request.post('/api/auth/verify-otp', {
      data: { phone: '79998887766', code: devCode },
    });
    expect(verifyRes.ok()).toBeTruthy();
    const verifyData = await verifyRes.json();
    expect(verifyData.success).toBeTruthy();
  });

  test('verify OTP API rejects wrong code', async ({ request }) => {
    await request.post('/api/auth/send-otp', {
      data: { phone: '79997776655' },
    });

    const verifyRes = await request.post('/api/auth/verify-otp', {
      data: { phone: '79997776655', code: '0000' },
    });
    const data = await verifyRes.json();
    expect(data.success).toBeFalsy();
  });
});

test.describe('Admin Login', () => {
  test('admin-login page shows email/password form', async ({ page }) => {
    await page.goto('/admin-login');
    await expect(page.locator('text=сотрудников')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('admin panel redirects unauthenticated users', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL(url => url.pathname.includes('login'), { timeout: 5000 }).catch(() => {});
    const url = page.url();
    expect(url).toMatch(/login/);
  });
});
