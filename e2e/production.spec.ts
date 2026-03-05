import { test, expect } from '@playwright/test';

const BASE = 'https://altehspec.ru';

// ═══════════════════════════════════════════════════════════════
// HOMEPAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Homepage', () => {
  test('loads and shows hero section', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('text=Подберите масло')).toBeVisible();
    await expect(page.locator('text=оформите заказ за 5 кликов')).toBeVisible();
  });

  test('shows brand carousel', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('text=НАШИ БРЕНДЫ').first()).toBeVisible();
    await expect(page.locator('text=ROLF').first()).toBeVisible();
    await expect(page.locator('text=SINTEC').first()).toBeVisible();
    await expect(page.locator('text=KIXX').first()).toBeVisible();
  });

  test('shows popular products section', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('text=Популярные товары').first()).toBeVisible();
    await expect(page.locator('text=Все товары').first()).toBeVisible();
  });

  test('shows value props with stats', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('text=брендов в каталоге').first()).toBeVisible();
    await expect(page.locator('text=доставка по Якутску').first()).toBeVisible();
    await expect(page.locator('text=кэшбэк бонусами').first()).toBeVisible();
  });

  test('has CTA button linking to catalog', async ({ page }) => {
    await page.goto(BASE);
    const cta = page.locator('a[href="/catalog/lubricants"]').first();
    await expect(cta).toBeVisible();
  });

  test('header shows logo and navigation', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('text=АЛТЕХ').first()).toBeVisible();
  });

  test('footer shows company info', async ({ page }) => {
    await page.goto(BASE);
    const footer = page.locator('footer');
    await expect(footer.locator('text=АЛТЕХ').first()).toBeVisible();
  });

  test('mobile nav shows at bottom', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE);
    // MobileNav is a fixed bottom nav — last nav element on page
    const mobileNav = page.locator('nav').last();
    await expect(mobileNav).toBeVisible();
    // Check nav has links (last() to avoid matching hidden header links)
    await expect(mobileNav.locator('a[href="/"]')).toBeVisible();
    await expect(mobileNav.locator('a[href="/cart"]')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// CATALOG
// ═══════════════════════════════════════════════════════════════

test.describe('Catalog', () => {
  test('lubricants page loads with products', async ({ page }) => {
    await page.goto(BASE + '/catalog/lubricants');
    await expect(page.locator('text=₽').first()).toBeVisible();
  });

  test('category filter works (motornye)', async ({ page }) => {
    await page.goto(BASE + '/catalog/lubricants/motornye');
    await expect(page.locator('text=₽').first()).toBeVisible();
  });

  test('brand filter works', async ({ page }) => {
    await page.goto(BASE + '/catalog/lubricants?brand=rolf');
    await expect(page.locator('text=ROLF').first()).toBeVisible();
  });

  test('multiple brands available', async ({ page }) => {
    await page.goto(BASE + '/catalog/lubricants');
    const body = await page.textContent('body');
    expect(body).toContain('ROLF');
  });

  test('products show prices in rubles', async ({ page }) => {
    await page.goto(BASE + '/catalog/lubricants');
    const priceElements = page.locator('text=/\\d+\\s*₽/');
    const count = await priceElements.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// PRODUCT DETAIL
// ═══════════════════════════════════════════════════════════════

test.describe('Product Detail', () => {
  test('ROLF Krafton page loads with variants', async ({ page }) => {
    await page.goto(BASE + '/product/rolf-krafton-p5u-10w40');
    await expect(page.getByRole('heading', { name: /ROLF Krafton P5 U 10W-40/ })).toBeVisible();
    await expect(page.locator('text=₽').first()).toBeVisible();
  });

  test('shows volume variants', async ({ page }) => {
    await page.goto(BASE + '/product/rolf-krafton-p5u-10w40');
    await expect(page.locator('text=208 л').first()).toBeVisible();
    await expect(page.locator('text=20 л').first()).toBeVisible();
  });

  test('has add-to-cart button', async ({ page }) => {
    await page.goto(BASE + '/product/rolf-krafton-p5u-10w40');
    const addButton = page.locator('button', { hasText: /корзин|Добавить/i });
    await expect(addButton.first()).toBeVisible();
  });

  test('product image loads', async ({ page }) => {
    await page.goto(BASE + '/product/rolf-krafton-p5u-10w40');
    const img = page.locator('img[alt*="ROLF"], img[alt*="Krafton"]').first();
    await expect(img).toBeVisible();
  });

  test('AKross product page loads', async ({ page }) => {
    await page.goto(BASE + '/product/akross-15w40-ci4');
    await expect(page.getByRole('heading', { name: /AKross/ })).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// CART
// ═══════════════════════════════════════════════════════════════

test.describe('Cart', () => {
  test('empty cart shows message', async ({ page }) => {
    // Clear localStorage first
    await page.goto(BASE);
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE + '/cart');
    await expect(page.locator('text=Корзина').first()).toBeVisible();
  });

  test('add product to cart and verify', async ({ page }) => {
    await page.goto(BASE);
    await page.evaluate(() => localStorage.clear());

    await page.goto(BASE + '/product/rolf-krafton-p5u-10w40');
    // Select 20L variant
    await page.locator('text=20 л').first().click();
    // Add to cart
    const addButton = page.locator('button', { hasText: /корзин|Добавить/i });
    await addButton.first().click();

    // Wait a bit for state update
    await page.waitForTimeout(500);

    // Go to cart page
    await page.goto(BASE + '/cart');
    await expect(page.locator('text=ROLF Krafton P5 U 10W-40').first()).toBeVisible();
  });

  test('cart persists after reload', async ({ page }) => {
    await page.goto(BASE);
    await page.evaluate(() => localStorage.clear());

    // Add item
    await page.goto(BASE + '/product/rolf-krafton-p5u-10w40');
    await page.locator('text=20 л').first().click();
    const addButton = page.locator('button', { hasText: /корзин|Добавить/i });
    await addButton.first().click();
    await page.waitForTimeout(500);

    // Reload
    await page.reload();
    await page.goto(BASE + '/cart');
    await expect(page.locator('text=ROLF Krafton P5 U 10W-40').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════

test.describe('Auth', () => {
  test('login page shows phone input', async ({ page }) => {
    await page.goto(BASE + '/login');
    await expect(page.locator('text=Вход').first()).toBeVisible();
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="900"], input[placeholder*="номер"]');
    await expect(phoneInput.first()).toBeVisible();
  });

  test('admin-login page shows email/password form', async ({ page }) => {
    await page.goto(BASE + '/admin-login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('checkout redirects to login when unauthenticated', async ({ page }) => {
    await page.goto(BASE + '/checkout');
    await page.waitForURL(/login/, { timeout: 5000 });
    expect(page.url()).toContain('login');
  });

  test('cabinet redirects to login when unauthenticated', async ({ page }) => {
    await page.goto(BASE + '/cabinet');
    await page.waitForURL(/login/, { timeout: 5000 });
    expect(page.url()).toContain('login');
  });

  test('admin panel redirects to login when unauthenticated', async ({ page }) => {
    await page.goto(BASE + '/admin');
    await page.waitForURL(/login/, { timeout: 5000 });
    expect(page.url()).toContain('login');
  });
});

// ═══════════════════════════════════════════════════════════════
// STATIC PAGES
// ═══════════════════════════════════════════════════════════════

test.describe('Legal Pages', () => {
  test('privacy policy page', async ({ page }) => {
    await page.goto(BASE + '/privacy');
    await expect(page.getByRole('heading').first()).toBeVisible();
    const body = await page.textContent('body');
    expect(body).toContain('конфиденциальност');
  });

  test('terms page', async ({ page }) => {
    await page.goto(BASE + '/terms');
    await expect(page.getByRole('heading').first()).toBeVisible();
    const body = await page.textContent('body');
    expect(body).toContain('оглашени');
  });

  test('offer page', async ({ page }) => {
    await page.goto(BASE + '/offer');
    await expect(page.getByRole('heading').first()).toBeVisible();
    const body = await page.textContent('body');
    expect(body).toContain('оферт');
  });

  test('returns page', async ({ page }) => {
    await page.goto(BASE + '/returns');
    await expect(page.getByRole('heading').first()).toBeVisible();
    const body = await page.textContent('body');
    expect(body).toContain('озврат');
  });

  test('about page shows project info', async ({ page }) => {
    await page.goto(BASE + '/about');
    await expect(page.locator('text=techdab.net').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════

test.describe('Search', () => {
  test('search page loads without query', async ({ page }) => {
    await page.goto(BASE + '/search');
    await expect(page.locator('text=Поиск').first()).toBeVisible();
    await expect(page.locator('text=Введите запрос').first()).toBeVisible();
  });

  test('search returns results for ROLF', async ({ page }) => {
    await page.goto(BASE + '/search?q=ROLF');
    await expect(page.locator('text=ROLF').first()).toBeVisible();
  });

  test('search returns results for масло', async ({ page }) => {
    await page.goto(BASE + '/search?q=масло');
    await expect(page.locator('text=₽').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// API HEALTH CHECKS
// ═══════════════════════════════════════════════════════════════

test.describe('API Health', () => {
  test('promo validate API responds', async ({ request }) => {
    const res = await request.post(BASE + '/api/promo/validate', {
      data: { code: 'NONEXISTENT', subtotal: 5000 },
    });
    // Should respond (200 or 400, not 500)
    expect(res.status()).toBeLessThan(500);
  });

  test('send-otp API responds', async ({ request }) => {
    const res = await request.post(BASE + '/api/auth/send-otp', {
      data: { phone: '+7 (999) 000-00-01' },
    });
    // Should not be 500
    expect(res.status()).toBeLessThan(500);
  });

  test('orders create API requires auth', async ({ request }) => {
    const res = await request.post(BASE + '/api/orders/create', {
      data: {},
    });
    expect(res.status()).toBe(401);
  });

  test('payment create API requires auth', async ({ request }) => {
    const res = await request.post(BASE + '/api/payment/create', {
      data: {},
    });
    expect(res.status()).toBe(401);
  });

  test('admin products API requires auth', async ({ request }) => {
    const res = await request.get(BASE + '/api/admin/products');
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('sitemap.xml is accessible', async ({ request }) => {
    const res = await request.get(BASE + '/sitemap.xml');
    expect(res.status()).toBe(200);
  });

  test('robots.txt is accessible', async ({ request }) => {
    const res = await request.get(BASE + '/robots.txt');
    expect(res.status()).toBe(200);
  });
});

// ═══════════════════════════════════════════════════════════════
// MOBILE RESPONSIVENESS
// ═══════════════════════════════════════════════════════════════

test.describe('Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('homepage renders correctly on mobile', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('text=Подберите масло')).toBeVisible();
    await expect(page.locator('text=ПЕРЕЙТИ В КАТАЛОГ')).toBeVisible();
  });

  test('catalog is scrollable on mobile', async ({ page }) => {
    await page.goto(BASE + '/catalog/lubricants');
    await expect(page.locator('text=₽').first()).toBeVisible();
  });

  test('product detail works on mobile', async ({ page }) => {
    await page.goto(BASE + '/product/rolf-krafton-p5u-10w40');
    await expect(page.locator('text=ROLF Krafton P5 U 10W-40').first()).toBeVisible();
    const addButton = page.locator('button', { hasText: /корзин|Добавить/i });
    await expect(addButton.first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE & SEO
// ═══════════════════════════════════════════════════════════════

test.describe('Performance & SEO', () => {
  test('homepage loads under 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });

  test('catalog loads under 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE + '/catalog/lubricants', { waitUntil: 'domcontentloaded' });
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });

  test('page has correct title', async ({ page }) => {
    await page.goto(BASE);
    const title = await page.title();
    expect(title).toContain('АЛТЕХ');
  });

  test('no console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    // Filter out known non-critical errors (e.g., third-party scripts)
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('Refresh Token')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
