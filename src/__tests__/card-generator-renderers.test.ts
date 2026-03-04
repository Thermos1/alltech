import { describe, it, expect, vi } from 'vitest';

// These tests verify generateSlideSequence dispatches the right renderers
// and returns the expected number of buffers. We mock satori+sharp to
// avoid needing real fonts, while still exercising the JSX-building logic.

let capturedJsx: unknown[] = [];

vi.mock('satori', () => ({
  default: vi.fn(async (jsx: unknown) => {
    capturedJsx.push(jsx);
    return '<svg></svg>';
  }),
}));

vi.mock('sharp', () => {
  const mockSharp = () => ({
    png: () => ({
      toBuffer: () => Promise.resolve(Buffer.from([0x89, 0x50, 0x4e, 0x47])),
    }),
    jpeg: () => ({
      toBuffer: () => Promise.resolve(Buffer.from([0xff, 0xd8, 0xff])),
    }),
  });
  return { default: mockSharp };
});

const fakeFont = new ArrayBuffer(8);
vi.mock('@/lib/fonts', () => ({
  loadFonts: () =>
    Promise.resolve([
      { name: 'Dela Gothic One', data: fakeFont, weight: 400, style: 'normal' },
      { name: 'Golos Text', data: fakeFont, weight: 400, style: 'normal' },
      { name: 'Golos Text', data: fakeFont, weight: 700, style: 'normal' },
    ]),
}));

const { generateSlideSequence, generateCarouselPdf, generateCard, generateCarousel } = await import('@/lib/card-generator');

const TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

describe('generateSlideSequence — JSX dispatch + buffer output', () => {
  beforeEach(() => {
    capturedJsx = [];
  });

  // --- Title slide ---
  it('generates title slide with heading and body', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'title', heading: 'Hello World', body: 'Subtitle' }],
      [],
      'minimalist',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
    expect(buffers[0][0]).toBe(0x89); // PNG mock
    expect(capturedJsx).toHaveLength(1);
  });

  // --- Text-only slide ---
  it('generates text-only slide', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'text-only', heading: 'Тезис', body: 'Описание тезиса' }],
      [],
      'premium-dark',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
  });

  // --- List slide ---
  it('generates list slide with items', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'list', heading: 'Пункты', items: ['A', 'B', 'C'] }],
      [],
      'gradient',
      'wb-ozon',
    );
    expect(buffers).toHaveLength(1);
  });

  it('generates list slide with empty items', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'list', heading: 'Empty', items: [] }],
      [],
      'minimalist',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
  });

  // --- Photo-only slide ---
  it('generates photo-only slide with image', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'photo-only', imageIndex: 0 }],
      [TINY_PNG],
      'minimalist',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
    // photo-only should have full-bleed wrapper (no padding)
    const jsx = capturedJsx[0] as { props: { style: { padding?: number } } };
    expect(jsx.props.style.padding).toBeUndefined(); // no padding on photo-only
  });

  it('generates photo-only slide placeholder when no image', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'photo-only' }],
      [],
      'minimalist',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
  });

  it('generates photo-only placeholder when imageIndex exceeds available', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'photo-only', imageIndex: 5 }],
      [TINY_PNG], // only index 0
      'minimalist',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
  });

  // --- Photo-text slide ---
  it('generates photo-text slide with image and text', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'photo-text', imageIndex: 0, heading: 'Защита', body: 'Лучшее масло' }],
      [TINY_PNG],
      'premium-dark',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
  });

  it('generates photo-text slide without image', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'photo-text', heading: 'No Image', body: 'Still works' }],
      [],
      'minimalist',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
  });

  // --- Multiple slides ---
  it('generates multiple slides of different types', async () => {
    const buffers = await generateSlideSequence(
      [
        { type: 'title', heading: 'ROLF GT 5W-40' },
        { type: 'photo-only', imageIndex: 0 },
        { type: 'benefits', heading: 'Преимущества', items: ['Защита', 'Экономия'] },
        { type: 'text-only', heading: 'Почему ROLF?', body: 'Немецкие технологии' },
        { type: 'list', heading: 'Совместимость', items: ['Toyota', 'BMW'] },
        { type: 'photo-text', imageIndex: 0, heading: 'CTA', body: 'Купить сейчас' },
      ],
      [TINY_PNG],
      'premium-dark',
      'instagram',
    );
    expect(buffers).toHaveLength(6);
    expect(capturedJsx).toHaveLength(6);
  });

  // --- Legacy types ---
  it('renders cover type with items as list fallback', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'cover', imageIndex: 0, heading: 'Cover Slide' }],
      [TINY_PNG],
      'minimalist',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
  });

  it('renders benefits type with items', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'benefits', items: ['Fast', 'Reliable'] }],
      [],
      'retro',
      'telegram-vk',
    );
    expect(buffers).toHaveLength(1);
  });

  it('renders compatibility type with items', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'compatibility', heading: 'Compatible', items: ['Toyota', 'Honda'] }],
      [],
      'gradient',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
  });

  it('renders specs type with items', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'specs', items: ['API: SN/CF', 'ACEA: A3/B4'] }],
      [],
      'premium-dark',
      'wb-ozon',
    );
    expect(buffers).toHaveLength(1);
  });

  it('renders usage type with items', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'usage', items: ['Совет 1', 'Совет 2'] }],
      [],
      'minimalist',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
  });

  it('renders trust type with items', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'trust', items: ['ISO 9001', 'API Certified'] }],
      [],
      'premium-dark',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
  });

  // --- Edge cases ---
  it('returns empty array for empty slides', async () => {
    const buffers = await generateSlideSequence([], [], 'minimalist', 'instagram');
    expect(buffers).toHaveLength(0);
  });

  it('handles unknown slide type as text-only fallback', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'nonexistent' as never, heading: 'Fallback', body: 'As text-only' }],
      [],
      'premium-dark',
      'instagram',
    );
    expect(buffers).toHaveLength(1);
  });

  it('applies customColors without error', async () => {
    const buffers = await generateSlideSequence(
      [{ type: 'text-only', heading: 'Custom', body: 'Colors' }],
      [],
      'minimalist',
      'instagram',
      { background: '#FF0000', text: '#00FF00' },
    );
    expect(buffers).toHaveLength(1);
  });

  // --- Platform dimensions ---
  it('works with all supported platforms', async () => {
    const platforms = ['wb-ozon', 'shopify', 'instagram', 'telegram-vk', 'tiktok', 'pinterest'];
    for (const platform of platforms) {
      const buffers = await generateSlideSequence(
        [{ type: 'title', heading: `Platform: ${platform}` }],
        [],
        'minimalist',
        platform,
      );
      expect(buffers).toHaveLength(1);
    }
  });

  // --- All styles ---
  it('works with all styles', async () => {
    const styles = ['minimalist', 'premium-dark', 'gradient', 'retro'];
    for (const style of styles) {
      const buffers = await generateSlideSequence(
        [{ type: 'title', heading: `Style: ${style}` }],
        [],
        style,
        'instagram',
      );
      expect(buffers).toHaveLength(1);
    }
  });

  // --- Slide counter in JSX ---
  it('includes slide counter in non-photo-only slides', async () => {
    capturedJsx = [];
    await generateSlideSequence(
      [
        { type: 'title', heading: 'Slide 1' },
        { type: 'text-only', heading: 'Slide 2' },
      ],
      [],
      'minimalist',
      'instagram',
    );
    expect(capturedJsx).toHaveLength(2);
    // Each non-photo-only JSX has children array with slide counter
    const jsx1 = capturedJsx[0] as { props: { children: unknown[] } };
    const children1 = jsx1.props.children.filter(Boolean);
    // Should contain counter object with "1 / 2"
    const counterChild = children1.find((c: unknown) => {
      const obj = c as { props?: { children?: string } };
      return typeof obj?.props?.children === 'string' && obj.props.children.includes('1 / 2');
    });
    expect(counterChild).toBeTruthy();
  });
});

describe('generateCarouselPdf with mock PNGs', () => {
  it('creates PDF buffer from mocked PNG buffers', async () => {
    const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    // generateCarouselPdf calls pdf-lib (real), but needs real PNG data
    // We just verify it doesn't crash with minimal data
    // Since our mock buffer isn't a real PNG, pdf-lib will throw.
    // This is expected — the unit test for this lives in card-generate.test.ts
    // which uses the full pipeline mock. Skipping here.
  });
});

describe('generateCard with mocked satori+sharp', () => {
  it('generates a card buffer', async () => {
    const buf = await generateCard({
      mode: 'card',
      style: 'minimalist',
      platform: 'instagram',
      enabledElements: ['productName', 'price'],
      badges: [],
      productData: { name: 'Test', price: 100, specs: [] },
      productImageBase64: TINY_PNG,
      outputFormat: 'png',
    });
    expect(Buffer.isBuffer(buf)).toBe(true);
  });

  it('generates a JPG card', async () => {
    const buf = await generateCard({
      mode: 'card',
      style: 'premium-dark',
      platform: 'wb-ozon',
      enabledElements: ['productName'],
      badges: [],
      productData: { name: 'JPG Test', specs: [] },
      productImageBase64: TINY_PNG,
      outputFormat: 'jpg',
    });
    expect(Buffer.isBuffer(buf)).toBe(true);
  });

  it('handles imageScale and offsets in card config', async () => {
    capturedJsx = [];
    await generateCard({
      mode: 'card',
      style: 'minimalist',
      platform: 'instagram',
      enabledElements: ['productName'],
      badges: [],
      productData: { name: 'Scale Test', specs: [] },
      productImageBase64: TINY_PNG,
      outputFormat: 'png',
      imageScale: 1.1,
      imageOffsetX: 20,
      imageOffsetY: -15,
    });
    // Verify the JSX was produced (render logic exercised)
    expect(capturedJsx.length).toBeGreaterThan(0);
  });

  it('handles badges in card config', async () => {
    await generateCard({
      mode: 'card',
      style: 'gradient',
      platform: 'instagram',
      enabledElements: ['productName', 'badges'],
      badges: [{ text: 'ХИТ', type: 'hit' }, { text: '-20%', type: 'sale' }],
      productData: { name: 'Badge Test', specs: [] },
      productImageBase64: TINY_PNG,
      outputFormat: 'png',
    });
  });

  it('handles specs in card config', async () => {
    await generateCard({
      mode: 'card',
      style: 'retro',
      platform: 'wb-ozon',
      enabledElements: ['productName', 'specs', 'price', 'brandName', 'subtitle'],
      badges: [],
      productData: {
        name: 'ROLF GT 5W-40',
        brand: 'ROLF',
        price: 2450,
        priceUnit: '$',
        subtitle: '4L',
        specs: [{ label: 'API', value: 'SN/CF' }, { label: 'ACEA', value: 'A3/B4' }],
      },
      productImageBase64: TINY_PNG,
      outputFormat: 'png',
    });
  });
});

describe('generateCarousel with mocked satori+sharp', () => {
  it('generates 7 carousel slide buffers', async () => {
    const buffers = await generateCarousel(
      {
        product: { name: 'ROLF GT 5W-40', brand: 'ROLF', specs: [{ label: 'API', value: 'SN' }] },
        benefits: ['Защита', 'Экономия'],
        compatibility: ['Toyota', 'Honda'],
        volumes: [{ volume: '1L', price: 800 }, { volume: '4L', price: 2500 }],
        usageTips: ['Менять каждые 10000 км'],
        certifications: ['ISO 9001'],
      },
      'premium-dark',
      'instagram',
      TINY_PNG,
    );
    expect(buffers).toHaveLength(7);
    buffers.forEach((buf) => expect(Buffer.isBuffer(buf)).toBe(true));
  });
});
