import { test, expect } from '@playwright/test';

test.describe('Catalog', () => {
  test('homepage loads with brand carousel and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=АЛТЕХ').first()).toBeVisible();
    await expect(page.locator('a[href="/catalog/lubricants"]').first()).toBeVisible();
  });

  test('catalog page shows products with prices', async ({ page }) => {
    await page.goto('/catalog/lubricants');
    await expect(page.locator('text=ROLF').first()).toBeVisible();
    // Check that page contains product data
    const body = await page.textContent('body');
    expect(body).toContain('Krafton');
    expect(body).toContain('₽');
  });

  test('catalog filters by category', async ({ page }) => {
    await page.goto('/catalog/lubricants/motornye');
    await expect(page.locator('text=ROLF').first()).toBeVisible();
  });

  test('catalog filters by brand', async ({ page }) => {
    await page.goto('/catalog/lubricants?brand=kixx');
    await expect(page.locator('text=KIXX').first()).toBeVisible();
  });

  test('search page works', async ({ page }) => {
    await page.goto('/search?q=ROLF');
    await expect(page.locator('text=ROLF').first()).toBeVisible();
  });
});

test.describe('Product Detail', () => {
  test('shows product with variants and add-to-cart', async ({ page }) => {
    await page.goto('/product/rolf-krafton-p5u-10w40');
    await expect(page.getByRole('heading', { name: /ROLF Krafton P5 U 10W-40/ })).toBeVisible();

    // Should show volume variants
    await expect(page.locator('text=208 л').first()).toBeVisible();
    await expect(page.locator('text=20 л').first()).toBeVisible();
    await expect(page.locator('text=Розлив').first()).toBeVisible();

    // Should have add-to-cart button
    const addButton = page.locator('button', { hasText: /корзин|Добавить/i });
    await expect(addButton.first()).toBeVisible();
  });

  test('bulk variant shows liter stepper', async ({ page }) => {
    await page.goto('/product/rolf-krafton-p5u-10w40');
    await page.locator('text=Розлив').first().click();
    await expect(page.locator('text=400').first()).toBeVisible();
  });

  test('new product AKross loads correctly', async ({ page }) => {
    await page.goto('/product/akross-15w40-ci4');
    await expect(page.getByRole('heading', { name: /AKross PROFESSIONAL 15W-40/ })).toBeVisible();
  });
});
