import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockServerFrom = vi.fn();
const mockAdminFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockServerFrom,
    }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}));

const { GET, DELETE: DELETE_HANDLER } = await import(
  '@/app/api/admin/shared-cart/[id]/route'
);

function createRequest(method = 'GET') {
  return new Request('http://localhost/api/admin/shared-cart/cart-123', {
    method,
  });
}

const cartParams = { params: Promise.resolve({ id: 'cart-123' }) };

// --- GET /api/admin/shared-cart/[id] ---
describe('GET /api/admin/shared-cart/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated admin user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user' } },
      error: null,
    });
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: { role: 'admin' }, error: null }),
        }),
      }),
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ id: 'cart-123' }) }
    );
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 for customer role', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: { role: 'customer' }, error: null }),
        }),
      }),
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ id: 'cart-123' }) }
    );
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('Forbidden');
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
      { params: Promise.resolve({ id: 'nonexistent' }) }
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Not found');
  });

  it('returns 403 when manager tries to view another manager cart', async () => {
    // User is a manager
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: { role: 'manager' }, error: null }),
        }),
      }),
    });
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'manager-1' } },
      error: null,
    });

    // Cart belongs to a different manager
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: {
                id: 'cart-123',
                manager_id: 'manager-other',
                status: 'active',
              },
              error: null,
            }),
        }),
      }),
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ id: 'cart-123' }) }
    );
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('Forbidden');
  });

  it('returns cart with enriched items for admin', async () => {
    const cartData = {
      id: 'cart-123',
      manager_id: 'some-manager',
      status: 'active',
      client_phone: '+79001111111',
      created_at: '2026-01-01T00:00:00Z',
    };

    const itemsData = [
      { id: 'item-1', variant_id: 'var-1', quantity: 2, note: 'Urgent' },
      { id: 'item-2', variant_id: 'var-2', quantity: 1, note: null },
    ];

    const variantsData = [
      { id: 'var-1', volume: '4L', price: 2500, product_id: 'prod-1' },
      { id: 'var-2', volume: '1L', price: 800, product_id: 'prod-2' },
    ];

    const productsData = [
      { id: 'prod-1', name: 'ROLF GT 5W-40' },
      { id: 'prod-2', name: 'Sintec Platinum 5W-30' },
    ];

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: cartData, error: null }),
            }),
          }),
        };
      }
      if (table === 'shared_cart_items') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: itemsData, error: null }),
          }),
        };
      }
      if (table === 'product_variants') {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: variantsData, error: null }),
          }),
        };
      }
      if (table === 'products') {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: productsData, error: null }),
          }),
        };
      }
      return {};
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ id: 'cart-123' }) }
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.id).toBe('cart-123');
    expect(data.status).toBe('active');
    expect(data.items).toHaveLength(2);

    // First item enriched
    expect(data.items[0].variant_id).toBe('var-1');
    expect(data.items[0].quantity).toBe(2);
    expect(data.items[0].volume).toBe('4L');
    expect(data.items[0].price).toBe(2500);
    expect(data.items[0].productName).toBe('ROLF GT 5W-40');

    // Second item enriched
    expect(data.items[1].variant_id).toBe('var-2');
    expect(data.items[1].quantity).toBe(1);
    expect(data.items[1].volume).toBe('1L');
    expect(data.items[1].price).toBe(800);
    expect(data.items[1].productName).toBe('Sintec Platinum 5W-30');
  });

  it('returns cart with enriched items for own manager', async () => {
    // User is a manager viewing their own cart
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: { role: 'manager' }, error: null }),
        }),
      }),
    });
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'manager-1' } },
      error: null,
    });

    const cartData = {
      id: 'cart-456',
      manager_id: 'manager-1',
      status: 'active',
    };

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: cartData, error: null }),
            }),
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
      return {};
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ id: 'cart-456' }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('cart-456');
    expect(data.items).toHaveLength(0);
  });

  it('handles empty items gracefully', async () => {
    const cartData = {
      id: 'cart-empty',
      manager_id: 'admin-user',
      status: 'active',
    };

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: cartData, error: null }),
            }),
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
      return {};
    });

    const res = await GET(
      createRequest() as never,
      { params: Promise.resolve({ id: 'cart-empty' }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(0);
  });
});

// --- DELETE /api/admin/shared-cart/[id] ---
describe('DELETE /api/admin/shared-cart/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated admin user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user' } },
      error: null,
    });
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: { role: 'admin' }, error: null }),
        }),
      }),
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await DELETE_HANDLER(
      createRequest('DELETE') as never,
      { params: Promise.resolve({ id: 'cart-123' }) }
    );
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 for customer role', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: { role: 'customer' }, error: null }),
        }),
      }),
    });

    const res = await DELETE_HANDLER(
      createRequest('DELETE') as never,
      { params: Promise.resolve({ id: 'cart-123' }) }
    );
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('Forbidden');
  });

  it('returns 404 when cart not found', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    });

    const res = await DELETE_HANDLER(
      createRequest('DELETE') as never,
      { params: Promise.resolve({ id: 'nonexistent' }) }
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Not found');
  });

  it('returns 403 when manager tries to delete another manager cart', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: { role: 'manager' }, error: null }),
        }),
      }),
    });
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'manager-1' } },
      error: null,
    });

    // Cart belongs to a different manager
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { manager_id: 'manager-other' },
              error: null,
            }),
        }),
      }),
    });

    const res = await DELETE_HANDLER(
      createRequest('DELETE') as never,
      { params: Promise.resolve({ id: 'cart-123' }) }
    );
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('Forbidden');
  });

  it('deletes (expires) cart successfully as admin', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });

    let callCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        callCount++;
        if (callCount === 1) {
          // First call: select manager_id
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { manager_id: 'admin-user' },
                    error: null,
                  }),
              }),
            }),
          };
        }
        // Second call: update status
        return { update: mockUpdate };
      }
      return {};
    });

    const res = await DELETE_HANDLER(
      createRequest('DELETE') as never,
      { params: Promise.resolve({ id: 'cart-123' }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'expired' });
  });

  it('deletes (expires) own cart successfully as manager', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: { role: 'manager' }, error: null }),
        }),
      }),
    });
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'manager-1' } },
      error: null,
    });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });

    let callCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        callCount++;
        if (callCount === 1) {
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { manager_id: 'manager-1' },
                    error: null,
                  }),
              }),
            }),
          };
        }
        return { update: mockUpdate };
      }
      return {};
    });

    const res = await DELETE_HANDLER(
      createRequest('DELETE') as never,
      { params: Promise.resolve({ id: 'cart-123' }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'expired' });
  });
});
