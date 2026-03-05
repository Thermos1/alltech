'use client';

import { useState } from 'react';
import { formatPriceShort } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import VolumeSelector from '@/components/catalog/VolumeSelector';

interface Variant {
  id: string;
  volume: string;
  unit: string;
  price: number;
  price_per_liter?: number | null;
}

interface ProductDetailClientProps {
  productId: string;
  productName: string;
  imageUrl?: string;
  variants: Variant[];
}

function isBulk(volume: string) {
  return volume === 'Розлив' || volume === 'bulk';
}

export default function ProductDetailClient({
  productId,
  productName,
  imageUrl,
  variants,
}: ProductDetailClientProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedId, setSelectedId] = useState<string>(
    variants[0]?.id ?? ''
  );
  const [added, setAdded] = useState(false);
  const [bulkLiters, setBulkLiters] = useState(5);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const selectedIsBulk = selected && isBulk(selected.volume);
  const displayPrice = selectedIsBulk
    ? (selected.price_per_liter ?? selected.price) * bulkLiters
    : selected?.price ?? 0;

  function handleAddToCart() {
    if (!selected) return;

    if (selectedIsBulk) {
      const pricePerLiter = selected.price_per_liter ?? selected.price;
      addItem({
        variantId: `${selected.id}:bulk`,
        productId,
        productName,
        variantLabel: `Розлив ${bulkLiters} л`,
        price: pricePerLiter * bulkLiters,
        imageUrl,
        isBulk: true,
      });
    } else {
      addItem({
        variantId: selected.id,
        productId,
        productName,
        variantLabel: `${selected.volume} ${selected.unit}`,
        price: selected.price,
        imageUrl,
      });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (variants.length === 0) {
    return (
      <div className="mt-4 rounded-lg bg-bg-secondary border border-border-subtle p-4">
        <p className="text-text-muted text-sm">
          Нет доступных вариантов. Свяжитесь с нами для уточнения наличия.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      {/* Volume selector */}
      <div>
        <p className="text-text-muted text-xs uppercase tracking-wider mb-2">
          Объём
        </p>
        <VolumeSelector
          variants={variants}
          selectedId={selectedId}
          onSelect={setSelectedId}
          bulkLiters={bulkLiters}
          onBulkLitersChange={setBulkLiters}
        />
      </div>

      {/* Price */}
      {selected && (
        <div className="space-y-1">
          <p className="text-3xl font-display text-text-primary">
            {formatPriceShort(displayPrice)}
          </p>
          {selectedIsBulk ? (
            <p className="text-text-muted text-sm">
              {formatPriceShort(selected.price_per_liter ?? selected.price)} за литр &times; {bulkLiters} л
            </p>
          ) : (
            selected.price_per_liter != null && selected.price_per_liter > 0 && (
              <p className="text-text-muted text-sm">
                {formatPriceShort(selected.price_per_liter)} за литр
              </p>
            )
          )}
        </div>
      )}

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        className={`w-full rounded-xl py-3.5 text-base font-semibold transition-all active:scale-[0.98] ${
          added
            ? 'bg-green-500 text-white'
            : 'bg-accent-yellow text-text-on-accent hover:brightness-110'
        }`}
      >
        {added ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Добавлено
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
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
            Добавить в корзину
          </span>
        )}
      </button>
    </div>
  );
}
