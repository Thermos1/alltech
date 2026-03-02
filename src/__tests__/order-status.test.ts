import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockServerFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockServerFrom,
    }),
}));

vi.mock('@/lib/activity-log', () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

const { PATCH } = await import('@/app/api/admin/orders/[id]/status/route');

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/admin/orders/order-1/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const defaultParams = Promise.resolve({ id: 'order-1' });

function mockAdminRole() {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-user' } }, error: null });
  mockServerFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { role: 'admin' }, error: null }),
      }),
    }),
  });
}

describe('PATCH /api/admin/orders/[id]/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminRole();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'No session' } });
    const res = await PATCH(createRequest({ status: 'shipped' }) as never, { params: defaultParams });
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
    const res = await PATCH(createRequest({ status: 'shipped' }) as never, { params: defaultParams });
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
    const res = await PATCH(createRequest({ status: 'shipped' }) as never, { params: defaultParams });
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid status', async () => {
    const res = await PATCH(createRequest({ status: 'invalid_status' }) as never, { params: defaultParams });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Недопустимый статус');
  });

  it('returns 400 when status is missing', async () => {
    const res = await PATCH(createRequest({}) as never, { params: defaultParams });
    expect(res.status).toBe(400);
  });

  it('updates order status to shipped successfully', async () => {
    let callCount = 0;
    mockServerFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { role: 'admin' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'orders') {
        return {
          update: () => ({
            eq: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: { id: 'order-1', order_number: 'ALT-2026-0001', status: 'shipped', updated_at: '2026-03-02' },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await PATCH(createRequest({ status: 'shipped' }) as never, { params: defaultParams });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.order.status).toBe('shipped');
    expect(data.order.order_number).toBe('ALT-2026-0001');
  });

  it('accepts all valid statuses', async () => {
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

    for (const status of validStatuses) {
      vi.clearAllMocks();
      mockAdminRole();

      mockServerFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: { role: 'admin' }, error: null }),
              }),
            }),
          };
        }
        if (table === 'orders') {
          return {
            update: () => ({
              eq: () => ({
                select: () => ({
                  single: () => Promise.resolve({
                    data: { id: 'order-1', order_number: 'ALT-001', status, updated_at: '2026-03-02' },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const res = await PATCH(createRequest({ status }) as never, { params: defaultParams });
      expect(res.status).toBe(200);
    }
  });

  it('returns 500 when DB update fails', async () => {
    mockServerFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { role: 'admin' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'orders') {
        return {
          update: () => ({
            eq: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: null,
                  error: { message: 'DB error' },
                }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await PATCH(createRequest({ status: 'shipped' }) as never, { params: defaultParams });
    expect(res.status).toBe(500);
  });

  it('returns 500 on unexpected error', async () => {
    mockGetUser.mockRejectedValue(new Error('DB down'));
    const res = await PATCH(createRequest({ status: 'shipped' }) as never, { params: defaultParams });
    expect(res.status).toBe(500);
  });
});
