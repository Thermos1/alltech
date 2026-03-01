import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import SharedCartBuilder from './SharedCartBuilder';

export const metadata = {
  title: 'Собрать корзину — Админ АЛТЕХ',
};

export default async function NewSharedCartPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'manager'].includes(profile.role)) return null;

  // Fetch all active products with variants
  const { data: products } = await admin
    .from('products')
    .select('id, name, image_url')
    .eq('is_active', true)
    .order('name');

  const productIds = (products || []).map((p) => p.id);
  const { data: variants } = productIds.length > 0
    ? await admin
        .from('product_variants')
        .select('id, product_id, volume, price, stock_qty')
        .in('product_id', productIds)
        .eq('is_active', true)
        .order('sort_order')
    : { data: [] };

  // Build product list with variants
  const catalog = (products || []).map((product) => ({
    id: product.id,
    name: product.name,
    imageUrl: product.image_url,
    variants: (variants || [])
      .filter((v) => v.product_id === product.id)
      .map((v) => ({
        id: v.id,
        volume: v.volume,
        price: Number(v.price),
        stock: v.stock_qty,
      })),
  })).filter((p) => p.variants.length > 0);

  // Fetch clients for assignment
  let clientsQuery = admin
    .from('profiles')
    .select('id, full_name, phone')
    .eq('role', 'customer')
    .order('full_name');

  if (profile.role === 'manager') {
    clientsQuery = clientsQuery.eq('manager_id', user.id);
  }

  const { data: clients } = await clientsQuery;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-text-primary">Собрать корзину</h1>
      <SharedCartBuilder
        catalog={catalog}
        clients={(clients || []).map((c) => ({
          id: c.id,
          label: `${c.full_name || 'Без имени'} — ${c.phone || 'нет телефона'}`,
        }))}
      />
    </div>
  );
}
