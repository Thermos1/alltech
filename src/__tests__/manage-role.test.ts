import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase clients
const mockServerFrom = vi.fn();
const mockAdminFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: {
        getUser: () =>
          Promise.resolve({ data: { user: { id: 'admin-user' } }, error: null }),
      },
      from: mockServerFrom,
    }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}));

const { POST } = await import('@/app/api/admin/manage-role/route');

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/admin/manage-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/manage-role', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: user is admin
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'admin' }, error: null }),
        }),
      }),
    });
  });

  it('returns 400 for missing userId', async () => {
    const res = await POST(createRequest({ newRole: 'manager' }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid role', async () => {
    const res = await POST(createRequest({ userId: 'u1', newRole: 'superadmin' }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 when trying to change own role', async () => {
    const res = await POST(createRequest({ userId: 'admin-user', newRole: 'customer' }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 403 for non-admin user', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'customer' }, error: null }),
        }),
      }),
    });

    const res = await POST(createRequest({ userId: 'u1', newRole: 'manager' }) as never);
    expect(res.status).toBe(403);
  });

  it('promotes customer to manager successfully', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    });

    const res = await POST(createRequest({ userId: 'u1', newRole: 'manager', commissionRate: 5 }) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('demotes manager and unassigns clients', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    });

    const res = await POST(createRequest({ userId: 'u1', newRole: 'customer' }) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    // Should call from('profiles').update twice: unassign clients + change role
    expect(mockAdminFrom).toHaveBeenCalledWith('profiles');
  });
});
