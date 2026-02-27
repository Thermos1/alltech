'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const brands = [
  'ROLF',
  'SINTEC',
  'TAKAYAMA',
  'KIXX',
  'RhinOIL',
  'ХИМАВТО',
  'Volga Oil',
];

export default function BrandCarousel() {
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  return (
    <section className="bg-bg-primary py-8 md:py-12">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Наши бренды
        </h2>

        <div className="relative">
          <div className="flex gap-2.5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-2 md:gap-3">
            {brands.map((brand) => {
              const isActive = activeBrand === brand;
              return (
                <button
                  key={brand}
                  onClick={() =>
                    setActiveBrand(isActive ? null : brand)
                  }
                  className={cn(
                    'flex-shrink-0 snap-start rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 md:px-5 md:py-3 md:text-base',
                    isActive
                      ? 'border-accent-yellow bg-accent-yellow text-bg-primary shadow-[0_0_12px_rgba(255,214,0,0.3)]'
                      : 'border-border-subtle bg-bg-card text-text-secondary hover:border-border-accent hover:text-text-primary'
                  )}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
