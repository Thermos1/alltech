'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SECTIONS: Record<string, string> = {
  lubricants: 'Масла',
  filters: 'Фильтры',
};

type Category = {
  id: string;
  name: string;
  slug: string;
  section: string;
  parent_id: string | null;
  icon_url: string | null;
  is_active: boolean;
  sort_order: number;
  product_count: number;
};

type CategoryManagerProps = {
  categories: Category[];
};

export default function CategoryManager({ categories }: CategoryManagerProps) {
  return (
    <div className="rounded-xl bg-bg-card border border-border-subtle p-6 space-y-4">
      <h2 className="text-text-primary font-medium">Категории ({categories.length})</h2>

      {categories.length === 0 && (
        <p className="text-text-muted text-sm">Нет категорий. Добавьте первую.</p>
      )}

      <div className="space-y-3">
        {categories.map((c) => (
          <CategoryCard key={c.id} category={c} allCategories={categories} />
        ))}
      </div>

      <AddCategoryForm allCategories={categories} />
    </div>
  );
}

function CategoryCard({ category, allCategories }: { category: Category; allCategories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: category.name,
    section: category.section,
    parent_id: category.parent_id || '',
    is_active: category.is_active,
    sort_order: String(category.sort_order),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed =
    form.name !== category.name ||
    form.section !== category.section ||
    (form.parent_id || null) !== category.parent_id ||
    form.is_active !== category.is_active ||
    Number(form.sort_order) !== category.sort_order;

  // Potential parents: same section, not self, not own children
  const parentOptions = allCategories.filter(
    (c) => c.id !== category.id && c.section === form.section
  );

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          section: form.section,
          parent_id: form.parent_id || null,
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
    if (!confirm(`Удалить категорию «${category.name}»?`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
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
    <div className={`rounded-lg border p-3 space-y-2 ${category.is_active ? 'border-border-subtle' : 'border-border-subtle opacity-60'}`}>
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
          <label className="text-xs text-text-muted">Раздел</label>
          <select
            className={inputClass + ' w-full'}
            value={form.section}
            onChange={(e) => setForm((f) => ({ ...f, section: e.target.value, parent_id: '' }))}
          >
            {Object.entries(SECTIONS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
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

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-text-muted">Slug</label>
          <input
            className={inputClass + ' w-full opacity-60'}
            value={category.slug}
            readOnly
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Родитель</label>
          <select
            className={inputClass + ' w-full'}
            value={form.parent_id}
            onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
          >
            <option value="">— Нет —</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
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
            <span className="text-xs text-text-muted">Активна</span>
          </label>
          <span className="text-xs text-text-muted">
            Товаров: {category.product_count}
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
            disabled={deleting || category.product_count > 0}
            title={category.product_count > 0 ? 'Нельзя удалить — есть привязанные товары' : 'Удалить категорию'}
            className="rounded-md px-2 py-1 text-xs text-accent-magenta hover:bg-accent-magenta/10 transition-colors disabled:opacity-50"
          >
            {deleting ? '...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddCategoryForm({ allCategories }: { allCategories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    section: 'lubricants',
    parent_id: '',
    sort_order: '0',
  });

  const parentOptions = allCategories.filter((c) => c.section === form.section);

  async function handleAdd() {
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          section: form.section,
          parent_id: form.parent_id || null,
          sort_order: Number(form.sort_order),
          is_active: true,
        }),
      });
      if (res.ok) {
        setForm({ name: '', section: 'lubricants', parent_id: '', sort_order: '0' });
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
        + Добавить категорию
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-accent-yellow/30 bg-accent-yellow/5 p-3 space-y-3">
      <p className="text-sm text-text-primary font-medium">Новая категория</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="sm:col-span-2">
          <label className="text-xs text-text-muted">Название *</label>
          <input
            className={inputClass + ' w-full'}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Моторные масла"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Раздел *</label>
          <select
            className={inputClass + ' w-full'}
            value={form.section}
            onChange={(e) => setForm((f) => ({ ...f, section: e.target.value, parent_id: '' }))}
          >
            {Object.entries(SECTIONS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
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
      <div>
        <label className="text-xs text-text-muted">Родитель</label>
        <select
          className={inputClass + ' w-full'}
          value={form.parent_id}
          onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
        >
          <option value="">— Нет (корневая) —</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
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
