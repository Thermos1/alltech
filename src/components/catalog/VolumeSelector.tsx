'use client';

import { cn } from '@/lib/utils';

interface Variant {
  id: string;
  volume: string;
  price: number;
  price_per_liter?: number | null;
  unit: string;
}

interface VolumeSelectorProps {
  variants: Variant[];
  onSelect: (variantId: string) => void;
  selectedId?: string;
  bulkLiters?: number;
  onBulkLitersChange?: (liters: number) => void;
}

function isBulk(volume: string) {
  return volume === 'Розлив' || volume === 'bulk';
}

export default function VolumeSelector({
  variants,
  onSelect,
  selectedId,
  bulkLiters = 5,
  onBulkLitersChange,
}: VolumeSelectorProps) {
  if (variants.length === 0) return null;

  const selectedVariant = variants.find((v) => v.id === selectedId);
  const showBulkInput = selectedVariant && isBulk(selectedVariant.volume);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedId === variant.id;
          const label = isBulk(variant.volume)
            ? 'Розлив'
            : `${variant.volume} ${variant.unit}`;

          return (
            <button
              key={variant.id}
              onClick={() => onSelect(variant.id)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                isSelected
                  ? 'bg-accent-yellow text-bg-primary shadow-[0_0_10px_rgba(255,214,0,0.3)]'
                  : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border-subtle'
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {showBulkInput && onBulkLitersChange && (
        <div className="flex items-center gap-3 rounded-lg bg-bg-card border border-border-subtle p-3">
          <span className="text-sm text-text-secondary whitespace-nowrap">Количество литров:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onBulkLitersChange(Math.max(5, bulkLiters - 5))}
              disabled={bulkLiters <= 5}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-secondary text-text-primary hover:bg-bg-card-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min={5}
              max={200}
              step={5}
              value={bulkLiters}
              onChange={(e) => {
                const val = Math.max(5, Math.min(200, Math.round(Number(e.target.value) / 5) * 5));
                onBulkLitersChange(val || 5);
              }}
              className="h-8 w-16 rounded-lg bg-bg-secondary border border-border-subtle text-center text-sm text-text-primary focus:border-accent-yellow focus:outline-none"
            />
            <button
              onClick={() => onBulkLitersChange(Math.min(200, bulkLiters + 5))}
              disabled={bulkLiters >= 200}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-secondary text-text-primary hover:bg-bg-card-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
          <span className="text-xs text-text-muted">л</span>
        </div>
      )}
    </div>
  );
}
