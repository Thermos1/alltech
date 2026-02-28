import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceShort } from '@/lib/utils';

export const metadata = {
  title: 'Комиссии — Админ АЛТЕХ',
};

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export default async function CommissionsPage() {
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
  const isManager = currentProfile?.role === 'manager';

  if (!isAdmin && !isManager) {
    return (
      <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center">
        <p className="text-text-muted text-sm">Доступ запрещён</p>
      </div>
    );
  }

  // Fetch commission log entries
  let query = admin
    .from('commission_log')
    .select('id, manager_id, order_id, order_total, rate, amount, created_at')
    .order('created_at', { ascending: false });

  // Manager sees only their own
  if (isManager) {
    query = query.eq('manager_id', user.id);
  }

  const { data: logs } = await query;
  const entries = logs || [];

  // Fetch order numbers for display
  const orderIds = [...new Set(entries.map((e) => e.order_id))];
  let orderNumberMap: Record<string, string> = {};
  if (orderIds.length > 0) {
    const { data: orders } = await admin
      .from('orders')
      .select('id, order_number')
      .in('id', orderIds);
    (orders || []).forEach((o) => {
      orderNumberMap[o.id] = o.order_number;
    });
  }

  // For admin: fetch manager names
  let managerNameMap: Record<string, string> = {};
  if (isAdmin) {
    const managerIds = [...new Set(entries.map((e) => e.manager_id))];
    if (managerIds.length > 0) {
      const { data: managers } = await admin
        .from('profiles')
        .select('id, full_name')
        .in('id', managerIds);
      (managers || []).forEach((m) => {
        managerNameMap[m.id] = m.full_name || 'Без имени';
      });
    }
  }

  // Group by month
  type MonthGroup = {
    key: string;
    label: string;
    total: number;
    entries: typeof entries;
  };

  const monthMap = new Map<string, MonthGroup>();

  for (const entry of entries) {
    const date = new Date(entry.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
    const label = `${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, { key, label, total: 0, entries: [] });
    }
    const group = monthMap.get(key)!;
    group.total += Number(entry.amount);
    group.entries.push(entry);
  }

  const months = Array.from(monthMap.values());
  const grandTotal = entries.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-text-primary">Комиссии</h1>
        <div className="text-right">
          <p className="text-text-muted text-xs uppercase tracking-wider">Всего заработано</p>
          <p className="font-display text-xl text-accent-yellow">{formatPriceShort(grandTotal)}</p>
        </div>
      </div>

      {months.length === 0 ? (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center">
          <p className="text-text-muted text-sm">Начислений пока нет</p>
          <p className="text-text-muted text-xs mt-1">Комиссия начисляется после оплаты заказа клиентом</p>
        </div>
      ) : (
        months.map((month) => (
          <div key={month.key} className="space-y-3">
            {/* Month header */}
            <div className="flex items-center justify-between">
              <h2 className="text-text-primary font-medium">{month.label}</h2>
              <span className="text-accent-yellow font-medium text-sm">
                {formatPriceShort(month.total)}
              </span>
            </div>

            {/* Entries table */}
            <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">Дата</th>
                      {isAdmin && <th className="text-left px-4 py-3 font-medium">Менеджер</th>}
                      <th className="text-left px-4 py-3 font-medium">Заказ</th>
                      <th className="text-right px-4 py-3 font-medium">Сумма заказа</th>
                      <th className="text-center px-4 py-3 font-medium">Ставка</th>
                      <th className="text-right px-4 py-3 font-medium">Комиссия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {month.entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-bg-card-hover transition-colors">
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                          {new Date(entry.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-text-primary">
                            {managerNameMap[entry.manager_id] || '—'}
                          </td>
                        )}
                        <td className="px-4 py-3 text-text-primary font-medium">
                          {orderNumberMap[entry.order_id] || '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-text-secondary whitespace-nowrap">
                          {formatPriceShort(Number(entry.order_total))}
                        </td>
                        <td className="px-4 py-3 text-center text-text-muted">
                          {Number(entry.rate)}%
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-accent-yellow whitespace-nowrap">
                          +{formatPriceShort(Number(entry.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
