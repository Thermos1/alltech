'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inputClass =
  'rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary focus:border-accent-yellow focus:outline-none transition-colors';

export default function CreatePromoForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  function resetForm() {
    setCode('');
    setDiscountType('percent');
    setDiscountValue('');
    setMinOrderAmount('');
    setMaxUses('');
    setValidFrom('');
    setValidUntil('');
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Введите код промокода');
      return;
    }

    const value = Number(discountValue);
    if (!value || value <= 0) {
      setError('Введите значение скидки');
      return;
    }

    if (discountType === 'percent' && value > 100) {
      setError('Процент скидки не может быть больше 100');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          discount_type: discountType,
          discount_value: value,
          min_order_amount: minOrderAmount ? Number(minOrderAmount) : 0,
          max_uses: maxUses ? Number(maxUses) : null,
          valid_from: validFrom || null,
          valid_until: validUntil || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка создания');
        return;
      }

      resetForm();
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg px-4 py-2 text-sm font-medium bg-accent-yellow text-bg-primary hover:brightness-110 transition-all"
      >
        + Создать промокод
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-bg-card border border-border-subtle p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium">Новый промокод</h3>
        <button
          onClick={() => { setOpen(false); resetForm(); }}
          className="text-text-muted hover:text-text-primary text-sm transition-colors"
        >
          Отмена
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Code */}
          <div>
            <label className="block text-text-muted text-xs mb-1">Код промокода</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SALE10"
              className={`w-full font-mono ${inputClass}`}
              maxLength={30}
            />
          </div>

          {/* Discount type */}
          <div>
            <label className="block text-text-muted text-xs mb-1">Тип скидки</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
              className={`w-full ${inputClass}`}
            >
              <option value="percent">Процент (%)</option>
              <option value="fixed">Фиксированная (₽)</option>
            </select>
          </div>

          {/* Discount value */}
          <div>
            <label className="block text-text-muted text-xs mb-1">
              Значение {discountType === 'percent' ? '(%)' : '(₽)'}
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'percent' ? '10' : '500'}
              min="1"
              max={discountType === 'percent' ? '100' : undefined}
              className={`w-full ${inputClass}`}
            />
          </div>

          {/* Min order amount */}
          <div>
            <label className="block text-text-muted text-xs mb-1">Мин. сумма заказа (₽)</label>
            <input
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              placeholder="0"
              min="0"
              className={`w-full ${inputClass}`}
            />
          </div>

          {/* Max uses */}
          <div>
            <label className="block text-text-muted text-xs mb-1">Лимит использований</label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Без лимита"
              min="1"
              className={`w-full ${inputClass}`}
            />
          </div>

          {/* Valid from */}
          <div>
            <label className="block text-text-muted text-xs mb-1">Действует с</label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className={`w-full ${inputClass}`}
            />
          </div>

          {/* Valid until */}
          <div>
            <label className="block text-text-muted text-xs mb-1">Действует до</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className={`w-full ${inputClass}`}
            />
          </div>
        </div>

        {error && (
          <p className="text-accent-magenta text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-4 py-2 text-sm font-medium bg-accent-yellow text-bg-primary hover:brightness-110 transition-all disabled:opacity-50"
        >
          {saving ? 'Создание...' : 'Создать промокод'}
        </button>
      </form>
    </div>
  );
}
