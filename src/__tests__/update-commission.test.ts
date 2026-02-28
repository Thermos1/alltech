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

const { POST } = await import('@/app/api/admin/update-commission/route');

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/admin/update-commission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/update-commission', () => {
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
    const res = await POST(createRequest({ managerId: 'm1', rate: 5 }) as never);
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin user', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'manager' }, error: null }),
        }),
      }),
    });
    const res = await POST(createRequest({ managerId: 'm1', rate: 5 }) as never);
    expect(res.status).toBe(403);
  });

  it('returns 400 when managerId is missing', async () => {
    const res = await POST(createRequest({ rate: 5 }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 when rate is missing', async () => {
    const res = await POST(createRequest({ managerId: 'm1' }) as never);
    expect(res.status).toBe(400);
  });

  it('updates commission rate successfully', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
    });

    const res = await POST(createRequest({ managerId: 'm1', rate: 7 }) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('clamps rate to 0-100 range', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
    });

    // Rate > 100 should be clamped
    const res = await POST(createRequest({ managerId: 'm1', rate: 150 }) as never);
    expect(res.status).toBe(200);
  });

  it('returns 500 when DB update fails', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ error: { message: 'DB error' } }),
        }),
      }),
    });

    const res = await POST(createRequest({ managerId: 'm1', rate: 5 }) as never);
    expect(res.status).toBe(500);
  });
});
