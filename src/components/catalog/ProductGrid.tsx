import ProductCard from './ProductCard';

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

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          className="w-16 h-16 text-text-muted mb-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <p className="text-text-secondary text-lg font-medium">
          Товары не найдены
        </p>
        <p className="text-text-muted text-sm mt-1">
          Попробуйте изменить параметры поиска
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
