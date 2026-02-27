'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart-store';
import { cn, formatPriceShort } from '@/lib/utils';

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  const total = getTotal();
  const itemCount = getItemCount();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        {/* Empty cart icon */}
        <svg
          className="w-20 h-20 text-text-muted mb-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
        </svg>
        <h2 className="font-display text-xl text-text-primary mb-2">
          Корзина пуста
        </h2>
        <p className="text-text-secondary text-sm mb-6 max-w-xs">
          Перейдите в каталог, чтобы выбрать товары
        </p>
        <Link
          href="/catalog/lubricants"
          className="inline-flex items-center gap-2 rounded-xl bg-accent-yellow text-bg-primary px-6 py-3 text-sm font-semibold transition-all hover:brightness-110"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cart header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-text-primary">
          Корзина
          <span className="ml-2 text-text-muted text-base font-body">
            ({itemCount})
          </span>
        </h2>
        <button
          onClick={clearCart}
          className="text-text-muted text-xs hover:text-accent-magenta transition-colors"
        >
          Очистить
        </button>
      </div>

      {/* Cart items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex gap-3 rounded-xl bg-bg-card border border-border-subtle p-3"
          >
            {/* Image */}
            <div className="w-16 h-16 shrink-0 rounded-lg bg-bg-secondary flex items-center justify-center overflow-hidden">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  sizes="64px"
                />
              ) : (
                <span className="text-xs font-display text-text-muted">
                  {item.productName
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-text-primary text-sm font-medium leading-tight truncate">
                {item.productName}
              </h3>
              <p className="text-text-muted text-xs mt-0.5">
                {item.variantLabel}
              </p>

              <div className="flex items-center justify-between mt-2">
                {/* Quantity controls */}
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors',
                      'bg-bg-secondary text-text-secondary hover:text-text-primary'
                    )}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-8 text-center text-sm text-text-primary font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors',
                      'bg-bg-secondary text-text-secondary hover:text-text-primary'
                    )}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>

                {/* Line price */}
                <span className="text-text-primary text-sm font-semibold">
                  {formatPriceShort(item.price * item.quantity)}
                </span>
              </div>
            </div>

            {/* Remove button */}
            <button
              onClick={() => removeItem(item.variantId)}
              className="shrink-0 self-start text-text-muted hover:text-accent-magenta transition-colors p-1"
              aria-label="Удалить"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-bg-card border border-border-subtle p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Подытог</span>
          <span className="text-text-primary font-medium">
            {formatPriceShort(total)}
          </span>
        </div>
        <div className="border-t border-border-subtle pt-3 flex justify-between">
          <span className="text-text-primary font-medium">Итого</span>
          <span className="text-lg font-display text-accent-yellow">
            {formatPriceShort(total)}
          </span>
        </div>
      </div>

      {/* Checkout button */}
      <Link
        href="/checkout"
        className="block w-full rounded-xl bg-accent-yellow text-bg-primary py-3.5 text-center text-base font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
      >
        Оформить заказ
      </Link>
    </div>
  );
}
