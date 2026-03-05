import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OIL_BASE_TYPES } from '@/lib/constants';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('name, description, brands(name)')
    .eq('slug', slug)
    .single();

  if (!product) return {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const brandData = product.brands as any;
  const brandName = brandData?.name ?? '';

  return {
    title: `${product.name} ${brandName}`.trim(),
    description:
      product.description ??
      `Купить ${product.name} от ${brandName} в Якутске. АЛТЕХ — официальный дистрибьютор.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select(
      '*, brands(name, slug), product_variants(id, volume, unit, price, price_per_liter, sku, is_active)'
    )
    .eq('slug', slug)
    .single();

  if (!product) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const brandObj = product.brands as any;
  const brandName = brandObj?.name ?? null;

  const baseTypeLabel = product.base_type
    ? OIL_BASE_TYPES[product.base_type as keyof typeof OIL_BASE_TYPES]
    : null;

  const variants = (product.product_variants ?? [])
    .filter((v: { is_active?: boolean }) => v.is_active !== false)
    .slice()
    .sort((a: { price: number }, b: { price: number }) => a.price - b.price);

  const initials = product.name
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-text-muted">
          <a href="/catalog/lubricants" className="hover:text-text-secondary transition-colors">
            Каталог
          </a>
          <span className="mx-2">/</span>
          <span className="text-text-secondary">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product image */}
          <div className="aspect-square rounded-xl flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={600}
                height={600}
                className="h-full w-full object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <span className="text-6xl font-display text-text-muted select-none">
                {initials}
              </span>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-4">
            {/* Brand */}
            {brandName && (
              <span className="text-accent-cyan text-sm font-medium tracking-wide uppercase">
                {brandName}
              </span>
            )}

            {/* Name */}
            <h1 className="font-display text-2xl md:text-3xl text-text-primary leading-tight">
              {product.name}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {baseTypeLabel && (
                <span className="rounded-md bg-accent-yellow-dim text-accent-yellow-text text-xs font-medium px-3 py-1">
                  {baseTypeLabel}
                </span>
              )}
              {product.viscosity && (
                <span className="rounded-md bg-accent-cyan-dim text-accent-cyan text-xs font-medium px-3 py-1">
                  {product.viscosity}
                </span>
              )}
            </div>

            {/* Specs */}
            <div className="rounded-lg bg-bg-secondary border border-border-subtle p-4 space-y-2">
              <h3 className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-3">
                Характеристики
              </h3>
              {product.api_spec && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">API</span>
                  <span className="text-text-primary">{product.api_spec}</span>
                </div>
              )}
              {product.acea_spec && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">ACEA</span>
                  <span className="text-text-primary">{product.acea_spec}</span>
                </div>
              )}
              {product.approvals && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Допуски</span>
                  <span className="text-text-primary text-right max-w-[60%]">
                    {product.approvals}
                  </span>
                </div>
              )}
              {product.base_type && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Основа</span>
                  <span className="text-text-primary">{baseTypeLabel}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-text-secondary text-sm leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Volume selector + price + cart button (client) */}
            <ProductDetailClient
              productId={product.id}
              productName={product.name}
              imageUrl={product.image_url ?? undefined}
              variants={variants.map(
                (v: {
                  id: string;
                  volume: string;
                  unit: string;
                  price: number;
                  price_per_liter?: number | null;
                }) => ({
                  id: v.id,
                  volume: v.volume,
                  unit: v.unit,
                  price: v.price,
                  price_per_liter: v.price_per_liter,
                })
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
