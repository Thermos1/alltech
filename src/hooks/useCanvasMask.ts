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
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  brushSize: number;
  setBrushSize: (size: number) => void;
  undo: () => void;
  redo: () => void;
  clearMask: () => void;
  canUndo: boolean;
  canRedo: boolean;
  getMaskCanvas: () => HTMLCanvasElement | null;
  getImageCanvas: () => HTMLCanvasElement | null;
  displaySize: { width: number; height: number };
  loadImage: (src: string) => void;
  isImageLoaded: boolean;
  cursorPos: Point | null;
  isDrawing: boolean;
};

export function useCanvasMask(): UseCanvasMaskReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [brushSize, setBrushSizeState] = useState(DEFAULT_BRUSH);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [cursorPos, setCursorPos] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Use refs for values that event handlers need, to avoid re-creating listeners
  const brushSizeRef = useRef(DEFAULT_BRUSH);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);

  // Undo/redo history
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const setBrushSize = useCallback((size: number) => {
    const clamped = Math.max(MIN_BRUSH, Math.min(MAX_BRUSH, Math.round(size)));
    brushSizeRef.current = clamped;
    setBrushSizeState(clamped);
  }, []);

  const updateHistoryFlags = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const saveHistory = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

    // Truncate forward history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(data);

    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    }
    historyIndexRef.current = historyRef.current.length - 1;
    updateHistoryFlags();
  }, [updateHistoryFlags]);

  // Redraw visible canvas: image + mask overlay
  const redrawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !maskCanvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Read mask pixel data to find white areas and tint them
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

    // Create overlay only where mask is white
    const overlay = ctx.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < maskData.data.length; i += 4) {
      // Mask is white where user painted (R=255)
      if (maskData.data[i] > 128) {
        overlay.data[i] = 255;     // R
        overlay.data[i + 1] = 45;  // G
        overlay.data[i + 2] = 120; // B
        overlay.data[i + 3] = 102; // A (0.4 * 255)
      }
      // else leave transparent (0,0,0,0)
    }

    ctx.putImageData(overlay, 0, 0, 0, 0, canvas.width, canvas.height);

    // putImageData replaces pixels, so we need to composite properly
    // Let's use a temp canvas approach instead
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw overlay onto a temp canvas, then composite
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(overlay, 0, 0);

    ctx.globalAlpha = 1;
    ctx.drawImage(tempCanvas, 0, 0);
  }, []);

  // Draw a circle on the mask canvas at (x, y)
  const drawAtPoint = useCallback((x: number, y: number) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    const radius = brushSizeRef.current / 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  // Interpolate between two points and draw
  const interpolateAndDraw = useCallback((from: Point, to: Point) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const step = Math.max(1, brushSizeRef.current / 4);
    const steps = Math.max(1, Math.ceil(dist / step));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      drawAtPoint(from.x + dx * t, from.y + dy * t);
    }
    redrawOverlay();
  }, [drawAtPoint, redrawOverlay]);

  // Convert mouse/touch event to canvas coordinates
  const getCanvasPoint = useCallback((e: MouseEvent | Touch): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // Attach event listeners — use refs for mutable state to avoid re-creating
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isImageLoaded) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const point = getCanvasPoint(e);
      if (!point) return;
      drawingRef.current = true;
      setIsDrawing(true);
      lastPointRef.current = point;
      saveHistory();
      drawAtPoint(point.x, point.y);
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
      const newSize = Math.max(MIN_BRUSH, Math.min(MAX_BRUSH, brushSizeRef.current + delta));
      brushSizeRef.current = newSize;
      setBrushSizeState(newSize);
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
      drawAtPoint(point.x, point.y);
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
  }, [isImageLoaded, getCanvasPoint, drawAtPoint, interpolateAndDraw, redrawOverlay, saveHistory, updateHistoryFlags]);

  // Keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redoAction();
        } else {
          undoAction();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const undoAction = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    redrawOverlay();
    updateHistoryFlags();
  }, [redrawOverlay, updateHistoryFlags]);

  const redoAction = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    redrawOverlay();
    updateHistoryFlags();
  }, [redrawOverlay, updateHistoryFlags]);

  const clearMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    saveHistory();
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
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

      // Init hidden mask canvas (same size, all black = keep everything)
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

      // Draw image onto visible canvas after React renders it
      // Use requestAnimationFrame to ensure canvasRef is mounted
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
            }
          }
        });
      });
    };
    img.src = src;
  }, []);

  const getMaskCanvas = useCallback(() => maskCanvasRef.current, []);
  const getImageCanvas = useCallback(() => imageCanvasRef.current, []);

  return {
    canvasRef,
    brushSize,
    setBrushSize,
    undo: undoAction,
    redo: redoAction,
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
