'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Variant = {
  id: string;
  volume: string;
  unit: string;
  price: number;
  price_per_liter: number | null;
  sku: string | null;
  stock_qty: number;
  is_active: boolean;
};

type VariantManagerProps = {
  productId: string;
  variants: Variant[];
};

export default function VariantManager({ productId, variants }: VariantManagerProps) {
  return (
    <div className="rounded-xl bg-bg-card border border-border-subtle p-6 space-y-4">
      <h2 className="text-text-primary font-medium">Варианты (фасовка)</h2>

      {variants.length === 0 && (
        <p className="text-text-muted text-sm">Нет вариантов. Добавьте розлив, тару или бочку.</p>
      )}

      <div className="space-y-3">
        {variants.map((v) => (
          <VariantCard key={v.id} productId={productId} variant={v} />
        ))}
      </div>

      <AddVariantForm productId={productId} />
    </div>
  );
}

function VariantCard({ productId, variant }: { productId: string; variant: Variant }) {
  const router = useRouter();
  const [form, setForm] = useState({
    volume: variant.volume,
    unit: variant.unit,
    price: String(variant.price),
    price_per_liter: variant.price_per_liter ? String(variant.price_per_liter) : '',
    sku: variant.sku || '',
    stock_qty: String(variant.stock_qty),
    is_active: variant.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed =
    form.volume !== variant.volume ||
    form.unit !== variant.unit ||
    Number(form.price) !== variant.price ||
    Number(form.stock_qty) !== variant.stock_qty ||
    form.sku !== (variant.sku || '') ||
    form.is_active !== variant.is_active;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants/${variant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volume: form.volume,
          unit: form.unit,
          price: Number(form.price),
          price_per_liter: form.price_per_liter ? Number(form.price_per_liter) : undefined,
          sku: form.sku || undefined,
          stock_qty: Number(form.stock_qty),
          is_active: form.is_active,
        }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError('Ошибка сохранения');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Удалить вариант ${variant.volume} ${variant.unit}?`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants/${variant.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        setError('Ошибка удаления');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setDeleting(false);
    }
  }

  const inputClass =
    'rounded-lg bg-bg-secondary border border-border-subtle px-2 py-1.5 text-sm text-text-primary focus:border-accent-yellow focus:outline-none';

  return (
    <div className={`rounded-lg border p-3 space-y-2 ${variant.is_active ? 'border-border-subtle' : 'border-border-subtle opacity-60'}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-text-muted">Объём</label>
          <input
            className={inputClass + ' w-full'}
            value={form.volume}
            onChange={(e) => setForm((f) => ({ ...f, volume: e.target.value }))}
            placeholder="1"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Единица</label>
          <select
            className={inputClass + ' w-full'}
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          >
            <option value="л">л (литры)</option>
            <option value="кг">кг</option>
            <option value="шт">шт</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted">Цена, ₽</label>
          <input
            type="number"
            className={inputClass + ' w-full'}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            min={0}
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Остаток</label>
          <input
            type="number"
            className={inputClass + ' w-full'}
            value={form.stock_qty}
            onChange={(e) => setForm((f) => ({ ...f, stock_qty: e.target.value }))}
            min={0}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-accent-magenta">{error}</p>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="w-3.5 h-3.5 accent-accent-yellow"
          />
          <span className="text-xs text-text-muted">Активен</span>
        </label>

        <div className="flex items-center gap-2">
          {changed && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-accent-cyan text-bg-primary hover:brightness-110'
              } disabled:opacity-50`}
            >
              {saved ? 'Сохранено!' : saving ? '...' : 'Сохранить'}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md px-2 py-1 text-xs text-accent-magenta hover:bg-accent-magenta/10 transition-colors disabled:opacity-50"
          >
            {deleting ? '...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddVariantForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    volume: '',
    unit: 'л',
    price: '',
    stock_qty: '0',
  });

  async function handleAdd() {
    if (!form.volume || !form.price) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volume: form.volume,
          unit: form.unit,
          price: Number(form.price),
          stock_qty: Number(form.stock_qty),
          is_active: true,
        }),
      });
      if (res.ok) {
        setForm({ volume: '', unit: 'л', price: '', stock_qty: '0' });
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка добавления');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'rounded-lg bg-bg-secondary border border-border-subtle px-2 py-1.5 text-sm text-text-primary focus:border-accent-yellow focus:outline-none';

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-border-subtle py-2 text-sm text-text-muted hover:text-accent-yellow hover:border-accent-yellow transition-colors"
      >
        + Добавить вариант
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-accent-yellow/30 bg-accent-yellow/5 p-3 space-y-3">
      <p className="text-sm text-text-primary font-medium">Новый вариант</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-text-muted">Объём *</label>
          <input
            className={inputClass + ' w-full'}
            value={form.volume}
            onChange={(e) => setForm((f) => ({ ...f, volume: e.target.value }))}
            placeholder="1"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Единица</label>
          <select
            className={inputClass + ' w-full'}
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          >
            <option value="л">л (литры)</option>
            <option value="кг">кг</option>
            <option value="шт">шт</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted">Цена, ₽ *</label>
          <input
            type="number"
            className={inputClass + ' w-full'}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            min={0}
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Остаток</label>
          <input
            type="number"
            className={inputClass + ' w-full'}
            value={form.stock_qty}
            onChange={(e) => setForm((f) => ({ ...f, stock_qty: e.target.value }))}
            min={0}
          />
        </div>
      </div>
      {error && (
        <p className="text-xs text-accent-magenta">{error}</p>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={handleAdd}
          disabled={loading || !form.volume || !form.price}
          className="rounded-lg px-4 py-1.5 text-sm font-medium bg-accent-yellow text-bg-primary hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? '...' : 'Добавить'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
