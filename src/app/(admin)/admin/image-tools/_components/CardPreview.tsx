'use client';

import { ALL_STYLES, PLATFORM_PRESETS, type CardStyleId, type CardElement, type BadgeConfig, type ProductCardData, type ExportPlatform, type CardStyleColors } from '@/lib/card-templates';

type Props = {
  style: CardStyleId;
  platform: ExportPlatform;
  customWidth?: number;
  customHeight?: number;
  enabledElements: CardElement[];
  badges: BadgeConfig[];
  productData: ProductCardData;
  productImageBase64: string | null;
  imageScale?: number;
  customColors?: Partial<CardStyleColors>;
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
  imageScale = 0.5,
  customColors,
}: Props) {
  const baseStyle = ALL_STYLES[style];
  const colors = customColors && Object.keys(customColors).length > 0
    ? { ...baseStyle.colors, ...customColors }
    : baseStyle.colors;

  const dim = platform === 'custom'
    ? { width: customWidth || 1080, height: customHeight || 1080 }
    : PLATFORM_PRESETS[platform];

  const has = (el: CardElement) => enabledElements.includes(el);

  const visibleSpecs = (productData.specs || []).filter(s => s.value);

  const bgStyle = colors.backgroundEnd
    ? { backgroundImage: `linear-gradient(135deg, ${colors.background}, ${colors.backgroundEnd})` }
    : { backgroundColor: colors.background };

  const imageMaxHeight = `${Math.round(imageScale * 100)}%`;

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
          {/* Badges */}
          {has('badges') && badges.length > 0 && (
            <div className="absolute top-[5%] right-[5%] flex gap-1 z-10">
              {badges.map((badge, i) => (
                <span
                  key={i}
                  className="text-xs font-bold px-2 py-1 rounded"
                  style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
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
              style={{ color: colors.textSecondary }}
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
                className="max-w-[80%] object-contain"
                style={{ maxHeight: imageMaxHeight }}
              />
            ) : (
              <div className="text-center" style={{ color: colors.textSecondary }}>
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
                color: colors.text,
                fontSize: 'clamp(14px, 3.5vw, 22px)',
              }}
            >
              {productData.name || 'Название товара'}
            </div>
          )}

          {/* Specs pills */}
          {has('specs') && visibleSpecs.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {visibleSpecs.map((spec, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded"
                  style={{ backgroundColor: colors.specBg, color: colors.specText }}
                >
                  {spec.label} {spec.value}
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
                  color: colors.accent,
                  fontSize: 'clamp(16px, 4vw, 26px)',
                }}
              >
                {productData.price.toLocaleString('ru-RU')} {productData.priceUnit || '₽'}
              </span>
              {has('subtitle') && productData.subtitle && (
                <span className="text-[10px]" style={{ color: colors.textSecondary }}>
                  / {productData.subtitle}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
