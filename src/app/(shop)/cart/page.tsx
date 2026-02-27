import { Metadata } from 'next';
import CartDrawer from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'Корзина',
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-2xl px-[var(--container-padding)] py-6">
        <CartDrawer />
      </div>
    </div>
  );
}
