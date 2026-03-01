import { createAdminClient } from '@/lib/supabase/admin';
import CategoryManager from './CategoryManager';

export const metadata = {
  title: 'Категории — Админ АЛТЕХ',
};

export default async function CategoriesPage() {
  const admin = createAdminClient();

  const { data: categories } = await admin
    .from('categories')
    .select('id, name, slug, section, parent_id, icon_url, is_active, sort_order')
    .order('sort_order')
    .order('name');

  // Count products per category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (cat) => {
      const { count } = await admin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', cat.id);
      return { ...cat, product_count: count || 0 };
    })
  );

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl text-text-primary">
        Категории
      </h1>
      <CategoryManager categories={categoriesWithCounts} />
    </div>
  );
}
