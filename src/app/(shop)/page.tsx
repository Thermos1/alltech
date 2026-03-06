import { Suspense } from 'react';
import BrandCarousel from '@/components/home/BrandCarousel';
import PopularProducts from '@/components/home/PopularProducts';
import CatalogCategories from '@/components/home/CatalogCategories';
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
      <Suspense fallback={null}>
        <CatalogCategories />
      </Suspense>
      <ValueProps />
    </>
  );
}
