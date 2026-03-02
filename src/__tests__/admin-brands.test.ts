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

const { POST } = await import('@/app/api/admin/brands/route');
const { PATCH, DELETE } = await import('@/app/api/admin/brands/[id]/route');

function createRequest(body: Record<string, unknown>, method = 'POST') {
  return new Request('http://localhost/api/admin/brands', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const defaultParams = Promise.resolve({ id: 'brand-1' });

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

describe('POST /api/admin/brands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdmin();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(createRequest({ name: 'Rolf' }) as never);
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
    const res = await POST(createRequest({ name: 'Rolf' }) as never);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid data', async () => {
    const res = await POST(createRequest({}) as never);
    expect(res.status).toBe(400);
  });

  it('creates brand successfully', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'brands') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({
                data: { id: 'brand-new', name: 'Rolf', slug: 'rolf' },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(createRequest({ name: 'Rolf', is_active: true, sort_order: 1 }) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.brand.name).toBe('Rolf');
  });

  it('auto-generates unique slug when duplicate exists', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'brands') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { id: 'existing' }, error: null }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({
                data: { id: 'brand-new', name: 'Rolf', slug: 'rolf-abc123' },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(createRequest({ name: 'Rolf', is_active: true, sort_order: 1 }) as never);
    expect(res.status).toBe(200);
  });

  it('returns 500 when DB insert fails', async () => {
    mockAdminFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    }));

    const res = await POST(createRequest({ name: 'Rolf', is_active: true, sort_order: 1 }) as never);
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/admin/brands/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdmin();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await PATCH(createRequest({ name: 'Updated' }, 'PATCH') as never, { params: defaultParams });
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
    const res = await PATCH(createRequest({ name: 'Updated' }, 'PATCH') as never, { params: defaultParams });
    expect(res.status).toBe(403);
  });

  it('updates brand successfully', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    });

    const res = await PATCH(createRequest({ name: 'Rolf Updated' }, 'PATCH') as never, { params: defaultParams });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('returns 500 when update fails', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: { message: 'DB error' } }),
      }),
    });

    const res = await PATCH(createRequest({ name: 'X' }, 'PATCH') as never, { params: defaultParams });
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/admin/brands/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdmin();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await DELETE(createRequest({}, 'DELETE') as never, { params: defaultParams });
    expect(res.status).toBe(401);
  });

  it('returns 409 when brand has products', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              limit: () => Promise.resolve({ data: [{ id: 'p1' }], error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await DELETE(createRequest({}, 'DELETE') as never, { params: defaultParams });
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain('привязанные товары');
  });

  it('deletes brand successfully when no products', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        };
      }
      if (table === 'brands') {
        return {
          delete: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      return {};
    });

    const res = await DELETE(createRequest({}, 'DELETE') as never, { params: defaultParams });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('returns 500 when delete fails', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        };
      }
      if (table === 'brands') {
        return {
          delete: () => ({
            eq: () => Promise.resolve({ error: { message: 'FK error' } }),
          }),
        };
      }
      return {};
    });

    const res = await DELETE(createRequest({}, 'DELETE') as never, { params: defaultParams });
    expect(res.status).toBe(500);
  });

  it('returns 500 on unexpected error', async () => {
    mockGetUser.mockRejectedValue(new Error('crash'));
    const res = await DELETE(createRequest({}, 'DELETE') as never, { params: defaultParams });
    expect(res.status).toBe(500);
  });
});
