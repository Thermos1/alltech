import { createAdminClient } from '@/lib/supabase/admin';
import BrandManager from './BrandManager';

export const metadata = {
  title: 'Бренды — Админ АЛТЕХ',
};

export default async function BrandsPage() {
  const admin = createAdminClient();

  const { data: brands } = await admin
    .from('brands')
    .select('id, name, slug, logo_url, is_active, sort_order')
    .order('sort_order')
    .order('name');

  // Count products per brand
  const brandsWithCounts = await Promise.all(
    (brands || []).map(async (brand) => {
      const { count } = await admin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', brand.id);
      return { ...brand, product_count: count || 0 };
    })
  );

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl text-text-primary">
        Бренды
      </h1>
      <BrandManager brands={brandsWithCounts} />
    </div>
  );
}
