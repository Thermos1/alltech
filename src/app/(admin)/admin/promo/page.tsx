import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import PromoActions from './PromoActions';
import CreatePromoForm from './CreatePromoForm';

export default async function PromoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (currentProfile?.role !== 'admin') {
    return (
      <div className="text-center py-20 text-text-muted">
        Доступ только для администраторов
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: promos } = await admin
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  const allPromos = promos || [];
  const activeCount = allPromos.filter((p) => p.is_active).length;
  const totalUsed = allPromos.reduce((sum, p) => sum + (p.used_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text-primary">Промокоды</h1>
          <p className="text-text-muted text-sm mt-1">
            Всего: {allPromos.length} · Активных: {activeCount} · Использовано: {totalUsed} раз
          </p>
        </div>
      </div>

      {/* Create form */}
      <CreatePromoForm />

      {/* Table */}
      <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Код</th>
                <th className="text-left px-4 py-3 font-medium">Значение</th>
                <th className="text-left px-4 py-3 font-medium">Мин. сумма</th>
                <th className="text-center px-4 py-3 font-medium">Использовано</th>
                <th className="text-left px-4 py-3 font-medium">Срок</th>
                <th className="text-center px-4 py-3 font-medium">Статус</th>
                <th className="text-right px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {allPromos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-muted">
                    Промокоды ещё не созданы
                  </td>
                </tr>
              ) : (
                allPromos.map((promo) => {
                  const isExpired = promo.valid_until && new Date(promo.valid_until) < new Date();
                  const isExhausted = promo.max_uses && promo.used_count >= promo.max_uses;

                  return (
                    <tr key={promo.id} className="hover:bg-bg-card-hover transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-text-primary">{promo.code}</span>
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {promo.discount_type === 'percent'
                          ? `${promo.discount_value}%`
                          : `${promo.discount_value.toLocaleString('ru-RU')} ₽`}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {promo.min_order_amount > 0
                          ? `от ${promo.min_order_amount.toLocaleString('ru-RU')} ₽`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-text-primary font-medium">{promo.used_count}</span>
                        {promo.max_uses && (
                          <span className="text-text-muted"> / {promo.max_uses}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs">
                        {promo.valid_from || promo.valid_until ? (
                          <>
                            {promo.valid_from && (
                              <span>с {new Date(promo.valid_from).toLocaleDateString('ru-RU')}</span>
                            )}
                            {promo.valid_from && promo.valid_until && ' '}
                            {promo.valid_until && (
                              <span className={isExpired ? 'text-accent-magenta' : ''}>
                                до {new Date(promo.valid_until).toLocaleDateString('ru-RU')}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-text-muted">Бессрочный</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isExpired ? (
                          <span className="inline-block rounded-md px-2.5 py-1 text-[11px] font-medium bg-bg-secondary text-text-muted">
                            Истёк
                          </span>
                        ) : isExhausted ? (
                          <span className="inline-block rounded-md px-2.5 py-1 text-[11px] font-medium bg-bg-secondary text-text-muted">
                            Лимит
                          </span>
                        ) : promo.is_active ? (
                          <span className="inline-block rounded-md px-2.5 py-1 text-[11px] font-medium bg-green-500/15 text-green-400">
                            Активен
                          </span>
                        ) : (
                          <span className="inline-block rounded-md px-2.5 py-1 text-[11px] font-medium bg-accent-magenta-dim text-accent-magenta">
                            Неактивен
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <PromoActions
                          promoId={promo.id}
                          promoCode={promo.code}
                          isActive={promo.is_active}
                          usedCount={promo.used_count}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
