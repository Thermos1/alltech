'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';

interface OrderItemForRepeat {
  variantId: string;
  productId: string;
  productName: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}

export default function RepeatOrderButton({
  items,
}: {
  items: OrderItemForRepeat[];
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleRepeat() {
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          variantId: item.variantId,
          productId: item.productId,
          productName: item.productName,
          variantLabel: item.variantLabel,
          price: item.unitPrice,
          imageUrl: item.imageUrl,
        });
      }
    }
    setAdded(true);
    setTimeout(() => {
      router.push('/cart');
    }, 600);
  }

  return (
    <button
      onClick={handleRepeat}
      disabled={added}
      className={`w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
        added
          ? 'bg-green-500 text-white'
          : 'bg-accent-yellow text-bg-primary hover:brightness-110'
      }`}
    >
      {added ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Добавлено в корзину
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
          </svg>
          Повторить заказ
        </span>
      )}
    </button>
  );
}
