'use client';

import { useState, useMemo } from 'react';
import ProductGrid from './ProductGrid';
import BrandFilter from './BrandFilter';

interface Product {
  id: string;
  slug: string;
  name: string;
  viscosity?: string | null;
  base_type?: string | null;
  api_spec?: string | null;
  acea_spec?: string | null;
  image_url?: string | null;
  min_price_per_liter?: number | null;
  brands?: { name: string; slug: string } | null;
  product_variants?: { id: string; price: number; price_per_liter?: number | null; volume: string; unit: string }[];
}

interface FilterableProductGridProps {
  products: Product[];
}

export default function FilterableProductGrid({ products }: FilterableProductGridProps) {
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  const brands = useMemo(() => {
    const brandNames = products
      .map((p) => p.brands?.name)
      .filter((name): name is string => !!name);
    return [...new Set(brandNames)].sort();
  }, [products]);

  const filtered = useMemo(() => {
    if (!activeBrand) return products;
    return products.filter((p) => p.brands?.name === activeBrand);
  }, [products, activeBrand]);

  return (
    <div>
      <div className="mb-4">
        <BrandFilter
          brands={brands}
          activeBrand={activeBrand}
          onSelect={setActiveBrand}
        />
      </div>
      <ProductGrid products={filtered} />
    </div>
  );
}
