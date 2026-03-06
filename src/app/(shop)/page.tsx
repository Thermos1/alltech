import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { SECTIONS } from '@/lib/constants';
import BrandCarousel from '@/components/home/BrandCarousel';
import PopularProducts from '@/components/home/PopularProducts';
import ValueProps from '@/components/home/ValueProps';
import CategoryTabs from '@/components/catalog/CategoryTabs';
import FilterableProductGrid from '@/components/catalog/FilterableProductGrid';

async function CatalogSection({ sectionKey }: { sectionKey: string }) {
  const sectionData = SECTIONS[sectionKey as keyof typeof SECTIONS];
  if (!sectionData) return null;

  const supabase = await createClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('section', sectionKey)
      .order('sort_order'),
    supabase
      .from('products')
      .select('*, brands(name, slug), product_variants(id, price, price_per_liter, volume, unit)')
      .eq('section', sectionKey)
      .eq('is_active', true)
      .order('sort_order'),
  ]);

  const productsWithPrices = (products ?? []).map((product) => {
    const variants = product.product_variants ?? [];
    const pricesPerLiter = variants
      .map((v: { price_per_liter?: number | null }) => v.price_per_liter)
      .filter((p: number | null | undefined): p is number => p != null && p > 0);

    return {
      ...product,
      min_price_per_liter:
        pricesPerLiter.length > 0 ? Math.min(...pricesPerLiter) : null,
    };
  });

  if (productsWithPrices.length === 0) return null;

  const categoryList = (categories ?? []).map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return (
    <section className="bg-bg-primary py-4 md:py-6">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        <h2 className="font-display text-xl md:text-2xl text-text-primary mb-4">
          {sectionData.name}
        </h2>

        {categoryList.length > 0 && (
          <div className="mb-4">
            <CategoryTabs categories={categoryList} section={sectionKey} />
          </div>
        )}

        <FilterableProductGrid products={productsWithPrices} />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <PopularProducts />
      </Suspense>
      <BrandCarousel />
      <Suspense fallback={
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <CatalogSection sectionKey="lubricants" />
      </Suspense>
      <Suspense fallback={
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <CatalogSection sectionKey="filters" />
      </Suspense>
      <ValueProps />
    </>
  );
}
