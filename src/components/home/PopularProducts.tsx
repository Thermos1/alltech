import { createClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/catalog/ProductGrid';

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
    <section className="bg-bg-primary py-8 md:py-12">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        <div className="flex items-center justify-between mb-6">
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

        <ProductGrid products={productsWithPrices} />
      </div>
    </section>
  );
}
