import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceShort } from '@/lib/utils';
import BarChart from './BarChart';

export const metadata = {
  title: 'Аналитика — Админ АЛТЕХ',
};

export default async function AnalyticsPage() {
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

  const orders = paidOrders || [];

  // Revenue
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;
  const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Monthly revenue (last 6 months)
  const now = new Date();
  const monthlyRevenue: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const monthOrders = orders.filter((o) => {
      const oDate = new Date(o.created_at);
      return oDate >= d && oDate <= monthEnd;
    });
    const revenue = monthOrders.reduce((sum, o) => sum + Number(o.total), 0);
    monthlyRevenue.push({
      label: d.toLocaleDateString('ru-RU', { month: 'short' }),
      value: revenue,
    });
  }

  // Orders by status
  const { data: allOrders } = await admin
    .from('orders')
    .select('status');

  const statusCounts: Record<string, number> = {};
  (allOrders || []).forEach((o) => {
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
        .select('product_name, quantity, unit_price')
        .in('order_id', orderIds)
    : { data: [] };

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

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl text-text-primary">Аналитика</h1>

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
      <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
        <h2 className="text-text-primary font-medium mb-4">Выручка по месяцам</h2>
        <BarChart
          data={monthlyRevenue}
          valueFormat={(v) => formatPriceShort(v)}
        />
      </div>

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
              valueFormat={(v) => formatPriceShort(v)}
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
              valueFormat={(v) => formatPriceShort(v)}
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
              valueFormat={(v) => formatPriceShort(v)}
            />
          ) : (
            <p className="text-text-muted text-sm">Нет данных</p>
          )}
        </div>
      </div>
    </div>
  );
}
