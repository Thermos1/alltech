import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const originalEnv = { ...process.env };

describe('generateCarouselContent', () => {
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
    const { generateCarouselContent } = await import('@/lib/ai-carousel');
    const result = await generateCarouselContent({ productName: 'Test' });
    expect(result).toBeNull();
  });

  it('returns parsed result on success', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const mockResponse = {
      benefits: ['Benefit 1', 'Benefit 2'],
      compatibility: ['Toyota', 'Honda'],
      usageTips: ['Tip 1'],
      certifications: ['ISO 9001'],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ text: JSON.stringify(mockResponse) }],
          }),
      }),
    );

    const { generateCarouselContent } = await import('@/lib/ai-carousel');
    const result = await generateCarouselContent({
      productName: 'ROLF GT 5W-40',
      brand: 'ROLF',
      specs: [{ label: 'Вязкость', value: '5W-40' }],
    });

    expect(result).toEqual(mockResponse);
  });

  it('handles markdown-wrapped JSON response', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const json = {
      benefits: ['B1'],
      compatibility: ['C1'],
      usageTips: ['T1'],
      certifications: ['Cert1'],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ text: '```json\n' + JSON.stringify(json) + '\n```' }],
          }),
      }),
    );

    const { generateCarouselContent } = await import('@/lib/ai-carousel');
    const result = await generateCarouselContent({ productName: 'Test' });
    expect(result).toEqual(json);
  });

  it('returns null on API error', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal error'),
      }),
    );

    const { generateCarouselContent } = await import('@/lib/ai-carousel');
    const result = await generateCarouselContent({ productName: 'Test' });
    expect(result).toBeNull();
  });

  it('returns null on invalid JSON', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ text: 'not valid json at all' }],
          }),
      }),
    );

    const { generateCarouselContent } = await import('@/lib/ai-carousel');
    const result = await generateCarouselContent({ productName: 'Test' });
    expect(result).toBeNull();
  });

  it('returns null when no text in response', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ content: [] }),
      }),
    );

    const { generateCarouselContent } = await import('@/lib/ai-carousel');
    const result = await generateCarouselContent({ productName: 'Test' });
    expect(result).toBeNull();
  });

  it('defaults missing arrays to empty', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ text: '{ "benefits": ["B1"] }' }],
          }),
      }),
    );

    const { generateCarouselContent } = await import('@/lib/ai-carousel');
    const result = await generateCarouselContent({ productName: 'Test' });
    expect(result).not.toBeNull();
    expect(result!.benefits).toEqual(['B1']);
    expect(result!.compatibility).toEqual([]);
    expect(result!.usageTips).toEqual([]);
    expect(result!.certifications).toEqual([]);
  });

  it('includes specs and description in prompt', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [
            {
              text: JSON.stringify({
                benefits: [],
                compatibility: [],
                usageTips: [],
                certifications: [],
              }),
            },
          ],
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { generateCarouselContent } = await import('@/lib/ai-carousel');
    await generateCarouselContent({
      productName: 'ROLF GT',
      brand: 'ROLF',
      specs: [
        { label: 'API', value: 'SN/CF' },
        { label: 'Вязкость', value: '5W-40' },
      ],
      category: 'Моторное масло',
      productDescription: 'Премиальное масло',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    const prompt = body.messages[0].content;
    expect(prompt).toContain('ROLF GT');
    expect(prompt).toContain('ROLF');
    expect(prompt).toContain('API: SN/CF');
    expect(prompt).toContain('Моторное масло');
    expect(prompt).toContain('Премиальное масло');
  });

  it('returns null on network error', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';

    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );

    const { generateCarouselContent } = await import('@/lib/ai-carousel');
    const result = await generateCarouselContent({ productName: 'Test' });
    expect(result).toBeNull();
  });
});
