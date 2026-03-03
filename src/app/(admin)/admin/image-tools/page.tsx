'use client';

import { useState } from 'react';
import ImageCleaner from './_components/ImageCleaner';
import BackgroundRemover from './_components/BackgroundRemover';
import CardConstructor from './_components/CardConstructor';
import CarouselConstructor from './_components/CarouselConstructor';

type RecognizedProduct = {
  brand?: string;
  viscosity?: string;
  base_type?: string;
  api_spec?: string;
  acea_spec?: string;
  approvals?: string;
  volume?: string;
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
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-bg-card text-accent-yellow shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
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
          />
        )}
        {activeTab === 'carousel' && (
          <CarouselConstructor
            initialImage={processedImageBase64}
            initialData={recognizedData}
          />
        )}
      </div>
    </div>
  );
}
