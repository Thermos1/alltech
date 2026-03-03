import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock onnxruntime-web
const mockRun = vi.fn();
const mockCreate = vi.fn();
const mockRelease = vi.fn();
const mockTensor = vi.fn();

class MockTensor {
  type: unknown;
  data: unknown;
  dims: unknown;
  constructor(...args: unknown[]) {
    mockTensor(...args);
    this.type = args[0];
    this.data = args[1];
    this.dims = args[2];
  }
}

vi.mock('onnxruntime-web', () => ({
  env: {
    wasm: { wasmPaths: '', numThreads: 1 },
  },
  InferenceSession: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
  Tensor: MockTensor,
}));

// Mock canvas API since jsdom doesn't support Canvas2D
function createMockImageData(w: number, h: number, rgba: [number, number, number, number]) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data[i * 4 + 0] = rgba[0];
    data[i * 4 + 1] = rgba[1];
    data[i * 4 + 2] = rgba[2];
    data[i * 4 + 3] = rgba[3];
  }
  return { data, width: w, height: h };
}

function createMockCtx(w: number, h: number, rgba: [number, number, number, number]) {
  const imageData = createMockImageData(w, h, rgba);
  return {
    drawImage: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn().mockReturnValue(imageData),
    putImageData: vi.fn(),
    createImageData: vi.fn((cw: number, ch: number) => ({
      data: new Uint8ClampedArray(cw * ch * 4),
      width: cw,
      height: ch,
    })),
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  };
}

// Patch document.createElement to return canvas mocks
const origCreateElement = document.createElement.bind(document);
let canvasCounter = 0;
const canvasPixelMap = new Map<number, [number, number, number, number]>();

vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
  if (tag === 'canvas') {
    const id = canvasCounter++;
    const mockCanvas = origCreateElement('canvas');
    let canvasWidth = 0;
    let canvasHeight = 0;

    Object.defineProperty(mockCanvas, 'width', {
      get: () => canvasWidth,
      set: (v: number) => { canvasWidth = v; },
    });
    Object.defineProperty(mockCanvas, 'height', {
      get: () => canvasHeight,
      set: (v: number) => { canvasHeight = v; },
    });

    const rgba = canvasPixelMap.get(id) || [0, 0, 0, 255];
    (mockCanvas as unknown as Record<string, unknown>).getContext = vi.fn().mockImplementation(() => {
      return createMockCtx(canvasWidth || 512, canvasHeight || 512, rgba);
    });
    (mockCanvas as unknown as Record<string, unknown>).toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock');
    return mockCanvas;
  }
  return origCreateElement(tag);
});

// Mock fetch for model download
const mockFetchResponse = {
  ok: true,
  headers: { get: () => '1000' },
  body: {
    getReader: () => {
      let done = false;
      return {
        read: () => {
          if (!done) {
            done = true;
            return Promise.resolve({ done: false, value: new Uint8Array(1000) });
          }
          return Promise.resolve({ done: true, value: undefined });
        },
      };
    },
  },
};

const { inpaint, isSessionLoaded, disposeSession, hasMaskContent } = await import('@/lib/lama-inpainter');

// Helper: create a mock canvas the module can work with
function makeMockCanvas(w: number, h: number, rgba: [number, number, number, number]) {
  const canvas = origCreateElement('canvas');
  let cw = w;
  let ch = h;
  Object.defineProperty(canvas, 'width', { get: () => cw, set: (v: number) => { cw = v; } });
  Object.defineProperty(canvas, 'height', { get: () => ch, set: (v: number) => { ch = v; } });
  (canvas as unknown as Record<string, unknown>).getContext = vi.fn().mockImplementation(() => {
    return createMockCtx(cw, ch, rgba);
  });
  return canvas;
}

describe('lama-inpainter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canvasCounter = 0;
    disposeSession();
  });

  it('exports inpaint, isSessionLoaded, disposeSession, hasMaskContent', () => {
    expect(typeof inpaint).toBe('function');
    expect(typeof isSessionLoaded).toBe('function');
    expect(typeof disposeSession).toBe('function');
    expect(typeof hasMaskContent).toBe('function');
  });

  it('isSessionLoaded returns false initially', () => {
    expect(isSessionLoaded()).toBe(false);
  });

  it('sets WASM paths to CDN', async () => {
    const ort = await import('onnxruntime-web');
    expect(ort.env.wasm.wasmPaths).toBe('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/');
  });

  it('creates session with WASM provider on first inpaint call', async () => {
    const imageCanvas = makeMockCanvas(100, 100, [128, 64, 32, 255]);
    const maskCanvas = makeMockCanvas(100, 100, [255, 255, 255, 255]);

    const mockOutput = new Float32Array(3 * 512 * 512).fill(128);
    mockCreate.mockResolvedValue({
      run: mockRun.mockResolvedValue({ output: { data: mockOutput } }),
      release: mockRelease,
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse));

    await inpaint(imageCanvas, maskCanvas);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate.mock.calls[0][1]).toEqual({ executionProviders: ['wasm'] });
  });

  it('reuses cached session on subsequent calls', async () => {
    const imageCanvas = makeMockCanvas(100, 100, [0, 0, 0, 255]);
    const maskCanvas = makeMockCanvas(100, 100, [255, 255, 255, 255]);

    const mockOutput = new Float32Array(3 * 512 * 512).fill(100);
    mockCreate.mockResolvedValue({
      run: mockRun.mockResolvedValue({ output: { data: mockOutput } }),
      release: mockRelease,
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse));

    await inpaint(imageCanvas, maskCanvas);
    await inpaint(imageCanvas, maskCanvas);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockRun).toHaveBeenCalledTimes(2);
  });

  it('creates tensors with correct shapes [1,3,512,512] and [1,1,512,512]', async () => {
    const imageCanvas = makeMockCanvas(200, 150, [100, 150, 200, 255]);
    const maskCanvas = makeMockCanvas(200, 150, [255, 255, 255, 255]);

    const mockOutput = new Float32Array(3 * 512 * 512).fill(128);
    mockCreate.mockResolvedValue({
      run: mockRun.mockResolvedValue({ output: { data: mockOutput } }),
      release: mockRelease,
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse));

    await inpaint(imageCanvas, maskCanvas);

    // Image tensor: [1, 3, 512, 512]
    expect(mockTensor.mock.calls[0][2]).toEqual([1, 3, 512, 512]);
    // Mask tensor: [1, 1, 512, 512]
    expect(mockTensor.mock.calls[1][2]).toEqual([1, 1, 512, 512]);
  });

  it('normalizes image pixels to 0-1 range', async () => {
    const imageCanvas = makeMockCanvas(10, 10, [128, 128, 128, 255]);
    const maskCanvas = makeMockCanvas(10, 10, [255, 255, 255, 255]);

    const mockOutput = new Float32Array(3 * 512 * 512).fill(128);
    mockCreate.mockResolvedValue({
      run: mockRun.mockResolvedValue({ output: { data: mockOutput } }),
      release: mockRelease,
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse));

    await inpaint(imageCanvas, maskCanvas);

    expect(mockTensor.mock.calls[0][0]).toBe('float32');
    const imageData = mockTensor.mock.calls[0][1] as Float32Array;
    // All values should be in 0-1 range (normalized from 0-255)
    for (let i = 0; i < Math.min(100, imageData.length); i++) {
      expect(imageData[i]).toBeLessThanOrEqual(1.0);
      expect(imageData[i]).toBeGreaterThanOrEqual(0.0);
    }
  });

  it('binarizes mask values to 0 or 1 only', async () => {
    const imageCanvas = makeMockCanvas(10, 10, [0, 0, 0, 255]);
    const maskCanvas = makeMockCanvas(10, 10, [200, 200, 200, 255]);

    const mockOutput = new Float32Array(3 * 512 * 512).fill(0);
    mockCreate.mockResolvedValue({
      run: mockRun.mockResolvedValue({ output: { data: mockOutput } }),
      release: mockRelease,
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse));

    await inpaint(imageCanvas, maskCanvas);

    const maskData = mockTensor.mock.calls[1][1] as Float32Array;
    // All mask values must be exactly 0 or 1 (binarized)
    for (let i = 0; i < Math.min(100, maskData.length); i++) {
      expect(maskData[i] === 0 || maskData[i] === 1).toBe(true);
    }
  });

  it('calls progress callback with download, session, and inference stages', async () => {
    const imageCanvas = makeMockCanvas(10, 10, [0, 0, 0, 255]);
    const maskCanvas = makeMockCanvas(10, 10, [255, 255, 255, 255]);

    const mockOutput = new Float32Array(3 * 512 * 512).fill(0);
    mockCreate.mockResolvedValue({
      run: mockRun.mockResolvedValue({ output: { data: mockOutput } }),
      release: mockRelease,
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse));

    const stages: string[] = [];
    await inpaint(imageCanvas, maskCanvas, (stage) => {
      if (!stages.includes(stage)) stages.push(stage);
    });

    expect(stages).toContain('download');
    expect(stages).toContain('session');
    expect(stages).toContain('inference');
  });

  it('handles fetch failure gracefully', async () => {
    const imageCanvas = makeMockCanvas(10, 10, [0, 0, 0, 255]);
    const maskCanvas = makeMockCanvas(10, 10, [255, 255, 255, 255]);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    await expect(inpaint(imageCanvas, maskCanvas)).rejects.toThrow('Failed to download model');
  });

  it('disposeSession clears the cached session', async () => {
    const imageCanvas = makeMockCanvas(10, 10, [0, 0, 0, 255]);
    const maskCanvas = makeMockCanvas(10, 10, [255, 255, 255, 255]);

    const mockOutput = new Float32Array(3 * 512 * 512).fill(0);
    mockCreate.mockResolvedValue({
      run: mockRun.mockResolvedValue({ output: { data: mockOutput } }),
      release: mockRelease,
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse));

    await inpaint(imageCanvas, maskCanvas);
    expect(isSessionLoaded()).toBe(true);

    disposeSession();
    expect(isSessionLoaded()).toBe(false);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it('hasMaskContent returns false for empty black mask', () => {
    const canvas = makeMockCanvas(10, 10, [0, 0, 0, 255]);
    expect(hasMaskContent(canvas)).toBe(false);
  });

  it('hasMaskContent returns true for mask with white pixels', () => {
    const canvas = makeMockCanvas(10, 10, [255, 255, 255, 255]);
    expect(hasMaskContent(canvas)).toBe(true);
  });

  it('returns canvas with original dimensions after inpaint', async () => {
    const imageCanvas = makeMockCanvas(300, 200, [100, 100, 100, 255]);
    const maskCanvas = makeMockCanvas(300, 200, [255, 255, 255, 255]);

    const mockOutput = new Float32Array(3 * 512 * 512).fill(128);
    mockCreate.mockResolvedValue({
      run: mockRun.mockResolvedValue({ output: { data: mockOutput } }),
      release: mockRelease,
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse));

    const result = await inpaint(imageCanvas, maskCanvas);
    // The final canvas should be resized to original dimensions
    expect(result.width).toBe(300);
    expect(result.height).toBe(200);
  });
});
