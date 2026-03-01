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

vi.mock('@/lib/activity-log', () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

const { GET, POST } = await import('@/app/api/admin/shared-cart/route');

function createGetRequest() {
  return new Request('http://localhost/api/admin/shared-cart', { method: 'GET' });
}

function createPostRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/admin/shared-cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const userId = 'user-123';

function mockAdminAuth() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: userId } },
    error: null,
  });
  mockServerFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { role: 'admin' }, error: null }),
      }),
    }),
  });
}

function mockManagerAuth() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: userId } },
    error: null,
  });
  mockServerFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { role: 'manager' }, error: null }),
      }),
    }),
  });
}

// --- GET /api/admin/shared-cart ---
describe('GET /api/admin/shared-cart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 403 for customer role', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'customer' }, error: null }),
        }),
      }),
    });
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it('admin sees all carts', async () => {
    const mockCarts = [
      { id: 'cart-1', code: 'ABCD1234', manager_id: 'mgr-1', status: 'pending' },
      { id: 'cart-2', code: 'EFGH5678', manager_id: 'mgr-2', status: 'pending' },
    ];

    mockAdminFrom.mockReturnValue({
      select: () => ({
        order: () => Promise.resolve({ data: mockCarts }),
      }),
    });

    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toEqual(mockCarts);
    expect(data).toHaveLength(2);
  });

  it('manager sees only own carts', async () => {
    mockManagerAuth();

    const mockEq = vi.fn().mockResolvedValue({
      data: [{ id: 'cart-1', code: 'ABCD1234', manager_id: userId, status: 'pending' }],
    });

    mockAdminFrom.mockReturnValue({
      select: () => ({
        order: () => ({
          eq: mockEq,
        }),
      }),
    });

    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(mockEq).toHaveBeenCalledWith('manager_id', userId);
  });

  it('returns empty array when no carts exist', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        order: () => Promise.resolve({ data: null }),
      }),
    });

    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toEqual([]);
  });
});

// --- POST /api/admin/shared-cart ---
describe('POST /api/admin/shared-cart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(createPostRequest({ items: [{ variantId: 'v1', quantity: 1 }] }) as never);
    expect(res.status).toBe(401);
  });

  it('returns 403 for customer role', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'customer' }, error: null }),
        }),
      }),
    });
    const res = await POST(createPostRequest({ items: [{ variantId: 'v1', quantity: 1 }] }) as never);
    expect(res.status).toBe(403);
  });

  it('returns 400 when items is empty array', async () => {
    const res = await POST(createPostRequest({ items: [] }) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Items required');
  });

  it('returns 400 when items is missing', async () => {
    const res = await POST(createPostRequest({ notes: 'test' }) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Items required');
  });

  it('creates cart successfully with items', async () => {
    const cartId = 'cart-new-1';
    const cartCode = 'XYZW9999';

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: cartId, code: cartCode },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'shared_cart_items') {
        return {
          insert: () => Promise.resolve({ error: null }),
        };
      }
      return {};
    });

    const res = await POST(
      createPostRequest({
        items: [
          { variantId: 'v1', quantity: 2, note: 'urgent' },
          { variantId: 'v2', quantity: 1 },
        ],
        clientId: 'client-1',
        notes: 'Test cart',
      }) as never
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.id).toBe(cartId);
    expect(data.code).toBe(cartCode);
    expect(mockAdminFrom).toHaveBeenCalledWith('shared_carts');
    expect(mockAdminFrom).toHaveBeenCalledWith('shared_cart_items');
  });

  it('returns 500 on cart insert error', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: null,
                  error: { message: 'DB constraint violation' },
                }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(
      createPostRequest({
        items: [{ variantId: 'v1', quantity: 1 }],
      }) as never
    );
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBe('DB constraint violation');
  });

  it('returns 500 on items insert error and cleans up cart', async () => {
    const cartId = 'cart-cleanup';
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: cartId, code: 'CLEAN123' },
                  error: null,
                }),
            }),
          }),
          delete: () => ({
            eq: mockDeleteEq,
          }),
        };
      }
      if (table === 'shared_cart_items') {
        return {
          insert: () =>
            Promise.resolve({
              error: { message: 'Items FK error' },
            }),
        };
      }
      return {};
    });

    const res = await POST(
      createPostRequest({
        items: [{ variantId: 'v1', quantity: 1 }],
      }) as never
    );
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBe('Items FK error');
    // Verify cleanup: cart was deleted
    expect(mockDeleteEq).toHaveBeenCalledWith('id', cartId);
  });

  it('calls logActivity on successful creation', async () => {
    const { logActivity } = await import('@/lib/activity-log');
    const cartId = 'cart-log';

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'shared_carts') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: cartId, code: 'LOG12345' },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'shared_cart_items') {
        return {
          insert: () => Promise.resolve({ error: null }),
        };
      }
      return {};
    });

    const res = await POST(
      createPostRequest({
        items: [{ variantId: 'v1', quantity: 1 }],
      }) as never
    );
    expect(res.status).toBe(200);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: userId,
        action: 'shared_cart.created',
        entityType: 'shared_cart',
        entityId: cartId,
      })
    );
  });
});
