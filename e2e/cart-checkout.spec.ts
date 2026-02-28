import { test, expect } from '@playwright/test';

test.describe('Cart', () => {
  test('empty cart shows message and link to catalog', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('text=Корзина').first()).toBeVisible();
    await expect(page.locator('text=пуста').first()).toBeVisible();
    await expect(page.locator('a[href*="catalog"]').first()).toBeVisible();
  });

  test('add product to cart from product page', async ({ page }) => {
    await page.goto('/product/rolf-krafton-p5u-10w40');

    // Select 20L variant
    await page.locator('text=20 л').first().click();

    // Add to cart
    const addButton = page.locator('button', { hasText: /корзин|Добавить/i });
    await addButton.first().click();

    // Cart icon should update (badge or counter)
    await page.goto('/cart');
    await expect(page.locator('text=ROLF Krafton P5 U 10W-40')).toBeVisible();
  });

  test('cart persists after page reload', async ({ page }) => {
    // Add item
    await page.goto('/product/sintec-truck-10w40');
    await page.locator('text=20 л').first().click();
    const addButton = page.locator('button', { hasText: /корзин|Добавить/i });
    await addButton.first().click();

    // Reload and check
    await page.reload();
    await page.goto('/cart');
    await expect(page.locator('text=SINTEC Truck').first()).toBeVisible();
  });
});

test.describe('Checkout (unauthenticated)', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/checkout');
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});
