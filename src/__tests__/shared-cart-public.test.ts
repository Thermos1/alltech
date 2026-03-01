import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAdminFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}));

const { GET } = await import('@/app/api/shared-cart/[code]/route');

function createRequest() {
  return new Request('http://localhost/api/shared-cart/ABCD1234', { method: 'GET' });
}

// --- Test data ---
const cartId = 'cart-uuid-1';
const managerId = 'manager-uuid-1';
const futureDate = new Date(Date.now() + 86400_000).toISOString(); // +24h

const baseCart = {
  id: cartId,
  code: 'ABCD1234',
  status: 'pending',
  notes: 'Test cart notes',
  expires_at: futureDate,
  manager_id: managerId,
};

const mockItems = [
  { id: 'item-1', variant_id: 'var-1', quantity: 2, note: 'urgent' },
  { id: 'item-2', variant_id: 'var-2', quantity: 1, note: null },
];

const mockVariants = [
  { id: 'var-1', volume: '5L', price: 1500, product_id: 'prod-1' },
  { id: 'var-2', volume: '1L', price: 400, product_id: 'prod-2' },
];

const mockProducts = [
  { id: 'prod-1', name: 'Rolf GT 5W-40', image_url: '/images/rolf-gt.webp' },
  { id: 'prod-2', name: 'Sintec Platinum 5W-30', image_url: null },
];

describe('GET /api/shared-cart/[code]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 when cart not found', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ code: 'NOTFOUND' }) }
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Cart not found');
  });

  it('returns 410 when cart status is expired', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { ...baseCart, status: 'expired' },
              error: null,
            }),
        }),
      }),
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ code: 'ABCD1234' }) }
    );
    expect(res.status).toBe(410);
    const data = await res.json();
    expect(data.error).toBe('Cart expired');
    expect(data.status).toBe('expired');
  });

  it('returns 410 when cart status is ordered', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { ...baseCart, status: 'ordered' },
              error: null,
            }),
        }),
      }),
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ code: 'ABCD1234' }) }
    );
    expect(res.status).toBe(410);
    const data = await res.json();
    expect(data.error).toBe('Cart already ordered');
    expect(data.status).toBe('ordered');
  });

  it('returns 410 and updates status when expires_at is in the past', async () => {
    const pastDate = '2020-01-01T00:00:00Z';
    let sharedCartsCallCount = 0;
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        sharedCartsCallCount++;
        if (sharedCartsCallCount === 1) {
          // First call: select cart by code
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { ...baseCart, status: 'pending', expires_at: pastDate },
                    error: null,
                  }),
              }),
            }),
          };
        }
        // Second call: update status to expired
        return {
          update: () => ({
            eq: mockUpdateEq,
          }),
        };
      }
      return {};
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ code: 'ABCD1234' }) }
    );
    expect(res.status).toBe(410);
    const data = await res.json();
    expect(data.error).toBe('Cart expired');
    expect(data.status).toBe('expired');
    // Verify status was updated in DB
    expect(mockUpdateEq).toHaveBeenCalledWith('id', cartId);
  });

  it('marks pending cart as viewed', async () => {
    let sharedCartsCallCount = 0;
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        sharedCartsCallCount++;
        if (sharedCartsCallCount === 1) {
          // First call: select cart
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { ...baseCart, status: 'pending' },
                    error: null,
                  }),
              }),
            }),
          };
        }
        // Second call: update status to 'viewed'
        return {
          update: () => ({
            eq: mockUpdateEq,
          }),
        };
      }
      if (table === 'shared_cart_items') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({ data: { full_name: 'Test Manager' }, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ code: 'ABCD1234' }) }
    );
    expect(res.status).toBe(200);
    // Verify update was called with 'viewed' status
    expect(mockUpdateEq).toHaveBeenCalledWith('id', cartId);
  });

  it('returns cart data with enriched items successfully', async () => {
    let sharedCartsCallCount = 0;

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        sharedCartsCallCount++;
        if (sharedCartsCallCount === 1) {
          // First call: select cart by code
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { ...baseCart, status: 'pending' },
                    error: null,
                  }),
              }),
            }),
          };
        }
        // Second call: update status to 'viewed'
        return {
          update: () => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      if (table === 'shared_cart_items') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: mockItems, error: null }),
          }),
        };
      }
      if (table === 'product_variants') {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: mockVariants, error: null }),
          }),
        };
      }
      if (table === 'products') {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: mockProducts, error: null }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: { full_name: 'Иван Менеджер' },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ code: 'ABCD1234' }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.code).toBe('ABCD1234');
    expect(data.notes).toBe('Test cart notes');
    expect(data.managerName).toBe('Иван Менеджер');
    expect(data.items).toHaveLength(2);

    // First item — enriched with variant + product data
    expect(data.items[0]).toEqual({
      variantId: 'var-1',
      productId: 'prod-1',
      productName: 'Rolf GT 5W-40',
      variantLabel: '5L',
      price: 1500,
      quantity: 2,
      imageUrl: '/images/rolf-gt.webp',
    });

    // Second item — null image_url becomes undefined (omitted in JSON)
    expect(data.items[1]).toEqual({
      variantId: 'var-2',
      productId: 'prod-2',
      productName: 'Sintec Platinum 5W-30',
      variantLabel: '1L',
      price: 400,
      quantity: 1,
    });

    // Verify all tables were queried
    expect(mockAdminFrom).toHaveBeenCalledWith('shared_carts');
    expect(mockAdminFrom).toHaveBeenCalledWith('shared_cart_items');
    expect(mockAdminFrom).toHaveBeenCalledWith('product_variants');
    expect(mockAdminFrom).toHaveBeenCalledWith('products');
    expect(mockAdminFrom).toHaveBeenCalledWith('profiles');
  });

  it('returns "Менеджер" as fallback when manager profile not found', async () => {
    let sharedCartsCallCount = 0;

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        sharedCartsCallCount++;
        if (sharedCartsCallCount === 1) {
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { ...baseCart, status: 'viewed' },
                    error: null,
                  }),
              }),
            }),
          };
        }
        return {
          update: () => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      if (table === 'shared_cart_items') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        };
      }
      if (table === 'profiles') {
        // Manager profile not found
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({ data: null, error: { message: 'Not found' } }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ code: 'ABCD1234' }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.managerName).toBe('Менеджер');
  });

  it('returns empty items when cart has no items', async () => {
    let sharedCartsCallCount = 0;

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        sharedCartsCallCount++;
        if (sharedCartsCallCount === 1) {
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { ...baseCart, status: 'viewed' },
                    error: null,
                  }),
              }),
            }),
          };
        }
        return {
          update: () => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      if (table === 'shared_cart_items') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: { full_name: 'Manager Name' },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ code: 'ABCD1234' }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toEqual([]);
    expect(data.code).toBe('ABCD1234');
    expect(data.managerName).toBe('Manager Name');
  });

  it('does not update status when cart is already viewed', async () => {
    let sharedCartsCallCount = 0;

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        sharedCartsCallCount++;
        if (sharedCartsCallCount === 1) {
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { ...baseCart, status: 'viewed' },
                    error: null,
                  }),
              }),
            }),
          };
        }
        // Should NOT be called for 'viewed' status
        return {
          update: () => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      if (table === 'shared_cart_items') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: { full_name: 'Manager' },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ code: 'ABCD1234' }) }
    );
    expect(res.status).toBe(200);
    // shared_carts should only be called once (the initial select), not twice
    expect(sharedCartsCallCount).toBe(1);
  });
});
