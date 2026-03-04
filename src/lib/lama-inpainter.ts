/**
 * LaMa ONNX Inpainting — browser-side image cleanup
 *
 * Removes badges, watermarks, logos from product images using the LaMa model
 * running entirely in the browser via onnxruntime-web (WASM backend).
 *
 * Model: Carve/LaMa-ONNX (208 MB, cached by browser after first download)
 * Input: image [1,3,512,512] float32 (0-1) + mask [1,1,512,512] float32 (0=keep, 1=inpaint)
 * Output: [1,3,512,512] float32 (0-1 normalized, auto-detected and scaled to 0-255)
 */

import * as ort from 'onnxruntime-web';

// CDN for WASM runtime files (avoids bundling in webpack)
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/';

const MODEL_URL = 'https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx';
const INPAINT_SIZE = 512;
const MASK_DILATION_RADIUS = 8; // px — expand mask edges to avoid visible seams

export type InpaintProgress = (stage: 'download' | 'session' | 'inference', pct: number) => void;

// --- Singleton session ---
let _session: ort.InferenceSession | null = null;
let _sessionPromise: Promise<ort.InferenceSession> | null = null;

export function isSessionLoaded(): boolean {
  return _session !== null;
}

export function disposeSession(): void {
  if (_session) {
    _session.release();
    _session = null;
  }
  _sessionPromise = null;
}

async function getSession(onProgress?: InpaintProgress): Promise<ort.InferenceSession> {
  if (_session) return _session;
  if (_sessionPromise) return _sessionPromise;

  _sessionPromise = (async () => {
    onProgress?.('download', 0);

    // Fetch model with progress tracking via ReadableStream
    const response = await fetch(MODEL_URL);
    if (!response.ok) {
      throw new Error(`Failed to download model: ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 208_000_000;

    const reader = response.body!.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      onProgress?.('download', Math.round((received / total) * 100));
    }

    // Assemble into single ArrayBuffer
    const modelBuffer = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      modelBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    onProgress?.('session', 0);

    const session = await ort.InferenceSession.create(modelBuffer.buffer, {
      executionProviders: ['wasm'],
    });

    onProgress?.('session', 100);

    _session = session;
    _sessionPromise = null;
    return session;
  })();

  return _sessionPromise;
}

// --- Canvas helpers ---

/** Resize a canvas to target dimensions using an offscreen canvas */
function resizeCanvas(source: HTMLCanvasElement, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, w, h);
  return c;
}

/** Convert canvas pixels to CHW Float32Array for image (RGB normalized 0-1) */
function canvasToImageTensor(canvas: HTMLCanvasElement): Float32Array {
  const ctx = canvas.getContext('2d')!;
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const chw = new Float32Array(3 * width * height);
  const pixels = width * height;

  for (let i = 0; i < pixels; i++) {
    chw[0 * pixels + i] = data[i * 4 + 0] / 255.0; // R
    chw[1 * pixels + i] = data[i * 4 + 1] / 255.0; // G
    chw[2 * pixels + i] = data[i * 4 + 2] / 255.0; // B
  }

  return chw;
}

/** Dilate mask by radius px to expand edges and avoid visible seams (best practice from IOPaint/Kortex) */
function dilateMask(canvas: HTMLCanvasElement, radius: number): HTMLCanvasElement {
  const srcCtx = canvas.getContext('2d')!;
  const { data, width, height } = srcCtx.getImageData(0, 0, canvas.width, canvas.height);

  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const ctx = out.getContext('2d')!;

  // Copy original mask
  ctx.drawImage(canvas, 0, 0);

  // Draw filled circle at every white pixel boundary — equivalent to morphological dilation
  ctx.fillStyle = '#FFFFFF';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4] > 128) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  return out;
}

/** Convert canvas pixels to CHW Float32Array for mask (single channel, binarized) */
function canvasToMaskTensor(canvas: HTMLCanvasElement): Float32Array {
  const ctx = canvas.getContext('2d')!;
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const chw = new Float32Array(width * height);

  for (let i = 0; i < width * height; i++) {
    // Any channel > 128 means "inpaint this pixel"
    chw[i] = data[i * 4] > 128 ? 1.0 : 0.0;
  }

  return chw;
}

/** Convert CHW float32 output back to canvas ImageData */
function outputToCanvas(output: Float32Array, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  const pixels = width * height;

  // Auto-detect output range: if max value <= 1.0, it's normalized 0-1 and needs * 255
  let maxVal = 0;
  for (let i = 0; i < Math.min(1000, output.length); i++) {
    if (output[i] > maxVal) maxVal = output[i];
  }
  const scale = maxVal <= 1.0 ? 255.0 : 1.0;

  for (let i = 0; i < pixels; i++) {
    imageData.data[i * 4 + 0] = Math.max(0, Math.min(255, Math.round(output[0 * pixels + i] * scale))); // R
    imageData.data[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(output[1 * pixels + i] * scale))); // G
    imageData.data[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(output[2 * pixels + i] * scale))); // B
    imageData.data[i * 4 + 3] = 255; // A
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/** Check if mask has any painted (white) pixels */
export function hasMaskContent(maskCanvas: HTMLCanvasElement): boolean {
  const ctx = maskCanvas.getContext('2d')!;
  const { data } = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 128) return true;
  }
  return false;
}

// --- Main inpainting function ---

/**
 * Run LaMa inpainting on an image using a mask.
 *
 * @param imageCanvas - Canvas with the source image
 * @param maskCanvas - Canvas with the mask (white = areas to inpaint, black = keep)
 * @param onProgress - Optional progress callback
 * @returns Canvas with the inpainted result at original dimensions
 */
export async function inpaint(
  imageCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  onProgress?: InpaintProgress,
): Promise<HTMLCanvasElement> {
  const origWidth = imageCanvas.width;
  const origHeight = imageCanvas.height;

  // 1. Get or create session (downloads model on first call)
  const session = await getSession(onProgress);

  onProgress?.('inference', 0);

  // 2. Dilate mask to expand edges (avoids visible seams — best practice from IOPaint)
  const dilatedMask = dilateMask(maskCanvas, MASK_DILATION_RADIUS);

  // 3. Resize to 512x512 for LaMa
  const resizedImage = resizeCanvas(imageCanvas, INPAINT_SIZE, INPAINT_SIZE);
  const resizedMask = resizeCanvas(dilatedMask, INPAINT_SIZE, INPAINT_SIZE);

  // 4. Convert to tensors
  const imageData = canvasToImageTensor(resizedImage);
  const maskData = canvasToMaskTensor(resizedMask);

  const imageTensor = new ort.Tensor('float32', imageData, [1, 3, INPAINT_SIZE, INPAINT_SIZE]);
  const maskTensor = new ort.Tensor('float32', maskData, [1, 1, INPAINT_SIZE, INPAINT_SIZE]);

  onProgress?.('inference', 30);

  // 5. Run inference
  const results = await session.run({ image: imageTensor, mask: maskTensor });
  const outputData = results.output.data as Float32Array;

  onProgress?.('inference', 80);

  // 6. Convert output back to canvas (512x512)
  const resultCanvas = outputToCanvas(outputData, INPAINT_SIZE, INPAINT_SIZE);

  // 7. Resize back to original dimensions
  const finalCanvas = resizeCanvas(resultCanvas, origWidth, origHeight);

  onProgress?.('inference', 100);

  return finalCanvas;
}
