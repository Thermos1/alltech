'use client';

import { cn } from '@/lib/utils';

interface BrandFilterProps {
  brands: string[];
  activeBrand: string | null;
  onSelect: (brand: string | null) => void;
}

export default function BrandFilter({ brands, activeBrand, onSelect }: BrandFilterProps) {
  if (brands.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap border',
          !activeBrand
            ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
            : 'border-border-subtle bg-bg-card text-text-muted hover:text-text-secondary'
        )}
      >
        Все бренды
      </button>
      {brands.map((brand) => (
        <button
          key={brand}
          onClick={() => onSelect(brand)}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap border',
            activeBrand === brand
              ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
              : 'border-border-subtle bg-bg-card text-text-muted hover:text-text-secondary'
          )}
        >
          {brand}
        </button>
      ))}
    </div>
  );
}
