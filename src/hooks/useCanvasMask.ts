'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

const MIN_BRUSH = 10;
const MAX_BRUSH = 100;
const DEFAULT_BRUSH = 30;
const MAX_HISTORY = 30;
const MASK_COLOR = 'rgba(255, 45, 120, 0.4)'; // magenta overlay
const MAX_DISPLAY_SIZE = 800; // max canvas display dimension

type Point = { x: number; y: number };

export type UseCanvasMaskReturn = {
  /** Ref for the visible canvas element */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Current brush size in pixels */
  brushSize: number;
  /** Set brush size (clamped to 10-100) */
  setBrushSize: (size: number) => void;
  /** Undo last stroke */
  undo: () => void;
  /** Redo undone stroke */
  redo: () => void;
  /** Clear all mask strokes */
  clearMask: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Get the hidden mask canvas (black=keep, white=inpaint) */
  getMaskCanvas: () => HTMLCanvasElement | null;
  /** Get canvas with source image at display resolution */
  getImageCanvas: () => HTMLCanvasElement | null;
  /** Canvas display dimensions */
  displaySize: { width: number; height: number };
  /** Load an image onto the canvas */
  loadImage: (src: string) => void;
  /** Whether an image is loaded */
  isImageLoaded: boolean;
  /** Mouse position for cursor overlay */
  cursorPos: Point | null;
  /** Whether currently drawing */
  isDrawing: boolean;
};

export function useCanvasMask(): UseCanvasMaskReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [brushSize, setBrushSizeRaw] = useState(DEFAULT_BRUSH);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [cursorPos, setCursorPos] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Undo/redo history (ImageData snapshots of mask canvas)
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Drawing state refs (non-reactive for performance)
  const drawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);

  const setBrushSize = useCallback((size: number) => {
    setBrushSizeRaw(Math.max(MIN_BRUSH, Math.min(MAX_BRUSH, Math.round(size))));
  }, []);

  const updateHistoryFlags = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const saveHistory = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d')!;
    const data = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

    // Truncate forward history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(data);

    // Limit history size
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    }
    historyIndexRef.current = historyRef.current.length - 1;
    updateHistoryFlags();
  }, [updateHistoryFlags]);

  const redrawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !maskCanvas || !image) return;

    const ctx = canvas.getContext('2d')!;

    // Draw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw semi-transparent magenta mask overlay
    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;
    const overlayCtx = overlayCanvas.getContext('2d')!;

    // Copy mask and colorize
    overlayCtx.drawImage(maskCanvas, 0, 0);
    overlayCtx.globalCompositeOperation = 'source-in';
    overlayCtx.fillStyle = MASK_COLOR;
    overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    ctx.drawImage(overlayCanvas, 0, 0);
  }, []);

  const drawBrushStroke = useCallback((x: number, y: number) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }, [brushSize]);

  const interpolateAndDraw = useCallback((from: Point, to: Point) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.ceil(dist / (brushSize / 4)));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      drawBrushStroke(from.x + dx * t, from.y + dy * t);
    }
    redrawOverlay();
  }, [brushSize, drawBrushStroke, redrawOverlay]);

  // Get canvas-space coordinates from mouse/touch event
  const getCanvasPoint = useCallback((e: MouseEvent | Touch): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // Mouse/touch handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isImageLoaded) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // left click only
      const point = getCanvasPoint(e);
      if (!point) return;
      drawingRef.current = true;
      setIsDrawing(true);
      lastPointRef.current = point;
      saveHistory();
      drawBrushStroke(point.x, point.y);
      redrawOverlay();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const point = getCanvasPoint(e);
      if (point) setCursorPos(point);

      if (!drawingRef.current || !lastPointRef.current || !point) return;
      interpolateAndDraw(lastPointRef.current, point);
      lastPointRef.current = point;
    };

    const handleMouseUp = () => {
      if (drawingRef.current) {
        drawingRef.current = false;
        setIsDrawing(false);
        lastPointRef.current = null;
        updateHistoryFlags();
      }
    };

    const handleMouseLeave = () => {
      setCursorPos(null);
      handleMouseUp();
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -5 : 5;
      setBrushSize(brushSize + delta);
    };

    // Touch handlers
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const point = getCanvasPoint(touch);
      if (!point) return;
      drawingRef.current = true;
      setIsDrawing(true);
      lastPointRef.current = point;
      saveHistory();
      drawBrushStroke(point.x, point.y);
      redrawOverlay();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const point = getCanvasPoint(touch);
      if (!drawingRef.current || !lastPointRef.current || !point) return;
      interpolateAndDraw(lastPointRef.current, point);
      lastPointRef.current = point;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleMouseUp();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isImageLoaded, brushSize, getCanvasPoint, drawBrushStroke, interpolateAndDraw, redrawOverlay, saveHistory, setBrushSize, updateHistoryFlags]);

  // Keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d')!;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    redrawOverlay();
    updateHistoryFlags();
  }, [redrawOverlay, updateHistoryFlags]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d')!;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    redrawOverlay();
    updateHistoryFlags();
  }, [redrawOverlay, updateHistoryFlags]);

  const clearMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    saveHistory();
    const ctx = maskCanvas.getContext('2d')!;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    redrawOverlay();
    updateHistoryFlags();
  }, [redrawOverlay, saveHistory, updateHistoryFlags]);

  const loadImage = useCallback((src: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate display size (fit within MAX_DISPLAY_SIZE)
      const scale = Math.min(1, MAX_DISPLAY_SIZE / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      setDisplaySize({ width: w, height: h });
      imageRef.current = img;

      // Init visible canvas
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
      }

      // Init hidden mask canvas (same size, all black)
      let maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) {
        maskCanvas = document.createElement('canvas');
        maskCanvasRef.current = maskCanvas;
      }
      maskCanvas.width = w;
      maskCanvas.height = h;
      const maskCtx = maskCanvas.getContext('2d')!;
      maskCtx.fillStyle = '#000000';
      maskCtx.fillRect(0, 0, w, h);

      // Init image-only canvas (for passing to inpainter)
      let imageCanvas = imageCanvasRef.current;
      if (!imageCanvas) {
        imageCanvas = document.createElement('canvas');
        imageCanvasRef.current = imageCanvas;
      }
      imageCanvas.width = w;
      imageCanvas.height = h;
      const imageCtx = imageCanvas.getContext('2d')!;
      imageCtx.drawImage(img, 0, 0, w, h);

      // Reset history
      historyRef.current = [];
      historyIndexRef.current = -1;

      // Save initial empty mask state
      const emptyMask = maskCtx.getImageData(0, 0, w, h);
      historyRef.current.push(emptyMask);
      historyIndexRef.current = 0;

      setIsImageLoaded(true);
    };
    img.src = src;
  }, []);

  const getMaskCanvas = useCallback(() => {
    return maskCanvasRef.current;
  }, []);

  const getImageCanvas = useCallback(() => {
    return imageCanvasRef.current;
  }, []);

  return {
    canvasRef,
    brushSize,
    setBrushSize,
    undo,
    redo,
    clearMask,
    canUndo,
    canRedo,
    getMaskCanvas,
    getImageCanvas,
    displaySize,
    loadImage,
    isImageLoaded,
    cursorPos,
    isDrawing,
  };
}
