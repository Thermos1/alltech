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

const mockGenerateContent = vi.fn();

vi.mock('@/lib/ai-carousel', () => ({
  generateCarouselContent: (...args: unknown[]) => mockGenerateContent(...args),
}));

const { POST } = await import('@/app/api/admin/cards/ai-carousel/route');

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

const validBody = {
  productName: 'ROLF GT 5W-40',
  brand: 'ROLF',
  specs: [
    { label: 'Вязкость', value: '5W-40' },
    { label: 'API', value: 'SN/CF' },
  ],
};

describe('POST /api/admin/cards/ai-carousel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(401);
  });

  it('returns 403 for customer role', async () => {
    mockAuth('customer');
    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(403);
  });

  it('allows admin role', async () => {
    mockAuth('admin');
    mockGenerateContent.mockResolvedValue({
      benefits: ['B1'],
      compatibility: ['C1'],
      usageTips: ['T1'],
      certifications: ['Cert1'],
    });
    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.benefits).toEqual(['B1']);
  });

  it('allows manager role', async () => {
    mockAuth('manager');
    mockGenerateContent.mockResolvedValue({
      benefits: ['B1'],
      compatibility: [],
      usageTips: [],
      certifications: [],
    });
    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(200);
  });

  it('returns 400 for missing productName', async () => {
    mockAuth('admin');
    const res = await POST(createRequest({ brand: 'ROLF' }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty productName', async () => {
    mockAuth('admin');
    const res = await POST(createRequest({ productName: '' }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 503 when AI unavailable (null result)', async () => {
    mockAuth('admin');
    mockGenerateContent.mockResolvedValue(null);
    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toContain('ANTHROPIC_API_KEY');
  });

  it('returns 500 on unexpected error', async () => {
    mockAuth('admin');
    mockGenerateContent.mockRejectedValue(new Error('Unexpected'));
    const res = await POST(createRequest(validBody) as never);
    expect(res.status).toBe(500);
  });

  it('passes correct input to generateCarouselContent', async () => {
    mockAuth('admin');
    mockGenerateContent.mockResolvedValue({
      benefits: [],
      compatibility: [],
      usageTips: [],
      certifications: [],
    });

    const body = {
      productName: 'Test Product',
      brand: 'TestBrand',
      specs: [{ label: 'Size', value: 'XL' }],
      category: 'Фильтры',
      productDescription: 'Best filter',
    };

    await POST(createRequest(body) as never);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const input = mockGenerateContent.mock.calls[0][0];
    expect(input.productName).toBe('Test Product');
    expect(input.brand).toBe('TestBrand');
    expect(input.specs).toEqual([{ label: 'Size', value: 'XL' }]);
    expect(input.category).toBe('Фильтры');
    expect(input.productDescription).toBe('Best filter');
  });

  it('accepts minimal body with only productName', async () => {
    mockAuth('admin');
    mockGenerateContent.mockResolvedValue({
      benefits: ['B1'],
      compatibility: [],
      usageTips: [],
      certifications: [],
    });

    const res = await POST(createRequest({ productName: 'Simple Product' }) as never);
    expect(res.status).toBe(200);
  });

  it('validates productName max length', async () => {
    mockAuth('admin');
    const res = await POST(createRequest({ productName: 'x'.repeat(201) }) as never);
    expect(res.status).toBe(400);
  });
});
