import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceShort } from '@/lib/utils';

export const metadata = {
  title: 'Корзины — Админ АЛТЕХ',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ожидает', color: 'bg-accent-yellow-dim text-accent-yellow-text' },
  viewed: { label: 'Просмотрена', color: 'bg-accent-cyan-dim text-accent-cyan' },
  ordered: { label: 'Оформлена', color: 'bg-green-500/15 text-green-400' },
  expired: { label: 'Истекла', color: 'bg-bg-secondary text-text-muted' },
};

export default async function SharedCartsPage() {
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

  const isAdmin = profile.role === 'admin';

  let query = admin
    .from('shared_carts')
    .select('id, code, manager_id, client_id, status, notes, created_at')
    .order('created_at', { ascending: false });

  if (!isAdmin) {
    query = query.eq('manager_id', user.id);
  }

  const { data: carts } = await query;

  // Get manager names (admin view)
  const managerIds = [...new Set((carts || []).map((c) => c.manager_id))];
  const managerMap: Record<string, string> = {};
  if (isAdmin && managerIds.length > 0) {
    const { data: managers } = await admin
      .from('profiles')
      .select('id, full_name')
      .in('id', managerIds);
    (managers || []).forEach((m) => {
      managerMap[m.id] = m.full_name || 'Без имени';
    });
  }

  // Get client names
  const clientIds = [...new Set((carts || []).filter((c) => c.client_id).map((c) => c.client_id!))];
  const clientMap: Record<string, string> = {};
  if (clientIds.length > 0) {
    const { data: clients } = await admin
      .from('profiles')
      .select('id, full_name')
      .in('id', clientIds);
    (clients || []).forEach((c) => {
      clientMap[c.id] = c.full_name || 'Без имени';
    });
  }

  // Get item counts and totals per cart
  const cartIds = (carts || []).map((c) => c.id);
  const { data: allItems } = cartIds.length > 0
    ? await admin
        .from('shared_cart_items')
        .select('shared_cart_id, variant_id, quantity')
        .in('shared_cart_id', cartIds)
    : { data: [] };

  // Get variant prices
  const variantIds = [...new Set((allItems || []).map((i) => i.variant_id))];
  const { data: variants } = variantIds.length > 0
    ? await admin
        .from('product_variants')
        .select('id, price')
        .in('id', variantIds)
    : { data: [] };

  const priceMap: Record<string, number> = {};
  (variants || []).forEach((v) => { priceMap[v.id] = v.price; });

  const cartStats: Record<string, { itemCount: number; total: number }> = {};
  (allItems || []).forEach((item) => {
    if (!cartStats[item.shared_cart_id]) {
      cartStats[item.shared_cart_id] = { itemCount: 0, total: 0 };
    }
    cartStats[item.shared_cart_id].itemCount += item.quantity;
    cartStats[item.shared_cart_id].total += (priceMap[item.variant_id] || 0) * item.quantity;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-text-primary">Корзины</h1>
        <Link
          href="/admin/shared-cart/new"
          className="rounded-lg bg-accent-yellow text-text-on-accent px-4 py-2 text-sm font-medium hover:brightness-110 transition-all"
        >
          Собрать корзину
        </Link>
      </div>

      {!carts || carts.length === 0 ? (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center">
          <p className="text-text-muted text-sm">Корзин пока нет</p>
          <p className="text-text-muted text-xs mt-1">
            Соберите корзину для клиента и отправьте ссылку
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Код</th>
                  {isAdmin && <th className="text-left px-4 py-3 font-medium">Менеджер</th>}
                  <th className="text-left px-4 py-3 font-medium">Клиент</th>
                  <th className="text-center px-4 py-3 font-medium">Товары</th>
                  <th className="text-right px-4 py-3 font-medium">Сумма</th>
                  <th className="text-center px-4 py-3 font-medium">Статус</th>
                  <th className="text-left px-4 py-3 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {carts.map((cart) => {
                  const status = statusLabels[cart.status] || statusLabels.pending;
                  const stats = cartStats[cart.id] || { itemCount: 0, total: 0 };

                  return (
                    <tr key={cart.id} className="hover:bg-bg-card-hover transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/shared-cart/${cart.id}`}
                          className="text-text-primary hover:text-accent-yellow-text transition-colors font-mono font-medium"
                        >
                          {cart.code}
                        </Link>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-text-secondary">
                          {managerMap[cart.manager_id] || '—'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-text-secondary">
                        {cart.client_id ? clientMap[cart.client_id] || '—' : 'Без клиента'}
                      </td>
                      <td className="px-4 py-3 text-center text-text-primary">
                        {stats.itemCount}
                      </td>
                      <td className="px-4 py-3 text-right text-text-primary font-medium whitespace-nowrap">
                        {formatPriceShort(stats.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                        {new Date(cart.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                        })}
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
