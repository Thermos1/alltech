'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  sort_order: number;
  product_count: number;
};

export default function BrandManager({ brands }: { brands: Brand[] }) {
  return (
    <div className="rounded-xl bg-bg-card border border-border-subtle p-6 space-y-4">
      <h2 className="text-text-primary font-medium">Бренды ({brands.length})</h2>

      {brands.length === 0 && (
        <p className="text-text-muted text-sm">Нет брендов. Добавьте первый.</p>
      )}

      <div className="space-y-3">
        {brands.map((b) => (
          <BrandCard key={b.id} brand={b} />
        ))}
      </div>

      <AddBrandForm />
    </div>
  );
}

function BrandCard({ brand }: { brand: Brand }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: brand.name,
    logo_url: brand.logo_url || '',
    is_active: brand.is_active,
    sort_order: String(brand.sort_order),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed =
    form.name !== brand.name ||
    form.logo_url !== (brand.logo_url || '') ||
    form.is_active !== brand.is_active ||
    Number(form.sort_order) !== brand.sort_order;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/brands/${brand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          logo_url: form.logo_url || undefined,
          is_active: form.is_active,
          sort_order: Number(form.sort_order),
        }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка сохранения');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Удалить бренд «${brand.name}»?`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/brands/${brand.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка удаления');
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
    <div className={`rounded-lg border p-3 space-y-2 ${brand.is_active ? 'border-border-subtle' : 'border-border-subtle opacity-60'}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="sm:col-span-2">
          <label className="text-xs text-text-muted">Название</label>
          <input
            className={inputClass + ' w-full'}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Slug</label>
          <input
            className={inputClass + ' w-full opacity-60'}
            value={brand.slug}
            readOnly
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Сортировка</label>
          <input
            type="number"
            className={inputClass + ' w-full'}
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
            min={0}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-accent-magenta">{error}</p>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="w-3.5 h-3.5 accent-accent-yellow"
            />
            <span className="text-xs text-text-muted">Активен</span>
          </label>
          <span className="text-xs text-text-muted">
            Товаров: {brand.product_count}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {changed && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-accent-cyan text-text-on-accent hover:brightness-110'
              } disabled:opacity-50`}
            >
              {saved ? 'Сохранено!' : saving ? '...' : 'Сохранить'}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting || brand.product_count > 0}
            title={brand.product_count > 0 ? 'Нельзя удалить — есть привязанные товары' : 'Удалить бренд'}
            className="rounded-md px-2 py-1 text-xs text-accent-magenta hover:bg-accent-magenta/10 transition-colors disabled:opacity-50"
          >
            {deleting ? '...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddBrandForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    sort_order: '0',
  });

  async function handleAdd() {
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          sort_order: Number(form.sort_order),
          is_active: true,
        }),
      });
      if (res.ok) {
        setForm({ name: '', sort_order: '0' });
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
        className="w-full rounded-lg border border-dashed border-border-subtle py-2 text-sm text-text-muted hover:text-accent-yellow-text hover:border-accent-yellow transition-colors"
      >
        + Добавить бренд
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-accent-yellow/30 bg-accent-yellow/5 p-3 space-y-3">
      <p className="text-sm text-text-primary font-medium">Новый бренд</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-text-muted">Название *</label>
          <input
            className={inputClass + ' w-full'}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="ROLF"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Сортировка</label>
          <input
            type="number"
            className={inputClass + ' w-full'}
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
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
          disabled={loading || !form.name.trim()}
          className="rounded-lg px-4 py-1.5 text-sm font-medium bg-accent-yellow text-text-on-accent hover:brightness-110 transition-all disabled:opacity-50"
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
