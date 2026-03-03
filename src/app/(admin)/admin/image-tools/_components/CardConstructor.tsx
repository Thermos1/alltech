'use client';

import { useState, useRef, useCallback } from 'react';
import { removeBackground, type Config } from '@imgly/background-removal';
import { DEFAULT_ELEMENTS, type CardStyleId, type CardElement, type BadgeConfig, type ExportPlatform, type ProductCardData } from '@/lib/card-templates';
import StyleSelector from './StyleSelector';
import ElementToggle from './ElementToggle';
import BadgeEditor from './BadgeEditor';
import PlatformSelector from './PlatformSelector';
import CardPreview from './CardPreview';

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

export default function CardConstructor({ initialImage, initialData }: Props) {
  // Style & platform
  const [style, setStyle] = useState<CardStyleId>('minimalist');
  const [platform, setPlatform] = useState<ExportPlatform>('wb-ozon');
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [enabledElements, setEnabledElements] = useState<CardElement[]>(DEFAULT_ELEMENTS);
  const [badges, setBadges] = useState<BadgeConfig[]>([]);

  // Product data (pre-filled from AI recognition)
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

  // Generation
  const [generating, setGenerating] = useState(false);
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

  async function handleGenerate() {
    if (!productImageBase64 || !productData.name) {
      setError('Загрузите фото и введите название');
      return;
    }
    setGenerating(true);
    setError('');

    try {
      const outputFormat = platform === 'wb-ozon' ? 'jpg' : 'png';
      const res = await fetch('/api/admin/cards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'card',
          style,
          platform,
          customWidth: platform === 'custom' ? customWidth : undefined,
          customHeight: platform === 'custom' ? customHeight : undefined,
          enabledElements,
          badges,
          productData,
          productImageBase64,
          outputFormat,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `card-${productData.name.slice(0, 30)}-${platform}.${outputFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Ошибка генерации');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      {/* Left: Preview */}
      <div className="space-y-4">
        <CardPreview
          style={style}
          platform={platform}
          customWidth={customWidth}
          customHeight={customHeight}
          enabledElements={enabledElements}
          badges={badges}
          productData={productData}
          productImageBase64={productImageBase64}
        />

        {/* Upload image if not loaded */}
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
            <p className="text-sm text-text-muted">Перетащите фото или нажмите для выбора</p>
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
            onClick={() => {
              setProductImageBase64(null);
              setBgStatus('idle');
              if (inputRef.current) inputRef.current.value = '';
            }}
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
      </div>

      {/* Right: Controls */}
      <div className="space-y-5">
        <StyleSelector value={style} onChange={setStyle} />

        <PlatformSelector
          value={platform}
          onChange={setPlatform}
          customWidth={customWidth}
          customHeight={customHeight}
          onCustomSize={(w, h) => { setCustomWidth(w); setCustomHeight(h); }}
        />

        <ElementToggle enabled={enabledElements} onChange={setEnabledElements} />

        <BadgeEditor badges={badges} onChange={setBadges} />

        {/* Product data */}
        <div className="space-y-2">
          <label className="text-xs text-text-muted uppercase tracking-wider">Данные товара</label>
          <div className="space-y-2">
            <input
              type="text"
              value={productData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Название товара *"
              className="w-full rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={productData.brand || ''}
                onChange={(e) => updateField('brand', e.target.value)}
                placeholder="Бренд"
                className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
              />
              <input
                type="text"
                value={productData.viscosity || ''}
                onChange={(e) => updateField('viscosity', e.target.value)}
                placeholder="Вязкость"
                className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={productData.apiSpec || ''}
                onChange={(e) => updateField('apiSpec', e.target.value)}
                placeholder="API"
                className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
              />
              <input
                type="text"
                value={productData.aceaSpec || ''}
                onChange={(e) => updateField('aceaSpec', e.target.value)}
                placeholder="ACEA"
                className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={productData.baseType || ''}
                onChange={(e) => updateField('baseType', e.target.value)}
                className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary focus:border-accent-yellow focus:outline-none"
              >
                <option value="">Тип базы</option>
                <option value="synthetic">Синтетика</option>
                <option value="semi_synthetic">Полусинтетика</option>
                <option value="mineral">Минеральное</option>
              </select>
              <input
                type="text"
                value={productData.volume || ''}
                onChange={(e) => updateField('volume', e.target.value)}
                placeholder="Объём"
                className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={productData.price || ''}
                onChange={(e) => updateField('price', Number(e.target.value))}
                placeholder="Цена ₽"
                className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
              />
              <input
                type="text"
                value={productData.approvals || ''}
                onChange={(e) => updateField('approvals', e.target.value)}
                placeholder="Допуски"
                className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !productData.name || !productImageBase64}
          className="w-full rounded-lg py-3 text-sm font-medium bg-accent-yellow text-bg-primary hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
              Генерирую...
            </>
          ) : (
            'Сгенерировать карточку'
          )}
        </button>

        {error && (
          <p className="text-sm text-accent-magenta">{error}</p>
        )}
      </div>
    </div>
  );
}
