import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SECTIONS } from '@/lib/constants';

export default async function CatalogCategories() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, section')
    .order('sort_order');

  const sectionEntries = Object.values(SECTIONS);

  return (
    <section className="bg-bg-primary py-4 md:py-6">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        <h2 className="font-display text-lg md:text-xl text-text-primary mb-4">
          Каталог
        </h2>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {/* Section links */}
          {sectionEntries.map((section) => (
            <Link
              key={section.slug}
              href={`/catalog/${section.slug}`}
              className="rounded-xl border border-border-subtle bg-bg-card p-4 transition-all hover:border-accent-yellow hover:shadow-sm"
            >
              <p className="font-display text-sm text-text-primary">
                {section.name}
              </p>
              <p className="text-text-muted text-[11px] mt-1 line-clamp-2">
                {section.description}
              </p>
            </Link>
          ))}

          {/* Category links from DB */}
          {(categories ?? []).map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog/${cat.section}/${cat.slug}`}
              className="rounded-xl border border-border-subtle bg-bg-card p-4 transition-all hover:border-accent-yellow hover:shadow-sm"
            >
              <p className="text-sm text-text-primary font-medium">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
