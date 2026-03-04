'use client';

import { useState, useCallback } from 'react';
import type { ProductSpec } from '@/lib/card-templates';
import ImageCleaner from './_components/ImageCleaner';
import BackgroundRemover from './_components/BackgroundRemover';
import CardConstructor from './_components/CardConstructor';
import CarouselConstructor from './_components/CarouselConstructor';

type RecognizedProduct = {
  brand?: string;
  specs?: ProductSpec[];
  subtitle?: string;
};

export type SlideBufferItem = {
  id: string;
  dataUrl: string;
  source: 'card' | 'upload';
  label: string;
  included: boolean;
};

type Tab = 'cleanup' | 'bg-remove' | 'card' | 'carousel';

const TABS: { id: Tab; label: string }[] = [
  { id: 'cleanup', label: 'Очистка' },
  { id: 'bg-remove', label: 'Удаление фона' },
  { id: 'card', label: 'Карточка' },
  { id: 'carousel', label: 'Карусель' },
];

export default function ImageToolsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('cleanup');

  // Cleaned image from ImageCleaner → BackgroundRemover
  const [cleanedImageBase64, setCleanedImageBase64] = useState<string | null>(null);

  // Shared state from background remover → constructors
  const [processedImageBase64, setProcessedImageBase64] = useState<string | null>(null);
  const [recognizedData, setRecognizedData] = useState<RecognizedProduct | null>(null);

  // Slide buffer (session-level, shared between card → carousel)
  const [slideBuffer, setSlideBuffer] = useState<SlideBufferItem[]>([]);

  const addToBuffer = useCallback((dataUrl: string, label: string, source: 'card' | 'upload' = 'card') => {
    setSlideBuffer((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        dataUrl,
        source,
        label,
        included: true,
      },
    ]);
  }, []);

  const removeFromBuffer = useCallback((id: string) => {
    setSlideBuffer((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleSlide = useCallback((id: string) => {
    setSlideBuffer((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, included: !item.included } : item,
      ),
    );
  }, []);

  const reorderSlide = useCallback((id: string, direction: 'up' | 'down') => {
    setSlideBuffer((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
  }, []);

  const bufferCount = slideBuffer.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display text-text-primary">
          Генератор карточек
        </h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-bg-secondary p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all relative ${
              activeTab === tab.id
                ? 'bg-bg-card text-accent-yellow shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
            {tab.id === 'carousel' && bufferCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-accent-cyan text-bg-primary">
                {bufferCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Hint: cleanup done */}
      {cleanedImageBase64 && activeTab === 'cleanup' && (
        <div className="flex items-center gap-3 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 px-4 py-3">
          <span className="text-sm text-accent-yellow">
            Изображение очищено! Переключитесь на «Удаление фона» для продолжения.
          </span>
        </div>
      )}

      {/* Hint: bg-remove done */}
      {processedImageBase64 && activeTab === 'bg-remove' && (
        <div className="flex items-center gap-3 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 px-4 py-3">
          <span className="text-sm text-accent-yellow">
            Фото обработано! Переключитесь на вкладку «Карточка» или «Карусель» для создания.
          </span>
        </div>
      )}

      {/* Tab content */}
      <div>
        {activeTab === 'cleanup' && (
          <ImageCleaner
            onCleaned={(imageBase64) => {
              setCleanedImageBase64(imageBase64);
            }}
          />
        )}
        {activeTab === 'bg-remove' && (
          <BackgroundRemover
            initialCleanedImage={cleanedImageBase64}
            onProcessed={(imageBase64, recognized) => {
              setProcessedImageBase64(imageBase64);
              setRecognizedData(recognized);
            }}
          />
        )}
        {activeTab === 'card' && (
          <CardConstructor
            initialImage={processedImageBase64}
            initialData={recognizedData}
            onCardGenerated={(dataUrl, label) => addToBuffer(dataUrl, label, 'card')}
          />
        )}
        {activeTab === 'carousel' && (
          <CarouselConstructor
            initialImage={processedImageBase64}
            initialData={recognizedData}
            slideBuffer={slideBuffer}
            onAddToBuffer={(dataUrl, label) => addToBuffer(dataUrl, label, 'upload')}
            onRemoveFromBuffer={removeFromBuffer}
            onToggleSlide={toggleSlide}
            onReorderSlide={reorderSlide}
          />
        )}
      </div>
    </div>
  );
}
