'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: { slug: string; name: string }[];
  activeSlug?: string;
  section: string;
}

export default function CategoryTabs({
  categories,
  activeSlug,
  section,
}: CategoryTabsProps) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {/* "Все" tab */}
        <Link
          href={`/catalog/${section}`}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
            !activeSlug
              ? 'bg-accent-yellow text-bg-primary'
              : 'bg-bg-card text-text-secondary hover:text-text-primary'
          )}
        >
          Все
        </Link>

        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/catalog/${section}/${category.slug}`}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              activeSlug === category.slug
                ? 'bg-accent-yellow text-bg-primary'
                : 'bg-bg-card text-text-secondary hover:text-text-primary'
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
