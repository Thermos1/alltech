import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import ProductForm from '../ProductForm';
import VariantManager from '../VariantManager';

export const metadata = {
  title: 'Редактирование товара — Админ АЛТЕХ',
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: product }, { data: brands }, { data: categories }, { data: variants }] =
    await Promise.all([
      admin
        .from('products')
        .select('id, name, slug, description, section, brand_id, category_id, viscosity, base_type, api_spec, acea_spec, oem_approvals, oem_number, is_active, is_featured, image_url')
        .eq('id', id)
        .single(),
      admin.from('brands').select('id, name').order('name'),
      admin.from('categories').select('id, name, section').order('sort_order'),
      admin
        .from('product_variants')
        .select('id, volume, unit, price, price_per_liter, sku, stock_qty, is_active')
        .eq('product_id', id)
        .order('price'),
    ]);

  if (!product) return notFound();

  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    section: product.section || 'lubricants',
    brand_id: product.brand_id || '',
    category_id: product.category_id || '',
    viscosity: product.viscosity || '',
    base_type: product.base_type || '',
    api_spec: product.api_spec || '',
    acea_spec: product.acea_spec || '',
    oem_approvals: product.oem_approvals || '',
    oem_number: product.oem_number || '',
    is_active: product.is_active ?? true,
    is_featured: product.is_featured ?? false,
    image_url: product.image_url,
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl text-text-primary">
        Редактирование: {product.name}
      </h1>
      <ProductForm
        product={productData}
        brands={brands || []}
        categories={categories || []}
      />
      <VariantManager
        productId={product.id}
        variants={variants || []}
      />
    </div>
  );
}
