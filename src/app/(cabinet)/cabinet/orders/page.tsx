import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPriceShort } from '@/lib/utils';

export const metadata = {
  title: 'Мои заказы — АЛТЕХ',
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

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total, subtotal, discount_amount, bonus_used, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl text-text-primary mb-6">Мои заказы</h1>

      {!orders || orders.length === 0 ? (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center">
          <p className="text-text-muted text-sm mb-4">Вы ещё ничего не заказывали</p>
          <Link
            href="/catalog/lubricants"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-yellow text-bg-primary px-6 py-3 text-sm font-semibold transition-all hover:brightness-110"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = statusLabels[order.status] || { label: order.status, color: 'bg-bg-secondary text-text-muted' };
            return (
              <Link
                key={order.id}
                href={`/cabinet/orders/${order.id}`}
                className="block rounded-xl bg-bg-card border border-border-subtle p-4 hover:bg-bg-card-hover transition-colors glow-border-yellow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-text-primary font-medium">
                      {order.order_number}
                    </p>
                    <p className="text-text-muted text-xs">
                      {new Date(order.created_at).toLocaleString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                  <div className="flex gap-4 text-xs text-text-muted">
                    {order.discount_amount > 0 && (
                      <span>Скидка: -{formatPriceShort(order.discount_amount)}</span>
                    )}
                    {order.bonus_used > 0 && (
                      <span>Бонусы: -{order.bonus_used}</span>
                    )}
                  </div>
                  <p className="text-text-primary font-display text-lg">
                    {formatPriceShort(order.total)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
