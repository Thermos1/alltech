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
}

export default function VolumeSelector({
  variants,
  onSelect,
  selectedId,
}: VolumeSelectorProps) {
  if (variants.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => {
        const isSelected = selectedId === variant.id;
        const label =
          variant.volume === 'bulk'
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
  );
}
