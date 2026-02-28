import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/catalog/ProductCard';

export const metadata = {
  title: 'Поиск — АЛТЕХ',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || '';

  if (!query) {
    return (
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-10">
        <h1 className="font-display text-2xl text-text-primary mb-4">Поиск</h1>
        <p className="text-text-muted text-sm">Введите запрос для поиска по каталогу</p>
      </div>
    );
  }

  const supabase = await createClient();

  // Search by product name, brand name, viscosity, approvals
  const searchPattern = `%${query}%`;

  const { data: products } = await supabase
    .from('products')
    .select(`
      id, slug, name, viscosity, base_type, api_spec, acea_spec, image_url, approvals,
      brands (name, slug),
      product_variants (id, price, volume, unit)
    `)
    .eq('is_active', true)
    .or(`name.ilike.${searchPattern},viscosity.ilike.${searchPattern},approvals.ilike.${searchPattern}`)
    .order('name');

  // Also search by brand name (separate query since it's a join)
  const { data: brandProducts } = await supabase
    .from('products')
    .select(`
      id, slug, name, viscosity, base_type, api_spec, acea_spec, image_url, approvals,
      brands!inner (name, slug),
      product_variants (id, price, volume, unit)
    `)
    .eq('is_active', true)
    .ilike('brands.name', searchPattern);

  // Normalize brands from array to object (Supabase returns array for joins)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normalizeBrands(raw: any) {
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw ?? null;
  }

  // Merge and deduplicate
  const rawAll = [...(products || [])];
  const existingIds = new Set(rawAll.map((p) => p.id));
  (brandProducts || []).forEach((p) => {
    if (!existingIds.has(p.id)) {
      rawAll.push(p);
    }
  });

  const allProducts = rawAll.map((p) => ({
    ...p,
    brands: normalizeBrands(p.brands),
  }));

  return (
    <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-primary">
          Поиск: &laquo;{query}&raquo;
        </h1>
        <p className="text-text-muted text-sm mt-1">
          {allProducts.length === 0
            ? 'Ничего не найдено'
            : `Найдено: ${allProducts.length}`}
        </p>
      </div>

      {allProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {allProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {allProducts.length === 0 && (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center">
          <p className="text-text-muted text-sm mb-2">
            По запросу &laquo;{query}&raquo; ничего не найдено
          </p>
          <p className="text-text-muted text-xs">
            Попробуйте изменить запрос или перейдите в каталог
          </p>
        </div>
      )}
    </div>
  );
}
