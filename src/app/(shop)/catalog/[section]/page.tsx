import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SECTIONS } from '@/lib/constants';
import CategoryTabs from '@/components/catalog/CategoryTabs';
import ProductGrid from '@/components/catalog/ProductGrid';

interface PageProps {
  params: Promise<{ section: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section } = await params;
  const sectionData = SECTIONS[section as keyof typeof SECTIONS];

  if (!sectionData) return {};

  return {
    title: sectionData.name,
    description: sectionData.description,
  };
}

export default async function CatalogSectionPage({ params }: PageProps) {
  const { section } = await params;
  const sectionData = SECTIONS[section as keyof typeof SECTIONS];

  if (!sectionData) {
    notFound();
  }

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('section', section)
    .order('sort_order');

  const { data: products } = await supabase
    .from('products')
    .select('*, brands(name, slug), product_variants(id, price, price_per_liter, volume, unit)')
    .eq('section', section)
    .eq('is_active', true)
    .order('sort_order');

  // Compute min_price_per_liter from variants for each product
  const productsWithPrices = (products ?? []).map((product) => {
    const variants = product.product_variants ?? [];
    const pricesPerLiter = variants
      .map((v: { price_per_liter?: number | null }) => v.price_per_liter)
      .filter((p: number | null | undefined): p is number => p != null && p > 0);

    const min_price_per_liter =
      pricesPerLiter.length > 0 ? Math.min(...pricesPerLiter) : null;

    return {
      ...product,
      min_price_per_liter,
    };
  });

  const categoryList = (categories ?? []).map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-6">
        {/* Section header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl text-text-primary mb-1">
            {sectionData.name}
          </h1>
          <p className="text-text-secondary text-sm">
            {sectionData.description}
          </p>
        </div>

        {/* Category tabs */}
        {categoryList.length > 0 && (
          <div className="mb-6">
            <CategoryTabs
              categories={categoryList}
              section={section}
            />
          </div>
        )}

        {/* Product grid */}
        <ProductGrid products={productsWithPrices} />
      </div>
    </div>
  );
}
