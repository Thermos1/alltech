import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceShort } from '@/lib/utils';
import { getBonusTier, getNextTier, BONUS_TIERS } from '@/lib/constants';
import { notFound } from 'next/navigation';
import AssignManagerForm from './AssignManagerForm';

export const metadata = {
  title: 'Карточка клиента — Админ АЛТЕХ',
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = currentProfile?.role === 'admin';

  // Fetch client profile
  const { data: client } = await admin
    .from('profiles')
    .select('id, full_name, phone, email, bonus_balance, total_spent, referral_code, manager_id, company_name, created_at')
    .eq('id', id)
    .single();

  if (!client) return notFound();

  // If manager, verify this is their client
  if (!isAdmin && client.manager_id !== user.id) {
    return notFound();
  }

  // Fetch client's orders
  const { data: orders } = await admin
    .from('orders')
    .select('id, order_number, status, payment_status, total, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  // Fetch order items from paid orders for replacement forecast
  const paidOrderIds = (orders || [])
    .filter((o) => o.payment_status === 'succeeded')
    .map((o) => o.id);

  const { data: orderItems } = paidOrderIds.length > 0
    ? await admin
        .from('order_items')
        .select('product_name, variant_label, order_id, created_at')
        .in('order_id', paidOrderIds)
    : { data: [] };

  // Calculate replacement forecast for oil products
  const OIL_KEYWORDS = ['10W-40', '15W-40', '10W-30', '5W-30', '5W-40', 'моторн'];
  const REPLACEMENT_MONTHS = 4; // avg for commercial vehicles

  const oilPurchases = (orderItems || [])
    .filter((item) => OIL_KEYWORDS.some((kw) => item.product_name.toLowerCase().includes(kw.toLowerCase())))
    .sort((a, b) => {
      // Find order date from orders list
      const orderA = (orders || []).find((o) => o.id === a.order_id);
      const orderB = (orders || []).find((o) => o.id === b.order_id);
      return new Date(orderB?.created_at || 0).getTime() - new Date(orderA?.created_at || 0).getTime();
    });

  const lastOilPurchase = oilPurchases[0];
  const lastOilOrder = lastOilPurchase ? (orders || []).find((o) => o.id === lastOilPurchase.order_id) : null;

  let replacementForecast: { productName: string; purchaseDate: Date; forecastDate: Date; status: 'overdue' | 'soon' | 'ok' } | null = null;
  if (lastOilOrder) {
    const purchaseDate = new Date(lastOilOrder.created_at);
    const forecastDate = new Date(purchaseDate);
    forecastDate.setMonth(forecastDate.getMonth() + REPLACEMENT_MONTHS);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const status = forecastDate < now ? 'overdue' : forecastDate < thirtyDaysFromNow ? 'soon' : 'ok';
    replacementForecast = {
      productName: lastOilPurchase.product_name,
      purchaseDate,
      forecastDate,
      status,
    };
  }

  // Fetch managers list (for admin assign dropdown)
  let managers: { id: string; full_name: string | null }[] = [];
  if (isAdmin) {
    const { data: mgrs } = await admin
      .from('profiles')
      .select('id, full_name')
      .in('role', ['manager', 'admin']);
    managers = mgrs || [];
  }

  const totalSpent = Number(client.total_spent || 0);
  const tier = getBonusTier(totalSpent);
  const nextTier = getNextTier(totalSpent);
  const remaining = nextTier ? nextTier.min - totalSpent : 0;
  const progressPercent = nextTier
    ? Math.min(100, Math.round(((totalSpent - tier.min) / (nextTier.min - tier.min)) * 100))
    : 100;

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Ожидает оплаты', color: 'bg-accent-yellow-dim text-accent-yellow' },
    paid: { label: 'Оплачен', color: 'bg-accent-cyan-dim text-accent-cyan' },
    processing: { label: 'В обработке', color: 'bg-accent-cyan-dim text-accent-cyan' },
    shipped: { label: 'Отправлен', color: 'bg-blue-500/15 text-blue-400' },
    delivered: { label: 'Доставлен', color: 'bg-green-500/15 text-green-400' },
    cancelled: { label: 'Отменён', color: 'bg-accent-magenta-dim text-accent-magenta' },
    refunded: { label: 'Возврат', color: 'bg-accent-magenta-dim text-accent-magenta' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-text-muted text-sm">
        <Link href="/admin/clients" className="hover:text-accent-cyan transition-colors">
          Клиенты
        </Link>
        <span>/</span>
        <span className="text-text-primary">{client.full_name || 'Без имени'}</span>
      </div>

      {/* Client header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text-primary">
            {client.full_name || 'Без имени'}
          </h1>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-text-secondary">
            {client.phone && <span>{client.phone}</span>}
            {client.email && <span>{client.email}</span>}
            {client.company_name && <span>{client.company_name}</span>}
          </div>
          <p className="text-text-muted text-xs mt-1">
            Зарегистрирован: {new Date(client.created_at).toLocaleDateString('ru-RU')}
          </p>
        </div>
        {isAdmin && (
          <AssignManagerForm
            clientId={client.id}
            currentManagerId={client.manager_id}
            managers={managers}
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl bg-bg-card border border-border-subtle p-4">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Покупки</p>
          <p className="font-display text-xl text-text-primary">{formatPriceShort(totalSpent)}</p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border-subtle p-4">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Заказы</p>
          <p className="font-display text-xl text-text-primary">{(orders || []).length}</p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border-subtle p-4">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Бонусы</p>
          <p className="font-display text-xl text-accent-yellow">{client.bonus_balance || 0}</p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border-subtle p-4">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Уровень</p>
          <p className={`font-display text-xl ${tier.color}`}>{tier.name} ({tier.percent}%)</p>
        </div>
      </div>

      {/* Tier progress */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-4">
        <div className="h-2 rounded-full bg-bg-secondary overflow-hidden mb-2">
          <div className="h-full rounded-full bg-accent-yellow transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex justify-between text-xs text-text-muted">
          <span>{tier.name} ({tier.percent}%)</span>
          {nextTier ? (
            <span>До {nextTier.name} — {formatPriceShort(remaining)}</span>
          ) : (
            <span>Максимальный уровень</span>
          )}
        </div>
        <div className="mt-3 flex gap-1">
          {BONUS_TIERS.map((t) => (
            <div
              key={t.name}
              className={`flex-1 rounded-md py-1 text-center text-[10px] font-medium ${
                t.name === tier.name
                  ? 'bg-accent-yellow/20 border border-accent-yellow/40 text-accent-yellow'
                  : 'bg-bg-secondary text-text-muted'
              }`}
            >
              {t.name} {t.percent}%
            </div>
          ))}
        </div>
      </div>

      {/* Replacement forecast */}
      {replacementForecast && (
        <div className={`rounded-xl border p-4 ${
          replacementForecast.status === 'overdue'
            ? 'bg-accent-magenta/10 border-accent-magenta/30'
            : replacementForecast.status === 'soon'
            ? 'bg-accent-yellow/10 border-accent-yellow/30'
            : 'bg-bg-card border-border-subtle'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              replacementForecast.status === 'overdue'
                ? 'bg-accent-magenta/20 text-accent-magenta'
                : replacementForecast.status === 'soon'
                ? 'bg-accent-yellow/20 text-accent-yellow'
                : 'bg-accent-cyan/20 text-accent-cyan'
            }`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className={`text-sm font-medium ${
                  replacementForecast.status === 'overdue'
                    ? 'text-accent-magenta'
                    : replacementForecast.status === 'soon'
                    ? 'text-accent-yellow'
                    : 'text-text-primary'
                }`}>
                  {replacementForecast.status === 'overdue'
                    ? 'Пора менять масло!'
                    : replacementForecast.status === 'soon'
                    ? 'Скоро замена масла'
                    : 'Прогноз замены масла'}
                </p>
              </div>
              <p className="text-text-secondary text-xs">
                {replacementForecast.productName}
              </p>
              <div className="flex gap-4 mt-2 text-xs text-text-muted">
                <span>Покупка: {replacementForecast.purchaseDate.toLocaleDateString('ru-RU')}</span>
                <span>Замена ~{replacementForecast.forecastDate.toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
            {client.phone && (
              <a
                href={`https://wa.me/${client.phone.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-500 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}
          </div>
        </div>
      )}

      {/* Orders */}
      <div>
        <h2 className="text-text-primary font-medium text-lg mb-3">История заказов</h2>
        {!orders || orders.length === 0 ? (
          <div className="rounded-xl bg-bg-card border border-border-subtle p-6 text-center">
            <p className="text-text-muted text-sm">Заказов нет</p>
          </div>
        ) : (
          <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Номер</th>
                    <th className="text-left px-4 py-3 font-medium">Дата</th>
                    <th className="text-left px-4 py-3 font-medium">Статус</th>
                    <th className="text-right px-4 py-3 font-medium">Сумма</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {orders.map((order) => {
                    const status = statusLabels[order.status] || {
                      label: order.status,
                      color: 'bg-bg-secondary text-text-muted',
                    };
                    return (
                      <tr key={order.id} className="hover:bg-bg-card-hover transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-text-primary hover:text-accent-yellow transition-colors font-medium"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-text-primary font-medium whitespace-nowrap">
                          {formatPriceShort(order.total)}
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
    </div>
  );
}
