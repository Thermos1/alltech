import { createClient } from '@/lib/supabase/server';
import { formatPriceShort } from '@/lib/utils';

export const metadata = {
  title: 'Товары — Админ АЛТЕХ',
};

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      image_url,
      is_active,
      section,
      brand:brands(name),
      category:categories(name),
      variants:product_variants(id, price)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-text-primary">Товары</h1>
        <p className="text-text-muted text-sm">
          Всего: {products?.length ?? 0}
        </p>
      </div>

      {!products || products.length === 0 ? (
        <div className="rounded-xl bg-bg-card border border-border-subtle p-10 text-center">
          <p className="text-text-muted text-sm">Товаров нет</p>
        </div>
      ) : (
        <div className="rounded-xl bg-bg-card border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Фото</th>
                  <th className="text-left px-4 py-3 font-medium">Название</th>
                  <th className="text-left px-4 py-3 font-medium">Бренд</th>
                  <th className="text-left px-4 py-3 font-medium">Категория</th>
                  <th className="text-center px-4 py-3 font-medium">Варианты</th>
                  <th className="text-right px-4 py-3 font-medium">Мин. цена</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {products.map((product) => {
                  const variants = product.variants || [];
                  const minPrice = variants.length > 0
                    ? Math.min(...variants.map((v: { price: number }) => Number(v.price)))
                    : 0;
                  const brandName = Array.isArray(product.brand)
                    ? product.brand[0]?.name
                    : (product.brand as { name: string } | null)?.name;
                  const categoryName = Array.isArray(product.category)
                    ? product.category[0]?.name
                    : (product.category as { name: string } | null)?.name;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-bg-card-hover transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-secondary border border-border-subtle overflow-hidden flex items-center justify-center">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-text-muted text-xs">--</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-text-primary font-medium">{product.name}</p>
                        <p className="text-text-muted text-xs">{product.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                        {brandName || '—'}
                      </td>
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                        {categoryName || '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-text-secondary">
                        {variants.length}
                      </td>
                      <td className="px-4 py-3 text-right text-text-primary font-medium whitespace-nowrap">
                        {minPrice > 0 ? formatPriceShort(minPrice) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
