import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPriceShort } from '@/lib/utils';

export const metadata = {
  title: 'Личный кабинет — АЛТЕХ',
};

export default async function CabinetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Load profile and recent orders
  const [profileResult, ordersResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, phone, bonus_balance, referral_code, company_name')
      .eq('id', user.id)
      .single(),
    supabase
      .from('orders')
      .select('id, order_number, status, total, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  const profile = profileResult.data;
  const recentOrders = ordersResult.data || [];

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Ожидает оплаты', color: 'text-accent-yellow' },
    paid: { label: 'Оплачен', color: 'text-accent-cyan' },
    processing: { label: 'В обработке', color: 'text-accent-cyan' },
    shipped: { label: 'Отправлен', color: 'text-accent-cyan' },
    delivered: { label: 'Доставлен', color: 'text-green-400' },
    cancelled: { label: 'Отменён', color: 'text-accent-magenta' },
    refunded: { label: 'Возврат', color: 'text-accent-magenta' },
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-2xl text-text-primary">
          Привет, {profile?.full_name || user.email?.split('@')[0] || 'пользователь'}!
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {user.email}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bonus balance */}
        <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
            Бонусный баланс
          </p>
          <p className="font-display text-3xl text-accent-yellow">
            {profile?.bonus_balance || 0}
          </p>
          <p className="text-text-muted text-xs mt-1">
            1 бонус = 1 ₽ скидка
          </p>
        </div>

        {/* Referral code */}
        <div className="rounded-xl bg-bg-card border border-border-subtle p-5">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
            Реферальный код
          </p>
          <p className="font-display text-xl text-accent-cyan break-all">
            {profile?.referral_code || '—'}
          </p>
          <p className="text-text-muted text-xs mt-1">
            Приведи друга — получи 500 бонусов
          </p>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-text-primary font-medium">Последние заказы</h2>
          <Link
            href="/cabinet/orders"
            className="text-accent-cyan text-sm hover:text-accent-yellow transition-colors"
          >
            Все заказы →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="rounded-xl bg-bg-card border border-border-subtle p-6 text-center">
            <p className="text-text-muted text-sm">Заказов пока нет</p>
            <Link
              href="/catalog/lubricants"
              className="text-accent-cyan text-sm hover:text-accent-yellow transition-colors mt-2 inline-block"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => {
              const status = statusLabels[order.status] || { label: order.status, color: 'text-text-muted' };
              return (
                <Link
                  key={order.id}
                  href={`/cabinet/orders/${order.id}`}
                  className="flex items-center justify-between rounded-xl bg-bg-card border border-border-subtle p-4 hover:bg-bg-card-hover transition-colors"
                >
                  <div>
                    <p className="text-text-primary text-sm font-medium">
                      {order.order_number}
                    </p>
                    <p className="text-text-muted text-xs">
                      {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-primary text-sm font-medium">
                      {formatPriceShort(order.total)}
                    </p>
                    <p className={`text-xs ${status.color}`}>
                      {status.label}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
