'use client';

import { useState, useRef, useCallback } from 'react';
import { removeBackground, type Config } from '@imgly/background-removal';

type RecognizedProduct = {
  brand?: string;
  viscosity?: string;
  base_type?: 'synthetic' | 'semi_synthetic' | 'mineral';
  api_spec?: string;
  acea_spec?: string;
  approvals?: string;
  oem_number?: string;
  volume?: string;
  description?: string;
};

const BASE_TYPE_LABELS: Record<string, string> = {
  synthetic: 'Синтетика',
  semi_synthetic: 'Полусинтетика',
  mineral: 'Минеральное',
};

export default function ImageToolsPage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  const [bgStatus, setBgStatus] = useState<'idle' | 'loading' | 'processing' | 'done' | 'error'>('idle');
  const [bgProgress, setBgProgress] = useState('');
  const [recognizeStatus, setRecognizeStatus] = useState<'idle' | 'loading' | 'done' | 'error' | 'no-key'>('idle');
  const [recognized, setRecognized] = useState<RecognizedProduct | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    // Reset state
    setProcessedUrl(null);
    setProcessedBlob(null);
    setRecognized(null);
    setBgStatus('loading');
    setRecognizeStatus('idle');
    setBgProgress('Подготовка...');

    // Show original
    const origUrl = URL.createObjectURL(file);
    setOriginalUrl(origUrl);

    // Start background removal (browser-side)
    const bgPromise = (async () => {
      try {
        setBgStatus('processing');
        const config: Config = {
          model: 'isnet_fp16',
          output: { format: 'image/png', quality: 1 },
          progress: (key: string, current: number, total: number) => {
            const pct = total > 0 ? Math.round((current / total) * 100) : 0;
            if (key.includes('fetch')) {
              setBgProgress(`Загружаю модель... ${pct}%`);
            } else if (key.includes('inference') || key.includes('compute')) {
              setBgProgress(`Удаляю фон... ${pct}%`);
            } else {
              setBgProgress(`Обработка... ${pct}%`);
            }
          },
        };

        const blob = await removeBackground(file, config);
        const url = URL.createObjectURL(blob);
        setProcessedUrl(url);
        setProcessedBlob(blob);
        setBgStatus('done');
        setBgProgress('');
      } catch (err) {
        console.error('Background removal error:', err);
        setBgStatus('error');
        setBgProgress('Ошибка удаления фона');
      }
    })();

    // Start AI recognition (server-side) in parallel
    const recognizePromise = (async () => {
      try {
        setRecognizeStatus('loading');

        // Convert file to base64
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/admin/products/recognize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 500 && !data.recognized) {
            setRecognizeStatus('no-key');
            return;
          }
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        if (data.recognized) {
          setRecognized(data.recognized);
          setRecognizeStatus('done');
        } else {
          setRecognizeStatus('no-key');
        }
      } catch (err) {
        console.error('Recognition error:', err);
        setRecognizeStatus('error');
      }
    })();

    await Promise.allSettled([bgPromise, recognizePromise]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  function downloadPng() {
    if (!processedBlob) return;
    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-no-bg.png';
    a.click();
    URL.revokeObjectURL(url);
  }

  function createProduct() {
    // Store processed image and specs in sessionStorage for ProductForm to pick up
    const data: Record<string, string> = {};

    if (processedBlob) {
      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        data.imageDataUrl = reader.result as string;
        if (recognized) {
          Object.entries(recognized).forEach(([k, v]) => {
            if (v) data[`spec_${k}`] = v;
          });
        }
        sessionStorage.setItem('image-tools-product', JSON.stringify(data));
        window.location.href = '/admin/products/new';
      };
      reader.readAsDataURL(processedBlob);
    } else if (recognized) {
      Object.entries(recognized).forEach(([k, v]) => {
        if (v) data[`spec_${k}`] = v;
      });
      sessionStorage.setItem('image-tools-product', JSON.stringify(data));
      window.location.href = '/admin/products/new';
    }
  }

  const isProcessing = bgStatus === 'loading' || bgStatus === 'processing';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display text-text-primary">
          Генератор карточек
        </h1>
      </div>

      {/* Upload zone */}
      {!originalUrl && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="w-full h-64 rounded-xl border-2 border-dashed border-border-subtle hover:border-accent-yellow transition-colors cursor-pointer flex flex-col items-center justify-center bg-bg-card"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted mb-3">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-text-secondary text-sm">Перетащите фото товара сюда</p>
          <p className="text-text-muted text-xs mt-1">или нажмите для выбора</p>
          <p className="text-text-muted text-xs mt-1">JPG / PNG</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Images comparison */}
      {originalUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original */}
          <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
            <div className="px-4 py-2 border-b border-border-subtle">
              <span className="text-sm text-text-muted">Оригинал</span>
            </div>
            <div className="aspect-square bg-white flex items-center justify-center p-4">
              <img
                src={originalUrl}
                alt="Original"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          {/* Result */}
          <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
            <div className="px-4 py-2 border-b border-border-subtle">
              <span className="text-sm text-text-muted">Результат (без фона)</span>
            </div>
            <div className="aspect-square bg-bg-secondary flex items-center justify-center p-4 relative">
              {processedUrl ? (
                <img
                  src={processedUrl}
                  alt="Processed"
                  className="max-h-full max-w-full object-contain"
                />
              ) : isProcessing ? (
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-accent-yellow text-sm animate-pulse">{bgProgress}</p>
                </div>
              ) : bgStatus === 'error' ? (
                <p className="text-accent-magenta text-sm">{bgProgress}</p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {originalUrl && (
        <div className="flex flex-wrap gap-3">
          {processedUrl && (
            <button
              onClick={downloadPng}
              className="rounded-lg px-5 py-2.5 text-sm font-medium bg-accent-cyan text-bg-primary hover:brightness-110 transition-all"
            >
              Скачать PNG
            </button>
          )}
          {(processedUrl || recognized) && (
            <button
              onClick={createProduct}
              className="rounded-lg px-5 py-2.5 text-sm font-medium bg-accent-yellow text-bg-primary hover:brightness-110 transition-all"
            >
              Создать товар
            </button>
          )}
          <button
            onClick={() => {
              setOriginalUrl(null);
              setProcessedUrl(null);
              setProcessedBlob(null);
              setRecognized(null);
              setBgStatus('idle');
              setRecognizeStatus('idle');
              setBgProgress('');
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="rounded-lg px-5 py-2.5 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Загрузить другое фото
          </button>
        </div>
      )}

      {/* Recognized specs */}
      {originalUrl && (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-text-primary font-medium">Распознанные характеристики</h2>
            {recognizeStatus === 'loading' && (
              <span className="text-xs text-accent-yellow animate-pulse">Анализирую...</span>
            )}
            {recognizeStatus === 'done' && (
              <span className="text-xs text-green-400">AI</span>
            )}
            {recognizeStatus === 'error' && (
              <span className="text-xs text-accent-magenta">Ошибка распознавания</span>
            )}
            {recognizeStatus === 'no-key' && (
              <span className="text-xs text-text-muted">ANTHROPIC_API_KEY не настроен</span>
            )}
          </div>

          {recognized ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recognized.brand && (
                <SpecField label="Бренд" value={recognized.brand} />
              )}
              {recognized.viscosity && (
                <SpecField label="Вязкость" value={recognized.viscosity} />
              )}
              {recognized.base_type && (
                <SpecField label="Тип" value={BASE_TYPE_LABELS[recognized.base_type] || recognized.base_type} />
              )}
              {recognized.api_spec && (
                <SpecField label="API" value={recognized.api_spec} />
              )}
              {recognized.acea_spec && (
                <SpecField label="ACEA" value={recognized.acea_spec} />
              )}
              {recognized.approvals && (
                <SpecField label="Допуски" value={recognized.approvals} />
              )}
              {recognized.oem_number && (
                <SpecField label="OEM-номер" value={recognized.oem_number} />
              )}
              {recognized.volume && (
                <SpecField label="Объём" value={recognized.volume} />
              )}
              {recognized.description && (
                <div className="sm:col-span-2">
                  <SpecField label="Описание" value={recognized.description} />
                </div>
              )}
            </div>
          ) : recognizeStatus === 'idle' || recognizeStatus === 'loading' ? (
            <p className="text-sm text-text-muted">
              {recognizeStatus === 'loading'
                ? 'Анализирую этикетку...'
                : 'Загрузите фото для распознавания'}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function SpecField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-text-muted block">{label}</span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}
