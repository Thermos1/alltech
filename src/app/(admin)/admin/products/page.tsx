import Image from 'next/image';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPriceShort } from '@/lib/utils';
import DeleteProductButton from './DeleteProductButton';

export const metadata = {
  title: 'Товары — Админ АЛТЕХ',
};

export default async function AdminProductsPage() {
  const admin = createAdminClient();

  const { data: products } = await admin
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
        <div className="flex items-center gap-3">
          <p className="text-text-muted text-sm">
            Всего: {products?.length ?? 0}
          </p>
          <Link
            href="/admin/products/new"
            className="rounded-lg px-4 py-2 text-sm font-medium bg-accent-yellow text-bg-primary hover:brightness-110 transition-all"
          >
            + Добавить товар
          </Link>
        </div>
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
                  <th className="text-center px-4 py-3 font-medium">Статус</th>
                  <th className="text-right px-4 py-3 font-medium">Действия</th>
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
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-contain"
                              sizes="40px"
                            />
                          ) : (
                            <span className="text-text-muted text-xs">--</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-text-primary font-medium hover:text-accent-yellow transition-colors"
                        >
                          {product.name}
                        </Link>
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
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            product.is_active ? 'bg-green-500' : 'bg-text-muted'
                          }`}
                          title={product.is_active ? 'Активен' : 'Скрыт'}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-accent-cyan bg-accent-cyan/10 hover:bg-accent-cyan/20 transition-colors"
                          >
                            Ред.
                          </Link>
                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
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
