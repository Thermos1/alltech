import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockServerFrom = vi.fn();
const mockGetUser = vi.fn();
const mockAdminFrom = vi.fn();
const mockAdminCreateUser = vi.fn();
const mockAdminDeleteUser = vi.fn();

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
    auth: {
      admin: {
        createUser: mockAdminCreateUser,
        deleteUser: mockAdminDeleteUser,
      },
    },
  }),
}));

vi.mock('@/lib/activity-log', () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

const { POST } = await import('@/app/api/admin/create-manager/route');

function createRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/admin/create-manager', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  fullName: 'Иванов Иван',
  email: 'manager@test.ru',
  password: 'secure123',
  commissionRate: 5,
};

function mockAdmin() {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-user' } }, error: null });
  mockServerFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { role: 'admin' }, error: null }),
      }),
    }),
  });
}

describe('POST /api/admin/create-manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdmin();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(createRequest(validBody) as never);
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
    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(403);
  });

  it('returns 400 when email is missing', async () => {
    const res = await POST(createRequest({ fullName: 'Test', password: '123456' }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is missing', async () => {
    const res = await POST(createRequest({ fullName: 'Test', email: 'a@b.ru' }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 when fullName is missing', async () => {
    const res = await POST(createRequest({ email: 'a@b.ru', password: '123456' }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const res = await POST(createRequest({ ...validBody, password: '123' }) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('6 символов');
  });

  it('creates manager successfully', async () => {
    mockAdminCreateUser.mockResolvedValue({
      data: { user: { id: 'new-manager-id' } },
      error: null,
    });
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    });

    const res = await POST(createRequest(validBody) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.userId).toBe('new-manager-id');
  });

  it('returns 400 when email already registered', async () => {
    mockAdminCreateUser.mockResolvedValue({
      data: null,
      error: { message: 'User already been registered' },
    });

    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('email уже занят');
  });

  it('returns 400 for other auth creation errors', async () => {
    mockAdminCreateUser.mockResolvedValue({
      data: null,
      error: { message: 'Something else went wrong' },
    });

    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(400);
  });

  it('rolls back auth user when profile update fails', async () => {
    mockAdminCreateUser.mockResolvedValue({
      data: { user: { id: 'new-manager-id' } },
      error: null,
    });
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: { message: 'Profile error' } }),
      }),
    });
    mockAdminDeleteUser.mockResolvedValue({ error: null });

    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(500);
    expect(mockAdminDeleteUser).toHaveBeenCalledWith('new-manager-id');
  });

  it('clamps commission rate to 0-100', async () => {
    mockAdminCreateUser.mockResolvedValue({
      data: { user: { id: 'mgr-1' } },
      error: null,
    });
    let updatedRate: number | undefined;
    mockAdminFrom.mockImplementation(() => ({
      update: (data: Record<string, unknown>) => {
        updatedRate = data.manager_commission_rate as number;
        return { eq: () => Promise.resolve({ error: null }) };
      },
    }));

    await POST(createRequest({ ...validBody, commissionRate: 150 }) as never);
    expect(updatedRate).toBe(100);
  });

  it('defaults commission rate to 3 when not provided', async () => {
    mockAdminCreateUser.mockResolvedValue({
      data: { user: { id: 'mgr-1' } },
      error: null,
    });
    let updatedRate: number | undefined;
    mockAdminFrom.mockImplementation(() => ({
      update: (data: Record<string, unknown>) => {
        updatedRate = data.manager_commission_rate as number;
        return { eq: () => Promise.resolve({ error: null }) };
      },
    }));

    const { commissionRate: _, ...bodyWithoutRate } = validBody;
    await POST(createRequest(bodyWithoutRate) as never);
    expect(updatedRate).toBe(3);
  });

  it('returns 500 on unexpected error', async () => {
    mockGetUser.mockRejectedValue(new Error('crash'));
    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(500);
  });
});
