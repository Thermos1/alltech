import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceShort } from '@/lib/utils';
import StockFilters from './StockFilters';

export const metadata = {
  title: 'Склад — Админ АЛТЕХ',
};

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; low?: string }>;
}) {
  const { q, brand, low } = await searchParams;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (currentProfile?.role !== 'admin') {
    return (
      <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center">
        <p className="text-text-muted text-sm">Доступ только для администраторов</p>
      </div>
    );
  }

  // Fetch all variants with product info
  let variantsQuery = admin
    .from('product_variants')
    .select('id, volume, price, stock_qty, sku, product_id')
    .eq('is_active', true)
    .order('stock_qty', { ascending: true });

  const { data: variants } = await variantsQuery;

  // Fetch products for names and brand_ids
  const productIds = [...new Set((variants || []).map((v) => v.product_id))];
  const { data: products } = productIds.length > 0
    ? await admin
        .from('products')
        .select('id, name, brand_id')
        .in('id', productIds)
    : { data: [] };

  const productMap: Record<string, { name: string; brand_id: string | null }> = {};
  (products || []).forEach((p) => {
    productMap[p.id] = { name: p.name, brand_id: p.brand_id };
  });

  // Fetch brands
  const { data: brands } = await admin
    .from('brands')
    .select('id, name')
    .order('name');

  const brandMap: Record<string, string> = {};
  (brands || []).forEach((b) => {
    brandMap[b.id] = b.name;
  });

  // Apply filters
  let filtered = (variants || []).map((v) => ({
    ...v,
    productName: productMap[v.product_id]?.name || '—',
    brandId: productMap[v.product_id]?.brand_id || null,
    brandName: productMap[v.product_id]?.brand_id
      ? brandMap[productMap[v.product_id].brand_id!] || '—'
      : '—',
  }));

  if (q) {
    const search = q.toLowerCase();
    filtered = filtered.filter((v) =>
      v.productName.toLowerCase().includes(search) ||
      (v.sku && v.sku.toLowerCase().includes(search))
    );
  }

  if (brand) {
    filtered = filtered.filter((v) => v.brandId === brand);
  }

  if (low) {
    filtered = filtered.filter((v) => v.stock_qty < 5);
  }

  // Stats
  const totalVariants = filtered.length;
  const outOfStock = filtered.filter((v) => v.stock_qty === 0).length;
  const lowStock = filtered.filter((v) => v.stock_qty > 0 && v.stock_qty < 5).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-text-primary">Склад</h1>
        <div className="flex gap-3 text-xs">
          <span className="text-text-muted">{totalVariants} позиций</span>
          {outOfStock > 0 && (
            <span className="text-accent-magenta font-medium">{outOfStock} нет в наличии</span>
          )}
          {lowStock > 0 && (
            <span className="text-accent-yellow font-medium">{lowStock} мало</span>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <StockFilters brands={brands || []} />
      </Suspense>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center">
          <p className="text-text-muted text-sm">Товаров не найдено</p>
        </div>
      ) : (
        <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Товар</th>
                  <th className="text-left px-4 py-3 font-medium">Бренд</th>
                  <th className="text-left px-4 py-3 font-medium">Объём</th>
                  <th className="text-center px-4 py-3 font-medium">Остаток</th>
                  <th className="text-right px-4 py-3 font-medium">Цена</th>
                  <th className="text-left px-4 py-3 font-medium">SKU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((v) => {
                  const stockColor =
                    v.stock_qty === 0
                      ? 'text-accent-magenta bg-accent-magenta-dim'
                      : v.stock_qty < 5
                      ? 'text-accent-yellow bg-accent-yellow-dim'
                      : 'text-green-400 bg-green-500/15';

                  return (
                    <tr key={v.id} className="hover:bg-bg-card-hover transition-colors">
                      <td className="px-4 py-3 text-text-primary font-medium">
                        {v.productName}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {v.brandName}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {v.volume}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${stockColor}`}>
                          {v.stock_qty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-text-primary whitespace-nowrap">
                        {formatPriceShort(v.price)}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs font-mono">
                        {v.sku || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
