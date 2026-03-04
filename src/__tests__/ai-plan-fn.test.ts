import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const originalEnv = { ...process.env };

describe('generateAiPlan', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('returns null when ANTHROPIC_API_KEY is not set', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { generateAiPlan } = await import('@/lib/ai-plan');
    const result = await generateAiPlan({ prompt: 'test', imageCount: 0 });
    expect(result).toBeNull();
  });

  it('returns parsed plan on success', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const mockPlan = {
      slides: [
        { type: 'title', heading: 'Hello', body: 'World' },
        { type: 'list', heading: 'Points', items: ['A', 'B'] },
      ],
      style: 'premium-dark',
      productData: { name: 'Test' },
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: JSON.stringify(mockPlan) }] }),
    }));

    const { generateAiPlan } = await import('@/lib/ai-plan');
    const result = await generateAiPlan({ prompt: 'test', imageCount: 0 });
    expect(result).not.toBeNull();
    expect(result!.slides).toHaveLength(2);
    expect(result!.style).toBe('premium-dark');
  });

  it('sanitizes imageIndex exceeding imageCount', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const mockPlan = {
      slides: [
        { type: 'photo-only', imageIndex: 5 },
      ],
      style: 'minimalist',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: JSON.stringify(mockPlan) }] }),
    }));

    const { generateAiPlan } = await import('@/lib/ai-plan');
    const result = await generateAiPlan({ prompt: 'test', imageCount: 2 });
    expect(result!.slides[0].imageIndex).toBeUndefined();
  });

  it('defaults invalid style to premium-dark', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const mockPlan = {
      slides: [],
      style: 'invalid-style',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: JSON.stringify(mockPlan) }] }),
    }));

    const { generateAiPlan } = await import('@/lib/ai-plan');
    const result = await generateAiPlan({ prompt: 'test', imageCount: 0 });
    expect(result!.style).toBe('premium-dark');
  });

  it('returns null on API error', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal error'),
    }));

    const { generateAiPlan } = await import('@/lib/ai-plan');
    const result = await generateAiPlan({ prompt: 'test', imageCount: 0 });
    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const { generateAiPlan } = await import('@/lib/ai-plan');
    const result = await generateAiPlan({ prompt: 'test', imageCount: 0 });
    expect(result).toBeNull();
  });

  it('handles markdown-wrapped JSON response', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const plan = {
      slides: [{ type: 'title', heading: 'Test' }],
      style: 'gradient',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: '```json\n' + JSON.stringify(plan) + '\n```' }],
      }),
    }));

    const { generateAiPlan } = await import('@/lib/ai-plan');
    const result = await generateAiPlan({ prompt: 'test', imageCount: 0 });
    expect(result).not.toBeNull();
    expect(result!.slides).toHaveLength(1);
  });

  it('truncates long heading and body', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const plan = {
      slides: [{
        type: 'text-only',
        heading: 'A'.repeat(300),
        body: 'B'.repeat(1500),
      }],
      style: 'minimalist',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: JSON.stringify(plan) }] }),
    }));

    const { generateAiPlan } = await import('@/lib/ai-plan');
    const result = await generateAiPlan({ prompt: 'test', imageCount: 0 });
    expect(result!.slides[0].heading!.length).toBe(200);
    expect(result!.slides[0].body!.length).toBe(1000);
  });
});
