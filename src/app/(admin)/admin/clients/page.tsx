import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceShort } from '@/lib/utils';
import { getBonusTier } from '@/lib/constants';

export const metadata = {
  title: 'Клиенты — Админ АЛТЕХ',
};

export default async function ClientsPage() {
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

  // Fetch clients: admin sees all, manager sees only their assigned
  let clientsQuery = admin
    .from('profiles')
    .select('id, full_name, phone, email, bonus_balance, total_spent, referral_code, manager_id, created_at, role')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });

  if (!isAdmin) {
    clientsQuery = clientsQuery.eq('manager_id', user.id);
  }

  const { data: clients } = await clientsQuery;

  // Fetch managers for admin view
  let managers: { id: string; full_name: string | null }[] = [];
  if (isAdmin) {
    const { data: mgrs } = await admin
      .from('profiles')
      .select('id, full_name')
      .in('role', ['manager', 'admin']);
    managers = mgrs || [];
  }

  // Fetch order counts per client
  const clientIds = (clients || []).map((c) => c.id);
  const { data: orderCounts } = clientIds.length > 0
    ? await admin
        .from('orders')
        .select('user_id, id')
        .in('user_id', clientIds)
    : { data: [] };

  const orderCountMap: Record<string, number> = {};
  (orderCounts || []).forEach((o) => {
    orderCountMap[o.user_id] = (orderCountMap[o.user_id] || 0) + 1;
  });

  // Get last order dates
  const { data: lastOrders } = clientIds.length > 0
    ? await admin
        .from('orders')
        .select('user_id, created_at')
        .in('user_id', clientIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  const lastOrderMap: Record<string, string> = {};
  (lastOrders || []).forEach((o) => {
    if (!lastOrderMap[o.user_id]) {
      lastOrderMap[o.user_id] = o.created_at;
    }
  });

  // Detect "cooling" clients (no orders in 30+ days)
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-text-primary">
          {isAdmin ? 'Все клиенты' : 'Мои клиенты'}
        </h1>
        <span className="text-text-muted text-sm">
          {(clients || []).length} клиентов
        </span>
      </div>

      {!clients || clients.length === 0 ? (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center">
          <p className="text-text-muted text-sm">Клиентов пока нет</p>
        </div>
      ) : (
        <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Клиент</th>
                  <th className="text-left px-4 py-3 font-medium">Телефон</th>
                  <th className="text-center px-4 py-3 font-medium">Заказы</th>
                  <th className="text-right px-4 py-3 font-medium">Покупки</th>
                  <th className="text-center px-4 py-3 font-medium">Уровень</th>
                  <th className="text-center px-4 py-3 font-medium">Статус</th>
                  {isAdmin && <th className="text-left px-4 py-3 font-medium">Менеджер</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {clients.map((client) => {
                  const totalSpent = Number(client.total_spent || 0);
                  const tier = getBonusTier(totalSpent);
                  const orders = orderCountMap[client.id] || 0;
                  const lastOrderDate = lastOrderMap[client.id];
                  const isCooling = lastOrderDate
                    ? now - new Date(lastOrderDate).getTime() > thirtyDays
                    : orders > 0;
                  const managerName = managers.find((m) => m.id === client.manager_id)?.full_name;

                  return (
                    <tr key={client.id} className="hover:bg-bg-card-hover transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="text-text-primary hover:text-accent-yellow transition-colors font-medium"
                        >
                          {client.full_name || 'Без имени'}
                        </Link>
                        {client.email && (
                          <p className="text-text-muted text-xs">{client.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                        {client.phone || '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-text-primary">
                        {orders}
                      </td>
                      <td className="px-4 py-3 text-right text-text-primary font-medium whitespace-nowrap">
                        {formatPriceShort(totalSpent)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium ${tier.color}`}>
                          {tier.name} ({tier.percent}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isCooling && orders > 0 ? (
                          <span className="inline-block rounded-md bg-accent-magenta-dim px-2 py-0.5 text-[11px] font-medium text-accent-magenta">
                            Остывает
                          </span>
                        ) : orders > 0 ? (
                          <span className="inline-block rounded-md bg-green-500/15 px-2 py-0.5 text-[11px] font-medium text-green-400">
                            Активен
                          </span>
                        ) : (
                          <span className="inline-block rounded-md bg-bg-secondary px-2 py-0.5 text-[11px] font-medium text-text-muted">
                            Новый
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-text-secondary text-xs">
                          {managerName || '—'}
                        </td>
                      )}
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
