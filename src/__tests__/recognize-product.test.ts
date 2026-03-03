import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn();
const mockServerFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockServerFrom,
    }),
}));

const mockRecognize = vi.fn();
vi.mock('@/lib/image-processing', () => ({
  recognizeProduct: (...args: unknown[]) => mockRecognize(...args),
}));

const { POST } = await import('@/app/api/admin/products/recognize/route');

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

function createRequest(body: Record<string, unknown>) {
  return {
    json: () => Promise.resolve(body),
  };
}

describe('POST /api/admin/products/recognize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminAuth();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(createRequest({ image: 'data:image/jpeg;base64,abc' }) as never);
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
    const res = await POST(createRequest({ image: 'data:image/jpeg;base64,abc' }) as never);
    expect(res.status).toBe(403);
  });

  it('returns 400 when no image provided', async () => {
    const res = await POST(createRequest({}) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 when image is not a string', async () => {
    const res = await POST(createRequest({ image: 123 }) as never);
    expect(res.status).toBe(400);
  });

  it('returns recognized data on success', async () => {
    mockRecognize.mockResolvedValue({
      brand: 'ROLF',
      viscosity: '10W-40',
      base_type: 'semi_synthetic',
    });

    const res = await POST(
      createRequest({ image: 'data:image/jpeg;base64,/9j/abc' }) as never
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.recognized).toEqual({
      brand: 'ROLF',
      viscosity: '10W-40',
      base_type: 'semi_synthetic',
    });
  });

  it('passes correct base64 and mediaType to recognizeProduct', async () => {
    mockRecognize.mockResolvedValue(null);

    await POST(
      createRequest({ image: 'data:image/png;base64,iVBOR' }) as never
    );
    expect(mockRecognize).toHaveBeenCalledWith('iVBOR', 'image/png');
  });

  it('detects jpeg mediaType from data URI', async () => {
    mockRecognize.mockResolvedValue(null);

    await POST(
      createRequest({ image: 'data:image/jpeg;base64,/9j/abc' }) as never
    );
    expect(mockRecognize).toHaveBeenCalledWith('/9j/abc', 'image/jpeg');
  });

  it('uses explicit mediaType over auto-detected', async () => {
    mockRecognize.mockResolvedValue(null);

    await POST(
      createRequest({
        image: 'data:image/jpeg;base64,abc',
        mediaType: 'image/webp',
      }) as never
    );
    expect(mockRecognize).toHaveBeenCalledWith('abc', 'image/webp');
  });

  it('returns null recognized when API key missing', async () => {
    mockRecognize.mockResolvedValue(null);

    const res = await POST(
      createRequest({ image: 'data:image/jpeg;base64,abc' }) as never
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.recognized).toBeNull();
  });

  it('handles recognizeProduct throwing an error', async () => {
    mockRecognize.mockRejectedValue(new Error('API timeout'));

    const res = await POST(
      createRequest({ image: 'data:image/jpeg;base64,abc' }) as never
    );
    expect(res.status).toBe(500);
  });
});
