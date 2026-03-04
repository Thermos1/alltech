import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceShort } from '@/lib/utils';
import BarChart from './BarChart';
import DateFilter from './DateFilter';

export const metadata = {
  title: 'Аналитика — Админ АЛТЕХ',
};

function getPeriodRange(period: string | undefined): { from: Date; to: Date } {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (period) {
    case 'today': {
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { from, to };
    }
    case 'week': {
      const from = new Date(to);
      from.setDate(from.getDate() - 7);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to };
    }
    case 'quarter': {
      const from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    case '6m': {
      const from = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    case 'year': {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from, to };
    }
    case 'all': {
      const from = new Date(2020, 0, 1);
      return { from, to };
    }
    default: {
      // default = month
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to };
    }
  }
}

function getMonthBuckets(from: Date, to: Date): { start: Date; end: Date; label: string }[] {
  const buckets: { start: Date; end: Date; label: string }[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const limit = new Date(to.getFullYear(), to.getMonth() + 1, 0, 23, 59, 59);

  while (cursor <= limit) {
    const start = new Date(cursor);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59);
    buckets.push({
      start,
      end: end > to ? to : end,
      label: start.toLocaleDateString('ru-RU', { month: 'short', year: start.getFullYear() !== to.getFullYear() ? '2-digit' : undefined }),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return buckets;
}

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const { period } = await searchParams;
  let { from, to } = getPeriodRange(period);

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

  // === Fetch data ===

  // All paid orders
  const { data: paidOrders } = await admin
    .from('orders')
    .select('id, total, user_id, created_at, status')
    .eq('payment_status', 'succeeded');

  // For 'all' period, start from first order date (not 2020)
  const allPaid = paidOrders || [];
  if ((!period || period === 'all') && allPaid.length > 0) {
    const firstDate = allPaid
      .map((o) => new Date(o.created_at).getTime())
      .reduce((min, t) => Math.min(min, t), Date.now());
    from.setTime(firstDate);
    from.setHours(0, 0, 0, 0);
  }

  // Filter by period
  const orders = allPaid.filter((o) => {
    const d = new Date(o.created_at);
    return d >= from && d <= to;
  });

  // Revenue
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;
  const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Monthly revenue (dynamic based on period, max 12 months for chart)
  let chartFrom = from;
  const monthsDiff = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (monthsDiff > 12) {
    chartFrom = new Date(to.getFullYear(), to.getMonth() - 11, 1);
  }
  const monthBuckets = getMonthBuckets(chartFrom, to);
  const monthlyRevenue = monthBuckets.map((bucket) => {
    const monthOrders = orders.filter((o) => {
      const oDate = new Date(o.created_at);
      return oDate >= bucket.start && oDate <= bucket.end;
    });
    return {
      label: bucket.label,
      value: monthOrders.reduce((sum, o) => sum + Number(o.total), 0),
    };
  });

  // Orders by status (within period)
  const { data: allOrders } = await admin
    .from('orders')
    .select('status, created_at');

  const filteredAllOrders = (allOrders || []).filter((o) => {
    const d = new Date(o.created_at);
    return d >= from && d <= to;
  });

  const statusCounts: Record<string, number> = {};
  filteredAllOrders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const statusLabels: Record<string, string> = {
    pending: 'Ожидает',
    paid: 'Оплачен',
    processing: 'В обработке',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
    refunded: 'Возврат',
  };

  const statusData = Object.entries(statusCounts)
    .map(([status, count]) => ({
      label: statusLabels[status] || status,
      value: count,
      color: status === 'delivered' ? 'bg-green-500' :
             status === 'paid' ? 'bg-accent-cyan' :
             status === 'cancelled' || status === 'refunded' ? 'bg-accent-magenta' :
             'bg-accent-yellow',
    }))
    .sort((a, b) => b.value - a.value);

  // Top products (by order items)
  const orderIds = orders.map((o) => o.id);
  const { data: orderItems } = orderIds.length > 0
    ? await admin
        .from('order_items')
        .select('product_name, quantity, unit_price, order_id')
        .in('order_id', orderIds)
    : { data: [] };

  // Map order_id → created_at for XYZ analysis
  const orderDateMap: Record<string, string> = {};
  orders.forEach((o) => { orderDateMap[o.id] = o.created_at; });

  const productSales: Record<string, { qty: number; revenue: number }> = {};
  (orderItems || []).forEach((item) => {
    if (!productSales[item.product_name]) {
      productSales[item.product_name] = { qty: 0, revenue: 0 };
    }
    productSales[item.product_name].qty += item.quantity;
    productSales[item.product_name].revenue += Number(item.unit_price) * item.quantity;
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)
    .map(([name, stats]) => ({
      label: name.length > 20 ? name.slice(0, 20) + '...' : name,
      value: stats.revenue,
    }));

  // Top clients
  const clientSales: Record<string, number> = {};
  orders.forEach((o) => {
    clientSales[o.user_id] = (clientSales[o.user_id] || 0) + Number(o.total);
  });

  const topClientIds = Object.entries(clientSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const clientIds = topClientIds.map(([id]) => id);
  const { data: clientProfiles } = clientIds.length > 0
    ? await admin.from('profiles').select('id, full_name').in('id', clientIds)
    : { data: [] };

  const clientNameMap: Record<string, string> = {};
  (clientProfiles || []).forEach((c) => {
    clientNameMap[c.id] = c.full_name || 'Без имени';
  });

  const topClients = topClientIds.map(([id, total]) => ({
    label: (clientNameMap[id] || 'Без имени').slice(0, 20),
    value: total,
  }));

  // Manager comparison
  const { data: managers } = await admin
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'manager');

  const { data: managerClients } = await admin
    .from('profiles')
    .select('id, manager_id')
    .eq('role', 'customer')
    .not('manager_id', 'is', null);

  const clientsByManager: Record<string, string[]> = {};
  (managerClients || []).forEach((c) => {
    if (c.manager_id) {
      if (!clientsByManager[c.manager_id]) clientsByManager[c.manager_id] = [];
      clientsByManager[c.manager_id].push(c.id);
    }
  });

  const managerStats = (managers || []).map((m) => {
    const clients = clientsByManager[m.id] || [];
    const revenue = orders
      .filter((o) => clients.includes(o.user_id))
      .reduce((sum, o) => sum + Number(o.total), 0);
    return {
      label: (m.full_name || 'Без имени').slice(0, 20),
      value: revenue,
    };
  }).sort((a, b) => b.value - a.value);

  // === ABC-XYZ Analysis ===
  const allProductsSorted = Object.entries(productSales)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue);

  const totalProductRevenue = allProductsSorted.reduce((s, p) => s + p.revenue, 0);

  // ABC classification by cumulative revenue share
  let cumRevenue = 0;
  const abcMap: Record<string, 'A' | 'B' | 'C'> = {};
  for (const p of allProductsSorted) {
    cumRevenue += p.revenue;
    const share = totalProductRevenue > 0 ? cumRevenue / totalProductRevenue : 0;
    abcMap[p.name] = share <= 0.8 ? 'A' : share <= 0.95 ? 'B' : 'C';
  }

  // XYZ classification by coefficient of variation of monthly revenue
  const monthlyProductRevenue: Record<string, number[]> = {};
  const xyzBucketCount = monthBuckets.length;
  for (const p of allProductsSorted) {
    monthlyProductRevenue[p.name] = Array(xyzBucketCount).fill(0);
  }
  (orderItems || []).forEach((item) => {
    const orderDate = orderDateMap[item.order_id];
    if (!orderDate) return;
    const d = new Date(orderDate);
    for (let i = 0; i < xyzBucketCount; i++) {
      if (d >= monthBuckets[i].start && d <= monthBuckets[i].end) {
        if (monthlyProductRevenue[item.product_name]) {
          monthlyProductRevenue[item.product_name][i] += Number(item.unit_price) * item.quantity;
        }
        break;
      }
    }
  });

  const xyzMap: Record<string, 'X' | 'Y' | 'Z'> = {};
  for (const p of allProductsSorted) {
    const monthly = monthlyProductRevenue[p.name];
    const nonZeroMonths = monthly.filter((v) => v > 0).length;
    if (nonZeroMonths < 3) {
      xyzMap[p.name] = 'Z';
      continue;
    }
    const mean = monthly.reduce((s, v) => s + v, 0) / xyzBucketCount;
    if (mean === 0) { xyzMap[p.name] = 'Z'; continue; }
    const variance = monthly.reduce((s, v) => s + (v - mean) ** 2, 0) / xyzBucketCount;
    const cv = Math.sqrt(variance) / mean;
    xyzMap[p.name] = cv <= 0.1 ? 'X' : cv <= 0.25 ? 'Y' : 'Z';
  }

  const abcXyzData = allProductsSorted.map((p) => ({
    name: p.name,
    revenue: p.revenue,
    qty: p.qty,
    abc: abcMap[p.name],
    xyz: xyzMap[p.name],
    group: `${abcMap[p.name]}${xyzMap[p.name]}` as string,
    share: totalProductRevenue > 0 ? ((p.revenue / totalProductRevenue) * 100) : 0,
  }));

  const abcColors: Record<string, string> = {
    A: 'text-accent-yellow',
    B: 'text-accent-cyan',
    C: 'text-text-muted',
  };
  const xyzColors: Record<string, string> = {
    X: 'text-green-400',
    Y: 'text-accent-yellow',
    Z: 'text-accent-magenta',
  };

  const groupCounts: Record<string, number> = {};
  abcXyzData.forEach((p) => {
    groupCounts[p.group] = (groupCounts[p.group] || 0) + 1;
  });

  // Period label for display
  const periodLabels: Record<string, string> = {
    today: 'сегодня',
    week: 'за неделю',
    month: 'за месяц',
    quarter: 'за квартал',
    '6m': 'за полгода',
    year: 'за год',
    all: 'за всё время',
  };
  const periodLabel = periodLabels[period || 'month'] || 'за месяц';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="font-display text-2xl text-text-primary">Аналитика</h1>
        <DateFilter />
      </div>

      <p className="text-text-muted text-xs -mt-4">
        Данные {periodLabel}
        {period && period !== 'all' && period !== 'month' && (
          <span className="ml-2 text-text-muted/60">
            {from.toLocaleDateString('ru-RU')} — {to.toLocaleDateString('ru-RU')}
          </span>
        )}
      </p>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Выручка</p>
          <p className="font-display text-2xl text-accent-yellow">{formatPriceShort(totalRevenue)}</p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Заказов</p>
          <p className="font-display text-2xl text-text-primary">{totalOrders}</p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Средний чек</p>
          <p className="font-display text-2xl text-accent-cyan">{formatPriceShort(avgCheck)}</p>
        </div>
      </div>

      {/* Monthly revenue */}
      {monthlyRevenue.length > 1 && (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
          <h2 className="text-text-primary font-medium mb-4">Выручка по месяцам</h2>
          <BarChart
            data={monthlyRevenue}
            formatAs="price"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
          <h2 className="text-text-primary font-medium mb-4">Заказы по статусам</h2>
          {statusData.length > 0 ? (
            <BarChart data={statusData} />
          ) : (
            <p className="text-text-muted text-sm">Нет данных</p>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
          <h2 className="text-text-primary font-medium mb-4">Топ товаров</h2>
          {topProducts.length > 0 ? (
            <BarChart
              data={topProducts}
              formatAs="price"
            />
          ) : (
            <p className="text-text-muted text-sm">Нет данных</p>
          )}
        </div>

        {/* Top clients */}
        <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
          <h2 className="text-text-primary font-medium mb-4">Топ клиентов</h2>
          {topClients.length > 0 ? (
            <BarChart
              data={topClients}
              formatAs="price"
            />
          ) : (
            <p className="text-text-muted text-sm">Нет данных</p>
          )}
        </div>

        {/* Manager comparison */}
        <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
          <h2 className="text-text-primary font-medium mb-4">Менеджеры по выручке</h2>
          {managerStats.length > 0 ? (
            <BarChart
              data={managerStats}
              formatAs="price"
            />
          ) : (
            <p className="text-text-muted text-sm">Нет данных</p>
          )}
        </div>
      </div>

      {/* ABC-XYZ Analysis */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
        <h2 className="text-text-primary font-medium mb-2">ABC-XYZ анализ товаров</h2>
        <p className="text-text-muted text-xs mb-4">
          ABC — доля в выручке (A=80%, B=15%, C=5%). XYZ — стабильность спроса (X — стабильный, Y — сезонный, Z — хаотичный/мало данных)
        </p>

        {abcXyzData.length > 0 ? (
          <>
            {/* Matrix summary */}
            <div className="mb-5 overflow-x-auto">
              <table className="text-xs text-center">
                <thead>
                  <tr>
                    <th className="p-2" />
                    <th className="p-2 text-green-400 font-medium">X (стаб.)</th>
                    <th className="p-2 text-accent-yellow font-medium">Y (сезон.)</th>
                    <th className="p-2 text-accent-magenta font-medium">Z (хаот.)</th>
                  </tr>
                </thead>
                <tbody>
                  {(['A', 'B', 'C'] as const).map((abc) => (
                    <tr key={abc}>
                      <td className={`p-2 font-medium ${abcColors[abc]}`}>{abc}</td>
                      {(['X', 'Y', 'Z'] as const).map((xyz) => {
                        const count = groupCounts[`${abc}${xyz}`] || 0;
                        return (
                          <td key={xyz} className={`p-2 ${count > 0 ? 'text-text-primary' : 'text-text-muted/30'}`}>
                            {count || '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Product table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left text-text-muted p-2 font-medium">Товар</th>
                    <th className="text-right text-text-muted p-2 font-medium">Выручка</th>
                    <th className="text-right text-text-muted p-2 font-medium">Доля</th>
                    <th className="text-right text-text-muted p-2 font-medium">Кол-во</th>
                    <th className="text-center text-text-muted p-2 font-medium">ABC</th>
                    <th className="text-center text-text-muted p-2 font-medium">XYZ</th>
                  </tr>
                </thead>
                <tbody>
                  {abcXyzData.map((p) => (
                    <tr key={p.name} className="border-b border-border-subtle/50">
                      <td className="p-2 text-text-secondary max-w-[200px] truncate">{p.name}</td>
                      <td className="p-2 text-right text-text-primary">{formatPriceShort(p.revenue)}</td>
                      <td className="p-2 text-right text-text-muted">{p.share.toFixed(1)}%</td>
                      <td className="p-2 text-right text-text-muted">{p.qty}</td>
                      <td className={`p-2 text-center font-bold ${abcColors[p.abc]}`}>{p.abc}</td>
                      <td className={`p-2 text-center font-bold ${xyzColors[p.xyz]}`}>{p.xyz}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-text-muted text-sm">Нет данных о продажах</p>
        )}
      </div>
    </div>
  );
}
