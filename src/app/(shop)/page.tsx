import HeroSection from '@/components/home/HeroSection';
import BrandCarousel from '@/components/home/BrandCarousel';
import SectionChooser from '@/components/home/SectionChooser';
import ValueProps from '@/components/home/ValueProps';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandCarousel />
      <SectionChooser />
      <ValueProps />
    </>
  );
}
