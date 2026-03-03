'use client';

import { useState, useRef, useCallback } from 'react';
import { removeBackground, type Config } from '@imgly/background-removal';
import { CAROUSEL_SLIDES, DEFAULT_BENEFITS, DEFAULT_COMPATIBILITY, DEFAULT_CERTIFICATIONS, type CarouselSlideConfig } from '@/lib/card-templates/carousel';
import { type CardStyleId, type ExportPlatform, type ProductCardData } from '@/lib/card-templates';
import StyleSelector from './StyleSelector';
import PlatformSelector from './PlatformSelector';
import CarouselSlideEditor from './CarouselSlideEditor';

type RecognizedProduct = {
  brand?: string;
  viscosity?: string;
  base_type?: string;
  api_spec?: string;
  acea_spec?: string;
  approvals?: string;
  volume?: string;
};

type Props = {
  initialImage?: string | null;
  initialData?: RecognizedProduct | null;
};

export default function CarouselConstructor({ initialImage, initialData }: Props) {
  // Style & platform
  const [style, setStyle] = useState<CardStyleId>('minimalist');
  const [platform, setPlatform] = useState<ExportPlatform>('instagram');
  const [activeSlide, setActiveSlide] = useState(0);

  // Product data
  const [productData, setProductData] = useState<ProductCardData>({
    name: '',
    brand: initialData?.brand || '',
    viscosity: initialData?.viscosity || '',
    baseType: initialData?.base_type || '',
    apiSpec: initialData?.api_spec || '',
    aceaSpec: initialData?.acea_spec || '',
    approvals: initialData?.approvals || '',
    volume: initialData?.volume || '',
  });

  // Image
  const [productImageBase64, setProductImageBase64] = useState<string | null>(initialImage || null);
  const [bgStatus, setBgStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [bgProgress, setBgProgress] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Carousel-specific data
  const [benefits, setBenefits] = useState<string[]>([...DEFAULT_BENEFITS]);
  const [compatibility, setCompatibility] = useState<string[]>([...DEFAULT_COMPATIBILITY]);
  const [volumes, setVolumes] = useState<{ volume: string; price: number }[]>([]);
  const [changeInterval, setChangeInterval] = useState('10 000 км / 12 мес');
  const [storageConditions, setStorageConditions] = useState('от -30°C до +50°C');
  const [certifications, setCertifications] = useState<string[]>([...DEFAULT_CERTIFICATIONS]);

  // Generation
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ slideNumber: number; dataUrl: string }[]>([]);
  const [error, setError] = useState('');

  const handleImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setBgStatus('processing');
    setBgProgress('Подготовка...');

    try {
      const config: Config = {
        model: 'isnet_fp16',
        output: { format: 'image/png', quality: 1 },
        progress: (key: string, current: number, total: number) => {
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          if (key.includes('fetch')) setBgProgress(`Загружаю модель... ${pct}%`);
          else if (key.includes('inference') || key.includes('compute')) setBgProgress(`Удаляю фон... ${pct}%`);
          else setBgProgress(`Обработка... ${pct}%`);
        },
      };

      const blob = await removeBackground(file, config);
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      setProductImageBase64(base64);
      setBgStatus('done');
      setBgProgress('');
    } catch (err) {
      console.error('BG removal error:', err);
      setBgStatus('error');
      setBgProgress('Ошибка удаления фона');
    }
  }, []);

  function updateField(field: keyof ProductCardData, value: string | number) {
    setProductData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerate(format: 'png' | 'pdf') {
    if (!productImageBase64 || !productData.name) {
      setError('Загрузите фото и введите название');
      return;
    }
    setGenerating(true);
    setError('');
    setGeneratedImages([]);

    try {
      const res = await fetch('/api/admin/cards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'carousel',
          style,
          platform,
          enabledElements: ['productName', 'price', 'brandName', 'viscosity', 'apiSpec', 'aceaSpec', 'baseType', 'watermark', 'slideNumber'],
          badges: [],
          productData,
          productImageBase64,
          carouselData: {
            benefits,
            compatibility,
            volumes,
            changeInterval,
            storageConditions,
            certifications,
          },
          outputFormat: format,
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
        a.download = `carousel-${productData.name.slice(0, 30)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        setGeneratedImages(data.images);
      }
    } catch (err) {
      console.error('Carousel generation failed:', err);
      setError(err instanceof Error ? err.message : 'Ошибка генерации');
    } finally {
      setGenerating(false);
    }
  }

  function downloadSlide(img: { slideNumber: number; dataUrl: string }) {
    const a = document.createElement('a');
    a.href = img.dataUrl;
    a.download = `slide-${img.slideNumber}.png`;
    a.click();
  }

  function downloadAllSlides() {
    generatedImages.forEach((img, i) => {
      setTimeout(() => downloadSlide(img), i * 200);
    });
  }

  const currentSlide = CAROUSEL_SLIDES[activeSlide];

  return (
    <div className="space-y-6">
      {/* Slide tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CAROUSEL_SLIDES.map((slide, i) => (
          <button
            key={slide.type}
            onClick={() => setActiveSlide(i)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm transition-all border ${
              activeSlide === i
                ? 'border-accent-yellow bg-accent-yellow/10 text-accent-yellow'
                : 'border-border-subtle text-text-secondary hover:border-text-muted'
            }`}
          >
            <span className="text-xs opacity-60 mr-1">{slide.slideNumber}.</span>
            {slide.title || 'Обложка'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Left: Preview + generated */}
        <div className="space-y-4">
          {/* Slide preview placeholder */}
          <div className="rounded-xl border border-border-subtle overflow-hidden">
            <div className="px-4 py-2 border-b border-border-subtle flex items-center justify-between">
              <span className="text-xs text-text-muted">
                Слайд {currentSlide.slideNumber}: {currentSlide.title || 'Обложка'}
              </span>
            </div>
            <div className="aspect-[4/5] bg-bg-secondary flex items-center justify-center">
              {generatedImages[activeSlide] ? (
                <img
                  src={generatedImages[activeSlide].dataUrl}
                  alt={`Slide ${currentSlide.slideNumber}`}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-text-muted">
                  <p className="text-sm">Превью после генерации</p>
                  <p className="text-xs mt-1 opacity-50">Нажмите "Сгенерировать" для создания слайдов</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload image */}
          {!productImageBase64 && (
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleImageFile(file);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-border-subtle hover:border-accent-yellow transition-colors cursor-pointer flex items-center justify-center bg-bg-card"
            >
              <p className="text-sm text-text-muted">Перетащите фото товара или нажмите</p>
            </div>
          )}

          {bgStatus === 'processing' && (
            <div className="flex items-center gap-2 text-sm text-accent-yellow">
              <div className="w-4 h-4 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
              {bgProgress}
            </div>
          )}

          {productImageBase64 && (
            <button
              onClick={() => { setProductImageBase64(null); setBgStatus('idle'); }}
              className="text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              Загрузить другое фото
            </button>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageFile(file);
            }}
          />

          {/* Generated slide thumbnails */}
          {generatedImages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary font-medium">Готовые слайды</span>
                <button
                  onClick={downloadAllSlides}
                  className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                >
                  Скачать все PNG
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {generatedImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveSlide(i); downloadSlide(img); }}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${
                      activeSlide === i ? 'border-accent-yellow' : 'border-border-subtle hover:border-text-muted'
                    }`}
                  >
                    <img src={img.dataUrl} alt={`Slide ${i + 1}`} className="w-full aspect-[4/5] object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="space-y-5">
          <StyleSelector value={style} onChange={setStyle} />
          <PlatformSelector value={platform} onChange={setPlatform} />

          {/* Product data */}
          <div className="space-y-2">
            <label className="text-xs text-text-muted uppercase tracking-wider">Данные товара</label>
            <input
              type="text"
              value={productData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Название товара *"
              className="w-full rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={productData.brand || ''} onChange={(e) => updateField('brand', e.target.value)} placeholder="Бренд" className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none" />
              <input type="text" value={productData.viscosity || ''} onChange={(e) => updateField('viscosity', e.target.value)} placeholder="Вязкость" className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={productData.apiSpec || ''} onChange={(e) => updateField('apiSpec', e.target.value)} placeholder="API" className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none" />
              <input type="text" value={productData.aceaSpec || ''} onChange={(e) => updateField('aceaSpec', e.target.value)} placeholder="ACEA" className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none" />
            </div>
          </div>

          {/* Slide-specific editor */}
          <div className="rounded-xl bg-bg-card border border-border-subtle p-4">
            <CarouselSlideEditor
              slideType={currentSlide.type}
              slideTitle={currentSlide.title}
              benefits={benefits}
              onBenefitsChange={setBenefits}
              compatibility={compatibility}
              onCompatibilityChange={setCompatibility}
              volumes={volumes}
              onVolumesChange={setVolumes}
              changeInterval={changeInterval}
              onChangeIntervalChange={setChangeInterval}
              storageConditions={storageConditions}
              onStorageConditionsChange={setStorageConditions}
              certifications={certifications}
              onCertificationsChange={setCertifications}
            />
          </div>

          {/* Generate buttons */}
          <div className="space-y-2">
            <button
              onClick={() => handleGenerate('png')}
              disabled={generating || !productData.name || !productImageBase64}
              className="w-full rounded-lg py-3 text-sm font-medium bg-accent-yellow text-bg-primary hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                  Генерирую 7 слайдов...
                </>
              ) : (
                'Сгенерировать карусель'
              )}
            </button>
            <button
              onClick={() => handleGenerate('pdf')}
              disabled={generating || !productData.name || !productImageBase64}
              className="w-full rounded-lg py-2.5 text-sm font-medium bg-bg-card border border-border-subtle text-text-secondary hover:border-accent-cyan hover:text-accent-cyan disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Скачать PDF (LinkedIn)
            </button>
          </div>

          {error && <p className="text-sm text-accent-magenta">{error}</p>}
        </div>
      </div>
    </div>
  );
}
