import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatPriceShort } from '@/lib/utils';
import StatusChangeForm from './StatusChangeForm';

export const metadata = {
  title: 'Детали заказа — Админ АЛТЕХ',
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

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ожидает', color: 'text-accent-yellow' },
  waiting_for_capture: { label: 'Ожидает подтверждения', color: 'text-accent-yellow' },
  succeeded: { label: 'Оплачен', color: 'text-green-400' },
  cancelled: { label: 'Отменён', color: 'text-accent-magenta' },
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  const status = statusLabels[order.status] || {
    label: order.status,
    color: 'bg-bg-secondary text-text-muted',
  };

  const paymentStatus = paymentStatusLabels[order.payment_status] || {
    label: order.payment_status,
    color: 'text-text-muted',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-card border border-border-subtle hover:bg-bg-card-hover transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl text-text-primary">
              {order.order_number}
            </h1>
            <span className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-text-muted text-xs">
            {new Date(order.created_at).toLocaleString('ru-RU', {
              day: 'numeric', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Order details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
            <div className="p-4 border-b border-border-subtle">
              <h2 className="text-text-primary font-medium text-sm">Товары</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-2.5 font-medium">Товар</th>
                    <th className="text-center px-4 py-2.5 font-medium">Кол-во</th>
                    <th className="text-right px-4 py-2.5 font-medium">Цена</th>
                    <th className="text-right px-4 py-2.5 font-medium">Сумма</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {(items || []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="text-text-primary text-sm">{item.product_name}</p>
                        <p className="text-text-muted text-xs">{item.variant_label}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-text-secondary">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary whitespace-nowrap">
                        {formatPriceShort(item.unit_price)}
                      </td>
                      <td className="px-4 py-3 text-right text-text-primary font-medium whitespace-nowrap">
                        {formatPriceShort(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Сумма товаров</span>
              <span className="text-text-primary">{formatPriceShort(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Скидка</span>
                <span className="text-accent-cyan">-{formatPriceShort(order.discount_amount)}</span>
              </div>
            )}
            {order.bonus_used > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Бонусы</span>
                <span className="text-accent-yellow">-{formatPriceShort(order.bonus_used)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Доставка</span>
              <span className="text-text-primary">
                {order.delivery_cost > 0 ? formatPriceShort(order.delivery_cost) : 'Бесплатно'}
              </span>
            </div>
            <div className="border-t border-border-subtle pt-2 flex justify-between">
              <span className="text-text-primary font-medium">Итого</span>
              <span className="text-lg font-display text-accent-yellow">
                {formatPriceShort(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Right column — Info & Actions */}
        <div className="space-y-6">
          {/* Status change */}
          <div className="rounded-xl bg-bg-card border border-border-subtle p-4">
            <StatusChangeForm orderId={order.id} currentStatus={order.status} />
          </div>

          {/* Payment info */}
          <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-3">
            <h2 className="text-text-primary font-medium text-sm">Оплата</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Статус</span>
                <span className={paymentStatus.color}>{paymentStatus.label}</span>
              </div>
              {order.yookassa_payment_id && (
                <div className="flex justify-between">
                  <span className="text-text-muted">ID платежа</span>
                  <span className="text-text-secondary text-xs font-mono">
                    {order.yookassa_payment_id}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery info */}
          <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-3">
            <h2 className="text-text-primary font-medium text-sm">Доставка</h2>
            <div className="text-sm space-y-1">
              <p className="text-text-primary">{order.contact_name}</p>
              <p className="text-text-secondary">{order.contact_phone}</p>
              <p className="text-text-secondary mt-2">{order.delivery_address}</p>
              {order.delivery_notes && (
                <p className="text-text-muted text-xs mt-2">
                  Примечание: {order.delivery_notes}
                </p>
              )}
            </div>
          </div>

          {/* Customer info */}
          <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-3">
            <h2 className="text-text-primary font-medium text-sm">Клиент</h2>
            <div className="text-sm space-y-1">
              <p className="text-text-secondary text-xs font-mono break-all">
                User ID: {order.user_id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
