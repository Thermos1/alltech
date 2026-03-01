import { createAdminClient } from '@/lib/supabase/admin';
import ProductForm from '../ProductForm';

export const metadata = {
  title: 'Новый товар — Админ АЛТЕХ',
};

export default async function NewProductPage() {
  const admin = createAdminClient();

  const [{ data: brands }, { data: categories }] = await Promise.all([
    admin.from('brands').select('id, name').order('name'),
    admin.from('categories').select('id, name, section').order('sort_order'),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl text-text-primary">Новый товар</h1>
      <ProductForm
        brands={brands || []}
        categories={categories || []}
      />
    </div>
  );
}
