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

const { POST } = await import('@/app/api/admin/products/route');
const { PATCH, DELETE } = await import('@/app/api/admin/products/[id]/route');

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

const validProduct = {
  name: 'ROLF GT SAE 5W-40',
  section: 'lubricants',
  brand_id: validUUID,
  category_id: validUUID,
};

function createRequest(body: Record<string, unknown>, method = 'POST') {
  return new Request('http://localhost/api/admin/products', {
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

// --- POST /api/admin/products ---
describe('POST /api/admin/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(createRequest(validProduct) as never);
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
    const res = await POST(createRequest(validProduct) as never);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid data', async () => {
    const res = await POST(createRequest({ name: 'A' }) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Validation failed');
  });

  it('creates product successfully', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: 'prod-1', slug: 'rolf-gt-sae-5w-40' },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(createRequest(validProduct) as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.product.id).toBe('prod-1');
    expect(data.product.slug).toBe('rolf-gt-sae-5w-40');
  });

  it('appends suffix for duplicate slug', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({ data: { id: 'existing' }, error: null }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: 'prod-2', slug: 'rolf-gt-sae-5w-40-abc' },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(createRequest(validProduct) as never);
    expect(res.status).toBe(200);
  });

  it('returns 500 when DB insert fails', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: null,
                  error: { message: 'DB error' },
                }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(createRequest(validProduct) as never);
    expect(res.status).toBe(500);
  });

  it('accepts custom slug', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          insert: (data: Record<string, unknown>) => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: 'prod-3', slug: data.slug || 'my-custom-slug' },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(
      createRequest({ ...validProduct, slug: 'my-custom-slug' }) as never
    );
    expect(res.status).toBe(200);
  });
});

// --- PATCH /api/admin/products/[id] ---
describe('PATCH /api/admin/products/[id]', () => {
  const params = Promise.resolve({ id: 'prod-1' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await PATCH(
      createRequest({ name: 'Updated' }, 'PATCH') as never,
      { params } as never
    );
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
    const res = await PATCH(
      createRequest({ name: 'Updated' }, 'PATCH') as never,
      { params } as never
    );
    expect(res.status).toBe(403);
  });

  it('updates product successfully', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    });

    const res = await PATCH(
      createRequest({ name: 'Updated Name', is_active: false }, 'PATCH') as never,
      { params } as never
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('returns 500 when DB update fails', async () => {
    mockAdminFrom.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: { message: 'DB error' } }),
      }),
    });

    const res = await PATCH(
      createRequest({ name: 'Updated' }, 'PATCH') as never,
      { params } as never
    );
    expect(res.status).toBe(500);
  });

  it('validates update data', async () => {
    const res = await PATCH(
      createRequest({ section: 'invalid-section' }, 'PATCH') as never,
      { params } as never
    );
    expect(res.status).toBe(400);
  });
});

// --- DELETE /api/admin/products/[id] ---
describe('DELETE /api/admin/products/[id]', () => {
  const params = Promise.resolve({ id: 'prod-1' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const req = new Request('http://localhost/api/admin/products/prod-1', { method: 'DELETE' });
    const res = await DELETE(req as never, { params } as never);
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
    const req = new Request('http://localhost/api/admin/products/prod-1', { method: 'DELETE' });
    const res = await DELETE(req as never, { params } as never);
    expect(res.status).toBe(403);
  });

  it('hard-deletes product when no orders reference it', async () => {
    const mockVariantDelete = vi.fn().mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });
    const mockProductDelete = vi.fn().mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });
    const mockSharedCartItemsDelete = vi.fn().mockReturnValue({
      in: () => Promise.resolve({ error: null }),
    });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'product_variants') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [{ id: 'v1' }, { id: 'v2' }], error: null }),
          }),
          delete: mockVariantDelete,
        };
      }
      if (table === 'order_items') {
        return {
          select: () => ({
            in: () => Promise.resolve({ count: 0, error: null }),
          }),
        };
      }
      if (table === 'shared_cart_items') {
        return { delete: mockSharedCartItemsDelete };
      }
      if (table === 'products') {
        return { delete: mockProductDelete };
      }
      return {};
    });

    const req = new Request('http://localhost/api/admin/products/prod-1', { method: 'DELETE' });
    const res = await DELETE(req as never, { params } as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.soft).toBeUndefined();
    expect(mockVariantDelete).toHaveBeenCalled();
    expect(mockProductDelete).toHaveBeenCalled();
  });

  it('soft-deletes product when orders reference it', async () => {
    const mockProductUpdate = vi.fn().mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });
    const mockVariantUpdate = vi.fn().mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'product_variants') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [{ id: 'v1' }], error: null }),
          }),
          update: mockVariantUpdate,
        };
      }
      if (table === 'order_items') {
        return {
          select: () => ({
            in: () => Promise.resolve({ count: 3, error: null }),
          }),
        };
      }
      if (table === 'products') {
        return { update: mockProductUpdate };
      }
      return {};
    });

    const req = new Request('http://localhost/api/admin/products/prod-1', { method: 'DELETE' });
    const res = await DELETE(req as never, { params } as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.soft).toBe(true);
    expect(mockProductUpdate).toHaveBeenCalled();
    expect(mockVariantUpdate).toHaveBeenCalled();
  });

  it('returns 500 when product delete fails', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'product_variants') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [{ id: 'v1' }], error: null }),
          }),
          delete: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === 'order_items') {
        return {
          select: () => ({
            in: () => Promise.resolve({ count: 0, error: null }),
          }),
        };
      }
      if (table === 'shared_cart_items') {
        return {
          delete: () => ({
            in: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === 'products') {
        return {
          delete: () => ({
            eq: () => Promise.resolve({ error: { message: 'FK constraint' } }),
          }),
        };
      }
      return {};
    });

    const req = new Request('http://localhost/api/admin/products/prod-1', { method: 'DELETE' });
    const res = await DELETE(req as never, { params } as never);
    expect(res.status).toBe(500);
  });
});
