import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock sipmind auth
vi.mock('@/lib/sipmind/auth', () => ({
  verifySipmindAuth: vi.fn(),
}));

const mockAdminFrom = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}));

import { verifySipmindAuth } from '@/lib/sipmind/auth';
const mockAuth = vi.mocked(verifySipmindAuth);

const { POST: searchProducts } = await import('@/app/api/sipmind/search-products/route');
const { POST: checkStock } = await import('@/app/api/sipmind/check-stock/route');
const { POST: createOrder } = await import('@/app/api/sipmind/create-order/route');

function createRequest(url: string, body: Record<string, unknown>) {
  return new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-secret',
    },
    body: JSON.stringify(body),
  });
}

// ============================================================
// search-products
// ============================================================
describe('POST /api/sipmind/search-products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockReturnValue(true);
  });

  it('returns 401 when auth fails', async () => {
    mockAuth.mockReturnValue(false);
    const res = await searchProducts(
      createRequest('http://localhost/api/sipmind/search-products', { query: 'rolf' }) as never
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when no search params provided', async () => {
    const res = await searchProducts(
      createRequest('http://localhost/api/sipmind/search-products', {}) as never
    );
    expect(res.status).toBe(400);
  });

  it('returns products matching query', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          limit: () => ({
            ilike: () =>
              Promise.resolve({
                data: [
                  {
                    name: 'ROLF Krafton P5 G 10W-40',
                    slug: 'rolf-krafton-p5g-10w40',
                    viscosity: '10W-40',
                    base_type: 'synthetic',
                    brands: { name: 'ROLF', slug: 'rolf' },
                    product_variants: [
                      { id: 'v1', volume: '20 л', unit: 'шт', price: 10500, stock_qty: 5 },
                    ],
                  },
                ],
                error: null,
              }),
          }),
        }),
      }),
    });

    const res = await searchProducts(
      createRequest('http://localhost/api/sipmind/search-products', { query: 'krafton' }) as never
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.products).toHaveLength(1);
    expect(data.products[0].name).toBe('ROLF Krafton P5 G 10W-40');
    expect(data.products[0].brand).toBe('ROLF');
  });

  it('returns empty array when no products found', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          limit: () => ({
            ilike: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
    });

    const res = await searchProducts(
      createRequest('http://localhost/api/sipmind/search-products', { query: 'nonexistent' }) as never
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.products).toHaveLength(0);
  });

  it('searches by brand slug', async () => {
    // First call: brand lookup
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'brands') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { id: 'brand-1' }, error: null }),
            }),
          }),
        };
      }
      // products query
      return {
        select: () => ({
          eq: () => ({
            limit: () => ({
              eq: () =>
                Promise.resolve({
                  data: [
                    {
                      name: 'Test Product',
                      slug: 'test',
                      viscosity: '5W-30',
                      base_type: null,
                      brands: { name: 'ROLF', slug: 'rolf' },
                      product_variants: [],
                    },
                  ],
                  error: null,
                }),
            }),
          }),
        }),
      };
    });

    const res = await searchProducts(
      createRequest('http://localhost/api/sipmind/search-products', { brand: 'rolf' }) as never
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

// ============================================================
// check-stock
// ============================================================
describe('POST /api/sipmind/check-stock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockReturnValue(true);
  });

  it('returns 401 when auth fails', async () => {
    mockAuth.mockReturnValue(false);
    const res = await checkStock(
      createRequest('http://localhost/api/sipmind/check-stock', { product_slug: 'test' }) as never
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when no product_slug or query', async () => {
    const res = await checkStock(
      createRequest('http://localhost/api/sipmind/check-stock', {}) as never
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown product slug', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      }),
    });

    const res = await checkStock(
      createRequest('http://localhost/api/sipmind/check-stock', { product_slug: 'unknown' }) as never
    );
    expect(res.status).toBe(404);
  });

  it('returns stock info for product by slug', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { id: 'p1', name: 'Krafton P5 G', slug: 'krafton', brands: { name: 'ROLF' } },
                    error: null,
                  }),
              }),
            }),
          }),
        };
      }
      if (table === 'product_variants') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () =>
                  Promise.resolve({
                    data: [
                      { id: 'v1', volume: '20 л', unit: 'шт', price: 10500, stock_qty: 10 },
                      { id: 'v2', volume: '200 л', unit: 'шт', price: 82000, stock_qty: 0 },
                    ],
                    error: null,
                  }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await checkStock(
      createRequest('http://localhost/api/sipmind/check-stock', { product_slug: 'krafton' }) as never
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.in_stock).toBe(true);
    expect(data.product_name).toContain('ROLF');
    expect(data.variants).toHaveLength(2);
  });
});

// ============================================================
// create-order
// ============================================================
describe('POST /api/sipmind/create-order', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockReturnValue(true);
  });

  it('returns 401 when auth fails', async () => {
    mockAuth.mockReturnValue(false);
    const res = await createOrder(
      createRequest('http://localhost/api/sipmind/create-order', {
        product_slug: 'test',
        quantity: 1,
        phone: '+79001234567',
        name: 'Тест',
      }) as never
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when product_slug is missing', async () => {
    const res = await createOrder(
      createRequest('http://localhost/api/sipmind/create-order', {
        quantity: 1,
        phone: '+79001234567',
        name: 'Тест',
      }) as never
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when quantity is 0', async () => {
    const res = await createOrder(
      createRequest('http://localhost/api/sipmind/create-order', {
        product_slug: 'test',
        quantity: 0,
        phone: '+79001234567',
        name: 'Тест',
      }) as never
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when phone is missing', async () => {
    const res = await createOrder(
      createRequest('http://localhost/api/sipmind/create-order', {
        product_slug: 'test',
        quantity: 1,
        name: 'Тест',
      }) as never
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when name is missing', async () => {
    const res = await createOrder(
      createRequest('http://localhost/api/sipmind/create-order', {
        product_slug: 'test',
        quantity: 1,
        phone: '+79001234567',
      }) as never
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 when product not found', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      }),
    });

    const res = await createOrder(
      createRequest('http://localhost/api/sipmind/create-order', {
        product_slug: 'nonexistent',
        quantity: 1,
        phone: '+79001234567',
        name: 'Тест',
      }) as never
    );
    expect(res.status).toBe(404);
  });

  it('creates order with cheapest variant when variant_id not specified', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { id: 'p1', name: 'Test Oil', slug: 'test-oil', brands: { name: 'ROLF' } },
                    error: null,
                  }),
              }),
            }),
          }),
        };
      }
      if (table === 'product_variants') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: () =>
                    Promise.resolve({
                      data: [{ id: 'v1', volume: '20 л', unit: 'шт', price: 8400, stock_qty: 5 }],
                      error: null,
                    }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'orders') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: 'ord-1', order_number: 'ALT-SIPMIND-001' },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'order_items') {
        return {
          insert: () => Promise.resolve({ error: null }),
        };
      }
      return {};
    });

    const res = await createOrder(
      createRequest('http://localhost/api/sipmind/create-order', {
        product_slug: 'test-oil',
        quantity: 3,
        phone: '+79001234567',
        name: 'Иванов',
      }) as never
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.order_number).toMatch(/^ALT-\d{4}-\d+$/);
    expect(data.total).toBe(25200); // 8400 * 3
    expect(data.quantity).toBe(3);
  });
});
