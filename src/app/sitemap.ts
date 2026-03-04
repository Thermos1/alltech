import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const BASE = 'https://altehspec.ru';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/catalog/lubricants`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/catalog/filters`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/cart`, changeFrequency: 'weekly', priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${BASE}/offer`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${BASE}/returns`, changeFrequency: 'yearly', priority: 0.1 },
  ];

  // Dynamic: categories
  const { data: categories } = await admin
    .from('categories')
    .select('slug, section_slug, updated_at');

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${BASE}/catalog/${cat.section_slug}/${cat.slug}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic: products
  const { data: products } = await admin
    .from('products')
    .select('slug, updated_at');

  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${BASE}/product/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
