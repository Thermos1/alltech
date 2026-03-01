import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceShort } from '@/lib/utils';
import ManagerActions from './ManagerActions';

export const metadata = {
  title: 'Менеджеры — Админ АЛТЕХ',
};

export default async function ManagersPage() {
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

  // Fetch all managers
  const { data: managers } = await admin
    .from('profiles')
    .select('id, full_name, phone, manager_commission, manager_commission_rate, created_at')
    .eq('role', 'manager')
    .order('created_at', { ascending: false });

  // Fetch all customers (for "promote" dropdown)
  const { data: customers } = await admin
    .from('profiles')
    .select('id, full_name, phone')
    .eq('role', 'customer')
    .order('full_name', { ascending: true });

  // For each manager: count assigned clients and their total sales
  const managerIds = (managers || []).map((m) => m.id);

  // Clients per manager
  const { data: clientCounts } = managerIds.length > 0
    ? await admin
        .from('profiles')
        .select('manager_id, id')
        .in('manager_id', managerIds)
        .eq('role', 'customer')
    : { data: [] };

  const clientCountMap: Record<string, number> = {};
  (clientCounts || []).forEach((c) => {
    if (c.manager_id) {
      clientCountMap[c.manager_id] = (clientCountMap[c.manager_id] || 0) + 1;
    }
  });

  // Get client IDs per manager for sales lookup
  const clientsByManager: Record<string, string[]> = {};
  (clientCounts || []).forEach((c) => {
    if (c.manager_id) {
      if (!clientsByManager[c.manager_id]) clientsByManager[c.manager_id] = [];
      clientsByManager[c.manager_id].push(c.id);
    }
  });

  // Total sales per manager (sum of their clients' orders)
  const allClientIds = (clientCounts || []).map((c) => c.id);
  const { data: orderSums } = allClientIds.length > 0
    ? await admin
        .from('orders')
        .select('user_id, total')
        .in('user_id', allClientIds)
        .in('status', ['paid', 'processing', 'shipped', 'delivered'])
    : { data: [] };

  const salesByManager: Record<string, number> = {};
  (orderSums || []).forEach((o) => {
    for (const [managerId, clientIds] of Object.entries(clientsByManager)) {
      if (clientIds.includes(o.user_id)) {
        salesByManager[managerId] = (salesByManager[managerId] || 0) + Number(o.total);
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-text-primary">Менеджеры</h1>
        <span className="text-text-muted text-sm">
          {(managers || []).length} чел.
        </span>
      </div>

      {/* Current managers */}
      {managers && managers.length > 0 ? (
        <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Менеджер</th>
                  <th className="text-center px-4 py-3 font-medium">Клиенты</th>
                  <th className="text-right px-4 py-3 font-medium">Продажи</th>
                  <th className="text-center px-4 py-3 font-medium">Комиссия %</th>
                  <th className="text-right px-4 py-3 font-medium">Заработано</th>
                  <th className="text-center px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {managers.map((manager) => {
                  const clients = clientCountMap[manager.id] || 0;
                  const sales = salesByManager[manager.id] || 0;
                  const earned = Number(manager.manager_commission || 0);
                  const rate = Number(manager.manager_commission_rate || 3);

                  return (
                    <tr key={manager.id} className="hover:bg-bg-card-hover transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-text-primary font-medium">
                          {manager.full_name || 'Без имени'}
                        </p>
                        <p className="text-text-muted text-xs">
                          {manager.phone || manager.id.slice(0, 8)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center text-text-primary">
                        {clients}
                      </td>
                      <td className="px-4 py-3 text-right text-text-primary font-medium whitespace-nowrap">
                        {formatPriceShort(sales)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ManagerActions
                          type="commission"
                          managerId={manager.id}
                          currentRate={rate}
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium whitespace-nowrap text-accent-yellow">
                        {formatPriceShort(earned)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ManagerActions
                          type="demote"
                          managerId={manager.id}
                          managerName={manager.full_name || 'Менеджер'}
                          otherManagers={(managers || [])
                            .filter((m) => m.id !== manager.id)
                            .map((m) => ({ id: m.id, full_name: m.full_name }))}
                          clientCount={clients}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center">
          <p className="text-text-muted text-sm">Менеджеров пока нет</p>
          <p className="text-text-muted text-xs mt-1">Назначьте сотрудника из списка клиентов ниже</p>
        </div>
      )}

      {/* Promote customer to manager */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
        <h2 className="text-text-primary font-medium mb-3">Назначить менеджера</h2>
        <p className="text-text-muted text-xs mb-4">
          Выберите зарегистрированного клиента и назначьте его менеджером.
          Он получит доступ в админку и сможет видеть привязанных к нему клиентов.
        </p>
        <ManagerActions
          type="promote"
          customers={(customers || []).map((c) => ({
            id: c.id,
            label: `${c.full_name || 'Без имени'} — ${c.phone || 'нет телефона'}`,
          }))}
        />
      </div>
    </div>
  );
}
