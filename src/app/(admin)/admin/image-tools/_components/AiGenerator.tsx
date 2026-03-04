'use client';

import { useState, useRef, useCallback } from 'react';
import { ALL_STYLES, type CardStyleId, type ExportPlatform, type CardStyleColors } from '@/lib/card-templates';
import type { AiSlide, CarouselSlideType } from '@/lib/card-templates/carousel';
import type { SlideBufferItem } from '../page';
import StyleSelector from './StyleSelector';
import ColorEditor from './ColorEditor';
import PlatformSelector from './PlatformSelector';

type AiPlan = {
  slides: AiSlide[];
  style: CardStyleId;
  productData?: {
    name: string;
    brand?: string;
    subtitle?: string;
    specs?: { label: string; value: string }[];
  };
};

type UploadedImage = {
  id: string;
  dataUrl: string;
  label: string;
  source: 'upload' | 'buffer';
};

type Phase = 'input' | 'planning' | 'plan' | 'generating' | 'done';

type Props = {
  slideBuffer: SlideBufferItem[];
  onAddToBuffer: (dataUrl: string, label: string) => void;
};

const SLIDE_TYPE_LABELS: Record<CarouselSlideType, string> = {
  'cover': 'Обложка',
  'specs': 'Характеристики',
  'benefits': 'Преимущества',
  'compatibility': 'Совместимость',
  'volumes': 'Варианты и цены',
  'usage': 'Применение',
  'trust': 'Гарантия',
  'photo-only': 'Фото',
  'photo-text': 'Фото + текст',
  'text-only': 'Текст',
  'title': 'Заголовок',
  'list': 'Список',
};

const SLIDE_TYPE_ICONS: Record<CarouselSlideType, string> = {
  'cover': '🏷',
  'specs': '📋',
  'benefits': '✓',
  'compatibility': '🔗',
  'volumes': '💰',
  'usage': '💡',
  'trust': '🛡',
  'photo-only': '📷',
  'photo-text': '📷',
  'text-only': '📝',
  'title': '🔤',
  'list': '📃',
};

const PLACEHOLDER_HINT = `Опишите что хотите создать. Примеры:

• "Карусель 10 слайдов для WB: масло ROLF GT 5W-40, синтетика API SN/CF. Первые 2 слайда — фото, потом преимущества, совместимые авто, применение, гарантия"

• "5 слайдов для LinkedIn: тема — почему AI меняет B2B продажи. Первый слайд — заголовок с фото, остальные — тезисы с аргументами"

• "Одна карточка товара: фильтр масляный MANN W 914/2"

Укажите количество слайдов, их содержание и стиль.`;

export default function AiGenerator({ slideBuffer, onAddToBuffer }: Props) {
  // Phase
  const [phase, setPhase] = useState<Phase>('input');

  // Step 1: Input
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [style, setStyle] = useState<CardStyleId>('premium-dark');
  const [platform, setPlatform] = useState<ExportPlatform>('instagram');
  const [customColors, setCustomColors] = useState<Partial<CardStyleColors>>({});

  // Step 2: Plan
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [editableSlides, setEditableSlides] = useState<AiSlide[]>([]);

  // Step 3: Generated
  const [generatedImages, setGeneratedImages] = useState<{ slideNumber: number; dataUrl: string }[]>([]);

  // Errors
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Image management ---
  const handleImageUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            dataUrl,
            label: file.name.replace(/\.[^.]+$/, ''),
            source: 'upload',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const addFromBuffer = useCallback((item: SlideBufferItem) => {
    // Avoid duplicates
    setImages((prev) => {
      if (prev.some((img) => img.id === item.id)) return prev;
      return [
        ...prev,
        {
          id: item.id,
          dataUrl: item.dataUrl,
          label: item.label,
          source: 'buffer' as const,
        },
      ];
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  // --- AI Plan ---
  async function handleCreatePlan() {
    if (!prompt.trim()) {
      setError('Опишите что хотите создать');
      return;
    }
    setPhase('planning');
    setError('');

    try {
      const res = await fetch('/api/admin/cards/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageCount: images.length,
          style,
          platform,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 503) {
          setError('ANTHROPIC_API_KEY не настроен. Добавьте ключ в переменные окружения для работы AI.');
          setPhase('input');
          return;
        }
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data: AiPlan = await res.json();
      setPlan(data);
      setEditableSlides([...data.slides]);
      if (data.style && data.style !== style) {
        setStyle(data.style);
        setCustomColors({});
      }
      setPhase('plan');
    } catch (err) {
      console.error('AI plan error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка AI-генерации');
      setPhase('input');
    }
  }

  // --- Slide editing ---
  function updateSlide(index: number, updates: Partial<AiSlide>) {
    setEditableSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  }

  function removeSlide(index: number) {
    setEditableSlides((prev) => prev.filter((_, i) => i !== index));
  }

  function addSlide() {
    setEditableSlides((prev) => [
      ...prev,
      { type: 'text-only' as CarouselSlideType, heading: '', body: '' },
    ]);
  }

  function moveSlide(index: number, direction: 'up' | 'down') {
    setEditableSlides((prev) => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
      return next;
    });
  }

  // --- Generate ---
  async function handleGenerate(format: 'png' | 'pdf') {
    if (editableSlides.length === 0) {
      setError('Нет слайдов для генерации');
      return;
    }
    setPhase('generating');
    setError('');

    try {
      const res = await fetch('/api/admin/cards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'ai-sequence',
          style,
          platform,
          enabledElements: [],
          badges: [],
          productData: plan?.productData || { name: 'AI Generated', specs: [] },
          slides: editableSlides,
          images: images.map((img) => img.dataUrl),
          outputFormat: format,
          customColors: Object.keys(customColors).length > 0 ? customColors : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      if (format === 'pdf') {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-carousel-${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        setPhase('plan');
      } else {
        const data = await res.json();
        setGeneratedImages(data.images);
        setPhase('done');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка генерации');
      setPhase('plan');
    }
  }

  function downloadSlide(img: { slideNumber: number; dataUrl: string }) {
    const a = document.createElement('a');
    a.href = img.dataUrl;
    a.download = `ai-slide-${img.slideNumber}.png`;
    a.click();
  }

  function downloadAllSlides() {
    generatedImages.forEach((img, i) => {
      setTimeout(() => downloadSlide(img), i * 200);
    });
  }

  function addAllToBuffer() {
    generatedImages.forEach((img) => {
      onAddToBuffer(img.dataUrl, `AI Слайд ${img.slideNumber}`);
    });
  }

  function handleBackToInput() {
    setPhase('input');
    setPlan(null);
    setEditableSlides([]);
    setGeneratedImages([]);
    setError('');
  }

  function handleBackToPlan() {
    setPhase('plan');
    setGeneratedImages([]);
    setError('');
  }

  // --- RENDER ---
  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-accent-magenta/10 border border-accent-magenta/20 px-4 py-3">
          <span className="text-sm text-accent-magenta">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-accent-magenta/60 hover:text-accent-magenta transition-colors">&times;</button>
        </div>
      )}

      {/* PHASE: INPUT */}
      {phase === 'input' && (
        <div className="space-y-6">
          {/* Prompt textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Что создать?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={PLACEHOLDER_HINT}
              rows={6}
              className="w-full rounded-xl bg-bg-secondary border border-border-subtle px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent-yellow focus:outline-none resize-none"
            />
          </div>

          {/* Image gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary">
                Фотографии ({images.length})
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-subtle text-text-secondary hover:border-accent-cyan hover:text-accent-cyan transition-colors"
              >
                + Загрузить
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleImageUpload(e.target.files);
                e.target.value = '';
              }}
            />

            {/* Drop zone when no images */}
            {images.length === 0 && (
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files.length) handleImageUpload(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="w-full h-24 rounded-xl border-2 border-dashed border-border-subtle hover:border-accent-cyan/50 transition-colors cursor-pointer flex items-center justify-center bg-bg-card"
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="text-xs text-text-muted">Перетащите фото или нажмите для выбора (необязательно)</p>
              </div>
            )}

            {/* Image thumbnails */}
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.dataUrl}
                      alt={img.label}
                      className="w-16 h-16 rounded-lg object-cover border border-border-subtle"
                    />
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white text-center py-0.5 rounded-b-lg">
                      {i + 1}
                    </span>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-magenta text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {/* Add more button inline */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-border-subtle hover:border-accent-cyan/50 flex items-center justify-center text-text-muted hover:text-accent-cyan transition-colors"
                >
                  <span className="text-xl">+</span>
                </button>
              </div>
            )}

            {/* Add from buffer */}
            {slideBuffer.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-text-muted">Из буфера:</span>
                <div className="flex gap-2 flex-wrap">
                  {slideBuffer.map((item) => {
                    const isAdded = images.some((img) => img.id === item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => !isAdded && addFromBuffer(item)}
                        disabled={isAdded}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          isAdded
                            ? 'border-accent-cyan opacity-50 cursor-default'
                            : 'border-border-subtle hover:border-accent-cyan cursor-pointer'
                        }`}
                      >
                        <img src={item.dataUrl} alt={item.label} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Style + Platform */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <StyleSelector value={style} onChange={(s) => { setStyle(s); setCustomColors({}); }} />
              <ColorEditor baseColors={ALL_STYLES[style].colors} customColors={customColors} onChange={setCustomColors} />
            </div>
            <PlatformSelector value={platform} onChange={setPlatform} />
          </div>

          {/* Create plan button */}
          <button
            onClick={handleCreatePlan}
            disabled={!prompt.trim()}
            className="w-full rounded-xl py-4 text-base font-semibold bg-accent-yellow text-bg-primary hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Создать план с AI
          </button>
        </div>
      )}

      {/* PHASE: PLANNING (loading) */}
      {phase === 'planning' && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-10 h-10 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">AI составляет план слайдов...</p>
          <p className="text-xs text-text-muted">Обычно 5–15 секунд</p>
        </div>
      )}

      {/* PHASE: PLAN (editable) */}
      {phase === 'plan' && (
        <div className="space-y-6">
          {/* Plan header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-text-primary">
                AI составил план: {editableSlides.length} слайдов
              </h2>
              {plan?.productData?.name && (
                <p className="text-sm text-text-secondary mt-0.5">{plan.productData.name}</p>
              )}
            </div>
            <button
              onClick={handleBackToInput}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Изменить запрос
            </button>
          </div>

          {/* Editable slides list */}
          <div className="space-y-2">
            {editableSlides.map((slide, i) => (
              <div
                key={i}
                className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-3"
              >
                {/* Slide header */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted w-6 text-right shrink-0">{i + 1}.</span>
                  <span className="text-sm shrink-0">{SLIDE_TYPE_ICONS[slide.type] || '📄'}</span>

                  {/* Type selector */}
                  <select
                    value={slide.type}
                    onChange={(e) => updateSlide(i, { type: e.target.value as CarouselSlideType })}
                    className="rounded-lg bg-bg-secondary border border-border-subtle px-2 py-1.5 text-sm text-text-primary focus:border-accent-yellow focus:outline-none"
                  >
                    {Object.entries(SLIDE_TYPE_LABELS).map(([type, label]) => (
                      <option key={type} value={type}>{label}</option>
                    ))}
                  </select>

                  {/* Image index (for photo types) */}
                  {['cover', 'photo-only', 'photo-text'].includes(slide.type) && images.length > 0 && (
                    <select
                      value={slide.imageIndex ?? 0}
                      onChange={(e) => updateSlide(i, { imageIndex: Number(e.target.value) })}
                      className="rounded-lg bg-bg-secondary border border-border-subtle px-2 py-1.5 text-xs text-text-primary focus:border-accent-yellow focus:outline-none"
                    >
                      {images.map((img, imgIdx) => (
                        <option key={imgIdx} value={imgIdx}>Фото {imgIdx + 1}: {img.label.slice(0, 20)}</option>
                      ))}
                    </select>
                  )}

                  <div className="flex-1" />

                  {/* Reorder */}
                  <button
                    onClick={() => moveSlide(i, 'up')}
                    disabled={i === 0}
                    className="px-1.5 py-1 text-text-muted hover:text-text-primary disabled:opacity-20 transition-colors"
                    title="Вверх"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSlide(i, 'down')}
                    disabled={i === editableSlides.length - 1}
                    className="px-1.5 py-1 text-text-muted hover:text-text-primary disabled:opacity-20 transition-colors"
                    title="Вниз"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeSlide(i)}
                    className="px-1.5 py-1 text-text-muted hover:text-accent-magenta transition-colors"
                    title="Удалить"
                  >
                    &times;
                  </button>
                </div>

                {/* Content editors based on type */}
                {['title', 'text-only', 'photo-text', 'cover'].includes(slide.type) && (
                  <div className="space-y-2 pl-9">
                    <input
                      type="text"
                      value={slide.heading || ''}
                      onChange={(e) => updateSlide(i, { heading: e.target.value })}
                      placeholder="Заголовок"
                      className="w-full rounded-lg bg-bg-secondary border border-border-subtle px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
                    />
                    {['text-only', 'photo-text'].includes(slide.type) && (
                      <textarea
                        value={slide.body || ''}
                        onChange={(e) => updateSlide(i, { body: e.target.value })}
                        placeholder="Текст"
                        rows={2}
                        className="w-full rounded-lg bg-bg-secondary border border-border-subtle px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none resize-none"
                      />
                    )}
                  </div>
                )}

                {/* List/items editors */}
                {['benefits', 'compatibility', 'usage', 'trust', 'specs', 'list'].includes(slide.type) && (
                  <div className="space-y-1.5 pl-9">
                    {slide.heading !== undefined && (
                      <input
                        type="text"
                        value={slide.heading || ''}
                        onChange={(e) => updateSlide(i, { heading: e.target.value })}
                        placeholder="Заголовок"
                        className="w-full rounded-lg bg-bg-secondary border border-border-subtle px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
                      />
                    )}
                    {(slide.items || []).map((item, itemIdx) => (
                      <div key={itemIdx} className="flex gap-1.5">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...(slide.items || [])];
                            newItems[itemIdx] = e.target.value;
                            updateSlide(i, { items: newItems });
                          }}
                          placeholder={`Пункт ${itemIdx + 1}`}
                          className="flex-1 rounded-lg bg-bg-secondary border border-border-subtle px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const newItems = (slide.items || []).filter((_, j) => j !== itemIdx);
                            updateSlide(i, { items: newItems });
                          }}
                          className="px-2 text-text-muted hover:text-accent-magenta transition-colors"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => updateSlide(i, { items: [...(slide.items || []), ''] })}
                      className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                    >
                      + Добавить пункт
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add slide button */}
            <button
              onClick={addSlide}
              className="w-full rounded-xl border-2 border-dashed border-border-subtle hover:border-accent-cyan/50 py-3 text-sm text-text-muted hover:text-accent-cyan transition-colors"
            >
              + Добавить слайд
            </button>
          </div>

          {/* Style + Platform (compact) */}
          <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-3">
            <StyleSelector value={style} onChange={(s) => { setStyle(s); setCustomColors({}); }} />
            <ColorEditor baseColors={ALL_STYLES[style].colors} customColors={customColors} onChange={setCustomColors} />
            <PlatformSelector value={platform} onChange={setPlatform} />
          </div>

          {/* Generate buttons */}
          <div className="space-y-2">
            <button
              onClick={() => handleGenerate('png')}
              disabled={editableSlides.length === 0}
              className="w-full rounded-xl py-4 text-base font-semibold bg-accent-yellow text-bg-primary hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              Сгенерировать {editableSlides.length} слайдов
            </button>
            <button
              onClick={() => handleGenerate('pdf')}
              disabled={editableSlides.length === 0}
              className="w-full rounded-xl py-3 text-sm font-medium bg-bg-card border border-border-subtle text-text-secondary hover:border-accent-cyan hover:text-accent-cyan disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Скачать PDF (LinkedIn)
            </button>
          </div>
        </div>
      )}

      {/* PHASE: GENERATING */}
      {phase === 'generating' && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-10 h-10 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Генерирую {editableSlides.length} слайдов...</p>
          <p className="text-xs text-text-muted">Может занять 10–30 секунд</p>
        </div>
      )}

      {/* PHASE: DONE */}
      {phase === 'done' && generatedImages.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-text-primary">
              Готово: {generatedImages.length} слайдов
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleBackToPlan}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Редактировать план
              </button>
              <button
                onClick={handleBackToInput}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Новый запрос
              </button>
            </div>
          </div>

          {/* Generated slide grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {generatedImages.map((img) => (
              <div key={img.slideNumber} className="space-y-1">
                <div className="rounded-lg overflow-hidden border border-border-subtle">
                  <img
                    src={img.dataUrl}
                    alt={`Слайд ${img.slideNumber}`}
                    className="w-full aspect-[4/5] object-cover"
                  />
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] text-text-muted">{img.slideNumber}</span>
                  <button
                    onClick={() => downloadSlide(img)}
                    className="text-[10px] text-text-muted hover:text-accent-cyan transition-colors"
                  >
                    Скачать
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={downloadAllSlides}
              className="px-5 py-2.5 rounded-lg bg-accent-yellow text-bg-primary font-semibold text-sm hover:brightness-110 transition"
            >
              Скачать все PNG
            </button>
            <button
              onClick={() => handleGenerate('pdf')}
              className="px-5 py-2.5 rounded-lg bg-bg-card border border-border-subtle text-text-secondary text-sm hover:border-accent-cyan hover:text-accent-cyan transition"
            >
              Скачать PDF
            </button>
            <button
              onClick={addAllToBuffer}
              className="px-5 py-2.5 rounded-lg bg-accent-cyan/20 text-accent-cyan text-sm hover:bg-accent-cyan/30 transition"
            >
              Добавить все в буфер
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
