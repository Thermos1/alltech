'use client';

import { useState, useRef, useCallback } from 'react';
import { removeBackground, type Config } from '@imgly/background-removal';
import { ALL_STYLES, DEFAULT_ELEMENTS, SPEC_PRESETS, type CardStyleId, type CardElement, type BadgeConfig, type ExportPlatform, type ProductCardData, type ProductSpec, type CardStyleColors } from '@/lib/card-templates';
import StyleSelector from './StyleSelector';
import ElementToggle from './ElementToggle';
import BadgeEditor from './BadgeEditor';
import PlatformSelector from './PlatformSelector';
import CardPreview from './CardPreview';
import ColorEditor from './ColorEditor';

type RecognizedProduct = {
  brand?: string;
  specs?: ProductSpec[];
  subtitle?: string;
};

type Props = {
  initialImage?: string | null;
  initialData?: RecognizedProduct | null;
};

export default function CardConstructor({ initialImage, initialData }: Props) {
  const [style, setStyle] = useState<CardStyleId>('minimalist');
  const [platform, setPlatform] = useState<ExportPlatform>('wb-ozon');
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [enabledElements, setEnabledElements] = useState<CardElement[]>(DEFAULT_ELEMENTS);
  const [badges, setBadges] = useState<BadgeConfig[]>([]);
  const [imageScale, setImageScale] = useState(0.5);
  const [customColors, setCustomColors] = useState<Partial<CardStyleColors>>({});

  const [productData, setProductData] = useState<ProductCardData>({
    name: '',
    brand: initialData?.brand || '',
    subtitle: initialData?.subtitle || '',
    specs: initialData?.specs || [],
  });

  const [productImageBase64, setProductImageBase64] = useState<string | null>(initialImage || null);
  const [bgStatus, setBgStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [bgProgress, setBgProgress] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
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

  function updateField(field: keyof ProductCardData, value: string | number | ProductSpec[]) {
    setProductData((prev) => ({ ...prev, [field]: value }));
  }

  function updateSpec(index: number, field: 'label' | 'value', val: string) {
    const newSpecs = [...productData.specs];
    newSpecs[index] = { ...newSpecs[index], [field]: val };
    updateField('specs', newSpecs);
  }

  function removeSpec(index: number) {
    updateField('specs', productData.specs.filter((_, i) => i !== index));
  }

  function addSpec() {
    if (productData.specs.length >= 10) return;
    updateField('specs', [...productData.specs, { label: '', value: '' }]);
  }

  function applyPreset(presetKey: string) {
    const preset = SPEC_PRESETS[presetKey];
    if (preset) updateField('specs', preset.specs.map(s => ({ ...s })));
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
          imageScale,
          customColors: Object.keys(customColors).length > 0 ? customColors : undefined,
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
          imageScale={imageScale}
          customColors={customColors}
        />

        {!productImageBase64 && (
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleImageFile(file); }}
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
            onClick={() => { setProductImageBase64(null); setBgStatus('idle'); if (inputRef.current) inputRef.current.value = ''; }}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Загрузить другое фото
          </button>
        )}

        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageFile(file); }}
        />
      </div>

      {/* Right: Controls */}
      <div className="space-y-5">
        <StyleSelector value={style} onChange={(s) => { setStyle(s); setCustomColors({}); }} />
        <ColorEditor baseColors={ALL_STYLES[style].colors} customColors={customColors} onChange={setCustomColors} />

        <PlatformSelector
          value={platform}
          onChange={setPlatform}
          customWidth={customWidth}
          customHeight={customHeight}
          onCustomSize={(w, h) => { setCustomWidth(w); setCustomHeight(h); }}
        />

        {/* Image scale slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-text-muted uppercase tracking-wider">Размер фото</label>
            <span className="text-xs text-text-secondary">{Math.round(imageScale * 100)}%</span>
          </div>
          <input type="range" min={30} max={90} value={Math.round(imageScale * 100)}
            onChange={(e) => setImageScale(Number(e.target.value) / 100)}
            className="w-full accent-accent-yellow"
          />
        </div>

        <ElementToggle enabled={enabledElements} onChange={setEnabledElements} />
        <BadgeEditor badges={badges} onChange={setBadges} />

        {/* Product data */}
        <div className="space-y-2">
          <label className="text-xs text-text-muted uppercase tracking-wider">Данные товара</label>
          <input type="text" value={productData.name} onChange={(e) => updateField('name', e.target.value)}
            placeholder="Название товара *"
            className="w-full rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={productData.brand || ''} onChange={(e) => updateField('brand', e.target.value)}
              placeholder="Бренд"
              className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
            />
            <input type="text" value={productData.subtitle || ''} onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Подпись (4л, XL, 250мл)"
              className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={productData.price || ''} onChange={(e) => updateField('price', Number(e.target.value))}
              placeholder="Цена"
              className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
            />
            <select value={productData.priceUnit || '₽'} onChange={(e) => updateField('priceUnit', e.target.value)}
              className="rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary focus:border-accent-yellow focus:outline-none"
            >
              <option value="₽">₽</option>
              <option value="$">$</option>
              <option value="€">€</option>
            </select>
          </div>
        </div>

        {/* Specs */}
        <div className="space-y-2">
          <label className="text-xs text-text-muted uppercase tracking-wider">Характеристики</label>
          <div className="flex flex-wrap gap-1">
            {Object.entries(SPEC_PRESETS).map(([key, preset]) => (
              <button key={key} onClick={() => applyPreset(key)}
                className="text-xs px-2.5 py-1 rounded-md bg-bg-secondary border border-border-subtle text-text-secondary hover:border-accent-cyan hover:text-accent-cyan transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
          {productData.specs.map((spec, i) => (
            <div key={i} className="flex gap-1.5">
              <input type="text" value={spec.label} onChange={(e) => updateSpec(i, 'label', e.target.value)}
                placeholder="Название"
                className="flex-1 rounded-lg bg-bg-secondary border border-border-subtle px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
              />
              <input type="text" value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)}
                placeholder="Значение"
                className="flex-1 rounded-lg bg-bg-secondary border border-border-subtle px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
              />
              <button onClick={() => removeSpec(i)} className="px-2 text-text-muted hover:text-accent-magenta transition-colors">&times;</button>
            </div>
          ))}
          {productData.specs.length < 10 && (
            <button onClick={addSpec} className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors">
              + Добавить характеристику
            </button>
          )}
        </div>

        <button onClick={handleGenerate}
          disabled={generating || !productData.name || !productImageBase64}
          className="w-full rounded-lg py-3 text-sm font-medium bg-accent-yellow text-bg-primary hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {generating ? (
            <><div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" /> Генерирую...</>
          ) : 'Сгенерировать карточку'}
        </button>

        {error && <p className="text-sm text-accent-magenta">{error}</p>}
      </div>
    </div>
  );
}
