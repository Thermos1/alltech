import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import BrandCarousel from '@/components/home/BrandCarousel';
import PopularProducts from '@/components/home/PopularProducts';
import ValueProps from '@/components/home/ValueProps';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandCarousel />
      <Suspense fallback={
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <PopularProducts />
      </Suspense>
      <ValueProps />
    </>
  );
}
