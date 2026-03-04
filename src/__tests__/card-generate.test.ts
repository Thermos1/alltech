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
const mockGenerateSlideSequence = vi.fn();

vi.mock('@/lib/card-generator', () => ({
  generateCard: (...args: unknown[]) => mockGenerateCard(...args),
  generateCarousel: (...args: unknown[]) => mockGenerateCarousel(...args),
  generateCarouselPdf: (...args: unknown[]) => mockGenerateCarouselPdf(...args),
  generateSlideSequence: (...args: unknown[]) => mockGenerateSlideSequence(...args),
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
    specs: [
      { label: 'Вязкость', value: '5W-40' },
      { label: 'API', value: 'SN/CF' },
    ],
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
        compatibility: ['Toyota'],
        certifications: ['ISO 9001'],
        usageTips: ['Read the manual'],
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
    expect(config.productData.specs).toEqual([
      { label: 'Вязкость', value: '5W-40' },
      { label: 'API', value: 'SN/CF' },
    ]);
  });

  it('accepts shopify platform', async () => {
    mockAuth('admin');
    mockGenerateCard.mockResolvedValue(Buffer.from('shopify-card'));
    const body = { ...validCardBody, platform: 'shopify' };
    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(200);
    const config = mockGenerateCard.mock.calls[0][0];
    expect(config.platform).toBe('shopify');
  });

  it('accepts imageScale parameter', async () => {
    mockAuth('admin');
    mockGenerateCard.mockResolvedValue(Buffer.from('ok'));
    const body = { ...validCardBody, imageScale: 0.7 };
    await POST(createRequest(body) as never);
    const config = mockGenerateCard.mock.calls[0][0];
    expect(config.imageScale).toBe(0.7);
  });

  it('accepts customColors parameter', async () => {
    mockAuth('admin');
    mockGenerateCard.mockResolvedValue(Buffer.from('ok'));
    const body = { ...validCardBody, customColors: { background: '#FF0000', text: '#FFFFFF' } };
    await POST(createRequest(body) as never);
    const config = mockGenerateCard.mock.calls[0][0];
    expect(config.customColors).toEqual({ background: '#FF0000', text: '#FFFFFF' });
  });

  it('accepts productData with priceUnit and subtitle', async () => {
    mockAuth('admin');
    mockGenerateCard.mockResolvedValue(Buffer.from('ok'));
    const body = {
      ...validCardBody,
      productData: {
        name: 'Test Product',
        price: 1500,
        priceUnit: '$',
        subtitle: '250ml',
        specs: [],
      },
    };
    await POST(createRequest(body) as never);
    const config = mockGenerateCard.mock.calls[0][0];
    expect(config.productData.priceUnit).toBe('$');
    expect(config.productData.subtitle).toBe('250ml');
  });

  it('defaults specs to empty array when not provided', async () => {
    mockAuth('admin');
    mockGenerateCard.mockResolvedValue(Buffer.from('ok'));
    const body = {
      ...validCardBody,
      productData: { name: 'No specs product' },
    };
    await POST(createRequest(body) as never);
    const config = mockGenerateCard.mock.calls[0][0];
    expect(config.productData.specs).toEqual([]);
  });

  it('accepts imageScale up to 1.1', async () => {
    mockAuth('admin');
    mockGenerateCard.mockResolvedValue(Buffer.from('ok'));
    const body = { ...validCardBody, imageScale: 1.1 };
    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(200);
  });

  it('rejects imageScale above 1.1', async () => {
    mockAuth('admin');
    const body = { ...validCardBody, imageScale: 1.5 };
    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(400);
  });

  it('accepts imageOffsetX and imageOffsetY', async () => {
    mockAuth('admin');
    mockGenerateCard.mockResolvedValue(Buffer.from('ok'));
    const body = { ...validCardBody, imageOffsetX: 25, imageOffsetY: -30 };
    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(200);
    const config = mockGenerateCard.mock.calls[0][0];
    expect(config.imageOffsetX).toBe(25);
    expect(config.imageOffsetY).toBe(-30);
  });

  it('rejects offset values outside -50..50', async () => {
    mockAuth('admin');
    const body = { ...validCardBody, imageOffsetX: 100 };
    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(400);
  });

  it('handles ai-sequence mode with PNG output', async () => {
    mockAuth('admin');
    const buffers = [Buffer.from('slide1'), Buffer.from('slide2')];
    mockGenerateSlideSequence.mockResolvedValue(buffers);

    const body = {
      mode: 'ai-sequence',
      style: 'premium-dark',
      platform: 'instagram',
      enabledElements: [],
      badges: [],
      productData: { name: 'AI Test', specs: [] },
      slides: [
        { type: 'title', heading: 'Test Title', body: 'Test Body' },
        { type: 'text-only', heading: 'Slide 2', body: 'Content' },
      ],
      images: ['data:image/png;base64,abc'],
      outputFormat: 'png',
    };

    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.images).toHaveLength(2);
    expect(data.images[0].slideNumber).toBe(1);
  });

  it('handles ai-sequence mode with PDF output', async () => {
    mockAuth('admin');
    const buffers = [Buffer.from('slide1')];
    mockGenerateSlideSequence.mockResolvedValue(buffers);
    mockGenerateCarouselPdf.mockResolvedValue(Buffer.from('fake-pdf'));

    const body = {
      mode: 'ai-sequence',
      style: 'minimalist',
      platform: 'instagram',
      enabledElements: [],
      badges: [],
      productData: { name: 'AI Test', specs: [] },
      slides: [{ type: 'title', heading: 'PDF Test' }],
      outputFormat: 'pdf',
    };

    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('returns 400 for ai-sequence with no slides', async () => {
    mockAuth('admin');
    const body = {
      mode: 'ai-sequence',
      style: 'minimalist',
      platform: 'instagram',
      enabledElements: [],
      badges: [],
      productData: { name: 'AI Test', specs: [] },
      slides: [],
      outputFormat: 'png',
    };

    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 for card mode without productImageBase64', async () => {
    mockAuth('admin');
    const body = { ...validCardBody, productImageBase64: undefined };
    const res = await POST(createRequest(body) as never);
    expect(res.status).toBe(400);
  });
});
