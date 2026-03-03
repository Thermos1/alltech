import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';

// Mock useCanvasMask hook
const mockLoadImage = vi.fn();
const mockGetImageCanvas = vi.fn();
const mockGetMaskCanvas = vi.fn();
const mockSetBrushSize = vi.fn();
const mockUndo = vi.fn();
const mockRedo = vi.fn();
const mockClearMask = vi.fn();

vi.mock('@/hooks/useCanvasMask', () => ({
  useCanvasMask: () => ({
    canvasRef: { current: null },
    brushSize: 30,
    setBrushSize: mockSetBrushSize,
    undo: mockUndo,
    redo: mockRedo,
    clearMask: mockClearMask,
    canUndo: false,
    canRedo: false,
    getMaskCanvas: mockGetMaskCanvas,
    getImageCanvas: mockGetImageCanvas,
    displaySize: { width: 400, height: 300 },
    loadImage: mockLoadImage,
    isImageLoaded: false,
    cursorPos: null,
    isDrawing: false,
  }),
}));

// Mock lama-inpainter
vi.mock('@/lib/lama-inpainter', () => ({
  inpaint: vi.fn(),
  hasMaskContent: vi.fn().mockReturnValue(true),
  isSessionLoaded: vi.fn().mockReturnValue(false),
}));

// Import after mocks
const { default: ImageCleaner } = await import(
  '@/app/(admin)/admin/image-tools/_components/ImageCleaner'
);

describe('ImageCleaner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload zone in idle state', () => {
    render(createElement(ImageCleaner));
    expect(screen.getByText('Загрузите изображение для очистки')).toBeInTheDocument();
  });

  it('shows drag-drop hint', () => {
    render(createElement(ImageCleaner));
    expect(screen.getByText('Перетащите файл или нажмите для выбора')).toBeInTheDocument();
  });

  it('shows description about cleaning badges', () => {
    render(createElement(ImageCleaner));
    expect(
      screen.getByText('Удалите бейджи, водяные знаки, логотипы и надписи с чужих карточек')
    ).toBeInTheDocument();
  });

  it('has hidden file input with image/* accept', () => {
    render(createElement(ImageCleaner));
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
    expect(input?.getAttribute('accept')).toBe('image/*');
  });

  it('calls onCleaned prop is optional (no crash without it)', () => {
    // Should render without onCleaned prop
    expect(() => render(createElement(ImageCleaner))).not.toThrow();
  });

  it('renders with onCleaned callback', () => {
    const onCleaned = vi.fn();
    expect(() =>
      render(createElement(ImageCleaner, { onCleaned }))
    ).not.toThrow();
  });

  it('upload zone handles dragOver', () => {
    render(createElement(ImageCleaner));
    const dropZone = screen.getByText('Загрузите изображение для очистки').closest('div[class*="border-dashed"]');
    expect(dropZone).toBeTruthy();
    if (dropZone) {
      // Should not throw on dragOver
      fireEvent.dragOver(dropZone, { dataTransfer: { files: [] } });
    }
  });
});
