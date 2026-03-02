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

const { POST } = await import('@/app/api/admin/promo/route');
const { PATCH, DELETE } = await import('@/app/api/admin/promo/[id]/route');

function createRequest(body: Record<string, unknown>, method = 'POST') {
  return new Request('http://localhost/api/admin/promo', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const defaultParams = Promise.resolve({ id: 'promo-1' });

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

describe('POST /api/admin/promo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdmin();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(createRequest({ code: 'TEST' }) as never);
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
    const res = await POST(createRequest({ code: 'TEST', discount_type: 'percent', discount_value: 10 }) as never);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid data (missing code)', async () => {
    const res = await POST(createRequest({ discount_type: 'percent', discount_value: 10 }) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Ошибка валидации');
  });

  it('returns 400 for invalid discount_type', async () => {
    const res = await POST(createRequest({ code: 'TEST', discount_type: 'bogus', discount_value: 10 }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 for negative discount_value', async () => {
    const res = await POST(createRequest({ code: 'TEST', discount_type: 'percent', discount_value: -5 }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 409 for duplicate code', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: { id: 'existing' }, error: null }),
        }),
      }),
    });

    const res = await POST(createRequest({ code: 'SALE10', discount_type: 'percent', discount_value: 10 }) as never);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain('уже существует');
  });

  it('creates promo code successfully', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'promo_codes') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({
                data: { id: 'promo-new', code: 'NEWCODE' },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(createRequest({
      code: 'newcode',
      discount_type: 'fixed',
      discount_value: 500,
      min_order_amount: 1000,
      max_uses: 50,
    }) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.promo.code).toBe('NEWCODE');
  });

  it('transforms code to uppercase', async () => {
    let insertedData: Record<string, unknown> = {};
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'promo_codes') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          insert: (data: Record<string, unknown>) => {
            insertedData = data;
            return {
              select: () => ({
                single: () => Promise.resolve({
                  data: { id: 'promo-new', code: data.code },
                  error: null,
                }),
              }),
            };
          },
        };
      }
      return {};
    });

    await POST(createRequest({ code: 'lowercase', discount_type: 'percent', discount_value: 5 }) as never);
    expect(insertedData.code).toBe('LOWERCASE');
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

    const res = await POST(createRequest({ code: 'TEST', discount_type: 'percent', discount_value: 10 }) as never);
    expect(res.status).toBe(500);
  });

  it('returns 500 on unexpected error', async () => {
    mockGetUser.mockRejectedValue(new Error('crash'));
    const res = await POST(createRequest({ code: 'X' }) as never);
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/admin/promo/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdmin();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await PATCH(createRequest({ is_active: false }, 'PATCH') as never, { params: defaultParams });
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
    const res = await PATCH(createRequest({ is_active: true }, 'PATCH') as never, { params: defaultParams });
    expect(res.status).toBe(403);
  });

  it('returns 400 when no is_active field', async () => {
    const res = await PATCH(createRequest({ something: 'else' }, 'PATCH') as never, { params: defaultParams });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Нет данных для обновления');
  });

  it('toggles is_active to false', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    });

    const res = await PATCH(createRequest({ is_active: false }, 'PATCH') as never, { params: defaultParams });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('toggles is_active to true', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    });

    const res = await PATCH(createRequest({ is_active: true }, 'PATCH') as never, { params: defaultParams });
    expect(res.status).toBe(200);
  });

  it('returns 500 when update fails', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: { message: 'DB error' } }),
      }),
    });

    const res = await PATCH(createRequest({ is_active: false }, 'PATCH') as never, { params: defaultParams });
    expect(res.status).toBe(500);
  });

  it('returns 500 on unexpected error', async () => {
    mockGetUser.mockRejectedValue(new Error('crash'));
    const res = await PATCH(createRequest({ is_active: true }, 'PATCH') as never, { params: defaultParams });
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/admin/promo/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdmin();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await DELETE(createRequest({}, 'DELETE') as never, { params: defaultParams });
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
    const res = await DELETE(createRequest({}, 'DELETE') as never, { params: defaultParams });
    expect(res.status).toBe(403);
  });

  it('returns 409 when promo was used in orders', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => Promise.resolve({ count: 3 }),
      }),
    });

    const res = await DELETE(createRequest({}, 'DELETE') as never, { params: defaultParams });
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain('Нельзя удалить');
  });

  it('deletes promo successfully when unused', async () => {
    let deleteCalled = false;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ count: 0 }),
          }),
        };
      }
      if (table === 'promo_codes') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { code: 'TEST' }, error: null }),
            }),
          }),
          delete: () => {
            deleteCalled = true;
            return {
              eq: () => Promise.resolve({ error: null }),
            };
          },
        };
      }
      return {};
    });

    const res = await DELETE(createRequest({}, 'DELETE') as never, { params: defaultParams });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(deleteCalled).toBe(true);
  });

  it('returns 500 when delete fails', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ count: 0 }),
          }),
        };
      }
      if (table === 'promo_codes') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { code: 'X' }, error: null }),
            }),
          }),
          delete: () => ({
            eq: () => Promise.resolve({ error: { message: 'FK constraint' } }),
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
