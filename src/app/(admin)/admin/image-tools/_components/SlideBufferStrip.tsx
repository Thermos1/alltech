'use client';

import { useRef } from 'react';
import type { SlideBufferItem } from '../page';

type Props = {
  items: SlideBufferItem[];
  onAdd: (dataUrl: string, label: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
};

export default function SlideBufferStrip({ items, onAdd, onRemove, onToggle, onReorder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file, i) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onAdd(dataUrl, `Фото ${items.length + i + 1}`);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  }

  const includedCount = items.filter((item) => item.included).length;

  return (
    <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-text-primary">Буфер слайдов</h3>
          {items.length > 0 && (
            <span className="text-xs text-text-muted">
              {includedCount}/{items.length} включено
            </span>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs px-3 py-2 rounded-lg bg-bg-secondary border border-border-subtle text-accent-cyan hover:border-accent-cyan transition-colors min-h-[36px]"
        >
          + Загрузить фото
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {items.length === 0 ? (
        <p className="text-xs text-text-muted py-2">
          Сгенерируйте карточку или загрузите фото для добавления в карусель
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`shrink-0 w-20 rounded-lg border-2 overflow-hidden transition-all ${
                item.included
                  ? 'border-accent-cyan'
                  : 'border-border-subtle opacity-50'
              }`}
            >
              {/* Toggle include */}
              <button
                onClick={() => onToggle(item.id)}
                className="w-full h-6 flex items-center justify-center bg-bg-secondary text-xs transition-colors"
                title={item.included ? 'Исключить' : 'Включить'}
              >
                {item.included ? (
                  <span className="text-accent-cyan">&#10003;</span>
                ) : (
                  <span className="text-text-muted">&mdash;</span>
                )}
              </button>

              {/* Thumbnail */}
              <div className="aspect-[4/5] bg-bg-secondary flex items-center justify-center">
                <img
                  src={item.dataUrl}
                  alt={item.label}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between bg-bg-secondary px-1 py-0.5">
                <div className="flex gap-0.5">
                  <button
                    onClick={() => onReorder(item.id, 'up')}
                    disabled={idx === 0}
                    className="text-[10px] text-text-muted hover:text-text-primary disabled:opacity-20 min-w-[20px] min-h-[20px]"
                    title="Переместить влево"
                  >
                    &#8592;
                  </button>
                  <button
                    onClick={() => onReorder(item.id, 'down')}
                    disabled={idx === items.length - 1}
                    className="text-[10px] text-text-muted hover:text-text-primary disabled:opacity-20 min-w-[20px] min-h-[20px]"
                    title="Переместить вправо"
                  >
                    &#8594;
                  </button>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-[10px] text-text-muted hover:text-accent-magenta min-w-[20px] min-h-[20px]"
                  title="Удалить"
                >
                  &times;
                </button>
              </div>

              {/* Label */}
              <div className="px-1 py-0.5 bg-bg-secondary border-t border-border-subtle">
                <p className="text-[9px] text-text-muted truncate text-center">
                  {item.source === 'card' ? 'Карт.' : 'Фото'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
