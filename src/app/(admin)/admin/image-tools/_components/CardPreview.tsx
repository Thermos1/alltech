'use client';

import { ALL_STYLES, PLATFORM_PRESETS, type CardStyleId, type CardElement, type BadgeConfig, type ProductCardData, type ExportPlatform } from '@/lib/card-templates';

const BASE_TYPE_LABELS: Record<string, string> = {
  synthetic: 'Синтетика',
  semi_synthetic: 'Полусинтетика',
  mineral: 'Минеральное',
};

type Props = {
  style: CardStyleId;
  platform: ExportPlatform;
  customWidth?: number;
  customHeight?: number;
  enabledElements: CardElement[];
  badges: BadgeConfig[];
  productData: ProductCardData;
  productImageBase64: string | null;
};

export default function CardPreview({
  style,
  platform,
  customWidth,
  customHeight,
  enabledElements,
  badges,
  productData,
  productImageBase64,
}: Props) {
  const styleDef = ALL_STYLES[style];
  const dim = platform === 'custom'
    ? { width: customWidth || 1080, height: customHeight || 1080 }
    : PLATFORM_PRESETS[platform];

  const has = (el: CardElement) => enabledElements.includes(el);

  const specs: string[] = [];
  if (has('viscosity') && productData.viscosity) specs.push(productData.viscosity);
  if (has('baseType') && productData.baseType) specs.push(BASE_TYPE_LABELS[productData.baseType] || productData.baseType);
  if (has('apiSpec') && productData.apiSpec) specs.push(`API ${productData.apiSpec}`);
  if (has('aceaSpec') && productData.aceaSpec) specs.push(`ACEA ${productData.aceaSpec}`);

  const bgStyle = styleDef.colors.backgroundEnd
    ? { backgroundImage: `linear-gradient(135deg, ${styleDef.colors.background}, ${styleDef.colors.backgroundEnd})` }
    : { backgroundColor: styleDef.colors.background };

  return (
    <div className="rounded-xl border border-border-subtle overflow-hidden">
      <div className="px-4 py-2 border-b border-border-subtle flex items-center justify-between">
        <span className="text-xs text-text-muted">Превью</span>
        <span className="text-xs text-text-muted">{dim.width}×{dim.height}</span>
      </div>
      <div className="flex items-center justify-center p-4 bg-bg-secondary">
        <div
          className="relative overflow-hidden shadow-2xl"
          style={{
            ...bgStyle,
            aspectRatio: `${dim.width} / ${dim.height}`,
            maxHeight: '500px',
            width: '100%',
            maxWidth: `${500 * (dim.width / dim.height)}px`,
            display: 'flex',
            flexDirection: 'column',
            padding: '5%',
          }}
        >
          {/* Watermark */}
          {has('watermark') && (
            <img
              src="/images/logo-white.png"
              alt=""
              className="absolute inset-0 m-auto opacity-[0.04]"
              style={{ width: '50%', height: 'auto', objectFit: 'contain' }}
            />
          )}

          {/* Badges */}
          {has('badges') && badges.length > 0 && (
            <div className="absolute top-[5%] right-[5%] flex gap-1 z-10">
              {badges.map((badge, i) => (
                <span
                  key={i}
                  className="text-xs font-bold px-2 py-1 rounded"
                  style={{ backgroundColor: styleDef.colors.badgeBg, color: styleDef.colors.badgeText }}
                >
                  {badge.text}
                </span>
              ))}
            </div>
          )}

          {/* Brand (top) */}
          {has('brandName') && productData.brand && (
            <div
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: styleDef.colors.textSecondary }}
            >
              {productData.brand}
            </div>
          )}

          {/* Product image */}
          <div className="flex-1 flex items-center justify-center min-h-0 py-2">
            {productImageBase64 ? (
              <img
                src={productImageBase64}
                alt="Product"
                className="max-h-full max-w-[80%] object-contain"
                style={{ maxHeight: '55%' }}
              />
            ) : (
              <div className="text-center" style={{ color: styleDef.colors.textSecondary }}>
                <div className="text-4xl mb-2 opacity-30">📦</div>
                <div className="text-xs opacity-50">Загрузите фото</div>
              </div>
            )}
          </div>

          {/* Product name */}
          {has('productName') && (
            <div
              className="font-display leading-tight"
              style={{
                color: styleDef.colors.text,
                fontSize: 'clamp(14px, 3.5vw, 22px)',
              }}
            >
              {productData.name || 'Название товара'}
            </div>
          )}

          {/* Specs pills */}
          {specs.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {specs.map((spec, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded"
                  style={{ backgroundColor: styleDef.colors.specBg, color: styleDef.colors.specText }}
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          {has('price') && productData.price && (
            <div className="flex items-baseline gap-1 mt-2">
              <span
                className="font-display"
                style={{
                  color: styleDef.colors.accent,
                  fontSize: 'clamp(16px, 4vw, 26px)',
                }}
              >
                {productData.price.toLocaleString('ru-RU')} ₽
              </span>
              {productData.volume && (
                <span className="text-[10px]" style={{ color: styleDef.colors.textSecondary }}>
                  / {productData.volume}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
