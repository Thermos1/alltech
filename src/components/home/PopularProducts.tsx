import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/catalog/ProductCard';

export default async function PopularProducts() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('*, brands(name, slug), product_variants(id, price, price_per_liter, volume, unit)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order')
    .limit(8);

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

  return (
    <section className="bg-bg-primary pt-4 pb-2 md:pt-6 md:pb-4">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl md:text-2xl text-text-primary">
            Популярные товары
          </h2>
          <a
            href="/catalog/lubricants"
            className="text-accent-yellow-text text-sm hover:underline"
          >
            Все товары &rarr;
          </a>
        </div>

        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2">
          {productsWithPrices.map((product) => (
            <div key={product.id} className="flex-shrink-0 snap-start w-[200px] sm:w-[240px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
