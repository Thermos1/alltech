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
