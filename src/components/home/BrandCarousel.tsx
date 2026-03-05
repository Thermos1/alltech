import Link from 'next/link';

const brands = [
  { name: 'ROLF', slug: 'rolf' },
  { name: 'SINTEC', slug: 'sintec' },
  { name: 'KIXX', slug: 'kixx' },
  { name: 'RhinOIL', slug: 'rhinoil' },
  { name: 'ХИМАВТО', slug: 'himavto' },
  { name: 'Volga Oil', slug: 'volga' },
  { name: 'AKross', slug: 'akross' },
  { name: 'Savtok', slug: 'savtok' },
];

export default function BrandCarousel() {
  return (
    <section className="bg-bg-primary py-4 md:py-6">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        <h2 className="font-display text-xs uppercase tracking-wider text-text-muted mb-4">
          Наши бренды
        </h2>

        <div className="relative">
          <div className="flex gap-2.5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-2 md:gap-3">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/catalog/lubricants?brand=${brand.slug}`}
                className="flex-shrink-0 snap-start rounded-lg border border-border-subtle bg-bg-card px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:border-accent-yellow hover:text-accent-yellow-text text-text-secondary md:px-5 md:py-3 md:text-base"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
