import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn();
const mockServerFrom = vi.fn();
const mockAdminFrom = vi.fn();
const mockStorageFrom = vi.fn();

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
    storage: { from: mockStorageFrom },
  }),
}));

const { POST } = await import('@/app/api/admin/products/[id]/image/route');

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

// Create a mock file with working arrayBuffer
function createMockFile(content: Uint8Array, name: string) {
  const buffer = content.buffer;
  return {
    name,
    size: content.length,
    type: 'image/jpeg',
    arrayBuffer: () => Promise.resolve(buffer),
  };
}

// Create request with mocked formData to avoid Node.js File/FormData issues
function createMockRequest(file?: ReturnType<typeof createMockFile> | null) {
  const formData = {
    get: (key: string) => {
      if (key === 'image') return file ?? null;
      return null;
    },
  };
  return {
    formData: () => Promise.resolve(formData),
  };
}

describe('POST /api/admin/products/[id]/image', () => {
  const params = Promise.resolve({ id: 'prod-1' });

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const file = createMockFile(new Uint8Array([1, 2, 3]), 'test.jpg');
    const res = await POST(createMockRequest(file) as never, { params } as never);
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
    const file = createMockFile(new Uint8Array([1, 2, 3]), 'test.jpg');
    const res = await POST(createMockRequest(file) as never, { params } as never);
    expect(res.status).toBe(403);
  });

  it('returns 400 when no image provided', async () => {
    const res = await POST(createMockRequest(null) as never, { params } as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('No image provided');
  });

  it('returns 400 for oversized image', async () => {
    const bigContent = new Uint8Array(600_000);
    const file = createMockFile(bigContent, 'big.jpg');
    const res = await POST(createMockRequest(file) as never, { params } as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('too large');
  });

  it('returns 404 when product not found', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    });

    const file = createMockFile(new Uint8Array([1, 2, 3]), 'test.jpg');
    const res = await POST(createMockRequest(file) as never, { params } as never);
    expect(res.status).toBe(404);
  });

  it('uploads image successfully', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: {
                    slug: 'rolf-gt-5w40',
                    brand: { slug: 'rolf' },
                  },
                  error: null,
                }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      return {};
    });

    mockStorageFrom.mockReturnValue({
      upload: () => Promise.resolve({ error: null }),
      getPublicUrl: () => ({
        data: { publicUrl: 'https://storage.example.com/rolf/rolf-gt-5w40.jpg' },
      }),
    });

    const file = createMockFile(new Uint8Array([0xff, 0xd8, 0xff]), 'test.jpg');
    const res = await POST(createMockRequest(file) as never, { params } as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.image_url).toBe('https://storage.example.com/rolf/rolf-gt-5w40.jpg');
  });

  it('returns 500 when storage upload fails', async () => {
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: {
                slug: 'rolf-gt-5w40',
                brand: { slug: 'rolf' },
              },
              error: null,
            }),
        }),
      }),
    });

    mockStorageFrom.mockReturnValue({
      upload: () => Promise.resolve({ error: { message: 'Storage error' } }),
    });

    const file = createMockFile(new Uint8Array([1, 2, 3]), 'test.jpg');
    const res = await POST(createMockRequest(file) as never, { params } as never);
    expect(res.status).toBe(500);
  });

  it('handles brand as array (Supabase join format)', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: {
                    slug: 'kixx-g1',
                    brand: [{ slug: 'kixx' }],
                  },
                  error: null,
                }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      return {};
    });

    mockStorageFrom.mockReturnValue({
      upload: () => Promise.resolve({ error: null }),
      getPublicUrl: () => ({
        data: { publicUrl: 'https://storage.example.com/kixx/kixx-g1.jpg' },
      }),
    });

    const file = createMockFile(new Uint8Array([1, 2, 3]), 'test.jpg');
    const res = await POST(createMockRequest(file) as never, { params } as never);
    expect(res.status).toBe(200);
  });
});
