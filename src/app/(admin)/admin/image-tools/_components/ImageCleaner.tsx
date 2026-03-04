'use client';

import { useState, useRef, useCallback } from 'react';
import { useCanvasMask } from '@/hooks/useCanvasMask';
import { inpaint, hasMaskContent, isSessionLoaded } from '@/lib/lama-inpainter';

type Status = 'idle' | 'editing' | 'processing' | 'done' | 'error';

type Props = {
  onCleaned?: (imageBase64: string) => void;
};

export default function ImageCleaner({ onCleaned }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const mask = useCanvasMask();

  // --- File upload ---
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginalUrl(src);
      setResultUrl(null);
      setStatus('editing');
      mask.loadImage(src);
    };
    reader.readAsDataURL(file);
  }, [mask]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  // --- Inpaint ---
  const handleInpaint = useCallback(async () => {
    const imageCanvas = mask.getImageCanvas();
    const maskCanvas = mask.getMaskCanvas();
    if (!imageCanvas || !maskCanvas) return;

    if (!hasMaskContent(maskCanvas)) {
      setErrorMsg('Отметьте области для очистки кистью');
      setStatus('error');
      return;
    }

    setStatus('processing');
    setErrorMsg('');

    try {
      const resultCanvas = await inpaint(imageCanvas, maskCanvas, (stage, pct) => {
        switch (stage) {
          case 'download':
            setProgress(`Загружаю модель... ${pct}%`);
            break;
          case 'session':
            setProgress('Инициализирую модель...');
            break;
          case 'inference':
            if (pct < 50) setProgress('Удаляю артефакты...');
            else setProgress('Восстанавливаю изображение...');
            break;
        }
      });

      resultCanvasRef.current = resultCanvas;
      const dataUrl = resultCanvas.toDataURL('image/png');
      setResultUrl(dataUrl);
      setStatus('done');
    } catch (err) {
      console.error('[IMAGE-CLEANER] Inpaint error:', err);
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      if (message.includes('memory') || message.includes('Memory') || message.includes('RangeError')) {
        setErrorMsg('Недостаточно памяти. Попробуйте на компьютере с большим объёмом RAM.');
      } else if (message.includes('fetch') || message.includes('network') || message.includes('Failed to download')) {
        setErrorMsg('Не удалось загрузить модель. Проверьте подключение к интернету.');
      } else {
        setErrorMsg(`Ошибка очистки: ${message}`);
      }
      setStatus('error');
    }
  }, [mask]);

  // --- "Clean more" — use result as new source ---
  const handleCleanMore = useCallback(() => {
    if (!resultUrl) return;
    setOriginalUrl(resultUrl);
    setResultUrl(null);
    setStatus('editing');
    mask.loadImage(resultUrl);
  }, [resultUrl, mask]);

  // --- Use cleaned image ---
  const handleUse = useCallback(() => {
    if (resultUrl && onCleaned) {
      onCleaned(resultUrl);
    }
  }, [resultUrl, onCleaned]);

  // --- Download ---
  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `cleaned-${Date.now()}.png`;
    a.click();
  }, [resultUrl]);

  // --- Reset ---
  const handleReset = useCallback(() => {
    setStatus('idle');
    setOriginalUrl(null);
    setResultUrl(null);
    setProgress('');
    setErrorMsg('');
  }, []);

  // --- Render ---
  return (
    <div className="space-y-4">
      {/* Model size notice */}
      {!isSessionLoaded() && status !== 'idle' && (
        <div className="flex items-center gap-3 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 px-4 py-3">
          <span className="text-sm text-accent-yellow">
            Первая загрузка модели ~200 МБ. После загрузки она кэшируется в браузере.
          </span>
        </div>
      )}

      {/* IDLE: Upload zone */}
      {status === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border-primary bg-bg-secondary p-12 cursor-pointer hover:border-accent-yellow/50 transition-colors"
        >
          <div className="text-4xl text-text-secondary">🧹</div>
          <div className="text-center">
            <p className="text-lg font-medium text-text-primary">
              Загрузите изображение для очистки
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Удалите бейджи, водяные знаки, логотипы и надписи с чужих карточек
            </p>
            <p className="text-xs text-text-secondary mt-2">
              Перетащите файл или нажмите для выбора
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* EDITING: Canvas + toolbar */}
      {status === 'editing' && mask.isImageLoaded && (
        <div className="space-y-3">
          {/* Hint */}
          <div className="flex items-center gap-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 px-4 py-3">
            <span className="text-sm text-accent-cyan">
              Закрасьте кистью то, что хотите удалить (бейджи, логотипы, надписи). Розовый = будет удалено.
            </span>
          </div>
          {/* Toolbar */}
          <div className="flex items-center gap-4 flex-wrap rounded-lg bg-bg-secondary px-4 py-3">
            {/* Brush size */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">Кисть:</span>
              <input
                type="range"
                min={10}
                max={100}
                value={mask.brushSize}
                onChange={(e) => mask.setBrushSize(Number(e.target.value))}
                className="w-24 accent-accent-magenta"
              />
              <span className="text-xs text-text-secondary w-8">{mask.brushSize}px</span>
            </div>

            <div className="h-5 w-px bg-border-primary" />

            {/* Undo/Redo */}
            <button
              onClick={mask.undo}
              disabled={!mask.canUndo}
              className="text-xs px-3 py-2 rounded bg-bg-card text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
              title="Отменить (Ctrl+Z)"
            >
              ↩ Отменить
            </button>
            <button
              onClick={mask.redo}
              disabled={!mask.canRedo}
              className="text-xs px-3 py-2 rounded bg-bg-card text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
              title="Повторить (Ctrl+Shift+Z)"
            >
              ↪ Повторить
            </button>
            <button
              onClick={mask.clearMask}
              className="text-xs px-3 py-2 rounded bg-bg-card text-text-secondary hover:text-accent-magenta transition-colors"
            >
              Очистить маску
            </button>

            <div className="flex-1" />

            <span className="text-xs text-text-secondary">
              Колёсико мыши = размер кисти
            </span>
          </div>

          {/* Canvas with custom cursor */}
          <div className="relative flex justify-center">
            <div
              className="relative inline-block"
              style={{ cursor: 'none' }}
            >
              <canvas
                ref={mask.canvasRef}
                style={{
                  width: mask.displaySize.width,
                  height: mask.displaySize.height,
                  maxWidth: '100%',
                }}
                className="rounded-lg border border-border-primary"
              />
              {/* Custom brush cursor */}
              {mask.cursorPos && !mask.isDrawing && (
                <div
                  className="pointer-events-none absolute border-2 border-accent-magenta rounded-full"
                  style={{
                    width: mask.brushSize,
                    height: mask.brushSize,
                    left: mask.cursorPos.x * (mask.displaySize.width / (mask.canvasRef.current?.width || 1)) - mask.brushSize / 2,
                    top: mask.cursorPos.y * (mask.displaySize.height / (mask.canvasRef.current?.height || 1)) - mask.brushSize / 2,
                  }}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleInpaint}
              className="px-6 py-2.5 rounded-lg bg-accent-yellow text-bg-primary font-semibold text-sm hover:brightness-110 transition"
            >
              Очистить изображение
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Загрузить другое
            </button>
          </div>
        </div>
      )}

      {/* PROCESSING: Progress */}
      {status === 'processing' && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-10 h-10 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">{progress}</p>
        </div>
      )}

      {/* ERROR */}
      {status === 'error' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-accent-magenta/10 border border-accent-magenta/20 px-4 py-3">
            <p className="text-sm text-accent-magenta">{errorMsg}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (originalUrl) {
                  setStatus('editing');
                  setErrorMsg('');
                } else {
                  handleReset();
                }
              }}
              className="px-4 py-2 rounded-lg bg-accent-yellow text-bg-primary font-semibold text-sm hover:brightness-110 transition"
            >
              Попробовать снова
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Загрузить другое
            </button>
          </div>
        </div>
      )}

      {/* DONE: Before/after */}
      {status === 'done' && originalUrl && resultUrl && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original */}
            <div className="rounded-xl bg-bg-card p-3">
              <p className="text-xs text-text-secondary mb-2">Оригинал</p>
              <img
                src={originalUrl}
                alt="Original"
                className="w-full rounded-lg object-contain max-h-[500px]"
              />
            </div>
            {/* Result */}
            <div className="rounded-xl bg-bg-card p-3">
              <p className="text-xs text-text-secondary mb-2">Результат</p>
              <img
                src={resultUrl}
                alt="Cleaned"
                className="w-full rounded-lg object-contain max-h-[500px]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {onCleaned && (
              <button
                onClick={handleUse}
                className="px-6 py-2.5 rounded-lg bg-accent-yellow text-bg-primary font-semibold text-sm hover:brightness-110 transition"
              >
                Использовать
              </button>
            )}
            <button
              onClick={handleCleanMore}
              className="px-4 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan text-sm hover:bg-accent-cyan/30 transition"
            >
              Очистить ещё
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-bg-secondary text-text-primary text-sm hover:bg-bg-card transition"
            >
              Скачать PNG
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Загрузить другое
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
