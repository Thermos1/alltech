'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn, formatPriceShort } from '@/lib/utils';
import { OIL_BASE_TYPES } from '@/lib/constants';
import { useCartStore } from '@/stores/cart-store';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    viscosity?: string | null;
    base_type?: string | null;
    api_spec?: string | null;
    acea_spec?: string | null;
    image_url?: string | null;
    min_price_per_liter?: number | null;
    brands?: { name: string; slug: string } | null;
    product_variants?: { id: string; price: number; volume: string; unit: string }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const baseTypeLabel = product.base_type
    ? OIL_BASE_TYPES[product.base_type as keyof typeof OIL_BASE_TYPES]
    : null;

  const initials = product.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const specs = [product.api_spec, product.acea_spec]
    .filter(Boolean)
    .join(' / ');

  const cheapestVariant = product.product_variants
    ?.slice()
    .sort((a, b) => a.price - b.price)[0];

  function handleCardClick() {
    router.push(`/product/${product.slug}`);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (!cheapestVariant) return;

    addItem({
      variantId: cheapestVariant.id,
      productId: product.id,
      productName: product.name,
      variantLabel: `${cheapestVariant.volume} ${cheapestVariant.unit}`,
      price: cheapestVariant.price,
      imageUrl: product.image_url ?? undefined,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group flex flex-col rounded-xl border border-border-subtle cursor-pointer',
        'bg-bg-card overflow-hidden transition-all duration-300',
        'glow-border-yellow hover:bg-bg-card-hover'
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-bg-secondary flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <span className="text-3xl font-display text-text-muted select-none">
            {initials}
          </span>
        )}

        {/* Base type badge */}
        {baseTypeLabel && (
          <span className="absolute top-2 left-2 rounded-md bg-accent-yellow-dim text-accent-yellow text-[10px] font-medium px-2 py-0.5">
            {baseTypeLabel}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Viscosity */}
        {product.viscosity && (
          <span className="text-accent-cyan text-xs font-medium tracking-wide">
            {product.viscosity}
          </span>
        )}

        {/* Name */}
        <h3 className="text-text-primary text-sm font-medium leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* Brand */}
        {product.brands?.name && (
          <span className="text-text-muted text-xs">
            {product.brands.name}
          </span>
        )}

        {/* Specs */}
        {specs && (
          <p className="text-text-muted text-[11px] leading-tight line-clamp-1">
            {specs}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        {cheapestVariant && (
          <p className="text-text-primary text-sm font-semibold mt-1">
            {formatPriceShort(cheapestVariant.price)}{' '}
            <span className="text-text-muted text-xs font-normal">
              / {cheapestVariant.volume} {cheapestVariant.unit}
            </span>
          </p>
        )}

        {/* Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={!cheapestVariant}
          className={cn(
            'mt-2 w-full rounded-lg py-2.5 text-xs font-semibold transition-all',
            added
              ? 'bg-green-500 text-white scale-[0.97]'
              : 'bg-accent-yellow text-bg-primary hover:brightness-110 active:scale-[0.97]',
            !cheapestVariant && 'opacity-50 cursor-not-allowed'
          )}
        >
          {added ? (
            <>
              <svg
                className="inline-block w-3.5 h-3.5 mr-1 -mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Добавлено!
            </>
          ) : (
            <>
              <svg
                className="inline-block w-3.5 h-3.5 mr-1 -mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              В корзину
            </>
          )}
        </button>
      </div>
    </div>
  );
}
