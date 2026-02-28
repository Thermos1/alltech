import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceShort } from '@/lib/utils';

export const metadata = {
  title: 'Админ-панель — АЛТЕХ',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ожидает оплаты', color: 'bg-accent-yellow-dim text-accent-yellow' },
  paid: { label: 'Оплачен', color: 'bg-accent-cyan-dim text-accent-cyan' },
  processing: { label: 'В обработке', color: 'bg-accent-cyan-dim text-accent-cyan' },
  shipped: { label: 'Отправлен', color: 'bg-blue-500/15 text-blue-400' },
  delivered: { label: 'Доставлен', color: 'bg-green-500/15 text-green-400' },
  cancelled: { label: 'Отменён', color: 'bg-accent-magenta-dim text-accent-magenta' },
  refunded: { label: 'Возврат', color: 'bg-accent-magenta-dim text-accent-magenta' },
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role, manager_commission')
    .eq('id', user.id)
    .single();

  const isAdmin = currentProfile?.role === 'admin';

  // Manager: get their client IDs for filtering
  let clientIds: string[] | null = null;
  if (!isAdmin) {
    const { data: myClients } = await admin
      .from('profiles')
      .select('id')
      .eq('role', 'customer')
      .eq('manager_id', user.id);
    clientIds = (myClients || []).map((c) => c.id);
  }

  // Build queries — admin sees all, manager sees only their clients' orders
  let ordersQuery = admin.from('orders').select('id, total, payment_status');
  let paidQuery = admin.from('orders').select('total').eq('payment_status', 'succeeded');
  let latestQuery = admin.from('orders')
    .select('id, order_number, status, total, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (clientIds !== null) {
    if (clientIds.length > 0) {
      ordersQuery = ordersQuery.in('user_id', clientIds);
      paidQuery = paidQuery.in('user_id', clientIds);
      latestQuery = latestQuery.in('user_id', clientIds);
    } else {
      ordersQuery = ordersQuery.eq('user_id', 'no-clients');
      paidQuery = paidQuery.eq('user_id', 'no-clients');
      latestQuery = latestQuery.eq('user_id', 'no-clients');
    }
  }

  // Fetch clients needing attention (replacement forecast)
  const OIL_KEYWORDS = ['10W-40', '15W-40', '10W-30', '5W-30', '5W-40'];
  const REPLACEMENT_MONTHS = 4;

  let attentionClients: {
    id: string;
    name: string;
    phone: string | null;
    lastOilProduct: string;
    purchaseDate: Date;
    forecastDate: Date;
    status: 'overdue' | 'soon';
  }[] = [];

  // Get relevant clients for attention block
  const relevantClientIds = clientIds !== null ? clientIds : null;

  if (relevantClientIds === null || relevantClientIds.length > 0) {
    // Fetch clients with their info
    let clientsQuery = admin
      .from('profiles')
      .select('id, full_name, phone')
      .eq('role', 'customer');

    if (relevantClientIds !== null) {
      clientsQuery = clientsQuery.in('id', relevantClientIds);
    }

    const { data: relevantProfiles } = await clientsQuery;
    const profileIds = (relevantProfiles || []).map((p) => p.id);

    if (profileIds.length > 0) {
      // Get paid orders for these clients
      const { data: paidOrders } = await admin
        .from('orders')
        .select('id, user_id, created_at')
        .in('user_id', profileIds)
        .eq('payment_status', 'succeeded')
        .order('created_at', { ascending: false });

      const paidOrderIds = (paidOrders || []).map((o) => o.id);

      if (paidOrderIds.length > 0) {
        const { data: allItems } = await admin
          .from('order_items')
          .select('product_name, order_id')
          .in('order_id', paidOrderIds);

        // For each client, find their last oil purchase
        const now = new Date();
        const thirtyDaysFromNow = new Date(now);
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        for (const profile of (relevantProfiles || [])) {
          const clientOrders = (paidOrders || []).filter((o) => o.user_id === profile.id);
          for (const order of clientOrders) {
            const oilItem = (allItems || []).find(
              (item) => item.order_id === order.id &&
              OIL_KEYWORDS.some((kw) => item.product_name.includes(kw))
            );
            if (oilItem) {
              const purchaseDate = new Date(order.created_at);
              const forecastDate = new Date(purchaseDate);
              forecastDate.setMonth(forecastDate.getMonth() + REPLACEMENT_MONTHS);

              if (forecastDate < thirtyDaysFromNow) {
                attentionClients.push({
                  id: profile.id,
                  name: profile.full_name || 'Без имени',
                  phone: profile.phone,
                  lastOilProduct: oilItem.product_name,
                  purchaseDate,
                  forecastDate,
                  status: forecastDate < now ? 'overdue' : 'soon',
                });
              }
              break; // only latest oil order per client
            }
          }
        }

        // Sort: overdue first, then by forecast date
        attentionClients.sort((a, b) => {
          if (a.status !== b.status) return a.status === 'overdue' ? -1 : 1;
          return a.forecastDate.getTime() - b.forecastDate.getTime();
        });
      }
    }
  }

  // Also for admin: count unassigned clients
  let unassignedCount = 0;
  if (isAdmin) {
    const { count } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer')
      .is('manager_id', null);
    unassignedCount = count || 0;
  }

  const [ordersResult, paidResult, latestOrdersResult] = await Promise.all([
    ordersQuery,
    paidQuery,
    latestQuery,
  ]);

  const totalOrders = (ordersResult.data || []).length;
  const paidOrders = (paidResult.data || []).length;
  const revenue = (paidResult.data || []).reduce(
    (sum, order) => sum + Number(order.total),
    0
  );
  const latestOrders = latestOrdersResult.data || [];

  const stats = [
    {
      label: isAdmin ? 'Всего заказов' : 'Заказы клиентов',
      value: totalOrders.toString(),
      accent: 'text-text-primary',
    },
    {
      label: 'Оплачено',
      value: paidOrders.toString(),
      accent: 'text-accent-cyan',
    },
    {
      label: isAdmin ? 'Выручка' : 'Комиссия',
      value: isAdmin
        ? formatPriceShort(revenue)
        : formatPriceShort(Number(currentProfile?.manager_commission || 0)),
      accent: 'text-accent-yellow',
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl text-text-primary">Дашборд</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-bg-card border border-border-subtle p-5"
          >
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className={`font-display text-2xl ${stat.accent}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Attention block */}
      {(attentionClients.length > 0 || (isAdmin && unassignedCount > 0)) && (
        <div>
          <h2 className="text-text-primary font-medium text-lg mb-4">Требуют внимания</h2>
          <div className="space-y-3">
            {/* Unassigned clients warning (admin only) */}
            {isAdmin && unassignedCount > 0 && (
              <Link
                href="/admin/clients"
                className="block rounded-xl bg-accent-yellow/10 border border-accent-yellow/30 p-4 hover:bg-accent-yellow/15 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-yellow/20 flex items-center justify-center text-accent-yellow shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-accent-yellow text-sm font-medium">
                      {unassignedCount} {unassignedCount === 1 ? 'клиент' : unassignedCount < 5 ? 'клиента' : 'клиентов'} без менеджера
                    </p>
                    <p className="text-text-muted text-xs">Назначьте менеджера для обработки заказов</p>
                  </div>
                </div>
              </Link>
            )}

            {/* Oil replacement forecasts */}
            {attentionClients.map((client) => (
              <Link
                key={client.id}
                href={`/admin/clients/${client.id}`}
                className={`block rounded-xl border p-4 hover:brightness-110 transition-all ${
                  client.status === 'overdue'
                    ? 'bg-accent-magenta/10 border-accent-magenta/30'
                    : 'bg-accent-yellow/10 border-accent-yellow/30'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      client.status === 'overdue'
                        ? 'bg-accent-magenta/20 text-accent-magenta'
                        : 'bg-accent-yellow/20 text-accent-yellow'
                    }`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{client.name}</p>
                      <p className="text-text-muted text-xs truncate">{client.lastOilProduct}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-medium ${
                      client.status === 'overdue' ? 'text-accent-magenta' : 'text-accent-yellow'
                    }`}>
                      {client.status === 'overdue' ? 'Просрочено' : 'Скоро'}
                    </p>
                    <p className="text-text-muted text-[10px]">
                      ~{client.forecastDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Latest orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary font-medium text-lg">Последние заказы</h2>
          <Link
            href="/admin/orders"
            className="text-accent-cyan text-sm hover:text-accent-yellow transition-colors"
          >
            Все заказы
          </Link>
        </div>

        {latestOrders.length === 0 ? (
          <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center">
            <p className="text-text-muted text-sm">Заказов пока нет</p>
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
                  {latestOrders.map((order) => {
                    const status = statusLabels[order.status] || {
                      label: order.status,
                      color: 'bg-bg-secondary text-text-muted',
                    };
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-bg-card-hover transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-text-primary hover:text-accent-yellow transition-colors font-medium"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
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
