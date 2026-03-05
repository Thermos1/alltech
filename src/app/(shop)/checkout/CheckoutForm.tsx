'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { cn, formatPriceShort } from '@/lib/utils';
import { checkoutSchema } from '@/lib/validators';

interface CheckoutFormProps {
  profile: {
    full_name: string;
    phone: string;
    bonus_balance: number;
    company_name: string;
    delivery_address?: string | null;
  } | null;
}

export default function CheckoutForm({ profile }: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = getTotal();

  const [contactName, setContactName] = useState(profile?.full_name || '');
  const [contactPhone, setContactPhone] = useState(profile?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(profile?.delivery_address || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [useBonuses, setUseBonuses] = useState(0);
  const [bonusEnabled, setBonusEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const bonusBalance = profile?.bonus_balance || 0;
  const maxBonus = Math.min(bonusBalance, Math.floor(subtotal * 0.3));
  const total = Math.max(subtotal - promoDiscount - useBonuses, 0);

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;
    setPromoError('');

    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.toUpperCase(), subtotal }),
      });

      const data = await res.json();
      if (res.ok && data.discount) {
        setPromoDiscount(data.discount);
        setPromoApplied(true);
      } else {
        setPromoError(data.error || 'Промокод не найден');
        setPromoDiscount(0);
        setPromoApplied(false);
      }
    } catch {
      setPromoError('Ошибка проверки промокода');
    }
  }

  function handleBonusToggle() {
    if (bonusEnabled) {
      setBonusEnabled(false);
      setUseBonuses(0);
    } else {
      setBonusEnabled(true);
      setUseBonuses(maxBonus);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setError('');
    setFieldErrors({});

    // Client-side Zod validation
    const payload = {
      contactName,
      contactPhone,
      deliveryAddress,
      deliveryNotes,
      promoCode: promoApplied ? promoCode.toUpperCase() : undefined,
      useBonuses,
      items: items.map((item) => ({
        variantId: item.variantId,
        productName: item.productName,
        variantLabel: item.variantLabel,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl,
      })),
    };

    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || '');
        if (key && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.error || 'Ошибка создания заказа');
        setLoading(false);
        return;
      }

      // Create payment
      const payRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        setError(payData.error || 'Ошибка создания платежа');
        setLoading(false);
        return;
      }

      // Clear cart and redirect to payment
      clearCart();
      router.push(payData.paymentUrl);
    } catch {
      setError('Произошла ошибка. Попробуйте снова.');
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary mb-4">Корзина пуста</p>
        <a
          href="/catalog/lubricants"
          className="text-accent-cyan hover:text-accent-yellow-text transition-colors"
        >
          Перейти в каталог
        </a>
      </div>
    );
  }

  const inputClass = 'w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order items summary */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-4">
        <h2 className="text-text-primary font-medium mb-3">
          Ваш заказ ({items.length})
        </h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-sm">
              <span className="text-text-secondary truncate mr-2">
                {item.productName} · {item.variantLabel} × {item.quantity}
              </span>
              <span className="text-text-primary shrink-0">
                {formatPriceShort(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact info */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-4">
        <h2 className="text-text-primary font-medium">Контактные данные</h2>

        <div>
          <label className="block text-text-secondary text-sm mb-1.5">Имя *</label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => { setContactName(e.target.value); setFieldErrors((p) => ({ ...p, contactName: '' })); }}
            placeholder="Иван Петров"
            required
            className={cn(inputClass, fieldErrors.contactName && 'border-accent-magenta')}
          />
          {fieldErrors.contactName && <p className="text-accent-magenta text-xs mt-1">{fieldErrors.contactName}</p>}
        </div>

        <div>
          <label className="block text-text-secondary text-sm mb-1.5">Телефон *</label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => { setContactPhone(e.target.value); setFieldErrors((p) => ({ ...p, contactPhone: '' })); }}
            placeholder="+7 (999) 123-45-67"
            required
            className={cn(inputClass, fieldErrors.contactPhone && 'border-accent-magenta')}
          />
          {fieldErrors.contactPhone && <p className="text-accent-magenta text-xs mt-1">{fieldErrors.contactPhone}</p>}
        </div>
      </div>

      {/* Delivery */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-4">
        <h2 className="text-text-primary font-medium">Доставка</h2>

        <div>
          <label className="block text-text-secondary text-sm mb-1.5">Адрес доставки *</label>
          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => { setDeliveryAddress(e.target.value); setFieldErrors((p) => ({ ...p, deliveryAddress: '' })); }}
            placeholder="г. Якутск, ул. Ленина, д. 1"
            required
            className={cn(inputClass, fieldErrors.deliveryAddress && 'border-accent-magenta')}
          />
          {fieldErrors.deliveryAddress && <p className="text-accent-magenta text-xs mt-1">{fieldErrors.deliveryAddress}</p>}
        </div>

        <div>
          <label className="block text-text-secondary text-sm mb-1.5">Комментарий</label>
          <textarea
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            placeholder="Домофон, этаж, время доставки..."
            rows={2}
            className={cn(inputClass, 'resize-none')}
          />
        </div>
      </div>

      {/* Promo & Bonuses */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-4">
        <h2 className="text-text-primary font-medium">Кэшбэк</h2>

        {/* Promo code */}
        <div>
          <label className="block text-text-secondary text-sm mb-1.5">Промокод</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoApplied(false);
                setPromoDiscount(0);
                setPromoError('');
              }}
              placeholder="Введите промокод"
              disabled={promoApplied}
              className={cn(inputClass, 'flex-1')}
            />
            <button
              type="button"
              onClick={promoApplied ? () => {
                setPromoApplied(false);
                setPromoDiscount(0);
                setPromoCode('');
              } : handleApplyPromo}
              className={cn(
                'shrink-0 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                promoApplied
                  ? 'bg-accent-magenta/20 text-accent-magenta'
                  : 'bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30'
              )}
            >
              {promoApplied ? 'Убрать' : 'Применить'}
            </button>
          </div>
          {promoError && <p className="text-accent-magenta text-xs mt-1">{promoError}</p>}
          {promoApplied && (
            <p className="text-accent-cyan text-xs mt-1">
              Кэшбэк: -{formatPriceShort(promoDiscount)}
            </p>
          )}
        </div>

        {/* Bonuses */}
        {bonusBalance > 0 && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Бонусные баллы</p>
                <p className="text-text-muted text-xs">
                  Доступно: {bonusBalance} (макс. {maxBonus} на этот заказ)
                </p>
              </div>
              <button
                type="button"
                onClick={handleBonusToggle}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  bonusEnabled ? 'bg-accent-yellow' : 'bg-bg-secondary'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                    bonusEnabled ? 'left-6.5' : 'left-0.5'
                  )}
                />
              </button>
            </div>
            {bonusEnabled && (
              <p className="text-accent-yellow-text text-xs mt-1">
                Списание: -{formatPriceShort(useBonuses)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="rounded-xl bg-bg-card border border-border-accent p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Сумма товаров</span>
          <span className="text-text-primary">{formatPriceShort(subtotal)}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Промокод</span>
            <span className="text-accent-cyan">-{formatPriceShort(promoDiscount)}</span>
          </div>
        )}
        {useBonuses > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Бонусы</span>
            <span className="text-accent-yellow-text">-{formatPriceShort(useBonuses)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Доставка</span>
          <span className="text-accent-cyan">Бесплатно</span>
        </div>
        <div className="border-t border-border-subtle pt-2 flex justify-between items-center">
          <span className="text-text-primary font-medium">Итого</span>
          <span className="text-xl font-display text-accent-yellow-text">
            {formatPriceShort(total)}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-accent-magenta/10 border border-accent-magenta/30 p-3">
          <p className="text-accent-magenta text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full rounded-xl py-4 text-base font-semibold transition-all',
          'bg-accent-yellow text-text-on-accent hover:brightness-110',
          'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {loading ? 'Оформляем...' : `Оплатить ${formatPriceShort(total)}`}
      </button>

      <p className="text-text-muted text-xs text-center">
        Нажимая «Оплатить», вы соглашаетесь с условиями продажи
      </p>
    </form>
  );
}
