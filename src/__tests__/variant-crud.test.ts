import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn();
const mockServerFrom = vi.fn();
const mockAdminFrom = vi.fn();

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

const { POST } = await import('@/app/api/admin/products/[id]/variants/route');
const variantIdRoute = await import(
  '@/app/api/admin/products/[id]/variants/[variantId]/route'
);
const PATCH_VARIANT = variantIdRoute.PATCH;
const DELETE_VARIANT = variantIdRoute.DELETE;

function createRequest(body: Record<string, unknown>, method = 'POST') {
  return new Request('http://localhost/api/admin/products/prod-1/variants', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockAdminAuth() {
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
}

const validVariant = {
  volume: '4',
  unit: 'л',
  price: 2500,
};

// --- POST /api/admin/products/[id]/variants ---
describe('POST /api/admin/products/[id]/variants', () => {
  const params = Promise.resolve({ id: 'prod-1' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(createRequest(validVariant) as never, { params } as never);
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'customer' }, error: null }),
        }),
      }),
    });
    const res = await POST(createRequest(validVariant) as never, { params } as never);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid variant data', async () => {
    const res = await POST(
      createRequest({ volume: '', unit: 'мл', price: -1 }) as never,
      { params } as never
    );
    expect(res.status).toBe(400);
  });

  it('creates variant successfully', async () => {
    mockAdminFrom.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: { id: 'var-1' },
              error: null,
            }),
        }),
      }),
    });

    const res = await POST(createRequest(validVariant) as never, { params } as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.variant.id).toBe('var-1');
  });

  it('returns 500 when DB insert fails', async () => {
    mockAdminFrom.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: null,
              error: { message: 'FK violation' },
            }),
        }),
      }),
    });

    const res = await POST(createRequest(validVariant) as never, { params } as never);
    expect(res.status).toBe(500);
  });

  it('rejects zero price', async () => {
    const res = await POST(
      createRequest({ ...validVariant, price: 0 }) as never,
      { params } as never
    );
    expect(res.status).toBe(400);
  });

  it('accepts variant with all fields', async () => {
    mockAdminFrom.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: { id: 'var-2' },
              error: null,
            }),
        }),
      }),
    });

    const res = await POST(
      createRequest({
        ...validVariant,
        price_per_liter: 625,
        sku: 'SKU-001',
        stock_qty: 100,
        is_active: true,
      }) as never,
      { params } as never
    );
    expect(res.status).toBe(200);
  });
});

// --- PATCH /api/admin/products/[id]/variants/[variantId] ---
describe('PATCH /api/admin/products/[id]/variants/[variantId]', () => {
  const params = Promise.resolve({ id: 'prod-1', variantId: 'var-1' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await PATCH_VARIANT(
      createRequest({ price: 3000 }, 'PATCH') as never,
      { params } as never
    );
    expect(res.status).toBe(401);
  });

  it('updates variant price successfully', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
    });

    const res = await PATCH_VARIANT(
      createRequest({ price: 3000 }, 'PATCH') as never,
      { params } as never
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('updates variant stock and active status', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
    });

    const res = await PATCH_VARIANT(
      createRequest({ stock_qty: 50, is_active: false }, 'PATCH') as never,
      { params } as never
    );
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

    const res = await PATCH_VARIANT(
      createRequest({ price: 3000 }, 'PATCH') as never,
      { params } as never
    );
    expect(res.status).toBe(500);
  });

  it('validates update data', async () => {
    const res = await PATCH_VARIANT(
      createRequest({ unit: 'invalid' }, 'PATCH') as never,
      { params } as never
    );
    expect(res.status).toBe(400);
  });
});

// --- DELETE /api/admin/products/[id]/variants/[variantId] ---
describe('DELETE /api/admin/products/[id]/variants/[variantId]', () => {
  const params = Promise.resolve({ id: 'prod-1', variantId: 'var-1' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const req = new Request('http://localhost', { method: 'DELETE' });
    const res = await DELETE_VARIANT(req as never, { params } as never);
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'manager' }, error: null }),
        }),
      }),
    });
    const req = new Request('http://localhost', { method: 'DELETE' });
    const res = await DELETE_VARIANT(req as never, { params } as never);
    expect(res.status).toBe(403);
  });

  it('deletes variant successfully', async () => {
    mockAdminFrom.mockReturnValue({
      delete: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
    });

    const req = new Request('http://localhost', { method: 'DELETE' });
    const res = await DELETE_VARIANT(req as never, { params } as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('returns 500 when DB delete fails', async () => {
    mockAdminFrom.mockReturnValue({
      delete: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ error: { message: 'FK constraint' } }),
        }),
      }),
    });

    const req = new Request('http://localhost', { method: 'DELETE' });
    const res = await DELETE_VARIANT(req as never, { params } as never);
    expect(res.status).toBe(500);
  });
});
