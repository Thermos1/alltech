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

const mockGenerateAiPlan = vi.fn();

vi.mock('@/lib/ai-plan', () => ({
  generateAiPlan: (...args: unknown[]) => mockGenerateAiPlan(...args),
}));

const { POST } = await import('@/app/api/admin/cards/ai-plan/route');

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

describe('POST /api/admin/cards/ai-plan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(createRequest({ prompt: 'test', imageCount: 0 }) as never);
    expect(res.status).toBe(401);
  });

  it('returns 403 for customer role', async () => {
    mockAuth('customer');
    const res = await POST(createRequest({ prompt: 'test', imageCount: 0 }) as never);
    expect(res.status).toBe(403);
  });

  it('returns 400 for empty prompt', async () => {
    mockAuth('admin');
    const res = await POST(createRequest({ prompt: '', imageCount: 0 }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing imageCount', async () => {
    mockAuth('admin');
    const res = await POST(createRequest({ prompt: 'test' }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 503 when AI is unavailable', async () => {
    mockAuth('admin');
    mockGenerateAiPlan.mockResolvedValue(null);
    const res = await POST(createRequest({ prompt: 'test plan', imageCount: 2 }) as never);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toContain('ANTHROPIC_API_KEY');
  });

  it('returns plan on success', async () => {
    mockAuth('admin');
    const plan = {
      slides: [
        { type: 'title', heading: 'Test' },
        { type: 'text-only', heading: 'Slide 2', body: 'Content' },
      ],
      style: 'premium-dark',
      productData: { name: 'Test Product' },
    };
    mockGenerateAiPlan.mockResolvedValue(plan);

    const res = await POST(createRequest({ prompt: 'Create a carousel', imageCount: 1 }) as never);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.slides).toHaveLength(2);
    expect(data.style).toBe('premium-dark');
  });

  it('passes style and platform to generateAiPlan', async () => {
    mockAuth('manager');
    mockGenerateAiPlan.mockResolvedValue({ slides: [], style: 'minimalist' });

    await POST(createRequest({
      prompt: 'test',
      imageCount: 3,
      style: 'gradient',
      platform: 'linkedin',
    }) as never);

    expect(mockGenerateAiPlan).toHaveBeenCalledWith({
      prompt: 'test',
      imageCount: 3,
      style: 'gradient',
      platform: 'linkedin',
    });
  });

  it('returns 500 on unexpected error', async () => {
    mockAuth('admin');
    mockGenerateAiPlan.mockRejectedValue(new Error('boom'));
    const res = await POST(createRequest({ prompt: 'test', imageCount: 0 }) as never);
    expect(res.status).toBe(500);
  });
});
