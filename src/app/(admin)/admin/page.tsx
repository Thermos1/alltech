import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
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

  // Fetch stats in parallel
  const [ordersCountResult, paidCountResult, revenueResult, latestOrdersResult] = await Promise.all([
    // Total orders count
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true }),
    // Paid orders count
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('payment_status', 'succeeded'),
    // Total revenue (sum of total where payment_status = 'succeeded')
    supabase
      .from('orders')
      .select('total')
      .eq('payment_status', 'succeeded'),
    // Latest 5 orders
    supabase
      .from('orders')
      .select('id, order_number, status, total, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const totalOrders = ordersCountResult.count ?? 0;
  const paidOrders = paidCountResult.count ?? 0;
  const revenue = (revenueResult.data || []).reduce(
    (sum, order) => sum + Number(order.total),
    0
  );
  const latestOrders = latestOrdersResult.data || [];

  const stats = [
    {
      label: 'Всего заказов',
      value: totalOrders.toString(),
      accent: 'text-text-primary',
    },
    {
      label: 'Оплачено',
      value: paidOrders.toString(),
      accent: 'text-accent-cyan',
    },
    {
      label: 'Выручка',
      value: formatPriceShort(revenue),
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
