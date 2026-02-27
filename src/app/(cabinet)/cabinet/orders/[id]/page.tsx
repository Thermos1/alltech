import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatPriceShort } from '@/lib/utils';

const statusSteps = [
  { key: 'pending', label: 'Создан' },
  { key: 'paid', label: 'Оплачен' },
  { key: 'processing', label: 'В обработке' },
  { key: 'shipped', label: 'Отправлен' },
  { key: 'delivered', label: 'Доставлен' },
];

const statusIndex: Record<string, number> = {
  pending: 0,
  paid: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
  refunded: -1,
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  const currentStep = statusIndex[order.status] ?? 0;
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/cabinet/orders"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-card border border-border-subtle hover:bg-bg-card-hover transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display text-xl text-text-primary">
            {order.order_number}
          </h1>
          <p className="text-text-muted text-xs">
            {new Date(order.created_at).toLocaleString('ru-RU', {
              day: 'numeric', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Status timeline */}
      {isCancelled ? (
        <div className="rounded-xl bg-accent-magenta/10 border border-accent-magenta/30 p-4">
          <p className="text-accent-magenta font-medium text-sm">
            {order.status === 'cancelled' ? 'Заказ отменён' : 'Возврат средств'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-4">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => {
              const isDone = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div className={`flex-1 h-0.5 ${isDone ? 'bg-accent-cyan' : 'bg-border-subtle'}`} />
                    )}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurrent
                          ? 'bg-accent-cyan text-bg-primary'
                          : isDone
                          ? 'bg-accent-cyan/30 text-accent-cyan'
                          : 'bg-bg-secondary text-text-muted'
                      }`}
                    >
                      {isDone ? '✓' : i + 1}
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-accent-cyan' : 'bg-border-subtle'}`} />
                    )}
                  </div>
                  <span className={`text-[10px] mt-1.5 ${isCurrent ? 'text-accent-cyan font-medium' : 'text-text-muted'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
        <div className="p-4 border-b border-border-subtle">
          <h2 className="text-text-primary font-medium text-sm">Товары</h2>
        </div>
        <div className="divide-y divide-border-subtle">
          {(items || []).map((item) => (
            <div key={item.id} className="flex justify-between p-4">
              <div>
                <p className="text-text-primary text-sm">{item.product_name}</p>
                <p className="text-text-muted text-xs">
                  {item.variant_label} × {item.quantity}
                </p>
              </div>
              <p className="text-text-primary text-sm font-medium shrink-0 ml-4">
                {formatPriceShort(item.total_price)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing breakdown */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Подытог</span>
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
          <span className="text-accent-cyan">Бесплатно</span>
        </div>
        <div className="border-t border-border-subtle pt-2 flex justify-between">
          <span className="text-text-primary font-medium">Итого</span>
          <span className="text-lg font-display text-accent-yellow">
            {formatPriceShort(order.total)}
          </span>
        </div>
      </div>

      {/* Delivery info */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-2">
        <h2 className="text-text-primary font-medium text-sm mb-2">Доставка</h2>
        <div className="text-sm">
          <p className="text-text-primary">{order.contact_name}</p>
          <p className="text-text-secondary">{order.contact_phone}</p>
          <p className="text-text-secondary mt-1">{order.delivery_address}</p>
          {order.delivery_notes && (
            <p className="text-text-muted text-xs mt-1">{order.delivery_notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
