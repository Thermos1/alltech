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

const mockGenerateCard = vi.fn();
const mockGenerateCarousel = vi.fn();
const mockGenerateCarouselPdf = vi.fn();

vi.mock('@/lib/card-generator', () => ({
  generateCard: (...args: unknown[]) => mockGenerateCard(...args),
  generateCarousel: (...args: unknown[]) => mockGenerateCarousel(...args),
  generateCarouselPdf: (...args: unknown[]) => mockGenerateCarouselPdf(...args),
}));

const { POST } = await import('@/app/api/admin/cards/generate/route');

function mockAuth(role: string) {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'test-user' } },
    error: null,
  });
  mockServerFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { role }, error: null }),
      }),
    }),
  });
}

function createRequest(body: Record<string, unknown>) {
  return {
    json: () => Promise.resolve(body),
  };
}

const validCardBody = {
  mode: 'card',
  style: 'minimalist',
  platform: 'wb-ozon',
  enabledElements: ['productName', 'price'],
  badges: [],
  productData: {
    name: 'ROLF GT 5W-40',
    brand: 'ROLF',
    price: 2450,
  },
  productImageBase64: 'data:image/png;base64,iVBOR',
  outputFormat: 'png',
};

describe('POST /api/admin/cards/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(createRequest(validCardBody) as never);
    expect(res.status).toBe(401);
  });

  it('returns 403 for customer role', async () => {
    mockAuth('customer');
    const res = await POST(createRequest(validCardBody) as never);
    expect(res.status).toBe(403);
  });

  it('allows admin role', async () => {
    mockAuth('admin');
    mockGenerateCard.mockResolvedValue(Buffer.from('fake-png'));
    const res = await POST(createRequest(validCardBody) as never);
    expect(res.status).toBe(200);
  });

  it('allows manager role', async () => {
    mockAuth('manager');
    mockGenerateCard.mockResolvedValue(Buffer.from('fake-png'));
    const res = await POST(createRequest(validCardBody) as never);
    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid body (missing style)', async () => {
    mockAuth('admin');
    const body = { ...validCardBody, style: undefined };
    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid body (missing productData.name)', async () => {
    mockAuth('admin');
    const body = { ...validCardBody, productData: { price: 100 } };
    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(400);
  });

  it('returns PNG for card mode', async () => {
    mockAuth('admin');
    mockGenerateCard.mockResolvedValue(Buffer.from('fake-png-data'));
    const res = await POST(createRequest(validCardBody) as never);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
  });

  it('returns JPG for card mode with jpg format', async () => {
    mockAuth('admin');
    mockGenerateCard.mockResolvedValue(Buffer.from('fake-jpg-data'));
    const res = await POST(createRequest({ ...validCardBody, outputFormat: 'jpg' }) as never);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/jpeg');
  });

  it('returns JSON with images for carousel PNG mode', async () => {
    mockAuth('admin');
    const buffers = Array(7).fill(null).map(() => Buffer.from('slide'));
    mockGenerateCarousel.mockResolvedValue(buffers);

    const body = {
      ...validCardBody,
      mode: 'carousel',
      carouselData: {
        benefits: ['Test benefit'],
        compatibility: ['HOWO'],
        certifications: ['ISO 9001'],
      },
    };
    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.images).toHaveLength(7);
    expect(data.images[0].slideNumber).toBe(1);
  });

  it('returns PDF for carousel PDF mode', async () => {
    mockAuth('admin');
    const buffers = Array(7).fill(null).map(() => Buffer.from('slide'));
    mockGenerateCarousel.mockResolvedValue(buffers);
    mockGenerateCarouselPdf.mockResolvedValue(Buffer.from('fake-pdf'));

    const body = {
      ...validCardBody,
      mode: 'carousel',
      outputFormat: 'pdf',
    };
    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('returns 500 when generator throws', async () => {
    mockAuth('admin');
    mockGenerateCard.mockRejectedValue(new Error('Satori crashed'));
    const res = await POST(createRequest(validCardBody) as never);
    expect(res.status).toBe(500);
  });

  it('passes config to generateCard correctly', async () => {
    mockAuth('admin');
    mockGenerateCard.mockResolvedValue(Buffer.from('ok'));
    await POST(createRequest(validCardBody) as never);
    expect(mockGenerateCard).toHaveBeenCalledTimes(1);
    const config = mockGenerateCard.mock.calls[0][0];
    expect(config.style).toBe('minimalist');
    expect(config.platform).toBe('wb-ozon');
    expect(config.productData.name).toBe('ROLF GT 5W-40');
  });
});
