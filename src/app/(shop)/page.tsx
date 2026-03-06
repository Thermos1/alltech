import { Suspense } from 'react';
import Link from 'next/link';
import BrandCarousel from '@/components/home/BrandCarousel';
import PopularProducts from '@/components/home/PopularProducts';
import ValueProps from '@/components/home/ValueProps';

export default function HomePage() {
  return (
    <>
      <Suspense fallback={
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <PopularProducts />
      </Suspense>
      <BrandCarousel />
      <section className="bg-bg-primary py-4 md:py-6">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] text-center">
          <Link
            href="/catalog/lubricants"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-yellow px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-text-on-accent transition-all hover:shadow-[0_0_20px_rgba(255,214,0,0.4)] hover:scale-105"
          >
            Весь каталог
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>
      <ValueProps />
    </>
  );
}
