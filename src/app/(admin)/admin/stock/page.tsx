import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import StockFilters from './StockFilters';
import StockTable from './StockTable';

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
            <span className="text-accent-yellow-text font-medium">{lowStock} мало</span>
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
        <StockTable
          items={filtered.map((v) => ({
            id: v.id,
            productName: v.productName,
            brandName: v.brandName,
            volume: v.volume,
            stock_qty: v.stock_qty,
            price: v.price,
            sku: v.sku,
          }))}
        />
      )}
    </div>
  );
}
