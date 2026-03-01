import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceShort } from '@/lib/utils';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Детали корзины — Админ АЛТЕХ',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ожидает', color: 'bg-accent-yellow-dim text-accent-yellow' },
  viewed: { label: 'Просмотрена', color: 'bg-accent-cyan-dim text-accent-cyan' },
  ordered: { label: 'Оформлена', color: 'bg-green-500/15 text-green-400' },
  expired: { label: 'Истекла', color: 'bg-bg-secondary text-text-muted' },
};

export default async function SharedCartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: cart } = await admin
    .from('shared_carts')
    .select('*')
    .eq('id', id)
    .single();

  if (!cart) return notFound();

  if (profile.role === 'manager' && cart.manager_id !== user.id) return notFound();

  // Get items
  const { data: items } = await admin
    .from('shared_cart_items')
    .select('id, variant_id, quantity, note')
    .eq('shared_cart_id', id);

  const variantIds = (items || []).map((i) => i.variant_id);
  const { data: variants } = variantIds.length > 0
    ? await admin.from('product_variants').select('id, volume, price, product_id').in('id', variantIds)
    : { data: [] };

  const productIds = [...new Set((variants || []).map((v) => v.product_id))];
  const { data: products } = productIds.length > 0
    ? await admin.from('products').select('id, name').in('id', productIds)
    : { data: [] };

  const productMap: Record<string, string> = {};
  (products || []).forEach((p) => { productMap[p.id] = p.name; });

  const variantMap: Record<string, { volume: string; price: number; productName: string }> = {};
  (variants || []).forEach((v) => {
    variantMap[v.id] = { volume: v.volume, price: v.price, productName: productMap[v.product_id] || '—' };
  });

  const enrichedItems = (items || []).map((item) => ({
    ...item,
    ...(variantMap[item.variant_id] || { volume: '—', price: 0, productName: '—' }),
  }));

  const total = enrichedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const status = statusLabels[cart.status] || statusLabels.pending;

  // Manager name
  const { data: manager } = await admin.from('profiles').select('full_name').eq('id', cart.manager_id).single();

  // Client name
  let clientName = null;
  if (cart.client_id) {
    const { data: client } = await admin.from('profiles').select('full_name').eq('id', cart.client_id).single();
    clientName = client?.full_name || 'Без имени';
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/cart/share/${cart.code}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/shared-cart" className="text-text-muted hover:text-text-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-display text-2xl text-text-primary">
            Корзина <span className="font-mono">{cart.code}</span>
          </h1>
        </div>
        <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Info */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-text-muted text-xs">Менеджер</p>
            <p className="text-text-primary">{manager?.full_name || '—'}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs">Клиент</p>
            <p className="text-text-primary">{clientName || 'Не привязан'}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs">Создана</p>
            <p className="text-text-primary">
              {new Date(cart.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-text-muted text-xs">Истекает</p>
            <p className="text-text-primary">
              {cart.expires_at
                ? new Date(cart.expires_at).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long',
                  })
                : '—'}
            </p>
          </div>
        </div>

        {cart.notes && (
          <div>
            <p className="text-text-muted text-xs">Комментарий</p>
            <p className="text-text-secondary text-sm">{cart.notes}</p>
          </div>
        )}

        {cart.status !== 'ordered' && cart.status !== 'expired' && (
          <div className="rounded-lg bg-bg-secondary p-3">
            <p className="text-text-muted text-xs mb-1">Ссылка для клиента:</p>
            <p className="text-accent-cyan text-sm font-mono break-all">{shareUrl}</p>
          </div>
        )}
      </div>

      {/* Items table */}
      <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Товар</th>
              <th className="text-left px-4 py-3 font-medium">Объём</th>
              <th className="text-right px-4 py-3 font-medium">Цена</th>
              <th className="text-center px-4 py-3 font-medium">Кол-во</th>
              <th className="text-right px-4 py-3 font-medium">Сумма</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {enrichedItems.map((item) => (
              <tr key={item.id} className="hover:bg-bg-card-hover transition-colors">
                <td className="px-4 py-3 text-text-primary font-medium">{item.productName}</td>
                <td className="px-4 py-3 text-text-secondary">{item.volume}</td>
                <td className="px-4 py-3 text-right text-text-primary whitespace-nowrap">
                  {formatPriceShort(item.price)}
                </td>
                <td className="px-4 py-3 text-center text-text-primary">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-text-primary font-medium whitespace-nowrap">
                  {formatPriceShort(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border-subtle">
              <td colSpan={4} className="px-4 py-3 text-right text-text-muted font-medium">
                Итого:
              </td>
              <td className="px-4 py-3 text-right text-accent-yellow font-display text-lg">
                {formatPriceShort(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
