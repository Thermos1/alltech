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

const { PATCH } = await import('@/app/api/admin/stock/[id]/route');

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/admin/stock/variant-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const defaultParams = Promise.resolve({ id: 'variant-1' });

describe('PATCH /api/admin/stock/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user' } },
      error: null,
    });
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'admin' }, error: null }),
        }),
      }),
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await PATCH(createRequest({ stock_qty: 10 }) as never, { params: defaultParams });
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin user', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'customer' }, error: null }),
        }),
      }),
    });
    const res = await PATCH(createRequest({ stock_qty: 10 }) as never, { params: defaultParams });
    expect(res.status).toBe(403);
  });

  it('returns 403 for manager role', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'manager' }, error: null }),
        }),
      }),
    });
    const res = await PATCH(createRequest({ stock_qty: 10 }) as never, { params: defaultParams });
    expect(res.status).toBe(403);
  });

  it('returns 400 for negative stock_qty', async () => {
    const res = await PATCH(createRequest({ stock_qty: -5 }) as never, { params: defaultParams });
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-integer stock_qty', async () => {
    const res = await PATCH(createRequest({ stock_qty: 5.5 }) as never, { params: defaultParams });
    expect(res.status).toBe(400);
  });

  it('returns 400 when stock_qty is missing', async () => {
    const res = await PATCH(createRequest({}) as never, { params: defaultParams });
    expect(res.status).toBe(400);
  });

  it('returns 404 when variant not found', async () => {
    let callIndex = 0;
    mockAdminFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => {
            callIndex++;
            // First call: fetch variant → not found
            return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
          },
        }),
      }),
    }));

    const res = await PATCH(createRequest({ stock_qty: 10 }) as never, { params: defaultParams });
    expect(res.status).toBe(404);
  });

  it('updates stock successfully', async () => {
    let callCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'product_variants') {
        callCount++;
        if (callCount === 1) {
          // Fetch current variant
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { id: 'variant-1', stock_qty: 5, volume: '5л', product_id: 'prod-1' },
                    error: null,
                  }),
              }),
            }),
          };
        }
        // Update call
        return {
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({ data: { name: 'Rolf Dynamic 10W-40' }, error: null }),
            }),
          }),
        };
      }
      // activity_log insert
      return {
        insert: () => Promise.resolve({ error: null }),
      };
    });

    const res = await PATCH(createRequest({ stock_qty: 20 }) as never, { params: defaultParams });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.stock_qty).toBe(20);
  });

  it('allows setting stock_qty to zero', async () => {
    let callCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'product_variants') {
        callCount++;
        if (callCount === 1) {
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { id: 'variant-1', stock_qty: 10, volume: '20л', product_id: 'prod-1' },
                    error: null,
                  }),
              }),
            }),
          };
        }
        return {
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { name: 'Test Oil' }, error: null }),
            }),
          }),
        };
      }
      return { insert: () => Promise.resolve({ error: null }) };
    });

    const res = await PATCH(createRequest({ stock_qty: 0 }) as never, { params: defaultParams });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.stock_qty).toBe(0);
  });

  it('returns 500 when update fails', async () => {
    let callCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'product_variants') {
        callCount++;
        if (callCount === 1) {
          return {
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: { id: 'variant-1', stock_qty: 5, volume: '5л', product_id: 'prod-1' },
                    error: null,
                  }),
              }),
            }),
          };
        }
        return {
          update: () => ({
            eq: () => Promise.resolve({ error: { message: 'DB error' } }),
          }),
        };
      }
      return { insert: () => Promise.resolve({ error: null }) };
    });

    const res = await PATCH(createRequest({ stock_qty: 20 }) as never, { params: defaultParams });
    expect(res.status).toBe(500);
  });

  it('returns 500 on unexpected error', async () => {
    mockGetUser.mockRejectedValue(new Error('DB down'));
    const res = await PATCH(createRequest({ stock_qty: 10 }) as never, { params: defaultParams });
    expect(res.status).toBe(500);
  });
});
