import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvasMask } from '@/hooks/useCanvasMask';

// --- Canvas mock infrastructure ---
// jsdom doesn't implement Canvas2D, so we mock it

function createMockContext2D() {
  const imageDataStore = new Map<string, ImageData>();

  return {
    fillStyle: '#000000',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high' as const,
    globalAlpha: 1,
    clearRect: vi.fn(),
    fillRect: vi.fn(function(this: ReturnType<typeof createMockContext2D>) {
      // Track fill for mask init verification
    }),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    getImageData: vi.fn((_x: number, _y: number, w: number, h: number) => {
      const key = `${w}x${h}`;
      if (!imageDataStore.has(key)) {
        imageDataStore.set(key, {
          data: new Uint8ClampedArray(w * h * 4),
          width: w,
          height: h,
          colorSpace: 'srgb' as PredefinedColorSpace,
        });
      }
      return imageDataStore.get(key)!;
    }),
    putImageData: vi.fn(),
    createImageData: vi.fn((w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
      colorSpace: 'srgb' as PredefinedColorSpace,
    })),
    _imageDataStore: imageDataStore,
  };
}

// Patch document.createElement to return canvas mocks with getContext
const origCreateElement = document.createElement.bind(document);

function createMockCanvas() {
  const canvas = origCreateElement('canvas');
  let w = 0;
  let h = 0;
  const ctx = createMockContext2D();

  Object.defineProperty(canvas, 'width', {
    get: () => w,
    set: (v: number) => { w = v; },
    configurable: true,
  });
  Object.defineProperty(canvas, 'height', {
    get: () => h,
    set: (v: number) => { h = v; },
    configurable: true,
  });
  (canvas as unknown as Record<string, unknown>).getContext = vi.fn(() => ctx);

  return { canvas, ctx };
}

let createElementSpy: ReturnType<typeof vi.spyOn>;
let mockCanvases: ReturnType<typeof createMockCanvas>[];

beforeEach(() => {
  mockCanvases = [];
  createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') {
      const mock = createMockCanvas();
      mockCanvases.push(mock);
      return mock.canvas;
    }
    return origCreateElement(tag);
  });
});

afterEach(() => {
  createElementSpy.mockRestore();
  vi.restoreAllMocks();
});

// Mock Image class for loadImage
function mockImageLoad(src?: string) {
  const originalImage = globalThis.Image;
  let onloadCb: (() => void) | null = null;

  const MockImage = vi.fn().mockImplementation(function(this: HTMLImageElement) {
    const img = Object.create(HTMLImageElement.prototype);
    let _src = '';
    Object.defineProperty(img, 'width', { value: 200, writable: true });
    Object.defineProperty(img, 'height', { value: 150, writable: true });
    Object.defineProperty(img, 'crossOrigin', { value: '', writable: true });
    Object.defineProperty(img, 'src', {
      get: () => _src,
      set: (v: string) => {
        _src = v;
        // Trigger onload async
        if (img.onload) {
          onloadCb = img.onload;
        }
      },
    });
    Object.defineProperty(img, 'onload', { value: null, writable: true });
    return img;
  });

  globalThis.Image = MockImage as unknown as typeof Image;

  return {
    triggerLoad: () => {
      if (onloadCb) onloadCb();
    },
    restore: () => {
      globalThis.Image = originalImage;
    },
  };
}

describe('useCanvasMask', () => {
  it('exports all expected methods and properties', () => {
    const { result } = renderHook(() => useCanvasMask());

    expect(result.current.canvasRef).toBeDefined();
    expect(typeof result.current.brushSize).toBe('number');
    expect(typeof result.current.setBrushSize).toBe('function');
    expect(typeof result.current.undo).toBe('function');
    expect(typeof result.current.redo).toBe('function');
    expect(typeof result.current.clearMask).toBe('function');
    expect(typeof result.current.canUndo).toBe('boolean');
    expect(typeof result.current.canRedo).toBe('boolean');
    expect(typeof result.current.getMaskCanvas).toBe('function');
    expect(typeof result.current.getImageCanvas).toBe('function');
    expect(typeof result.current.loadImage).toBe('function');
    expect(typeof result.current.isImageLoaded).toBe('boolean');
  });

  it('starts with default brush size of 30', () => {
    const { result } = renderHook(() => useCanvasMask());
    expect(result.current.brushSize).toBe(30);
  });

  it('starts with isImageLoaded = false', () => {
    const { result } = renderHook(() => useCanvasMask());
    expect(result.current.isImageLoaded).toBe(false);
  });

  it('starts with canUndo = false and canRedo = false', () => {
    const { result } = renderHook(() => useCanvasMask());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('clamps brush size to min 10', () => {
    const { result } = renderHook(() => useCanvasMask());
    act(() => result.current.setBrushSize(3));
    expect(result.current.brushSize).toBe(10);
  });

  it('clamps brush size to max 100', () => {
    const { result } = renderHook(() => useCanvasMask());
    act(() => result.current.setBrushSize(200));
    expect(result.current.brushSize).toBe(100);
  });

  it('rounds brush size to integer', () => {
    const { result } = renderHook(() => useCanvasMask());
    act(() => result.current.setBrushSize(45.7));
    expect(result.current.brushSize).toBe(46);
  });

  it('getMaskCanvas returns null before image is loaded', () => {
    const { result } = renderHook(() => useCanvasMask());
    expect(result.current.getMaskCanvas()).toBeNull();
  });

  it('getImageCanvas returns null before image is loaded', () => {
    const { result } = renderHook(() => useCanvasMask());
    expect(result.current.getImageCanvas()).toBeNull();
  });

  it('displaySize starts at 0x0', () => {
    const { result } = renderHook(() => useCanvasMask());
    expect(result.current.displaySize).toEqual({ width: 0, height: 0 });
  });

  it('cursorPos starts as null', () => {
    const { result } = renderHook(() => useCanvasMask());
    expect(result.current.cursorPos).toBeNull();
  });

  it('isDrawing starts as false', () => {
    const { result } = renderHook(() => useCanvasMask());
    expect(result.current.isDrawing).toBe(false);
  });

  it('setBrushSize updates brush size within range', () => {
    const { result } = renderHook(() => useCanvasMask());
    act(() => result.current.setBrushSize(50));
    expect(result.current.brushSize).toBe(50);
    act(() => result.current.setBrushSize(75));
    expect(result.current.brushSize).toBe(75);
  });

  it('clearMask is callable without loaded image (no-op)', () => {
    const { result } = renderHook(() => useCanvasMask());
    // Should not throw
    act(() => result.current.clearMask());
    expect(result.current.canUndo).toBe(false);
  });

  it('undo is callable without loaded image (no-op)', () => {
    const { result } = renderHook(() => useCanvasMask());
    act(() => result.current.undo());
    expect(result.current.canUndo).toBe(false);
  });

  it('redo is callable without loaded image (no-op)', () => {
    const { result } = renderHook(() => useCanvasMask());
    act(() => result.current.redo());
    expect(result.current.canRedo).toBe(false);
  });
});
