'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './ImageUpload';

type Brand = { id: string; name: string };
type Category = { id: string; name: string; section: string };

type ProductData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  section: string;
  brand_id: string;
  category_id: string;
  viscosity: string;
  base_type: string;
  api_spec: string;
  acea_spec: string;
  approvals: string;
  oem_number: string;
  is_active: boolean;
  is_featured: boolean;
  image_url?: string | null;
};

type ProductFormProps = {
  product?: ProductData;
  brands: Brand[];
  categories: Category[];
};

function hasChanges(a: ProductData, b: ProductData): boolean {
  return (
    a.name !== b.name ||
    a.slug !== b.slug ||
    a.description !== b.description ||
    a.section !== b.section ||
    a.brand_id !== b.brand_id ||
    a.category_id !== b.category_id ||
    a.viscosity !== b.viscosity ||
    a.base_type !== b.base_type ||
    a.api_spec !== b.api_spec ||
    a.acea_spec !== b.acea_spec ||
    a.approvals !== b.approvals ||
    a.oem_number !== b.oem_number ||
    a.is_active !== b.is_active ||
    a.is_featured !== b.is_featured
  );
}

const emptyProduct: ProductData = {
  name: '',
  slug: '',
  description: '',
  section: 'lubricants',
  brand_id: '',
  category_id: '',
  viscosity: '',
  base_type: '',
  api_spec: '',
  acea_spec: '',
  approvals: '',
  oem_number: '',
  is_active: true,
  is_featured: false,
};

export default function ProductForm({ product, brands, categories }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product?.id;
  const [form, setForm] = useState<ProductData>(product || emptyProduct);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  // Track the server state to detect real changes after save
  const [serverData, setServerData] = useState<ProductData>(product || emptyProduct);

  const filteredCategories = categories.filter((c) => c.section === form.section);

  function update(field: keyof ProductData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function uploadImage(productId: string): Promise<boolean> {
    if (!pendingImage) return true;
    try {
      const formData = new FormData();
      formData.append('image', pendingImage);
      const res = await fetch(`/api/admin/products/${productId}/image`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Ошибка загрузки изображения');
        return false;
      }
      setPendingImage(null);
      return true;
    } catch {
      setError('Ошибка сети при загрузке изображения');
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isEdit
        ? `/api/admin/products/${product!.id}`
        : '/api/admin/products';
      const method = isEdit ? 'PATCH' : 'POST';

      const body: Record<string, unknown> = {
        name: form.name,
        section: form.section,
        brand_id: form.brand_id,
        category_id: form.category_id,
        is_active: form.is_active,
        is_featured: form.is_featured,
      };

      if (form.slug) body.slug = form.slug;
      if (form.description) body.description = form.description;
      if (form.viscosity) body.viscosity = form.viscosity;
      if (form.base_type) body.base_type = form.base_type;
      if (form.api_spec) body.api_spec = form.api_spec;
      if (form.acea_spec) body.acea_spec = form.acea_spec;
      if (form.approvals) body.approvals = form.approvals;
      if (form.oem_number) body.oem_number = form.oem_number;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Ошибка сохранения');
        return;
      }

      const data = await res.json();
      const productId = isEdit ? product!.id : data.product?.id;

      // Upload pending image
      if (pendingImage && productId) {
        const uploaded = await uploadImage(productId);
        if (!uploaded && !isEdit) {
          // Product created but image failed — redirect anyway, show error on edit page
          router.push(`/admin/products/${productId}`);
          return;
        }
      }

      setSaved(true);
      // Update server state so button doesn't reappear
      setServerData({ ...form });

      if (!isEdit) {
        router.push(`/admin/products/${productId}`);
      } else {
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary focus:border-accent-yellow focus:outline-none';
  const labelClass = 'text-sm text-text-muted mb-1 block';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-6 space-y-4">
        <h2 className="text-text-primary font-medium">Основное</h2>

        <div>
          <label className={labelClass}>Название *</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="ROLF GT SAE 5W-40"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Slug (авто если пусто)</label>
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => update('slug', e.target.value)}
            placeholder="rolf-gt-sae-5w-40"
          />
        </div>

        <div>
          <label className={labelClass}>Описание</label>
          <textarea
            className={inputClass + ' h-24 resize-none'}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Описание товара..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Секция *</label>
            <select
              className={inputClass}
              value={form.section}
              onChange={(e) => {
                update('section', e.target.value);
                update('category_id', '');
              }}
            >
              <option value="lubricants">Масла и смазки</option>
              <option value="filters">Фильтры</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Бренд *</label>
            <select
              className={inputClass}
              value={form.brand_id}
              onChange={(e) => update('brand_id', e.target.value)}
              required
            >
              <option value="">Выберите бренд</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Категория *</label>
          <select
            className={inputClass}
            value={form.category_id}
            onChange={(e) => update('category_id', e.target.value)}
            required
          >
            <option value="">Выберите категорию</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Specs (lubricants only) */}
      {form.section === 'lubricants' && (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-6 space-y-4">
          <h2 className="text-text-primary font-medium">Спецификации</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Вязкость</label>
              <input
                className={inputClass}
                value={form.viscosity}
                onChange={(e) => update('viscosity', e.target.value)}
                placeholder="5W-40"
              />
            </div>

            <div>
              <label className={labelClass}>Базовый тип</label>
              <select
                className={inputClass}
                value={form.base_type}
                onChange={(e) => update('base_type', e.target.value)}
              >
                <option value="">—</option>
                <option value="synthetic">Синтетика</option>
                <option value="semi_synthetic">Полусинтетика</option>
                <option value="mineral">Минеральное</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>API</label>
              <input
                className={inputClass}
                value={form.api_spec}
                onChange={(e) => update('api_spec', e.target.value)}
                placeholder="SN/CF"
              />
            </div>

            <div>
              <label className={labelClass}>ACEA</label>
              <input
                className={inputClass}
                value={form.acea_spec}
                onChange={(e) => update('acea_spec', e.target.value)}
                placeholder="A3/B4"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Допуски</label>
            <input
              className={inputClass}
              value={form.approvals}
              onChange={(e) => update('approvals', e.target.value)}
              placeholder="MB 229.5; VW 502.00/505.00"
            />
          </div>

          <div>
            <label className={labelClass}>OEM-номер</label>
            <input
              className={inputClass}
              value={form.oem_number}
              onChange={(e) => update('oem_number', e.target.value)}
              placeholder="A000 989 69 01"
            />
          </div>
        </div>
      )}

      {/* Image */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-6">
        <ImageUpload
          productId={product?.id}
          currentImageUrl={product?.image_url}
          onImageReady={(file) => setPendingImage(file)}
          onUploaded={() => router.refresh()}
        />
      </div>

      {/* Flags */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-6 space-y-3">
        <h2 className="text-text-primary font-medium">Статус</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => update('is_active', e.target.checked)}
            className="w-4 h-4 rounded border-border-subtle accent-accent-yellow"
          />
          <span className="text-sm text-text-secondary">Активен (виден в каталоге)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => update('is_featured', e.target.checked)}
            className="w-4 h-4 rounded border-border-subtle accent-accent-yellow"
          />
          <span className="text-sm text-text-secondary">Популярный (на главной)</span>
        </label>
      </div>

      {/* Actions */}
      {error && (
        <div className="rounded-lg bg-accent-magenta/10 border border-accent-magenta/30 px-4 py-2 text-sm text-accent-magenta">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || (isEdit && saved && !hasChanges(form, serverData))}
          className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
            saved && !hasChanges(form, serverData)
              ? 'bg-green-500 text-white'
              : 'bg-accent-yellow text-text-on-accent hover:brightness-110'
          } disabled:opacity-50`}
        >
          {saved && !hasChanges(form, serverData)
            ? 'Сохранено!'
            : loading
              ? 'Сохранение...'
              : isEdit
                ? 'Сохранить'
                : 'Создать товар'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="rounded-lg px-4 py-2.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          Назад к списку
        </button>
      </div>
    </form>
  );
}
