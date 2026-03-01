import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata = {
  title: 'Журнал действий — Админ АЛТЕХ',
};

const actionLabels: Record<string, string> = {
  'order.status_change': 'Смена статуса заказа',
  'order.created': 'Создан заказ',
  'order.paid': 'Оплата заказа',
  'client.assign_manager': 'Назначен менеджер',
  'client.note_added': 'Добавлена заметка',
  'manager.promoted': 'Назначен менеджером',
  'manager.demoted': 'Снят с менеджера',
  'manager.created': 'Создан менеджер',
  'manager.commission_updated': 'Изменена комиссия',
  'shared_cart.created': 'Создана корзина',
  'shared_cart.ordered': 'Корзина оформлена',
  'stock.decremented': 'Списание со склада',
};

export default async function ActivityPage() {
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

  const { data: logs } = await admin
    .from('activity_log')
    .select('id, actor_id, action, entity_type, entity_id, details, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  // Fetch actor names
  const actorIds = [...new Set((logs || []).map((l) => l.actor_id))];
  const actorMap: Record<string, string> = {};
  if (actorIds.length > 0) {
    const { data: actors } = await admin
      .from('profiles')
      .select('id, full_name')
      .in('id', actorIds);
    (actors || []).forEach((a) => {
      actorMap[a.id] = a.full_name || 'Без имени';
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-text-primary">Журнал действий</h1>
        <span className="text-text-muted text-sm">
          Последние {(logs || []).length} записей
        </span>
      </div>

      {!logs || logs.length === 0 ? (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center">
          <p className="text-text-muted text-sm">Действий пока нет</p>
        </div>
      ) : (
        <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Дата</th>
                  <th className="text-left px-4 py-3 font-medium">Кто</th>
                  <th className="text-left px-4 py-3 font-medium">Действие</th>
                  <th className="text-left px-4 py-3 font-medium">Детали</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {logs.map((log) => {
                  const details = log.details as Record<string, unknown> | null;
                  const detailStr = details
                    ? Object.entries(details)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')
                    : '—';

                  return (
                    <tr key={log.id} className="hover:bg-bg-card-hover transition-colors">
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap text-xs">
                        {new Date(log.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-text-primary font-medium">
                        {actorMap[log.actor_id] || log.actor_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {actionLabels[log.action] || log.action}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs max-w-xs truncate">
                        {detailStr}
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
